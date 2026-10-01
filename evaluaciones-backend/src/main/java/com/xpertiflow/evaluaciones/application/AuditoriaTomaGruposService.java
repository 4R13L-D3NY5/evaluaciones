package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.auditoria.AuditoriaEstudianteGlobalDto;
import com.xpertiflow.evaluaciones.api.dto.auditoria.AuditoriaTomaGrupoEstudianteDto;
import com.xpertiflow.evaluaciones.api.dto.auditoria.AuditoriaTomaGrupoReporteDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.GroupItemDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.StudentItemDto;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import com.xpertiflow.evaluaciones.domain.entity.MapeoEstudianteVariante;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.MapeoEstudianteVarianteRepository;
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
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditoriaTomaGruposService {

    private final UnitepcGatewayClient unitepcGatewayClient;
    private final RolExamenRepository rolExamenRepository;
    private final MapeoEstudianteVarianteRepository mapeoRepository;
    private final AuditoriaEvaluacionRepository auditoriaRepository;

    private static final ZoneId ZONA_BOLIVIA = ZoneId.of("America/La_Paz");
    private static final DateTimeFormatter FORMATO_FECHA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    @Transactional(readOnly = true)
    public AuditoriaTomaGrupoReporteDto obtenerAuditoriaPorGrupo(String groupId) {
        log.info("Iniciando auditoría de toma de grupos para groupId: {}", groupId);

        // 1. Obtener nómina en vivo del Gateway
        List<StudentItemDto> estudiantesGateway = Collections.emptyList();
        try {
            estudiantesGateway = unitepcGatewayClient.getStudentsByGroup(groupId);
        } catch (Exception ex) {
            log.error("Error al obtener estudiantes del Gateway para groupId {}: {}", groupId, ex.getMessage());
        }

        // 2. Buscar si existe Rol de Examen vinculado
        Optional<RolExamen> rolOpt = rolExamenRepository.findTopBySeaGroupIdOrderByVersionDesc(groupId);
        if (rolOpt.isEmpty()) {
            rolOpt = rolExamenRepository.findAll().stream()
                    .filter(r -> groupId.equalsIgnoreCase(r.getGrupoId()) || groupId.equalsIgnoreCase(r.getSeaGroupId()))
                    .findFirst();
        }

        RolExamen rol = rolOpt.orElse(null);
        String rolExamenId = rol != null ? rol.getId() : null;
        OffsetDateTime fechaGeneracion = rol != null && rol.getFechaGeneracion() != null
                ? rol.getFechaGeneracion().atZone(ZONA_BOLIVIA).toOffsetDateTime()
                : null;

        OffsetDateTime fechaImpresion = null;
        Map<String, MapeoEstudianteVariante> mapeosPorCodigo = Collections.emptyMap();

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

            List<MapeoEstudianteVariante> mapeos = mapeoRepository.findByRolExamenId(rolExamenId);
            mapeosPorCodigo = new HashMap<>();
            for (MapeoEstudianteVariante m : mapeos) {
                if (m.getCodigoEstudiante() != null) {
                    mapeosPorCodigo.put(m.getCodigoEstudiante().trim(), m);
                }
            }
        }

        // 3. Procesar estudiantes y emitir dictamen forense
        List<AuditoriaTomaGrupoEstudianteDto> estudiantesDto = new ArrayList<>();
        int regulares = 0;
        int tardios = 0;
        int extemporaneos = 0;

        for (StudentItemDto est : estudiantesGateway) {
            String codigo = est.getStudentCode() != null ? est.getStudentCode().trim() : "";
            MapeoEstudianteVariante mapeo = mapeosPorCodigo.get(codigo);

            OffsetDateTime enrollCreated = est.getEnrollCreatedAt();
            if (enrollCreated == null && mapeo != null) {
                enrollCreated = mapeo.getSeaEnrollCreatedAt();
            }

            OffsetDateTime enrollUpdated = est.getEnrollUpdatedAt();
            if (enrollUpdated == null && mapeo != null) {
                enrollUpdated = mapeo.getSeaEnrollUpdatedAt();
            }

            DictamenForense dictamen = evaluarDictamenForense(enrollCreated, enrollUpdated, fechaGeneracion, fechaImpresion);

            if ("REGULAR".equals(dictamen.estado)) regulares++;
            else if ("TOMA_TARDIA".equals(dictamen.estado)) tardios++;
            else if ("EXTEMPORANEO_POST_IMPRESION".equals(dictamen.estado)) extemporaneos++;

            AuditoriaTomaGrupoEstudianteDto dto = AuditoriaTomaGrupoEstudianteDto.builder()
                    .studentCode(codigo)
                    .fullName(est.getFullName())
                    .courseState(est.getCourseState())
                    .groupId(groupId)
                    .groupCode(rol != null ? rol.getGrupo() : null)
                    .syllabusCourseId(est.getSyllabusCourseId())
                    .materiaNombre(rol != null ? rol.getMateriaNombre() : null)
                    .carreraCodigo(rol != null ? rol.getCarreraCodigo() : null)
                    .sedeNombre(rol != null ? rol.getSedeNombre() : null)
                    .docenteNombre(rol != null ? rol.getDocenteNombre() : null)
                    .enrollCreatedAt(enrollCreated)
                    .enrollUpdatedAt(enrollUpdated)
                    .rolExamenId(rolExamenId)
                    .estadoExamen(rol != null && rol.getEstadoFlujo() != null ? rol.getEstadoFlujo().name() : "NO_PROGRAMADO")
                    .fechaGeneracionExamen(fechaGeneracion)
                    .fechaImpresionExamen(fechaImpresion)
                    .letraVariante(mapeo != null ? mapeo.getLetraVariante() : null)
                    .estadoForense(dictamen.estado)
                    .nivelAlerta(dictamen.nivelAlerta)
                    .mensajeForense(dictamen.mensaje)
                    .diferenciaMinutosConGeneracion(dictamen.diferenciaMinutos)
                    .build();

            estudiantesDto.add(dto);
        }

        // Ordenar: primero los extemporáneos y tardíos para llamar la atención del auditor
        estudiantesDto.sort(Comparator
                .comparingInt((AuditoriaTomaGrupoEstudianteDto e) -> prioridadAlerta(e.getNivelAlerta()))
                .thenComparing(AuditoriaTomaGrupoEstudianteDto::getFullName, Comparator.nullsLast(String::compareToIgnoreCase)));

        return AuditoriaTomaGrupoReporteDto.builder()
                .groupId(groupId)
                .groupCode(rol != null ? rol.getGrupo() : null)
                .syllabusCourseId(rol != null ? rol.getMateriaCodigo() : null)
                .materiaNombre(rol != null ? rol.getMateriaNombre() : "GRUPO ASIGNADO")
                .carreraCodigo(rol != null ? rol.getCarreraCodigo() : null)
                .sedeNombre(rol != null ? rol.getSedeNombre() : null)
                .docenteNombre(rol != null ? rol.getDocenteNombre() : null)
                .term(rol != null ? rol.getGestion() : null)
                .rolExamenId(rolExamenId)
                .estadoExamen(rol != null && rol.getEstadoFlujo() != null ? rol.getEstadoFlujo().name() : "NO_PROGRAMADO")
                .fechaGeneracionExamen(fechaGeneracion)
                .fechaImpresionExamen(fechaImpresion)
                .totalEstudiantes(estudiantesGateway.size())
                .totalRegulares(regulares)
                .totalTardios(tardios)
                .totalExtemporaneos(extemporaneos)
                .estudiantes(estudiantesDto)
                .build();
    }

    @Transactional(readOnly = true)
    public AuditoriaTomaGrupoReporteDto obtenerAuditoriaPorRol(String rolExamenId) {
        RolExamen rol = rolExamenRepository.findById(rolExamenId)
                .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + rolExamenId));

        String groupId = rol.getSeaGroupId() != null && !rol.getSeaGroupId().isBlank()
                ? rol.getSeaGroupId() : rol.getGrupoId();

        if (groupId == null || groupId.isBlank()) {
            throw new IllegalStateException("El rol de examen " + rolExamenId + " no tiene groupId institucional asociado.");
        }

        return obtenerAuditoriaPorGrupo(groupId);
    }

    @Transactional(readOnly = true)
    public AuditoriaEstudianteGlobalDto buscarPorEstudiante(String studentCode, String term) {
        String cleanCode = studentCode != null ? studentCode.trim() : "";
        if (cleanCode.isBlank()) {
            throw new IllegalArgumentException("El código de estudiante no puede estar vacío");
        }

        log.info("Buscando historial de inscripciones y toma de grupos para estudiante: {}", cleanCode);

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

            DictamenForense dictamen = evaluarDictamenForense(enrollCreated, enrollUpdated, fechaGeneracion, fechaImpresion);

            if ("REGULAR".equals(dictamen.estado)) regulares++;
            else if ("TOMA_TARDIA".equals(dictamen.estado)) tardios++;
            else if ("EXTEMPORANEO_POST_IMPRESION".equals(dictamen.estado)) extemporaneos++;

            AuditoriaTomaGrupoEstudianteDto dto = AuditoriaTomaGrupoEstudianteDto.builder()
                    .studentCode(cleanCode)
                    .fullName(nombreEstudiante)
                    .courseState("CURSANDO")
                    .groupId(rol != null ? rol.getSeaGroupId() : null)
                    .groupCode(rol != null ? rol.getGrupo() : null)
                    .syllabusCourseId(rol != null ? rol.getMateriaCodigo() : null)
                    .materiaNombre(rol != null ? rol.getMateriaNombre() : "ASIGNATURA")
                    .carreraCodigo(rol != null ? rol.getCarreraCodigo() : null)
                    .sedeNombre(rol != null ? rol.getSedeNombre() : null)
                    .docenteNombre(rol != null ? rol.getDocenteNombre() : null)
                    .enrollCreatedAt(enrollCreated)
                    .enrollUpdatedAt(enrollUpdated)
                    .rolExamenId(m.getRolExamenId())
                    .estadoExamen(rol != null && rol.getEstadoFlujo() != null ? rol.getEstadoFlujo().name() : "PROGRAMADO")
                    .fechaGeneracionExamen(fechaGeneracion)
                    .fechaImpresionExamen(fechaImpresion)
                    .letraVariante(m.getLetraVariante())
                    .estadoForense(dictamen.estado)
                    .nivelAlerta(dictamen.nivelAlerta)
                    .mensajeForense(dictamen.mensaje)
                    .diferenciaMinutosConGeneracion(dictamen.diferenciaMinutos)
                    .build();

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
            Sheet sheet = workbook.createSheet("Trazabilidad Nómina");

            // Estilos
            Font fontTitulo = workbook.createFont();
            fontTitulo.setBold(true);
            fontTitulo.setFontHeightInPoints((short) 14);
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

            CellStyle styleRegular = workbook.createCellStyle();
            styleRegular.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            styleRegular.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle styleTardio = workbook.createCellStyle();
            styleTardio.setFillForegroundColor(IndexedColors.LEMON_CHIFFON.getIndex());
            styleTardio.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            CellStyle styleExtemporaneo = workbook.createCellStyle();
            styleExtemporaneo.setFillForegroundColor(IndexedColors.ROSE.getIndex());
            styleExtemporaneo.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            // Título y metadatos
            Row row0 = sheet.createRow(0);
            Cell cell0 = row0.createCell(0);
            cell0.setCellValue("ACTA FORENSE DE TRAZABILIDAD DE NÓMINA Y TOMA DE GRUPOS - UNITEPC");
            cell0.setCellStyle(styleTitulo);

            Row row1 = sheet.createRow(1);
            row1.createCell(0).setCellValue("Asignatura: " + reporte.getMateriaNombre() + " (" + reporte.getGroupCode() + ")");
            row1.createCell(3).setCellValue("Docente: " + reporte.getDocenteNombre());

            Row row2 = sheet.createRow(2);
            row2.createCell(0).setCellValue("Generación Examen: " + (reporte.getFechaGeneracionExamen() != null ? reporte.getFechaGeneracionExamen().format(FORMATO_FECHA_HORA) : "NO GENERADO"));
            row2.createCell(3).setCellValue("Impresión Cartillas: " + (reporte.getFechaImpresionExamen() != null ? reporte.getFechaImpresionExamen().format(FORMATO_FECHA_HORA) : "NO IMPRESO"));

            Row row3 = sheet.createRow(3);
            row3.createCell(0).setCellValue(String.format("Resumen: Total %d estudiantes | %d Regulares | %d Tardíos | %d Extemporáneos",
                    reporte.getTotalEstudiantes(), reporte.getTotalRegulares(), reporte.getTotalTardios(), reporte.getTotalExtemporaneos()));

            // Cabeceras de tabla
            Row rowHeader = sheet.createRow(5);
            String[] headers = { "N°", "Código", "Estudiante", "Estado", "Toma de Grupo SEA", "Últ. Modif. SEA", "Dictamen Forense", "Detalle de Tiempo" };
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
                r.createCell(3).setCellValue(e.getCourseState());
                r.createCell(4).setCellValue(e.getEnrollCreatedAt() != null ? e.getEnrollCreatedAt().format(FORMATO_FECHA_HORA) : "SIN FECHA");
                r.createCell(5).setCellValue(e.getEnrollUpdatedAt() != null ? e.getEnrollUpdatedAt().format(FORMATO_FECHA_HORA) : "SIN MODIF.");

                Cell cellDictamen = r.createCell(6);
                cellDictamen.setCellValue(e.getEstadoForense());

                if ("REGULAR".equals(e.getEstadoForense())) {
                    cellDictamen.setCellStyle(styleRegular);
                } else if ("TOMA_TARDIA".equals(e.getEstadoForense())) {
                    cellDictamen.setCellStyle(styleTardio);
                } else if ("EXTEMPORANEO_POST_IMPRESION".equals(e.getEstadoForense())) {
                    cellDictamen.setCellStyle(styleExtemporaneo);
                }

                r.createCell(7).setCellValue(e.getMensajeForense());
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

    private int prioridadAlerta(String nivelAlerta) {
        if ("DANGER".equalsIgnoreCase(nivelAlerta)) return 0;
        if ("WARNING".equalsIgnoreCase(nivelAlerta)) return 1;
        if ("INFO".equalsIgnoreCase(nivelAlerta)) return 2;
        return 3;
    }
}
