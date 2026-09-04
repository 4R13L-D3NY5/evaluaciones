package com.xpertiflow.evaluaciones.security;

/**
 * Abstracción del KMS. La aplicación nunca conoce ni persiste la KEK.
 */
public interface KeyManagementProvider {

    WrappedKey wrapDataKey(byte[] dataKey, String context);

    byte[] unwrapDataKey(String wrappedKey, String context);

    /** Reenvuelve una DEK con la versión activa de la KEK sin descifrar el contenido. */
    WrappedKey rewrapDataKey(String wrappedKey, String context);

    String keyReference();

    record WrappedKey(String value, String version) {
    }
}
