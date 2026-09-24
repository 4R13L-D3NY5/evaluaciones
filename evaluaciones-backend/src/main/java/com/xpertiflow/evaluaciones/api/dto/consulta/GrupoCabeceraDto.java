package com.xpertiflow.evaluaciones.api.dto.consulta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrupoCabeceraDto {
    private String seaGroupId;
    private String rolExamenId;
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
    private Integer totalInscritos;
    private Integer totalEvaluados;
}
