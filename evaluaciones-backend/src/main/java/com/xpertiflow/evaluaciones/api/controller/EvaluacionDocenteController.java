package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.evaluaciondocente.*;
import com.xpertiflow.evaluaciones.application.evaluaciondocente.EvaluacionDocenteService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/api/evaluacion-docente")
@RequiredArgsConstructor
@Tag(name = "Evaluación Docente", description = "Instrumentos y aplicación de evaluaciones docentes por Directores de Carrera y Administradores")
public class EvaluacionDocenteController {

    private final EvaluacionDocenteService evaluacionDocenteService;

    @GetMapping("/instrumento-vigente")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','DIRECTOR_CARRERA','VICERRECTOR')")
    @Operation(summary = "Obtener el instrumento de evaluación docente que se encuentra actualmente en vigencia")
    public ResponseEntity<EvaluacionInstrumentoDto> obtenerInstrumentoVigente() {
        return ResponseEntity.ok(evaluacionDocenteService.obtenerInstrumentoVigente());
    }

    @GetMapping("/instrumentos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Listar todos los instrumentos registrados (Administración)")
    public ResponseEntity<List<EvaluacionInstrumentoDto>> listarInstrumentos() {
        return ResponseEntity.ok(evaluacionDocenteService.listarInstrumentos());
    }

    @GetMapping("/instrumentos/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Obtener detalle completo de un instrumento por su ID")
    public ResponseEntity<EvaluacionInstrumentoDto> obtenerInstrumentoPorId(@PathVariable String id) {
        return ResponseEntity.ok(evaluacionDocenteService.obtenerInstrumentoPorId(id));
    }

    @PostMapping("/instrumentos")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Crear o actualizar un instrumento de evaluación docente")
    public ResponseEntity<EvaluacionInstrumentoDto> guardarInstrumento(
            @Valid @RequestBody CrearOEditarInstrumentoRequestDto dto,
            Authentication authentication) {
        String usuario = authentication != null ? authentication.getName() : "ADMIN_EVALUACIONES";
        return ResponseEntity.ok(evaluacionDocenteService.crearOActualizarInstrumento(dto, usuario));
    }

    @PutMapping("/instrumentos/{id}/poner-en-vigencia")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Activar un instrumento y ponerlo en vigencia exclusiva")
    public ResponseEntity<EvaluacionInstrumentoDto> ponerEnVigencia(
            @PathVariable String id,
            Authentication authentication) {
        String usuario = authentication != null ? authentication.getName() : "ADMIN_EVALUACIONES";
        return ResponseEntity.ok(evaluacionDocenteService.ponerEnVigencia(id, usuario));
    }

    @GetMapping("/registros")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','DIRECTOR_CARRERA','VICERRECTOR')")
    @Operation(summary = "Listar evaluaciones docentes aplicadas por gestión, sede y carrera")
    public ResponseEntity<List<EvaluacionDocenteRegistroDto>> listarRegistros(
            @RequestParam String gestion,
            @RequestParam String sedeCodigo,
            @RequestParam(required = false) String carreraCodigo) {
        return ResponseEntity.ok(evaluacionDocenteService.listarRegistros(gestion, sedeCodigo, carreraCodigo));
    }

    @GetMapping("/registros/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','DIRECTOR_CARRERA','VICERRECTOR')")
    @Operation(summary = "Obtener el detalle y respuestas de una evaluación docente aplicada")
    public ResponseEntity<EvaluacionDocenteRegistroDto> obtenerRegistroPorId(@PathVariable String id) {
        return ResponseEntity.ok(evaluacionDocenteService.obtenerRegistroPorId(id));
    }

    @PostMapping("/aplicar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','DIRECTOR_CARRERA')")
    @Operation(summary = "Aplicar y guardar una evaluación docente")
    public ResponseEntity<EvaluacionDocenteRegistroDto> aplicarEvaluacion(
            @Valid @RequestBody EvaluacionDocenteAplicarRequestDto dto,
            Authentication authentication) {
        return ResponseEntity.ok(evaluacionDocenteService.aplicarEvaluacion(dto, authentication));
    }

    @DeleteMapping("/registros/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Restablecer evaluación docente (exclusivo Administrador) para permitir re-evaluación")
    public ResponseEntity<Void> restablecerEvaluacion(
            @PathVariable String id,
            Authentication authentication) {
        String usuario = authentication != null ? authentication.getName() : "ADMIN_EVALUACIONES";
        evaluacionDocenteService.restablecerEvaluacion(id, usuario);
        return ResponseEntity.noContent().build();
    }
}
