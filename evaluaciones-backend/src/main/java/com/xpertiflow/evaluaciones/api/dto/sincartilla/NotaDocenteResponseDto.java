package com.xpertiflow.evaluaciones.api.dto.sincartilla;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotaDocenteResponseDto {
    private Long id;
    private String codigoEstudiante;
    private String estudianteNombreCompleto;
    private BigDecimal notaSobre60;
    private BigDecimal notaSobre100;
    private LocalDateTime guardadoEn;
    private String guardadoPor;

    private Boolean sincronizadoSea;
    private LocalDateTime fechaSincronizacionSea;
    private String sincronizadoSeaPor;

    private Boolean esReprogramado;
    private LocalDate fechaExamenReprogramado;
    private String motivoReprogramacion;
    private String comprobanteReprogramacion;
    private String observacionReprogramacion;
    private String reprogramadoPor;
    private LocalDateTime fechaReprogramacion;
    private BigDecimal notaOriginal60;
    private BigDecimal notaOriginal100;
}
