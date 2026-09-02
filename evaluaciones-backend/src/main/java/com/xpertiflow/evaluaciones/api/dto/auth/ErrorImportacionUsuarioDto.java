package com.xpertiflow.evaluaciones.api.dto.auth;

public record ErrorImportacionUsuarioDto(
        int fila,
        String ci,
        String detalle
) {
}
