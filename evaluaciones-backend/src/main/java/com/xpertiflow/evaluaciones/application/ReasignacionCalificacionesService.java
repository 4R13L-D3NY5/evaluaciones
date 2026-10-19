package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.gateway.StudentItemDto;
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
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReasignacionCalificacionesService {

    private final RolExamenRepository rolExamenRepository;
    private final CalificacionOmrRepository calificacionOmrRepository;
    private final NotaDocenteRepository notaDocenteRepository;
    private final MapeoEstudianteVarianteRepository mapeoRepository;
    private final ExamenVarianteRepository varianteRepository;
    private final AuditoriaEvaluacionRepository auditoriaRepository;
    private final UnitepcGatewayClient unitepcGatewayClient;
    private final ObjectMapper objectMapper;

    /**
     * Identifica estudiantes que rindieron examen / tienen nota en un grupo, pero en el Gateway SEA
     * están inscritos en otro grupo paralelo de la misma asignatura.
     */
    @Transactional(readOnly = true)
    public DiscrepanciaGrupoReporteDto detectarDiscrepancias(List<String> rolExamenIds, Authentication auth) {
        String usuario = validarPermisos(auth);

        if (rolExamenIds == null || rolExamenIds.isEmpty()) {
            return DiscrepanciaGrupoReporteDto.builder()
                    .totalGruposAnalizados(0)
                    .totalEstudiantesAnalizados(0)
                    .totalConDiscrepancia(0)
                    .totalListosParaTrasladar(0)
                    .totalConflictos(0)
                    .totalNoEncontradosEnSea(0)
                    .fechaAnalisis(LocalDateTime.now())
                    .analizadoPor(usuario)
                    .discrepancias(List.of())
                    .build();
        }

        List<RolExamen> rolesOrigen = rolExamenRepository.findAllById(rolExamenIds).stream()
                .filter(r -> r.getEstadoFlujo() != EstadoFlujo.SUSPENDIDO)
                .toList();

        Map<String, List<StudentItemDto>> gatewayCache = new HashMap<>();
        List<DiscrepanciaGrupoItemDto> discrepancias = new ArrayList<>();

        int totalEstudiantesAnalizados = 0;
        int totalListos = 0;
        int totalConflictos = 0;
        int totalNoEncontrados = 0;

        for (RolExamen rolOrigen : rolesOrigen) {
            // Buscar todos los grupos paralelos vigentes de la misma materia, sede y parcial
            List<RolExamen> paralelos = rolExamenRepository
                    .findBySedeCodigoAndMateriaCodigoAndTipoParcialAndEstadoFlujoNot(
                            rolOrigen.getSedeCodigo(),
                            rolOrigen.getMateriaCodigo(),
                            rolOrigen.getTipoParcial(),
                            EstadoFlujo.SUSPENDIDO
                    );

            // Nómina del grupo origen en el Gateway
            List<StudentItemDto> nominaOrigen = obtenerNominaGateway(rolOrigen.getSeaGroupId(), gatewayCache);
            Set<String> codigosEnGatewayOrigen = nominaOrigen.stream()
                    .map(StudentItemDto::getStudentCode)
                    .filter(Objects::nonNull)
                    .map(String::trim)
                    .collect(Collectors.toSet());

            // Extraer estudiantes con calificación registrada en el grupo origen
            List<EstudianteEvaluado> calificados = extraerEstudiantesEvaluados(rolOrigen);

            for (EstudianteEvaluado est : calificados) {
                totalEstudiantesAnalizados++;
                String codigo = est.codigoEstudiante().trim();

                // Si el estudiante está inscrito en este grupo en SEA, no hay discrepancia
                if (codigosEnGatewayOrigen.contains(codigo)) {
                    continue;
                }

                // Discrepancia detectada: buscar en qué grupo paralelo está en el Gateway SEA
                RolExamen rolDestino = null;
                StudentItemDto estudianteEnDestino = null;

                for (RolExamen candidato : paralelos) {
                    if (candidato.getId().equals(rolOrigen.getId())) {
                        continue;
                    }
                    if (candidato.getSeaGroupId() == null || candidato.getSeaGroupId().isBlank()) {
                        continue;
                    }

                    List<StudentItemDto> nominaCandidato = obtenerNominaGateway(candidato.getSeaGroupId(), gatewayCache);
                    for (StudentItemDto s : nominaCandidato) {
                        if (s.getStudentCode() != null && s.getStudentCode().trim().equals(codigo)) {
                            rolDestino = candidato;
                            estudianteEnDestino = s;
                            break;
                        }
                    }
                    if (rolDestino != null) {
                        break;
                    }
                }

                String estadoDiscrepancia;
                String detalle;
                BigDecimal notaExistenteDestino100 = null;

                if (rolDestino != null) {
                    // Verificar si ya existe nota registrada en el grupo destino
                    boolean tieneNotaEnDestino = false;
                    ModalidadExamen modalidadDest = rolDestino.getModalidad();
                    if (modalidadDest == ModalidadExamen.PRESENCIAL_CARTILLA || modalidadDest == null) {
                        var calDest = calificacionOmrRepository.findByRolExamenIdAndCodigoEstudiante(rolDestino.getId(), codigo);
                        if (calDest.isPresent() && (calDest.get().getNotaSobre100() != null || Boolean.TRUE.equals(calDest.get().getEsReprogramado()))) {
                            tieneNotaEnDestino = true;
                            notaExistenteDestino100 = calDest.get().getNotaSobre100();
                        }
                    } else if (modalidadDest == ModalidadExamen.PRESENCIAL_SIN_CARTILLA) {
                        var ndDest = notaDocenteRepository.findByRolExamenIdAndCodigoEstudiante(rolDestino.getId(), codigo);
                        if (ndDest.isPresent() && (ndDest.get().getNotaSobre100() != null || Boolean.TRUE.equals(ndDest.get().getEsReprogramado()))) {
                            tieneNotaEnDestino = true;
                            notaExistenteDestino100 = ndDest.get().getNotaSobre100();
                        }
                    }

                    if (tieneNotaEnDestino) {
                        estadoDiscrepancia = "CONFLICTO_TIENE_NOTA_EN_DESTINO";
                        detalle = String.format("El estudiante ya cuenta con calificación (%s pts) en el grupo destino %s.",
                                notaExistenteDestino100 != null ? notaExistenteDestino100.toString() : "Reprogramado",
                                rolDestino.getGrupo());
                        totalConflictos++;
                    } else {
                        estadoDiscrepancia = "LISTO_PARA_TRASLADAR";
                        detalle = String.format("Inscrito oficialmente en SEA en grupo %s. Listo para transferir su nota.",
                                rolDestino.getGrupo());
                        totalListos++;
                    }
                } else {
                    estadoDiscrepancia = "NO_ENCONTRADO_EN_SEA";
                    detalle = "El estudiante no figura en la nómina de ningún grupo paralelo de esta asignatura en el Gateway SEA.";
                    totalNoEncontrados++;
                }

                String nombreEstudiante = est.nombreEstudiante();
                if ((nombreEstudiante == null || nombreEstudiante.isBlank() || "ESTUDIANTE".equals(nombreEstudiante))
                        && estudianteEnDestino != null && estudianteEnDestino.getFullName() != null) {
                    nombreEstudiante = estudianteEnDestino.getFullName();
                }

                DiscrepanciaGrupoItemDto item = DiscrepanciaGrupoItemDto.builder()
                        .codigoEstudiante(codigo)
                        .studentOldCode(parseStudentOldCode(codigo))
                        .nombreEstudiante(nombreEstudiante != null ? nombreEstudiante : "ESTUDIANTE")
                        .materiaCodigo(rolOrigen.getMateriaCodigo())
                        .materiaNombre(rolOrigen.getMateriaNombre())
                        .sedeCodigo(rolOrigen.getSedeCodigo())
                        .carreraCodigo(rolOrigen.getCarreraCodigo())
                        .tipoParcial(rolOrigen.getTipoParcial() != null ? rolOrigen.getTipoParcial().name() : "PRIMER_PARCIAL")
                        .rolExamenOrigenId(rolOrigen.getId())
                        .grupoOrigen(rolOrigen.getGrupo())
                        .seaGroupIdOrigen(rolOrigen.getSeaGroupId())
                        .rolExamenDestinoId(rolDestino != null ? rolDestino.getId() : null)
                        .grupoDestino(rolDestino != null ? rolDestino.getGrupo() : null)
                        .seaGroupIdDestino(rolDestino != null ? rolDestino.getSeaGroupId() : null)
                        .notaSobre60(est.notaSobre60())
                        .notaSobre100(est.notaSobre100())
                        .esReprogramado(est.esReprogramado())
                        .modalidad(rolOrigen.getModalidad() != null ? rolOrigen.getModalidad().name() : "PRESENCIAL_CARTILLA")
                        .estadoDiscrepancia(estadoDiscrepancia)
                        .detalle(detalle)
                        .notaExistenteDestino100(notaExistenteDestino100)
                        .build();

                discrepancias.add(item);
            }
        }

        discrepancias.sort(Comparator.comparing(DiscrepanciaGrupoItemDto::getMateriaCodigo)
                .thenComparing(DiscrepanciaGrupoItemDto::getGrupoOrigen)
                .thenComparing(DiscrepanciaGrupoItemDto::getCodigoEstudiante));

        return DiscrepanciaGrupoReporteDto.builder()
                .totalGruposAnalizados(rolesOrigen.size())
                .totalEstudiantesAnalizados(totalEstudiantesAnalizados)
                .totalConDiscrepancia(discrepancias.size())
                .totalListosParaTrasladar(totalListos)
                .totalConflictos(totalConflictos)
                .totalNoEncontradosEnSea(totalNoEncontrados)
                .fechaAnalisis(LocalDateTime.now())
                .analizadoPor(usuario)
                .discrepancias(discrepancias)
                .build();
    }

    /**
     * Ejecuta el traslado de calificaciones de estudiantes desde el grupo de origen hacia el grupo destino correcto.
     * Sincroniza la inscripción en el grupo destino si no existía, actualiza o crea la calificación,
     * marca sincronizado_sea = false para su posterior envío oficial, audita la operación y descuenta del origen.
     */
    @Transactional
    public TrasladoCalificacionesResultadoDto trasladarCalificaciones(
            TrasladoCalificacionesRequestDto request,
            Authentication auth,
            String ipOrigen) {

        String usuario = validarPermisos(auth);
        String ipValida = (ipOrigen != null && !ipOrigen.isBlank()) ? ipOrigen : "127.0.0.1";

        if (request == null || request.getTraslados() == null || request.getTraslados().isEmpty()) {
            throw new IllegalArgumentException("Debe proporcionar al menos un estudiante para trasladar.");
        }

        List<TrasladoCalificacionItemResultadoDto> resultados = new ArrayList<>();
        int exitosos = 0;
        int fallidos = 0;

        Set<String> rolesModificados = new HashSet<>();

        for (TrasladoCalificacionItemRequestDto traslado : request.getTraslados()) {
            String codigo = traslado.getCodigoEstudiante() != null ? traslado.getCodigoEstudiante().trim() : "";
            String rolOrigenId = traslado.getRolExamenOrigenId();
            String rolDestinoId = traslado.getRolExamenDestinoId();
            boolean sobrescribir = Boolean.TRUE.equals(traslado.getSobrescribirSiExiste());

            if (codigo.isBlank() || rolOrigenId == null || rolDestinoId == null) {
                fallidos++;
                resultados.add(TrasladoCalificacionItemResultadoDto.builder()
                        .codigoEstudiante(codigo)
                        .rolExamenOrigenId(rolOrigenId)
                        .rolExamenDestinoId(rolDestinoId)
                        .exitoso(false)
                        .mensaje("Parámetros incompletos para el traslado.")
                        .build());
                continue;
            }

            if (rolOrigenId.equals(rolDestinoId)) {
                fallidos++;
                resultados.add(TrasladoCalificacionItemResultadoDto.builder()
                        .codigoEstudiante(codigo)
                        .rolExamenOrigenId(rolOrigenId)
                        .rolExamenDestinoId(rolDestinoId)
                        .exitoso(false)
                        .mensaje("El grupo origen y el grupo destino son idénticos.")
                        .build());
                continue;
            }

            try {
                RolExamen rolOrigen = rolExamenRepository.findById(rolOrigenId)
                        .orElseThrow(() -> new IllegalArgumentException("Rol de examen origen no encontrado: " + rolOrigenId));
                RolExamen rolDestino = rolExamenRepository.findById(rolDestinoId)
                        .orElseThrow(() -> new IllegalArgumentException("Rol de examen destino no encontrado: " + rolDestinoId));

                // Validar correspondencia académica
                if (!rolOrigen.getMateriaCodigo().equalsIgnoreCase(rolDestino.getMateriaCodigo())
                        || !rolOrigen.getSedeCodigo().equalsIgnoreCase(rolDestino.getSedeCodigo())) {
                    throw new IllegalStateException(String.format(
                            "No se puede trasladar entre asignaturas o sedes distintas (%s/%s vs %s/%s).",
                            rolOrigen.getMateriaCodigo(), rolOrigen.getSedeCodigo(),
                            rolDestino.getMateriaCodigo(), rolDestino.getSedeCodigo()
                    ));
                }

                String nombreEstudiante = "ESTUDIANTE";
                BigDecimal nota100 = BigDecimal.ZERO;

                ModalidadExamen modalidad = rolOrigen.getModalidad();
                if (modalidad == ModalidadExamen.PRESENCIAL_CARTILLA || modalidad == null) {
                    CalificacionOmr calOrigen = calificacionOmrRepository
                            .findByRolExamenIdAndCodigoEstudiante(rolOrigenId, codigo)
                            .orElseThrow(() -> new IllegalStateException("No se encontró calificación OMR en el grupo origen para " + codigo));

                    nombreEstudiante = calOrigen.getEstudianteNombreCompleto();
                    nota100 = calOrigen.getNotaSobre100();

                    // Verificar si ya existe calificación en destino
                    Optional<CalificacionOmr> calDestOpt = calificacionOmrRepository
                            .findByRolExamenIdAndCodigoEstudiante(rolDestinoId, codigo);

                    if (calDestOpt.isPresent()) {
                        if (!sobrescribir) {
                            throw new IllegalStateException("El estudiante ya cuenta con calificación registrada en el grupo destino. Requiere confirmación para sobrescribir.");
                        }
                        calificacionOmrRepository.delete(calDestOpt.get());
                        calificacionOmrRepository.flush();
                    }

                    // Sincronizar nómina/mapeo de variantes en destino si no existe
                    sincronizarMapeoEnDestino(rolDestino, codigo, nombreEstudiante);

                    // Mover la calificación al rol destino
                    calOrigen.setRolExamenId(rolDestinoId);
                    calOrigen.setSincronizadoSea(false);
                    calOrigen.setFechaSincronizacionSea(null);
                    calOrigen.setSincronizadoSeaPor(null);
                    calOrigen.setProcesadoPor(usuario + " [Trasladado desde " + rolOrigen.getGrupo() + "]");
                    calificacionOmrRepository.save(calOrigen);

                    // Limpiar mapeo de variantes del grupo origen
                    limpiarMapeoOrigen(rolOrigen, codigo);

                } else if (modalidad == ModalidadExamen.PRESENCIAL_SIN_CARTILLA) {
                    NotaDocente ndOrigen = notaDocenteRepository
                            .findByRolExamenIdAndCodigoEstudiante(rolOrigenId, codigo)
                            .orElseThrow(() -> new IllegalStateException("No se encontró nota sin cartilla en el grupo origen para " + codigo));

                    nombreEstudiante = ndOrigen.getEstudianteNombreCompleto();
                    nota100 = ndOrigen.getNotaSobre100();

                    Optional<NotaDocente> ndDestOpt = notaDocenteRepository
                            .findByRolExamenIdAndCodigoEstudiante(rolDestinoId, codigo);

                    if (ndDestOpt.isPresent()) {
                        if (!sobrescribir) {
                            throw new IllegalStateException("El estudiante ya cuenta con nota en el grupo destino. Requiere confirmación para sobrescribir.");
                        }
                        notaDocenteRepository.delete(ndDestOpt.get());
                        notaDocenteRepository.flush();
                    }

                    ndOrigen.setRolExamenId(rolDestinoId);
                    ndOrigen.setSincronizadoSea(false);
                    ndOrigen.setFechaSincronizacionSea(null);
                    ndOrigen.setSincronizadoSeaPor(null);
                    ndOrigen.setGuardadoPor(usuario + " [Trasladado desde " + rolOrigen.getGrupo() + "]");
                    notaDocenteRepository.save(ndOrigen);
                }

                // Desmarcar sincronizado_sea en ambos roles para forzar nueva sincronización limpia al SEA
                rolOrigen.setSincronizadoSea(false);
                rolDestino.setSincronizadoSea(false);
                rolExamenRepository.save(rolOrigen);
                rolExamenRepository.save(rolDestino);

                rolesModificados.add(rolOrigenId);
                rolesModificados.add(rolDestinoId);

                // Registrar auditoría inmutable
                registrarAuditoriaTraslado(rolOrigen, rolDestino, codigo, nombreEstudiante, nota100, usuario, ipValida);

                exitosos++;
                resultados.add(TrasladoCalificacionItemResultadoDto.builder()
                        .codigoEstudiante(codigo)
                        .nombreEstudiante(nombreEstudiante)
                        .rolExamenOrigenId(rolOrigenId)
                        .grupoOrigen(rolOrigen.getGrupo())
                        .rolExamenDestinoId(rolDestinoId)
                        .grupoDestino(rolDestino.getGrupo())
                        .exitoso(true)
                        .mensaje(String.format("Calificación (%s pts) trasladada con éxito de %s a %s.",
                                nota100 != null ? nota100.toString() : "0", rolOrigen.getGrupo(), rolDestino.getGrupo()))
                        .build());

            } catch (Exception ex) {
                log.error("Fallo al trasladar calificación de {} desde {} a {}: {}", codigo, rolOrigenId, rolDestinoId, ex.getMessage(), ex);
                fallidos++;
                resultados.add(TrasladoCalificacionItemResultadoDto.builder()
                        .codigoEstudiante(codigo)
                        .rolExamenOrigenId(rolOrigenId)
                        .rolExamenDestinoId(rolDestinoId)
                        .exitoso(false)
                        .mensaje(ex.getMessage())
                        .build());
            }
        }

        return TrasladoCalificacionesResultadoDto.builder()
                .totalSolicitados(request.getTraslados().size())
                .totalExitosos(exitosos)
                .totalFallidos(fallidos)
                .fechaEjecucion(LocalDateTime.now())
                .ejecutadoPor(usuario)
                .resultados(resultados)
                .build();
    }

    // =========================================================================
    // Métodos auxiliares
    // =========================================================================

    private void sincronizarMapeoEnDestino(RolExamen rolDestino, String codigoEstudiante, String nombreCompleto) {
        if (mapeoRepository == null) return;

        Optional<MapeoEstudianteVariante> existente = mapeoRepository
                .findByRolExamenIdAndCodigoEstudiante(rolDestino.getId(), codigoEstudiante);

        if (existente.isPresent()) {
            return;
        }

        // Obtener variantes disponibles en el rol destino para balanceo de letras
        List<ExamenVariante> variantes = varianteRepository.findByRolExamenId(rolDestino.getId());
        List<MapeoEstudianteVariante> mapeosActuales = mapeoRepository.findByRolExamenId(rolDestino.getId());

        Map<String, Long> conteoPorLetra = mapeosActuales.stream()
                .filter(m -> m.getLetraVariante() != null)
                .collect(Collectors.groupingBy(MapeoEstudianteVariante::getLetraVariante, Collectors.counting()));

        ExamenVariante varianteAsignada = null;
        if (!variantes.isEmpty()) {
            varianteAsignada = variantes.stream()
                    .min(Comparator.comparingLong((ExamenVariante v) -> conteoPorLetra.getOrDefault(v.getLetraVariante(), 0L))
                            .thenComparing(ExamenVariante::getLetraVariante))
                    .orElse(variantes.get(0));
        }

        String letra = varianteAsignada != null ? varianteAsignada.getLetraVariante() : "A";
        String varianteId = varianteAsignada != null ? varianteAsignada.getId() : String.format("VAR-%s-%s", rolDestino.getId(), letra);

        MapeoEstudianteVariante nuevoMapeo = new MapeoEstudianteVariante();
        nuevoMapeo.setRolExamenId(rolDestino.getId());
        nuevoMapeo.setVarianteId(varianteId);
        nuevoMapeo.setCodigoEstudiante(codigoEstudiante);
        nuevoMapeo.setNombres(nombreCompleto != null ? nombreCompleto : codigoEstudiante);
        nuevoMapeo.setApellidoPaterno("");
        nuevoMapeo.setApellidoMaterno("");
        nuevoMapeo.setLetraVariante(letra);
        nuevoMapeo.setHashControlSeguridad("CTL-" + codigoEstudiante + "-" + letra);
        nuevoMapeo.setCuadernilloIndividualPdf(null);
        nuevoMapeo.setEstadoAsistencia("PRESENTE");
        mapeoRepository.save(nuevoMapeo);

        int inscritos = rolDestino.getEstudiantesInscritosCount() != null ? rolDestino.getEstudiantesInscritosCount() : 0;
        rolDestino.setEstudiantesInscritosCount(inscritos + 1);
        rolExamenRepository.save(rolDestino);
    }

    private void limpiarMapeoOrigen(RolExamen rolOrigen, String codigoEstudiante) {
        if (mapeoRepository == null) return;
        mapeoRepository.findByRolExamenIdAndCodigoEstudiante(rolOrigen.getId(), codigoEstudiante)
                .ifPresent(m -> {
                    mapeoRepository.delete(m);
                    int count = rolOrigen.getEstudiantesInscritosCount() != null ? rolOrigen.getEstudiantesInscritosCount() : 1;
                    rolOrigen.setEstudiantesInscritosCount(Math.max(0, count - 1));
                    rolExamenRepository.save(rolOrigen);
                });
    }

    private void registrarAuditoriaTraslado(
            RolExamen rolOrigen,
            RolExamen rolDestino,
            String codigoEstudiante,
            String nombreEstudiante,
            BigDecimal nota,
            String usuario,
            String ipValida) {

        try {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("codigoEstudiante", codigoEstudiante);
            data.put("nombreEstudiante", nombreEstudiante);
            data.put("materia", rolOrigen.getMateriaNombre());
            data.put("materiaCodigo", rolOrigen.getMateriaCodigo());
            data.put("grupoOrigen", rolOrigen.getGrupo());
            data.put("grupoDestino", rolDestino.getGrupo());
            data.put("rolOrigenId", rolOrigen.getId());
            data.put("rolDestinoId", rolDestino.getId());
            data.put("nota100", nota);
            data.put("fecha", LocalDateTime.now().toString());

            String json = objectMapper.writeValueAsString(data);

            // Auditoría en rol origen
            auditoriaRepository.save(AuditoriaEvaluacion.builder()
                    .rolExamen(rolOrigen)
                    .etapaOrigen(rolOrigen.getEstadoFlujo().getValor())
                    .etapaDestino(rolOrigen.getEstadoFlujo().getValor())
                    .accion("TRASLADO_CALIFICACION_ORIGEN")
                    .usuario(usuario)
                    .ipOrigen(ipValida)
                    .detallesJson(json)
                    .build());

            // Auditoría en rol destino
            auditoriaRepository.save(AuditoriaEvaluacion.builder()
                    .rolExamen(rolDestino)
                    .etapaOrigen(rolDestino.getEstadoFlujo().getValor())
                    .etapaDestino(rolDestino.getEstadoFlujo().getValor())
                    .accion("TRASLADO_CALIFICACION_DESTINO")
                    .usuario(usuario)
                    .ipOrigen(ipValida)
                    .detallesJson(json)
                    .build());

        } catch (Exception e) {
            log.warn("No se pudo registrar auditoría de traslado para estudiante {}: {}", codigoEstudiante, e.getMessage());
        }
    }

    private List<StudentItemDto> obtenerNominaGateway(String seaGroupId, Map<String, List<StudentItemDto>> cache) {
        if (seaGroupId == null || seaGroupId.isBlank()) {
            return List.of();
        }
        if (cache.containsKey(seaGroupId)) {
            return cache.get(seaGroupId);
        }
        try {
            List<StudentItemDto> lista = unitepcGatewayClient.getStudentsByGroup(seaGroupId);
            if (lista == null) lista = List.of();
            cache.put(seaGroupId, lista);
            return lista;
        } catch (org.springframework.web.client.ResourceAccessException e) {
            log.error("Fallo de conexión o timeout con Gateway SEA para groupId={}: {}", seaGroupId, e.getMessage());
            throw new IllegalStateException("No se pudo conectar con el Gateway SEA (gw-dev.unitepc.solutions). Verifique la conectividad de red o VPN institucional (" + e.getMessage() + ")", e);
        } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
            log.warn("El grupo groupId={} no fue encontrado en el Gateway SEA (404)", seaGroupId);
            cache.put(seaGroupId, List.of());
            return List.of();
        } catch (Exception e) {
            log.error("Error al obtener la nómina oficial del Gateway SEA para groupId={}: {}", seaGroupId, e.getMessage());
            throw new IllegalStateException("Error al consultar nómina oficial en Gateway SEA (groupId=" + seaGroupId + "): " + e.getMessage(), e);
        }
    }

    private record EstudianteEvaluado(
            String codigoEstudiante,
            String nombreEstudiante,
            BigDecimal notaSobre60,
            BigDecimal notaSobre100,
            Boolean esReprogramado
    ) {}

    private List<EstudianteEvaluado> extraerEstudiantesEvaluados(RolExamen rol) {
        ModalidadExamen modalidad = rol.getModalidad();
        List<EstudianteEvaluado> lista = new ArrayList<>();

        if (modalidad == ModalidadExamen.PRESENCIAL_CARTILLA || modalidad == null) {
            List<CalificacionOmr> calificaciones = calificacionOmrRepository
                    .findByRolExamenIdOrderByCodigoEstudianteAsc(rol.getId());
            for (CalificacionOmr c : calificaciones) {
                if (c.getNotaSobre100() != null || Boolean.TRUE.equals(c.getEsReprogramado())) {
                    lista.add(new EstudianteEvaluado(
                            c.getCodigoEstudiante(),
                            c.getEstudianteNombreCompleto(),
                            c.getNotaSobre60(),
                            c.getNotaSobre100(),
                            Boolean.TRUE.equals(c.getEsReprogramado())
                    ));
                }
            }
        } else if (modalidad == ModalidadExamen.PRESENCIAL_SIN_CARTILLA) {
            List<NotaDocente> notas = notaDocenteRepository.findByRolExamenId(rol.getId());
            for (NotaDocente n : notas) {
                if (n.getNotaSobre100() != null || Boolean.TRUE.equals(n.getEsReprogramado())) {
                    lista.add(new EstudianteEvaluado(
                            n.getCodigoEstudiante(),
                            n.getEstudianteNombreCompleto(),
                            n.getNotaSobre60(),
                            n.getNotaSobre100(),
                            Boolean.TRUE.equals(n.getEsReprogramado())
                    ));
                }
            }
        }
        return lista;
    }

    private Long parseStudentOldCode(String codigoEstudiante) {
        if (codigoEstudiante == null || codigoEstudiante.isBlank()) return null;
        String digitsOnly = codigoEstudiante.replaceAll("\\D+", "");
        if (digitsOnly.isBlank()) return null;
        try {
            return Long.parseLong(digitsOnly);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String validarPermisos(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Usuario no autenticado");
        }
        boolean autorizado = auth.getAuthorities().stream().anyMatch(a ->
                "ROLE_ADMINISTRADOR_SISTEMA".equals(a.getAuthority()) ||
                "ROLE_RESPONSABLE_EVALUACIONES".equals(a.getAuthority()) ||
                "ROLE_DIRECTOR_CARRERA".equals(a.getAuthority())
        );
        if (!autorizado) {
            throw new AccessDeniedException("No tiene permisos para auditar o reasignar calificaciones con el SEA.");
        }
        return auth.getName();
    }
}
