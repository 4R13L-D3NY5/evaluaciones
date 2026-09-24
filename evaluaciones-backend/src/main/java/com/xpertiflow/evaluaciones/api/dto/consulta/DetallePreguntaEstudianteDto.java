package com.xpertiflow.evaluaciones.api.dto.consulta;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetallePreguntaEstudianteDto {
    @JsonProperty("pregunta")
    private Integer pregunta;

    @JsonProperty("numero")
    private Integer numero;

    private String marcada;
    private String correcta;
    private String estado; // CORRECTA, INCORRECTA, BLANCO, DOBLE_MARCA, ANULADA
}
