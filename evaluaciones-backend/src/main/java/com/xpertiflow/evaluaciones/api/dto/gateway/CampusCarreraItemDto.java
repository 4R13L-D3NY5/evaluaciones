package com.xpertiflow.evaluaciones.api.dto.gateway;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CampusCarreraItemDto {

    @NotBlank
    private String codigo;

    @NotBlank
    private String nombre;
}
