package com.xpertiflow.evaluaciones.api.dto.verificacion;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class VerificacionHistorialDevolucionDto {
    private Long id;
    private String bancoPreguntasId;
    private LocalDateTime fechaDevolucion;
    private String verificadoPor;
    private String observacionesGenerales;
    private List<VerificacionHistorialPreguntaDto> preguntasObservadas = new ArrayList<>();
}
