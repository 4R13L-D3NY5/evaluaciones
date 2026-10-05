package com.xpertiflow.evaluaciones.api.dto.reportes;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteCalidadItemDto {
    private String rolExamenId;
    private String materiaCodigo;
    private String materiaNombre;
    private String grupo;
    private String carreraCodigo;
    private String carreraNombre;
    private String sedeCodigo;
    private String sedeNombre;
    private String campus;
    private String docenteNombre;
    private String docenteCi;
    private String tipoParcial;
    private LocalDate fechaExamen;
    private String horaExamen;
    private String estadoFlujo;
    private String estadoCalidad; // APROBADO_DIRECTO, OBSERVADO_Y_APROBADO, OBSERVADO_PENDIENTE, PENDIENTE_REVISION, SIN_BANCO
    private int totalObservaciones;
    private LocalDateTime ultimaObservacionFecha;
    private String ultimoVerificador;
    private String aprobadoPor;
    private LocalDateTime fechaAprobacion;
    @Builder.Default
    private List<HistorialObservacionItemDto> observaciones = new ArrayList<>();
}
