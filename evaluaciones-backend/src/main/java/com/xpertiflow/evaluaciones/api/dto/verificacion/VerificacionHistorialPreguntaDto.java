package com.xpertiflow.evaluaciones.api.dto.verificacion;

import lombok.Data;

@Data
public class VerificacionHistorialPreguntaDto {
    private Integer numeroPregunta;
    private String observacion;
    private VerificacionPreguntaDto preguntaEnviada;
    private VerificacionPreguntaDto preguntaCorregida;
}
