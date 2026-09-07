package com.xpertiflow.evaluaciones.api.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * Patrón de respuestas expuesto únicamente para la revisión posterior a la
 * calificación. El contenido se descifra en el backend y nunca se devuelve
 * la carga cifrada ni las claves de protección.
 */
@Data
public class PatronCalificadoResponseDto {

    private String rolExamenId;
    private String estado;
    private List<VariantePatronDto> variantes;

    @Data
    public static class VariantePatronDto {
        private String letra;
        private Integer totalPreguntas;
        private Map<String, String> respuestas;
    }
}
