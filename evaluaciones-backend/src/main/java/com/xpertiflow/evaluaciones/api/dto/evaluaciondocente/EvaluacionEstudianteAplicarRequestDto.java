package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluacionEstudianteAplicarRequestDto {

    @NotBlank(message = "El código del estudiante es obligatorio")
    private String estudianteCodigo;

    private String estudianteNombre;

    @NotBlank(message = "El código de la materia es obligatorio")
    private String materiaCodigo;

    @NotBlank(message = "El nombre de la materia es obligatorio")
    private String materiaNombre;

    @NotBlank(message = "El código de grupo es obligatorio")
    private String grupoCodigo;

    private String docenteId;

    @NotBlank(message = "El nombre del docente es obligatorio")
    private String docenteNombre;

    @NotBlank(message = "La gestión académica es obligatoria")
    private String gestion;

    private String sedeCodigo;
    private String carreraCodigo;
    private String instrumentoId;
    private String observaciones;

    @NotEmpty(message = "Debe proporcionar las respuestas a los criterios")
    private Map<String, Integer> respuestas;
}
