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
public class DiscrepanciaGrupoReporteDto {

    private int totalGruposAnalizados;
    private int totalEstudiantesAnalizados;
    private int totalConDiscrepancia;
    private int totalListosParaTrasladar;
    private int totalConflictos;
    private int totalNoEncontradosEnSea;

    private LocalDateTime fechaAnalisis;
    private String analizadoPor;

    @Builder.Default
    private List<DiscrepanciaGrupoItemDto> discrepancias = new ArrayList<>();
}
