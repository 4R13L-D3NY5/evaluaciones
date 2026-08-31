package com.xpertiflow.evaluaciones.api.dto.virtual;
import lombok.Data;
import java.util.List;
@Data
public class SalaVirtualResponseDto {
    private String id;
    private String rolExamenId;
    private String codigoSala;
    private String estado;
    private Integer duracionMinutos;
    private Integer graciaIngresoMinutos;
    private String iniciadaEn;
    private String terminaEn;
    private List<ParticipanteVirtualDto> participantes;
}
