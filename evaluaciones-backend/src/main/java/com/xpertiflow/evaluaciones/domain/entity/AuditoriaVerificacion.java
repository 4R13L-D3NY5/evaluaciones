package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sea_auditoria_verificacion")
@Getter
@Setter
@NoArgsConstructor
public class AuditoriaVerificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rol_examen_id", length = 64)
    private String rolExamenId;

    @Column(name = "accion", nullable = false, length = 80)
    private String accion;

    @Column(name = "realizado_por", nullable = false, length = 100)
    private String realizadoPor;

    @Column(name = "detalle", columnDefinition = "TEXT")
    private String detalle;

    @Column(name = "fecha_evento", nullable = false)
    private LocalDateTime fechaEvento;
}
