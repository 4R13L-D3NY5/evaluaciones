package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sea_evaluacion_docente_registros")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluacionDocenteRegistro {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instrumento_id", nullable = false)
    private EvaluacionInstrumento instrumento;

    @Column(name = "gestion", length = 30, nullable = false)
    private String gestion;

    @Column(name = "sede_id", length = 64)
    private String sedeId;

    @Column(name = "sede_codigo", length = 20, nullable = false)
    private String sedeCodigo;

    @Column(name = "sede_nombre", length = 150, nullable = false)
    private String sedeNombre;

    @Column(name = "carrera_id", length = 64)
    private String carreraId;

    @Column(name = "carrera_codigo", length = 50, nullable = false)
    private String carreraCodigo;

    @Column(name = "carrera_nombre", length = 200, nullable = false)
    private String carreraNombre;

    @Column(name = "materia_codigo", length = 50, nullable = false)
    private String materiaCodigo;

    @Column(name = "materia_nombre", length = 200, nullable = false)
    private String materiaNombre;

    @Column(name = "grupo_codigo", length = 50, nullable = false)
    private String grupoCodigo;

    @Column(name = "docente_id", length = 64)
    private String docenteId;

    @Column(name = "docente_nombre", length = 220, nullable = false)
    private String docenteNombre;

    @Column(name = "docente_identificacion", length = 50)
    private String docenteIdentificacion;

    @Column(name = "evaluador_id", length = 64)
    private String evaluadorId;

    @Column(name = "evaluador_nombre", length = 220, nullable = false)
    private String evaluadorNombre;

    @Column(name = "evaluador_rol", length = 50, nullable = false)
    private String evaluadorRol;

    @Column(name = "fecha_evaluacion", nullable = false)
    private LocalDate fechaEvaluacion;

    @Column(name = "hora_evaluacion", length = 20)
    private String horaEvaluacion;

    @Column(name = "puntaje_actitudinal", precision = 6, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal puntajeActitudinal = BigDecimal.ZERO;

    @Column(name = "puntaje_procedimental", precision = 6, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal puntajeProcedimental = BigDecimal.ZERO;

    @Column(name = "puntaje_cognitivo", precision = 6, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal puntajeCognitivo = BigDecimal.ZERO;

    @Column(name = "puntaje_total", precision = 6, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal puntajeTotal = BigDecimal.ZERO;

    @Column(name = "puntaje_maximo", precision = 6, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal puntajeMaximo = BigDecimal.valueOf(100);

    @Column(name = "porcentaje", precision = 5, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal porcentaje = BigDecimal.ZERO;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "estado", length = 30, nullable = false)
    @Builder.Default
    private String estado = "COMPLETADA";

    @Column(name = "creado_por", length = 100, nullable = false)
    private String creadoPor;

    @CreationTimestamp
    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @UpdateTimestamp
    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    @OneToMany(mappedBy = "registro", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<EvaluacionDocenteRespuesta> respuestas = new ArrayList<>();
}
