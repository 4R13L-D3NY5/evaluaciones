package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.testvocacional.TestVocacionalActualizarRequestDto;
import com.xpertiflow.evaluaciones.api.dto.testvocacional.TestVocacionalItemDto;
import com.xpertiflow.evaluaciones.api.dto.testvocacional.TestVocacionalProcesarResponseDto;
import com.xpertiflow.evaluaciones.application.TestVocacionalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/test-vocacional")
@RequiredArgsConstructor
@Tag(name = "Test Vocacional", description = "Procesamiento y gestión de cartillas escaneadas del Test de Orientación Vocacional RIASEC")
public class TestVocacionalController {

    private final TestVocacionalService testVocacionalService;

    @PostMapping(value = "/procesar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','EVALUADOR_VOCACIONAL')")
    @Operation(summary = "Subir y encolar escaneado del Test Vocacional para procesamiento OMR y OCR")
    public ResponseEntity<TestVocacionalProcesarResponseDto> procesar(
            @RequestParam("archivo") MultipartFile archivo,
            @RequestParam("colegio") String colegio,
            @RequestParam("curso") String curso,
            @RequestParam(value = "fecha", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(value = "sede", required = false) String sede,
            @RequestParam(value = "gestion", required = false) String gestion,
            @RequestParam(value = "municipio", required = false) String municipio,
            @RequestParam(value = "guardarPdf", defaultValue = "false") boolean guardarPdf,
            @RequestParam(value = "ocrNombre", defaultValue = "false") boolean ocrNombre,
            @RequestParam(value = "ocrCelular", defaultValue = "false") boolean ocrCelular,
            @RequestParam(value = "ocrCorreo", defaultValue = "false") boolean ocrCorreo,
            Authentication authentication) {

        String usuario = authentication != null ? authentication.getName() : "SISTEMA";
        TestVocacionalProcesarResponseDto response = testVocacionalService.iniciarProcesamiento(
                archivo, colegio, curso, fecha, sede, gestion, municipio, usuario, guardarPdf, ocrNombre, ocrCelular, ocrCorreo
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/jobs/{jobId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','EVALUADOR_VOCACIONAL')")
    @Operation(summary = "Consultar el estado y resultados de un trabajo de procesamiento de Test Vocacional")
    public ResponseEntity<TestVocacionalProcesarResponseDto> consultarJob(@PathVariable String jobId) {
        return ResponseEntity.ok(testVocacionalService.consultarJob(jobId));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','EVALUADOR_VOCACIONAL')")
    @Operation(summary = "Listar registros evaluados del Test Vocacional con filtros")
    public ResponseEntity<List<TestVocacionalItemDto>> listar(
            @RequestParam(value = "colegio", required = false) String colegio,
            @RequestParam(value = "curso", required = false) String curso,
            @RequestParam(value = "fecha", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(value = "busqueda", required = false) String busqueda) {

        return ResponseEntity.ok(testVocacionalService.listar(colegio, curso, fecha, busqueda));
    }

    @GetMapping("/filtros")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','EVALUADOR_VOCACIONAL')")
    @Operation(summary = "Obtener opciones únicas de colegios y cursos para filtros")
    public ResponseEntity<Map<String, List<String>>> obtenerFiltros() {
        return ResponseEntity.ok(testVocacionalService.obtenerFiltrosDisponibles());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','EVALUADOR_VOCACIONAL')")
    @Operation(summary = "Obtener el detalle de una evaluación de Test Vocacional")
    public ResponseEntity<TestVocacionalItemDto> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(testVocacionalService.obtenerPorId(id));
    }

    @GetMapping("/{id}/interpretacion")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','EVALUADOR_VOCACIONAL')")
    @Operation(summary = "Obtener el informe vocacional detallado RIASEC del estudiante")
    public ResponseEntity<com.xpertiflow.evaluaciones.api.dto.testvocacional.InterpretacionVocacionalDto> obtenerInterpretacion(@PathVariable Long id) {
        return ResponseEntity.ok(testVocacionalService.obtenerInterpretacion(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','EVALUADOR_VOCACIONAL')")
    @Operation(summary = "Actualizar campos editables de una evaluación (nombre, celular, correo, números marcados, etc.)")
    public ResponseEntity<TestVocacionalItemDto> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody TestVocacionalActualizarRequestDto dto,
            Authentication authentication) {

        String usuario = authentication != null ? authentication.getName() : "SISTEMA";
        return ResponseEntity.ok(testVocacionalService.actualizar(id, dto, usuario));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','EVALUADOR_VOCACIONAL')")
    @Operation(summary = "Eliminar un registro de evaluación")
    public ResponseEntity<Void> eliminar(@PathVariable Long id, Authentication authentication) {
        String usuario = authentication != null ? authentication.getName() : "SISTEMA";
        testVocacionalService.eliminar(id, usuario);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/paquete")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','EVALUADOR_VOCACIONAL')")
    @Operation(summary = "Eliminar todas las evaluaciones de un colegio y paralelo específico")
    public ResponseEntity<Map<String, Object>> eliminarPaquete(
            @RequestParam("colegio") String colegio,
            @RequestParam("curso") String curso,
            Authentication authentication) {
        String usuario = authentication != null ? authentication.getName() : "SISTEMA";
        int eliminados = testVocacionalService.eliminarPaquete(colegio, curso, usuario);
        return ResponseEntity.ok(Map.of(
                "mensaje", "Paralelo eliminado exitosamente",
                "eliminados", eliminados
        ));
    }

    @GetMapping("/exportar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','EVALUADOR_VOCACIONAL')")
    @Operation(summary = "Exportar las evaluaciones filtradas a formato Excel (.xlsx)")
    public ResponseEntity<byte[]> exportar(
            @RequestParam(value = "colegio", required = false) String colegio,
            @RequestParam(value = "curso", required = false) String curso,
            @RequestParam(value = "fecha", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(value = "busqueda", required = false) String busqueda) {

        byte[] excel = testVocacionalService.exportarExcel(colegio, curso, fecha, busqueda);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"reporte_test_vocacional.xlsx\"")
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }

    @GetMapping("/{id}/preview")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES','EVALUADOR_VOCACIONAL')")
    @Operation(summary = "Obtener la imagen escaneada anotada de la hoja de Test Vocacional")
    public ResponseEntity<Resource> preview(@PathVariable Long id) {
        Path path = testVocacionalService.resolverRutaPreview(id);
        if (path == null) {
            return ResponseEntity.notFound().build();
        }
        MediaType mediaType = MediaTypeFactory.getMediaType(path.getFileName().toString())
                .orElse(MediaType.IMAGE_PNG);

        return ResponseEntity.ok()
                .cacheControl(CacheControl.noStore())
                .contentType(mediaType)
                .body(new FileSystemResource(path));
    }
}
