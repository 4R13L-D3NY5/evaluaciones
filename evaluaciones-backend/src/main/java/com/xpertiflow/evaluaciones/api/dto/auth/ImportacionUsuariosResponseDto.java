package com.xpertiflow.evaluaciones.api.dto.auth;

import java.util.List;

public record ImportacionUsuariosResponseDto(
        int totalFilas,
        int creados,
        int actualizados,
        List<CredencialTemporalDto> credencialesTemporales,
        List<ErrorImportacionUsuarioDto> errores
) {
}
