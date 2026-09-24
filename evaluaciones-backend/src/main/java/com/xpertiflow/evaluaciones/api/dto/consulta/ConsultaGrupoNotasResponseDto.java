package com.xpertiflow.evaluaciones.api.dto.consulta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultaGrupoNotasResponseDto {
    private GrupoCabeceraDto grupo;
    private List<VarianteGrupoDto> variantes;
    private List<EstudianteNotaGrupoDto> estudiantes;
}
