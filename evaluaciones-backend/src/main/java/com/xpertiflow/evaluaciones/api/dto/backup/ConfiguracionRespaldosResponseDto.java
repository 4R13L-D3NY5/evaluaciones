package com.xpertiflow.evaluaciones.api.dto.backup;

import java.time.LocalDateTime;

public record ConfiguracionRespaldosResponseDto(
        boolean activo,
        int frecuenciaMinutos,
        int retencionDias,
        String destinoExternoConfigurado,
        String repositorioLocalConfigurado,
        String repositorioExternoConfigurado,
        LocalDateTime proximaEjecucion,
        LocalDateTime actualizadoEn) {
}
