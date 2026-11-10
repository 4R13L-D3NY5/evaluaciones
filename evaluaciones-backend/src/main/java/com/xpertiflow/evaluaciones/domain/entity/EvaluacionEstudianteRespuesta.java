package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sea_evaluacion_estudiante_respuestas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluacionEstudianteRespuesta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registro_id", nullable = false)
    private EvaluacionEstudianteRegistro registro;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "criterio_id", nullable = false)
    private EvaluacionCriterio criterio;

    @Column(name = "puntuacion", nullable = false)
    private Integer puntuacion;
}
