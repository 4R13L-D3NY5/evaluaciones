package com.xpertiflow.evaluaciones.api.dto.virtual;

import lombok.Data;

import java.util.List;

@Data
public class ResultadoVirtualDto {
    private String intentoId;
    private String codigoEstudiante;
    private String nombreEstudiante;
    private String letraVariante;
    private String estado;
    private Integer aciertos;
    private String notaSobre30;
    private String notaSobre100;
    private String enviadoEn;
    private List<RespuestaVirtualDetalleDto> respuestas;
}
