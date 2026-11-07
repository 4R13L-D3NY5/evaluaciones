package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluacionDocenteAplicarRequestDto {

    private String instrumentoId;

    @NotBlank(message = "La gestión es obligatoria")
    private String gestion;

    private String sedeId;

    @NotBlank(message = "El código de sede es obligatorio")
    private String sedeCodigo;

    @NotBlank(message = "El nombre de sede es obligatorio")
    private String sedeNombre;

    private String carreraId;

    @NotBlank(message = "El código de carrera es obligatorio")
    private String carreraCodigo;

    @NotBlank(message = "El nombre de carrera es obligatorio")
    private String carreraNombre;

    @NotBlank(message = "El código de materia es obligatorio")
    private String materiaCodigo;

    @NotBlank(message = "El nombre de materia es obligatorio")
    private String materiaNombre;

    @NotBlank(message = "El grupo es obligatorio")
    private String grupoCodigo;

    private String docenteId;

    @NotBlank(message = "El nombre del docente es obligatorio")
    private String docenteNombre;

    private String docenteIdentificacion;

    private String evaluadorId;
    private String evaluadorNombre;
    private String evaluadorRol;

    @NotNull(message = "La fecha de evaluación es obligatoria")
    private LocalDate fechaEvaluacion;

    private String horaEvaluacion;

    private String observaciones;

    @NotEmpty(message = "Las respuestas de evaluación son obligatorias")
    @Valid
    @Builder.Default
    private List<EvaluacionDocenteRespuestaDto> respuestas = new ArrayList<>();
}
