package com.xpertiflow.evaluaciones;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import com.xpertiflow.evaluaciones.config.AppProperties;

@SpringBootApplication
@EnableAsync
@EnableConfigurationProperties(AppProperties.class)
public class EvaluacionesApplication {

    public static void main(String[] args) {
        SpringApplication.run(EvaluacionesApplication.class, args);
    }
}
