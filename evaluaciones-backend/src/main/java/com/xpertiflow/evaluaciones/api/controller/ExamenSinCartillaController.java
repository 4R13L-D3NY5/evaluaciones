package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.sincartilla.DocumentoSinCartillaResponseDto;
import com.xpertiflow.evaluaciones.api.dto.sincartilla.GuardarNotasDocenteRequestDto;
import com.xpertiflow.evaluaciones.api.dto.sincartilla.NotaDocenteResponseDto;
import com.xpertiflow.evaluaciones.application.ExamenSinCartillaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/examenes-sin-cartilla")
@RequiredArgsConstructor
public class ExamenSinCartillaController {

    private final ExamenSinCartillaService service;

    @GetMapping("/{rolExamenId}/documento")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','DOCENTE')")
    public ResponseEntity<DocumentoSinCartillaResponseDto> obtenerDocumento(@PathVariable String rolExamenId) {
        return ResponseEntity.ok(service.obtenerDocumento(rolExamenId));
    }

    @PostMapping("/{rolExamenId}/documento")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','DOCENTE')")
    public ResponseEntity<DocumentoSinCartillaResponseDto> cargarDocumento(
            @PathVariable String rolExamenId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "usuario", required = false) String usuario) {
        return ResponseEntity.ok(service.cargarDocumento(rolExamenId, file, usuario));
    }

    @GetMapping("/{rolExamenId}/documento/archivo")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','DOCENTE')")
    public ResponseEntity<Resource> descargarDocumento(@PathVariable String rolExamenId) {
        var documento = service.obtenerDocumentoEntidad(rolExamenId);
        ByteArrayResource resource = new ByteArrayResource(service.descargarDocumento(rolExamenId));
        MediaType mediaType = documento.getNombreArchivo().toLowerCase().endsWith(".docx")
                ? MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document")
                : MediaType.parseMediaType("application/msword");
        return ResponseEntity.ok().contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(documento.getNombreArchivo()).build().toString())
                .body(resource);
    }

    @GetMapping("/{rolExamenId}/notas")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','DOCENTE')")
    public ResponseEntity<List<NotaDocenteResponseDto>> listarNotas(@PathVariable String rolExamenId) {
        return ResponseEntity.ok(service.listarNotas(rolExamenId));
    }

    @PostMapping("/{rolExamenId}/notas")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','DOCENTE')")
    public ResponseEntity<List<NotaDocenteResponseDto>> guardarNotas(
            @PathVariable String rolExamenId,
            @Valid @RequestBody GuardarNotasDocenteRequestDto request) {
        return ResponseEntity.ok(service.guardarNotas(rolExamenId, request));
    }
}
