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
public class ReporteCalidadResumenDto {
    private int totalExamenes;
    private int aprobadosDirectos;
    private int observadosYLuegoAprobados;
    private int observadosPendientes;
    private int pendientesRevision;
    private int sinBanco;
    private double porcentajeAprobadosDirectos;
    private double porcentajeObservados;
    @Builder.Default
    private List<ReporteCalidadItemDto> items = new ArrayList<>();
}
