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
    private String estadoSala;
    private String estadoIntento;
    private String iniciadaEn;
    private String terminaEn;
    private List<PreguntaVirtualDto> preguntas;
}
