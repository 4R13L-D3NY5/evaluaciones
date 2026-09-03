package com.xpertiflow.evaluaciones.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;

/** Cifrado envelope con AES-256-GCM y una DEK por paquete. */
@Service
@RequiredArgsConstructor
public class BancoCifradoService {

    public static final String ALGORITHM = "AES-256-GCM-v1";
    private static final int KEY_BYTES = 32;
    private static final int NONCE_BYTES = 12;
    private static final int TAG_BITS = 128;

    private final KeyManagementProvider keyManagementProvider;
    private final ObjectMapper objectMapper;
    private final SecureRandom secureRandom = new SecureRandom();

    public BancoEncryptedPayload cifrarTexto(String plaintext, String context) {
        if (plaintext == null) throw new IllegalArgumentException("No se puede cifrar contenido nulo");
        byte[] dek = new byte[KEY_BYTES];
        byte[] nonce = new byte[NONCE_BYTES];
        secureRandom.nextBytes(dek);
        secureRandom.nextBytes(nonce);
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(dek, "AES"), new GCMParameterSpec(TAG_BITS, nonce));
            cipher.updateAAD(context.getBytes(StandardCharsets.UTF_8));
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            KeyManagementProvider.WrappedKey wrapped = keyManagementProvider.wrapDataKey(dek, context);
            return BancoEncryptedPayload.builder()
                    .ciphertext(Base64.getEncoder().encodeToString(ciphertext))
                    .nonce(Base64.getEncoder().encodeToString(nonce))
                    .wrappedDataKey(wrapped.value())
                    .keyReference(keyManagementProvider.keyReference())
                    .keyVersion(wrapped.version())
                    .algorithm(ALGORITHM)
                    .build();
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("No se pudo cifrar el contenido del banco de preguntas", exception);
        } finally {
            java.util.Arrays.fill(dek, (byte) 0);
        }
    }

    public BancoEncryptedPayload cifrarJson(Object value, String context) {
        try {
            return cifrarTexto(objectMapper.writeValueAsString(value), context);
        } catch (Exception exception) {
            throw new IllegalStateException("No se pudo serializar el contenido antes de cifrarlo", exception);
        }
    }

    public String descifrarTexto(BancoEncryptedPayload payload, String context) {
        if (payload == null || payload.getCiphertext() == null || payload.getNonce() == null
                || payload.getWrappedDataKey() == null) {
            throw new IllegalArgumentException("El paquete cifrado está incompleto");
        }
        byte[] dek = keyManagementProvider.unwrapDataKey(payload.getWrappedDataKey(), context);
        try {
            Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
            cipher.init(Cipher.DECRYPT_MODE,
                    new SecretKeySpec(dek, "AES"),
                    new GCMParameterSpec(TAG_BITS, Base64.getDecoder().decode(payload.getNonce())));
            cipher.updateAAD(context.getBytes(StandardCharsets.UTF_8));
            return new String(cipher.doFinal(Base64.getDecoder().decode(payload.getCiphertext())), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException exception) {
            throw new IllegalStateException("El contenido cifrado no pudo validarse o descifrarse", exception);
        } finally {
            java.util.Arrays.fill(dek, (byte) 0);
        }
    }

    /**
     * Actualiza solamente el sobre de la DEK. El ciphertext permanece intacto.
     * La operación es útil durante una rotación de la KEK en Vault.
     */
    public BancoEncryptedPayload reenfundar(BancoEncryptedPayload payload, String context) {
        if (payload == null || payload.getWrappedDataKey() == null || payload.getWrappedDataKey().isBlank()) {
            throw new IllegalArgumentException("El paquete cifrado no tiene DEK envuelta");
        }
        KeyManagementProvider.WrappedKey wrapped = keyManagementProvider
                .rewrapDataKey(payload.getWrappedDataKey(), context);
        return BancoEncryptedPayload.builder()
                .ciphertext(payload.getCiphertext())
                .nonce(payload.getNonce())
                .wrappedDataKey(wrapped.value())
                .keyReference(keyManagementProvider.keyReference())
                .keyVersion(wrapped.version())
                .algorithm(payload.getAlgorithm())
                .build();
    }
}
