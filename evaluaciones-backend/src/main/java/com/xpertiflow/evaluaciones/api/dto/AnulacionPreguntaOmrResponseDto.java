package com.xpertiflow.evaluaciones.api.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AnulacionPreguntaOmrResponseDto {
    private Long id;
    private String rolExamenId;
    private String letraVariante;
    private Integer numeroPregunta;
    private String motivo;
    private String anuladoPor;
    private LocalDateTime anuladoEn;
    private boolean activo;
}
