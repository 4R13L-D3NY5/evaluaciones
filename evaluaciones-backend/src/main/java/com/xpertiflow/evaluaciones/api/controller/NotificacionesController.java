package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.NotificacionItemDto;
import com.xpertiflow.evaluaciones.application.NotificacionesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
@Tag(name = "Notificaciones", description = "Resumen liviano de alertas operativas para el usuario autenticado")
public class NotificacionesController {

    private final NotificacionesService notificacionesService;

    @GetMapping("/resumen")
    @Operation(summary = "Obtener alertas y notificaciones activas para la campana de la barra superior")
    public ResponseEntity<List<NotificacionItemDto>> obtenerResumen(Authentication authentication) {
        return ResponseEntity.ok(notificacionesService.obtenerResumen(authentication));
    }
}
