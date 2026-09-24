package com.xpertiflow.evaluaciones.api.dto.consulta;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstudianteNotaGrupoDto {
    private String codigoEstudiante;
    private String nombreCompleto;
    private String modalidad;
    private String asistencia;
    private String estadoCalificacion;
    private String variante;
    private BigDecimal notaSobre60;
    private BigDecimal notaSobre100;
    private Integer totalReactivos;
    private Integer aciertos;
    private Integer fallos;
    private Integer blancos;
    private Integer doblesMarcas;
    private java.util.Map<String, String> respuestasDetectadas;
}
