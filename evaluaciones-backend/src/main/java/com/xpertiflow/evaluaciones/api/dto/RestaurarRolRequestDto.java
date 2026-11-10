package com.xpertiflow.evaluaciones.api.dto;

import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurarRolRequestDto {

    private String motivo;
    private EstadoFlujo estadoDestino;
    private String usuario;
    private String ipOrigen;
}
