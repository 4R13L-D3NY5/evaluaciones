package com.xpertiflow.evaluaciones.api.dto.consulta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultaEstudianteEvaluacionDto {
    private String codigoEstudiante;
    private String nombreCompleto;
    private String rolExamenId;
    private String seaGroupId;
    private String materiaCodigo;
    private String materiaNombre;
    private String carreraCodigo;
    private String carreraNombre;
    private String sedeCodigo;
    private String sedeNombre;
    private String grupo;
    private String docenteNombre;
    private String tipoParcial;
    private LocalDate fechaExamen;
    private String horario;
    private String modalidad;
    private String modalidadDescripcion;
    private String estadoExamen;
    private String asistencia;

    // Métricas de calificación
    private String variante;
    private BigDecimal notaSobre60;
    private BigDecimal notaSobre100;
    private Integer totalReactivos;
    private Integer aciertos;
    private Integer fallos;
    private Integer blancos;
    private Integer doblesMarcas;

    // Retroalimentación detallada (solo para OMR / Virtual si patrón está liberado)
    private RetroalimentacionDto retroalimentacion;
}
