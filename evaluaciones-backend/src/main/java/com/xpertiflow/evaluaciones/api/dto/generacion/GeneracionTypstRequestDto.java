package com.xpertiflow.evaluaciones.api.dto.generacion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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

    /** Grupo oficial que ya fue consultado y mostrado en la pantalla de preparación. */
    private String seaGroupId;

    @NotEmpty
    private List<String> variantes;

    /** Cantidad máxima de estudiantes que comparte una variante. Si se omite,
     * el backend usa la configuración vigente de Administración de evaluaciones. */
    @Min(1)
    @Max(30)
    private Integer ratioEstudiantesPorVariante;

    /** En virtual se preparan variantes y contenido web, sin compilar PDF. */
    private Boolean soloVirtual = false;

    private String outputBasePath;
}
