package com.xpertiflow.evaluaciones.api.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * Patrón de respuestas expuesto únicamente para la revisión posterior a la
 * devolución del examen. El contenido se descifra en el backend y nunca se devuelve
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
        private List<TrazabilidadPreguntaDto> trazabilidad;
        private List<EstudiantePatronDto> estudiantes;
    }

    @Data
    public static class EstudiantePatronDto {
        private String codigoEstudiante;
        private String nombreCompleto;
    }

    @Data
    public static class TrazabilidadPreguntaDto {
        private Integer numeroPresentado;
        private Integer numeroBanco;
        private String reactivoId;
        private String respuestaCorrectaBanco;
        private String respuestaCorrectaVariante;
    }
}
