package com.xpertiflow.evaluaciones.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Map;

@Data
public class AjustarCalificacionOmrRequestDto {
    private Integer pagina;

    private String codigoAnterior;

    @NotBlank(message = "El código del estudiante es obligatorio")
    private String codigoEstudiante;

    @NotEmpty(message = "Debe informar las respuestas leídas")
    private Map<String, String> respuestas;

    private String usuario;
}
