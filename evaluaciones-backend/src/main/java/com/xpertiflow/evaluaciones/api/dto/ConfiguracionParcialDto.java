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

    // Cuotas Mínimas para Carga del Banco Excel por Dificultad
    private Integer bancoTotal;
    private Integer bancoFacil;
    private Integer bancoMedio;
    private Integer bancoDificil;

    // Cuotas Mínimas para Carga del Banco Excel por Grupos Tipológicos
    private Integer bancoG1;
    private Integer bancoG2;
    private Integer bancoG3;

    public Integer getCantidadPreguntas() {
        return totalPreguntas;
    }
}
