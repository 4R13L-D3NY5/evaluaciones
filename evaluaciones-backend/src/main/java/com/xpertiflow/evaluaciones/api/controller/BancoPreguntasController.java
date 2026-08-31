package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.banco.BancoPreguntasResponseDto;
import com.xpertiflow.evaluaciones.api.dto.banco.CargaBancoResponseDto;
import com.xpertiflow.evaluaciones.application.banco.BancoPreguntasService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/bancos-preguntas")
@RequiredArgsConstructor
@Tag(name = "Banco de Preguntas", description = "Carga y validación de bancos de preguntas Excel")
public class BancoPreguntasController {

    private final BancoPreguntasService bancoPreguntasService;

    @GetMapping("/{rolExamenId}")
    @Operation(summary = "Obtener el banco de preguntas cargado para un rol de examen")
    public ResponseEntity<BancoPreguntasResponseDto> obtenerPorRol(@PathVariable String rolExamenId) {
        return ResponseEntity.ok(bancoPreguntasService.obtenerPorRolExamenId(rolExamenId));
    }

    @PostMapping("/{rolExamenId}/upload")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','DOCENTE')")
    @Operation(summary = "Cargar y validar banco de preguntas Excel por rol de examen")
    public ResponseEntity<CargaBancoResponseDto> uploadPorRol(
            @PathVariable String rolExamenId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "docenteAprobador", required = false) String docenteAprobador) {
        return ResponseEntity.ok(bancoPreguntasService.cargarDesdeExcel(rolExamenId, file, docenteAprobador));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','DOCENTE')")
    @Operation(summary = "Cargar y validar banco de preguntas Excel por materia/grupo/parcial")
    public ResponseEntity<CargaBancoResponseDto> uploadPorParametros(
            @RequestParam("file") MultipartFile file,
            @RequestParam("materiaCodigo") String materiaCodigo,
            @RequestParam("grupo") String grupo,
            @RequestParam("tipoParcial") String tipoParcial,
            @RequestParam(value = "docenteAprobador", required = false) String docenteAprobador) {
        return ResponseEntity.ok(bancoPreguntasService.cargarDesdeExcelPorParametros(
                materiaCodigo, grupo, tipoParcial, file, docenteAprobador));
    }

    @DeleteMapping("/{rolExamenId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES')")
    @Operation(summary = "Eliminar el banco de preguntas cargado para un rol")
    public ResponseEntity<Void> eliminarPorRol(
            @PathVariable String rolExamenId,
            @RequestParam("confirmacion") String confirmacion,
            @RequestParam(value = "usuario", required = false) String usuario) {
        bancoPreguntasService.eliminarPorRolExamenId(rolExamenId, confirmacion, usuario);
        return ResponseEntity.noContent().build();
    }
}
