package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sea_verificaciones_examenes")
@Getter
@Setter
@NoArgsConstructor
public class VerificacionExamen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rol_examen_id", nullable = false, unique = true, length = 64)
    private String rolExamenId;

    @Column(name = "banco_preguntas_id", nullable = false, length = 64)
    private String bancoPreguntasId;

    @Column(name = "estado", nullable = false, length = 20)
    private String estado = "PENDIENTE";

    @Column(name = "observaciones_generales", columnDefinition = "TEXT")
    private String observacionesGenerales;

    @Column(name = "observaciones_preguntas_json", columnDefinition = "TEXT")
    private String observacionesPreguntasJson;

    @Column(name = "verificado_por", length = 100)
    private String verificadoPor;

    @Column(name = "fecha_verificacion")
    private LocalDateTime fechaVerificacion;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;
}
