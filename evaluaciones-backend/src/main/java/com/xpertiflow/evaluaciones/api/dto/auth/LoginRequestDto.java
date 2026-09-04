package com.xpertiflow.evaluaciones.api.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequestDto {

    @NotBlank
    private String usuario;

    @NotBlank
    private String contrasena;
}
