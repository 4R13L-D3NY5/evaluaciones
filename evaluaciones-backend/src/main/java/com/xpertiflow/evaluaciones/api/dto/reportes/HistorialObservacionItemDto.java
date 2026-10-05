package com.xpertiflow.evaluaciones.api.dto.reportes;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistorialObservacionItemDto {
    private Long devolucionId;
    private LocalDateTime fechaDevolucion;
    private String verificadoPor;
    private String observacionesGenerales;
    private String observacionesPreguntasJson;
    private Integer totalPreguntasObservadas;
}
