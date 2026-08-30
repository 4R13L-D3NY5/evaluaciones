package com.xpertiflow.evaluaciones.api.dto;

import java.time.LocalDateTime;
import java.util.List;

public record LoteCartillasOmrResponseDto(
        String id,
        String rolExamenId,
        String estado,
        Integer totalCartillas,
        String archivoPdfPath,
        LocalDateTime generadoEn,
        LocalDateTime impresoEn,
        String usuarioImpresion,
        List<CartillaOmrResponseDto> cartillas
) {
}
