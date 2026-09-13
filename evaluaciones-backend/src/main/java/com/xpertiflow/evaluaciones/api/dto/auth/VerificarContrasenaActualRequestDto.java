package com.xpertiflow.evaluaciones.api.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerificarContrasenaActualRequestDto {

    @NotBlank
    private String contrasenaActual;
}
