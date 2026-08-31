package com.xpertiflow.evaluaciones.api.dto.auth;

import lombok.Data;

import java.util.List;

@Data
public class SesionUsuarioDto {

    private String usuario;
    private String correo;
    private String nombreCompleto;
    private String rol;
    private String rolNombre;
    private List<String> sedesAsignadas;
}
