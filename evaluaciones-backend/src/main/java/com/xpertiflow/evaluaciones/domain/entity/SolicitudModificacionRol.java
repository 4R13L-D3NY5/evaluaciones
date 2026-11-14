package com.xpertiflow.evaluaciones.domain.entity;

import com.xpertiflow.evaluaciones.domain.enums.EstadoSolicitudModificacion;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "sea_solicitudes_modificacion_rol")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudModificacionRol {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "rol_examen_id", nullable = false, length = 64)
    private String rolExamenId;

    // Solicitante (Director de Carrera / Administrador)
    @Column(name = "solicitante_id", nullable = false)
    private Long solicitanteId;

    @Column(name = "solicitante_usuario", nullable = false, length = 100)
    private String solicitanteUsuario;

    @Column(name = "solicitante_nombre", nullable = false, length = 200)
    private String solicitanteNombre;

    @Column(name = "solicitante_rol", nullable = false, length = 50)
    private String solicitanteRol;

    // Contexto académico
    @Column(name = "sede_codigo", nullable = false, length = 20)
    private String sedeCodigo;

    @Column(name = "carrera_codigo", nullable = false, length = 50)
    private String carreraCodigo;

    @Column(name = "materia_codigo", nullable = false, length = 50)
    private String materiaCodigo;

    @Column(name = "materia_nombre", nullable = false, length = 255)
    private String materiaNombre;

    @Column(name = "grupo", nullable = false, length = 20)
    private String grupo;

    @Column(name = "tipo_parcial", length = 30)
    private String tipoParcial;

    // Snapshot original
    @Column(name = "fecha_original", nullable = false)
    private LocalDate fechaOriginal;

    @Column(name = "horario_original", nullable = false, length = 50)
    private String horarioOriginal;

    @Enumerated(EnumType.STRING)
    @Column(name = "modalidad_original", nullable = false, length = 50)
    private ModalidadExamen modalidadOriginal;

    // Propuesta
    @Column(name = "fecha_propuesta", nullable = false)
    private LocalDate fechaPropuesta;

    @Column(name = "horario_propuesto", nullable = false, length = 50)
    private String horarioPropuesto;

    @Enumerated(EnumType.STRING)
    @Column(name = "modalidad_propuesta", nullable = false, length = 50)
    private ModalidadExamen modalidadPropuesta;

    @Column(name = "motivo", nullable = false, columnDefinition = "TEXT")
    private String motivo;

    // Estado y Resolución
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    @Builder.Default
    private EstadoSolicitudModificacion estado = EstadoSolicitudModificacion.PENDIENTE;

    @Column(name = "resolutor_id")
    private Long resolutorId;

    @Column(name = "resolutor_usuario", length = 100)
    private String resolutorUsuario;

    @Column(name = "resolutor_nombre", length = 200)
    private String resolutorNombre;

    @Column(name = "observacion_resolucion", columnDefinition = "TEXT")
    private String observacionResolucion;

    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    @PrePersist
    public void prePersist() {
        if (creadoEn == null) {
            creadoEn = LocalDateTime.now();
        }
        if (actualizadoEn == null) {
            actualizadoEn = LocalDateTime.now();
        }
    }

    @PreUpdate
    public void preUpdate() {
        actualizadoEn = LocalDateTime.now();
    }
}
