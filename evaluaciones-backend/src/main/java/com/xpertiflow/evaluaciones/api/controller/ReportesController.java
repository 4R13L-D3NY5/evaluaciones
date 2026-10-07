package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionTypstResultadoDto;
import com.xpertiflow.evaluaciones.api.dto.reportes.ReporteCalidadResumenDto;
import com.xpertiflow.evaluaciones.api.dto.reportes.ReporteCoberturaBancosResumenDto;
import com.xpertiflow.evaluaciones.api.dto.reportes.ReporteConsolidadoOmrResumenDto;
import com.xpertiflow.evaluaciones.api.dto.verificacion.VerificacionHistorialDevolucionDto;
import com.xpertiflow.evaluaciones.application.ReportesService;
import com.xpertiflow.evaluaciones.application.VerificacionExamenService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DIRECTOR_CARRERA','VICERRECTOR','VERIFICADOR')")
public class ReportesController {

    private final ReportesService reportesService;
    private final VerificacionExamenService verificacionExamenService;

    @GetMapping("/calidad-verificacion")
    public ResponseEntity<ReporteCalidadResumenDto> obtenerReporteCalidad(
            @RequestParam(required = false) String sedeCodigo,
            @RequestParam(required = false) String carreraCodigo,
            @RequestParam(required = false) String tipoParcial,
            @RequestParam(required = false, defaultValue = "TODOS") String estadoCalidad,
            @RequestParam(required = false) String busqueda,
            Authentication authentication) {
        return ResponseEntity.ok(reportesService.obtenerReporteCalidad(
                sedeCodigo, carreraCodigo, tipoParcial, estadoCalidad, busqueda, authentication));
    }

    @GetMapping("/cobertura-bancos")
    public ResponseEntity<ReporteCoberturaBancosResumenDto> obtenerCoberturaBancos(
            @RequestParam(required = false) String sedeCodigo,
            @RequestParam(required = false) String carreraCodigo,
            @RequestParam(required = false) String tipoParcial,
            Authentication authentication) {
        return ResponseEntity.ok(reportesService.obtenerCoberturaBancos(
                sedeCodigo, carreraCodigo, tipoParcial, authentication));
    }

    @GetMapping("/consolidado-omr")
    public ResponseEntity<ReporteConsolidadoOmrResumenDto> obtenerConsolidadoOmr(
            @RequestParam(required = false) String sedeCodigo,
            @RequestParam(required = false) String carreraCodigo,
            @RequestParam(required = false) String tipoParcial,
            Authentication authentication) {
        return ResponseEntity.ok(reportesService.obtenerConsolidadoOmr(
            sedeCodigo, carreraCodigo, tipoParcial, authentication));
    }

    @PostMapping("/evaluaciones/{rolExamenId}/previsualizacion-typst")
    @PreAuthorize("hasRole('VERIFICADOR')")
    @Operation(summary = "Previsualizar examen generado por Typst (vista docente) estrictamente para rol verificador")
    public ResponseEntity<GeneracionTypstResultadoDto> solicitarPrevisualizacionTypstDocente(
            @PathVariable String rolExamenId, Authentication authentication) {
        return ResponseEntity.ok(verificacionExamenService.solicitarPrevisualizacionDocente(rolExamenId, authentication));
    }

    @GetMapping("/evaluaciones/{rolExamenId}/historial-devoluciones")
    @Operation(summary = "Obtener historial de devoluciones con reactivos completos para control de calidad")
    public ResponseEntity<List<VerificacionHistorialDevolucionDto>> obtenerHistorialDevoluciones(
            @PathVariable String rolExamenId, Authentication authentication) {
        return ResponseEntity.ok(verificacionExamenService.obtenerHistorialDevoluciones(rolExamenId, authentication));
    }
}
