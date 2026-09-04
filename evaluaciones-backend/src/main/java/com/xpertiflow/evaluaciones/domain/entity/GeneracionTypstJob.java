package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sea_generaciones_typst")
@Getter
@Setter
@NoArgsConstructor
public class GeneracionTypstJob {

    @Id
    @Column(name = "job_id", length = 100)
    private String jobId;

    @Column(name = "rol_examen_id", nullable = false, length = 120)
    private String rolExamenId;

    @Column(nullable = false, length = 40)
    private String estado;

    @Column(columnDefinition = "TEXT")
    private String mensaje;

    @Column(name = "resultado_json", columnDefinition = "jsonb")
    private String resultadoJson;

    @Column(name = "solicitado_en", nullable = false)
    private LocalDateTime solicitadoEn;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;
}
