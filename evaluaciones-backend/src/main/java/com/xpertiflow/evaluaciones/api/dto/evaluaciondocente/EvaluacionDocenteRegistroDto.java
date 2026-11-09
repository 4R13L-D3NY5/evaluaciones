package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluacionDocenteRegistroDto {
    private String id;
    private String instrumentoId;
    private String instrumentoTitulo;
    private String gestion;
    private String sedeId;
    private String sedeCodigo;
    private String sedeNombre;
    private String carreraId;
    private String carreraCodigo;
    private String carreraNombre;
    private String materiaCodigo;
    private String materiaNombre;
    private String grupoCodigo;
    private String docenteId;
    private String docenteNombre;
    private String docenteIdentificacion;
    private String evaluadorId;
    private String evaluadorNombre;
    private String evaluadorRol;
    private LocalDate fechaEvaluacion;
    private String horaEvaluacion;
    private BigDecimal puntajeActitudinal;
    private BigDecimal puntajeProcedimental;
    private BigDecimal puntajeCognitivo;
    private BigDecimal puntajeTotal;
    private BigDecimal puntajeMaximo;
    private BigDecimal porcentaje;
    private String observaciones;
    private String estado;
    private String creadoPor;
    private LocalDateTime creadoEn;
    @Builder.Default
    private List<EvaluacionDocenteRespuestaDto> respuestas = new ArrayList<>();
}
