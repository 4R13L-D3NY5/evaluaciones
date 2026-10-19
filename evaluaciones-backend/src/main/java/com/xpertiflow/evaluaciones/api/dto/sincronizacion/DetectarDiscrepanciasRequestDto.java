package com.xpertiflow.evaluaciones.api.dto.sincronizacion;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetectarDiscrepanciasRequestDto {

    @NotEmpty(message = "Debe proporcionar al menos un ID de rol de examen para analizar.")
    private List<String> rolExamenIds;

    private String sedeCodigo;
    private String carreraCodigo;
}
