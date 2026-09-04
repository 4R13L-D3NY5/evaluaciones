package com.xpertiflow.evaluaciones.api.dto.virtual;
import lombok.Data;
@Data
public class RespuestaGuardadaDto {
    private String intentoId;
    private Integer numeroPregunta;
    private String respuesta;
    private String guardadaEn;
}
