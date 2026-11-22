package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FirmanteOficialDto {
    private Long usuarioId;
    private String usuario;
    private String nombreCompleto;
    private String rol;
    private String tituloFirma;
    private int ordenFirma;
    private boolean puedeObservar;
    private boolean puedeRatificar;
    private boolean esSoloVisual;
}
