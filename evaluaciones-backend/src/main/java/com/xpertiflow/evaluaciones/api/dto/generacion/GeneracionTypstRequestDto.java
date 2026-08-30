package com.xpertiflow.evaluaciones.api.dto.generacion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class GeneracionTypstRequestDto {

    /**
     * Identificador generado por el cliente para correlacionar solicitud,
     * worker y polling. Es opcional para mantener compatibilidad con clientes
     * antiguos; el backend genera uno cuando no se recibe.
     */
    private String jobId;

    @NotBlank
    private String rolExamenId;

    @NotBlank
    private String bancoPreguntasId;

    @NotEmpty
    private List<String> variantes;

    /** Cantidad máxima de estudiantes que comparte una variante. Default institucional: 5. */
    private Integer ratioEstudiantesPorVariante = 5;

    private String outputBasePath;
}
