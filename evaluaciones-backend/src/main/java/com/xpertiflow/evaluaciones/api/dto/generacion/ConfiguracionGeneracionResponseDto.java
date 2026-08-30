package com.xpertiflow.evaluaciones.api.dto.generacion;

import lombok.Data;

import java.util.List;

/**
 * Configuración persistida que relaciona las variantes, sus patrones y la
 * asignación confidencial de cada estudiante.
 */
@Data
public class ConfiguracionGeneracionResponseDto {

    private String rolExamenId;
    private List<VarianteResultadoDto> variantes;
    private List<MapeoResultadoDto> mapeos;
}
