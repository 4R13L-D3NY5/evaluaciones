package com.xpertiflow.evaluaciones.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RestablecerRolRequestDto {

    @NotBlank
    private String motivo;

    private String usuario;
    private String ipOrigen;
}
