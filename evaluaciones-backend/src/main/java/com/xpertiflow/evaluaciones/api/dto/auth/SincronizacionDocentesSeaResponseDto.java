package com.xpertiflow.evaluaciones.api.dto.auth;

import java.util.List;

public record SincronizacionDocentesSeaResponseDto(
        int solicitados,
        int creados,
        int actualizados,
        int reactivados,
        int desactivados,
        List<CredencialTemporalDto> credencialesTemporales,
        List<ErrorImportacionUsuarioDto> errores
) {
}
