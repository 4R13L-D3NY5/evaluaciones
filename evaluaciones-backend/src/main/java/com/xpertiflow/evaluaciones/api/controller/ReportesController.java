package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.reportes.ReporteCalidadResumenDto;
import com.xpertiflow.evaluaciones.api.dto.reportes.ReporteCoberturaBancosResumenDto;
import com.xpertiflow.evaluaciones.api.dto.reportes.ReporteConsolidadoOmrResumenDto;
import com.xpertiflow.evaluaciones.application.ReportesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DIRECTOR_CARRERA','VICERRECTOR','VERIFICADOR')")
public class ReportesController {

    private final ReportesService reportesService;

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
}
