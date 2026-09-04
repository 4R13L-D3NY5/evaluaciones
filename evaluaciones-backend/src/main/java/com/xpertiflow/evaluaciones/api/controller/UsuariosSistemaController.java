package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.auth.CredencialTemporalDto;
import com.xpertiflow.evaluaciones.api.dto.auth.AnalisisDocentesSeaResponseDto;
import com.xpertiflow.evaluaciones.api.dto.auth.ImportacionUsuariosResponseDto;
import com.xpertiflow.evaluaciones.api.dto.auth.RolSistemaResponseDto;
import com.xpertiflow.evaluaciones.api.dto.auth.SincronizacionDocentesSeaRequestDto;
import com.xpertiflow.evaluaciones.api.dto.auth.SincronizacionDocentesSeaResponseDto;
import com.xpertiflow.evaluaciones.api.dto.auth.UsuarioSistemaRequestDto;
import com.xpertiflow.evaluaciones.api.dto.auth.UsuarioSistemaResponseDto;
import com.xpertiflow.evaluaciones.application.UsuariosSistemaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES')")
public class UsuariosSistemaController {

    private final UsuariosSistemaService service;

    @GetMapping
    public ResponseEntity<List<UsuarioSistemaResponseDto>> listar(
            @RequestParam(defaultValue = "INSTITUCIONAL") String contexto,
            Authentication authentication) {
        if (!"EVALUACIONES".equalsIgnoreCase(contexto)
                && authentication.getAuthorities().stream()
                .noneMatch(authority -> authority.getAuthority().equals("ROLE_ADMINISTRADOR_SISTEMA"))) {
            throw new AccessDeniedException("Solo el administrador puede consultar usuarios institucionales");
        }
        return ResponseEntity.ok(service.listar(contexto));
    }

    @GetMapping("/roles")
    public ResponseEntity<List<RolSistemaResponseDto>> listarRoles() {
        return ResponseEntity.ok(service.listarRoles());
    }

    @GetMapping("/docentes-sea")
    public ResponseEntity<AnalisisDocentesSeaResponseDto> analizarDocentesSea(
            @RequestParam(defaultValue = "2-2026") String gestion) {
        return ResponseEntity.ok(service.analizarDocentesSea(gestion));
    }

    @PostMapping("/docentes-sea/sincronizar")
    public ResponseEntity<SincronizacionDocentesSeaResponseDto> sincronizarDocentesSea(
            @RequestParam(defaultValue = "2-2026") String gestion,
            @RequestBody(required = false) SincronizacionDocentesSeaRequestDto request,
            Authentication authentication) {
        return ResponseEntity.ok(service.sincronizarDocentesSea(
                gestion, request == null ? new SincronizacionDocentesSeaRequestDto() : request,
                authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<UsuarioSistemaResponseDto> crear(
            @Valid @RequestBody UsuarioSistemaRequestDto request,
            Authentication authentication) {
        return ResponseEntity.ok(service.crear(request, authentication.getName(), rol(authentication)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioSistemaResponseDto> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody UsuarioSistemaRequestDto request,
            Authentication authentication) {
        return ResponseEntity.ok(service.actualizar(id, request, authentication.getName(), rol(authentication)));
    }

    @PostMapping("/importar")
    public ResponseEntity<ImportacionUsuariosResponseDto> importar(
            @RequestPart("archivo") MultipartFile archivo,
            Authentication authentication) {
        return ResponseEntity.ok(service.importar(archivo, authentication.getName(), rol(authentication)));
    }

    @GetMapping("/plantilla")
    public ResponseEntity<ByteArrayResource> plantilla() {
        byte[] contenido = service.generarPlantilla();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename("plantilla_usuarios.xlsx").build().toString())
                .contentLength(contenido.length)
                .body(new ByteArrayResource(contenido));
    }

    @PostMapping("/{id}/restablecer-contrasena")
    public ResponseEntity<CredencialTemporalDto> restablecerContrasena(
            @PathVariable Long id,
            Authentication authentication) {
        return ResponseEntity.ok(service.restablecerContrasena(id, authentication.getName()));
    }

    private String rol(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replaceFirst("^ROLE_", ""))
                .findFirst().orElse("");
    }
}
