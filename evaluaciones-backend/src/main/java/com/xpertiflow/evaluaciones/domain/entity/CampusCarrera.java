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
@Table(name = "sea_campus_carreras")
@Getter
@Setter
@NoArgsConstructor
public class CampusCarrera {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sede_codigo", nullable = false, length = 30)
    private String sedeCodigo;

    @Column(name = "campus_clave", nullable = false, length = 220)
    private String campusClave;

    @Column(name = "campus_id", nullable = false, length = 100)
    private String campusId = "";

    @Column(name = "campus_codigo", nullable = false, length = 100)
    private String campusCodigo = "";

    @Column(name = "campus_nombre", nullable = false, length = 180)
    private String campusNombre;

    @Column(name = "carrera_codigo", nullable = false, length = 30)
    private String carreraCodigo;

    @Column(name = "carrera_nombre", nullable = false, length = 180)
    private String carreraNombre;

    @Column(name = "activo", nullable = false)
    private boolean activo = true;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;
}
