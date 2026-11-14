package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.CrearSolicitudModificacionRequestDto;
import com.xpertiflow.evaluaciones.api.dto.ResolverSolicitudModificacionRequestDto;
import com.xpertiflow.evaluaciones.api.dto.SolicitudModificacionResponseDto;
import com.xpertiflow.evaluaciones.application.SolicitudModificacionRolService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes-modificacion-rol")
@RequiredArgsConstructor
@Tag(name = "Solicitudes Modificación Roles", description = "Gestión de solicitudes de reprogramación de exámenes")
public class SolicitudModificacionRolController {

    private final SolicitudModificacionRolService service;

    @PostMapping
    @PreAuthorize("hasAnyRole('DIRECTOR_CARRERA', 'ADMINISTRADOR_SISTEMA')")
    @Operation(summary = "Crear solicitud de modificación de examen (Director de Carrera)")
    public ResponseEntity<SolicitudModificacionResponseDto> crear(
            @Valid @RequestBody CrearSolicitudModificacionRequestDto dto,
            Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.crearSolicitud(dto, authentication));
    }

    @GetMapping("/pendientes")
    @PreAuthorize("hasAnyRole('VICERRECTOR', 'ADMINISTRADOR_SISTEMA', 'RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Listar solicitudes pendientes de vicerrectorado")
    public ResponseEntity<List<SolicitudModificacionResponseDto>> listarPendientes(Authentication authentication) {
        return ResponseEntity.ok(service.listarPendientesVicerrector(authentication));
    }

    @GetMapping("/historial")
    @PreAuthorize("hasAnyRole('VICERRECTOR', 'ADMINISTRADOR_SISTEMA', 'RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Listar solicitudes procesadas (historial de aprobadas y rechazadas)")
    public ResponseEntity<List<SolicitudModificacionResponseDto>> listarHistorial(Authentication authentication) {
        return ResponseEntity.ok(service.listarHistorialVicerrector(authentication));
    }

    @GetMapping("/mis-solicitudes")
    @PreAuthorize("hasAnyRole('DIRECTOR_CARRERA', 'ADMINISTRADOR_SISTEMA')")
    @Operation(summary = "Listar solicitudes emitidas por el usuario actual")
    public ResponseEntity<List<SolicitudModificacionResponseDto>> listarMisSolicitudes(Authentication authentication) {
        return ResponseEntity.ok(service.listarMisSolicitudes(authentication));
    }

    @GetMapping("/examen/{rolExamenId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Obtener solicitud activa por ID de rol de examen")
    public ResponseEntity<SolicitudModificacionResponseDto> obtenerActivaPorRol(
            @PathVariable String rolExamenId) {
        return service.obtenerSolicitudActivaPorRol(rolExamenId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PutMapping("/{id}/resolver")
    @PreAuthorize("hasAnyRole('VICERRECTOR', 'ADMINISTRADOR_SISTEMA', 'RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Aprobar o rechazar solicitud de modificación (Vicerrectorado)")
    public ResponseEntity<SolicitudModificacionResponseDto> resolver(
            @PathVariable String id,
            @Valid @RequestBody ResolverSolicitudModificacionRequestDto dto,
            Authentication authentication) {
        return ResponseEntity.ok(service.resolverSolicitud(id, dto, authentication));
    }
}
