package com.xpertiflow.evaluaciones.api.dto;

import java.time.LocalDateTime;
import java.util.List;

public record PreparacionCartillasOmrResponseDto(
        String rolExamenId,
        String carreraNombre,
        String materiaCodigo,
        String grupo,
        Integer totalCartillas,
        String estadoImpresion,
        LocalDateTime impresoEn,
        String usuarioImpresion,
        List<DatosCartillaOmrDto> estudiantes,
        String estadoImpresionLista,
        LocalDateTime listaImpresaEn,
        String usuarioImpresionLista
) {
}
