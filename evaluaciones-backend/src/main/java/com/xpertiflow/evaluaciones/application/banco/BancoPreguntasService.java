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

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheet("Banco");
            if (sheet == null) {
                sheet = workbook.getSheetAt(0);
            }

            int faciles = 0, medias = 0, dificiles = 0;
            int rowNum = 0;

            for (Row row : sheet) {
                if (rowNum == 0) {
                    rowNum++;
                    continue; // header
                }

                Reactivo r = parsearFila(row, rowNum, errores);
                if (r != null) {
                    reactivos.add(r);
                    switch (r.getNivelDificultad()) {
                        case 1 -> faciles++;
                        case 2 -> medias++;
                        case 3 -> dificiles++;
                    }
                }
                rowNum++;
            }

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
            banco.setDocenteAprobador(docenteAprobador != null ? docenteAprobador : rol.getDocenteNombre());
            banco.setFechaAprobacion(LocalDateTime.now());
            bancoRepository.save(banco);

            // Guardar reactivos
            int orden = 1;
            for (Reactivo r : reactivos) {
                r.setBancoId(bancoId);
                r.setNumeroOrden(orden++);
                reactivoRepository.save(r);
            }

            rolExamenService.validarPorBanco(rol.getId(), hash, docenteAprobador);

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

        } catch (IOException e) {
            throw new RuntimeException("Error al leer el archivo Excel", e);
        }
    }

    private Reactivo parsearFila(Row row, int rowNum, List<String> errores) {
        String tipo = getCellString(row.getCell(0));
        String enunciado = getCellString(row.getCell(2));
        String respuesta = getCellString(row.getCell(8));
        String dificultadStr = getCellString(row.getCell(9));

        if (tipo == null || tipo.isBlank()) {
            return null; // fila vacía
        }

        if (enunciado == null || enunciado.isBlank()) {
            errores.add("Fila " + (rowNum + 1) + ": enunciado vacio");
            return null;
        }

        String tipoNormalizado = normalizarTipo(tipo);
        if (tipoNormalizado == null) {
            errores.add("Fila " + (rowNum + 1) + ": tipo desconocido '" + tipo + "'");
            return null;
        }

        int nivelDificultad;
        try {
            nivelDificultad = Integer.parseInt(dificultadStr);
            if (nivelDificultad < 1 || nivelDificultad > 3) {
                throw new IllegalArgumentException();
            }
        } catch (Exception e) {
            errores.add("Fila " + (rowNum + 1) + ": dificultad invalida '" + dificultadStr + "'");
            return null;
        }

        List<Map<String, Object>> opciones = new ArrayList<>();
        String[] letras = {"A", "B", "C", "D", "E"};
        for (int i = 0; i < 5; i++) {
            String texto = getCellString(row.getCell(3 + i));
            if (texto != null && !texto.isBlank()) {
                Map<String, Object> op = new LinkedHashMap<>();
                op.put("letra", letras[i]);
                op.put("texto", texto);
                op.put("correcta", letras[i].equalsIgnoreCase(respuesta));
                opciones.add(op);
            }
        }

        if (respuesta == null || respuesta.isBlank()) {
            errores.add("Fila " + (rowNum + 1) + ": respuesta correcta vacia");
            return null;
        }

        Reactivo r = new Reactivo();
        r.setTipoReactivo(tipoNormalizado);
        r.setEnunciado(enunciado);
        r.setOpcionesJson(toJson(opciones));
        r.setRespuestaCorrecta(respuesta.toUpperCase());
        r.setNivelDificultad(nivelDificultad);
        r.setDificultad(nivelDificultad == 1 ? "Fácil" : nivelDificultad == 2 ? "Medio" : "Difícil");
        r.setPesoPuntos(BigDecimal.ONE);
        r.setGrupoContexto(getCellString(row.getCell(1)));
        return r;
    }

    private void validarCuotas(int faciles, int medias, int dificiles, int total, List<String> errores) {
        if (total != TOTAL_REQUERIDO) {
            errores.add("Total de reactivos debe ser " + TOTAL_REQUERIDO + ", se encontraron " + total);
        }
        if (faciles != CUOTA_FACILES) {
            errores.add("Cuota de faciles debe ser " + CUOTA_FACILES + ", se encontraron " + faciles);
        }
        if (medias != CUOTA_MEDIAS) {
            errores.add("Cuota de medias debe ser " + CUOTA_MEDIAS + ", se encontraron " + medias);
        }
        if (dificiles != CUOTA_DIFICILES) {
            errores.add("Cuota de dificiles debe ser " + CUOTA_DIFICILES + ", se encontraron " + dificiles);
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
            case "PROBLEMA", "SUBPROBLEMA", "SUBITEM_CASO", "SUBITEM_DE_CASO_O_PROBLEMA" -> "SUBITEM_CASO";
            case "EMPAREJAMIENTO", "OPCION_EMPAREJAMIENTO" -> "OPCION_EMPAREJAMIENTO";
            case "EMPAREJAMIENTO_AMPLIADO", "EMPAREJAMIENTO_DE_CONCEPTOS" -> "EMPAREJAMIENTO_TRONCO";
            case "OPCION_DE_EMPAREJAMIENTO_AMPLIADO" -> "OPCION_EMPAREJAMIENTO";
            default -> null;
        };
    }

    private String getCellString(Cell cell) {
        if (cell == null) return null;
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((int) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> null;
        };
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
}
