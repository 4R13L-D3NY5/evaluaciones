package com.xpertiflow.evaluaciones.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.Arrays;

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
