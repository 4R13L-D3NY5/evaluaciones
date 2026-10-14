package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.testvocacional.*;
import com.xpertiflow.evaluaciones.config.AppProperties;
import com.xpertiflow.evaluaciones.domain.entity.TestVocacional;
import com.xpertiflow.evaluaciones.domain.repository.TestVocacionalRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class TestVocacionalService {

    private final TestVocacionalRepository repository;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;
    private final AppProperties appProperties;
    private final RiasecInterpretacionService riasecService;

    private final Map<String, TestVocacionalProcesarResponseDto> jobs = new ConcurrentHashMap<>();

    public TestVocacionalProcesarResponseDto iniciarProcesamiento(
            MultipartFile archivo,
            String colegio,
            String curso,
            LocalDate fecha,
            String usuario) {
        return iniciarProcesamiento(archivo, colegio, curso, fecha, usuario, false, false, false, false);
    }

    public TestVocacionalProcesarResponseDto iniciarProcesamiento(
            MultipartFile archivo,
            String colegio,
            String curso,
            LocalDate fecha,
            String usuario,
            boolean guardarPdf) {
        return iniciarProcesamiento(archivo, colegio, curso, fecha, usuario, guardarPdf, false, false, false);
    }

    public TestVocacionalProcesarResponseDto iniciarProcesamiento(
            MultipartFile archivo,
            String colegio,
            String curso,
            LocalDate fecha,
            String usuario,
            boolean guardarPdf,
            boolean ocrNombre,
            boolean ocrCelular,
            boolean ocrCorreo) {
        return iniciarProcesamiento(archivo, colegio, curso, fecha, null, null, null, usuario, guardarPdf, ocrNombre, ocrCelular, ocrCorreo);
    }

    public TestVocacionalProcesarResponseDto iniciarProcesamiento(
            MultipartFile archivo,
            String colegio,
            String curso,
            LocalDate fecha,
            String sede,
            String gestion,
            String municipio,
            String usuario,
            boolean guardarPdf,
            boolean ocrNombre,
            boolean ocrCelular,
            boolean ocrCorreo) {

        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("Debe seleccionar un archivo PDF o imagen del test vocacional.");
        }
        if (colegio == null || colegio.trim().isBlank()) {
            throw new IllegalArgumentException("El nombre del colegio es obligatorio.");
        }
        if (curso == null || curso.trim().isBlank()) {
            throw new IllegalArgumentException("El curso es obligatorio.");
        }
        if (fecha == null) {
            fecha = LocalDate.now();
        }

        String jobId = "TVOC-" + UUID.randomUUID();
        String loteId = "LOTE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT);
        String originalName = archivo.getOriginalFilename() == null ? "escaneo.pdf" : archivo.getOriginalFilename();
        String extension = originalName.toLowerCase(Locale.ROOT).endsWith(".pdf") ? ".pdf" : ".png";

        Path destino = Path.of(appProperties.getStorage().getBasePath(), "test-vocacional", loteId, "entrada", jobId + extension);

        try {
            Files.createDirectories(destino.getParent());
            archivo.transferTo(destino);

            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("jobId", jobId);
            payload.put("loteId", loteId);
            payload.put("modo", "TEST_VOCACIONAL");
            payload.put("tipo", "TEST_VOCACIONAL");
            payload.put("archivoPath", destino.toString());
            payload.put("colegio", colegio.trim());
            payload.put("curso", curso.trim());
            payload.put("fecha", fecha.toString());
            payload.put("sede", sede != null ? sede.trim() : "");
            payload.put("gestion", gestion != null ? gestion.trim() : "");
            payload.put("municipio", municipio != null ? municipio.trim() : "");
            payload.put("creadoPor", usuario == null ? "SISTEMA" : usuario);
            payload.put("guardarPdf", guardarPdf);
            payload.put("ocrNombre", ocrNombre);
            payload.put("ocrCelular", ocrCelular);
            payload.put("ocrCorreo", ocrCorreo);

            rabbitTemplate.convertAndSend("evaluaciones.omr.procesar", objectMapper.writeValueAsString(payload));

            TestVocacionalProcesarResponseDto enCola = TestVocacionalProcesarResponseDto.builder()
                    .jobId(jobId)
                    .loteId(loteId)
                    .estado("EN_COLA")
                    .mensaje("Archivo recibido y enviado al motor de lectura OMR/OCR.")
                    .totalPaginas(0)
                    .paginaActual(0)
                    .porcentaje(0)
                    .resultados(new ArrayList<>())
                    .build();

            jobs.put(jobId, enCola);
            return enCola;

        } catch (IOException e) {
            log.error("Error al guardar archivo de Test Vocacional", e);
            throw new IllegalStateException("No se pudo guardar el archivo para procesamiento: " + e.getMessage(), e);
        }
    }

    public TestVocacionalProcesarResponseDto consultarJob(String jobId) {
        TestVocacionalProcesarResponseDto cached = jobs.get(jobId);
        if (cached != null) {
            return cached;
        }
        return TestVocacionalProcesarResponseDto.builder()
                .jobId(jobId)
                .estado("NO_ENCONTRADO")
                .mensaje("El trabajo de procesamiento no existe o ya expiró.")
                .build();
    }

    public void actualizarProgresoWorker(JsonNode progresoNode) {
        String jobId = progresoNode.path("jobId").asText();
        int pagActual = progresoNode.path("paginaActual").asInt(0);
        int totalPags = progresoNode.path("totalPaginas").asInt(0);
        int pct = progresoNode.path("porcentaje").asInt(0);
        String msg = progresoNode.path("mensaje").asText("Evaluando páginas...");

        TestVocacionalProcesarResponseDto exist = jobs.get(jobId);
        if (exist != null) {
            exist.setEstado("PROCESANDO");
            exist.setPaginaActual(pagActual);
            exist.setTotalPaginas(totalPags);
            exist.setPorcentaje(pct);
            exist.setMensaje(msg);
        } else {
            jobs.put(jobId, TestVocacionalProcesarResponseDto.builder()
                    .jobId(jobId)
                    .loteId(progresoNode.path("loteId").asText())
                    .estado("PROCESANDO")
                    .paginaActual(pagActual)
                    .totalPaginas(totalPags)
                    .porcentaje(pct)
                    .mensaje(msg)
                    .resultados(new ArrayList<>())
                    .build());
        }
        log.debug("Job {} progreso: {}/{} ({}%)", jobId, pagActual, totalPags, pct);
    }

    @Transactional
    public void registrarResultadoWorker(JsonNode resultadoNode) {
        String jobId = resultadoNode.path("jobId").asText();
        String loteId = resultadoNode.path("loteId").asText();
        String colegio = resultadoNode.path("colegio").asText("Colegio");
        String curso = resultadoNode.path("curso").asText("Curso");
        String defaultSede = resultadoNode.path("sede").asText("");
        String defaultGestion = resultadoNode.path("gestion").asText("");
        String defaultMunicipio = resultadoNode.path("municipio").asText("");
        LocalDate fecha = LocalDate.now();
        if (resultadoNode.has("fecha") && !resultadoNode.get("fecha").asText().isBlank()) {
            try {
                fecha = LocalDate.parse(resultadoNode.get("fecha").asText());
            } catch (Exception ignored) {}
        }

        JsonNode hojas = resultadoNode.path("resultados");
        List<TestVocacionalItemDto> itemsProcesados = new ArrayList<>();

        if (hojas.isArray()) {
            for (JsonNode hoja : hojas) {
                int pagina = hoja.path("paginaNumero").asInt(1);
                String nombre = hoja.path("nombreCompleto").asText("");
                String celular = hoja.path("celular").asText("");
                String correo = hoja.path("correo").asText("");
                String previewPath = hoja.path("imagenPreviewPath").asText("");
                String archivoNombre = hoja.path("archivoNombre").asText("");
                String hojaSede = hoja.has("sede") && !hoja.get("sede").asText().isBlank() ? hoja.get("sede").asText() : defaultSede;
                String hojaGestion = hoja.has("gestion") && !hoja.get("gestion").asText().isBlank() ? hoja.get("gestion").asText() : defaultGestion;
                String hojaMunicipio = hoja.has("municipio") && !hoja.get("municipio").asText().isBlank() ? hoja.get("municipio").asText() : defaultMunicipio;

                JsonNode candNombreNode = hoja.path("candidatosNombre");
                JsonNode candCelularNode = hoja.path("candidatosCelular");
                JsonNode candCorreoNode = hoja.path("candidatosCorreo");
                JsonNode numsNode = hoja.path("numerosMarcados");

                List<Integer> nums = new ArrayList<>();
                if (numsNode.isArray()) {
                    for (JsonNode n : numsNode) {
                        nums.add(n.asInt());
                    }
                }

                InterpretacionVocacionalDto interp = riasecService.interpretar(nums);
                String puntajesJson = "{}";
                String facsJson = "[]";
                String carrJson = "[]";
                try {
                    puntajesJson = objectMapper.writeValueAsString(interp.getDimensiones());
                    facsJson = objectMapper.writeValueAsString(interp.getFacultades());
                    carrJson = objectMapper.writeValueAsString(interp.getCarrerasRecomendadas());
                } catch (Exception e) {
                    log.warn("Error serializando interpretación RIASEC", e);
                }

                TestVocacional entidad = TestVocacional.builder()
                        .loteId(loteId)
                        .colegio(colegio)
                        .curso(curso)
                        .fecha(fecha)
                        .sede(hojaSede.isBlank() ? null : hojaSede.trim())
                        .gestion(hojaGestion.isBlank() ? null : hojaGestion.trim())
                        .municipio(hojaMunicipio.isBlank() ? null : hojaMunicipio.trim())
                        .nombreCompleto(nombre)
                        .celular(celular)
                        .correo(correo)
                        .candidatosNombreJson(candNombreNode.toString())
                        .candidatosCelularJson(candCelularNode.toString())
                        .candidatosCorreoJson(candCorreoNode.toString())
                        .numerosMarcadosJson(numsNode.toString())
                        .totalMarcados(nums.size())
                        .codigoHolland(interp.getCodigoHolland())
                        .facultadSugerida(interp.getFacultadSugerida())
                        .puntajesRiasecJson(puntajesJson)
                        .facultadesAfinidadJson(facsJson)
                        .carrerasSugeridasJson(carrJson)
                        .archivoNombre(archivoNombre)
                        .imagenPreviewPath(previewPath)
                        .paginaNumero(pagina)
                        .estado("PROCESADO")
                        .creadoPor("OMR_VISION_OCR")
                        .build();

                TestVocacional guardado = repository.save(entidad);
                itemsProcesados.add(mapearADto(guardado));
            }
        }

        TestVocacionalProcesarResponseDto completado = TestVocacionalProcesarResponseDto.builder()
                .jobId(jobId)
                .loteId(loteId)
                .estado("COMPLETADO")
                .mensaje(String.format("Procesamiento completado: %d hoja(s) evaluada(s) con éxito.", itemsProcesados.size()))
                .totalPaginas(itemsProcesados.size())
                .paginaActual(itemsProcesados.size())
                .porcentaje(100)
                .resultados(itemsProcesados)
                .build();

        jobs.put(jobId, completado);
        log.info("Test Vocacional lote {} completado con {} registros guardados", loteId, itemsProcesados.size());
    }

    public List<TestVocacionalItemDto> listar(String colegio, String curso, LocalDate fecha, String busqueda) {
        String col = (colegio == null || colegio.trim().isBlank()) ? null : "%" + colegio.trim().toLowerCase(Locale.ROOT) + "%";
        String cur = (curso == null || curso.trim().isBlank()) ? null : "%" + curso.trim().toLowerCase(Locale.ROOT) + "%";
        String bus = (busqueda == null || busqueda.trim().isBlank()) ? null : "%" + busqueda.trim().toLowerCase(Locale.ROOT) + "%";

        return repository.buscarConFiltros(col, cur, fecha, bus).stream()
                .map(this::mapearADto)
                .toList();
    }

    public TestVocacionalItemDto obtenerPorId(Long id) {
        return repository.findById(id)
                .map(this::mapearADto)
                .orElseThrow(() -> new IllegalArgumentException("Test Vocacional no encontrado: " + id));
    }

    @Transactional
    public TestVocacionalItemDto actualizar(Long id, TestVocacionalActualizarRequestDto dto, String usuario) {
        TestVocacional entidad = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Test Vocacional no encontrado: " + id));

        entidad.setNombreCompleto(dto.getNombreCompleto() == null ? "" : dto.getNombreCompleto().trim());
        entidad.setCelular(dto.getCelular() == null ? "" : dto.getCelular().trim());
        entidad.setCorreo(dto.getCorreo() == null ? "" : dto.getCorreo().trim());
        entidad.setColegio(dto.getColegio().trim());
        entidad.setCurso(dto.getCurso().trim());
        entidad.setFecha(dto.getFecha());
        if (dto.getSede() != null) entidad.setSede(dto.getSede().trim());
        if (dto.getGestion() != null) entidad.setGestion(dto.getGestion().trim());
        if (dto.getMunicipio() != null) entidad.setMunicipio(dto.getMunicipio().trim());

        if (dto.getNumerosMarcados() != null) {
            try {
                entidad.setNumerosMarcadosJson(objectMapper.writeValueAsString(dto.getNumerosMarcados()));
                entidad.setTotalMarcados(dto.getNumerosMarcados().size());

                InterpretacionVocacionalDto interp = riasecService.interpretar(dto.getNumerosMarcados());
                entidad.setCodigoHolland(interp.getCodigoHolland());
                entidad.setFacultadSugerida(interp.getFacultadSugerida());
                entidad.setPuntajesRiasecJson(objectMapper.writeValueAsString(interp.getDimensiones()));
                entidad.setFacultadesAfinidadJson(objectMapper.writeValueAsString(interp.getFacultades()));
                entidad.setCarrerasSugeridasJson(objectMapper.writeValueAsString(interp.getCarrerasRecomendadas()));
            } catch (Exception e) {
                log.warn("Error al serializar números marcados / RIASEC", e);
            }
        }
        if (dto.getObservaciones() != null) {
            entidad.setObservaciones(dto.getObservaciones().trim());
        }

        TestVocacional guardado = repository.save(entidad);
        log.info("Test Vocacional #{} actualizado por usuario {}", id, usuario);
        return mapearADto(guardado);
    }

    @Transactional
    public void eliminar(Long id, String usuario) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Test Vocacional no encontrado: " + id);
        }
        repository.deleteById(id);
        log.info("Test Vocacional #{} eliminado por usuario {}", id, usuario);
    }

    @Transactional
    public int eliminarPaquete(String colegio, String curso, String usuario) {
        if (colegio == null || colegio.trim().isBlank() || curso == null || curso.trim().isBlank()) {
            throw new IllegalArgumentException("Colegio y curso son requeridos para eliminar el paquete.");
        }
        List<TestVocacional> registros = repository.findByColegioIgnoreCaseAndCursoIgnoreCase(colegio.trim(), curso.trim());
        if (registros.isEmpty()) {
            return 0;
        }

        for (TestVocacional tv : registros) {
            try {
                if (tv.getImagenPreviewPath() != null) {
                    Path p = Path.of(appProperties.getStorage().getBasePath(), tv.getImagenPreviewPath());
                    Files.deleteIfExists(p);
                }
            } catch (Exception e) {
                log.warn("No se pudo eliminar preview de Test Vocacional #{}: {}", tv.getId(), e.getMessage());
            }
        }

        repository.deleteAll(registros);
        log.info("Paquete de Test Vocacional (Colegio: '{}', Curso: '{}') eliminado por {}. Total eliminados: {}",
                colegio, curso, usuario, registros.size());
        return registros.size();
    }

    public Map<String, List<String>> obtenerFiltrosDisponibles() {
        Map<String, List<String>> filtros = new LinkedHashMap<>();
        filtros.put("colegios", repository.findDistinctColegios());
        filtros.put("cursos", repository.findDistinctCursos());
        filtros.put("sedes", repository.findDistinctSedes());
        filtros.put("gestiones", repository.findDistinctGestiones());
        filtros.put("municipios", repository.findDistinctMunicipios());
        return filtros;
    }

    public byte[] exportarExcel(String colegio, String curso, LocalDate fecha, String busqueda) {
        List<TestVocacionalItemDto> lista = listar(colegio, curso, fecha, busqueda);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Test Vocacional");

            // Estilos
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerFont.setFontHeightInPoints((short) 11);

            CellStyle headerStyle = workbook.createCellStyle();
            headerStyle.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setFont(headerFont);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            headerStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle dataStyle = workbook.createCellStyle();
            dataStyle.setAlignment(HorizontalAlignment.LEFT);
            dataStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle centerStyle = workbook.createCellStyle();
            centerStyle.setAlignment(HorizontalAlignment.CENTER);
            centerStyle.setVerticalAlignment(VerticalAlignment.CENTER);

            // Cabeceras
            String[] headers = {
                    "N°", "Lote", "Sede", "Gestión", "Municipio", "Colegio", "Curso", "Fecha",
                    "Nombre Completo", "Celular", "Correo Electrónico",
                    "Total Marcados", "Vector de Números Marcados",
                    "Código Holland", "Facultad Sugerida UNITEPC", "Top 3 Carreras Recomendadas",
                    "Puntajes RIASEC (%)", "Pág."
            };

            Row headerRow = sheet.createRow(0);
            headerRow.setHeightInPoints(24);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Filas
            int rowIdx = 1;
            for (TestVocacionalItemDto item : lista) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(rowIdx - 1);
                row.getCell(0).setCellStyle(centerStyle);

                row.createCell(1).setCellValue(item.getLoteId());
                row.getCell(1).setCellStyle(centerStyle);

                row.createCell(2).setCellValue(item.getSede() == null ? "" : item.getSede());
                row.getCell(2).setCellStyle(centerStyle);

                row.createCell(3).setCellValue(item.getGestion() == null ? "" : item.getGestion());
                row.getCell(3).setCellStyle(centerStyle);

                row.createCell(4).setCellValue(item.getMunicipio() == null ? "" : item.getMunicipio());
                row.getCell(4).setCellStyle(centerStyle);

                row.createCell(5).setCellValue(item.getColegio());
                row.getCell(5).setCellStyle(dataStyle);

                row.createCell(6).setCellValue(item.getCurso());
                row.getCell(6).setCellStyle(centerStyle);

                row.createCell(7).setCellValue(item.getFecha() == null ? "" : item.getFecha().toString());
                row.getCell(7).setCellStyle(centerStyle);

                row.createCell(8).setCellValue(item.getNombreCompleto() == null ? "" : item.getNombreCompleto());
                row.getCell(8).setCellStyle(dataStyle);

                row.createCell(9).setCellValue(item.getCelular() == null ? "" : item.getCelular());
                row.getCell(9).setCellStyle(centerStyle);

                row.createCell(10).setCellValue(item.getCorreo() == null ? "" : item.getCorreo());
                row.getCell(10).setCellStyle(dataStyle);

                row.createCell(11).setCellValue(item.getTotalMarcados() == null ? 0 : item.getTotalMarcados());
                row.getCell(11).setCellStyle(centerStyle);

                row.createCell(12).setCellValue(item.getNumerosMarcados() == null ? "[]" : item.getNumerosMarcados().toString());
                row.getCell(12).setCellStyle(dataStyle);

                row.createCell(13).setCellValue(item.getCodigoHolland() == null ? "" : item.getCodigoHolland());
                row.getCell(13).setCellStyle(centerStyle);

                row.createCell(14).setCellValue(item.getFacultadSugerida() == null ? "" : item.getFacultadSugerida());
                row.getCell(14).setCellStyle(dataStyle);

                String topCarreras = item.getCarrerasSugeridas() == null ? "" : item.getCarrerasSugeridas().stream()
                        .limit(3)
                        .map(c -> String.format("%s (%.0f%%)", c.getCarrera(), c.getAfinidadPorcentaje()))
                        .collect(Collectors.joining(", "));
                row.createCell(15).setCellValue(topCarreras);
                row.getCell(15).setCellStyle(dataStyle);

                String puntajesStr = "";
                if (item.getPuntajesRiasec() != null) {
                    puntajesStr = String.format("R:%.0f%% | I:%.0f%% | A:%.0f%% | S:%.0f%% | E:%.0f%% | C:%.0f%%",
                            item.getPuntajesRiasec().getOrDefault("R", new DimensionRiasecDto()).getPorcentaje(),
                            item.getPuntajesRiasec().getOrDefault("I", new DimensionRiasecDto()).getPorcentaje(),
                            item.getPuntajesRiasec().getOrDefault("A", new DimensionRiasecDto()).getPorcentaje(),
                            item.getPuntajesRiasec().getOrDefault("S", new DimensionRiasecDto()).getPorcentaje(),
                            item.getPuntajesRiasec().getOrDefault("E", new DimensionRiasecDto()).getPorcentaje(),
                            item.getPuntajesRiasec().getOrDefault("C", new DimensionRiasecDto()).getPorcentaje());
                }
                row.createCell(16).setCellValue(puntajesStr);
                row.getCell(16).setCellStyle(dataStyle);

                row.createCell(17).setCellValue(item.getPaginaNumero() == null ? 1 : item.getPaginaNumero());
                row.getCell(17).setCellStyle(centerStyle);
            }

            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return out.toByteArray();

        } catch (IOException e) {
            log.error("Error al exportar Test Vocacional a Excel", e);
            throw new IllegalStateException("No se pudo generar el reporte en Excel: " + e.getMessage(), e);
        }
    }

    public InterpretacionVocacionalDto obtenerInterpretacion(Long id) {
        TestVocacional entidad = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Test Vocacional no encontrado: " + id));
        List<Integer> nums = deserializarListaInteger(entidad.getNumerosMarcadosJson());
        return riasecService.interpretar(nums);
    }

    public Path resolverRutaPreview(Long id) {
        TestVocacional entidad = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Test Vocacional no encontrado: " + id));
        String rawPath = entidad.getImagenPreviewPath();
        if (rawPath == null || rawPath.isBlank()) {
            return null;
        }
        Path pathDirect = Path.of(rawPath);
        if (Files.exists(pathDirect)) {
            return pathDirect;
        }
        Path pathRel = Path.of(appProperties.getStorage().getBasePath(), rawPath);
        if (Files.exists(pathRel)) {
            return pathRel;
        }
        if (rawPath.startsWith("storage/") || rawPath.startsWith("storage\\")) {
            Path pathSub = Path.of(appProperties.getStorage().getBasePath(), rawPath.substring(8));
            if (Files.exists(pathSub)) {
                return pathSub;
            }
        }
        return null;
    }

    private TestVocacionalItemDto mapearADto(TestVocacional entidad) {
        List<String> candNombre = deserializarListaString(entidad.getCandidatosNombreJson());
        List<String> candCelular = deserializarListaString(entidad.getCandidatosCelularJson());
        List<String> candCorreo = deserializarListaString(entidad.getCandidatosCorreoJson());
        List<Integer> numsMarcados = deserializarListaInteger(entidad.getNumerosMarcadosJson());

        InterpretacionVocacionalDto interp = riasecService.interpretar(numsMarcados);
        String codigoHolland = (entidad.getCodigoHolland() != null && !entidad.getCodigoHolland().isBlank())
                ? entidad.getCodigoHolland() : interp.getCodigoHolland();
        String facultadSugerida = (entidad.getFacultadSugerida() != null && !entidad.getFacultadSugerida().isBlank())
                ? entidad.getFacultadSugerida() : interp.getFacultadSugerida();

        return TestVocacionalItemDto.builder()
                .id(entidad.getId())
                .loteId(entidad.getLoteId())
                .colegio(entidad.getColegio())
                .curso(entidad.getCurso())
                .fecha(entidad.getFecha())
                .sede(entidad.getSede())
                .gestion(entidad.getGestion())
                .municipio(entidad.getMunicipio())
                .nombreCompleto(entidad.getNombreCompleto())
                .celular(entidad.getCelular())
                .correo(entidad.getCorreo())
                .candidatosNombre(candNombre)
                .candidatosCelular(candCelular)
                .candidatosCorreo(candCorreo)
                .numerosMarcados(numsMarcados)
                .totalMarcados(entidad.getTotalMarcados())
                .codigoHolland(codigoHolland)
                .facultadSugerida(facultadSugerida)
                .puntajesRiasec(interp.getDimensiones())
                .facultadesAfinidad(interp.getFacultades())
                .carrerasSugeridas(interp.getCarrerasRecomendadas())
                .paginaNumero(entidad.getPaginaNumero())
                .archivoNombre(entidad.getArchivoNombre())
                .imagenPreviewPath(entidad.getImagenPreviewPath())
                .estado(entidad.getEstado())
                .observaciones(entidad.getObservaciones())
                .creadoPor(entidad.getCreadoPor())
                .creadoEn(entidad.getCreadoEn())
                .actualizadoEn(entidad.getActualizadoEn())
                .build();
    }

    private List<String> deserializarListaString(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    private List<Integer> deserializarListaInteger(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<Integer>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}
