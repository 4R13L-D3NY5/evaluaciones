package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.virtual.*;
import com.xpertiflow.evaluaciones.application.ExamenVirtualService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/examenes-virtuales")
public class ExamenVirtualController {
    private final ExamenVirtualService service;

    @PostMapping("/salas")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DOCENTE')")
    public ResponseEntity<SalaVirtualCreadaDto> crearSala(@Valid @RequestBody SalaVirtualRequestDto request, Authentication auth) {
        return ResponseEntity.ok(service.crearSala(request, auth == null ? "Sistema" : auth.getName()));
    }

    @PostMapping("/salas/{salaId}/token-grupo")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DOCENTE')")
    public ResponseEntity<TokenGrupoResponseDto> emitirTokenGrupo(@PathVariable String salaId, Authentication auth) {
        return ResponseEntity.ok(service.emitirTokenGrupo(salaId, auth == null ? "Sistema" : auth.getName()));
    }

    @PostMapping("/salas/{salaId}/abrir")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DOCENTE')")
    public ResponseEntity<SalaVirtualResponseDto> abrir(@PathVariable String salaId, Authentication auth) {
        return ResponseEntity.ok(service.abrirSala(salaId, auth.getName()));
    }

    @PostMapping("/salas/{salaId}/iniciar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DOCENTE')")
    public ResponseEntity<SalaVirtualResponseDto> iniciar(@PathVariable String salaId, Authentication auth) {
        return ResponseEntity.ok(service.iniciarSala(salaId, auth.getName()));
    }

    @PostMapping("/salas/{salaId}/cerrar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DOCENTE')")
    public ResponseEntity<SalaVirtualResponseDto> cerrar(@PathVariable String salaId, Authentication auth) {
        return ResponseEntity.ok(service.cerrarSala(salaId, auth.getName()));
    }

    @PostMapping("/salas/{salaId}/restablecer")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DOCENTE')")
    public ResponseEntity<SalaVirtualResponseDto> restablecer(
            @PathVariable String salaId,
            @Valid @RequestBody RestablecerSalaVirtualRequestDto request,
            Authentication auth) {
        return ResponseEntity.ok(service.restablecerSala(salaId, auth.getName(), request.getMotivo()));
    }

    @GetMapping("/salas/{salaId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DOCENTE')")
    public ResponseEntity<SalaVirtualResponseDto> consultar(@PathVariable String salaId) {
        return ResponseEntity.ok(service.consultarSala(salaId));
    }

    @GetMapping("/roles/{rolExamenId}/sala")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DOCENTE')")
    public ResponseEntity<SalaVirtualResponseDto> consultarUltimaSala(@PathVariable String rolExamenId) {
        Optional<SalaVirtualResponseDto> sala = service.consultarUltimaSalaPorRol(rolExamenId);
        return sala.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/salas/{salaId}/estudiantes/{codigoEstudiante}/advertir")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DOCENTE')")
    public ResponseEntity<SalaVirtualResponseDto> advertir(
            @PathVariable String salaId,
            @PathVariable String codigoEstudiante,
            @RequestBody(required = false) AccionDocenteEstudianteRequestDto request,
            Authentication auth) {
        String mensaje = request != null ? request.getMensaje() : null;
        service.advertirEstudiante(salaId, codigoEstudiante, auth == null ? "Docente" : auth.getName(), mensaje);
        return ResponseEntity.ok(service.consultarSala(salaId));
    }

    @PostMapping("/salas/{salaId}/estudiantes/{codigoEstudiante}/anular")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DOCENTE')")
    public ResponseEntity<SalaVirtualResponseDto> anular(
            @PathVariable String salaId,
            @PathVariable String codigoEstudiante,
            @RequestBody(required = false) AccionDocenteEstudianteRequestDto request,
            Authentication auth) {
        String motivo = request != null ? request.getMotivo() : null;
        service.anularEstudiante(salaId, codigoEstudiante, auth == null ? "Docente" : auth.getName(), motivo);
        return ResponseEntity.ok(service.consultarSala(salaId));
    }

    @PostMapping("/salas/{salaId}/estudiantes/{codigoEstudiante}/restaurar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DOCENTE')")
    public ResponseEntity<SalaVirtualResponseDto> restaurar(
            @PathVariable String salaId,
            @PathVariable String codigoEstudiante,
            Authentication auth) {
        service.restaurarEstudiante(salaId, codigoEstudiante, auth == null ? "Docente" : auth.getName());
        return ResponseEntity.ok(service.consultarSala(salaId));
    }

    @GetMapping("/roles/{rolExamenId}/resultados")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DOCENTE','VICERRECTOR')")
    public ResponseEntity<List<ResultadoVirtualDto>> resultados(@PathVariable String rolExamenId) {
        return ResponseEntity.ok(service.consultarResultados(rolExamenId));
    }
}
