package com.xpertiflow.evaluaciones.infrastructure.security;

import com.xpertiflow.evaluaciones.config.AppProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.nio.file.Files;
import java.nio.file.Path;

@Component
@RequiredArgsConstructor
public class MantenimientoInterceptor implements HandlerInterceptor {
    private final AppProperties appProperties;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        String path = request.getRequestURI();
        if (!path.startsWith("/api/") || path.startsWith("/api/backups") || path.equals("/api/auth/session") || path.equals("/api/auth/logout")) return true;
        Path marker = Path.of(appProperties.getStorage().getBasePath(), ".sea-maintenance");
        if (!Files.exists(marker)) return true;
        response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
        response.setContentType("application/json");
        response.getWriter().write("{\"message\":\"El sistema está temporalmente en mantenimiento por una restauración de respaldo.\"}");
        return false;
    }
}
