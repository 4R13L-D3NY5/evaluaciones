package com.xpertiflow.evaluaciones.api.dto.virtual;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SalaVirtualRequestDto {
    @NotBlank
    private String rolExamenId;
    @Min(1) @Max(480)
    private Integer duracionMinutos = 45;
    @Min(0) @Max(60)
    private Integer graciaIngresoMinutos = 10;
    private Boolean permiteReconexion = true;
}
