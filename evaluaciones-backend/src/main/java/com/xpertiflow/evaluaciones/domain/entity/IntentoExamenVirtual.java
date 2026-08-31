package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sea_intentos_examen_virtual")
public class IntentoExamenVirtual {
    @Id
    @Column(length = 64)
    private String id;
    @Column(name = "sala_id", nullable = false, length = 64)
    private String salaId;
    @Column(name = "mapeo_estudiante_variante_id", nullable = false)
    private Long mapeoEstudianteVarianteId;
    @Column(name = "codigo_estudiante", nullable = false, length = 30)
    private String codigoEstudiante;
    @Column(name = "nombre_estudiante", nullable = false, length = 220)
    private String nombreEstudiante;
    @Column(name = "variante_id", nullable = false, length = 64)
    private String varianteId;
    @Column(nullable = false, length = 20)
    private String estado = "PENDIENTE";
    @Column(name = "token_hash", nullable = false, unique = true, length = 128)
    private String tokenHash;
    @Column(name = "token_emitido_en", nullable = false)
    private LocalDateTime tokenEmitidoEn;
    @Column(name = "token_expira_en", nullable = false)
    private LocalDateTime tokenExpiraEn;
    @Column(name = "ingreso_en")
    private LocalDateTime ingresoEn;
    @Column(name = "inicio_en")
    private LocalDateTime inicioEn;
    @Column(name = "ultima_actividad_en")
    private LocalDateTime ultimaActividadEn;
    @Column(name = "enviado_en")
    private LocalDateTime enviadoEn;
    private Integer aciertos;
    @Column(name = "nota_sobre_30", precision = 5, scale = 2)
    private BigDecimal notaSobre30;
    @Column(name = "nota_sobre_100", precision = 5, scale = 2)
    private BigDecimal notaSobre100;
    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;
    @UpdateTimestamp
    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;
}
