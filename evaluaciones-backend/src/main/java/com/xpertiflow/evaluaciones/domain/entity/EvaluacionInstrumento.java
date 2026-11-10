package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sea_evaluacion_instrumentos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluacionInstrumento {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "codigo", length = 50, nullable = false, unique = true)
    private String codigo;

    @Column(name = "titulo", length = 255, nullable = false)
    private String titulo;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "estado", length = 20, nullable = false)
    @Builder.Default
    private String estado = "BORRADOR";

    @Column(name = "destinatario", length = 30, nullable = false)
    @Builder.Default
    private String destinatario = "DIRECTOR";

    @Column(name = "escala_min", nullable = false)
    @Builder.Default
    private Integer escalaMin = 1;

    @Column(name = "escala_max", nullable = false)
    @Builder.Default
    private Integer escalaMax = 5;

    @Column(name = "creado_por", length = 100, nullable = false)
    @Builder.Default
    private String creadoPor = "ADMIN_EVALUACIONES";

    @CreationTimestamp
    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @UpdateTimestamp
    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;

    @OneToMany(mappedBy = "instrumento", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orden ASC")
    @Builder.Default
    private List<EvaluacionSeccion> secciones = new ArrayList<>();
}
