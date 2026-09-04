package com.xpertiflow.evaluaciones.infrastructure.messaging;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionTypstResultadoDto;
import com.xpertiflow.evaluaciones.application.generacion.GeneracionTypstService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class ResultadoGeneracionListener {

    private final ObjectMapper objectMapper;
    private final GeneracionTypstService generacionTypstService;
    private final RabbitTemplate rabbitTemplate;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_GENERACION_RESULTADO)
    public void recibirResultado(String mensajeJson) {
        log.info("Resultado de generacion recibido");
        try {
            GeneracionTypstResultadoDto resultado = objectMapper.readValue(mensajeJson, GeneracionTypstResultadoDto.class);

            if ("COMPLETADO".equalsIgnoreCase(resultado.getEstado())
                    && !Boolean.TRUE.equals(resultado.getModoPrevisualizacion())) {
                try {
                    generacionTypstService.persistirResultado(resultado);
                } catch (Exception persistenceEx) {
                    log.error("Error al persistir resultado del job {}", resultado.getJobId(), persistenceEx);
                    GeneracionTypstResultadoDto errorResultado = new GeneracionTypstResultadoDto();
                    errorResultado.setJobId(resultado.getJobId());
                    errorResultado.setRolExamenId(resultado.getRolExamenId());
                    errorResultado.setEstado("ERROR_PERSISTENCIA");
                    errorResultado.setMensaje("Error al persistir: " + persistenceEx.getMessage());
                    errorResultado.setVariantes(resultado.getVariantes());
                    errorResultado.setMapeos(resultado.getMapeos());
                    publicarError(errorResultado);
                    generacionTypstService.actualizarEstado(errorResultado);
                    return;
                }
            }

            generacionTypstService.actualizarEstado(resultado);
            log.info("Job {} actualizado a estado {}", resultado.getJobId(), resultado.getEstado());
        } catch (JsonProcessingException e) {
            log.error("Error al deserializar resultado de generacion", e);
        } catch (Exception e) {
            log.error("Error al procesar resultado de generacion", e);
        }
    }

    private void publicarError(GeneracionTypstResultadoDto errorResultado) {
        try {
            String json = objectMapper.writeValueAsString(errorResultado);
            rabbitTemplate.convertAndSend(RabbitMQConfig.QUEUE_GENERACION_RESULTADO, json);
            log.info("Mensaje de error publicado en cola para job {}", errorResultado.getJobId());
        } catch (Exception e) {
            log.error("No se pudo publicar mensaje de error en cola", e);
        }
    }
}
