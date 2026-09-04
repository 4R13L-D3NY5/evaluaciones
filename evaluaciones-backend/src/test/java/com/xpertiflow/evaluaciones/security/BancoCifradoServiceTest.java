package com.xpertiflow.evaluaciones.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.Arrays;
import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BancoCifradoServiceTest {

    @Test
    void cifraYDescifraConContextoAutenticado() {
        BancoCifradoService service = new BancoCifradoService(new InMemoryKeyManagementProvider(), new ObjectMapper());

        BancoEncryptedPayload payload = service.cifrarTexto("Pregunta reservada", "banco:BANCO-1:rol:ROL-1");

        assertThat(payload.getCiphertext()).isNotEqualTo("Pregunta reservada");
        assertThat(service.descifrarTexto(payload, "banco:BANCO-1:rol:ROL-1"))
                .isEqualTo("Pregunta reservada");
    }

    @Test
    void rechazaUnContextoAlterado() {
        BancoCifradoService service = new BancoCifradoService(new InMemoryKeyManagementProvider(), new ObjectMapper());
        BancoEncryptedPayload payload = service.cifrarTexto("Contenido", "banco:BANCO-1:rol:ROL-1");

        assertThatThrownBy(() -> service.descifrarTexto(payload, "banco:BANCO-2:rol:ROL-1"))
                .isInstanceOf(IllegalStateException.class);
    }

    @Test
    void cifraYDescifraContenidoBinarioYDetectaAlteracion() {
        BancoCifradoService service = new BancoCifradoService(new InMemoryKeyManagementProvider(), new ObjectMapper());
        byte[] original = "contenido DOCX binario\u0000\u0001".getBytes(StandardCharsets.UTF_8);

        BancoEncryptedPayload payload = service.cifrarBytes(original, "documento-sin-cartilla:DOC-1:rol:ROL-1");

        assertThat(service.descifrarBytes(payload, "documento-sin-cartilla:DOC-1:rol:ROL-1"))
                .isEqualTo(original);

        byte[] ciphertextAlterado = java.util.Base64.getDecoder().decode(payload.getCiphertext());
        ciphertextAlterado[0] ^= 1;
        BancoEncryptedPayload alterado = BancoEncryptedPayload.builder()
                .ciphertext(java.util.Base64.getEncoder().encodeToString(ciphertextAlterado))
                .nonce(payload.getNonce())
                .wrappedDataKey(payload.getWrappedDataKey())
                .keyReference(payload.getKeyReference())
                .keyVersion(payload.getKeyVersion())
                .algorithm(payload.getAlgorithm())
                .build();

        assertThatThrownBy(() -> service.descifrarBytes(alterado, "documento-sin-cartilla:DOC-1:rol:ROL-1"))
                .isInstanceOf(IllegalStateException.class);
    }

    private static final class InMemoryKeyManagementProvider implements KeyManagementProvider {
        private byte[] key;

        @Override
        public WrappedKey wrapDataKey(byte[] dataKey, String context) {
            key = Arrays.copyOf(dataKey, dataKey.length);
            return new WrappedKey("test-wrapped-key", "1");
        }

        @Override
        public byte[] unwrapDataKey(String wrappedKey, String context) {
            return Arrays.copyOf(key, key.length);
        }

        @Override
        public WrappedKey rewrapDataKey(String wrappedKey, String context) {
            return new WrappedKey("test-wrapped-key-v2", "2");
        }

        @Override
        public String keyReference() {
            return "test-kms";
        }
    }
}
