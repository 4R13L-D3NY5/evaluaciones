package com.xpertiflow.evaluaciones.api.dto;

public record DatosCartillaOmrDto(
        Integer numeroOrden,
        String codigoMateria,
        String grupo,
        String codigoEstudiante,
        String nombreCompleto
) {
}
