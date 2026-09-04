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
    private Kms kms = new Kms();
    private Backups backups = new Backups();

    @Getter
    @Setter
    public static class Storage {
        private String basePath = "C:/laragon/www/evaluaciones/storage";
    }

    @Getter
    @Setter
    public static class Kms {
        private Vault vault = new Vault();
    }

    @Getter
    @Setter
    public static class Vault {
        private String address = "http://localhost:8200";
        private String tokenFile = "";
        private String token = "";
        private String transitKeyName = "sea-banco-kek";
        private int timeoutSeconds = 10;
    }

    @Getter
    @Setter
    public static class Backups {
        private String externalPath = "/app/backups-external";
        private String localRepository = "/app/backups/repository";
        private String externalRepository = "/app/backups-external/repository";
        private String passwordFile = "/run/secrets/restic_password";
    }
}
