package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Duration;
import java.time.LocalDateTime;

@Entity
@Table(name = "sea_evaluacion_habilitacion_semestre", uniqueConstraints = {
        @UniqueConstraint(name = "uq_hab_semestre", columnNames = {"sede_codigo", "carrera_codigo", "gestion", "semestre"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluacionHabilitacionSemestre {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "sede_codigo", length = 20, nullable = false)
    private String sedeCodigo;

    @Column(name = "carrera_codigo", length = 50, nullable = false)
    private String carreraCodigo;

    @Column(name = "gestion", length = 30, nullable = false)
    private String gestion;

    @Column(name = "semestre", nullable = false)
    private Integer semestre;

    @Column(name = "habilitado", nullable = false)
    @Builder.Default
    private boolean habilitado = true;

    @Column(name = "habilitado_en", nullable = false)
    private LocalDateTime habilitadoEn;

    @Column(name = "expira_en", nullable = false)
    private LocalDateTime expiraEn;

    @Column(name = "duracion_minutos", nullable = false)
    @Builder.Default
    private Integer duracionMinutos = 90;

    @Column(name = "habilitado_por", length = 100)
    private String habilitadoPor;

    @UpdateTimestamp
    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    public boolean isActivo() {
        return habilitado && expiraEn != null && LocalDateTime.now().isBefore(expiraEn);
    }

    public long getSegundosRestantes() {
        if (!isActivo()) {
            return 0L;
        }
        return Math.max(0L, Duration.between(LocalDateTime.now(), expiraEn).toSeconds());
    }
}
