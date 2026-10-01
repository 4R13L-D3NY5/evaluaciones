package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.sincronizacion.GrupoSincronizacionResumenDto;
import com.xpertiflow.evaluaciones.api.dto.sincronizacion.SincronizacionMasivaReporteDto;
import com.xpertiflow.evaluaciones.api.dto.sincronizacion.SincronizacionMasivaRequestDto;
import com.xpertiflow.evaluaciones.application.SincronizacionNotasSeaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping("/api/integracion/sincronizacion-sea")
@Tag(name = "Sincronización Masiva SEA", description = "Endpoints para la consulta y sincronización masiva de calificaciones con el Gateway SEA")
public class SincronizacionMasivaSeaController {

    private final SincronizacionNotasSeaService sincronizacionService;

    @GetMapping("/grupos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA', 'RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Consultar grupos para sincronización al SEA por sede, carrera, tipo de clase y examen")
    public ResponseEntity<List<GrupoSincronizacionResumenDto>> obtenerGruposParaSincronizacion(
            @RequestParam @Parameter(description = "Código de la sede") String sedeCodigo,
            @RequestParam @Parameter(description = "Código de la carrera") String carreraCodigo,
            @RequestParam(required = false, defaultValue = "TEORICO") @Parameter(description = "Tipo de clase: TEORICO, PRACTICO o TODOS") String tipoClase,
            @RequestParam(required = false, defaultValue = "PRIMER_PARCIAL") @Parameter(description = "Tipo de examen: PRIMER_PARCIAL, SEGUNDO_PARCIAL, FINAL, SEGUNDA_INSTANCIA o TODOS") String tipoParcial,
            @RequestParam(required = false, defaultValue = "TODOS") @Parameter(description = "Estado de sincronización: TODOS, PENDIENTE, SINCRONIZADO o NO_CALIFICADO") String estadoSincronizacion,
            Authentication authentication) {

        return ResponseEntity.ok(sincronizacionService.obtenerGruposParaSincronizacion(
                sedeCodigo, carreraCodigo, tipoClase, tipoParcial, estadoSincronizacion, authentication));
    }

    @PostMapping("/masiva")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA', 'RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Sincronizar masivamente un lote de grupos al Gateway SEA")
    public ResponseEntity<SincronizacionMasivaReporteDto> sincronizarMasivo(
            @Valid @RequestBody SincronizacionMasivaRequestDto request,
            Authentication authentication,
            jakarta.servlet.http.HttpServletRequest httpRequest) {

        String ipOrigen = httpRequest != null ? httpRequest.getRemoteAddr() : "127.0.0.1";
        return ResponseEntity.ok(sincronizacionService.sincronizarNotasMasivo(request, authentication, ipOrigen));
    }
}
