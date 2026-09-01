package com.xpertiflow.evaluaciones.application.banco;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.banco.BancoPreguntasResponseDto;
import com.xpertiflow.evaluaciones.api.dto.banco.CargaBancoResponseDto;
import com.xpertiflow.evaluaciones.api.dto.banco.ReactivoResponseDto;
import com.xpertiflow.evaluaciones.application.RolExamenService;
import com.xpertiflow.evaluaciones.domain.entity.BancoPreguntas;
import com.xpertiflow.evaluaciones.domain.entity.Reactivo;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.TipoParcial;
import com.xpertiflow.evaluaciones.domain.repository.BancoPreguntasRepository;
import com.xpertiflow.evaluaciones.domain.repository.ReactivoRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class BancoPreguntasService {

    private final BancoPreguntasRepository bancoRepository;
    private final ReactivoRepository reactivoRepository;
    private final RolExamenRepository rolRepository;
    private final RolExamenService rolExamenService;
    private final ObjectMapper objectMapper;

    private static final int TOTAL_REQUERIDO = 60;
    private static final int CUOTA_FACILES = 15;
    private static final int CUOTA_MEDIAS = 30;
    private static final int CUOTA_DIFICILES = 15;
    private static final int MIN_HIJOS_AGRUPADOS = 2;
    private static final int MAX_HIJOS_AGRUPADOS = 10;
    private static final long MAX_ARCHIVO_BYTES = 10L * 1024L * 1024L;
    private static final Set<String> ERRORES_FORMULA = Set.of("#REF!", "#DIV/0!", "#VALUE!", "#NAME?", "#N/A");

    public BancoPreguntasResponseDto obtenerPorRolExamenId(String rolExamenId) {
        BancoPreguntas banco = bancoRepository.findTopByRolExamenIdOrderByFechaAprobacionDesc(rolExamenId)
                .orElseThrow(() -> new RuntimeException("No existe banco de preguntas para el rol: " + rolExamenId));
        return toResponseDto(banco);
    }

    private BancoPreguntasResponseDto toResponseDto(BancoPreguntas banco) {
        return BancoPreguntasResponseDto.builder()
                .id(banco.getId())
                .rolExamenId(banco.getRolExamenId())
                .materiaCodigo(banco.getMateriaCodigo())
                .materiaNombre(banco.getMateriaNombre())
                .grupo(banco.getGrupo())
                .tipoParcial(banco.getTipoParcial())
                .totalReactivos(banco.getTotalReactivos())
                .facilesCount(banco.getFacilesCount())
                .mediasCount(banco.getMediasCount())
                .dificilesCount(banco.getDificilesCount())
                .nombreArchivoExcel(banco.getNombreArchivoExcel())
                .hashSha256Integridad(banco.getHashSha256Integridad())
                .estado(banco.getEstado())
                .docenteAprobador(banco.getDocenteAprobador())
                .fechaAprobacion(banco.getFechaAprobacion())
                .build();
    }

    @Transactional
    public CargaBancoResponseDto cargarDesdeExcel(String rolExamenId, MultipartFile file, String docenteAprobador) {
        RolExamen rol = rolRepository.findById(rolExamenId)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + rolExamenId));
        return cargarDesdeExcelConRol(rol, file, docenteAprobador);
    }

    @Transactional
    public CargaBancoResponseDto cargarDesdeExcelPorParametros(
            String materiaCodigo, String grupo, String tipoParcialValor, MultipartFile file, String docenteAprobador) {
        TipoParcial tipoParcial = TipoParcial.fromValor(tipoParcialValor);

        // Primero buscar un rol PROGRAMADO; si no existe, buscar el más reciente en cualquier estado
        // para permitir re-subir un banco sobre un rol ya validado/generado.
        Optional<RolExamen> rolOpt = rolRepository.findFirstByMateriaCodigoAndGrupoAndTipoParcialAndEstadoFlujo(
                        materiaCodigo, grupo, tipoParcial, EstadoFlujo.PROGRAMADO);

        if (rolOpt.isEmpty()) {
            rolOpt = rolRepository.findFirstByMateriaCodigoAndGrupoAndTipoParcialOrderByCreadoEnDesc(
                    materiaCodigo, grupo, tipoParcial);
        }

        RolExamen rol = rolOpt.orElseThrow(() -> new RuntimeException(
                "No existe rol de examen para materia=" + materiaCodigo
                        + ", grupo=" + grupo + ", parcial=" + tipoParcialValor
                        + ". Debe crearse el rol antes de cargar el banco de preguntas."));

        return cargarDesdeExcelConRol(rol, file, docenteAprobador);
    }

    @Transactional
    public CargaBancoResponseDto cargarDesdeExcelConRol(RolExamen rol, MultipartFile file, String docenteAprobador) {

        List<String> errores = new ArrayList<>();
        List<Reactivo> reactivos = new ArrayList<>();

        validarArchivo(file, errores);
        if (!errores.isEmpty()) return respuestaFallida(rol, errores);

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = encontrarHojaBanco(workbook);
            if (sheet == null) {
                errores.add("No se encontró la hoja oficial 'Banco' (se ignoran otras hojas). ");
                return respuestaFallida(rol, errores);
            }

            FormulaEvaluator evaluador = workbook.getCreationHelper().createFormulaEvaluator();
            Map<String, Integer> columnas = validarEncabezados(sheet, evaluador, errores);
            if (!errores.isEmpty()) return respuestaFallida(rol, errores);

            int faciles = 0, medias = 0, dificiles = 0;
            Set<String> huellasPreguntas = new HashSet<>();
            List<FilaEstructura> estructura = new ArrayList<>();

            for (Row row : sheet) {
                int rowNum = row.getRowNum();
                if (rowNum == 0) continue;
                if (filaVacia(row, columnas, evaluador)) {
                    // Se conserva la posición de una fila vacía para que no se
                    // pueda ocultar una separación dentro de un bloque agrupado.
                    estructura.add(new FilaEstructura(rowNum + 1, null, ""));
                    continue;
                }

                estructura.add(new FilaEstructura(
                        rowNum + 1,
                        normalizarTipo(valor(row, columnas, "tipo", evaluador)),
                        valor(row, columnas, "grupo", evaluador)));

                Reactivo r = parsearFila(row, rowNum, columnas, evaluador, rol.getTipoParcial(), errores);
                if (r != null) {
                    String huella = huellaPregunta(r);
                    if (!huellasPreguntas.add(huella)) {
                        errores.add("Fila " + (rowNum + 1) + ": pregunta duplicada (mismo tipo, grupo y enunciado)");
                        continue;
                    }
                    reactivos.add(r);
                    switch (r.getNivelDificultad()) {
                        case 1 -> faciles++;
                        case 2 -> medias++;
                        case 3 -> dificiles++;
                    }
                }
                rowNum++;
            }

            validarEstructuraAgrupada(estructura, errores);

            validarCuotas(faciles, medias, dificiles, reactivos.size(), errores);

            if (!errores.isEmpty()) {
                return CargaBancoResponseDto.builder()
                        .exito(false)
                        .mensaje("Validacion fallida")
                        .rolExamenId(rol.getId())
                        .erroresValidacion(errores)
                        .build();
            }

            // Calcular hash del contenido JSON
            String paqueteJson = objectMapper.writeValueAsString(reactivos);
            String hash = calcularSha256(paqueteJson);

            if (bancoRepository.existsByRolExamenIdAndHashSha256Integridad(rol.getId(), hash)) {
                return respuestaFallida(rol, List.of("El mismo banco ya fue registrado para este rol (hash SHA-256 duplicado)."));
            }

            String docenteOficial = rolExamenService.resolverNombreDocenteOficial(rol);
            if (docenteOficial == null || docenteOficial.isBlank()) {
                throw new RuntimeException("No se encontró un docente oficial en los servicios institucionales para este rol");
            }

            // Guardar banco
            String bancoId = "BANCO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            BancoPreguntas banco = new BancoPreguntas();
            banco.setId(bancoId);
            banco.setRolExamenId(rol.getId());
            banco.setMateriaCodigo(rol.getMateriaCodigo());
            banco.setMateriaNombre(rol.getMateriaNombre());
            banco.setGrupo(rol.getGrupo());
            banco.setTipoParcial(rol.getTipoParcial().getValor());
            banco.setTotalReactivos(reactivos.size());
            banco.setFacilesCount(faciles);
            banco.setMediasCount(medias);
            banco.setDificilesCount(dificiles);
            banco.setNombreArchivoExcel(file.getOriginalFilename());
            banco.setHashSha256Integridad(hash);
            banco.setPaqueteJsonEncriptado(paqueteJson);
            banco.setEstado("VALIDADO");
            banco.setDocenteAprobador(docenteOficial.trim());
            banco.setFechaAprobacion(LocalDateTime.now());
            bancoRepository.save(banco);

            // Guardar reactivos
            int orden = 1;
            for (Reactivo r : reactivos) {
                r.setBancoId(bancoId);
                r.setNumeroOrden(orden++);
                reactivoRepository.save(r);
            }

            rolExamenService.validarPorBanco(rol.getId(), hash, docenteOficial.trim());

            return CargaBancoResponseDto.builder()
                    .exito(true)
                    .mensaje("Banco de preguntas validado y almacenado correctamente")
                    .bancoPreguntasId(bancoId)
                    .rolExamenId(rol.getId())
                    .nuevoEstado(EstadoFlujo.VALIDADO.getValor())
                    .totalReactivos(reactivos.size())
                    .facilesCount(faciles)
                    .mediasCount(medias)
                    .dificilesCount(dificiles)
                    .hashSha256(hash)
                    .erroresValidacion(Collections.emptyList())
                    .build();

        } catch (IOException | RuntimeException e) {
            log.warn("No se pudo validar el archivo Excel del rol {}", rol.getId(), e);
            return respuestaFallida(rol, List.of("El archivo Excel no se puede leer o tiene una estructura inválida."));
        }
    }

    @Transactional
    public void eliminarPorRolExamenId(String rolExamenId, String confirmacion, String usuario) {
        if (!"ELIMINAR".equals(confirmacion == null ? "" : confirmacion.trim().toUpperCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Debe escribir ELIMINAR para confirmar la eliminación del banco.");
        }

        RolExamen rol = rolRepository.findById(rolExamenId)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + rolExamenId));
        if (rol.getEstadoFlujo() != EstadoFlujo.PROGRAMADO && rol.getEstadoFlujo() != EstadoFlujo.VALIDADO) {
            throw new IllegalStateException("El banco solo se puede eliminar cuando el rol está PROGRAMADO o VALIDADO; estado actual: "
                    + rol.getEstadoFlujo().getValor());
        }

        List<BancoPreguntas> bancos = bancoRepository.findByRolExamenIdOrderByFechaAprobacionDesc(rolExamenId);
        if (bancos.isEmpty()) {
            throw new RuntimeException("El examen no tiene un banco de preguntas cargado.");
        }

        // La FK de reactivos tiene ON DELETE CASCADE; se eliminan todos los
        // registros históricos del rol para que el indicador quede coherente.
        bancoRepository.deleteAll(bancos);
        rolExamenService.revertirPorEliminacionBanco(rolExamenId, usuario);
    }

    private Reactivo parsearFila(Row row, int rowNum, Map<String, Integer> columnas,
                                 FormulaEvaluator evaluador, TipoParcial parcialEsperado,
                                 List<String> errores) {
        int erroresIniciales = errores.size();
        String tipo = valor(row, columnas, "tipo", evaluador);
        String grupo = valor(row, columnas, "grupo", evaluador);
        String enunciado = valor(row, columnas, "enunciado", evaluador);
        String respuestaOriginal = valor(row, columnas, "respuesta_correcta", evaluador);
        String dificultadStr = valor(row, columnas, "dificultad", evaluador);
        String parcial = valor(row, columnas, "parcial", evaluador);
        String pesoStr = valor(row, columnas, "peso", evaluador);

        if (tipo.isBlank()) {
            errores.add("Fila " + (rowNum + 1) + ": tipo de reactivo obligatorio");
            return null;
        }

        String tipoNormalizado = normalizarTipo(tipo);
        if (tipoNormalizado == null) {
            errores.add("Fila " + (rowNum + 1) + ": tipo desconocido '" + tipo + "'");
            return null;
        }

        boolean filaMadreCaso = "CASO_CLINICO_TRONCO".equals(tipoNormalizado);
        boolean filaMadreEmparejamiento = "EMPAREJAMIENTO_TRONCO".equals(tipoNormalizado);
        boolean sinRespuestaDirecta = filaMadreCaso || filaMadreEmparejamiento;

        if (enunciado.isBlank() && filaMadreEmparejamiento) {
            enunciado = "De la lista de opciones, seleccione la respuesta correcta para cada enunciado";
        }
        if (enunciado.isBlank()) {
            errores.add("Fila " + (rowNum + 1) + ": enunciado vacío");
        }
        validarTexto("enunciado", enunciado, rowNum, 10000, errores);

        if (grupo.length() > 100) {
            errores.add("Fila " + (rowNum + 1) + ": grupo supera los 100 caracteres");
        }
        if (Set.of("CASO_CLINICO_TRONCO", "SUBITEM_CASO", "EMPAREJAMIENTO_TRONCO", "OPCION_EMPAREJAMIENTO").contains(tipoNormalizado)
                && grupo.isBlank()) {
            errores.add("Fila " + (rowNum + 1) + ": esta pregunta necesita un código de grupo para relacionarla con su enunciado principal");
        }

        if (!parcial.isBlank() && !parcialCoincide(parcial, parcialEsperado)) {
            errores.add("Fila " + (rowNum + 1) + ": parcial '" + parcial + "' no coincide con el parcial del rol");
        }

        int nivelDificultad = 2;
        boolean noLlevaDificultad = filaMadreCaso || filaMadreEmparejamiento;
        if (noLlevaDificultad) {
            if (!dificultadStr.isBlank()) {
                errores.add("Fila " + (rowNum + 1) + ": esta tipología no debe llevar dificultad");
            }
        } else {
            nivelDificultad = parsearDificultad(dificultadStr);
            if (nivelDificultad == 0) {
                errores.add("Fila " + (rowNum + 1) + ": dificultad inválida '" + dificultadStr + "' (use 1, 2 o 3)");
            }
        }

        BigDecimal peso = BigDecimal.ONE;
        if (!pesoStr.isBlank()) {
            try {
                peso = new BigDecimal(pesoStr.replace(',', '.'));
                if (peso.signum() <= 0 || peso.compareTo(new BigDecimal("100")) > 0 || peso.scale() > 2) {
                    throw new IllegalArgumentException();
                }
            } catch (Exception exception) {
                errores.add("Fila " + (rowNum + 1) + ": peso inválido '" + pesoStr + "' (mayor que 0, máximo 100 y 2 decimales)");
                peso = BigDecimal.ONE;
            }
        }

        String[] letras = {"A", "B", "C", "D", "E"};
        Map<String, String> textosOpciones = new LinkedHashMap<>();
        for (String letra : letras) {
            String texto = valor(row, columnas, "opcion_" + letra.toLowerCase(Locale.ROOT), evaluador);
            textosOpciones.put(letra, texto);
            validarTexto("opción " + letra, texto, rowNum, 2000, errores);
        }
        validarOpciones(tipoNormalizado, textosOpciones, rowNum, errores);

        String respuesta = normalizarRespuestaCorrecta(respuestaOriginal, tipoNormalizado);
        if (sinRespuestaDirecta) {
            if (!respuestaOriginal.isBlank()) {
                errores.add("Fila " + (rowNum + 1) + ": esta tipología no debe llevar respuesta correcta directa");
            }
            respuesta = "A";
        } else if (respuesta.isBlank()) {
            errores.add("Fila " + (rowNum + 1) + ": respuesta correcta debe ser un único inciso A-E");
        }
        if (!sinRespuestaDirecta && !respuestaOriginal.isBlank()
                && !respuestaOriginal.trim().matches("(?i)[A-E]|VERDADERO|FALSO")) {
            errores.add("Fila " + (rowNum + 1) + ": respuesta correcta inválida; debe ser un único inciso A-E");
        }
        boolean respuestaDebeApuntarAOpcion = !sinRespuestaDirecta && !"OPCION_EMPAREJAMIENTO".equals(tipoNormalizado);
        if (respuestaDebeApuntarAOpcion && !respuesta.isBlank()
                && !textosOpciones.getOrDefault(respuesta, "").isBlank()) {
            // La respuesta apunta a una opción activa.
        } else if (respuestaDebeApuntarAOpcion && !respuesta.isBlank()) {
            errores.add("Fila " + (rowNum + 1) + ": la respuesta correcta " + respuesta + " no tiene una opción activa");
        }

        List<Map<String, Object>> opciones = new ArrayList<>();
        for (String letra : letras) {
            String texto = textosOpciones.get(letra);
            if (!texto.isBlank()) {
                Map<String, Object> op = new LinkedHashMap<>();
                op.put("letra", letra);
                op.put("texto", texto);
                op.put("correcta", letra.equals(respuesta));
                opciones.add(op);
            }
        }

        if (errores.size() == erroresIniciales) {
            Reactivo r = new Reactivo();
            r.setTipoReactivo(tipoNormalizado);
            r.setEnunciado(enunciado);
            r.setOpcionesJson(toJson(opciones));
            r.setRespuestaCorrecta(respuesta);
            r.setNivelDificultad(nivelDificultad);
            r.setDificultad(nivelDificultad == 1 ? "Fácil" : nivelDificultad == 2 ? "Medio" : "Difícil");
            r.setPesoPuntos(peso);
            r.setGrupoContexto(grupo.isBlank() ? null : grupo);
            return r;
        }
        return null;
    }

    private void validarArchivo(MultipartFile file, List<String> errores) {
        if (file == null || file.isEmpty()) {
            errores.add("Debe seleccionar un archivo Excel .xlsx no vacío.");
            return;
        }
        String nombre = file.getOriginalFilename() == null ? "" : file.getOriginalFilename().trim().toLowerCase(Locale.ROOT);
        if (!nombre.endsWith(".xlsx")) {
            errores.add("El archivo debe tener extensión .xlsx; no se aceptan .xls, .xlsm, .csv ni archivos renombrados.");
        }
        if (file.getSize() > MAX_ARCHIVO_BYTES) {
            errores.add("El archivo supera el límite máximo de 10 MB.");
        }
    }

    private CargaBancoResponseDto respuestaFallida(RolExamen rol, List<String> errores) {
        return CargaBancoResponseDto.builder()
                .exito(false)
                .mensaje("Validación fallida")
                .rolExamenId(rol == null ? null : rol.getId())
                .erroresValidacion(errores)
                .build();
    }

    private Sheet encontrarHojaBanco(Workbook workbook) {
        for (int indice = 0; indice < workbook.getNumberOfSheets(); indice++) {
            Sheet sheet = workbook.getSheetAt(indice);
            if ("banco".equals(normalizarEncabezado(sheet.getSheetName()))) return sheet;
        }
        return null;
    }

    private Map<String, Integer> validarEncabezados(Sheet sheet, FormulaEvaluator evaluador, List<String> errores) {
        Map<String, Integer> columnas = new LinkedHashMap<>();
        Row encabezado = sheet.getRow(0);
        if (encabezado == null) {
            errores.add("La hoja Banco no tiene fila de encabezados.");
            return columnas;
        }
        for (int indice = 0; indice < encabezado.getLastCellNum(); indice++) {
            String nombre = getCellString(encabezado.getCell(indice), evaluador);
            String canonico = aliasColumna(nombre);
            if (canonico == null) continue;
            if (columnas.containsKey(canonico)) {
                errores.add("Encabezado duplicado: " + nombre);
            } else {
                columnas.put(canonico, indice);
            }
        }
        List<String> requeridas = List.of("tipo", "enunciado", "opcion_a", "opcion_b", "opcion_c", "opcion_d", "opcion_e", "respuesta_correcta", "dificultad");
        for (String requerida : requeridas) {
            if (!columnas.containsKey(requerida)) {
                errores.add("Falta la columna oficial obligatoria: " + requerida);
            }
        }
        return columnas;
    }

    private boolean filaVacia(Row row, Map<String, Integer> columnas, FormulaEvaluator evaluador) {
        List<String> campos = List.of("tipo", "grupo", "enunciado", "opcion_a", "opcion_b", "opcion_c", "opcion_d", "opcion_e", "respuesta_correcta", "dificultad", "parcial", "peso");
        return campos.stream().allMatch(campo -> valor(row, columnas, campo, evaluador).isBlank());
    }

    private String valor(Row row, Map<String, Integer> columnas, String columna, FormulaEvaluator evaluador) {
        Integer indice = columnas.get(columna);
        return indice == null ? "" : Optional.ofNullable(getCellString(row.getCell(indice), evaluador)).orElse("").trim();
    }

    private String aliasColumna(String nombre) {
        String canonico = normalizarEncabezado(nombre);
        return switch (canonico) {
            case "tipo", "tipo_reactivo", "tipo_de_reactivo" -> "tipo";
            case "grupo", "grupo_contexto" -> "grupo";
            case "enunciado", "pregunta" -> "enunciado";
            case "opcion_a", "opciona", "a" -> "opcion_a";
            case "opcion_b", "opcionb", "b" -> "opcion_b";
            case "opcion_c", "opcionc", "c" -> "opcion_c";
            case "opcion_d", "opciond", "d" -> "opcion_d";
            case "opcion_e", "opcione", "e" -> "opcion_e";
            case "respuesta", "respuesta_correcta", "clave", "clave_respuesta" -> "respuesta_correcta";
            case "dificultad", "nivel", "nivel_dificultad" -> "dificultad";
            case "parcial", "tipo_parcial" -> "parcial";
            case "peso", "peso_puntos", "puntaje" -> "peso";
            default -> null;
        };
    }

    private String normalizarEncabezado(String valor) {
        return Normalizer.normalize(valor == null ? "" : valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .trim()
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "_")
                .replaceAll("^_|_$", "");
    }

    private void validarTexto(String campo, String valor, int rowNum, int maximo, List<String> errores) {
        if (valor == null || valor.isBlank()) return;
        if (valor.length() > maximo) {
            errores.add("Fila " + (rowNum + 1) + ": " + campo + " supera el máximo de " + maximo + " caracteres");
        }
        if (valor.chars().anyMatch(caracter -> Character.isISOControl(caracter) && caracter != '\n' && caracter != '\r' && caracter != '\t')) {
            errores.add("Fila " + (rowNum + 1) + ": " + campo + " contiene caracteres de control no permitidos");
        }
        if (valor.chars().filter(caracter -> caracter == '$').count() % 2 != 0) {
            errores.add("Fila " + (rowNum + 1) + ": " + campo + " contiene delimitadores de fórmula $ sin cerrar");
        }
        for (String errorFormula : ERRORES_FORMULA) {
            if (valor.toUpperCase(Locale.ROOT).contains(errorFormula)) {
                errores.add("Fila " + (rowNum + 1) + ": " + campo + " contiene el error de fórmula " + errorFormula);
            }
        }
    }

    private void validarOpciones(String tipo, Map<String, String> opciones, int rowNum, List<String> errores) {
        Set<String> textos = new HashSet<>();
        for (Map.Entry<String, String> entrada : opciones.entrySet()) {
            if (entrada.getValue().isBlank()) continue;
            String huella = normalizarContenido(entrada.getValue());
            if (!textos.add(huella)) {
                errores.add("Fila " + (rowNum + 1) + ": las opciones contienen texto duplicado");
            }
        }

        List<String> completas = List.of("A", "B", "C", "D", "E");
        List<String> abcd = List.of("A", "B", "C", "D");
        switch (tipo) {
            case "SELECCION_MEJOR_RESPUESTA", "SUBITEM_CASO" -> exigirOpciones(opciones, completas, rowNum, errores);
            case "VERDADERO_O_FALSO_SIMPLE" -> {
                exigirOpciones(opciones, List.of("A", "B"), rowNum, errores);
                exigirVacias(opciones, List.of("C", "D", "E"), rowNum, errores);
            }
            case "VERDADERO_O_FALSO_COMPLEJAS", "RESPUESTA_PREMISAS_ABCD" -> {
                exigirOpciones(opciones, abcd, rowNum, errores);
                exigirVacias(opciones, List.of("E"), rowNum, errores);
            }
            case "CASO_CLINICO_TRONCO" -> exigirVacias(opciones, completas, rowNum, errores);
            case "EMPAREJAMIENTO_TRONCO" -> {
                int activas = (int) opciones.values().stream().filter(valor -> !valor.isBlank()).count();
                if (activas < 2 || activas > 5) errores.add("Fila " + (rowNum + 1) + ": el enunciado principal debe tener entre 2 y 5 opciones de referencia en las columnas A a E");
            }
            case "OPCION_EMPAREJAMIENTO" -> exigirVacias(opciones, completas, rowNum, errores);
            default -> { }
        }
    }

    private void exigirOpciones(Map<String, String> opciones, List<String> requeridas, int rowNum, List<String> errores) {
        for (String letra : requeridas) {
            if (opciones.getOrDefault(letra, "").isBlank()) {
                errores.add("Fila " + (rowNum + 1) + ": falta el texto de la opción " + letra);
            }
        }
    }

    private void exigirVacias(Map<String, String> opciones, List<String> letras, int rowNum, List<String> errores) {
        for (String letra : letras) {
            if (!opciones.getOrDefault(letra, "").isBlank()) {
                errores.add("Fila " + (rowNum + 1) + ": la opción " + letra + " no aplica para esta tipología");
            }
        }
    }

    private void validarEstructuraAgrupada(List<FilaEstructura> filas, List<String> errores) {
        validarBloqueAgrupado(
                filas,
                "EMPAREJAMIENTO_TRONCO",
                "OPCION_EMPAREJAMIENTO",
                "emparejamiento",
                "opciones de emparejamiento",
                errores);
        validarBloqueAgrupado(
                filas,
                "CASO_CLINICO_TRONCO",
                "SUBITEM_CASO",
                "caso o problema",
                "preguntas relacionadas",
                errores);
    }

    private void validarBloqueAgrupado(
            List<FilaEstructura> filas,
            String tipoPrincipal,
            String tipoHijo,
            String nombreBloque,
            String nombreHijos,
            List<String> errores) {
        Map<String, List<FilaEstructura>> principalesPorGrupo = agruparPorGrupo(filas, tipoPrincipal);
        Map<String, List<FilaEstructura>> hijosPorGrupo = agruparPorGrupo(filas, tipoHijo);
        Set<String> grupos = new LinkedHashSet<>();
        grupos.addAll(principalesPorGrupo.keySet());
        grupos.addAll(hijosPorGrupo.keySet());

        for (String grupo : grupos) {
            List<FilaEstructura> principales = principalesPorGrupo.getOrDefault(grupo, List.of());
            List<FilaEstructura> hijos = hijosPorGrupo.getOrDefault(grupo, List.of());

            if (principales.isEmpty()) {
                for (FilaEstructura hijo : hijos) {
                    errores.add("Fila " + hijo.fila() + ": esta " + nombreBloque
                            + " necesita primero un enunciado principal con el mismo grupo '" + grupo + "'");
                }
                continue;
            }

            if (principales.size() > 1) {
                for (int indice = 1; indice < principales.size(); indice++) {
                    errores.add("Fila " + principales.get(indice).fila() + ": el grupo '" + grupo
                            + "' solo puede tener un enunciado principal de " + nombreBloque);
                }
            }

            FilaEstructura principal = principales.get(0);
            if (hijos.size() < MIN_HIJOS_AGRUPADOS || hijos.size() > MAX_HIJOS_AGRUPADOS) {
                errores.add("Fila " + principal.fila() + ": el grupo '" + grupo + "' necesita entre "
                        + MIN_HIJOS_AGRUPADOS + " y " + MAX_HIJOS_AGRUPADOS + " " + nombreHijos);
            }

            int posicionPrincipal = filas.indexOf(principal);
            Set<Integer> posicionesInmediatas = new HashSet<>();
            for (int posicion = posicionPrincipal + 1; posicion < filas.size(); posicion++) {
                FilaEstructura siguiente = filas.get(posicion);
                if (tipoHijo.equals(siguiente.tipo()) && grupo.equals(siguiente.grupo())) {
                    posicionesInmediatas.add(posicion);
                    continue;
                }
                break;
            }

            for (FilaEstructura hijo : hijos) {
                int posicionHijo = filas.indexOf(hijo);
                if (!posicionesInmediatas.contains(posicionHijo)) {
                    errores.add("Fila " + hijo.fila() + ": esta fila debe aparecer inmediatamente después del enunciado principal del grupo '"
                            + grupo + "'; no dejes otras filas entre ambos");
                }
            }
        }
    }

    private Map<String, List<FilaEstructura>> agruparPorGrupo(List<FilaEstructura> filas, String tipo) {
        Map<String, List<FilaEstructura>> resultado = new LinkedHashMap<>();
        for (FilaEstructura fila : filas) {
            if (tipo.equals(fila.tipo()) && !fila.grupo().isBlank()) {
                resultado.computeIfAbsent(fila.grupo(), ignorado -> new ArrayList<>()).add(fila);
            }
        }
        return resultado;
    }

    private String normalizarRespuestaCorrecta(String respuesta, String tipo) {
        String valor = respuesta == null ? "" : respuesta.trim().toUpperCase(Locale.ROOT);
        if ("VERDADERO_O_FALSO_SIMPLE".equals(tipo)) {
            if ("VERDADERO".equals(valor)) return "A";
            if ("FALSO".equals(valor)) return "B";
        }
        return valor.matches("[A-E]") ? valor : "";
    }

    private int parsearDificultad(String dificultad) {
        String valor = Normalizer.normalize(dificultad == null ? "" : dificultad, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "").trim().toUpperCase(Locale.ROOT);
        return switch (valor) {
            case "1", "FACIL" -> 1;
            case "2", "MEDIO" -> 2;
            case "3", "DIFICIL" -> 3;
            default -> 0;
        };
    }

    private boolean parcialCoincide(String parcial, TipoParcial esperado) {
        if (esperado == null) return true;
        String valor = normalizarEncabezado(parcial).replace("_", "");
        return switch (esperado) {
            case PRIMER_PARCIAL -> Set.of("1p", "1erparcial", "primerparcial").contains(valor);
            case SEGUNDO_PARCIAL -> Set.of("2p", "2doparcial", "segundoparcial").contains(valor);
            case FINAL -> Set.of("ef", "final", "examenfinal").contains(valor);
            case SEGUNDA_INSTANCIA -> Set.of("2i", "2dainstancia", "segundainstancia").contains(valor);
        };
    }

    private String huellaPregunta(Reactivo reactivo) {
        return normalizarContenido(reactivo.getTipoReactivo() + "|" + Optional.ofNullable(reactivo.getGrupoContexto()).orElse("") + "|" + reactivo.getEnunciado());
    }

    private String normalizarContenido(String valor) {
        return Normalizer.normalize(valor == null ? "" : valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .replaceAll("\\s+", " ")
                .trim().toLowerCase(Locale.ROOT);
    }

    private void validarCuotas(int faciles, int medias, int dificiles, int total, List<String> errores) {
        if (total < TOTAL_REQUERIDO) {
            errores.add("El banco debe tener como mínimo " + TOTAL_REQUERIDO + " reactivos; se encontraron " + total);
        }
        if (faciles < CUOTA_FACILES) {
            errores.add("Debe haber como mínimo " + CUOTA_FACILES + " preguntas fáciles; se encontraron " + faciles);
        }
        if (medias < CUOTA_MEDIAS) {
            errores.add("Debe haber como mínimo " + CUOTA_MEDIAS + " preguntas medias; se encontraron " + medias);
        }
        if (dificiles < CUOTA_DIFICILES) {
            errores.add("Debe haber como mínimo " + CUOTA_DIFICILES + " preguntas difíciles; se encontraron " + dificiles);
        }
    }

    private String normalizarTipo(String tipo) {
        String tipoCanonico = Normalizer.normalize(tipo == null ? "" : tipo, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .trim()
                .toUpperCase(Locale.ROOT)
                .replaceAll("[^A-Z0-9]+", "_")
                .replaceAll("^_|_$", "");

        return switch (tipoCanonico) {
            case "SELECCION_SIMPLE", "SELECCION_UNICA", "SELECCION_MEJOR_RESPUESTA",
                    "SELECCION_DE_LA_MEJOR_RESPUESTA" -> "SELECCION_MEJOR_RESPUESTA";
            case "FALSO_VERDADERO", "VERDADERO_O_FALSO_SIMPLE" -> "VERDADERO_O_FALSO_SIMPLE";
            case "PREGUNTA_CON_CLAVE", "VERDADERO_O_FALSO_COMPLEJAS" -> "VERDADERO_O_FALSO_COMPLEJAS";
            case "RESPUESTA_COMPUESTA", "RESPUESTA_PREMISAS_ABCD",
                    "RESPUESTA_A_B_AMBAS_NINGUNA" -> "RESPUESTA_PREMISAS_ABCD";
            case "ITEMS_AGRUPADOS_POR_CASO_CLINICO_O_PROBLEMA", "CASO_CLINICO_TRONCO", "CASO_CLINICO" -> "CASO_CLINICO_TRONCO";
            case "PROBLEMA", "SUBPROBLEMA", "SUBITEM_CASO", "SUBITEM_DE_CASO_O_PROBLEMA" -> "SUBITEM_CASO";
            case "EMPAREJAMIENTO_AMPLIADO", "EMPAREJAMIENTO_DE_CONCEPTOS", "EMPAREJAMIENTO_TRONCO" -> "EMPAREJAMIENTO_TRONCO";
            case "EMPAREJAMIENTO", "OPCION_EMPAREJAMIENTO" -> "OPCION_EMPAREJAMIENTO";
            case "OPCION_DE_EMPAREJAMIENTO_AMPLIADO" -> "OPCION_EMPAREJAMIENTO";
            default -> null;
        };
    }

    private String getCellString(Cell cell, FormulaEvaluator evaluador) {
        if (cell == null) return "";
        DataFormatter formatter = new DataFormatter(Locale.ROOT);
        return formatter.formatCellValue(cell, evaluador).trim();
    }

    private String toJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "[]";
        }
    }

    private String calcularSha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                hexString.append(String.format("%02x", b));
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 no disponible", e);
        }
    }

    private record FilaEstructura(int fila, String tipo, String grupo) {
    }
}
