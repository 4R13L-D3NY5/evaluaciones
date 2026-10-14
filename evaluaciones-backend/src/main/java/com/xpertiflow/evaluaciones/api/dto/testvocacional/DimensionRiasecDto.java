package com.xpertiflow.evaluaciones.api.dto.testvocacional;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DimensionRiasecDto {
    private String letra;
    private String nombre;
    private int aciertos;
    private int totalPreguntas;
    private double porcentaje;
    private String descripcion;
    private List<Integer> preguntasMarcadas;
}
