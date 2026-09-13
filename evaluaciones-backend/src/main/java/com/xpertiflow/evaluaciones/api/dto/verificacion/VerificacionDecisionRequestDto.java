package com.xpertiflow.evaluaciones.api.dto.verificacion;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.LinkedHashMap;
import java.util.Map;

@Data
public class VerificacionDecisionRequestDto {

    @NotBlank
    private String decision;

    private String observacionesGenerales;
    private Map<String, String> observacionesPreguntas = new LinkedHashMap<>();
}
