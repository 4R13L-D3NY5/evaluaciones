package com.xpertiflow.evaluaciones.api.dto.sincronizacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstudianteSincronizadoDetalleDto {

    private String codigoEstudiante;
    private Long studentOldCode;
    private String nombreCompleto;
    private Integer score;
    private Boolean completado;
    private String observacion;
    private Boolean esReprogramado;
    private Boolean sincronizadoSea;
    private java.time.LocalDateTime fechaSincronizacionSea;
    private String sincronizadoSeaPor;
}
