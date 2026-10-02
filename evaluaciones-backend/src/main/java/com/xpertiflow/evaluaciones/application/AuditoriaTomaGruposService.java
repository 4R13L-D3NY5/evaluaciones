package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.AuditoriaGlobalItemDto;
import com.xpertiflow.evaluaciones.api.dto.auditoria.AuditoriaEstudianteGlobalDto;
import com.xpertiflow.evaluaciones.api.dto.auditoria.AuditoriaEvaluacionItemDto;
import com.xpertiflow.evaluaciones.api.dto.auditoria.AuditoriaTomaGrupoEstudianteDto;
import com.xpertiflow.evaluaciones.api.dto.auditoria.AuditoriaTomaGrupoReporteDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.StudentItemDto;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import com.xpertiflow.evaluaciones.domain.entity.CalificacionOmr;
import com.xpertiflow.evaluaciones.domain.entity.MapeoEstudianteVariante;
import com.xpertiflow.evaluaciones.domain.entity.NotaDocente;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.CalificacionOmrRepository;
import com.xpertiflow.evaluaciones.domain.repository.MapeoEstudianteVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.NotaDocenteRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditoriaTomaGruposService {

    private final UnitepcGatewayClient unitepcGatewayClient;
    private final RolExamenRepository rolExamenRepository;
    private final MapeoEstudianteVarianteRepository mapeoRepository;
    private final AuditoriaEvaluacionRepository auditoriaRepository;
    private final CalificacionOmrRepository calificacionOmrRepository;
    private final NotaDocenteRepository notaDocenteRepository;
    private final AuditoriaService auditoriaService;

    private static final ZoneId ZONA_BOLIVIA = ZoneId.of("America/La_Paz");
    private static final DateTimeFormatter FORMATO_FECHA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    @Transactional(readOnly = true)
    public List<AuditoriaEvaluacionItemDto> buscarEvaluaciones(String criterio, String sede, String carrera) {
        log.info("Buscando evaluaciones para auditoría forense. Criterio: '{}', Sede: '{}', Carrera: '{}'", criterio, sede, carrera);

        List<RolExamen> roles = rolExamenRepository.findAll();

        String crit = (criterio != null && !criterio.isBlank()) ? criterio.trim().toLowerCase() : null;
        String sed = (sede != null && !sede.isBlank() && !sede.equalsIgnoreCase("TODAS")) ? sede.trim().toLowerCase() : null;
        String car = (carrera != null && !carrera.isBlank() && !carrera.equalsIgnoreCase("TODAS")) ? carrera.trim().toLowerCase() : null;

        return roles.stream()
                .filter(r -> {
                    if (sed != null) {
                        boolean matchSede = (r.getSedeCodigo() != null && r.getSedeCodigo().toLowerCase().contains(sed))
                                || (r.getSedeNombre() != null && r.getSedeNombre().toLowerCase().contains(sed));
                        if (!matchSede) return false;
                    }
                    if (car != null) {
                        boolean matchCarrera = (r.getCarreraCodigo() != null && r.getCarreraCodigo().toLowerCase().contains(car))
                                || (r.getCarreraNombre() != null && r.getCarreraNombre().toLowerCase().contains(car));
                        if (!matchCarrera) return false;
                    }
                    if (crit != null) {
                        return (r.getMateriaNombre() != null && r.getMateriaNombre().toLowerCase().contains(crit))
                                || (r.getMateriaCodigo() != null && r.getMateriaCodigo().toLowerCase().contains(crit))
                                || (r.getGrupo() != null && r.getGrupo().toLowerCase().contains(crit))
                                || (r.getDocenteNombre() != null && r.getDocenteNombre().toLowerCase().contains(crit))
                                || (r.getSedeNombre() != null && r.getSedeNombre().toLowerCase().contains(crit))
                                || (r.getCampus() != null && r.getCampus().toLowerCase().contains(crit))
                                || (r.getSeaGroupId() != null && r.getSeaGroupId().toLowerCase().contains(crit))
                                || (r.getId() != null && r.getId().toLowerCase().contains(crit));
                    }
                    return true;
                })
                .sorted(Comparator.comparing(RolExamen::getFecha, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(RolExamen::getMateriaNombre, Comparator.nullsLast(String::compareToIgnoreCase)))
                .limit(200)
                .map(r -> AuditoriaEvaluacionItemDto.builder()
                        .rolExamenId(r.getId())
                        .materiaCodigo(r.getMateriaCodigo())
                        .materiaNombre(r.getMateriaNombre())
                        .grupo(r.getGrupo())
                        .carreraCodigo(r.getCarreraCodigo())
                        .carreraNombre(r.getCarreraNombre())
                        .sedeNombre(r.getSedeNombre())
                        .campus(r.getCampus())
                        .docenteNombre(r.getDocenteNombre())
                        .estadoFlujo(r.getEstadoFlujo() != null ? r.getEstadoFlujo().name() : null)
                        .modalidad(r.getModalidad() != null ? r.getModalidad().name() : null)
                        .estudiantesInscritosCount(r.getEstudiantesInscritosCount())
                        .seaGroupId(r.getSeaGroupId())
                        .fechaGeneracion(r.getFechaGeneracion())
                        .fechaExamen(r.getFecha())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AuditoriaTomaGrupoReporteDto obtenerAuditoriaPorGrupo(String groupId) {
        log.info("Iniciando auditoría de toma de grupos y peritaje para groupId: {}", groupId);

        Optional<RolExamen> rolOpt = rolExamenRepository.findTopBySeaGroupIdOrderByVersionDesc(groupId);
        if (rolOpt.isEmpty()) {
            rolOpt = rolExamenRepository.findAll().stream()
                    .filter(r -> groupId.equalsIgnoreCase(r.getGrupo()) || groupId.equalsIgnoreCase(r.getSeaGroupId()))
                    .findFirst();
        }

        return procesarAuditoriaGrupo(groupId, rolOpt.orElse(null));
    }

    @Transactional(readOnly = true)
    public AuditoriaTomaGrupoReporteDto obtenerAuditoriaPorRol(String rolExamenId) {
        log.info("Iniciando auditoría de toma de grupos y peritaje para rolExamenId: {}", rolExamenId);

        RolExamen rol = rolExamenRepository.findById(rolExamenId)
                .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + rolExamenId));

        String groupId = rol.getSeaGroupId() != null && !rol.getSeaGroupId().isBlank()
                ? rol.getSeaGroupId() : rol.getGrupo();

        if (groupId == null || groupId.isBlank()) {
            groupId = "ROL-" + rolExamenId;
        }

        return procesarAuditoriaGrupo(groupId, rol);
    }

    private AuditoriaTomaGrupoReporteDto procesarAuditoriaGrupo(String groupId, RolExamen rol) {
        String rolExamenId = rol != null ? rol.getId() : null;

        // 1. Obtener nómina en vivo del Gateway si groupId es institucional
        List<StudentItemDto> estudiantesGateway = Collections.emptyList();
        if (groupId != null && !groupId.startsWith("ROL-")) {
            try {
                estudiantesGateway = unitepcGatewayClient.getStudentsByGroup(groupId);
            } catch (Exception ex) {
                log.error("Error al obtener estudiantes del Gateway para groupId {}: {}", groupId, ex.getMessage());
            }
        }

        OffsetDateTime fechaGeneracion = rol != null && rol.getFechaGeneracion() != null
                ? rol.getFechaGeneracion().atZone(ZONA_BOLIVIA).toOffsetDateTime()
                : null;

        OffsetDateTime fechaImpresion = null;
        Map<String, MapeoEstudianteVariante> mapeosPorCodigo = new HashMap<>();
        Map<String, CalificacionOmr> califsPorCodigo = new HashMap<>();
        Map<String, NotaDocente> notasPorCodigo = new HashMap<>();
        List<AuditoriaGlobalItemDto> eventosAuditoriaDto = new ArrayList<>();
        List<AuditoriaEvaluacion> eventosRol = Collections.emptyList();

        if (rolExamenId != null) {
            // Buscar fecha de impresión en auditoría inmutable
            Optional<AuditoriaEvaluacion> audImpresion = auditoriaRepository
                    .findFirstByRolExamenIdAndAccionOrderByFechaEventoDesc(rolExamenId, "IMPRESION_MARCAS_OMR");
            if (audImpresion.isEmpty()) {
                audImpresion = auditoriaRepository
                        .findFirstByRolExamenIdAndAccionOrderByFechaEventoDesc(rolExamenId, "IMPRESION_LOTES_CARTILLAS");
            }
            if (audImpresion.isPresent() && audImpresion.get().getFechaEvento() != null) {
                fechaImpresion = audImpresion.get().getFechaEvento().atZone(ZONA_BOLIVIA).toOffsetDateTime();
            }

            // Cargar mapeos de variantes
            List<MapeoEstudianteVariante> mapeos = mapeoRepository.findByRolExamenId(rolExamenId);
            for (MapeoEstudianteVariante m : mapeos) {
                if (m.getCodigoEstudiante() != null) {
                    mapeosPorCodigo.put(m.getCodigoEstudiante().trim().toUpperCase(), m);
                }
            }

            // Cargar calificaciones OMR
            List<CalificacionOmr> califs = calificacionOmrRepository.findByRolExamenIdOrderByCodigoEstudianteAsc(rolExamenId);
            for (CalificacionOmr c : califs) {
                if (c.getCodigoEstudiante() != null) {
                    califsPorCodigo.put(c.getCodigoEstudiante().trim().toUpperCase(), c);
                }
            }

            // Cargar notas docentes
            List<NotaDocente> notas = notaDocenteRepository.findByRolExamenId(rolExamenId);
            for (NotaDocente nd : notas) {
                if (nd.getCodigoEstudiante() != null) {
                    notasPorCodigo.put(nd.getCodigoEstudiante().trim().toUpperCase(), nd);
                }
            }

            // Cargar eventos de auditoría específicos del rol
            eventosRol = auditoriaRepository.findByRolExamenIdOrderByFechaEventoDesc(rolExamenId);
            for (AuditoriaEvaluacion ev : eventosRol) {
                eventosAuditoriaDto.add(auditoriaService.mapearEvaluacion(ev, rol));
            }
        }

        // 3. Procesar y unificar nómina de estudiantes (Gateway + Mapeos + OMR + Notas Docentes)
        Set<String> codigosProcesados = new HashSet<>();
        List<AuditoriaTomaGrupoEstudianteDto> estudiantesDto = new ArrayList<>();
        int regulares = 0;
        int tardios = 0;
        int extemporaneos = 0;

        // A. Estudiantes del Gateway
        if (estudiantesGateway != null) {
            for (StudentItemDto est : estudiantesGateway) {
                String codigo = est.getStudentCode() != null ? est.getStudentCode().trim() : "";
                if (codigo.isBlank() || !codigosProcesados.add(codigo.toUpperCase())) continue;

                MapeoEstudianteVariante mapeo = mapeosPorCodigo.get(codigo.toUpperCase());
                OffsetDateTime enrollCreated = est.getEnrollCreatedAt() != null ? est.getEnrollCreatedAt() : (mapeo != null ? mapeo.getSeaEnrollCreatedAt() : null);
                OffsetDateTime enrollUpdated = est.getEnrollUpdatedAt() != null ? est.getEnrollUpdatedAt() : (mapeo != null ? mapeo.getSeaEnrollUpdatedAt() : null);

                AuditoriaTomaGrupoEstudianteDto dto = construirEstudianteDto(
                        codigo, est.getFullName(), est.getCourseState(), groupId, rol, rolExamenId,
                        fechaGeneracion, fechaImpresion, enrollCreated, enrollUpdated,
                        mapeo, califsPorCodigo.get(codigo.toUpperCase()), notasPorCodigo.get(codigo.toUpperCase()), eventosRol);

                if ("REGULAR".equals(dto.getEstadoForense())) regulares++;
                else if ("TOMA_TARDIA".equals(dto.getEstadoForense())) tardios++;
                else if ("EXTEMPORANEO_POST_IMPRESION".equals(dto.getEstadoForense())) extemporaneos++;

                estudiantesDto.add(dto);
            }
        }

        // B. Estudiantes del Mapeo no presentes en Gateway
        for (Map.Entry<String, MapeoEstudianteVariante> entry : mapeosPorCodigo.entrySet()) {
            String codigo = entry.getKey();
            if (!codigosProcesados.add(codigo)) continue;

            MapeoEstudianteVariante m = entry.getValue();
            String nombreCompleto = (m.getNombres() != null ? m.getNombres().trim() : "") +
                    (m.getApellidoPaterno() != null ? " " + m.getApellidoPaterno().trim() : "") +
                    (m.getApellidoMaterno() != null ? " " + m.getApellidoMaterno().trim() : "");
            nombreCompleto = nombreCompleto.trim().isEmpty() ? codigo : nombreCompleto.trim();

            AuditoriaTomaGrupoEstudianteDto dto = construirEstudianteDto(
                    m.getCodigoEstudiante(), nombreCompleto, m.getEstadoAsistencia() != null ? m.getEstadoAsistencia() : "REGULAR",
                    groupId, rol, rolExamenId, fechaGeneracion, fechaImpresion,
                    m.getSeaEnrollCreatedAt(), m.getSeaEnrollUpdatedAt(),
                    m, califsPorCodigo.get(codigo), notasPorCodigo.get(codigo), eventosRol);

            if ("REGULAR".equals(dto.getEstadoForense())) regulares++;
            else if ("TOMA_TARDIA".equals(dto.getEstadoForense())) tardios++;
            else if ("EXTEMPORANEO_POST_IMPRESION".equals(dto.getEstadoForense())) extemporaneos++;

            estudiantesDto.add(dto);
        }

        // C. Estudiantes en Calificaciones OMR no presentes en nómina previa
        for (Map.Entry<String, CalificacionOmr> entry : califsPorCodigo.entrySet()) {
            String codigo = entry.getKey();
            if (!codigosProcesados.add(codigo)) continue;

            CalificacionOmr c = entry.getValue();
            AuditoriaTomaGrupoEstudianteDto dto = construirEstudianteDto(
                    c.getCodigoEstudiante(), c.getEstudianteNombreCompleto(), "CALIFICADO",
                    groupId, rol, rolExamenId, fechaGeneracion, fechaImpresion,
                    null, null,
                    null, c, notasPorCodigo.get(codigo), eventosRol);

            estudiantesDto.add(dto);
        }

        // D. Estudiantes en Notas Docentes no presentes en nómina previa
        for (Map.Entry<String, NotaDocente> entry : notasPorCodigo.entrySet()) {
            String codigo = entry.getKey();
            if (!codigosProcesados.add(codigo)) continue;

            NotaDocente nd = entry.getValue();
            AuditoriaTomaGrupoEstudianteDto dto = construirEstudianteDto(
                    nd.getCodigoEstudiante(), nd.getEstudianteNombreCompleto(), "NOTA_DOCENTE",
                    groupId, rol, rolExamenId, fechaGeneracion, fechaImpresion,
                    null, null,
                    null, null, nd, eventosRol);

            estudiantesDto.add(dto);
        }

        // Métricas de calificaciones y alteraciones
        int totalCalificados = 0;
        int totalAprobados = 0;
        int totalReprobados = 0;
        int totalReprogramados = 0;
        int totalAjustados = 0;

        for (AuditoriaTomaGrupoEstudianteDto e : estudiantesDto) {
            if (e.getNotaSobre100() != null || "APROBADO".equalsIgnoreCase(e.getEstadoCalificacion()) || "REPROBADO".equalsIgnoreCase(e.getEstadoCalificacion())) {
                totalCalificados++;
            }
            if ("APROBADO".equalsIgnoreCase(e.getEstadoCalificacion())) {
                totalAprobados++;
            } else if ("REPROBADO".equalsIgnoreCase(e.getEstadoCalificacion())) {
                totalReprobados++;
            }
            if (Boolean.TRUE.equals(e.getEsReprogramado())) {
                totalReprogramados++;
            }
            if (Boolean.TRUE.equals(e.getModificadoManualmente())) {
                totalAjustados++;
            }
        }

        // Ordenar: primero incidentes (extemporáneos, reprogramados, ajustados, tardíos) y luego alfabéticamente
        estudiantesDto.sort(Comparator
                .comparingInt(this::prioridadForenseEstudiante)
                .thenComparing(AuditoriaTomaGrupoEstudianteDto::getFullName, Comparator.nullsLast(String::compareToIgnoreCase)));

        return AuditoriaTomaGrupoReporteDto.builder()
                .groupId(groupId)
                .groupCode(rol != null ? rol.getGrupo() : null)
                .syllabusCourseId(rol != null ? rol.getMateriaCodigo() : null)
                .materiaNombre(rol != null && rol.getMateriaNombre() != null ? rol.getMateriaNombre() : "GRUPO ASIGNADO")
                .carreraCodigo(rol != null ? rol.getCarreraCodigo() : null)
                .carreraNombre(rol != null ? rol.getCarreraNombre() : null)
                .sedeNombre(rol != null ? rol.getSedeNombre() : null)
                .docenteNombre(rol != null ? rol.getDocenteNombre() : null)
                .term("2-2026")
                .rolExamenId(rolExamenId)
                .estadoExamen(rol != null && rol.getEstadoFlujo() != null ? rol.getEstadoFlujo().name() : "NO_PROGRAMADO")
                .fechaGeneracionExamen(fechaGeneracion)
                .fechaImpresionExamen(fechaImpresion)
                .totalEstudiantes(estudiantesDto.size())
                .totalRegulares(regulares)
                .totalTardios(tardios)
                .totalExtemporaneos(extemporaneos)
                .totalCalificados(totalCalificados)
                .totalAprobados(totalAprobados)
                .totalReprobados(totalReprobados)
                .totalReprogramados(totalReprogramados)
                .totalAjustados(totalAjustados)
                .eventosAuditoria(eventosAuditoriaDto)
                .estudiantes(estudiantesDto)
                .build();
    }

    private AuditoriaTomaGrupoEstudianteDto construirEstudianteDto(
            String codigo, String fullName, String courseState, String groupId, RolExamen rol, String rolExamenId,
            OffsetDateTime fechaGeneracion, OffsetDateTime fechaImpresion,
            OffsetDateTime enrollCreated, OffsetDateTime enrollUpdated,
            MapeoEstudianteVariante mapeo, CalificacionOmr calif, NotaDocente notaDoc,
            List<AuditoriaEvaluacion> eventosRol) {

        DictamenForense dictamen = evaluarDictamenForense(enrollCreated, enrollUpdated, fechaGeneracion, fechaImpresion);

        BigDecimal notaSobre100 = null;
        BigDecimal notaSobre60 = null;
        String estadoCalificacion = "PENDIENTE";
        String origenCalificacion = "PENDIENTE";
        Boolean esReprogramado = false;
        String reprogramadoPor = null;
        LocalDateTime fechaReprogramacion = null;
        String motivoReprogramacion = null;
        String comprobanteReprogramacion = null;
        String observacionReprogramacion = null;
        String procesadoPor = null;
        LocalDateTime fechaProcesamiento = null;
        Boolean modificadoManualmente = false;
        String detalleAjusteManual = null;

        // Buscar si existe evento de ajuste para este estudiante
        Optional<AuditoriaEvaluacion> eventoAjuste = Optional.empty();
        if (eventosRol != null && codigo != null && !codigo.isBlank()) {
            eventoAjuste = eventosRol.stream()
                    .filter(e -> e.getDetallesJson() != null && e.getDetallesJson().contains(codigo) &&
                            ("CALIFICACION_OMR_AJUSTADA".equalsIgnoreCase(e.getAccion()) ||
                             (e.getAccion() != null && e.getAccion().toUpperCase().contains("AJUSTE"))))
                    .findFirst();
        }

        if (calif != null) {
            notaSobre100 = calif.getNotaSobre100();
            notaSobre60 = calif.getNotaSobre60();
            estadoCalificacion = calif.getEstadoCalificacion();
            if (estadoCalificacion == null || estadoCalificacion.isBlank()) {
                if (notaSobre100 != null) {
                    estadoCalificacion = notaSobre100.compareTo(BigDecimal.valueOf(51)) >= 0 ? "APROBADO" : "REPROBADO";
                } else {
                    estadoCalificacion = "PENDIENTE";
                }
            }

            procesadoPor = calif.getProcesadoPor();
            fechaProcesamiento = calif.getFechaProcesamiento();

            if (Boolean.TRUE.equals(calif.getEsReprogramado())) {
                esReprogramado = true;
                reprogramadoPor = calif.getReprogramadoPor();
                fechaReprogramacion = calif.getFechaReprogramacion();
                motivoReprogramacion = calif.getMotivoReprogramacion();
                comprobanteReprogramacion = calif.getComprobanteReprogramacion();
                observacionReprogramacion = calif.getObservacionReprogramacion();
                origenCalificacion = "EXAMEN_ORAL_REPROGRAMADO";
            }

            boolean esAjustePorProcesador = (procesadoPor != null && procesadoPor.toUpperCase().contains("AJUSTE"));
            if (eventoAjuste.isPresent() || esAjustePorProcesador) {
                modificadoManualmente = true;
                if (!esReprogramado) {
                    origenCalificacion = "AJUSTADO_MANUAL";
                }
                detalleAjusteManual = eventoAjuste.isPresent()
                        ? ("Ajuste por " + eventoAjuste.get().getUsuario() + ": " + eventoAjuste.get().getDetallesJson())
                        : ("Ajuste manual registrado en procesadoPor: " + procesadoPor);
            } else if (!esReprogramado) {
                origenCalificacion = "OMR_AUTOMATICO";
            }
        } else if (notaDoc != null) {
            notaSobre100 = notaDoc.getNotaSobre100();
            notaSobre60 = notaDoc.getNotaSobre60();
            if (notaSobre100 != null) {
                estadoCalificacion = notaSobre100.compareTo(BigDecimal.valueOf(51)) >= 0 ? "APROBADO" : "REPROBADO";
            } else {
                estadoCalificacion = "PENDIENTE";
            }
            origenCalificacion = "DOCENTE_SIN_CARTILLA";
            procesadoPor = notaDoc.getGuardadoPor();
            fechaProcesamiento = notaDoc.getGuardadoEn();
        } else {
            estadoCalificacion = "PENDIENTE";
            origenCalificacion = "PENDIENTE";
        }

        return AuditoriaTomaGrupoEstudianteDto.builder()
                .studentCode(codigo)
                .fullName(fullName)
                .courseState(courseState)
                .groupId(groupId)
                .groupCode(rol != null ? rol.getGrupo() : null)
                .syllabusCourseId(rol != null ? rol.getMateriaCodigo() : null)
                .materiaNombre(rol != null ? rol.getMateriaNombre() : null)
                .carreraCodigo(rol != null ? rol.getCarreraCodigo() : null)
                .carreraNombre(rol != null ? rol.getCarreraNombre() : null)
                .sedeNombre(rol != null ? rol.getSedeNombre() : null)
                .docenteNombre(rol != null ? rol.getDocenteNombre() : null)
                .enrollCreatedAt(enrollCreated)
                .enrollUpdatedAt(enrollUpdated)
                .rolExamenId(rolExamenId)
                .estadoExamen(rol != null && rol.getEstadoFlujo() != null ? rol.getEstadoFlujo().name() : "NO_PROGRAMADO")
                .fechaGeneracionExamen(fechaGeneracion)
                .fechaImpresionExamen(fechaImpresion)
                .letraVariante(mapeo != null ? mapeo.getLetraVariante() : (calif != null ? calif.getLetraVariante() : null))
                .estadoForense(dictamen.estado)
                .nivelAlerta(dictamen.nivelAlerta)
                .mensajeForense(dictamen.mensaje)
                .diferenciaMinutosConGeneracion(dictamen.diferenciaMinutos)
                .notaSobre100(notaSobre100)
                .notaSobre60(notaSobre60)
                .estadoCalificacion(estadoCalificacion)
                .origenCalificacion(origenCalificacion)
                .esReprogramado(esReprogramado)
                .reprogramadoPor(reprogramadoPor)
                .fechaReprogramacion(fechaReprogramacion)
                .motivoReprogramacion(motivoReprogramacion)
                .comprobanteReprogramacion(comprobanteReprogramacion)
                .observacionReprogramacion(observacionReprogramacion)
                .procesadoPor(procesadoPor)
                .fechaProcesamiento(fechaProcesamiento)
                .modificadoManualmente(modificadoManualmente)
                .detalleAjusteManual(detalleAjusteManual)
                .build();
    }

    private int prioridadForenseEstudiante(AuditoriaTomaGrupoEstudianteDto e) {
        if ("EXTEMPORANEO_POST_IMPRESION".equals(e.getEstadoForense())) return 0;
        if (Boolean.TRUE.equals(e.getEsReprogramado())) return 1;
        if (Boolean.TRUE.equals(e.getModificadoManualmente())) return 2;
        if ("TOMA_TARDIA".equals(e.getEstadoForense())) return 3;
        if ("DANGER".equalsIgnoreCase(e.getNivelAlerta())) return 4;
        if ("WARNING".equalsIgnoreCase(e.getNivelAlerta())) return 5;
        return 6;
    }

    @Transactional(readOnly = true)
    public AuditoriaEstudianteGlobalDto buscarPorEstudiante(String studentCode, String term) {
        String cleanCode = studentCode != null ? studentCode.trim() : "";
        if (cleanCode.isBlank()) {
            throw new IllegalArgumentException("El código de estudiante no puede estar vacío");
        }

        log.info("Buscando historial de inscripciones y calificaciones para estudiante: {}", cleanCode);

        // 1. Buscar todos los mapeos en los que participó el estudiante
        List<MapeoEstudianteVariante> mapeos = mapeoRepository.findByCodigoEstudianteOrderByCreadoEnDesc(cleanCode);

        List<AuditoriaTomaGrupoEstudianteDto> materiasDto = new ArrayList<>();
        String nombreEstudiante = null;
        int regulares = 0;
        int tardios = 0;
        int extemporaneos = 0;

        for (MapeoEstudianteVariante m : mapeos) {
            if (nombreEstudiante == null && m.getNombres() != null && !m.getNombres().isBlank()) {
                nombreEstudiante = m.getNombres().trim();
                if (m.getApellidoPaterno() != null && !m.getApellidoPaterno().isBlank()) {
                    nombreEstudiante += " " + m.getApellidoPaterno().trim();
                }
            }

            Optional<RolExamen> rolOpt = rolExamenRepository.findById(m.getRolExamenId());
            RolExamen rol = rolOpt.orElse(null);

            OffsetDateTime fechaGeneracion = rol != null && rol.getFechaGeneracion() != null
                    ? rol.getFechaGeneracion().atZone(ZONA_BOLIVIA).toOffsetDateTime()
                    : null;

            OffsetDateTime fechaImpresion = null;
            List<AuditoriaEvaluacion> eventosRol = Collections.emptyList();
            if (rol != null) {
                Optional<AuditoriaEvaluacion> audImpresion = auditoriaRepository
                        .findFirstByRolExamenIdAndAccionOrderByFechaEventoDesc(rol.getId(), "IMPRESION_MARCAS_OMR");
                if (audImpresion.isEmpty()) {
                    audImpresion = auditoriaRepository
                            .findFirstByRolExamenIdAndAccionOrderByFechaEventoDesc(rol.getId(), "IMPRESION_LOTES_CARTILLAS");
                }
                if (audImpresion.isPresent() && audImpresion.get().getFechaEvento() != null) {
                    fechaImpresion = audImpresion.get().getFechaEvento().atZone(ZONA_BOLIVIA).toOffsetDateTime();
                }
                eventosRol = auditoriaRepository.findByRolExamenIdOrderByFechaEventoDesc(rol.getId());
            }

            OffsetDateTime enrollCreated = m.getSeaEnrollCreatedAt();
            OffsetDateTime enrollUpdated = m.getSeaEnrollUpdatedAt();

            // Si no estaba persistido en DB histórica, intentar refrescarlo en vivo desde el Gateway
            if (enrollCreated == null && rol != null && rol.getSeaGroupId() != null) {
                try {
                    List<StudentItemDto> sts = unitepcGatewayClient.getStudentsByGroup(rol.getSeaGroupId());
                    if (sts != null) {
                        for (StudentItemDto s : sts) {
                            if (cleanCode.equalsIgnoreCase(s.getStudentCode())) {
                                enrollCreated = s.getEnrollCreatedAt();
                                enrollUpdated = s.getEnrollUpdatedAt();
                                break;
                            }
                        }
                    }
                } catch (Exception ignored) {}
            }

            CalificacionOmr calif = calificacionOmrRepository
                    .findByRolExamenIdAndCodigoEstudiante(m.getRolExamenId(), cleanCode).orElse(null);
            NotaDocente notaDoc = notaDocenteRepository
                    .findByRolExamenIdAndCodigoEstudiante(m.getRolExamenId(), cleanCode).orElse(null);

            AuditoriaTomaGrupoEstudianteDto dto = construirEstudianteDto(
                    cleanCode, nombreEstudiante != null ? nombreEstudiante : cleanCode, "CURSANDO",
                    rol != null ? rol.getSeaGroupId() : null, rol, m.getRolExamenId(),
                    fechaGeneracion, fechaImpresion, enrollCreated, enrollUpdated,
                    m, calif, notaDoc, eventosRol);

            if ("REGULAR".equals(dto.getEstadoForense())) regulares++;
            else if ("TOMA_TARDIA".equals(dto.getEstadoForense())) tardios++;
            else if ("EXTEMPORANEO_POST_IMPRESION".equals(dto.getEstadoForense())) extemporaneos++;

            materiasDto.add(dto);
        }

        return AuditoriaEstudianteGlobalDto.builder()
                .studentCode(cleanCode)
                .fullName(nombreEstudiante != null ? nombreEstudiante : cleanCode)
                .totalMateriasInscritas(materiasDto.size())
                .totalRegulares(regulares)
                .totalTardios(tardios)
                .totalExtemporaneos(extemporaneos)
                .materias(materiasDto)
                .build();
    }

    public byte[] exportarReporteExcel(String groupId) throws IOException {
        AuditoriaTomaGrupoReporteDto reporte = obtenerAuditoriaPorGrupo(groupId);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Trazabilidad y Calificaciones");

            // Estilos
            Font fontTitulo = workbook.createFont();
            fontTitulo.setBold(true);
            fontTitulo.setFontHeightInPoints((short) 13);
            CellStyle styleTitulo = workbook.createCellStyle();
            styleTitulo.setFont(fontTitulo);

            Font fontCabecera = workbook.createFont();
            fontCabecera.setBold(true);
            fontCabecera.setColor(IndexedColors.WHITE.getIndex());
            CellStyle styleCabecera = workbook.createCellStyle();
            styleCabecera.setFont(fontCabecera);
            styleCabecera.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            styleCabecera.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            styleCabecera.setAlignment(HorizontalAlignment.CENTER);

            CellStyle styleAprobado = workbook.createCellStyle();
            styleAprobado.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            styleAprobado.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle styleReprobado = workbook.createCellStyle();
            styleReprobado.setFillForegroundColor(IndexedColors.ROSE.getIndex());
            styleReprobado.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle styleAlerta = workbook.createCellStyle();
            styleAlerta.setFillForegroundColor(IndexedColors.LEMON_CHIFFON.getIndex());
            styleAlerta.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Título y metadatos
            Row row0 = sheet.createRow(0);
            Cell cell0 = row0.createCell(0);
            cell0.setCellValue("ACTA INSTITUCIONAL DE TRAZABILIDAD, CALIFICACIONES Y PERITAJE FORENSE - UNITEPC");
            cell0.setCellStyle(styleTitulo);

            Row row1 = sheet.createRow(1);
            row1.createCell(0).setCellValue("Asignatura: " + reporte.getMateriaNombre() + " (" + (reporte.getGroupCode() != null ? reporte.getGroupCode() : reporte.getGroupId()) + ")");
            row1.createCell(4).setCellValue("Docente: " + (reporte.getDocenteNombre() != null ? reporte.getDocenteNombre() : "No asignado"));
            row1.createCell(7).setCellValue("Sede: " + (reporte.getSedeNombre() != null ? reporte.getSedeNombre() : "General"));

            Row row2 = sheet.createRow(2);
            row2.createCell(0).setCellValue("Generación Examen: " + (reporte.getFechaGeneracionExamen() != null ? reporte.getFechaGeneracionExamen().format(FORMATO_FECHA_HORA) : "NO GENERADO"));
            row2.createCell(4).setCellValue("Impresión Cartillas: " + (reporte.getFechaImpresionExamen() != null ? reporte.getFechaImpresionExamen().format(FORMATO_FECHA_HORA) : "NO IMPRESO"));
            row2.createCell(7).setCellValue("Estado: " + (reporte.getEstadoExamen() != null ? reporte.getEstadoExamen() : "PROGRAMADO"));

            Row row3 = sheet.createRow(3);
            row3.createCell(0).setCellValue(String.format("Resumen: %d Estudiantes | %d Oportunos | %d Tardíos | %d Extemporáneos | %d Calificados (%d Aprobados, %d Reprobados) | 🚨 %d Reprogramados | ⚠️ %d Ajustes Manuales",
                    reporte.getTotalEstudiantes(), reporte.getTotalRegulares(), reporte.getTotalTardios(), reporte.getTotalExtemporaneos(),
                    reporte.getTotalCalificados(), reporte.getTotalAprobados(), reporte.getTotalReprobados(),
                    reporte.getTotalReprogramados(), reporte.getTotalAjustados()));

            // Cabeceras de tabla
            Row rowHeader = sheet.createRow(5);
            String[] headers = {
                    "N°", "Código", "Estudiante", "Nota / 100", "Nota / 60", "Estado Calificación",
                    "Origen Nota", "Modificado/Reprogramado Por", "Fecha Modificación", "Motivo/Justificación",
                    "Variante", "Dictamen Forense SEA", "Toma de Grupo SEA", "Últ. Modif. SEA", "Diagnóstico Pericial"
            };
            for (int i = 0; i < headers.length; i++) {
                Cell c = rowHeader.createCell(i);
                c.setCellValue(headers[i]);
                c.setCellStyle(styleCabecera);
            }

            int rowIndex = 6;
            int num = 1;
            for (AuditoriaTomaGrupoEstudianteDto e : reporte.getEstudiantes()) {
                Row r = sheet.createRow(rowIndex++);
                r.createCell(0).setCellValue(num++);
                r.createCell(1).setCellValue(e.getStudentCode());
                r.createCell(2).setCellValue(e.getFullName());

                Cell cNota100 = r.createCell(3);
                if (e.getNotaSobre100() != null) {
                    cNota100.setCellValue(e.getNotaSobre100().doubleValue());
                } else {
                    cNota100.setCellValue("—");
                }

                Cell cNota60 = r.createCell(4);
                if (e.getNotaSobre60() != null) {
                    cNota60.setCellValue(e.getNotaSobre60().doubleValue());
                } else {
                    cNota60.setCellValue("—");
                }

                Cell cEstadoCal = r.createCell(5);
                cEstadoCal.setCellValue(e.getEstadoCalificacion() != null ? e.getEstadoCalificacion() : "PENDIENTE");
                if ("APROBADO".equalsIgnoreCase(e.getEstadoCalificacion())) {
                    cEstadoCal.setCellStyle(styleAprobado);
                } else if ("REPROBADO".equalsIgnoreCase(e.getEstadoCalificacion())) {
                    cEstadoCal.setCellStyle(styleReprobado);
                }

                Cell cOrigen = r.createCell(6);
                cOrigen.setCellValue(e.getOrigenCalificacion() != null ? e.getOrigenCalificacion() : "—");
                if (Boolean.TRUE.equals(e.getEsReprogramado()) || Boolean.TRUE.equals(e.getModificadoManualmente())) {
                    cOrigen.setCellStyle(styleAlerta);
                }

                String modificadoPor = e.getReprogramadoPor() != null ? e.getReprogramadoPor() :
                        (Boolean.TRUE.equals(e.getModificadoManualmente()) ? (e.getProcesadoPor() != null ? e.getProcesadoPor() : "SISTEMA") : "—");
                r.createCell(7).setCellValue(modificadoPor);

                String fechaModif = e.getFechaReprogramacion() != null ? e.getFechaReprogramacion().format(FORMATO_FECHA_HORA) :
                        (e.getFechaProcesamiento() != null ? e.getFechaProcesamiento().format(FORMATO_FECHA_HORA) : "—");
                r.createCell(8).setCellValue(fechaModif);

                String motivo = e.getMotivoReprogramacion() != null ? e.getMotivoReprogramacion() :
                        (e.getDetalleAjusteManual() != null ? e.getDetalleAjusteManual() : "—");
                r.createCell(9).setCellValue(motivo);

                r.createCell(10).setCellValue(e.getLetraVariante() != null ? e.getLetraVariante() : "—");

                Cell cellDictamen = r.createCell(11);
                cellDictamen.setCellValue(e.getEstadoForense());
                if ("REGULAR".equals(e.getEstadoForense())) {
                    cellDictamen.setCellStyle(styleAprobado);
                } else if ("TOMA_TARDIA".equals(e.getEstadoForense())) {
                    cellDictamen.setCellStyle(styleAlerta);
                } else if ("EXTEMPORANEO_POST_IMPRESION".equals(e.getEstadoForense())) {
                    cellDictamen.setCellStyle(styleReprobado);
                }

                r.createCell(12).setCellValue(e.getEnrollCreatedAt() != null ? e.getEnrollCreatedAt().format(FORMATO_FECHA_HORA) : "SIN FECHA");
                r.createCell(13).setCellValue(e.getEnrollUpdatedAt() != null ? e.getEnrollUpdatedAt().format(FORMATO_FECHA_HORA) : "SIN MODIF.");
                r.createCell(14).setCellValue(e.getMensajeForense() != null ? e.getMensajeForense() : "—");
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();
        }
    }

    private static class DictamenForense {
        String estado;
        String nivelAlerta;
        String mensaje;
        Long diferenciaMinutos;
    }

    private DictamenForense evaluarDictamenForense(OffsetDateTime enrollCreated, OffsetDateTime enrollUpdated,
                                                   OffsetDateTime fechaGeneracion, OffsetDateTime fechaImpresion) {
        DictamenForense d = new DictamenForense();

        if (enrollCreated == null) {
            d.estado = "SIN_FECHA_SEA";
            d.nivelAlerta = "INFO";
            d.mensaje = "Sin marca temporal en Gateway";
            return d;
        }

        if (fechaGeneracion == null) {
            d.estado = "SIN_EXAMEN_GENERADO";
            d.nivelAlerta = "INFO";
            d.mensaje = "Examen no generado aún";
            return d;
        }

        long minutosDiff = ChronoUnit.MINUTES.between(fechaGeneracion, enrollCreated);
        d.diferenciaMinutos = minutosDiff;

        // Si fue inscrito DESPUÉS de la impresión
        if (fechaImpresion != null && enrollCreated.isAfter(fechaImpresion)) {
            long minDespuesImpresion = ChronoUnit.MINUTES.between(fechaImpresion, enrollCreated);
            d.estado = "EXTEMPORANEO_POST_IMPRESION";
            d.nivelAlerta = "DANGER";
            d.mensaje = "🚨 Inscrito " + formatearTiempo(minDespuesImpresion) + " DESPUÉS de imprimir cartillas";
            return d;
        }

        // Si fue inscrito DESPUÉS de la generación del examen
        if (enrollCreated.isAfter(fechaGeneracion)) {
            d.estado = "TOMA_TARDIA";
            d.nivelAlerta = "WARNING";
            d.mensaje = "⚠️ Inscrito " + formatearTiempo(minutosDiff) + " después de generar el lote de exámenes";
            return d;
        }

        // Si fue inscrito antes de la generación
        long minutosAntes = ChronoUnit.MINUTES.between(enrollCreated, fechaGeneracion);
        if (minutosAntes < 120) { // Menos de 2 horas antes
            d.estado = "TOMA_TARDIA";
            d.nivelAlerta = "WARNING";
            d.mensaje = "⚠️ Inscripción ajustada: solo " + formatearTiempo(minutosAntes) + " antes de la generación";
            return d;
        }

        d.estado = "REGULAR";
        d.nivelAlerta = "SUCCESS";
        d.mensaje = "✅ Oportuno: inscrito con " + formatearTiempo(minutosAntes) + " de anticipación";
        return d;
    }

    private String formatearTiempo(long minutos) {
        if (minutos < 60) {
            return minutos + " min";
        }
        long horas = minutos / 60;
        long restoMin = minutos % 60;
        if (horas < 24) {
            return horas + " h " + (restoMin > 0 ? restoMin + " m" : "");
        }
        long dias = horas / 24;
        long restoHoras = horas % 24;
        return dias + " d " + (restoHoras > 0 ? restoHoras + " h" : "");
    }
}
