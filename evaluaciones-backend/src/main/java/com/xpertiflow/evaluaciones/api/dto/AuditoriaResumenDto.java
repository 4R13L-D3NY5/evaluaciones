package com.xpertiflow.evaluaciones.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaResumenDto {

    private long totalEventos;
    private long ipsUnicas;
    private long operacionesCriticas;
    private long alertasSeguridad;
    private List<AuditoriaGlobalItemDto> items;
}
