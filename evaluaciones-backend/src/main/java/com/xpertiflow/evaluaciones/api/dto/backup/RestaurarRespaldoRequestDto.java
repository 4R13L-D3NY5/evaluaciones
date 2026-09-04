package com.xpertiflow.evaluaciones.api.dto.backup;

import jakarta.validation.constraints.NotBlank;

public record RestaurarRespaldoRequestDto(@NotBlank String confirmacion) {
}
