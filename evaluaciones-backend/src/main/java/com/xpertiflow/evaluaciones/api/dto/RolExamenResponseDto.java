package com.xpertiflow.evaluaciones.api.dto;

import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.enums.TipoParcial;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class RolExamenResponseDto {

    private String id;
    private String seaGroupId;
    private String seaSyllabusCourseId;
    private String sedeCodigo;
    private String sedeNombre;
    private String carreraCodigo;
    private String carreraNombre;
    private String materiaCodigo;
    private String materiaNombre;
    private Integer semestre;
    private String grupo;
    private String tipoClase;
    private String docenteNombre;
    private String docenteCi;
    private TipoParcial tipoParcial;
    private Integer version;
    private ModalidadExamen modalidad;
    private EstadoFlujo estadoFlujo;
    private Integer semana;
    private String dia;
    private LocalDate fecha;
    private String fechaDisplay;
    private String horario;
    private String aula;
    private String campus;
    private Integer estudiantesInscritosCount;
    private Integer variantesGeneradasCount;
    private boolean bancoPreguntasCargado;
    private String hashEncriptacion;
    private LocalDateTime fechaValidacion;
    private LocalDateTime fechaGeneracion;
    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;
}
