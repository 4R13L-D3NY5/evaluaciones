package com.xpertiflow.evaluaciones.api.dto.generacion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
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

    /** Cantidad máxima de estudiantes que comparte una variante. */
    @NotNull
    @Min(1)
    @Max(30)
    private Integer ratioEstudiantesPorVariante = 5;

    /** En virtual se preparan variantes y contenido web, sin compilar PDF. */
    private Boolean soloVirtual = false;

    private String outputBasePath;
}
