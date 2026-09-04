package com.xpertiflow.evaluaciones.api.dto.virtual;
import lombok.Data;
import java.util.List;
@Data
public class PreguntaVirtualDto {
    private Integer reactivoId;
    private Integer numeroPregunta;
    private String tipoReactivo;
    private String grupoContexto;
    private String enunciado;
    private String imagenBase64;
    private List<OpcionVirtualDto> opciones;
}
