package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sea_configuracion_verificacion")
@Getter
@Setter
@NoArgsConstructor
public class ConfiguracionVerificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sede_codigo", nullable = false, length = 30)
    private String sedeCodigo;

    @Column(name = "sede_nombre", nullable = false, length = 150)
    private String sedeNombre;

    @Column(name = "carrera_codigo", length = 50)
    private String carreraCodigo;

    @Column(name = "carrera_nombre", length = 180)
    private String carreraNombre;

    @Column(name = "habilitada", nullable = false)
    private boolean habilitada;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    @Column(name = "actualizado_por", nullable = false, length = 100)
    private String actualizadoPor;
}
