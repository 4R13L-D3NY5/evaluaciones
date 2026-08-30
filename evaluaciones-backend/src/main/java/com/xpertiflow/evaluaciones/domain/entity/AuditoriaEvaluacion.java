package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sea_auditoria_evaluaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditoriaEvaluacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rol_examen_id", nullable = false)
    private RolExamen rolExamen;

    @Column(name = "etapa_origen", length = 30, nullable = false)
    private String etapaOrigen;

    @Column(name = "etapa_destino", length = 30, nullable = false)
    private String etapaDestino;

    @Column(name = "accion", length = 100, nullable = false)
    private String accion;

    @Column(name = "usuario", length = 100, nullable = false)
    private String usuario;

    @Column(name = "ip_origen", length = 45)
    private String ipOrigen;

    @Column(name = "detalles_json")
    private String detallesJson;

    @CreationTimestamp
    @Column(name = "fecha_evento", updatable = false)
    private LocalDateTime fechaEvento;
}
