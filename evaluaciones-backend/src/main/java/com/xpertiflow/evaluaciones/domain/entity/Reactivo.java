package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sea_reactivos")
public class Reactivo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "banco_id", length = 64, nullable = false)
    private String bancoId;

    @Column(name = "numero_orden", nullable = false)
    private Integer numeroOrden;

    @Column(name = "tipo_reactivo", length = 50, nullable = false)
    private String tipoReactivo;

    @Column(name = "dificultad", length = 20, nullable = false)
    private String dificultad;

    @Column(name = "nivel_dificultad", nullable = false)
    private Integer nivelDificultad = 2;

    @Column(name = "grupo_contexto", length = 100)
    private String grupoContexto;

    @Column(name = "enunciado", columnDefinition = "TEXT")
    private String enunciado;

    @Column(name = "imagen_base64", columnDefinition = "TEXT")
    private String imagenBase64;

    @Column(name = "opciones_json", columnDefinition = "TEXT")
    private String opcionesJson;

    @Column(name = "respuesta_correcta", length = 1)
    private String respuestaCorrecta;

    @Column(name = "peso_puntos", nullable = false, precision = 5, scale = 2)
    private BigDecimal pesoPuntos = BigDecimal.ONE;

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;
}
