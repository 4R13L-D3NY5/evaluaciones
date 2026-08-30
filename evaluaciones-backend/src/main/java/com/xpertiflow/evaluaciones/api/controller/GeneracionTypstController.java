package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionTypstRequestDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionTypstResultadoDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionColaResponseDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.DocumentoExamenDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.ConfiguracionGeneracionResponseDto;
import com.xpertiflow.evaluaciones.application.generacion.GeneracionTypstService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/generacion-typst")
@RequiredArgsConstructor
@Tag(name = "Generación de exámenes", description = "Generación de exámenes y cuadernillos oficiales vía worker")
public class GeneracionTypstController {

    private final GeneracionTypstService generacionTypstService;

    @PostMapping
    @Operation(summary = "Solicitar generación de exámenes")
    public ResponseEntity<GeneracionTypstResultadoDto> solicitar(@Valid @RequestBody GeneracionTypstRequestDto request) {
        return ResponseEntity.ok(generacionTypstService.solicitarGeneracion(request));
    }

    @GetMapping("/cola")
    @Operation(summary = "Consultar tareas de generación en cola")
    public ResponseEntity<GeneracionColaResponseDto> consultarCola() {
        return ResponseEntity.ok(generacionTypstService.listarCola());
    }

    @GetMapping("/roles/{rolExamenId}/documento")
    @Operation(summary = "Obtener el PDF oficial de un examen ya generado")
    public ResponseEntity<DocumentoExamenDto> consultarDocumento(@PathVariable String rolExamenId) {
        return ResponseEntity.ok(generacionTypstService.consultarDocumentoExamen(rolExamenId));
    }

    @GetMapping("/roles/{rolExamenId}/configuracion")
    @Operation(summary = "Consultar variantes, patrones y asignaciones persistidas")
    public ResponseEntity<ConfiguracionGeneracionResponseDto> consultarConfiguracion(@PathVariable String rolExamenId) {
        return ResponseEntity.ok(generacionTypstService.consultarConfiguracion(rolExamenId));
    }

    @GetMapping("/{jobId}/resultado")
    @Operation(summary = "Consultar estado/resultado de una generación")
    public ResponseEntity<GeneracionTypstResultadoDto> consultar(@PathVariable String jobId) {
        GeneracionTypstResultadoDto estado = generacionTypstService.consultarEstado(jobId);
        if (estado == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(estado);
    }
}
