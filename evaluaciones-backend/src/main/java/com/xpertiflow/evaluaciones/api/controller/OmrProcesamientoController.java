package com.xpertiflow.evaluaciones.api.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.xpertiflow.evaluaciones.application.OmrProcesamientoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/omr")
@RequiredArgsConstructor
@Tag(name = "Procesamiento OMR", description = "Lectura de códigos y respuestas de cartillas escaneadas")
public class OmrProcesamientoController {
    private final OmrProcesamientoService omrProcesamientoService;

    @PostMapping("/{rolExamenId}/procesar")
    @Operation(summary = "Enviar un escaneo de cartillas al motor OMR")
    public ResponseEntity<JsonNode> procesar(@PathVariable String rolExamenId, @RequestParam("file") MultipartFile archivo) {
        return ResponseEntity.accepted().body(omrProcesamientoService.solicitar(rolExamenId, archivo));
    }

    @GetMapping("/jobs/{jobId}")
    @Operation(summary = "Consultar el resultado de lectura OMR")
    public ResponseEntity<JsonNode> consultar(@PathVariable String jobId) {
        return ResponseEntity.ok(omrProcesamientoService.consultar(jobId));
    }
}
