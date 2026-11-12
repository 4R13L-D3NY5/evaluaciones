package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HabilitarSemestresRequestDto {

    @NotNull
    private String sedeCodigo;

    @NotNull
    private String carreraCodigo;

    private String gestion;

    @NotEmpty
    private List<Integer> semestres;

    @Builder.Default
    private Integer duracionMinutos = 90;
}
