package com.xpertiflow.evaluaciones.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.config.AppProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;

/** Adaptador mínimo para Vault Transit. No almacena ni expone la KEK. */
@Component
@RequiredArgsConstructor
public class VaultTransitKeyManagementProvider implements KeyManagementProvider {

    private final AppProperties appProperties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();

    @Override
    public WrappedKey wrapDataKey(byte[] dataKey, String context) {
        JsonNode data = post("/v1/transit/encrypt/" + appProperties.getKms().getVault().getTransitKeyName(),
                Map.of("plaintext", Base64.getEncoder().encodeToString(dataKey)));
        String ciphertext = data.path("ciphertext").asText("");
        if (ciphertext.isBlank()) throw new IllegalStateException("Vault no devolvió una clave envuelta");
        return new WrappedKey(ciphertext, data.path("key_version").asText(""));
    }

    @Override
    public byte[] unwrapDataKey(String wrappedKey, String context) {
        JsonNode data = post("/v1/transit/decrypt/" + appProperties.getKms().getVault().getTransitKeyName(),
                Map.of("ciphertext", wrappedKey));
        String plaintext = data.path("plaintext").asText("");
        if (plaintext.isBlank()) throw new IllegalStateException("Vault no devolvió la clave de datos");
        byte[] dataKey = Base64.getDecoder().decode(plaintext);
        if (dataKey.length != 32) {
            java.util.Arrays.fill(dataKey, (byte) 0);
            throw new IllegalStateException("Vault devolvió una DEK con longitud no válida");
        }
        return dataKey;
    }

    @Override
    public WrappedKey rewrapDataKey(String wrappedKey, String context) {
        JsonNode data = post("/v1/transit/rewrap/" + appProperties.getKms().getVault().getTransitKeyName(),
                Map.of("ciphertext", wrappedKey));
        String ciphertext = data.path("ciphertext").asText("");
        if (ciphertext.isBlank()) throw new IllegalStateException("Vault no devolvió la DEK reenvuelta");
        return new WrappedKey(ciphertext, data.path("key_version").asText(""));
    }

    @Override
    public String keyReference() {
        return appProperties.getKms().getVault().getTransitKeyName();
    }

    private JsonNode post(String path, Object payload) {
        String token = readToken();
        if (token.isBlank()) throw new IllegalStateException("No está configurado el token de Vault");
        try {
            String body = objectMapper.writeValueAsString(payload);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(normalizedAddress() + path))
                    .timeout(Duration.ofSeconds(appProperties.getKms().getVault().getTimeoutSeconds()))
                    .header("X-Vault-Token", token)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new IllegalStateException("Vault rechazó la operación de cifrado (HTTP " + response.statusCode() + ")");
            }
            JsonNode root = objectMapper.readTree(response.body());
            return root.path("data");
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo comunicar con Vault", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("La comunicación con Vault fue interrumpida", exception);
        }
    }

    private String readToken() {
        String tokenFile = appProperties.getKms().getVault().getTokenFile();
        if (tokenFile != null && !tokenFile.isBlank()) {
            try {
                if (Files.exists(Path.of(tokenFile))) {
                    return Files.readString(Path.of(tokenFile), StandardCharsets.UTF_8).trim();
                }
            } catch (IOException exception) {
                throw new IllegalStateException("No se pudo leer la credencial protegida de Vault", exception);
            }
        }
        return appProperties.getKms().getVault().getToken();
    }

    private String normalizedAddress() {
        return appProperties.getKms().getVault().getAddress().replaceAll("/+$", "");
    }

}
