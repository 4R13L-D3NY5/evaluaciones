package com.xpertiflow.evaluaciones.infrastructure.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.domain.repository.UsuarioSistemaRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class CambioContrasenaInterceptor implements HandlerInterceptor {

    private final UsuarioSistemaRepository usuarioRepository;
    private final ObjectMapper objectMapper;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        if (!path.startsWith("/api/")
                || path.startsWith("/api/auth/")
                || path.startsWith("/api/acceso-virtual/")
                || path.startsWith("/api/examen-virtual/")) {
            return true;
        }

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return true;
        }

        boolean debeCambiar = usuarioRepository.findByUsuarioIgnoreCase(authentication.getName())
                .map(usuario -> usuario.isDebeCambiarContrasena())
                .orElse(false);
        if (!debeCambiar) return true;

        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(Map.of(
                "error", "PASSWORD_CHANGE_REQUIRED",
                "message", "Debes cambiar tu contraseña antes de utilizar el sistema"
        )));
        return false;
    }
}
