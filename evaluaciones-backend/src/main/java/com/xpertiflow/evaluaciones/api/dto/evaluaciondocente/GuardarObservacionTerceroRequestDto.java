package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuardarObservacionTerceroRequestDto {
    @NotBlank
    private String gestion;
    @NotBlank
    private String sedeCodigo;
    @NotBlank
    private String carreraCodigo;
    @NotBlank
    private String materiaCodigo;
    private String materiaNombre;
    private String grupoCodigo;
    @NotBlank
    private String docenteCi;
    private String docenteNombre;
    @NotBlank
    private String observacion;
}
