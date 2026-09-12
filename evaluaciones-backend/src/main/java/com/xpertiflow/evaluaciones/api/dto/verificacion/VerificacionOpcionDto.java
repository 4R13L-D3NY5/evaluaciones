package com.xpertiflow.evaluaciones.api.dto.verificacion;

import lombok.Data;

@Data
public class VerificacionOpcionDto {
    private String letra;
    private String texto;
    private boolean correcta;
}
