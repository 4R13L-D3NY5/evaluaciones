package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.AuditoriaResponseDto;
import com.xpertiflow.evaluaciones.api.dto.RolExamenRequestDto;
import com.xpertiflow.evaluaciones.api.dto.RolExamenResponseDto;
import com.xpertiflow.evaluaciones.api.dto.RestablecerRolRequestDto;
import com.xpertiflow.evaluaciones.api.dto.TransicionEstadoRequestDto;
import com.xpertiflow.evaluaciones.application.RolExamenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles-examen")
@RequiredArgsConstructor
@Tag(name = "Roles de Examen", description = "Gestión del cronograma de evaluaciones")
public class RolExamenController {

    private final RolExamenService rolExamenService;

    @GetMapping
    @Operation(summary = "Listar roles de examen, opcionalmente filtrados por sede y/o carrera")
    public ResponseEntity<List<RolExamenResponseDto>> listar(
            @RequestParam(required = false) String sedeCodigo,
            @RequestParam(required = false) String carreraCodigo) {
        return ResponseEntity.ok(rolExamenService.listarFiltrado(sedeCodigo, carreraCodigo));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un rol de examen por ID")
    public ResponseEntity<RolExamenResponseDto> obtener(@PathVariable String id) {
        return ResponseEntity.ok(rolExamenService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Crear un nuevo rol de examen")
    public ResponseEntity<RolExamenResponseDto> crear(@Valid @RequestBody RolExamenRequestDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rolExamenService.crear(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Actualizar un rol de examen programado o validado")
    public ResponseEntity<RolExamenResponseDto> actualizar(
            @PathVariable String id,
            @Valid @RequestBody RolExamenRequestDto dto) {
        return ResponseEntity.ok(rolExamenService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Eliminar un rol de examen programado o validado")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        rolExamenService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/transicion")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES')")
    @Operation(summary = "Transicionar el estado de un rol de examen")
    public ResponseEntity<RolExamenResponseDto> transicionarEstado(
            @PathVariable String id,
            @Valid @RequestBody TransicionEstadoRequestDto dto) {
        return ResponseEntity.ok(rolExamenService.transicionarEstado(id, dto));
    }

    @PostMapping("/{id}/restablecer")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Restablecer un rol posterior a VALIDADO a VALIDADO")
    public ResponseEntity<RolExamenResponseDto> restablecerAValidado(
            @PathVariable String id,
            @Valid @RequestBody RestablecerRolRequestDto dto) {
        return ResponseEntity.ok(rolExamenService.restablecerAValidado(id, dto));
    }

    @GetMapping("/{id}/auditoria")
    @Operation(summary = "Listar auditoría de un rol de examen")
    public ResponseEntity<List<AuditoriaResponseDto>> auditoria(@PathVariable String id) {
        return ResponseEntity.ok(rolExamenService.listarAuditoria(id));
    }
}
