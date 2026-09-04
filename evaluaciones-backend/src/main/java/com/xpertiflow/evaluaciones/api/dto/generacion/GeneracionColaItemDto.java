package com.xpertiflow.evaluaciones.api.dto.generacion;

import lombok.Data;

import java.util.List;

@Data
public class GeneracionColaItemDto {

    private String jobId;
    private String rolExamenId;
    private String estado;
    private String mensaje;
    private int variantesSolicitadas;
    private int variantesGeneradas;
}
