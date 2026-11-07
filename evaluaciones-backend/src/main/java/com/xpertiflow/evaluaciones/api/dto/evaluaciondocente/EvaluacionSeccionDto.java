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
public class EvaluacionSeccionDto {
    private String id;
    private String codigo;
    private String nombre;
    private String descripcion;
    private Integer orden;
    @Builder.Default
    private List<EvaluacionCriterioDto> criterios = new ArrayList<>();
}
