package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.ConfiguracionEvaluacionesDto;
import com.xpertiflow.evaluaciones.application.ConfiguracionEvaluacionesService;
import com.xpertiflow.evaluaciones.application.ConfiguracionVerificacionService;
import com.xpertiflow.evaluaciones.api.dto.verificacion.ConfiguracionVerificacionDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import java.util.List;

@RestController
@RequestMapping("/api/configuracion-evaluaciones")
@RequiredArgsConstructor
@Tag(name = "Configuración de evaluaciones", description = "Parámetros globales usados por la operación de evaluaciones")
public class ConfiguracionEvaluacionesController {

    private final ConfiguracionEvaluacionesService service;
    private final ConfiguracionVerificacionService configuracionVerificacionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','DOCENTE')")
    @Operation(summary = "Consultar la configuración vigente de evaluaciones")
    public ResponseEntity<ConfiguracionEvaluacionesDto> obtener() {
        return ResponseEntity.ok(service.obtener());
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Guardar la configuración vigente de evaluaciones")
    public ResponseEntity<ConfiguracionEvaluacionesDto> guardar(
            @Valid @RequestBody ConfiguracionEvaluacionesDto request) {
        return ResponseEntity.ok(service.guardar(request));
    }

    @GetMapping("/verificacion")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Consultar reglas de verificación por sede y carrera")
    public ResponseEntity<List<ConfiguracionVerificacionDto>> listarVerificacion() {
        return ResponseEntity.ok(configuracionVerificacionService.listar());
    }

    @PutMapping("/verificacion")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Guardar una regla de verificación por sede o carrera")
    public ResponseEntity<List<ConfiguracionVerificacionDto>> guardarVerificacion(
            @Valid @RequestBody ConfiguracionVerificacionDto request,
            Authentication authentication) {
        return ResponseEntity.ok(configuracionVerificacionService.guardar(request, authentication.getName()));
    }
}
