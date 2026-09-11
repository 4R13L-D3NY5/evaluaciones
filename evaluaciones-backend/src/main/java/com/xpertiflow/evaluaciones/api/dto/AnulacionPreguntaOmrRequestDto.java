package com.xpertiflow.evaluaciones.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AnulacionPreguntaOmrRequestDto {

    @NotBlank(message = "La variante es obligatoria")
    @Size(max = 4, message = "La variante no es válida")
    private String letraVariante;

    @Min(value = 1, message = "El número de pregunta debe ser mayor que cero")
    @Max(value = 1000, message = "El número de pregunta no es válido")
    private Integer numeroPregunta;

    @NotBlank(message = "El motivo de anulación es obligatorio")
    @Size(min = 5, max = 500, message = "El motivo debe tener entre 5 y 500 caracteres")
    private String motivo;
}
