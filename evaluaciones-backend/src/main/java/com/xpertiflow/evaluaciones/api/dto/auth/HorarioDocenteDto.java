package com.xpertiflow.evaluaciones.api.dto.auth;

public record HorarioDocenteDto(
        String dia,
        String horaInicio,
        String horaFin,
        String aula,
        String campus
) {
}
