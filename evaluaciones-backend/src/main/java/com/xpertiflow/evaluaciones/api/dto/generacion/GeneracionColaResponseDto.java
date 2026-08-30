package com.xpertiflow.evaluaciones.api.dto.generacion;

import lombok.Data;

import java.util.List;

@Data
public class GeneracionColaResponseDto {

    private String cola;
    private int mensajesPendientes;
    private List<GeneracionColaItemDto> tareas;
}
