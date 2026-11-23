package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sea_evaluacion_docente_observacion_tercero")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluacionDocenteObservacionTercero {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "gestion", length = 30, nullable = false)
    private String gestion;

    @Column(name = "sede_codigo", length = 30, nullable = false)
    private String sedeCodigo;

    @Column(name = "carrera_codigo", length = 50, nullable = false)
    private String carreraCodigo;

    @Column(name = "materia_codigo", length = 50, nullable = false)
    private String materiaCodigo;

    @Column(name = "materia_nombre", length = 150, nullable = false)
    private String materiaNombre;

    @Column(name = "grupo_codigo", length = 100, nullable = false)
    @Builder.Default
    private String grupoCodigo = "";

    @Column(name = "docente_ci", length = 30, nullable = false)
    private String docenteCi;

    @Column(name = "docente_nombre", length = 150, nullable = false)
    private String docenteNombre;

    @Column(name = "usuario_id", nullable = false)
    private Long usuarioId;

    @Column(name = "usuario_nombre", length = 150, nullable = false)
    private String usuarioNombre;

    @Column(name = "usuario_rol", length = 50, nullable = false)
    private String usuarioRol;

    @Column(name = "titulo_firma", length = 150, nullable = false)
    private String tituloFirma;

    @Column(name = "observacion", columnDefinition = "TEXT", nullable = false)
    private String observacion;

    @CreationTimestamp
    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @UpdateTimestamp
    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;
}
