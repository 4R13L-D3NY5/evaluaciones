package com.xpertiflow.evaluaciones.api.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.gateway.ResearchStudentEvaluationRegisterInputDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.StudentOldCodeScoreInputDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.TokenResponseDto;
import com.xpertiflow.evaluaciones.domain.entity.MockGatewayCalificacion;
import com.xpertiflow.evaluaciones.domain.repository.MockGatewayCalificacionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MockUnitepcGatewayControllerTest {

    @Mock
    private MockGatewayCalificacionRepository mockRepository;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private MockUnitepcGatewayController controller;

    private UUID syllabusId;
    private UUID groupId;

    @BeforeEach
    void setUp() {
        syllabusId = UUID.randomUUID();
        groupId = UUID.randomUUID();
    }

    @Test
    @DisplayName("Debe generar token OAuth2 mock para UnitepcGatewayClient")
    void testObtenerTokenMock() {
        ResponseEntity<TokenResponseDto> response = controller.obtenerTokenMock("client_credentials", "sea-evaluaciones", "secret");

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().getAccessToken().startsWith("mock-sea-bearer-token-"));
        assertEquals("Bearer", response.getBody().getTokenType());
    }

    @Test
    @DisplayName("Debe registrar y persistir calificaciones en la tabla sea_mock_gateway_calificaciones")
    void testRegistrarCalificacionesMock() {
        StudentOldCodeScoreInputDto s1 = StudentOldCodeScoreInputDto.builder()
                .studentOldCode(5178397L)
                .score(85)
                .build();

        StudentOldCodeScoreInputDto s2 = StudentOldCodeScoreInputDto.builder()
                .studentOldCode(4466316L)
                .score(72)
                .build();

        ResearchStudentEvaluationRegisterInputDto input = ResearchStudentEvaluationRegisterInputDto.builder()
                .syllabusCourseId(syllabusId)
                .groupId(groupId)
                .students(List.of(s1, s2))
                .build();

        when(mockRepository.findByGroupIdAndSyllabusCourseIdAndStudentOldCode(eq(groupId), eq(syllabusId), anyLong()))
                .thenReturn(Optional.empty());

        var response = controller.registrarCalificacionesMock(
                "Bearer mock-token",
                "sea-evaluaciones",
                input
        );

        assertNotNull(response);
        assertEquals(200, response.getStatusCode().value());
        List<?> items = response.getBody();
        assertNotNull(items);
        assertEquals(2, items.size());

        // Verificar que se guardaron 2 entidades en el repositorio mock
        verify(mockRepository, times(2)).save(any(MockGatewayCalificacion.class));
    }

    @Test
    @DisplayName("Debe actualizar la nota y contar reintentos si el estudiante ya existía en la BD de sandbox")
    void testRegistrarCalificacionesMock_ActualizaNotaExistente() {
        StudentOldCodeScoreInputDto s1 = StudentOldCodeScoreInputDto.builder()
                .studentOldCode(5178397L)
                .score(90) // Nota nueva (ej. reprogramación oral)
                .build();

        ResearchStudentEvaluationRegisterInputDto input = ResearchStudentEvaluationRegisterInputDto.builder()
                .syllabusCourseId(syllabusId)
                .groupId(groupId)
                .students(List.of(s1))
                .build();

        MockGatewayCalificacion existente = MockGatewayCalificacion.builder()
                .id(1L)
                .groupId(groupId)
                .syllabusCourseId(syllabusId)
                .studentOldCode(5178397L)
                .score(60)
                .intentosRecibidos(1)
                .build();

        when(mockRepository.findByGroupIdAndSyllabusCourseIdAndStudentOldCode(groupId, syllabusId, 5178397L))
                .thenReturn(Optional.of(existente));

        var response = controller.registrarCalificacionesMock("Bearer token", "sea-evaluaciones", input);

        assertEquals(200, response.getStatusCode().value());

        ArgumentCaptor<MockGatewayCalificacion> captor = ArgumentCaptor.forClass(MockGatewayCalificacion.class);
        verify(mockRepository).save(captor.capture());

        MockGatewayCalificacion guardado = captor.getValue();
        assertEquals(90, guardado.getScore());
        assertEquals(2, guardado.getIntentosRecibidos());
    }
}
