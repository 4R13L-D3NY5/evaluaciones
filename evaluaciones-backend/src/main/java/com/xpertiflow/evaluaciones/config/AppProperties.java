package com.xpertiflow.evaluaciones.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private Storage storage = new Storage();

    @Getter
    @Setter
    public static class Storage {
        private String basePath = "C:/laragon/www/evaluaciones/storage";
    }
}
