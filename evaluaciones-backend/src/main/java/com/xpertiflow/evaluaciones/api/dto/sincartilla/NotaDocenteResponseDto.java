package com.xpertiflow.evaluaciones.api.dto.sincartilla;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder
public class NotaDocenteResponseDto {
    private Long id;
    private String codigoEstudiante;
    private String estudianteNombreCompleto;
    private BigDecimal notaSobre30;
    private BigDecimal notaSobre100;
    private LocalDateTime guardadoEn;
    private String guardadoPor;
}
