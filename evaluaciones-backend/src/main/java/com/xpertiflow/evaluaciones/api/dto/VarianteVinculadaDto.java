package com.xpertiflow.evaluaciones.api.dto;

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
public class VarianteVinculadaDto {

    private String letraVariante;
    private Integer numeroPregunta;
    private String reactivoId;
    private Integer numeroBanco;
    private String respuestaCorrecta;
    private boolean anulada;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumenVariantesVinculadasDto {
        private String rolExamenId;
        private String letraVarianteOrigen;
        private Integer numeroPreguntaOrigen;
        private String reactivoId;
        private Integer numeroBanco;
        private String respuestaCorrecta;
        private boolean anulada;
        @Builder.Default
        private List<VarianteVinculadaDto> variantesVinculadas = new ArrayList<>();
    }
}
