package com.xpertiflow.evaluaciones.api.dto.sincronizacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GrupoSincronizacionResumenDto {

    private String rolExamenId;
    private String materiaCodigo;
    private String materiaNombre;
    private Integer semestre;
    private String grupo;
    private String tipoClase;
    private Boolean esTeorico;
    private String modalidad;
    private String tipoParcial;
    private String docenteNombre;
    private String docenteCi;
    private String aula;
    private String campus;
    private String estadoFlujo;
    private Integer totalEstudiantes;
    private Integer totalCalificados;
    private Boolean sincronizadoSea;
    private LocalDateTime fechaSincronizacionSea;
    private String sincronizadoPor;
    private String sincronizacionSeaResultado;
    private Boolean esSincronizable;
    private String motivoNoSincronizable;
}
