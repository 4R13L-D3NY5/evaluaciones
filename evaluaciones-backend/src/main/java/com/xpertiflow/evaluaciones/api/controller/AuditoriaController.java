package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.AuditoriaResumenDto;
import com.xpertiflow.evaluaciones.application.AuditoriaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auditoria")
@RequiredArgsConstructor
@Tag(name = "Auditoría", description = "Endpoints para la bitácora institucional y trazabilidad integral")
public class AuditoriaController {

    private final AuditoriaService auditoriaService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA')")
    @Operation(summary = "Obtener bitácora global consolidada y KPIs de auditoría")
    public ResponseEntity<AuditoriaResumenDto> obtenerAuditoria(
            @RequestParam(required = false) String modulo,
            @RequestParam(required = false) String nivel,
            @RequestParam(required = false) String busqueda,
            @RequestParam(defaultValue = "300") int limite) {
        return ResponseEntity.ok(auditoriaService.obtenerAuditoriaGlobal(modulo, nivel, busqueda, limite));
    }
}
