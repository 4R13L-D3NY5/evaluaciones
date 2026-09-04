package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sea_auditoria_respaldos")
@Getter
@Setter
@NoArgsConstructor
public class AuditoriaRespaldo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "respaldo_id", length = 64)
    private String respaldoId;

    @Column(nullable = false, length = 60)
    private String accion;

    @Column(nullable = false, length = 100)
    private String actor;

    @Column(name = "detalle_json", columnDefinition = "jsonb")
    private String detalleJson;

    @Column(name = "ip_origen", length = 45)
    private String ipOrigen;

    @Column(name = "fecha_evento", nullable = false)
    private LocalDateTime fechaEvento;
}
