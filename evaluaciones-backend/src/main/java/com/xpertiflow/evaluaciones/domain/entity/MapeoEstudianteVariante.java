package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sea_mapeo_estudiantes_variantes")
public class MapeoEstudianteVariante {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "rol_examen_id", length = 64, nullable = false)
    private String rolExamenId;

    @Column(name = "variante_id", length = 64, nullable = false)
    private String varianteId;

    @Column(name = "codigo_estudiante", length = 30, nullable = false)
    private String codigoEstudiante;

    @Column(name = "nombres", length = 100, nullable = false)
    private String nombres;

    @Column(name = "apellido_paterno", length = 80, nullable = false)
    private String apellidoPaterno;

    @Column(name = "apellido_materno", length = 80, nullable = false)
    private String apellidoMaterno;

    @Column(name = "letra_variante", length = 4, nullable = false)
    private String letraVariante;

    @Column(name = "hash_control_seguridad", length = 128, nullable = false)
    private String hashControlSeguridad;

    @Column(name = "cuadernillo_individual_pdf", length = 255)
    private String cuadernilloIndividualPdf;

    @Column(name = "estado_asistencia", length = 20, nullable = false)
    private String estadoAsistencia = "PRESENTE";

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;
}
