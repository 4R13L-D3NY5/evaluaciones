package com.xpertiflow.evaluaciones.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CorregirClavePatronResponseDto {
    private String rolExamenId;
    private String letraVariante;
    private Integer numeroPregunta;
    private String claveAnterior;
    private String nuevaClave;
    private boolean propagada;
    private int variantesActualizadas;
    private int calificacionesRecalculadas;
    @Builder.Default
    private List<String> detalles = new ArrayList<>();
}
