package com.xpertiflow.evaluaciones.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VicerrectorEdicionRolDto {
    private Long id;
    private String usuario;
    private String ci;
    private String nombreCompleto;
    private List<String> sedesAsignadas;
    private boolean puedeEditarRolesExamen;
}
