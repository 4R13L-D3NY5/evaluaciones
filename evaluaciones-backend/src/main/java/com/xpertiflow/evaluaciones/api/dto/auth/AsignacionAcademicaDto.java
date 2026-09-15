package com.xpertiflow.evaluaciones.api.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record AsignacionAcademicaDto(
        @NotBlank String sedeCodigo,
        @NotBlank String sedeNombre,
        @NotBlank String carreraCodigo,
        @NotBlank String carreraNombre,
        String asignaturaCodigo,
        String asignaturaNombre,
        boolean todaSede
) {
    public AsignacionAcademicaDto(String sedeCodigo, String sedeNombre,
                                  String carreraCodigo, String carreraNombre,
                                  String asignaturaCodigo, String asignaturaNombre) {
        this(sedeCodigo, sedeNombre, carreraCodigo, carreraNombre,
                asignaturaCodigo, asignaturaNombre, false);
    }
}
