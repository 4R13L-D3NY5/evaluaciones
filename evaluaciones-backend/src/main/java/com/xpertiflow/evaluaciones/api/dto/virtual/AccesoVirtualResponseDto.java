package com.xpertiflow.evaluaciones.api.dto.virtual;
import lombok.Data;
import java.util.List;
@Data
public class AccesoVirtualResponseDto {
    private String intentoId;
    private String tokenSesion;
    private String codigoEstudiante;
    private String nombreEstudiante;
    private String codigoSala;
    private String institucionNombre;
    private String sedeNombre;
    private String carreraNombre;
    private String materiaCodigo;
    private String materiaNombre;
    private String grupo;
    private String docenteNombre;
    private String tipoParcial;
    private String modalidad;
    private String fecha;
    private String horario;
    private String aula;
    private String estadoSala;
    private String estadoIntento;
    private String iniciadaEn;
    private String terminaEn;
    private Long cuentaRegresivaSegundos;
    private Long tiempoRestanteSegundos;
    private List<PreguntaVirtualDto> preguntas;
}
