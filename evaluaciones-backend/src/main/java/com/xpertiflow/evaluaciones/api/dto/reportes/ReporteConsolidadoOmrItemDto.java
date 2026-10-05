package com.xpertiflow.evaluaciones.api.dto.reportes;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteConsolidadoOmrItemDto {
    private String rolExamenId;
    private String materiaCodigo;
    private String materiaNombre;
    private String grupo;
    private String sedeCodigo;
    private String sedeNombre;
    private String carreraCodigo;
    private String carreraNombre;
    private String docenteNombre;
    private String tipoParcial;
    private LocalDate fechaExamen;
    private String horaExamen;
    private int totalInscritos;
    private int totalCalificados;
    private int totalAprobados;
    private int totalReprobados;
    private double promedioNota;
    private double porcentajeAprobacion;
    private String estadoSincronizacionSea;
}
