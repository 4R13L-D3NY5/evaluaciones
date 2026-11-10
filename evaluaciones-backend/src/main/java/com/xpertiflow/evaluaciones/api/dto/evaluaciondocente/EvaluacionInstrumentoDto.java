package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

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
public class EvaluacionInstrumentoDto {
    private String id;
    private String codigo;
    private String titulo;
    private String descripcion;
    private String estado;
    private String destinatario;
    private Integer escalaMin;
    private Integer escalaMax;
    private String creadoPor;
    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;
    private Integer totalCriterios;
    @Builder.Default
    private List<EvaluacionSeccionDto> secciones = new ArrayList<>();
}
