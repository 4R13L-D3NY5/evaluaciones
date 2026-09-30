package com.xpertiflow.evaluaciones.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.gateway.*;
import com.xpertiflow.evaluaciones.domain.entity.MockGatewayCalificacion;
import com.xpertiflow.evaluaciones.domain.repository.MockGatewayCalificacionRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name = "Mock Gateway UNITEPC / Sandbox", description = "Simulador del Gateway SEA para pruebas controladas de registro de calificaciones")
public class MockUnitepcGatewayController {

    private final MockGatewayCalificacionRepository mockRepository;
    private final ObjectMapper objectMapper;

    /**
     * Endpoint simulado para generación de tokens Bearer OAuth2.
     * Compatible con client_credentials de UnitepcGatewayClient.
     */
    @PostMapping(value = {
            "/mock-gateway/auth/token",
            "/api/mock-gateway/auth/token"
    }, consumes = MediaType.APPLICATION_FORM_URLENCODED_VALUE)
    public ResponseEntity<TokenResponseDto> obtenerTokenMock(
            @RequestParam(value = "grant_type", required = false) String grantType,
            @RequestParam(value = "client_id", required = false) String clientId,
            @RequestParam(value = "client_secret", required = false) String clientSecret) {

        log.info("[MOCK-GATEWAY] Solicitud de token OAuth2 recibida para clientId: {}", clientId);

        TokenResponseDto response = new TokenResponseDto();
        response.setAccessToken("mock-sea-bearer-token-" + UUID.randomUUID());
        response.setTokenType("Bearer");
        response.setExpiresIn(3600);
        response.setRefreshExpiresIn(7200);
        response.setScope("research-evaluations");

        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint simulado del contrato oficial UNITEPC SEA:
     * POST /api/v1/university/externals/research/student-evaluations
     * Persiste los registros en la tabla de sandbox sea_mock_gateway_calificaciones.
     */
    @PostMapping({
            "/mock-gateway/api/v1/university/externals/research/student-evaluations",
            "/api/mock-gateway/api/v1/university/externals/research/student-evaluations",
            "/api/mock-gateway/student-evaluations"
    })
    @Transactional
    @Operation(summary = "Recepción simulada de calificaciones SEA con persistencia en BD de Sandbox")
    public ResponseEntity<List<ResearchStudentEvaluationRegisterResponseDto>> registrarCalificacionesMock(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "clientId", required = false) String clientIdHeader,
            @RequestBody ResearchStudentEvaluationRegisterInputDto input) {

        log.info("[MOCK-GATEWAY] Recibido payload de calificaciones: groupId={}, syllabusCourseId={}, totalEstudiantes={}, clientId={}",
                input != null ? input.getGroupId() : null,
                input != null ? input.getSyllabusCourseId() : null,
                input != null && input.getStudents() != null ? input.getStudents().size() : 0,
                clientIdHeader);

        if (input == null || input.getGroupId() == null || input.getSyllabusCourseId() == null) {
            log.warn("[MOCK-GATEWAY] Payload inválido: falta groupId o syllabusCourseId");
            return ResponseEntity.badRequest().build();
        }

        List<ResearchStudentEvaluationRegisterResponseDto> responses = new ArrayList<>();
        List<StudentOldCodeScoreInputDto> estudiantes = input.getStudents() != null ? input.getStudents() : List.of();

        for (StudentOldCodeScoreInputDto est : estudiantes) {
            Long oldCode = est.getStudentOldCode();
            Integer score = est.getScore();

            boolean valido = oldCode != null && score != null && score >= 0 && score <= 100;

            if (valido) {
                try {
                    MockGatewayCalificacion entidad = mockRepository
                            .findByGroupIdAndSyllabusCourseIdAndStudentOldCode(input.getGroupId(), input.getSyllabusCourseId(), oldCode)
                            .orElseGet(() -> MockGatewayCalificacion.builder()
                                    .syllabusCourseId(input.getSyllabusCourseId())
                                    .groupId(input.getGroupId())
                                    .studentOldCode(oldCode)
                                    .intentosRecibidos(0)
                                    .build());

                    entidad.setScore(score);
                    entidad.setClientId(clientIdHeader != null ? clientIdHeader : "sin-header");
                    entidad.setIntentosRecibidos(entidad.getIntentosRecibidos() + 1);

                    try {
                        entidad.setRawRequestJson(objectMapper.writeValueAsString(est));
                    } catch (Exception ignored) {
                    }

                    mockRepository.save(entidad);

                    responses.add(ResearchStudentEvaluationRegisterResponseDto.builder()
                            .syllabusCourseId(input.getSyllabusCourseId())
                            .groupId(input.getGroupId())
                            .oldCode(oldCode)
                            .completed(true)
                            .build());

                } catch (Exception ex) {
                    log.error("[MOCK-GATEWAY] Error al persistir estudiante {}: {}", oldCode, ex.getMessage());
                    responses.add(ResearchStudentEvaluationRegisterResponseDto.builder()
                            .syllabusCourseId(input.getSyllabusCourseId())
                            .groupId(input.getGroupId())
                            .oldCode(oldCode)
                            .completed(false)
                            .build());
                }
            } else {
                log.warn("[MOCK-GATEWAY] Registro inválido para studentOldCode={}: score={}", oldCode, score);
                responses.add(ResearchStudentEvaluationRegisterResponseDto.builder()
                        .syllabusCourseId(input.getSyllabusCourseId())
                        .groupId(input.getGroupId())
                        .oldCode(oldCode)
                        .completed(false)
                        .build());
            }
        }

        return ResponseEntity.ok(responses);
    }

    /**
     * Endpoint de inspección para verificar qué notas quedaron persistidas en la BD de Sandbox.
     */
    @GetMapping({
            "/mock-gateway/calificaciones",
            "/api/mock-gateway/calificaciones"
    })
    @Operation(summary = "Consultar calificaciones almacenadas en la base de datos de Sandbox")
    public ResponseEntity<List<MockGatewayCalificacion>> inspeccionarCalificaciones(
            @RequestParam(required = false) UUID groupId) {

        if (groupId != null) {
            return ResponseEntity.ok(mockRepository.findByGroupIdOrderByStudentOldCodeAsc(groupId));
        }
        return ResponseEntity.ok(mockRepository.findAllByOrderByRecibidoEnDesc());
    }

    /**
     * Endpoint de limpieza para reiniciar el sandbox entre pruebas.
     */
    @DeleteMapping({
            "/mock-gateway/calificaciones/limpiar",
            "/api/mock-gateway/calificaciones/limpiar"
    })
    @Operation(summary = "Limpiar todos los registros de prueba del sandbox")
    public ResponseEntity<Map<String, Object>> limpiarSandbox() {
        long count = mockRepository.count();
        mockRepository.deleteAll();
        return ResponseEntity.ok(Map.of(
                "mensaje", "Sandbox de calificaciones limpiado exitosamente",
                "registrosEliminados", count
        ));
    }
}
