package com.xpertiflow.evaluaciones.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConciliacionEntregaResponseDto {
    private boolean hayCambios;
    private int cuotaRequerida;
    private int totalEstudiantes;
    private int totalHabilitadosInicial;
    private int totalHabilitadosActual;
    private List<EstudianteRegularizadoDto> estudiantesRegularizados;
    private List<EstudianteEntregaDetalleDto> estudiantesActuales;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EstudianteRegularizadoDto {
        private String studentCode;
        private String fullName;
        private Integer cuotasPrevias;
        private Integer cuotasActuales;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EstudianteEntregaDetalleDto {
        private String studentCode;
        private String fullName;
        private Integer paidInstallments;
        private Integer totalInstallments;
        private boolean habilitado;
        private boolean regularizado;
    }
}
