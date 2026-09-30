package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.sincronizacion.SincronizacionNotasSeaReporteDto;
import com.xpertiflow.evaluaciones.application.SincronizacionNotasSeaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/integracion/roles/{rolExamenId}/sincronizar-sea")
@Tag(name = "Sincronización SEA", description = "Endpoints para la transmisión y sincronización de calificaciones teóricas al Gateway SEA")
public class SincronizacionSeaController {

    private final SincronizacionNotasSeaService sincronizacionService;

    @GetMapping("/previa")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA', 'RESPONSABLE_EVALUACIONES', 'PERSONAL_EVALUACIONES')")
    @Operation(summary = "Obtener vista previa de calificaciones sobre 100 puntos consolidadas antes de enviar al SEA")
    public ResponseEntity<SincronizacionNotasSeaReporteDto> obtenerVistaPrevia(
            @PathVariable @Parameter(description = "Identificador del rol de examen") String rolExamenId,
            Authentication authentication) {

        return ResponseEntity.ok(sincronizacionService.obtenerVistaPrevia(rolExamenId, authentication));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA', 'RESPONSABLE_EVALUACIONES', 'PERSONAL_EVALUACIONES')")
    @Operation(summary = "Transmitir y registrar las calificaciones teóricas de los estudiantes en la base de datos del SEA")
    public ResponseEntity<SincronizacionNotasSeaReporteDto> sincronizarNotasConSea(
            @PathVariable @Parameter(description = "Identificador del rol de examen") String rolExamenId,
            Authentication authentication) {

        return ResponseEntity.ok(sincronizacionService.sincronizarNotasConSea(rolExamenId, authentication));
    }
}
