package com.xpertiflow.evaluaciones.api.dto.sincronizacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrasladoCalificacionesResultadoDto {

    private int totalSolicitados;
    private int totalExitosos;
    private int totalFallidos;

    private LocalDateTime fechaEjecucion;
    private String ejecutadoPor;

    @Builder.Default
    private List<TrasladoCalificacionItemResultadoDto> resultados = new ArrayList<>();
}
