package com.xpertiflow.evaluaciones.api.dto;

import java.time.LocalDateTime;

public record CartillaOmrResponseDto(
        Long id,
        Integer numeroOrden,
        String codigoMateria,
        String grupo,
        String codigoEstudiante,
        String nombreCompleto,
        String estado,
        LocalDateTime impresaEn
) {
}
