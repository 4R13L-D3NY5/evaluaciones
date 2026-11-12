package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SemestreHabilitacionEstadoDto {

    private Integer semestre;
    private String semestreDisplay;
    private boolean activo;
    private LocalDateTime habilitadoEn;
    private LocalDateTime expiraEn;
    private Long segundosRestantes;
    private Integer duracionMinutos;
    private String habilitadoPor;
    private int totalMaterias;
    private int totalDocentes;
}
