package com.xpertiflow.evaluaciones.api.dto.auditoria;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaTomaGrupoReporteDto {

    private String groupId;
    private String groupCode;
    private String syllabusCourseId;
    private String materiaNombre;
    private String carreraCodigo;
    private String carreraNombre;
    private String sedeNombre;
    private String docenteNombre;
    private String term;

    // Datos del examen
    private String rolExamenId;
    private String estadoExamen;
    private OffsetDateTime fechaGeneracionExamen;
    private OffsetDateTime fechaImpresionExamen;

    // Métricas del grupo
    private int totalEstudiantes;
    private int totalRegulares;
    private int totalTardios;
    private int totalExtemporaneos;

    private List<AuditoriaTomaGrupoEstudianteDto> estudiantes;
}
