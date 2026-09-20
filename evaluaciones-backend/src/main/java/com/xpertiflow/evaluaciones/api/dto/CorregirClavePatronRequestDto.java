package com.xpertiflow.evaluaciones.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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
public class CorregirClavePatronRequestDto {

    @NotBlank(message = "La variante es obligatoria")
    @Size(max = 4, message = "La variante no es válida")
    private String letraVariante;

    @Min(value = 1, message = "El número de pregunta debe ser mayor que cero")
    @Max(value = 1000, message = "El número de pregunta no es válido")
    private Integer numeroPregunta;

    @NotBlank(message = "La nueva clave es obligatoria")
    @Pattern(regexp = "^[A-Ea-e]$", message = "La clave debe ser una opción válida (A, B, C, D o E)")
    private String nuevaClave;

    @Builder.Default
    private boolean propagarVariantes = true;

    @NotBlank(message = "El motivo de la corrección es obligatorio")
    @Size(min = 5, max = 500, message = "El motivo debe tener entre 5 y 500 caracteres")
    private String motivo;
}
