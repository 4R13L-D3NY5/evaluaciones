package com.xpertiflow.evaluaciones.api.dto.consulta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VarianteGrupoDto {
    private String letra;
    private Integer totalPreguntas;
    private Integer totalEstudiantes;
    private BigDecimal promedioSobre60;
    private BigDecimal promedioSobre100;
    private List<Integer> preguntasAnuladas;
    private Boolean patronLiberado;
    private Map<String, String> patronClaves;
}
