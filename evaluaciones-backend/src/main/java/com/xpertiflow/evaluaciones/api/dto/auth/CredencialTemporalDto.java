package com.xpertiflow.evaluaciones.api.dto.auth;

public record CredencialTemporalDto(
        int fila,
        String ci,
        String nombreCompleto,
        String rol,
        String usuario,
        String contrasenaTemporal,
        String operacion
) {
}
