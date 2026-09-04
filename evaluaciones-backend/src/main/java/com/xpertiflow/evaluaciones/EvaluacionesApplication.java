package com.xpertiflow.evaluaciones;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import com.xpertiflow.evaluaciones.config.AppProperties;

@SpringBootApplication
@EnableAsync
@EnableScheduling
@EnableConfigurationProperties(AppProperties.class)
public class EvaluacionesApplication {

    public static void main(String[] args) {
        SpringApplication.run(EvaluacionesApplication.class, args);
    }
}
