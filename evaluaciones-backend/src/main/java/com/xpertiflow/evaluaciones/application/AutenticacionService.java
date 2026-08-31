package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.auth.SesionUsuarioDto;
import com.xpertiflow.evaluaciones.domain.entity.UsuarioSistema;
import com.xpertiflow.evaluaciones.domain.repository.UsuarioSistemaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AutenticacionService {

    private final UsuarioSistemaRepository repository;

    @Transactional
    public SesionUsuarioDto registrarIngreso(Authentication authentication) {
        UsuarioSistema usuario = obtenerUsuario(authentication);
        usuario.setUltimoIngreso(LocalDateTime.now());
        usuario.setActualizadoEn(LocalDateTime.now());
        repository.save(usuario);
        return mapear(usuario);
    }

    @Transactional(readOnly = true)
    public SesionUsuarioDto obtenerSesion(Authentication authentication) {
        return mapear(obtenerUsuario(authentication));
    }

    private UsuarioSistema obtenerUsuario(Authentication authentication) {
        return repository.findByUsuarioIgnoreCase(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("El usuario autenticado no existe en el sistema"));
    }

    private SesionUsuarioDto mapear(UsuarioSistema usuario) {
        SesionUsuarioDto dto = new SesionUsuarioDto();
        dto.setUsuario(usuario.getUsuario());
        dto.setCorreo(usuario.getCorreo());
        dto.setNombreCompleto(usuario.getNombreCompleto());
        dto.setRol(usuario.getRolCodigo());
        dto.setRolNombre(nombreRol(usuario.getRolCodigo()));
        dto.setSedesAsignadas(Arrays.stream(usuario.getSedesAsignadas().split(","))
                .map(String::trim)
                .filter(sede -> !sede.isBlank())
                .toList());
        return dto;
    }

    private String nombreRol(String codigo) {
        return switch (codigo) {
            case "ADMINISTRADOR_SISTEMA" -> "Administrador del sistema";
            case "RESPONSABLE_EVALUACIONES" -> "Responsable de evaluaciones";
            case "PERSONAL_EVALUACIONES" -> "Personal de evaluaciones";
            case "DOCENTE" -> "Docente";
            case "VICERRECTOR" -> "Vicerrector";
            default -> codigo;
        };
    }
}
