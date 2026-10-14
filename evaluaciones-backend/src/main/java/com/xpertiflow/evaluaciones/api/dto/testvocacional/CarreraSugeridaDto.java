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
public class CarreraSugeridaDto {
    private String carrera;
    private String facultad;
    private String codigoRiasec;
    private double afinidadPorcentaje;
    private String perfilVocacional;
    private String itemsDescripcion;
    private List<Integer> preguntasClave;
    private List<Integer> preguntasCoincidentes;
}
