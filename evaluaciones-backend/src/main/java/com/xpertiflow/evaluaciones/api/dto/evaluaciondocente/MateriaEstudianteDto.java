package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MateriaEstudianteDto {
    private String materiaCodigo;
    private String materiaNombre;
    private String grupoCodigo;
    private String docenteId;
    private String docenteNombre;
    private String sedeCodigo;
    private String carreraCodigo;
    private boolean evaluada;
    private LocalDateTime fechaEvaluacion;
}
