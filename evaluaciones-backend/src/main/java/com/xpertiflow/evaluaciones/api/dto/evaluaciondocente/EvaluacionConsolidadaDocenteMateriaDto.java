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
public class EvaluacionConsolidadaDocenteMateriaDto {
    private String materiaCodigo;
    private String materiaNombre;
    private String grupoCodigo;
    private String docenteNombre;
    private String docenteCi;
    private String gestion;
    private String sedeCodigo;
    private String carreraCodigo;

    // Director (50 Pts)
    private boolean directorEvaluado;
    private BigDecimal directorPuntaje100; // Calificación sobre 100 asignada por el Director
    private BigDecimal directorPuntos50;   // Aporte del Director (máx 50 pts)
    private String directorFechaEvaluacion;
    private String directorObservaciones;

    // Plantel Estudiantil (50 Pts)
    private int totalEstudiantesMatriculados;              // Cuántas matrículas hay en la asignatura/grupos
    private int totalEstudiantesEvaluaron;                 // Cuántos completaron el test (ej. 45/100)
    private BigDecimal estudiantesParticipacionPorcentaje; // % de participación (ej. 45.00%)
    private BigDecimal estudiantesPromedioPorcentaje;      // Promedio obtenido de los que sí evaluaron (0-100%)
    private BigDecimal estudiantesPuntos50;                // Aporte Estudiantil (máx 50 pts)

    // Total Consolidado (100 Pts)
    private BigDecimal puntajeFinal100; // Suma Director (50) + Estudiantes (50)
    private String estadoFinal;         // Sobresaliente, Aprobado, Reprobado, Pendiente, etc.
}
