package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.backup.ConfiguracionRespaldosRequestDto;
import com.xpertiflow.evaluaciones.api.dto.backup.ConfiguracionRespaldosResponseDto;
import com.xpertiflow.evaluaciones.api.dto.backup.RespaldoResponseDto;
import com.xpertiflow.evaluaciones.api.dto.backup.RestaurarRespaldoRequestDto;
import com.xpertiflow.evaluaciones.application.RespaldosService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/backups")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMINISTRADOR_SISTEMA')")
public class RespaldosController {
    private final RespaldosService service;

    @GetMapping("/config")
    public ResponseEntity<ConfiguracionRespaldosResponseDto> config() { return ResponseEntity.ok(service.obtenerConfiguracion()); }

    @PutMapping("/config")
    public ResponseEntity<ConfiguracionRespaldosResponseDto> actualizar(@Valid @RequestBody ConfiguracionRespaldosRequestDto request, org.springframework.security.core.Authentication auth, HttpServletRequest http) {
        return ResponseEntity.ok(service.actualizarConfiguracion(request, auth.getName(), http.getRemoteAddr()));
    }

    @GetMapping
    public ResponseEntity<List<RespaldoResponseDto>> listar() { return ResponseEntity.ok(service.listar()); }

    @PostMapping
    public ResponseEntity<RespaldoResponseDto> generar(org.springframework.security.core.Authentication auth, HttpServletRequest http) { return ResponseEntity.accepted().body(service.generarAhora(auth.getName(), http.getRemoteAddr())); }

    @PostMapping("/{id}/copy-external")
    public ResponseEntity<RespaldoResponseDto> copiar(@PathVariable String id, org.springframework.security.core.Authentication auth, HttpServletRequest http) { return ResponseEntity.accepted().body(service.copiarExterno(id, auth.getName(), http.getRemoteAddr())); }

    @PostMapping("/{id}/verify")
    public ResponseEntity<RespaldoResponseDto> verificar(@PathVariable String id, org.springframework.security.core.Authentication auth, HttpServletRequest http) { return ResponseEntity.accepted().body(service.verificar(id, auth.getName(), http.getRemoteAddr())); }

    @DeleteMapping("/{id}/local")
    public ResponseEntity<RespaldoResponseDto> eliminar(@PathVariable String id, org.springframework.security.core.Authentication auth, HttpServletRequest http) { return ResponseEntity.accepted().body(service.eliminarLocal(id, auth.getName(), http.getRemoteAddr())); }

    @PostMapping("/{id}/restore")
    public ResponseEntity<RespaldoResponseDto> restaurar(@PathVariable String id, @Valid @RequestBody RestaurarRespaldoRequestDto request, org.springframework.security.core.Authentication auth, HttpServletRequest http) { return ResponseEntity.accepted().body(service.restaurar(id, request, auth.getName(), http.getRemoteAddr())); }
}
