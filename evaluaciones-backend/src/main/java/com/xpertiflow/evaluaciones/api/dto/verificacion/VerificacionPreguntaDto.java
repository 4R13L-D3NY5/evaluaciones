package com.xpertiflow.evaluaciones.api.dto.verificacion;

import lombok.Data;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
public class VerificacionPreguntaDto {
    private Integer numeroOriginal;
    private String identificadorOriginal;
    private String tipoReactivo;
    private String dificultad;
    private Integer nivelDificultad;
    private String grupoContexto;
    private String enunciado;
    private String imagenBase64;
    private String respuestaCorrecta;
    private BigDecimal pesoPuntos;
    private List<VerificacionOpcionDto> opciones = new ArrayList<>();
    private String observacion;
}
