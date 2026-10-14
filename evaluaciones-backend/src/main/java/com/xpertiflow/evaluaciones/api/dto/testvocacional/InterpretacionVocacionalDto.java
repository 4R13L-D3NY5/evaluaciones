package com.xpertiflow.evaluaciones.api.dto.testvocacional;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterpretacionVocacionalDto {
    private String codigoHolland;
    private String facultadSugerida;
    private Map<String, DimensionRiasecDto> dimensiones;
    private List<FacultadAfinidadDto> facultades;
    private List<CarreraSugeridaDto> carrerasRecomendadas;
}
