package com.xpertiflow.evaluaciones.api.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolverSolicitudModificacionRequestDto {

    @NotNull(message = "Debe indicar si aprueba o rechaza la solicitud")
    private Boolean aprobado;

    private String observacion;
}
