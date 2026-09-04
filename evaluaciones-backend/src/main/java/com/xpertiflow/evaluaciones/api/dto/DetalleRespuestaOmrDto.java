package com.xpertiflow.evaluaciones.api.dto;

import lombok.Data;

import java.util.List;

@Data
public class DetalleRespuestaOmrDto {
    private Integer pregunta;
    private String respuesta;
    private String respuestaCorrecta;
    private String estado;
    private List<Double> densidades = List.of();
}
