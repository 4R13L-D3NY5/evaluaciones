package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionTypstRequestDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionTypstResultadoDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionColaResponseDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.DocumentoExamenDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.ConfiguracionGeneracionResponseDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.PrevisualizacionTypstRequestDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionHistorialItemDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.RestaurarGeneracionResponseDto;
import com.xpertiflow.evaluaciones.application.generacion.GeneracionTypstService;
import com.xpertiflow.evaluaciones.infrastructure.security.ClientIpUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/generacion-typst")
@RequiredArgsConstructor
@Tag(name = "Generación de exámenes", description = "Generación de exámenes y cuadernillos oficiales vía worker")
public class GeneracionTypstController {

    private final GeneracionTypstService generacionTypstService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES') and @accesoAcademicoService.puedeAccederRol(#request.rolExamenId, authentication)")
    @Operation(summary = "Solicitar generación de exámenes")
    public ResponseEntity<GeneracionTypstResultadoDto> solicitar(@Valid @RequestBody GeneracionTypstRequestDto request,
                                                                  Authentication authentication) {
        return ResponseEntity.ok(generacionTypstService.solicitarGeneracion(request, authentication));
    }

    @PostMapping("/previsualizacion")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DOCENTE')")
    @Operation(summary = "Generar previsualización Typst sin persistir el banco")
    public ResponseEntity<GeneracionTypstResultadoDto> solicitarPrevisualizacion(
            @Valid @RequestBody PrevisualizacionTypstRequestDto request) {
        return ResponseEntity.ok(generacionTypstService.solicitarPrevisualizacion(request));
    }

    @GetMapping("/cola")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES')")
    @Operation(summary = "Consultar tareas de generación en cola")
    public ResponseEntity<GeneracionColaResponseDto> consultarCola() {
        return ResponseEntity.ok(generacionTypstService.listarCola());
    }

    @GetMapping("/roles/{rolExamenId}/documento")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DOCENTE')")
    @Operation(summary = "Obtener el PDF oficial de un examen ya generado")
    public ResponseEntity<DocumentoExamenDto> consultarDocumento(@PathVariable String rolExamenId) {
        return ResponseEntity.ok(generacionTypstService.consultarDocumentoExamen(rolExamenId));
    }

    @GetMapping("/roles/{rolExamenId}/configuracion")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DOCENTE')")
    @Operation(summary = "Consultar variantes, patrones y asignaciones persistidas")
    public ResponseEntity<ConfiguracionGeneracionResponseDto> consultarConfiguracion(@PathVariable String rolExamenId) {
        return ResponseEntity.ok(generacionTypstService.consultarConfiguracion(rolExamenId));
    }

    @GetMapping("/roles/{rolExamenId}/historial")
    @PreAuthorize("hasRole('ADMINISTRADOR_SISTEMA')")
    @Operation(summary = "Consultar historial de versiones generadas Typst de una evaluación")
    public ResponseEntity<List<GeneracionHistorialItemDto>> consultarHistorial(@PathVariable String rolExamenId) {
        return ResponseEntity.ok(generacionTypstService.listarHistorial(rolExamenId));
    }

    @PostMapping("/roles/{rolExamenId}/restaurar/{jobId}")
    @PreAuthorize("hasRole('ADMINISTRADOR_SISTEMA')")
    @Operation(summary = "Restaurar asignaciones de estudiantes a variantes de una versión previa generada")
    public ResponseEntity<RestaurarGeneracionResponseDto> restaurarGeneracion(
            @PathVariable String rolExamenId,
            @PathVariable String jobId,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        String ipOrigen = ClientIpUtil.obtenerIpCliente(httpRequest);
        return ResponseEntity.ok(generacionTypstService.restaurarGeneracion(rolExamenId, jobId, authentication, ipOrigen));
    }

    @GetMapping("/{jobId}/resultado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DOCENTE','VERIFICADOR')")
    @Operation(summary = "Consultar estado/resultado de una generación")
    public ResponseEntity<GeneracionTypstResultadoDto> consultar(@PathVariable String jobId) {
        GeneracionTypstResultadoDto estado = generacionTypstService.consultarEstado(jobId);
        if (estado == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(estado);
    }
}
