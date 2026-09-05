package com.xpertiflow.evaluaciones.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ConfiguracionParcialDto {

    @NotNull
    @Min(1)
    @Max(1000)
    private Integer totalPreguntas;

    @NotNull
    @Min(0)
    @Max(1000)
    private Integer facil;

    @NotNull
    @Min(0)
    @Max(1000)
    private Integer medio;

    @NotNull
    @Min(0)
    @Max(1000)
    private Integer dificil;
}
