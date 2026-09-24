package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.consulta.ConsultaEstudianteEvaluacionDto;
import com.xpertiflow.evaluaciones.api.dto.consulta.ConsultaGrupoNotasResponseDto;
import com.xpertiflow.evaluaciones.application.ConsultaEstudianteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "Consulta Estudiantes e Integración", description = "Endpoints de consulta para el Portal del Estudiante y sincronización de notas con SEA / SISA")
public class ConsultaEstudianteController {

    private final ConsultaEstudianteService service;

    @Value("${evaluaciones.integracion.api-key:sea-dev-secret-api-key-2026}")
    private String configuredApiKey;

    // =========================================================================
    // 1. ENDPOINTS PARA PORTAL DEL ESTUDIANTE (Consulta por Matrícula)
    // =========================================================================

    @GetMapping("/api/consulta-estudiante/{matricula}")
    @Operation(summary = "Consultar el historial de evaluaciones de un estudiante por su matrícula")
    public ResponseEntity<List<ConsultaEstudianteEvaluacionDto>> consultarEvaluacionesEstudiante(
            @PathVariable @Parameter(description = "Matrícula o código oficial del estudiante") String matricula,
            @RequestParam(required = false) @Parameter(description = "Filtro opcional por tipo de parcial (ej: 1er Parcial, 2do Parcial, Final)") String tipoParcial) {

        return ResponseEntity.ok(service.consultarEvaluacionesPorMatricula(matricula, tipoParcial));
    }

    @GetMapping("/api/consulta-estudiante/{matricula}/evaluacion/{rolExamenId}")
    @Operation(summary = "Consultar el detalle de una evaluación y retroalimentación de respuestas de un estudiante")
    public ResponseEntity<ConsultaEstudianteEvaluacionDto> consultarDetalleEvaluacionEstudiante(
            @PathVariable @Parameter(description = "Matrícula o código oficial del estudiante") String matricula,
            @PathVariable @Parameter(description = "Identificador único de la evaluación (rolExamenId)") String rolExamenId) {

        return ResponseEntity.ok(service.consultarDetalleEvaluacionEstudiante(matricula, rolExamenId));
    }

    // =========================================================================
    // 2. ENDPOINTS DE INTEGRACIÓN INSTITUCIONAL (Sincronización SEA / SISA)
    // =========================================================================

    @GetMapping("/api/integracion/grupos/{seaGroupId}/notas")
    @Operation(summary = "Obtener las calificaciones consolidadas de un grupo por seaGroupId para volcar a actas de SISA/SEA")
    public ResponseEntity<?> consultarNotasGrupo(
            @PathVariable @Parameter(description = "Identificador del grupo en el SEA") String seaGroupId,
            @RequestParam(required = false) @Parameter(description = "Tipo de parcial opcional") String tipoParcial,
            @RequestHeader(value = "X-Api-Key", required = false) String apiKey,
            @RequestParam(value = "apiKey", required = false) String apiKeyParam,
            Authentication authentication) {

        String key = (apiKey != null && !apiKey.isBlank()) ? apiKey : apiKeyParam;
        if (!validarAccesoIntegracion(key, authentication)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("error", "Acceso denegado: Se requiere una API Key válida (cabecera X-Api-Key o parámetro ?apiKey=) o sesión autorizada."));
        }

        return ResponseEntity.ok(service.consultarNotasGrupo(seaGroupId, tipoParcial));
    }

    @GetMapping("/api/integracion/roles/{rolExamenId}/notas")
    @Operation(summary = "Obtener las calificaciones consolidadas de un examen específico por su rolExamenId")
    public ResponseEntity<?> consultarNotasPorRol(
            @PathVariable @Parameter(description = "Identificador del rol de examen") String rolExamenId,
            @RequestHeader(value = "X-Api-Key", required = false) String apiKey,
            @RequestParam(value = "apiKey", required = false) String apiKeyParam,
            Authentication authentication) {

        String key = (apiKey != null && !apiKey.isBlank()) ? apiKey : apiKeyParam;
        if (!validarAccesoIntegracion(key, authentication)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("error", "Acceso denegado: Se requiere una API Key válida (cabecera X-Api-Key o parámetro ?apiKey=) o sesión autorizada."));
        }

        return ResponseEntity.ok(service.consultarNotasPorRol(rolExamenId));
    }

    @GetMapping("/api/integracion/estudiantes/{matricula}/notas")
    @Operation(summary = "Consulta directa de notas por estudiante para servicios de fondo del SEA")
    public ResponseEntity<?> consultarNotasEstudianteIntegracion(
            @PathVariable @Parameter(description = "Matrícula o código oficial del estudiante") String matricula,
            @RequestParam(required = false) String tipoParcial,
            @RequestHeader(value = "X-Api-Key", required = false) String apiKey,
            @RequestParam(value = "apiKey", required = false) String apiKeyParam,
            Authentication authentication) {

        String key = (apiKey != null && !apiKey.isBlank()) ? apiKey : apiKeyParam;
        if (!validarAccesoIntegracion(key, authentication)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("error", "Acceso denegado: Se requiere una API Key válida (cabecera X-Api-Key o parámetro ?apiKey=) o sesión autorizada."));
        }

        return ResponseEntity.ok(service.consultarEvaluacionesPorMatricula(matricula, tipoParcial));
    }

    // =========================================================================
    // Métodos auxiliares de seguridad
    // =========================================================================

    private boolean validarAccesoIntegracion(String apiKey, Authentication authentication) {
        // 1. Validar por X-Api-Key
        if (apiKey != null && !apiKey.isBlank() && configuredApiKey != null && configuredApiKey.equals(apiKey.trim())) {
            return true;
        }

        // 2. O validar por sesión activa de Administrador / Responsable
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getAuthorities().stream().anyMatch(a ->
                    "ROLE_ADMINISTRADOR_SISTEMA".equals(a.getAuthority()) ||
                    "ROLE_RESPONSABLE_EVALUACIONES".equals(a.getAuthority()));
        }

        return false;
    }
}
