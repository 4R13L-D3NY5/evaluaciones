package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.GenerarCartillasOmrRequestDto;
import com.xpertiflow.evaluaciones.api.dto.LoteCartillasOmrResponseDto;
import com.xpertiflow.evaluaciones.api.dto.PreparacionCartillasOmrResponseDto;
import com.xpertiflow.evaluaciones.application.CartillaOmrService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/roles-examen/{rolExamenId}/cartillas")
@RequiredArgsConstructor
@Tag(name = "Cartillas OMR", description = "Lotes de cartillas OMR con datos preimpresos")
public class CartillaOmrController {

    private final CartillaOmrService cartillaOmrService;

    @GetMapping("/ultimo")
    @Operation(summary = "Obtener el último lote de cartillas del rol de examen")
    public ResponseEntity<LoteCartillasOmrResponseDto> obtenerUltimo(@PathVariable String rolExamenId) {
        return cartillaOmrService.obtenerUltimo(rolExamenId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/preparacion")
    @Operation(summary = "Obtener la nómina oficial para imprimir marcas OMR")
    public ResponseEntity<PreparacionCartillasOmrResponseDto> obtenerPreparacion(@PathVariable String rolExamenId) {
        return ResponseEntity.ok(cartillaOmrService.obtenerPreparacion(rolExamenId));
    }

    @PostMapping(value = "/imprimir", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES')")
    @Operation(summary = "Generar temporalmente la sobreimpresión OMR y devolverla al navegador")
    public ResponseEntity<byte[]> imprimir(@PathVariable String rolExamenId) {
        byte[] pdf = cartillaOmrService.generarPdfTemporal(rolExamenId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=marcas-omr-" + rolExamenId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @PostMapping("/marcar-impreso")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES')")
    @Operation(summary = "Registrar la confirmación de impresión de marcas OMR")
    public ResponseEntity<PreparacionCartillasOmrResponseDto> marcarImpreso(@PathVariable String rolExamenId,
                                                                              @RequestBody(required = false) GenerarCartillasOmrRequestDto request) {
        String usuario = request == null ? null : request.usuario();
        return ResponseEntity.ok(cartillaOmrService.marcarImpresion(rolExamenId, usuario));
    }

    @PostMapping("/generar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES')")
    @Operation(summary = "Generar un lote de cartillas OMR preimpresas")
    public ResponseEntity<LoteCartillasOmrResponseDto> generar(
            @PathVariable String rolExamenId,
            @RequestBody(required = false) GenerarCartillasOmrRequestDto request) {
        String usuario = request == null ? null : request.usuario();
        return ResponseEntity.status(HttpStatus.CREATED).body(cartillaOmrService.generar(rolExamenId, usuario));
    }

    @PostMapping("/lotes/{loteId}/marcar-impreso")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES')")
    @Operation(summary = "Confirmar la impresión de todo un lote de cartillas")
    public ResponseEntity<LoteCartillasOmrResponseDto> marcarImpreso(
            @PathVariable String rolExamenId,
            @PathVariable String loteId,
            @RequestBody(required = false) GenerarCartillasOmrRequestDto request) {
        String usuario = request == null ? null : request.usuario();
        return ResponseEntity.ok(cartillaOmrService.marcarImpreso(rolExamenId, loteId, usuario));
    }
}
