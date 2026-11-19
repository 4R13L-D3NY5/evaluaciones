package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CumplimientoEvaluacionDto {
    private String sedeCodigo;
    private String sedeNombre;
    private String carreraCodigo;
    private String carreraNombre;
    private String materiaCodigo;
    private String materiaNombre;
    private String grupoCodigo;
    private String docenteNombre;
    private String docenteCi;

    // Director
    private boolean directorEvaluado;

    // Estudiantes
    private int totalEstudiantesMatriculados;
    private int totalEstudiantesEvaluaron;
    private BigDecimal estudiantesParticipacionPorcentaje;

    // Estado consolidado
    private String estadoEvaluacion; // COMPLETO, SOLO_DIRECTOR, SOLO_ESTUDIANTES, PENDIENTE
}
