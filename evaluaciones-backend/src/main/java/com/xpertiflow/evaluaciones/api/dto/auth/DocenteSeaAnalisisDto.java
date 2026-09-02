package com.xpertiflow.evaluaciones.api.dto.auth;

public record DocenteSeaAnalisisDto(
        String ci,
        String nombreCompleto,
        int gruposSea,
        boolean presenteEnSea,
        boolean tieneCuenta,
        boolean cuentaActiva,
        Long usuarioId,
        String rolCodigo,
        String proveedorIdentidad,
        String estado
) {
}
