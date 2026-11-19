package com.xpertiflow.evaluaciones.api.dto.generacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurarGeneracionResponseDto {
    private String rolExamenId;
    private String jobIdRestaurado;
    private int totalMapeosRestaurados;
    private int totalCalificacionesRecalibradas;
    private String mensaje;
}
