package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.virtual.*;
import com.xpertiflow.evaluaciones.application.ExamenVirtualService;
import com.xpertiflow.evaluaciones.domain.entity.IntentoExamenVirtual;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AccesoExamenVirtualController {
    private final ExamenVirtualService service;

    @PostMapping("/api/acceso-virtual/validar")
    public ResponseEntity<AccesoVirtualResponseDto> validar(@Valid @RequestBody AccesoVirtualRequestDto request,
                                                             @RequestHeader(value = "X-Forwarded-For", required = false) String ip) {
        return ResponseEntity.ok(service.validarAcceso(request, ip));
    }

    @GetMapping("/api/examen-virtual/actual")
    public ResponseEntity<AccesoVirtualResponseDto> actual(@RequestHeader("X-Examen-Token") String token) {
        return ResponseEntity.ok(service.consultarExamen(token));
    }

    @PutMapping("/api/examen-virtual/respuestas")
    public ResponseEntity<RespuestaGuardadaDto> guardar(@RequestHeader("X-Examen-Token") String token,
                                                         @Valid @RequestBody RespuestaVirtualRequestDto request) {
        return ResponseEntity.ok(service.guardarRespuesta(token, request));
    }

    @PostMapping("/api/examen-virtual/enviar")
    public ResponseEntity<IntentoVirtualResponseDto> enviar(@RequestHeader("X-Examen-Token") String token) {
        IntentoExamenVirtual intento = service.enviar(token);
        IntentoVirtualResponseDto response = new IntentoVirtualResponseDto();
        response.setIntentoId(intento.getId()); response.setEstado(intento.getEstado()); response.setAciertos(intento.getAciertos());
        response.setNotaSobre30(intento.getNotaSobre30() == null ? null : intento.getNotaSobre30().toPlainString());
        response.setNotaSobre100(intento.getNotaSobre100() == null ? null : intento.getNotaSobre100().toPlainString());
        response.setEnviadoEn(intento.getEnviadoEn() == null ? null : intento.getEnviadoEn().toString());
        return ResponseEntity.ok(response);
    }
}
