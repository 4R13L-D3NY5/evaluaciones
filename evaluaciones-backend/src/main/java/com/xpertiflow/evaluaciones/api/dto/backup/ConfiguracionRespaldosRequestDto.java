package com.xpertiflow.evaluaciones.api.dto.backup;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ConfiguracionRespaldosRequestDto(
        @NotNull Boolean activo,
        @NotNull @Min(1) Integer frecuenciaMinutos,
        @NotNull @Min(1) Integer retencionDias) {
}
