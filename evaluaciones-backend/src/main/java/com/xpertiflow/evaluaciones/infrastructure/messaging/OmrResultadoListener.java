package com.xpertiflow.evaluaciones.infrastructure.messaging;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.application.OmrProcesamientoService;
import com.xpertiflow.evaluaciones.application.TestVocacionalService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OmrResultadoListener {
    private final OmrProcesamientoService omrProcesamientoService;
    private final TestVocacionalService testVocacionalService;
    private final ObjectMapper objectMapper;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_OMR_RESULTADO)
    public void recibir(String mensaje) {
        try {
            JsonNode root = objectMapper.readTree(mensaje);
            String tipo = root.path("tipo").asText();
            if ("TEST_VOCACIONAL".equalsIgnoreCase(tipo)) {
                testVocacionalService.registrarResultadoWorker(root);
            } else if ("TEST_VOCACIONAL_PROGRESO".equalsIgnoreCase(tipo)) {
                testVocacionalService.actualizarProgresoWorker(root);
            } else {
                omrProcesamientoService.registrarResultado(mensaje);
            }
        } catch (Exception exception) {
            log.error("No se pudo registrar el resultado OMR", exception);
        }
    }
}

