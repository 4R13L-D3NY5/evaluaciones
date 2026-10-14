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
public class FacultadAfinidadDto {
    private String facultad;
    private String perfilHolland;
    private double afinidadPorcentaje;
    private String enfoque;
    private List<Integer> preguntasClave;
    private List<Integer> preguntasCoincidentes;
}
