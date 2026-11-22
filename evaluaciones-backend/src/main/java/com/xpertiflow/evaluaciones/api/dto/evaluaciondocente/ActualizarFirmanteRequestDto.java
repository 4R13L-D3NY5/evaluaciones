package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarFirmanteRequestDto {
    private boolean puedeObservar;
    private boolean puedeModificarRatificacion;
    private String tituloFirma;
    private int ordenFirma;
}
