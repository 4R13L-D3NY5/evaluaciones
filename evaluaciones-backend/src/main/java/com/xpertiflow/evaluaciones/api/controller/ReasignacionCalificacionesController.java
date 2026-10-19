package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.sincronizacion.*;
import com.xpertiflow.evaluaciones.application.ReasignacionCalificacionesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/integracion/sincronizacion-sea/discrepancias")
@Tag(name = "Discrepancias y Reasignación SEA", description = "Endpoints para identificar y corregir estudiantes que rindieron exámenes en grupos distintos a su nómina oficial en SEA")
public class ReasignacionCalificacionesController {

    private final ReasignacionCalificacionesService reasignacionService;

    @PostMapping("/detectar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA', 'RESPONSABLE_EVALUACIONES', 'DIRECTOR_CARRERA')")
    @Operation(summary = "Detectar discrepancias de grupo entre calificaciones registradas y nóminas oficiales en el Gateway SEA")
    public ResponseEntity<DiscrepanciaGrupoReporteDto> detectarDiscrepancias(
            @Valid @RequestBody DetectarDiscrepanciasRequestDto request,
            Authentication authentication) {

        return ResponseEntity.ok(reasignacionService.detectarDiscrepancias(request.getRolExamenIds(), authentication));
    }

    @GetMapping("/rol/{rolExamenId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA', 'RESPONSABLE_EVALUACIONES', 'DIRECTOR_CARRERA')")
    @Operation(summary = "Detectar discrepancias de grupo para un rol de examen específico frente a sus paralelos")
    public ResponseEntity<DiscrepanciaGrupoReporteDto> detectarDiscrepanciasIndividual(
            @PathVariable @Parameter(description = "Identificador del rol de examen") String rolExamenId,
            Authentication authentication) {

        return ResponseEntity.ok(reasignacionService.detectarDiscrepancias(List.of(rolExamenId), authentication));
    }

    @PostMapping("/trasladar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA', 'RESPONSABLE_EVALUACIONES', 'DIRECTOR_CARRERA')")
    @Operation(summary = "Trasladar calificaciones de estudiantes hacia el grupo correcto donde están inscritos en el Gateway SEA")
    public ResponseEntity<TrasladoCalificacionesResultadoDto> trasladarCalificaciones(
            @Valid @RequestBody TrasladoCalificacionesRequestDto request,
            Authentication authentication,
            HttpServletRequest httpRequest) {

        String ipOrigen = httpRequest != null ? httpRequest.getRemoteAddr() : "127.0.0.1";
        return ResponseEntity.ok(reasignacionService.trasladarCalificaciones(request, authentication, ipOrigen));
    }
}
