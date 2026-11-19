package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sea_docente_ratificacion", uniqueConstraints = {
        @UniqueConstraint(name = "uq_docente_materia_ratificacion", columnNames = {
                "gestion", "sede_codigo", "carrera_codigo", "materia_codigo", "docente_ci"
        })
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocenteRatificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "gestion", nullable = false, length = 30)
    private String gestion;

    @Column(name = "sede_codigo", nullable = false, length = 30)
    private String sedeCodigo;

    @Column(name = "carrera_codigo", nullable = false, length = 50)
    private String carreraCodigo;

    @Column(name = "materia_codigo", nullable = false, length = 50)
    private String materiaCodigo;

    @Column(name = "materia_nombre", nullable = false, length = 150)
    private String materiaNombre;

    @Column(name = "grupo_codigo", nullable = false, length = 100)
    private String grupoCodigo;

    @Column(name = "docente_ci", nullable = false, length = 30)
    private String docenteCi;

    @Column(name = "docente_nombre", nullable = false, length = 150)
    private String docenteNombre;

    @Column(name = "nota_director", nullable = false, precision = 5, scale = 2)
    private BigDecimal notaDirector;

    @Column(name = "nota_estudiantes", nullable = false, precision = 5, scale = 2)
    private BigDecimal notaEstudiantes;

    @Column(name = "nota_final", nullable = false, precision = 5, scale = 2)
    private BigDecimal notaFinal;

    @Column(name = "estado_calculado", nullable = false, length = 30)
    private String estadoCalculado;

    @Column(name = "estado_definitivo", nullable = false, length = 30)
    private String estadoDefinitivo;

    @Column(name = "es_modificado_manualmente", nullable = false)
    private boolean esModificadoManualmente;

    @Column(name = "modificado_por_usuario", length = 100)
    private String modificadoPorUsuario;

    @Column(name = "modificado_por_nombre", length = 150)
    private String modificadoPorNombre;

    @Column(name = "motivo_modificacion", columnDefinition = "TEXT")
    private String motivoModificacion;

    @Column(name = "fecha_modificacion")
    private LocalDateTime fechaModificacion;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    @PrePersist
    public void prePersist() {
        if (creadoEn == null) creadoEn = LocalDateTime.now();
        if (actualizadoEn == null) actualizadoEn = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        actualizadoEn = LocalDateTime.now();
    }
}
