package com.xpertiflow.evaluaciones.api.dto.generacion;

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
public class GeneracionHistorialItemDto {
    private String jobId;
    private String rolExamenId;
    private String estado;
    private String mensaje;
    private LocalDateTime solicitadoEn;
    private LocalDateTime actualizadoEn;
    private int totalEstudiantes;
    private int totalVariantes;
    private boolean esVersionActiva;
    private List<MapeoResultadoDto> mapeos;
    private List<VarianteResultadoDto> variantes;
}
