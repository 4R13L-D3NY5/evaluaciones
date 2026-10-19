package com.xpertiflow.evaluaciones.api.dto.sincronizacion;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrasladoCalificacionesRequestDto {

    @Valid
    @NotEmpty(message = "Debe proporcionar al menos un traslado de calificación.")
    private List<TrasladoCalificacionItemRequestDto> traslados;
}
