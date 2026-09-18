package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionTypstResultadoDto;
import com.xpertiflow.evaluaciones.api.dto.verificacion.ConfiguracionVerificacionDto;
import com.xpertiflow.evaluaciones.api.dto.verificacion.VerificacionDecisionRequestDto;
import com.xpertiflow.evaluaciones.api.dto.verificacion.VerificacionExamenDetalleDto;
import com.xpertiflow.evaluaciones.api.dto.verificacion.VerificacionExamenListaDto;
import com.xpertiflow.evaluaciones.application.VerificacionExamenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/verificacion-examenes")
@RequiredArgsConstructor
@PreAuthorize("hasRole('VERIFICADOR')")
public class VerificacionExamenController {

    private final VerificacionExamenService service;

    @GetMapping
    public ResponseEntity<List<VerificacionExamenListaDto>> listar(
            @RequestParam(defaultValue = "FECHA_EXAMEN_ASC") String orden,
            @RequestParam(required = false) String sedeCodigo,
            @RequestParam(required = false) String carreraCodigo,
            @RequestParam(required = false) String tipoParcial,
            @RequestParam(required = false) String modalidad,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) LocalDate fechaDesde,
            @RequestParam(required = false) LocalDate fechaHasta,
            Authentication authentication) {
        return ResponseEntity.ok(service.listar(orden, sedeCodigo, carreraCodigo, tipoParcial, modalidad,
                estado, fechaDesde, fechaHasta, authentication));
    }

    @GetMapping("/{rolExamenId}")
    public ResponseEntity<VerificacionExamenDetalleDto> obtener(
            @PathVariable String rolExamenId, Authentication authentication) {
        return ResponseEntity.ok(service.obtenerDetalle(rolExamenId, authentication));
    }

    @GetMapping("/{rolExamenId}/aprobado")
    public ResponseEntity<VerificacionExamenDetalleDto> obtenerAprobado(
            @PathVariable String rolExamenId, Authentication authentication) {
        return ResponseEntity.ok(service.obtenerDetalleAprobado(rolExamenId, authentication));
    }

    @PostMapping("/{rolExamenId}/previsualizacion")
    public ResponseEntity<GeneracionTypstResultadoDto> previsualizar(
            @PathVariable String rolExamenId, Authentication authentication) {
        return ResponseEntity.ok(service.solicitarPrevisualizacion(rolExamenId, authentication));
    }

    @PostMapping("/{rolExamenId}/decision")
    public ResponseEntity<VerificacionExamenDetalleDto> decidir(
            @PathVariable String rolExamenId,
            @Valid @RequestBody VerificacionDecisionRequestDto request,
            Authentication authentication) {
        return ResponseEntity.ok(service.decidir(rolExamenId, request, authentication));
    }
}
