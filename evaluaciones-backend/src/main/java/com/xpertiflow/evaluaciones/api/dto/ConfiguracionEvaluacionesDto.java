package com.xpertiflow.evaluaciones.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ConfiguracionEvaluacionesDto {

    @NotNull
    @Min(1)
    @Max(30)
    private Integer ratioEstudiantesPorVariante;

    @NotNull
    @Min(1)
    @Max(480)
    private Integer duracionExamenVirtualMinutos;

    private String formatoHoja;

    private String tipoLetra;

    @NotNull
    @Min(8)
    @Max(18)
    private Integer tamanoLetraPt;

    private String espaciadoLeading;

    private LocalDateTime actualizadoEn;

    private String actualizadoPor;
}
