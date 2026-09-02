package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.gateway.*;
import com.xpertiflow.evaluaciones.application.AccesoAcademicoService;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/catalogo-academico")
@RequiredArgsConstructor
@Tag(name = "Catálogo Académico", description = "Proxy al gateway institucional UNITEPC")
public class CatalogoAcademicoController {

    private final UnitepcGatewayClient unitepcGatewayClient;
    private final AccesoAcademicoService accesoAcademicoService;

    @GetMapping("/sedes")
    @Operation(summary = "Listar sedes UNITEPC")
    public ResponseEntity<List<BranchOfficeDto>> sedes(Authentication authentication) {
        return ResponseEntity.ok(accesoAcademicoService.filtrarSedesParaUsuario(
                unitepcGatewayClient.getBranchOffices(), authentication));
    }

    @GetMapping("/carreras")
    @Operation(summary = "Listar carreras por sede")
    public ResponseEntity<List<CareerDto>> carreras(@RequestParam String branchOfficeCode,
                                                    Authentication authentication) {
        return ResponseEntity.ok(accesoAcademicoService.filtrarCarrerasParaUsuario(
                unitepcGatewayClient.getCareers(branchOfficeCode), branchOfficeCode, authentication));
    }

    @GetMapping("/asignaturas")
    @Operation(summary = "Listar asignaturas por sede y carrera")
    public ResponseEntity<List<CourseDto>> asignaturas(
            @RequestParam String branchOfficeCode,
            @RequestParam String careerCode,
            Authentication authentication) {
        return ResponseEntity.ok(accesoAcademicoService.filtrarAsignaturasParaUsuario(
                unitepcGatewayClient.getCourses(branchOfficeCode, careerCode),
                branchOfficeCode,
                careerCode,
                authentication));
    }

    @GetMapping("/grupos")
    @Operation(summary = "Listar grupos por gestión, sede, carrera y asignatura")
    public ResponseEntity<List<GroupItemDto>> grupos(
            @RequestParam(required = false, defaultValue = "2-2026") String term,
            @RequestParam(required = false) String branchOfficeId,
            @RequestParam(required = false) String careerId,
            @RequestParam(required = false) String syllabusCourseId,
            @RequestParam(required = false) String branchOfficeCode,
            @RequestParam(required = false) String careerCode,
            Authentication authentication) {
        if (branchOfficeCode != null && !branchOfficeCode.isBlank()
                && !accesoAcademicoService.puedeConsultarSede(branchOfficeCode, authentication)) {
            return ResponseEntity.ok(List.of());
        }
        if (careerCode != null && !careerCode.isBlank()
                && !accesoAcademicoService.puedeConsultarCarrera(branchOfficeCode, careerCode, authentication)) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(accesoAcademicoService.filtrarGruposParaUsuario(
                unitepcGatewayClient.getGroups(term, branchOfficeId, careerId, syllabusCourseId), authentication));
    }

    @GetMapping("/estudiantes")
    @Operation(summary = "Listar estudiantes por grupo")
    public ResponseEntity<List<StudentItemDto>> estudiantes(@RequestParam String groupId) {
        return ResponseEntity.ok(unitepcGatewayClient.getStudentsByGroup(groupId));
    }

    @GetMapping("/campus")
    @Operation(summary = "Listar campus físicos")
    public ResponseEntity<List<CampusDto>> campus(@RequestParam(required = false) String branchOfficeId) {
        return ResponseEntity.ok(unitepcGatewayClient.getCampuses(branchOfficeId));
    }

    @GetMapping("/gestiones")
    @Operation(summary = "Listar gestiones institucionales")
    public ResponseEntity<List<TimeFrameDto>> gestiones() {
        return ResponseEntity.ok(unitepcGatewayClient.getTimeFrames());
    }

    @GetMapping("/gestiones/activa")
    @Operation(summary = "Obtener gestión activa")
    public ResponseEntity<TimeFrameDto> gestionActiva() {
        return ResponseEntity.ok(unitepcGatewayClient.getActiveTimeFrame());
    }
}
