package com.xpertiflow.evaluaciones.api.dto.sincronizacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrasladoCalificacionItemResultadoDto {

    private String codigoEstudiante;
    private String nombreEstudiante;
    private String rolExamenOrigenId;
    private String grupoOrigen;
    private String rolExamenDestinoId;
    private String grupoDestino;
    private boolean exitoso;
    private String mensaje;
}
