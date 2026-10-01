package com.xpertiflow.evaluaciones.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstudianteNominaOmrDto {
    private String codigoEstudiante;
    private String nombreCompleto;
    private String letraVariante;
    private boolean yaCalificado;
    private boolean esReprogramado;
    private BigDecimal notaSobre60;
    private BigDecimal notaSobre100;
    private String estadoCalificacion;
    private LocalDate fechaExamenReprogramado;
    private Boolean sincronizadoSea;
    private java.time.LocalDateTime fechaSincronizacionSea;
}
