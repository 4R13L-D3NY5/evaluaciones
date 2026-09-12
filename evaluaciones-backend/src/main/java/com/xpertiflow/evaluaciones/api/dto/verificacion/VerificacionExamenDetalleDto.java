package com.xpertiflow.evaluaciones.api.dto.verificacion;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class VerificacionExamenDetalleDto {
    private String rolExamenId;
    private String bancoPreguntasId;
    private String sedeNombre;
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
    private List<VerificacionPreguntaDto> preguntas = new ArrayList<>();
}
