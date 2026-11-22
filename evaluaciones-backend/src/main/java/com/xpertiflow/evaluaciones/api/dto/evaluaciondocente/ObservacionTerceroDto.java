package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ObservacionTerceroDto {
    private Long id;
    private Long usuarioId;
    private String usuarioNombre;
    private String usuarioRol;
    private String tituloFirma;
    private String observacion;
    private LocalDateTime fechaRegistro;
    private LocalDateTime fechaActualizacion;
}
