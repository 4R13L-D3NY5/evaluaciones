package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.config.AppProperties;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@RestController
@RequestMapping("/api/archivos")
@RequiredArgsConstructor
@Tag(name = "Archivos", description = "Descarga de archivos generados (PDFs, fuentes Typst, etc.)")
public class ArchivoController {

    private final AppProperties appProperties;

    @GetMapping
    @Operation(summary = "Descargar un archivo generado por el sistema")
    public ResponseEntity<Resource> descargar(@RequestParam String path) throws IOException {
        String basePath = appProperties.getStorage().getBasePath();
        File baseDir = new File(basePath).getCanonicalFile();

        // Normalizar separadores Windows/Unix para validación y resolución
        String normalized = path.replace("\\", "/");
        Path requestedPath = Paths.get(normalized).toAbsolutePath().normalize();
        File requestedFile = requestedPath.toFile().getCanonicalFile();

        // Seguridad: evitar path traversal
        if (!requestedFile.getPath().startsWith(baseDir.getPath())) {
            log.warn("Intento de acceso fuera del storage base: {}", path);
            return ResponseEntity.badRequest().build();
        }

        if (!requestedFile.exists() || !requestedFile.isFile()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(requestedFile);
        String contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
        if (requestedFile.getName().toLowerCase().endsWith(".pdf")) {
            contentType = MediaType.APPLICATION_PDF_VALUE;
        } else if (requestedFile.getName().toLowerCase().endsWith(".typ")) {
            contentType = "text/plain; charset=utf-8";
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + requestedFile.getName() + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }
}
