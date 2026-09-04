package com.xpertiflow.evaluaciones.infrastructure.messaging;

import com.xpertiflow.evaluaciones.application.OmrProcesamientoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class OmrResultadoListener {
    private final OmrProcesamientoService omrProcesamientoService;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_OMR_RESULTADO)
    public void recibir(String mensaje) {
        try {
            omrProcesamientoService.registrarResultado(mensaje);
        } catch (Exception exception) {
            log.error("No se pudo registrar el resultado OMR", exception);
        }
    }
}
