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

    /** Indica que las respuestas fueron modificadas manualmente por un responsable. */
    private boolean ajusteManual;

    /** Respuestas originales del escaneo, para dejar trazabilidad del cambio. */
    private Map<String, String> respuestasOriginales;

    private String usuario;
}
