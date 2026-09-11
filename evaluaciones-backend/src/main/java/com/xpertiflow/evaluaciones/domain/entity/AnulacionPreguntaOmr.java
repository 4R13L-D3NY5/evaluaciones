package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sea_anulaciones_preguntas_omr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnulacionPreguntaOmr {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rol_examen_id", nullable = false, length = 64)
    private String rolExamenId;

    @Column(name = "letra_variante", nullable = false, length = 4)
    private String letraVariante;

    @Column(name = "numero_pregunta", nullable = false)
    private Integer numeroPregunta;

    @Column(name = "motivo", nullable = false, length = 500)
    private String motivo;

    @Column(name = "anulado_por", nullable = false, length = 100)
    private String anuladoPor;

    @CreationTimestamp
    @Column(name = "anulado_en", nullable = false, updatable = false)
    private LocalDateTime anuladoEn;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private boolean activo = true;
}
