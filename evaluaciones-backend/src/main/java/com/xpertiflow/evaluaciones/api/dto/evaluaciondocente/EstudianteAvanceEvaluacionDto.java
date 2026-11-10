package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

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
public class EstudianteAvanceEvaluacionDto {
    private String estudianteCodigo;
    private String estudianteNombre;
    private String sedeCodigo;
    private String carreraCodigo;
    private String carreraNombre;
    private String gestion;
    private int totalMaterias;
    private int materiasEvaluadas;
    private double porcentajeAvance;
    @Builder.Default
    private List<MateriaEstudianteDto> materias = new ArrayList<>();
}
