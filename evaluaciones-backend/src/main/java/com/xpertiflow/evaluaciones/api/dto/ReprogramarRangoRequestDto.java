package com.xpertiflow.evaluaciones.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReprogramarRangoRequestDto {

    @NotBlank(message = "El código de sede es obligatorio")
    private String sedeCodigo;

    @NotBlank(message = "El código de carrera es obligatorio")
    private String carreraCodigo;

    @NotNull(message = "La fecha origen desde es obligatoria")
    private LocalDate fechaDesdeOrigen;

    @NotNull(message = "La fecha origen hasta es obligatoria")
    private LocalDate fechaHastaOrigen;

    @NotNull(message = "La nueva fecha de inicio es obligatoria")
    private LocalDate fechaNuevaInicio;

    private String motivo;
}
