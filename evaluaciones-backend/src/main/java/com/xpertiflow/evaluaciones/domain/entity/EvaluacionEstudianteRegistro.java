package com.xpertiflow.evaluaciones.domain.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sea_evaluacion_estudiante_registros")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluacionEstudianteRegistro {

    @Id
    @Column(length = 64)
    private String id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instrumento_id", nullable = false)
    private EvaluacionInstrumento instrumento;

    @Column(name = "gestion", length = 30, nullable = false)
    private String gestion;

    @Column(name = "sede_codigo", length = 20, nullable = false)
    private String sedeCodigo;

    @Column(name = "sede_nombre", length = 150)
    private String sedeNombre;

    @Column(name = "carrera_codigo", length = 50, nullable = false)
    private String carreraCodigo;

    @Column(name = "carrera_nombre", length = 200)
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

    @Column(name = "estudiante_codigo", length = 50, nullable = false)
    private String estudianteCodigo;

    @Column(name = "estudiante_nombre", length = 220, nullable = false)
    private String estudianteNombre;

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

    @Column(name = "ip_origen", length = 45)
    private String ipOrigen;

    @CreationTimestamp
    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @JsonIgnore
    @OneToMany(mappedBy = "registro", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<EvaluacionEstudianteRespuesta> respuestas = new ArrayList<>();
}
