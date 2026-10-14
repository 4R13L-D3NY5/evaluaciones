package com.xpertiflow.evaluaciones.api.dto.testvocacional;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestVocacionalProcesarResponseDto {

    private String jobId;
    private String loteId;
    private String estado;
    private String mensaje;
    private Integer totalPaginas;
    private Integer paginaActual;
    private Integer porcentaje;
    private List<TestVocacionalItemDto> resultados;
}
