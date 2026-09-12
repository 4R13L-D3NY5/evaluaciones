package com.xpertiflow.evaluaciones.api.dto.verificacion;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ConfiguracionVerificacionDto {

    private Long id;

    @NotBlank
    private String sedeCodigo;

    @NotBlank
    private String sedeNombre;

    private String carreraCodigo;
    private String carreraNombre;
    private boolean habilitada;
    private String actualizadoEn;
    private String actualizadoPor;
}
