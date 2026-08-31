package com.xpertiflow.evaluaciones.api.dto.virtual;
import lombok.Data;
@Data
public class ParticipanteVirtualDto {
    private String intentoId;
    private String codigoEstudiante;
    private String nombreEstudiante;
    private String estado;
    private String ingresoEn;
    private String enviadoEn;
    private Integer aciertos;
    private String notaSobre100;
}
