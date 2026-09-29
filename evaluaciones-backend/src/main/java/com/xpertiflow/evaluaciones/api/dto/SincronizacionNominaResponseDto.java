package com.xpertiflow.evaluaciones.api.dto;

import java.util.List;

public record SincronizacionNominaResponseDto(
        String rolExamenId,
        int totalEstudiantes,
        int nuevosEstudiantes,
        List<String> codigosNuevos,
        String mensaje,
        PreparacionCartillasOmrResponseDto preparacion
) {
}
