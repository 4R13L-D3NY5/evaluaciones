package com.xpertiflow.evaluaciones.api.dto.auditoria;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaEvaluacionItemDto {

    private String rolExamenId;
    private String materiaCodigo;
    private String materiaNombre;
    private String grupo;
    private String carreraCodigo;
    private String carreraNombre;
    private String sedeNombre;
    private String campus;
    private String docenteNombre;
    private String estadoFlujo;
    private String modalidad;
    private Integer estudiantesInscritosCount;
    private String seaGroupId;
    private LocalDateTime fechaGeneracion;
    private LocalDate fechaExamen;
}
