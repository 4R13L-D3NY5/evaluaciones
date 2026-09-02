package com.xpertiflow.evaluaciones.api.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record AlcanceAcademicoDto(
        @NotBlank String codigo,
        @NotBlank String nombre
) {
}
