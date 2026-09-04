package com.xpertiflow.evaluaciones.api.dto.auth;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class UsuarioSistemaRequestDto {

    @NotBlank
    private String ci;

    /** Se conserva el orden y la forma del nombre recibidos desde SEA. */
    @NotBlank
    private String nombreCompleto;

    @NotBlank
    private String rolCodigo;

    private boolean activo = true;

    @Valid
    private List<AlcanceAcademicoDto> sedes = new ArrayList<>();

    @Valid
    private List<AlcanceAcademicoDto> carreras = new ArrayList<>();

    @Valid
    private List<AlcanceCampusDto> campuses = new ArrayList<>();

    @Valid
    private List<AsignacionAcademicaDto> asignaciones = new ArrayList<>();
}
