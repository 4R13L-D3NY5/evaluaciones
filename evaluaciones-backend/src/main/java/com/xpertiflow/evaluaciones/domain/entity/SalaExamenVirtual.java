package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sea_salas_examen_virtual")
public class SalaExamenVirtual {
    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "rol_examen_id", nullable = false, length = 64)
    private String rolExamenId;

    @Column(name = "codigo_sala", nullable = false, unique = true, length = 20)
    private String codigoSala;

    @Column(nullable = false, length = 20)
    private String estado = "PREPARADA";

    @Column(name = "duracion_minutos", nullable = false)
    private Integer duracionMinutos = 45;

    @Column(name = "gracia_ingreso_minutos", nullable = false)
    private Integer graciaIngresoMinutos = 10;

    @Column(name = "permite_reconexion", nullable = false)
    private Boolean permiteReconexion = true;

    @Column(name = "publicada_en")
    private LocalDateTime publicadaEn;

    @Column(name = "iniciada_en")
    private LocalDateTime iniciadaEn;

    @Column(name = "termina_en")
    private LocalDateTime terminaEn;

    @Column(name = "cerrada_en")
    private LocalDateTime cerradaEn;

    @Column(name = "creado_por", nullable = false, length = 100)
    private String creadoPor;

    @Column(name = "iniciado_por", length = 100)
    private String iniciadoPor;

    @Column(name = "cerrado_por", length = 100)
    private String cerradoPor;

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @UpdateTimestamp
    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;
}
