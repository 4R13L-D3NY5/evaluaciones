package com.xpertiflow.evaluaciones.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.xpertiflow.evaluaciones.api.dto.CalificacionOmrResponseDto;
import com.xpertiflow.evaluaciones.api.dto.AjustarCalificacionOmrRequestDto;
import com.xpertiflow.evaluaciones.api.dto.ConfiguracionOmrDto;
import com.xpertiflow.evaluaciones.application.OmrProcesamientoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/omr")
@RequiredArgsConstructor
@Tag(name = "Procesamiento OMR", description = "Lectura de códigos y respuestas de cartillas escaneadas")
public class OmrProcesamientoController {
    private final OmrProcesamientoService omrProcesamientoService;

    @PostMapping("/{rolExamenId}/procesar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES')")
    @Operation(summary = "Enviar un escaneo de cartillas al motor OMR")
    public ResponseEntity<JsonNode> procesar(@PathVariable String rolExamenId, @RequestParam("file") MultipartFile archivo) {
        return ResponseEntity.accepted().body(omrProcesamientoService.solicitar(rolExamenId, archivo));
    }

    @GetMapping("/jobs/{jobId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES')")
    @Operation(summary = "Consultar el resultado de lectura OMR")
    public ResponseEntity<JsonNode> consultar(@PathVariable String jobId) {
        return ResponseEntity.ok(omrProcesamientoService.consultar(jobId));
    }

    @GetMapping("/{rolExamenId}/calificaciones")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES')")
    @Operation(summary = "Listar calificaciones OMR persistidas de una evaluación")
    public ResponseEntity<List<CalificacionOmrResponseDto>> listarCalificaciones(@PathVariable String rolExamenId) {
        return ResponseEntity.ok(omrProcesamientoService.listarCalificaciones(rolExamenId));
    }

    @GetMapping("/configuracion")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES')")
    @Operation(summary = "Consultar parámetros de lectura OMR")
    public ResponseEntity<ConfiguracionOmrDto> obtenerConfiguracion() {
        return ResponseEntity.ok(omrProcesamientoService.obtenerConfiguracion());
    }

    @PutMapping("/configuracion")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Guardar parámetros de lectura OMR")
    public ResponseEntity<ConfiguracionOmrDto> guardarConfiguracion(
            @Valid @RequestBody ConfiguracionOmrDto request) {
        return ResponseEntity.ok(omrProcesamientoService.guardarConfiguracion(request));
    }

    @PutMapping("/{rolExamenId}/calificaciones/ajustar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES')")
    @Operation(summary = "Guardar una corrección manual de código y respuestas OMR")
    public ResponseEntity<CalificacionOmrResponseDto> ajustarCalificacion(
            @PathVariable String rolExamenId,
            @Valid @RequestBody AjustarCalificacionOmrRequestDto request) {
        return ResponseEntity.ok(omrProcesamientoService.ajustarCalificacion(rolExamenId, request));
    }
}
