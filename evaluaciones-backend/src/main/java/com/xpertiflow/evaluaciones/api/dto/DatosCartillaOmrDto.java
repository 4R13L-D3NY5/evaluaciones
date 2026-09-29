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
        BigDecimal notaSobre100,
        String letraVariante,
        String cuadernilloPdfPath
) {
    public DatosCartillaOmrDto(Integer numeroOrden, String codigoMateria, String grupo, String codigoEstudiante, String nombreCompleto) {
        this(numeroOrden, codigoMateria, grupo, codigoEstudiante, nombreCompleto, null, null, null, null, null, null);
    }

    public DatosCartillaOmrDto(Integer numeroOrden, String codigoMateria, String grupo, String codigoEstudiante, String nombreCompleto,
                               String estadoCalificacion, String observacion, BigDecimal notaSobre60, BigDecimal notaSobre100) {
        this(numeroOrden, codigoMateria, grupo, codigoEstudiante, nombreCompleto, estadoCalificacion, observacion, notaSobre60, notaSobre100, null, null);
    }
}
