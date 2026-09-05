package com.xpertiflow.evaluaciones.api.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Map;

@Data
public class ConfiguracionEvaluacionesDto {

    @NotNull
    @Min(1)
    @Max(30)
    private Integer ratioEstudiantesPorVariante;

    @NotNull
    @Min(1)
    @Max(480)
    private Integer duracionExamenVirtualMinutos;

    @Min(0)
    @Max(120)
    private Integer cuentaRegresivaInicioVirtualSegundos;

    private String formatoHoja;

    private String tipoLetra;

    @NotNull
    @Min(8)
    @Max(18)
    private Integer tamanoLetraPt;

    private String espaciadoLeading;

    private Map<String, ConfiguracionParcialDto> estructuraPreguntas;

    @Min(0)
    @Max(10080)
    private Integer minutosAntesEntrega;

    @Min(0)
    @Max(720)
    private Integer horasAntesGeneracion;

    @Min(0)
    @Max(720)
    private Integer horasPostPatron;

    @Min(0)
    @Max(720)
    private Integer horasAntesLista;

    @Min(0)
    @Max(720)
    private Integer horasCandado72;

    private LocalDateTime actualizadoEn;

    private String actualizadoPor;
}
