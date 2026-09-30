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
public class SincronizacionMasivaRequestDto {

    @NotEmpty(message = "Debe proporcionar al menos un rol de examen para sincronizar")
    private List<String> rolExamenIds;
}
