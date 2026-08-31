package com.xpertiflow.evaluaciones.api.dto.virtual;

import lombok.Data;

@Data
public class RespuestaVirtualDetalleDto {
    private Integer numeroPregunta;
    private Integer reactivoId;
    private String respuesta;
    private String guardadaEn;
}
