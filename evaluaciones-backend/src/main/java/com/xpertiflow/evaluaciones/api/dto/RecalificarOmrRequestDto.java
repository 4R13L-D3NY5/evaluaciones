package com.xpertiflow.evaluaciones.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecalificarOmrRequestDto {

    @NotBlank(message = "El motivo de la recalificación es obligatorio para auditoría")
    @Size(min = 5, max = 500, message = "El motivo debe tener entre 5 y 500 caracteres")
    private String motivo;

    @Builder.Default
    private boolean reprocesarEscaneado = false;
}
