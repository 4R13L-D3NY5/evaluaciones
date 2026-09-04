package com.xpertiflow.evaluaciones.api.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record AsignacionAcademicaDto(
        @NotBlank String sedeCodigo,
        @NotBlank String sedeNombre,
        @NotBlank String carreraCodigo,
        @NotBlank String carreraNombre,
        String asignaturaCodigo,
        String asignaturaNombre
) {
}
