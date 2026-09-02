package com.xpertiflow.evaluaciones.api.dto.auth;

import java.time.LocalDateTime;
import java.util.List;

public record UsuarioSistemaResponseDto(
        Long id,
        String ci,
        String usuario,
        String nombreCompleto,
        String rol,
        String rolNombre,
        boolean activo,
        boolean debeCambiarContrasena,
        String proveedorIdentidad,
        List<AlcanceAcademicoDto> sedes,
        List<AlcanceAcademicoDto> carreras,
        LocalDateTime ultimoIngreso,
        LocalDateTime creadoEn
) {
}
