package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FirmanteConfiguracionDto {
    private Long usuarioId;
    private String usuario;
    private String nombreCompleto;
    private String correo;
    private String rolCodigo;
    private String rolNombre;
    private boolean activo;
    private boolean puedeObservar;
    private boolean puedeModificarRatificacion;
    private String tituloFirma;
    private int ordenFirma;
    private boolean esSoloVisual;
}
