package com.xpertiflow.evaluaciones.api.dto.sincronizacion;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrasladoCalificacionItemRequestDto {

    @NotBlank(message = "El código del estudiante es obligatorio.")
    private String codigoEstudiante;

    @NotBlank(message = "El rol de examen origen es obligatorio.")
    private String rolExamenOrigenId;

    @NotBlank(message = "El rol de examen destino es obligatorio.")
    private String rolExamenDestinoId;

    @Builder.Default
    private Boolean sobrescribirSiExiste = false;
}
