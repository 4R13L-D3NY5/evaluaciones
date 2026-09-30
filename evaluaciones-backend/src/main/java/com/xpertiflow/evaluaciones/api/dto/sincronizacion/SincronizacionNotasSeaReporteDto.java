package com.xpertiflow.evaluaciones.api.dto.sincronizacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SincronizacionNotasSeaReporteDto {

    private String rolExamenId;
    private String materiaCodigo;
    private String materiaNombre;
    private String grupo;
    private String modalidad;
    private String tipoParcial;
    private UUID syllabusCourseId;
    private UUID groupId;
    private Integer totalEstudiantes;
    private Integer totalExitosos;
    private Integer totalFallidos;
    private LocalDateTime fechaSincronizacion;
    private String sincronizadoPor;
    private List<EstudianteSincronizadoDetalleDto> estudiantes;
}
