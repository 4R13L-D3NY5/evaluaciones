package com.xpertiflow.evaluaciones.api.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

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
    private String reactivoId;
    private Integer numeroBanco;
    private List<AnulacionPreguntaOmrResponseDto> anulacionesPropagadas;
}
