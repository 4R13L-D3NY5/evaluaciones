package com.xpertiflow.evaluaciones.api.dto.virtual;
import lombok.Data;
import java.util.List;
@Data
public class SalaVirtualCreadaDto {
    private SalaVirtualResponseDto sala;
    private List<AccesoGeneradoDto> accesos;
    @Data
    public static class AccesoGeneradoDto {
        private String codigoEstudiante;
        private String nombreEstudiante;
        private String token;
    }
}
