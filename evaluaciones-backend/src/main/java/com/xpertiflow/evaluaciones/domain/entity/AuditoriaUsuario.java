package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sea_auditoria_usuarios")
@Getter
@Setter
@NoArgsConstructor
public class AuditoriaUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario_objetivo_id")
    private Long usuarioObjetivoId;

    @Column(name = "usuario_objetivo_ci", length = 30)
    private String usuarioObjetivoCi;

    @Column(name = "accion", nullable = false, length = 60)
    private String accion;

    @Column(name = "realizado_por", nullable = false, length = 100)
    private String realizadoPor;

    @Column(name = "detalle", length = 500)
    private String detalle;

    @Column(name = "fecha_evento", nullable = false)
    private LocalDateTime fechaEvento;
}
