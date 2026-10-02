package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.gateway.*;
import com.xpertiflow.evaluaciones.api.dto.sincronizacion.*;
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
    private final com.xpertiflow.evaluaciones.domain.repository.MapeoEstudianteVarianteRepository mapeoRepository;
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
                        .completado(null) // aún no enviado en esta ejecución
                        .observacion(e.observacion())
                        .esReprogramado(e.esReprogramado())
                        .sincronizadoSea(e.sincronizadoSea())
                        .fechaSincronizacionSea(e.fechaSincronizacionSea())
                        .sincronizadoSeaPor(e.sincronizadoSeaPor())
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
     * POST https://gw-dev.unitepc.solutions/api/v1/student/externals/research/student-evaluations
     * Registra auditoría inmutable y persiste el estado de sincronización en el Rol de Examen.
     */
    @Transactional
    public SincronizacionNotasSeaReporteDto sincronizarNotasConSea(String rolExamenId, Authentication auth) {
        return sincronizarNotasConSea(rolExamenId, auth, "127.0.0.1");
    }

    @Transactional
    public SincronizacionNotasSeaReporteDto sincronizarNotasConSea(String rolExamenId, Authentication auth, String ipOrigen) {
        RolExamen rol = obtenerRolValidado(rolExamenId);
        String usuario = validarPermisos(auth);
        String ipValida = (ipOrigen != null && !ipOrigen.isBlank()) ? ipOrigen : "127.0.0.1";

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

        // 3. Consolidar la nómina de estudiantes y sus notas sobre 100 (omitiendo ausentes sin nota)
        List<EstudianteCalculado> estudiantesCalculados = consolidarNotasTeoricas(rol);
        if (estudiantesCalculados.isEmpty()) {
            throw new IllegalStateException("No se encontraron estudiantes para sincronizar en este grupo.");
        }

        // 4. Construir payload para el Gateway SEA (SOLO estudiantes con nota calculada)
        List<StudentOldCodeScoreInputDto> studentsInput = new ArrayList<>();
        Map<Long, EstudianteCalculado> porOldCode = new HashMap<>();

        for (EstudianteCalculado calc : estudiantesCalculados) {
            if (calc.studentOldCode() != null && calc.score() != null) {
                studentsInput.add(StudentOldCodeScoreInputDto.builder()
                        .studentOldCode(calc.studentOldCode())
                        .score(calc.score())
                        .build());
                porOldCode.put(calc.studentOldCode(), calc);
            } else if (calc.studentOldCode() == null) {
                log.warn("Estudiante {} con código no numérico omitido del envío al SEA", calc.codigoEstudiante());
            } else {
                log.info("Estudiante {} omitido del envío al SEA por estar pendiente de evaluación (sin nota)", calc.codigoEstudiante());
            }
        }

        if (studentsInput.isEmpty()) {
            throw new IllegalStateException("No hay estudiantes con calificaciones registradas para sincronizar en este grupo.");
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

        LocalDateTime ahora = LocalDateTime.now();
        int exitosos = 0;
        int fallidos = 0;
        List<EstudianteSincronizadoDetalleDto> detalleReporte = new ArrayList<>();

        for (EstudianteCalculado calc : estudiantesCalculados) {
            Boolean completado = null;
            if (calc.studentOldCode() != null && calc.score() != null) {
                completado = resultadoPorOldCode.get(calc.studentOldCode());
            }

            Boolean sincSea = calc.sincronizadoSea();
            LocalDateTime fechaSinc = calc.fechaSincronizacionSea();
            String sincPor = calc.sincronizadoSeaPor();

            if (Boolean.TRUE.equals(completado)) {
                exitosos++;
                sincSea = true;
                fechaSinc = ahora;
                sincPor = usuario;
                actualizarSincronizacionIndividual(rol, calc.codigoEstudiante(), ahora, usuario);
            } else if (Boolean.FALSE.equals(completado)) {
                fallidos++;
            }

            String observacionFinal = calc.observacion();
            if (Boolean.FALSE.equals(completado)) {
                observacionFinal = (observacionFinal != null ? observacionFinal + " - " : "") + "Rechazado por el SEA (completed: false)";
            } else if (calc.score() == null) {
                observacionFinal = "Pendiente de evaluación (Omitido de la sincronización)";
            }

            detalleReporte.add(EstudianteSincronizadoDetalleDto.builder()
                    .codigoEstudiante(calc.codigoEstudiante())
                    .studentOldCode(calc.studentOldCode())
                    .nombreCompleto(calc.nombreCompleto())
                    .score(calc.score())
                    .completado(completado)
                    .observacion(observacionFinal)
                    .esReprogramado(calc.esReprogramado())
                    .sincronizadoSea(sincSea)
                    .fechaSincronizacionSea(fechaSinc)
                    .sincronizadoSeaPor(sincPor)
                    .build());
        }

        detalleReporte.sort(Comparator.comparing(EstudianteSincronizadoDetalleDto::getCodigoEstudiante));

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
                    .ipOrigen(ipValida)
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
            String observacion,
            Boolean sincronizadoSea,
            LocalDateTime fechaSincronizacionSea,
            String sincronizadoSeaPor
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

        // Agregar a cualquier estudiante de la nómina oficial del gateway que no haya sido calificado aún
        for (StudentItemDto estudiante : estudiantesGateway) {
            String codigo = estudiante.getStudentCode() != null ? estudiante.getStudentCode().trim() : "";
            if (!codigo.isBlank() && !calculados.containsKey(codigo)) {
                Long oldCode = parseStudentOldCode(codigo);
                calculados.put(codigo, new EstudianteCalculado(
                        codigo,
                        oldCode,
                        estudiante.getFullName() != null ? estudiante.getFullName() : "ESTUDIANTE",
                        null,
                        false,
                        "Pendiente de evaluación / Ausente",
                        false,
                        null,
                        null
                ));
            }
        }

        // Agregar también estudiantes del mapeo local de variantes (rezagados y nómina asignada)
        if (mapeoRepository != null) {
            List<com.xpertiflow.evaluaciones.domain.entity.MapeoEstudianteVariante> mapeosLocales =
                    mapeoRepository.findByRolExamenId(rol.getId());
            if (mapeosLocales != null) {
                for (com.xpertiflow.evaluaciones.domain.entity.MapeoEstudianteVariante m : mapeosLocales) {
                    String codigo = m.getCodigoEstudiante() != null ? m.getCodigoEstudiante().trim() : "";
                    if (!codigo.isBlank() && !calculados.containsKey(codigo)) {
                        Long oldCode = parseStudentOldCode(codigo);
                        String nom = String.join(" ", List.of(
                                m.getNombres() != null ? m.getNombres() : "",
                                m.getApellidoPaterno() != null ? m.getApellidoPaterno() : "",
                                m.getApellidoMaterno() != null ? m.getApellidoMaterno() : ""
                        ).stream().filter(s -> !s.isBlank()).toList());
                        calculados.put(codigo, new EstudianteCalculado(
                                codigo,
                                oldCode,
                                !nom.isBlank() ? nom : "ESTUDIANTE",
                                null,
                                false,
                                "Pendiente de evaluación / Ausente",
                                false,
                                null,
                                null
                        ));
                    }
                }
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
                    obs,
                    Boolean.TRUE.equals(cal.getSincronizadoSea()),
                    cal.getFechaSincronizacionSea(),
                    cal.getSincronizadoSeaPor()
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
                    obs,
                    Boolean.TRUE.equals(n.getSincronizadoSea()),
                    n.getFechaSincronizacionSea(),
                    n.getSincronizadoSeaPor()
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
                        obs,
                        Boolean.TRUE.equals(intento.getSincronizadoSea()),
                        intento.getFechaSincronizacionSea(),
                        intento.getSincronizadoSeaPor()
                ));
            }
        }
    }

    private void actualizarSincronizacionIndividual(RolExamen rol, String codigoEstudiante, LocalDateTime fecha, String usuario) {
        if (codigoEstudiante == null || codigoEstudiante.isBlank()) {
            return;
        }
        ModalidadExamen modalidad = rol.getModalidad();
        if (modalidad == ModalidadExamen.PRESENCIAL_CARTILLA || modalidad == null) {
            calificacionOmrRepository.findByRolExamenIdAndCodigoEstudiante(rol.getId(), codigoEstudiante.trim())
                    .ifPresent(cal -> {
                        cal.setSincronizadoSea(true);
                        cal.setFechaSincronizacionSea(fecha);
                        cal.setSincronizadoSeaPor(usuario);
                        calificacionOmrRepository.save(cal);
                    });
        } else if (modalidad == ModalidadExamen.PRESENCIAL_SIN_CARTILLA) {
            notaDocenteRepository.findByRolExamenIdAndCodigoEstudiante(rol.getId(), codigoEstudiante.trim())
                    .ifPresent(nd -> {
                        nd.setSincronizadoSea(true);
                        nd.setFechaSincronizacionSea(fecha);
                        nd.setSincronizadoSeaPor(usuario);
                        notaDocenteRepository.save(nd);
                    });
        } else if (modalidad == ModalidadExamen.VIRTUAL) {
            List<SalaExamenVirtual> salas = salaVirtualRepository.findByRolExamenIdOrderByCreadoEnDesc(rol.getId());
            if (!salas.isEmpty()) {
                intentoVirtualRepository.findBySalaIdAndCodigoEstudiante(salas.get(0).getId(), codigoEstudiante.trim())
                        .ifPresent(intento -> {
                            intento.setSincronizadoSea(true);
                            intento.setFechaSincronizacionSea(fecha);
                            intento.setSincronizadoSeaPor(usuario);
                            intentoVirtualRepository.save(intento);
                        });
            }
        }
    }

    private Integer parseScore(BigDecimal notaSobre100) {
        if (notaSobre100 == null) {
            return null;
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

    /**
     * Consulta los grupos de una sede y carrera para la consola de sincronización masiva al SEA,
     * determinando el estado de calificación, elegibilidad y tipo de clase (Teórico vs Práctico).
     */
    @Transactional(readOnly = true)
    public List<GrupoSincronizacionResumenDto> obtenerGruposParaSincronizacion(
            String sedeCodigo,
            String carreraCodigo,
            String tipoClase,
            String tipoParcial,
            String estadoSincronizacion,
            Authentication auth) {

        validarPermisos(auth);

        if (sedeCodigo == null || sedeCodigo.isBlank() || carreraCodigo == null || carreraCodigo.isBlank()) {
            return List.of();
        }

        List<RolExamen> roles = rolExamenRepository.findBySedeCodigoAndCarreraCodigo(sedeCodigo.trim(), carreraCodigo.trim());
        if (roles == null || roles.isEmpty()) {
            return List.of();
        }

        List<GrupoSincronizacionResumenDto> resultado = new ArrayList<>();

        for (RolExamen rol : roles) {
            if (rol.getEstadoFlujo() == EstadoFlujo.SUSPENDIDO) {
                continue;
            }

            String tc = rol.getTipoClase() != null ? rol.getTipoClase().trim().toUpperCase() : "TA";
            String grp = rol.getGrupo() != null ? rol.getGrupo().trim().toUpperCase() : "";
            boolean esTeorico = "TA".equals(tc) || "T".equals(tc) || grp.startsWith("TA");

            // Filtro por tipo de clase: TEORICO (default), PRACTICO, TODOS
            if ("TEORICO".equalsIgnoreCase(tipoClase) || "TA".equalsIgnoreCase(tipoClase)) {
                if (!esTeorico) continue;
            } else if ("PRACTICO".equalsIgnoreCase(tipoClase) || "PA".equalsIgnoreCase(tipoClase)) {
                if (esTeorico) continue;
            }

            // Filtro por tipo de examen: PRIMER_PARCIAL (default), SEGUNDO_PARCIAL, FINAL, SEGUNDA_INSTANCIA, TODOS
            if (tipoParcial != null && !tipoParcial.isBlank() && !"TODOS".equalsIgnoreCase(tipoParcial)) {
                String tp = rol.getTipoParcial() != null ? rol.getTipoParcial().name() : "PRIMER_PARCIAL";
                if ("PRIMER_PARCIAL".equalsIgnoreCase(tipoParcial) || "1P".equalsIgnoreCase(tipoParcial) || "1ER_PARCIAL".equalsIgnoreCase(tipoParcial)) {
                    if (!"PRIMER_PARCIAL".equalsIgnoreCase(tp)) continue;
                } else if ("SEGUNDO_PARCIAL".equalsIgnoreCase(tipoParcial) || "2P".equalsIgnoreCase(tipoParcial) || "2DO_PARCIAL".equalsIgnoreCase(tipoParcial)) {
                    if (!"SEGUNDO_PARCIAL".equalsIgnoreCase(tp)) continue;
                } else if ("FINAL".equalsIgnoreCase(tipoParcial) || "EXAMEN_FINAL".equalsIgnoreCase(tipoParcial)) {
                    if (!"FINAL".equalsIgnoreCase(tp) && !"EXAMEN_FINAL".equalsIgnoreCase(tp)) continue;
                } else if ("SEGUNDA_INSTANCIA".equalsIgnoreCase(tipoParcial) || "2I".equalsIgnoreCase(tipoParcial) || "2DA_INSTANCIA".equalsIgnoreCase(tipoParcial)) {
                    if (!"SEGUNDA_INSTANCIA".equalsIgnoreCase(tp)) continue;
                }
            }

            int totalCalificados = contarEstudiantesCalificados(rol);
            int totalEstudiantes = rol.getEstudiantesInscritosCount() != null && rol.getEstudiantesInscritosCount() > 0
                    ? rol.getEstudiantesInscritosCount()
                    : (mapeoRepository != null ? mapeoRepository.findByRolExamenId(rol.getId()).size() : totalCalificados);

            if (totalEstudiantes < totalCalificados) {
                totalEstudiantes = totalCalificados;
            }

            boolean estadoValido = rol.getEstadoFlujo() == EstadoFlujo.CALIFICADO
                    || rol.getEstadoFlujo() == EstadoFlujo.CONFIRMADO
                    || rol.getEstadoFlujo() == EstadoFlujo.PENDIENTE_NOTAS;
            boolean tieneUuids = rol.getSeaGroupId() != null && !rol.getSeaGroupId().isBlank()
                    && rol.getSeaSyllabusCourseId() != null && !rol.getSeaSyllabusCourseId().isBlank();
            boolean tieneNotas = totalCalificados > 0;
            boolean esSincronizable = estadoValido && tieneUuids && tieneNotas;

            String motivoNoSincronizable = null;
            if (!estadoValido) {
                motivoNoSincronizable = "Evaluación en estado " + rol.getEstadoFlujo() + " (requiere estar CALIFICADO o CONFIRMADO)";
            } else if (!tieneUuids) {
                motivoNoSincronizable = "Faltan identificadores del grupo en SEA (groupId o syllabusCourseId)";
            } else if (!tieneNotas) {
                motivoNoSincronizable = "No se encontraron estudiantes con calificación registrada";
            }

            boolean yaSincronizado = Boolean.TRUE.equals(rol.getSincronizadoSea());

            // Filtro por estado de sincronización si se especifica
            if ("PENDIENTE".equalsIgnoreCase(estadoSincronizacion)) {
                if (yaSincronizado || !esSincronizable) continue;
            } else if ("SINCRONIZADO".equalsIgnoreCase(estadoSincronizacion)) {
                if (!yaSincronizado) continue;
            } else if ("NO_CALIFICADO".equalsIgnoreCase(estadoSincronizacion)) {
                if (esSincronizable) continue;
            }

            resultado.add(GrupoSincronizacionResumenDto.builder()
                    .rolExamenId(rol.getId())
                    .materiaCodigo(rol.getMateriaCodigo())
                    .materiaNombre(rol.getMateriaNombre())
                    .semestre(rol.getSemestre())
                    .grupo(rol.getGrupo())
                    .tipoClase(rol.getTipoClase() != null ? rol.getTipoClase() : (esTeorico ? "TA" : "PA"))
                    .esTeorico(esTeorico)
                    .modalidad(rol.getModalidad() != null ? rol.getModalidad().name() : "PRESENCIAL_CARTILLA")
                    .tipoParcial(rol.getTipoParcial() != null ? rol.getTipoParcial().name() : "PARCIAL")
                    .docenteNombre(rol.getDocenteNombre())
                    .docenteCi(rol.getDocenteCi())
                    .aula(rol.getAula())
                    .campus(rol.getCampus())
                    .estadoFlujo(rol.getEstadoFlujo() != null ? rol.getEstadoFlujo().name() : "DESCONOCIDO")
                    .totalEstudiantes(totalEstudiantes)
                    .totalCalificados(totalCalificados)
                    .sincronizadoSea(yaSincronizado)
                    .fechaSincronizacionSea(rol.getFechaSincronizacionSea())
                    .sincronizadoPor(rol.getSincronizadoSeaPor())
                    .sincronizacionSeaResultado(rol.getSincronizacionSeaResultado())
                    .esSincronizable(esSincronizable)
                    .motivoNoSincronizable(motivoNoSincronizable)
                    .build());
        }

        resultado.sort(Comparator.comparing((GrupoSincronizacionResumenDto g) -> g.getSemestre() != null ? g.getSemestre() : 99)
                .thenComparing(GrupoSincronizacionResumenDto::getMateriaNombre, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
                .thenComparing(GrupoSincronizacionResumenDto::getGrupo, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)));

        return resultado;
    }

    @Transactional(readOnly = true)
    public List<GrupoSincronizacionResumenDto> obtenerGruposParaSincronizacion(
            String sedeCodigo,
            String carreraCodigo,
            String tipoClase,
            String estadoSincronizacion,
            Authentication auth) {
        return obtenerGruposParaSincronizacion(sedeCodigo, carreraCodigo, tipoClase, "PRIMER_PARCIAL", estadoSincronizacion, auth);
    }

    /**
     * Ejecuta la sincronización masiva de notas al SEA para un conjunto de roles de examen.
     * Es tolerante a fallos: procesa cada grupo de forma aislada y consolida los resultados.
     */
    @Transactional
    public SincronizacionMasivaReporteDto sincronizarNotasMasivo(
            SincronizacionMasivaRequestDto request,
            Authentication auth,
            String ipOrigen) {

        String usuario = validarPermisos(auth);
        if (request == null || request.getRolExamenIds() == null || request.getRolExamenIds().isEmpty()) {
            throw new IllegalArgumentException("Debe seleccionar al menos un grupo para sincronizar.");
        }

        List<String> ids = request.getRolExamenIds();
        log.info("Iniciando sincronización masiva al SEA para {} grupos por usuario {}", ids.size(), usuario);

        List<SincronizacionNotasSeaReporteDto> resultados = new ArrayList<>();
        int gruposExitosos = 0;
        int gruposFallidos = 0;
        int totalEstudiantes = 0;

        for (String rolId : ids) {
            try {
                SincronizacionNotasSeaReporteDto reporteGrupo = sincronizarNotasConSea(rolId, auth, ipOrigen);
                resultados.add(reporteGrupo);
                if (reporteGrupo.getTotalExitosos() != null && reporteGrupo.getTotalExitosos() > 0) {
                    gruposExitosos++;
                    totalEstudiantes += reporteGrupo.getTotalExitosos();
                } else if (reporteGrupo.getTotalFallidos() != null && reporteGrupo.getTotalFallidos() > 0 && (reporteGrupo.getTotalExitosos() == null || reporteGrupo.getTotalExitosos() == 0)) {
                    gruposFallidos++;
                } else {
                    gruposExitosos++;
                }
            } catch (Exception ex) {
                log.error("Fallo al sincronizar grupo rolId={}: {}", rolId, ex.getMessage(), ex);
                gruposFallidos++;
                Optional<RolExamen> rolOpt = rolExamenRepository.findById(rolId);
                resultados.add(SincronizacionNotasSeaReporteDto.builder()
                        .rolExamenId(rolId)
                        .materiaCodigo(rolOpt.map(RolExamen::getMateriaCodigo).orElse("N/A"))
                        .materiaNombre(rolOpt.map(RolExamen::getMateriaNombre).orElse("Error"))
                        .grupo(rolOpt.map(RolExamen::getGrupo).orElse("N/A"))
                        .modalidad(rolOpt.map(r -> r.getModalidad() != null ? r.getModalidad().name() : "N/A").orElse("N/A"))
                        .tipoParcial(rolOpt.map(r -> r.getTipoParcial() != null ? r.getTipoParcial().name() : "PARCIAL").orElse("PARCIAL"))
                        .totalEstudiantes(0)
                        .totalExitosos(0)
                        .totalFallidos(1)
                        .fechaSincronizacion(LocalDateTime.now())
                        .sincronizadoPor(usuario)
                        .estudiantes(List.of(EstudianteSincronizadoDetalleDto.builder()
                                .codigoEstudiante("N/A")
                                .nombreCompleto("Error al procesar grupo: " + ex.getMessage())
                                .completado(false)
                                .observacion(ex.getMessage())
                                .build()))
                        .build());
            }
        }

        return SincronizacionMasivaReporteDto.builder()
                .totalGruposSolicitados(ids.size())
                .totalGruposExitosos(gruposExitosos)
                .totalGruposFallidos(gruposFallidos)
                .totalEstudiantesSincronizados(totalEstudiantes)
                .fechaEjecucion(LocalDateTime.now())
                .ejecutadoPor(usuario)
                .resultadosPorGrupo(resultados)
                .build();
    }

    private int contarEstudiantesCalificados(RolExamen rol) {
        if (rol == null) return 0;
        ModalidadExamen modalidad = rol.getModalidad();
        if (modalidad == ModalidadExamen.PRESENCIAL_CARTILLA || modalidad == null) {
            return (int) calificacionOmrRepository.findByRolExamenIdOrderByCodigoEstudianteAsc(rol.getId())
                    .stream()
                    .filter(c -> c.getNotaSobre100() != null || Boolean.TRUE.equals(c.getEsReprogramado()))
                    .count();
        } else if (modalidad == ModalidadExamen.PRESENCIAL_SIN_CARTILLA) {
            return (int) notaDocenteRepository.findByRolExamenId(rol.getId())
                    .stream()
                    .filter(n -> n.getNotaSobre100() != null)
                    .count();
        } else if (modalidad == ModalidadExamen.VIRTUAL) {
            List<SalaExamenVirtual> salas = salaVirtualRepository.findByRolExamenIdOrderByCreadoEnDesc(rol.getId());
            if (salas.isEmpty()) return 0;
            return (int) intentoVirtualRepository.findBySalaIdOrderByCodigoEstudianteAsc(salas.get(0).getId())
                    .stream()
                    .filter(i -> i.getNotaSobre100() != null)
                    .count();
        }
        return 0;
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
                "ROLE_RESPONSABLE_EVALUACIONES".equals(a.getAuthority())
        );
        if (!autorizado) {
            throw new AccessDeniedException("No tiene permisos para sincronizar calificaciones con el SEA.");
        }
        return auth.getName();
    }
}
