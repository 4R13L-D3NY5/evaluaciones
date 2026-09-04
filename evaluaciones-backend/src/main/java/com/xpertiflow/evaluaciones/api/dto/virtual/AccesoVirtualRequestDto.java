package com.xpertiflow.evaluaciones.api.dto.virtual;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class AccesoVirtualRequestDto {
    @NotBlank private String codigoSala;
    @NotBlank private String token;
    private String codigoEstudiante;
}
