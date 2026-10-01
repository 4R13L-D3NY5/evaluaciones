package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.auditoria.AuditoriaEstudianteGlobalDto;
import com.xpertiflow.evaluaciones.api.dto.auditoria.AuditoriaTomaGrupoReporteDto;
import com.xpertiflow.evaluaciones.application.AuditoriaTomaGruposService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@Slf4j
@RestController
@RequestMapping("/api/auditoria/toma-grupos")
@RequiredArgsConstructor
@Tag(name = "Auditoría Forense de Toma de Grupos", description = "Trazabilidad de inscripciones y confrontación de timestamps institucionales")
public class AuditoriaTomaGruposController {

    private final AuditoriaTomaGruposService auditoriaTomaGruposService;

    @GetMapping("/grupo")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DIRECTOR_CARRERA','VICERRECTOR')")
    @Operation(summary = "Auditoría forense de nómina por GroupId")
    public ResponseEntity<AuditoriaTomaGrupoReporteDto> obtenerPorGrupo(@RequestParam String groupId) {
        return ResponseEntity.ok(auditoriaTomaGruposService.obtenerAuditoriaPorGrupo(groupId));
    }

    @GetMapping("/rol/{rolExamenId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DIRECTOR_CARRERA','VICERRECTOR')")
    @Operation(summary = "Auditoría forense de nómina por RolExamenId")
    public ResponseEntity<AuditoriaTomaGrupoReporteDto> obtenerPorRol(@PathVariable String rolExamenId) {
        return ResponseEntity.ok(auditoriaTomaGruposService.obtenerAuditoriaPorRol(rolExamenId));
    }

    @GetMapping("/estudiante")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DIRECTOR_CARRERA','VICERRECTOR')")
    @Operation(summary = "Búsqueda forense global de todas las asignaturas de un estudiante")
    public ResponseEntity<AuditoriaEstudianteGlobalDto> buscarPorEstudiante(
            @RequestParam String studentCode,
            @RequestParam(required = false) String term) {
        return ResponseEntity.ok(auditoriaTomaGruposService.buscarPorEstudiante(studentCode, term));
    }

    @GetMapping("/exportar-excel")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','DIRECTOR_CARRERA','VICERRECTOR')")
    @Operation(summary = "Descargar acta forense oficial de trazabilidad en Excel")
    public ResponseEntity<byte[]> exportarExcel(@RequestParam String groupId) throws IOException {
        byte[] bytes = auditoriaTomaGruposService.exportarReporteExcel(groupId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"acta_forense_nomina_" + groupId + ".xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(bytes);
    }
}
