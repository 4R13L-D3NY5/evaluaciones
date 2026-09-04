package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.ConfiguracionEvaluacionesDto;
import com.xpertiflow.evaluaciones.application.ConfiguracionEvaluacionesService;
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

@RestController
@RequestMapping("/api/configuracion-evaluaciones")
@RequiredArgsConstructor
@Tag(name = "Configuración de evaluaciones", description = "Parámetros globales usados por la operación de evaluaciones")
public class ConfiguracionEvaluacionesController {

    private final ConfiguracionEvaluacionesService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES')")
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
}
