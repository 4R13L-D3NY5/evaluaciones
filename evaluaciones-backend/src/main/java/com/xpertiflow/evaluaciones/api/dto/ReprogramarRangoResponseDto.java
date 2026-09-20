package com.xpertiflow.evaluaciones.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReprogramarRangoResponseDto {

    private int totalReprogramados;
    private String mensaje;
    private List<RolExamenResponseDto> examenesActualizados;
}
