package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.auth.SesionUsuarioDto;
import com.xpertiflow.evaluaciones.domain.entity.UsuarioSistema;
import com.xpertiflow.evaluaciones.domain.repository.UsuarioSistemaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AutenticacionService {

    private final UsuarioSistemaRepository repository;
    private final PasswordEncoder passwordEncoder;

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

    @Transactional
    public void cambiarContrasena(Authentication authentication, String contrasenaActual, String contrasenaNueva) {
        UsuarioSistema usuario = obtenerUsuario(authentication);
        verificarContrasenaActual(usuario, contrasenaActual);
        if (contrasenaNueva == null || contrasenaNueva.length() < 8) {
            throw new IllegalArgumentException("La nueva contraseña debe tener al menos 8 caracteres");
        }
        if (passwordEncoder.matches(contrasenaNueva, usuario.getContrasenaHash())) {
            throw new IllegalArgumentException("La nueva contraseña debe ser diferente a la actual");
        }
        usuario.setContrasenaHash(passwordEncoder.encode(contrasenaNueva));
        usuario.setDebeCambiarContrasena(false);
        usuario.setActualizadoEn(LocalDateTime.now());
        repository.save(usuario);
    }

    @Transactional(readOnly = true)
    public void verificarContrasenaActual(Authentication authentication, String contrasenaActual) {
        verificarContrasenaActual(obtenerUsuario(authentication), contrasenaActual);
    }

    private void verificarContrasenaActual(UsuarioSistema usuario, String contrasenaActual) {
        if (contrasenaActual == null || !passwordEncoder.matches(contrasenaActual, usuario.getContrasenaHash())) {
            throw new IllegalArgumentException("La contraseña actual no es correcta");
        }
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
        dto.setDebeCambiarContrasena(usuario.isDebeCambiarContrasena());
        Set<String> sedes = new LinkedHashSet<>(Arrays.stream(usuario.getSedesAsignadas().split(","))
                .map(String::trim)
                .filter(sede -> !sede.isBlank())
                .toList());
        usuario.getSedes().stream()
                .map(sede -> sede.getCodigo().trim())
                .filter(sede -> !sede.isBlank())
                .forEach(sedes::add);
        usuario.getAsignaciones().stream()
                .map(asignacion -> asignacion.getSedeCodigo().trim())
                .filter(sede -> !sede.isBlank())
                .forEach(sedes::add);
        dto.setSedesAsignadas(List.copyOf(sedes));

        Set<String> carreras = new LinkedHashSet<>(usuario.getCarreras().stream()
                .map(carrera -> carrera.getCodigo().trim())
                .filter(carrera -> !carrera.isBlank())
                .toList());
        usuario.getAsignaciones().stream()
                .map(asignacion -> asignacion.getCarreraCodigo().trim())
                .filter(carrera -> !carrera.isBlank())
                .forEach(carreras::add);
        dto.setCarrerasAsignadas(carreras.stream().sorted(Comparator.naturalOrder()).toList());
        return dto;
    }

    private String nombreRol(String codigo) {
        return switch (codigo) {
            case "ADMINISTRADOR_SISTEMA" -> "Administrador del sistema";
            case "RESPONSABLE_EVALUACIONES" -> "Responsable de evaluaciones";
            case "PERSONAL_EVALUACIONES" -> "Personal de evaluaciones";
            case "DOCENTE" -> "Docente";
            case "VICERRECTOR" -> "Vicerrector";
            case "DIRECTOR_CARRERA" -> "Director de carrera";
            case "VERIFICADOR" -> "Verificador de exámenes";
            default -> codigo;
        };
    }
}
