package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ModificarRatificacionRequestDto {

    @NotBlank(message = "El nuevo estado es obligatorio")
    @Pattern(regexp = "^(RATIFICADO|NO_RATIFICADO)$", message = "El estado debe ser RATIFICADO o NO_RATIFICADO")
    private String nuevoEstado;

    @NotBlank(message = "El motivo de la modificación es obligatorio")
    @Size(min = 5, max = 1000, message = "El motivo debe contener entre 5 y 1000 caracteres")
    private String motivo;
}
