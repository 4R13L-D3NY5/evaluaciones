package com.xpertiflow.evaluaciones.api.dto;

import java.math.BigDecimal;

public record DatosCartillaOmrDto(
        Integer numeroOrden,
        String codigoMateria,
        String grupo,
        String codigoEstudiante,
        String nombreCompleto,
        String estadoCalificacion,
        String observacion,
        BigDecimal notaSobre60,
        BigDecimal notaSobre100
) {
    public DatosCartillaOmrDto(Integer numeroOrden, String codigoMateria, String grupo, String codigoEstudiante, String nombreCompleto) {
        this(numeroOrden, codigoMateria, grupo, codigoEstudiante, nombreCompleto, null, null, null, null);
    }
}
