package com.xpertiflow.evaluaciones.api.dto.verificacion;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class VerificacionExamenListaDto {
    private String rolExamenId;
    private String bancoPreguntasId;
    private String sedeCodigo;
    private String sedeNombre;
    private String carreraCodigo;
    private String carreraNombre;
    private String materiaCodigo;
    private String materiaNombre;
    private String grupo;
    private String tipoParcial;
    private Integer version;
    private String modalidad;
    private LocalDate fechaExamen;
    private String horario;
    private LocalDateTime fechaSubida;
    private String docenteNombre;
    private String estadoVerificacion;
    private String observacionesGenerales;
}
