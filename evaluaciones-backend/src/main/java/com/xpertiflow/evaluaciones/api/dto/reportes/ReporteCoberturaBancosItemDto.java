package com.xpertiflow.evaluaciones.api.dto.reportes;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteCoberturaBancosItemDto {
    private String rolExamenId;
    private String carreraCodigo;
    private String carreraNombre;
    private String sedeCodigo;
    private String sedeNombre;
    private String materiaCodigo;
    private String materiaNombre;
    private String grupo;
    private Integer semestre;
    private String docenteNombre;
    private String docenteCi;
    private String tipoParcial;
    private LocalDate fechaExamen;
    private String horaExamen;
    private boolean tieneBanco;
    private String estadoBanco; // VALIDADO, PENDIENTE, SIN_BANCO
    private Integer totalReactivos;
    private Integer facilesCount;
    private Integer mediasCount;
    private Integer dificilesCount;
    private LocalDateTime fechaAprobacionBanco;
}
