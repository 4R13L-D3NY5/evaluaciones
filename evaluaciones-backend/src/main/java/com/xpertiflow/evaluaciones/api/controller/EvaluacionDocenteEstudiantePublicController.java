package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.evaluaciondocente.*;
import com.xpertiflow.evaluaciones.application.evaluaciondocente.EvaluacionDocenteEstudianteService;
import com.xpertiflow.evaluaciones.domain.entity.EvaluacionEstudianteRegistro;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/evaluacion-docente-estudiante")
@RequiredArgsConstructor
@Tag(name = "Evaluación Docente por Estudiantes", description = "Endpoints públicos para acceso y aplicación de evaluaciones docentes por estudiantes sin credenciales de login")
public class EvaluacionDocenteEstudiantePublicController {

    private final EvaluacionDocenteEstudianteService estudianteService;

    @GetMapping("/materias")
    @Operation(summary = "Consultar materias y avance de evaluación por código de estudiante")
    public ResponseEntity<EstudianteAvanceEvaluacionDto> consultarMaterias(
            @RequestParam String codigoEstudiante,
            @RequestParam(required = false) String gestion) {
        return ResponseEntity.ok(estudianteService.consultarMateriasPorCodigoEstudiante(codigoEstudiante, gestion));
    }

    @GetMapping("/instrumento-vigente")
    @Operation(summary = "Obtener el instrumento vigente oficial para la evaluación estudiantil")
    public ResponseEntity<EvaluacionInstrumentoDto> obtenerInstrumentoVigente() {
        return ResponseEntity.ok(estudianteService.obtenerInstrumentoEstudianteVigente());
    }

    @PostMapping("/evaluar")
    @Operation(summary = "Registrar la evaluación de un docente realizada por el estudiante en una materia")
    public ResponseEntity<Map<String, Object>> registrarEvaluacion(
            @Valid @RequestBody EvaluacionEstudianteAplicarRequestDto request,
            HttpServletRequest servletRequest) {
        String ipOrigen = resolverIp(servletRequest);
        EvaluacionEstudianteRegistro guardado = estudianteService.registrarEvaluacion(request, ipOrigen);
        return ResponseEntity.ok(Map.of(
                "exito", true,
                "registroId", guardado.getId(),
                "mensaje", "Evaluación registrada correctamente",
                "puntajeTotal", guardado.getPuntajeTotal(),
                "porcentaje", guardado.getPorcentaje()
        ));
    }

    private String resolverIp(HttpServletRequest request) {
        if (request == null) return "DESCONOCIDA";
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip;
    }
}
