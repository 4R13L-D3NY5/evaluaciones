package com.xpertiflow.evaluaciones.api.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record AlcanceCampusDto(
        @NotBlank String sedeCodigo,
        @NotBlank String sedeNombre,
        String campusId,
        String campusCodigo,
        @NotBlank String campusNombre,
        boolean habilitado
) {
}
