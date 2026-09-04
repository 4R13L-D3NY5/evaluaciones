package com.xpertiflow.evaluaciones.api.dto;

import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TransicionEstadoRequestDto {

    @NotNull
    private EstadoFlujo nuevoEstado;

    private String motivo;
    private String usuario;
    private String ipOrigen;
}
