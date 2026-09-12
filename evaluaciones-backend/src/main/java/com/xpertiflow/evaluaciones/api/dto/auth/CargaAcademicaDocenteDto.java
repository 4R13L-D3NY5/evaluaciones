package com.xpertiflow.evaluaciones.api.dto.auth;

import java.util.List;

public record CargaAcademicaDocenteDto(
        String gestion,
        String sedeCodigo,
        String sedeNombre,
        String carreraCodigo,
        String carreraNombre,
        String asignaturaCodigo,
        String asignaturaNombre,
        String grupo,
        String tipoClase,
        List<HorarioDocenteDto> horarios
) {
}
