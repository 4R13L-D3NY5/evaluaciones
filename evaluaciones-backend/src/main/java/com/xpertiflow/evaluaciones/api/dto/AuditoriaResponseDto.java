package com.xpertiflow.evaluaciones.api.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AuditoriaResponseDto {

    private Long id;
    private String rolExamenId;
    private String etapaOrigen;
    private String etapaDestino;
    private String accion;
    private String usuario;
    private String ipOrigen;
    private String detallesJson;
    private LocalDateTime fechaEvento;
}
