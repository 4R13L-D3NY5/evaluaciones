package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AreaPuntajeEstudianteDto {
    private String areaCodigo;
    private String areaNombre;
    private BigDecimal puntajePromedio;
    private BigDecimal puntajeMaximo;
    private BigDecimal porcentaje;
}
