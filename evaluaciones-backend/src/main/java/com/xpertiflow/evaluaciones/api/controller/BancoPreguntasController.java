package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.banco.BancoPreguntasResponseDto;
import com.xpertiflow.evaluaciones.api.dto.banco.CargaBancoResponseDto;
import com.xpertiflow.evaluaciones.application.AccesoAcademicoService;
import com.xpertiflow.evaluaciones.application.banco.BancoPreguntasService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/bancos-preguntas")
@RequiredArgsConstructor
@Tag(name = "Banco de Preguntas", description = "Carga y validación de bancos de preguntas Excel")
public class BancoPreguntasController {

    private final BancoPreguntasService bancoPreguntasService;
    private final AccesoAcademicoService accesoAcademicoService;

    @GetMapping("/{rolExamenId}")
    @PreAuthorize("@accesoAcademicoService.puedeAccederRol(#rolExamenId, authentication)")
    @Operation(summary = "Obtener el banco de preguntas cargado para un rol de examen")
    public ResponseEntity<BancoPreguntasResponseDto> obtenerPorRol(@PathVariable String rolExamenId) {
        return ResponseEntity.ok(bancoPreguntasService.obtenerPorRolExamenId(rolExamenId));
    }

    @PostMapping("/{rolExamenId}/upload")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','DOCENTE') and @accesoAcademicoService.puedeAccederRol(#rolExamenId, authentication)")
    @Operation(summary = "Cargar y validar banco de preguntas Excel por rol de examen")
    public ResponseEntity<CargaBancoResponseDto> uploadPorRol(
            @PathVariable String rolExamenId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "docenteAprobador", required = false) String docenteAprobador,
            Authentication authentication) {
        return ResponseEntity.ok(bancoPreguntasService.cargarDesdeExcel(
                rolExamenId, file, docenteAprobador, authentication.getName()));
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','DOCENTE')")
    @Operation(summary = "Cargar y validar banco de preguntas Excel por materia/grupo/parcial")
    public ResponseEntity<CargaBancoResponseDto> uploadPorParametros(
            @RequestParam("file") MultipartFile file,
            @RequestParam("materiaCodigo") String materiaCodigo,
            @RequestParam("grupo") String grupo,
            @RequestParam("tipoParcial") String tipoParcial,
            @RequestParam(value = "materiaNombre", required = false) String materiaNombre,
            @RequestParam(value = "sedeCodigo", required = false) String sedeCodigo,
            @RequestParam(value = "carreraCodigo", required = false) String carreraCodigo,
            @RequestParam(value = "branchOfficeId", required = false) String branchOfficeId,
            @RequestParam(value = "careerId", required = false) String careerId,
            @RequestParam(value = "syllabusCourseId", required = false) String syllabusCourseId,
            @RequestParam(value = "seaGroupId", required = false) String seaGroupId,
            @RequestParam(value = "docenteAprobador", required = false) String docenteAprobador,
            Authentication authentication) {
        var grupoOficial = accesoAcademicoService.exigirGrupoAccesible(
                sedeCodigo, carreraCodigo, branchOfficeId, careerId,
                syllabusCourseId, seaGroupId, grupo, authentication);
        return ResponseEntity.ok(bancoPreguntasService.cargarDesdeExcelPorParametros(
                materiaCodigo, materiaNombre, grupo, tipoParcial, file,
                grupoOficial.getTeacherName(), authentication.getName()));
    }

    @GetMapping("/contexto")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','DOCENTE')")
    @Operation(summary = "Obtener un banco pendiente de rol por materia, grupo y parcial")
    public ResponseEntity<BancoPreguntasResponseDto> obtenerPorContexto(
            @RequestParam("materiaCodigo") String materiaCodigo,
            @RequestParam("grupo") String grupo,
            @RequestParam("tipoParcial") String tipoParcial,
            @RequestParam(value = "sedeCodigo", required = false) String sedeCodigo,
            @RequestParam(value = "carreraCodigo", required = false) String carreraCodigo,
            @RequestParam(value = "branchOfficeId", required = false) String branchOfficeId,
            @RequestParam(value = "careerId", required = false) String careerId,
            @RequestParam(value = "syllabusCourseId", required = false) String syllabusCourseId,
            @RequestParam(value = "seaGroupId", required = false) String seaGroupId,
            Authentication authentication) {
        accesoAcademicoService.exigirGrupoAccesible(
                sedeCodigo, carreraCodigo, branchOfficeId, careerId,
                syllabusCourseId, seaGroupId, grupo, authentication);
        return ResponseEntity.ok(bancoPreguntasService.obtenerPorContexto(materiaCodigo, grupo, tipoParcial));
    }

    @DeleteMapping("/{rolExamenId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','DOCENTE') and @accesoAcademicoService.puedeAccederRol(#rolExamenId, authentication)")
    @Operation(summary = "Eliminar el banco de preguntas cargado para un rol de examen")
    public ResponseEntity<Void> eliminarPorRol(
            @PathVariable String rolExamenId,
            @RequestParam("confirmacion") String confirmacion,
            @RequestParam(value = "usuario", required = false) String usuario,
            Authentication authentication) {
        bancoPreguntasService.eliminarPorRolExamenId(rolExamenId, confirmacion, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
