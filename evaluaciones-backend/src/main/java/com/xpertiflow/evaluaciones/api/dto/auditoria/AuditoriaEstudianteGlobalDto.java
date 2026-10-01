package com.xpertiflow.evaluaciones.api.dto.auditoria;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaEstudianteGlobalDto {

    private String studentCode;
    private String fullName;
    private String carreraCodigo;
    private String carreraNombre;
    private String sedeNombre;
    private int totalMateriasInscritas;
    private int totalRegulares;
    private int totalTardios;
    private int totalExtemporaneos;

    private List<AuditoriaTomaGrupoEstudianteDto> materias;
}
