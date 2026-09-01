package com.xpertiflow.evaluaciones.api.dto.virtual;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RestablecerSalaVirtualRequestDto {

    @NotBlank(message = "Indica el motivo del restablecimiento")
    private String motivo;
}
