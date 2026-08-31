package com.xpertiflow.evaluaciones.api.dto;

import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.enums.TipoParcial;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class RolExamenRequestDto {

    @NotBlank
    private String id;

    private String seaGroupId;
    private String seaSyllabusCourseId;

    @NotBlank
    private String sedeCodigo;

    @NotBlank
    private String sedeNombre;

    @NotBlank
    private String carreraCodigo;

    @NotBlank
    private String carreraNombre;

    @NotBlank
    private String materiaCodigo;

    @NotBlank
    private String materiaNombre;

    private Integer semestre;

    @NotBlank
    private String grupo;

    private String tipoClase;

    @NotBlank
    private String docenteNombre;

    private String docenteCi;

    @NotNull
    private TipoParcial tipoParcial;

    /** Opcional en la solicitud: el servidor asigna la siguiente versión disponible. */
    private Integer version;

    @NotNull
    private ModalidadExamen modalidad;

    @NotNull
    private LocalDate fecha;

    private String horario;
    private String aula;
    private String campus;
    private String dia;
    private Integer semana;
}
