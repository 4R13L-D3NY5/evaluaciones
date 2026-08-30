package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.xpertiflow.evaluaciones.api.dto.AjustarCalificacionOmrRequestDto;
import com.xpertiflow.evaluaciones.api.dto.CalificacionOmrResponseDto;
import com.xpertiflow.evaluaciones.config.AppProperties;
import com.xpertiflow.evaluaciones.domain.entity.CalificacionOmr;
import com.xpertiflow.evaluaciones.domain.entity.ExamenVariante;
import com.xpertiflow.evaluaciones.domain.entity.MapeoEstudianteVariante;
import com.xpertiflow.evaluaciones.domain.repository.CalificacionOmrRepository;
import com.xpertiflow.evaluaciones.domain.repository.ExamenVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.MapeoEstudianteVarianteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class OmrProcesamientoService {
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;
    private final AppProperties appProperties;
    private final CalificacionOmrRepository calificacionRepository;
    private final MapeoEstudianteVarianteRepository mapeoRepository;
    private final ExamenVarianteRepository varianteRepository;
    private final Map<String, JsonNode> resultados = new ConcurrentHashMap<>();

    public JsonNode solicitar(String rolExamenId, MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("Debe seleccionar un PDF o imagen escaneada.");
        }
        String jobId = "OMR-" + UUID.randomUUID();
        String original = archivo.getOriginalFilename() == null ? "" : archivo.getOriginalFilename().toLowerCase(Locale.ROOT);
        String extension = original.endsWith(".pdf") ? ".pdf" : original.endsWith(".jpg") || original.endsWith(".jpeg") ? ".jpg" : ".png";
        Path destino = Path.of(appProperties.getStorage().getBasePath(), "omr", rolExamenId, "entrada", jobId + extension);
        try {
            Files.createDirectories(destino.getParent());
            archivo.transferTo(destino);
            JsonNode solicitud = objectMapper.valueToTree(Map.of("jobId", jobId, "rolExamenId", rolExamenId, "archivoPath", destino.toString()));
            rabbitTemplate.convertAndSend("evaluaciones.omr.procesar", solicitud.toString());
            JsonNode aceptado = objectMapper.createObjectNode().put("jobId", jobId).put("estado", "EN_COLA");
            resultados.put(jobId, aceptado);
            return aceptado;
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo guardar el escaneo OMR", exception);
        }
    }

    public JsonNode consultar(String jobId) {
        return resultados.getOrDefault(jobId, objectMapper.createObjectNode().put("jobId", jobId).put("estado", "NO_ENCONTRADO"));
    }

    @Transactional(readOnly = true)
    public List<CalificacionOmrResponseDto> listarCalificaciones(String rolExamenId) {
        return calificacionRepository.findByRolExamenIdOrderByCodigoEstudianteAsc(rolExamenId).stream()
                .map(this::mapearCalificacion)
                .toList();
    }

    @Transactional
    public CalificacionOmrResponseDto ajustarCalificacion(String rolExamenId, AjustarCalificacionOmrRequestDto request) {
        String codigo = request.getCodigoEstudiante() == null ? "" : request.getCodigoEstudiante().trim();
        if (codigo.isBlank()) {
            throw new IllegalArgumentException("El código del estudiante es obligatorio.");
        }

        MapeoEstudianteVariante mapeo = mapeoRepository.findByRolExamenIdAndCodigoEstudiante(rolExamenId, codigo)
                .orElseThrow(() -> new IllegalArgumentException(
                        "El código " + codigo + " no pertenece a la nómina oficial de esta evaluación."));
        ExamenVariante variante = varianteRepository.findById(mapeo.getVarianteId())
                .orElseThrow(() -> new IllegalStateException("No existe el patrón de la variante asignada al estudiante."));

        if (request.getCodigoAnterior() != null && !request.getCodigoAnterior().isBlank()
                && !request.getCodigoAnterior().trim().equals(codigo)) {
            calificacionRepository.findByRolExamenIdAndCodigoEstudiante(rolExamenId, request.getCodigoAnterior().trim())
                    .ifPresent(calificacionRepository::delete);
        }

        Map<String, String> respuestas = normalizarRespuestas(request.getRespuestas());
        Map<String, String> patron = leerPatron(variante.getPatronClavesJson());
        int total = patron.isEmpty() ? (respuestas.isEmpty() ? 30 : respuestas.size()) : patron.size();
        int aciertos = 0;
        int blancos = 0;
        int dobles = 0;
        for (int pregunta = 1; pregunta <= total; pregunta++) {
            String respuesta = respuestas.getOrDefault(String.valueOf(pregunta), "");
            if (respuesta.isBlank()) {
                blancos++;
            } else if (respuesta.length() > 1) {
                dobles++;
            } else if (respuesta.equalsIgnoreCase(patron.getOrDefault(String.valueOf(pregunta), ""))) {
                aciertos++;
            }
        }
        int fallos = Math.max(0, total - aciertos - blancos);
        BigDecimal nota100 = total == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(aciertos * 100.0 / total).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal nota30 = total == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(aciertos * 30.0 / total).setScale(2, java.math.RoundingMode.HALF_UP);

        CalificacionOmr calificacion = calificacionRepository
                .findByRolExamenIdAndCodigoEstudiante(rolExamenId, codigo)
                .orElseGet(CalificacionOmr::new);
        calificacion.setRolExamenId(rolExamenId);
        calificacion.setCodigoEstudiante(codigo);
        calificacion.setEstudianteNombreCompleto(nombreCompleto(mapeo));
        calificacion.setLetraVariante(mapeo.getLetraVariante());
        calificacion.setTotalReactivos(total);
        calificacion.setAciertos(aciertos);
        calificacion.setFallos(fallos);
        calificacion.setBlancos(blancos);
        calificacion.setDoblesMarcas(dobles);
        calificacion.setNotaSobre30(nota30);
        calificacion.setNotaSobre100(nota100);
        calificacion.setEstadoCalificacion(nota100.doubleValue() >= 51 ? "APROBADO" : "REPROBADO");
        try {
            calificacion.setRespuestasDetectadasJson(objectMapper.writeValueAsString(respuestas));
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudieron serializar las respuestas ajustadas.", exception);
        }
        calificacion.setProcesadoPor(usuarioValido(request.getUsuario()) + "_AJUSTE_OMR");
        return mapearCalificacion(calificacionRepository.save(calificacion));
    }

    private Map<String, String> leerPatron(String patronJson) {
        if (patronJson == null || patronJson.isBlank()) return Map.of();
        try {
            return objectMapper.readValue(patronJson, new TypeReference<LinkedHashMap<String, String>>() {});
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo leer el patrón oficial de la variante.", exception);
        }
    }

    private Map<String, String> normalizarRespuestas(Map<String, String> respuestas) {
        Map<String, String> normalizadas = new LinkedHashMap<>();
        if (respuestas == null) return normalizadas;
        respuestas.forEach((pregunta, respuesta) -> {
            if (pregunta == null || pregunta.isBlank()) return;
            String valor = respuesta == null ? "" : respuesta.trim().toUpperCase(Locale.ROOT);
            normalizadas.put(pregunta.trim(), "—".equals(valor) ? "" : valor);
        });
        return normalizadas;
    }

    private String nombreCompleto(MapeoEstudianteVariante mapeo) {
        return String.join(" ", List.of(mapeo.getNombres(), mapeo.getApellidoPaterno(), mapeo.getApellidoMaterno()).stream()
                .filter(valor -> valor != null && !valor.isBlank()).toList());
    }

    private String usuarioValido(String usuario) {
        return usuario == null || usuario.isBlank() ? "ADMIN_EVALUACIONES" : usuario.trim();
    }

    private CalificacionOmrResponseDto mapearCalificacion(CalificacionOmr calificacion) {
        CalificacionOmrResponseDto dto = new CalificacionOmrResponseDto();
        dto.setId(calificacion.getId());
        dto.setRolExamenId(calificacion.getRolExamenId());
        dto.setCodigoEstudiante(calificacion.getCodigoEstudiante());
        dto.setEstudianteNombreCompleto(calificacion.getEstudianteNombreCompleto());
        dto.setLetraVariante(calificacion.getLetraVariante());
        dto.setTotalReactivos(calificacion.getTotalReactivos());
        dto.setAciertos(calificacion.getAciertos());
        dto.setFallos(calificacion.getFallos());
        dto.setBlancos(calificacion.getBlancos());
        dto.setDoblesMarcas(calificacion.getDoblesMarcas());
        dto.setNotaSobre30(calificacion.getNotaSobre30());
        dto.setNotaSobre100(calificacion.getNotaSobre100());
        dto.setEstadoCalificacion(calificacion.getEstadoCalificacion());
        dto.setRespuestasDetectadasJson(calificacion.getRespuestasDetectadasJson());
        dto.setImagenCartillaAnotadaPath(calificacion.getImagenCartillaAnotadaPath());
        dto.setArchivoEscaneadoPath(calificacion.getArchivoEscaneadoPath());
        dto.setProcesadoPor(calificacion.getProcesadoPor());
        dto.setFechaProcesamiento(calificacion.getFechaProcesamiento());
        return dto;
    }

    public void registrarResultado(String mensaje) throws IOException {
        JsonNode resultado = objectMapper.readTree(mensaje);
        resultados.put(resultado.path("jobId").asText(), resultado);
    }
}
