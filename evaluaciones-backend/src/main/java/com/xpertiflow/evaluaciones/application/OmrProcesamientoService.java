package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class OmrProcesamientoService {
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;
    private final AppProperties appProperties;
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

    public void registrarResultado(String mensaje) throws IOException {
        JsonNode resultado = objectMapper.readTree(mensaje);
        resultados.put(resultado.path("jobId").asText(), resultado);
    }
}
