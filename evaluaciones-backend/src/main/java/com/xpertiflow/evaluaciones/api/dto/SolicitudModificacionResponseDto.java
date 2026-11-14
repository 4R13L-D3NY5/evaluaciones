package com.xpertiflow.evaluaciones.api.dto;

import com.xpertiflow.evaluaciones.domain.enums.EstadoSolicitudModificacion;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudModificacionResponseDto {

    private String id;
    private String rolExamenId;

    // Solicitante
    private Long solicitanteId;
    private String solicitanteUsuario;
    private String solicitanteNombre;
    private String solicitanteRol;

    // Contexto académico
    private String sedeCodigo;
    private String carreraCodigo;
    private String materiaCodigo;
    private String materiaNombre;
    private String grupo;
    private String tipoParcial;

    // Snapshot original
    private LocalDate fechaOriginal;
    private String horarioOriginal;
    private ModalidadExamen modalidadOriginal;

    // Datos propuestos
    private LocalDate fechaPropuesta;
    private String horarioPropuesto;
    private ModalidadExamen modalidadPropuesta;
    private String motivo;

    // Estado y Resolución
    private EstadoSolicitudModificacion estado;
    private Long resolutorId;
    private String resolutorUsuario;
    private String resolutorNombre;
    private String observacionResolucion;
    private LocalDateTime fechaResolucion;

    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;
}
