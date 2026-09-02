package com.xpertiflow.evaluaciones.api.dto.banco;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ReactivoResponseDto {

    private Integer numeroOrden;
    private String tipoReactivo;
    private String dificultad;
    private Integer nivelDificultad;
    private String enunciado;
    private String imagenBase64;
    private String respuestaCorrecta;
    private BigDecimal pesoPuntos;
    private String grupoContexto;
}
