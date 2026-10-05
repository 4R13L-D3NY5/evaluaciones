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
public class ReporteCoberturaBancosResumenDto {
    private String carreraCodigo;
    private String carreraNombre;
    private String sedeCodigo;
    private String sedeNombre;
    private int totalMaterias;
    private int materiasConBanco;
    private int materiasSinBanco;
    private double porcentajeCobertura;
    @Builder.Default
    private List<ReporteCoberturaCarreraDto> carreras = new ArrayList<>();
    @Builder.Default
    private List<ReporteCoberturaBancosItemDto> items = new ArrayList<>();
}
