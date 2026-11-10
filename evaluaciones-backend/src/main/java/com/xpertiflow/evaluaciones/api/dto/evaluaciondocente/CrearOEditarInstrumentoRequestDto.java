package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearOEditarInstrumentoRequestDto {
    private String id;

    @NotBlank(message = "El código del instrumento es obligatorio")
    private String codigo;

    @NotBlank(message = "El título del instrumento es obligatorio")
    private String titulo;

    private String descripcion;

    @Builder.Default
    private String estado = "BORRADOR";

    @Builder.Default
    private String destinatario = "DIRECTOR";

    @Builder.Default
    private Integer escalaMin = 1;

    @Builder.Default
    private Integer escalaMax = 5;

    @Builder.Default
    private List<EvaluacionSeccionDto> secciones = new ArrayList<>();
}
