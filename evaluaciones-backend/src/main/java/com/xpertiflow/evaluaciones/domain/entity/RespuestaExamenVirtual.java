package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sea_respuestas_examen_virtual")
public class RespuestaExamenVirtual {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "intento_id", nullable = false, length = 64)
    private String intentoId;

    @Column(name = "numero_pregunta", nullable = false)
    private Integer numeroPregunta;

    @Column(name = "reactivo_id", nullable = false)
    private Integer reactivoId;

    @Column(length = 10)
    private String respuesta;

    @Column(name = "guardada_en", nullable = false)
    private LocalDateTime guardadaEn;
}
