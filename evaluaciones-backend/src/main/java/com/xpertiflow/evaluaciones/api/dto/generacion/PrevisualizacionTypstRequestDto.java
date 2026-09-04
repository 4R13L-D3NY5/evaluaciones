package com.xpertiflow.evaluaciones.api.dto.generacion;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class PrevisualizacionTypstRequestDto {

    private String jobId;

    @NotBlank
    private String rolExamenId;

    @NotEmpty
    @Size(max = 200)
    private List<Map<String, Object>> preguntas;
}
