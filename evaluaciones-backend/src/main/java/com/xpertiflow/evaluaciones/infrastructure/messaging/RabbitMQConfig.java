package com.xpertiflow.evaluaciones.infrastructure.messaging;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE_GENERACION_TYPST = "evaluaciones.generacion.typst";
    public static final String QUEUE_GENERACION_RESULTADO = "evaluaciones.generacion.resultado";
    public static final String QUEUE_OMR_PROCESAR = "evaluaciones.omr.procesar";
    public static final String QUEUE_OMR_RESULTADO = "evaluaciones.omr.resultado";
    public static final String QUEUE_BACKUPS = "evaluaciones.backups";

    @Bean
    public Queue generacionTypstQueue() {
        return new Queue(QUEUE_GENERACION_TYPST, true);
    }

    @Bean
    public Queue generacionResultadoQueue() {
        return new Queue(QUEUE_GENERACION_RESULTADO, true);
    }

    @Bean
    public Queue omrProcesarQueue() {
        return new Queue(QUEUE_OMR_PROCESAR, true);
    }

    @Bean
    public Queue omrResultadoQueue() {
        return new Queue(QUEUE_OMR_RESULTADO, true);
    }

    @Bean
    public Queue backupsQueue() {
        return new Queue(QUEUE_BACKUPS, true);
    }
}
