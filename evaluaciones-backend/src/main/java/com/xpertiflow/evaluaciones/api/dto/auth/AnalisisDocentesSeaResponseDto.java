package com.xpertiflow.evaluaciones.api.dto.auth;

import java.time.LocalDateTime;
import java.util.List;

public record AnalisisDocentesSeaResponseDto(
        String gestion,
        LocalDateTime consultadoEn,
        int docentesEnSea,
        int conAcceso,
        int nuevos,
        int sinAcceso,
        int yaNoEstan,
        int cuentasConRolDiferente,
        int docentesSinCi,
        List<DocenteSeaAnalisisDto> docentes
) {
}
