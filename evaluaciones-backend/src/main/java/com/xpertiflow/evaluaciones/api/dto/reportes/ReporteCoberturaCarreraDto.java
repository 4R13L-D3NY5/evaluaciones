package com.xpertiflow.evaluaciones.api.dto.reportes;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteCoberturaCarreraDto {
    private String carreraCodigo;
    private String carreraNombre;
    private String sedeCodigo;
    private String sedeNombre;
    private int totalMaterias;
    private int materiasConBanco;
    private int materiasSinBanco;
    private double porcentajeCobertura;
}
