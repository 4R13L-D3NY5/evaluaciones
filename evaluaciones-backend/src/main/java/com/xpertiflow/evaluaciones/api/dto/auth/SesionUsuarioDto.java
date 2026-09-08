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
    private boolean debeCambiarContrasena;
    private List<String> sedesAsignadas;
    private List<String> carrerasAsignadas;
    /** Momento estimado de expiración de la sesión HTTP, expresado en milisegundos. */
    private Long sesionExpiraEn;
    /** Duración de inactividad configurada para la sesión, en segundos. */
    private Integer sesionDuracionSegundos;
}
