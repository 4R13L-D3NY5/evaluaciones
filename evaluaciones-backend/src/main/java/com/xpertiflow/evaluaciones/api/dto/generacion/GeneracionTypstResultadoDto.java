package com.xpertiflow.evaluaciones.api.dto.generacion;

import lombok.Data;

import java.util.List;

@Data
public class GeneracionTypstResultadoDto {

    private String jobId;
    private String rolExamenId;
    private String estado;
    private String mensaje;
    private Boolean modoPrevisualizacion;
    private List<VarianteResultadoDto> variantes;
    private List<MapeoResultadoDto> mapeos;
}
