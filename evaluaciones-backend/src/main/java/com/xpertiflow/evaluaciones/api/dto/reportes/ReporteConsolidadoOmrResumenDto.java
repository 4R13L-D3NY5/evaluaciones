package com.xpertiflow.evaluaciones.api.dto.reportes;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteConsolidadoOmrResumenDto {
    private int totalExamenesCalificados;
    private int totalInscritos;
    private int totalCalificados;
    private int totalAprobados;
    private int totalReprobados;
    private double promedioGeneral;
    private double porcentajeAprobacionGeneral;
    @Builder.Default
    private List<ReporteConsolidadoOmrItemDto> items = new ArrayList<>();
}
