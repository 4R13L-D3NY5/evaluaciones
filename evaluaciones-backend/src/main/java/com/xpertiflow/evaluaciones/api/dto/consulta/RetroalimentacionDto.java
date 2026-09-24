package com.xpertiflow.evaluaciones.api.dto.consulta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RetroalimentacionDto {
    private boolean patronLiberado;
    private String motivoBloqueo;
    private Integer totalPreguntas;
    private List<Integer> preguntasAnuladas;
    private List<DetallePreguntaEstudianteDto> detallePreguntas;
}
