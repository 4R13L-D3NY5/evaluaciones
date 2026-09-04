package com.xpertiflow.evaluaciones.api.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CalificacionOmrResponseDto {
    private Long id;
    private String rolExamenId;
    private String codigoEstudiante;
    private String estudianteNombreCompleto;
    private String letraVariante;
    private Integer totalReactivos;
    private Integer aciertos;
    private Integer fallos;
    private Integer blancos;
    private Integer doblesMarcas;
    private BigDecimal notaSobre30;
    private BigDecimal notaSobre100;
    private String estadoCalificacion;
    private String respuestasDetectadasJson;
    private List<DetalleRespuestaOmrDto> detalles;
    private String imagenCartillaAnotadaPath;
    private String archivoEscaneadoPath;
    private String procesadoPor;
    private LocalDateTime fechaProcesamiento;
}
