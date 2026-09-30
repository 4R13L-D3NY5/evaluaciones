package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.gateway.*;
import com.xpertiflow.evaluaciones.api.dto.sincronizacion.EstudianteSincronizadoDetalleDto;
import com.xpertiflow.evaluaciones.api.dto.sincronizacion.SincronizacionNotasSeaReporteDto;
import com.xpertiflow.evaluaciones.domain.entity.*;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.repository.*;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SincronizacionNotasSeaService {

    private final RolExamenRepository rolExamenRepository;
    private final CalificacionOmrRepository calificacionOmrRepository;
    private final NotaDocenteRepository notaDocenteRepository;
    private final IntentoExamenVirtualRepository intentoVirtualRepository;
    private final SalaExamenVirtualRepository salaVirtualRepository;
    private final AuditoriaEvaluacionRepository auditoriaRepository;
    private final UnitepcGatewayClient unitepcGatewayClient;
    private final ObjectMapper objectMapper;

    /**
     * Genera la previsualización de calificaciones sobre 100 puntos que se transmitirán al SEA.
     * No realiza modificaciones en la base de datos ni invoca el endpoint POST externo.
     */
    @Transactional(readOnly = true)
    public SincronizacionNotasSeaReporteDto obtenerVistaPrevia(String rolExamenId, Authentication auth) {
        RolExamen rol = obtenerRolValidado(rolExamenId);
        validarPermisos(auth);

        List<EstudianteCalculado> estudiantesCalculados = consolidarNotasTeoricas(rol);

        UUID syllabusUuid = parseUuid(rol.getSeaSyllabusCourseId());
        UUID groupUuid = parseUuid(rol.getSeaGroupId());

        List<EstudianteSincronizadoDetalleDto> detalles = estudiantesCalculados.stream()
                .map(e -> EstudianteSincronizadoDetalleDto.builder()
                        .codigoEstudiante(e.codigoEstudiante())
                        .studentOldCode(e.studentOldCode())
                        .nombreCompleto(e.nombreCompleto())
                        .score(e.score())
                        .completado(null) // aún no enviado
                        .observacion(e.observacion())
                        .esReprogramado(e.esReprogramado())
                        .build())
                .sorted(Comparator.comparing(EstudianteSincronizadoDetalleDto::getCodigoEstudiante))
                .toList();

        return SincronizacionNotasSeaReporteDto.builder()
                .rolExamenId(rol.getId())
                .materiaCodigo(rol.getMateriaCodigo())
                .materiaNombre(rol.getMateriaNombre())
                .grupo(rol.getGrupo())
                .modalidad(rol.getModalidad() != null ? rol.getModalidad().name() : "DESCONOCIDA")
                .tipoParcial(rol.getTipoParcial() != null ? rol.getTipoParcial().name() : "PARCIAL")
                .syllabusCourseId(syllabusUuid)
                .groupId(groupUuid)
                .totalEstudiantes(detalles.size())
                .totalExitosos(0)
                .totalFallidos(0)
                .fechaSincronizacion(rol.getFechaSincronizacionSea())
                .sincronizadoPor(rol.getSincronizadoSeaPor())
                .estudiantes(detalles)
                .build();
    }

    /**
     * Ejecuta el envío vía POST hacia el servicio del SEA:
     * POST https://gw-dev.unitepc.solutions/api/v1/university/externals/research/student-evaluations
     * Registra auditoría inmutable y persiste el estado de sincronización en el Rol de Examen.
     */
    @Transactional
    public SincronizacionNotasSeaReporteDto sincronizarNotasConSea(String rolExamenId, Authentication auth) {
        RolExamen rol = obtenerRolValidado(rolExamenId);
        String usuario = validarPermisos(auth);

        // 1. Validar estado del examen: debe tener notas cerradas o listas para volcado
        if (rol.getEstadoFlujo() != EstadoFlujo.CALIFICADO && rol.getEstadoFlujo() != EstadoFlujo.CONFIRMADO) {
            log.warn("Intento de sincronizar notas en estado no definitivo: {} para rol {}", rol.getEstadoFlujo(), rolExamenId);
            // Permitir continuar con advertencia si es Administrador o Responsable, pero exigir al menos estado con notas
            if (rol.getEstadoFlujo() != EstadoFlujo.PENDIENTE_NOTAS && rol.getEstadoFlujo() != EstadoFlujo.DEVUELTO) {
                throw new IllegalStateException("Solo se pueden sincronizar notas de evaluaciones en estado CALIFICADO, CONFIRMADO o PENDIENTE_NOTAS.");
            }
        }

        // 2. Validar UUIDs requeridos por el SEA
        UUID syllabusUuid = parseUuid(rol.getSeaSyllabusCourseId());
        UUID groupUuid = parseUuid(rol.getSeaGroupId());
        if (syllabusUuid == null || groupUuid == null) {
            throw new IllegalStateException("El rol de examen no cuenta con identificadores válidos de SEA (syllabusCourseId o groupId faltante o inválido).");
        }

        // 3. Consolidar la nómina de estudiantes y sus notas sobre 100 (incluyendo 0 para ausentes)
        List<EstudianteCalculado> estudiantesCalculados = consolidarNotasTeoricas(rol);
        if (estudiantesCalculados.isEmpty()) {
            throw new IllegalStateException("No se encontraron estudiantes para sincronizar en este grupo.");
        }

        // 4. Construir payload para el Gateway SEA
        List<StudentOldCodeScoreInputDto> studentsInput = new ArrayList<>();
        Map<Long, EstudianteCalculado> porOldCode = new HashMap<>();

        for (EstudianteCalculado calc : estudiantesCalculados) {
            if (calc.studentOldCode() != null) {
                studentsInput.add(StudentOldCodeScoreInputDto.builder()
                        .studentOldCode(calc.studentOldCode())
                        .score(calc.score())
                        .build());
                porOldCode.put(calc.studentOldCode(), calc);
            } else {
                log.warn("Estudiante {} con código no numérico omitido del envío al SEA", calc.codigoEstudiante());
            }
        }

        ResearchStudentEvaluationRegisterInputDto inputDto = ResearchStudentEvaluationRegisterInputDto.builder()
                .syllabusCourseId(syllabusUuid)
                .groupId(groupUuid)
                .students(studentsInput)
                .build();

        log.info("Iniciando transmisión de notas teóricas al SEA para rolId={}, totalEstudiantes={}", rolExamenId, studentsInput.size());

        // 5. Invocación al Gateway UNITEPC
        List<ResearchStudentEvaluationRegisterResponseDto> respuestaSea;
        try {
            respuestaSea = unitepcGatewayClient.registerStudentEvaluations(inputDto);
        } catch (Exception ex) {
            log.error("Fallo de comunicación al registrar notas en el SEA para rolId={}: {}", rolExamenId, ex.getMessage(), ex);
            throw new RuntimeException("Error al comunicarse con el servicio del SEA: " + ex.getMessage(), ex);
        }

        if (respuestaSea == null) {
            respuestaSea = List.of();
        }

        // 6. Mapear resultados devueltos por el SEA
        Map<Long, Boolean> resultadoPorOldCode = respuestaSea.stream()
                .filter(r -> r.getOldCode() != null)
                .collect(Collectors.toMap(ResearchStudentEvaluationRegisterResponseDto::getOldCode,
                        r -> Boolean.TRUE.equals(r.getCompleted()),
                        (existente, reemplazo) -> reemplazo));

        int exitosos = 0;
        int fallidos = 0;
        List<EstudianteSincronizadoDetalleDto> detalleReporte = new ArrayList<>();

        for (EstudianteCalculado calc : estudiantesCalculados) {
            Boolean completado = null;
            if (calc.studentOldCode() != null) {
                completado = resultadoPorOldCode.get(calc.studentOldCode());
            }

            if (Boolean.TRUE.equals(completado)) {
                exitosos++;
            } else {
                fallidos++;
            }

            String observacionFinal = calc.observacion();
            if (Boolean.FALSE.equals(completado)) {
                observacionFinal = (observacionFinal != null ? observacionFinal + " - " : "") + "Rechazado por el SEA (completed: false)";
            }

            detalleReporte.add(EstudianteSincronizadoDetalleDto.builder()
                    .codigoEstudiante(calc.codigoEstudiante())
                    .studentOldCode(calc.studentOldCode())
                    .nombreCompleto(calc.nombreCompleto())
                    .score(calc.score())
                    .completado(completado)
                    .observacion(observacionFinal)
                    .esReprogramado(calc.esReprogramado())
                    .build());
        }

        detalleReporte.sort(Comparator.comparing(EstudianteSincronizadoDetalleDto::getCodigoEstudiante));

        LocalDateTime ahora = LocalDateTime.now();

        // 7. Persistir estado en el Rol de Examen
        rol.setSincronizadoSea(true);
        rol.setFechaSincronizacionSea(ahora);
        rol.setSincronizadoSeaPor(usuario);

        Map<String, Object> resumenMap = new LinkedHashMap<>();
        resumenMap.put("totalEnviados", studentsInput.size());
        resumenMap.put("exitosos", exitosos);
        resumenMap.put("fallidos", fallidos);
        resumenMap.put("fecha", ahora.toString());
        resumenMap.put("usuario", usuario);

        try {
            rol.setSincronizacionSeaResultado(objectMapper.writeValueAsString(resumenMap));
        } catch (Exception e) {
            rol.setSincronizacionSeaResultado("{\"exitosos\":" + exitosos + ",\"fallidos\":" + fallidos + "}");
        }

        rolExamenRepository.save(rol);

        // 8. Registrar auditoría inmutable
        try {
            Map<String, Object> auditoriaData = new LinkedHashMap<>(resumenMap);
            auditoriaData.put("rolExamenId", rol.getId());
            auditoriaData.put("materia", rol.getMateriaNombre());
            auditoriaData.put("grupo", rol.getGrupo());

            auditoriaRepository.save(AuditoriaEvaluacion.builder()
                    .rolExamen(rol)
                    .etapaOrigen(rol.getEstadoFlujo().getValor())
                    .etapaDestino(rol.getEstadoFlujo().getValor())
                    .accion("SINCRONIZACION_NOTAS_SEA")
                    .usuario(usuario)
                    .detallesJson(objectMapper.writeValueAsString(auditoriaData))
                    .build());
        } catch (Exception e) {
            log.warn("No se pudo persistir auditoría detallada de sincronización SEA: {}", e.getMessage());
        }

        return SincronizacionNotasSeaReporteDto.builder()
                .rolExamenId(rol.getId())
                .materiaCodigo(rol.getMateriaCodigo())
                .materiaNombre(rol.getMateriaNombre())
                .grupo(rol.getGrupo())
                .modalidad(rol.getModalidad() != null ? rol.getModalidad().name() : "DESCONOCIDA")
                .tipoParcial(rol.getTipoParcial() != null ? rol.getTipoParcial().name() : "PARCIAL")
                .syllabusCourseId(syllabusUuid)
                .groupId(groupUuid)
                .totalEstudiantes(detalleReporte.size())
                .totalExitosos(exitosos)
                .totalFallidos(fallidos)
                .fechaSincronizacion(ahora)
                .sincronizadoPor(usuario)
                .estudiantes(detalleReporte)
                .build();
    }

    // =========================================================================
    // Métodos auxiliares de extracción y consolidación de notas sobre 100
    // =========================================================================

    private record EstudianteCalculado(
            String codigoEstudiante,
            Long studentOldCode,
            String nombreCompleto,
            Integer score,
            Boolean esReprogramado,
            String observacion
    ) {}

    private List<EstudianteCalculado> consolidarNotasTeoricas(RolExamen rol) {
        // 1. Obtener la nómina oficial de estudiantes del grupo desde el Gateway
        List<StudentItemDto> estudiantesGateway = List.of();
        if (rol.getSeaGroupId() != null && !rol.getSeaGroupId().isBlank()) {
            try {
                estudiantesGateway = unitepcGatewayClient.getStudentsByGroup(rol.getSeaGroupId());
            } catch (Exception e) {
                log.warn("No se pudo obtener la nómina oficial del Gateway para groupId={}: {}", rol.getSeaGroupId(), e.getMessage());
            }
        }
        if (estudiantesGateway == null) {
            estudiantesGateway = List.of();
        }

        Map<String, StudentItemDto> nominaGatewayMap = estudiantesGateway.stream()
                .filter(s -> s.getStudentCode() != null && !s.getStudentCode().isBlank())
                .collect(Collectors.toMap(s -> s.getStudentCode().trim(), Function.identity(), (a, b) -> a));

        Map<String, EstudianteCalculado> calculados = new LinkedHashMap<>();

        ModalidadExamen modalidad = rol.getModalidad();
        if (modalidad == ModalidadExamen.PRESENCIAL_CARTILLA) {
            consolidarNotasOmr(rol, nominaGatewayMap, calculados);
        } else if (modalidad == ModalidadExamen.PRESENCIAL_SIN_CARTILLA) {
            consolidarNotasSinCartilla(rol, nominaGatewayMap, calculados);
        } else if (modalidad == ModalidadExamen.VIRTUAL) {
            consolidarNotasVirtual(rol, nominaGatewayMap, calculados);
        } else {
            // Por defecto, intentar OMR si no está definida la modalidad
            consolidarNotasOmr(rol, nominaGatewayMap, calculados);
        }

        // Agregar a cualquier estudiante de la nómina oficial del gateway que no haya sido calificado con nota 0
        for (StudentItemDto estudiante : estudiantesGateway) {
            String codigo = estudiante.getStudentCode() != null ? estudiante.getStudentCode().trim() : "";
            if (!codigo.isBlank() && !calculados.containsKey(codigo)) {
                Long oldCode = parseStudentOldCode(codigo);
                calculados.put(codigo, new EstudianteCalculado(
                        codigo,
                        oldCode,
                        estudiante.getFullName() != null ? estudiante.getFullName() : "ESTUDIANTE",
                        0,
                        false,
                        "Ausente / Sin evaluación registrada"
                ));
            }
        }

        return new ArrayList<>(calculados.values());
    }

    private void consolidarNotasOmr(RolExamen rol, Map<String, StudentItemDto> nominaGatewayMap, Map<String, EstudianteCalculado> calculados) {
        List<CalificacionOmr> calificaciones = calificacionOmrRepository.findByRolExamenIdOrderByCodigoEstudianteAsc(rol.getId());
        for (CalificacionOmr cal : calificaciones) {
            String codigo = cal.getCodigoEstudiante().trim();
            Long oldCode = parseStudentOldCode(codigo);

            Integer score = parseScore(cal.getNotaSobre100());
            boolean reprogramado = Boolean.TRUE.equals(cal.getEsReprogramado());

            String nombre = cal.getEstudianteNombreCompleto();
            if ((nombre == null || nombre.isBlank()) && nominaGatewayMap.containsKey(codigo)) {
                nombre = nominaGatewayMap.get(codigo).getFullName();
            }

            String obs = reprogramado
                    ? "Examen oral reprogramado (" + cal.getFechaExamenReprogramado() + ")"
                    : "Cartilla OMR (" + cal.getEstadoCalificacion() + ")";

            calculados.put(codigo, new EstudianteCalculado(
                    codigo,
                    oldCode,
                    nombre != null ? nombre : "ESTUDIANTE",
                    score,
                    reprogramado,
                    obs
            ));
        }
    }

    private void consolidarNotasSinCartilla(RolExamen rol, Map<String, StudentItemDto> nominaGatewayMap, Map<String, EstudianteCalculado> calculados) {
        List<NotaDocente> notas = notaDocenteRepository.findByRolExamenId(rol.getId());
        for (NotaDocente n : notas) {
            String codigo = n.getCodigoEstudiante().trim();
            Long oldCode = parseStudentOldCode(codigo);

            Integer score = parseScore(n.getNotaSobre100());
            String nombre = n.getEstudianteNombreCompleto();
            if ((nombre == null || nombre.isBlank()) && nominaGatewayMap.containsKey(codigo)) {
                nombre = nominaGatewayMap.get(codigo).getFullName();
            }

            String obs = "Planilla docente sin cartilla (Calificado)";

            calculados.put(codigo, new EstudianteCalculado(
                    codigo,
                    oldCode,
                    nombre != null ? nombre : "ESTUDIANTE",
                    score,
                    false,
                    obs
            ));
        }
    }

    private void consolidarNotasVirtual(RolExamen rol, Map<String, StudentItemDto> nominaGatewayMap, Map<String, EstudianteCalculado> calculados) {
        List<SalaExamenVirtual> salas = salaVirtualRepository.findByRolExamenIdOrderByCreadoEnDesc(rol.getId());
        if (!salas.isEmpty()) {
            SalaExamenVirtual sala = salas.get(0);
            List<IntentoExamenVirtual> intentos = intentoVirtualRepository.findBySalaIdOrderByCodigoEstudianteAsc(sala.getId());
            for (IntentoExamenVirtual intento : intentos) {
                String codigo = intento.getCodigoEstudiante().trim();
                Long oldCode = parseStudentOldCode(codigo);

                Integer score = parseScore(intento.getNotaSobre100());
                String nombre = intento.getNombreEstudiante();
                if ((nombre == null || nombre.isBlank()) && nominaGatewayMap.containsKey(codigo)) {
                    nombre = nominaGatewayMap.get(codigo).getFullName();
                }

                String obs = "Examen Virtual (Estado: " + intento.getEstado() + ")";

                calculados.put(codigo, new EstudianteCalculado(
                        codigo,
                        oldCode,
                        nombre != null ? nombre : "ESTUDIANTE",
                        score,
                        false,
                        obs
                ));
            }
        }
    }

    private Integer parseScore(BigDecimal notaSobre100) {
        if (notaSobre100 == null) {
            return 0;
        }
        int rounded = notaSobre100.setScale(0, RoundingMode.HALF_UP).intValue();
        return Math.max(0, Math.min(100, rounded));
    }

    private Long parseStudentOldCode(String codigoEstudiante) {
        if (codigoEstudiante == null || codigoEstudiante.isBlank()) {
            return null;
        }
        String digitsOnly = codigoEstudiante.replaceAll("\\D+", "");
        if (digitsOnly.isBlank()) {
            return null;
        }
        try {
            return Long.parseLong(digitsOnly);
        } catch (NumberFormatException e) {
            log.warn("No se pudo convertir código de estudiante '{}' a Long", codigoEstudiante);
            return null;
        }
    }

    private UUID parseUuid(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(valor.trim());
        } catch (IllegalArgumentException e) {
            log.warn("Valor '{}' no es un UUID válido", valor);
            return null;
        }
    }

    private RolExamen obtenerRolValidado(String rolExamenId) {
        return rolExamenRepository.findById(rolExamenId)
                .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + rolExamenId));
    }

    private String validarPermisos(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Usuario no autenticado");
        }
        boolean autorizado = auth.getAuthorities().stream().anyMatch(a ->
                "ROLE_ADMINISTRADOR_SISTEMA".equals(a.getAuthority()) ||
                "ROLE_RESPONSABLE_EVALUACIONES".equals(a.getAuthority()) ||
                "ROLE_PERSONAL_EVALUACIONES".equals(a.getAuthority())
        );
        if (!autorizado) {
            throw new AccessDeniedException("No tiene permisos para sincronizar calificaciones con el SEA.");
        }
        return auth.getName();
    }
}
