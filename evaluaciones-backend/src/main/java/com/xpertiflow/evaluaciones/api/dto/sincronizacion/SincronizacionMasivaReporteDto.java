package com.xpertiflow.evaluaciones.api.dto.sincronizacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SincronizacionMasivaReporteDto {

    private Integer totalGruposSolicitados;
    private Integer totalGruposExitosos;
    private Integer totalGruposFallidos;
    private Integer totalEstudiantesSincronizados;
    private LocalDateTime fechaEjecucion;
    private String ejecutadoPor;
    private List<SincronizacionNotasSeaReporteDto> resultadosPorGrupo;
}
