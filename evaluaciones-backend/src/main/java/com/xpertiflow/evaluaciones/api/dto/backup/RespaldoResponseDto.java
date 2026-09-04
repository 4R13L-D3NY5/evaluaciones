package com.xpertiflow.evaluaciones.api.dto.backup;

import java.time.LocalDateTime;

public record RespaldoResponseDto(
        String id,
        String tipo,
        String estado,
        String snapshotLocalId,
        String snapshotExternoId,
        String rutaLocal,
        String rutaExterna,
        Long tamanoBytes,
        Integer archivosCount,
        String solicitadoPor,
        LocalDateTime solicitadoEn,
        LocalDateTime iniciadoEn,
        LocalDateTime finalizadoEn,
        LocalDateTime externoCopiadoEn,
        LocalDateTime verificadoEn,
        LocalDateTime localEliminadoEn,
        String errorMensaje) {
}
