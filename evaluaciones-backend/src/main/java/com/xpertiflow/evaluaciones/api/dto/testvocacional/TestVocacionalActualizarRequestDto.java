package com.xpertiflow.evaluaciones.api.dto.testvocacional;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestVocacionalActualizarRequestDto {

    private String nombreCompleto;
    private String celular;
    private String correo;

    @NotBlank(message = "El colegio es obligatorio")
    private String colegio;

    @NotBlank(message = "El curso es obligatorio")
    private String curso;

    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    private String sede;
    private String gestion;
    private String municipio;

    private List<Integer> numerosMarcados;
    private String observaciones;
}
