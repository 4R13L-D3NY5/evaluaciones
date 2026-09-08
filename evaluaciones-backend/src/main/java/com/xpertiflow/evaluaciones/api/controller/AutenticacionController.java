package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.auth.LoginRequestDto;
import com.xpertiflow.evaluaciones.api.dto.auth.CambiarContrasenaRequestDto;
import com.xpertiflow.evaluaciones.api.dto.auth.SesionUsuarioDto;
import com.xpertiflow.evaluaciones.application.AutenticacionService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AutenticacionController {

    private final AuthenticationManager authenticationManager;
    private final AutenticacionService service;
    private final SecurityContextRepository securityContextRepository;

    @PostMapping("/login")
    public ResponseEntity<SesionUsuarioDto> login(
            @Valid @RequestBody LoginRequestDto request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(request.getUsuario(), request.getContrasena()));
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, httpRequest, httpResponse);
            return ResponseEntity.ok(conEstadoSesion(service.registrarIngreso(authentication), httpRequest));
        } catch (BadCredentialsException exception) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @GetMapping("/session")
    public ResponseEntity<SesionUsuarioDto> session(Authentication authentication, HttpServletRequest request) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(conEstadoSesion(service.obtenerSesion(authentication), request));
    }

    @PostMapping("/renew")
    public ResponseEntity<SesionUsuarioDto> renovarSesion(
            Authentication authentication,
            HttpServletRequest request) {
        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        // Acceder a la sesión durante una petición autenticada renueva su
        // ventana de inactividad sin crear una sesión para usuarios anónimos.
        request.getSession(false);
        return ResponseEntity.ok(conEstadoSesion(service.obtenerSesion(authentication), request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/cambiar-contrasena")
    public ResponseEntity<SesionUsuarioDto> cambiarContrasena(
            @Valid @RequestBody CambiarContrasenaRequestDto request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        service.cambiarContrasena(authentication, request.getContrasenaActual(), request.getContrasenaNueva());
        return ResponseEntity.ok(conEstadoSesion(service.obtenerSesion(authentication), httpRequest));
    }

    private SesionUsuarioDto conEstadoSesion(SesionUsuarioDto sesion, HttpServletRequest request) {
        HttpSession httpSession = request.getSession(false);
        if (httpSession == null || httpSession.getMaxInactiveInterval() <= 0) {
            return sesion;
        }
        int duracionSegundos = httpSession.getMaxInactiveInterval();
        sesion.setSesionDuracionSegundos(duracionSegundos);
        sesion.setSesionExpiraEn(System.currentTimeMillis() + duracionSegundos * 1000L);
        return sesion;
    }
}
