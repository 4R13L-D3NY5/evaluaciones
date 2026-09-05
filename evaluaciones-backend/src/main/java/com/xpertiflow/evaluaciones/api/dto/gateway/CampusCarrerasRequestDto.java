package com.xpertiflow.evaluaciones.api.dto.gateway;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class CampusCarrerasRequestDto {

    @NotBlank
    private String sedeCodigo;

    private String campusId;
    private String campusCodigo;

    @NotBlank
    private String campusNombre;

    @Valid
    private List<CampusCarreraItemDto> carreras = new ArrayList<>();
}
