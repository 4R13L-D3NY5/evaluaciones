package com.xpertiflow.evaluaciones.api.dto;

import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CambiarModalidadRequestDto {

    @NotNull
    private ModalidadExamen modalidad;
}
