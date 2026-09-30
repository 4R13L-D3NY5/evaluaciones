package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.gateway.*;
import com.xpertiflow.evaluaciones.api.dto.sincronizacion.SincronizacionNotasSeaReporteDto;
import com.xpertiflow.evaluaciones.domain.entity.CalificacionOmr;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.repository.*;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SincronizacionNotasSeaServiceTest {

    @Mock
    private RolExamenRepository rolExamenRepository;

    @Mock
    private CalificacionOmrRepository calificacionOmrRepository;

    @Mock
    private NotaDocenteRepository notaDocenteRepository;

    @Mock
    private IntentoExamenVirtualRepository intentoVirtualRepository;

    @Mock
    private SalaExamenVirtualRepository salaVirtualRepository;

    @Mock
    private AuditoriaEvaluacionRepository auditoriaRepository;

    @Mock
    private UnitepcGatewayClient unitepcGatewayClient;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private SincronizacionNotasSeaService service;

    private Authentication auth;
    private RolExamen rol;
    private String rolExamenId = "ROL-TEST-1P-2026";
    private UUID syllabusId = UUID.randomUUID();
    private UUID groupId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        auth = new TestingAuthenticationToken("admin", "password", "ROLE_ADMINISTRADOR_SISTEMA");

        rol = RolExamen.builder()
                .id(rolExamenId)
                .materiaCodigo("SIS-114")
                .materiaNombre("PROGRAMACIÓN I")
                .grupo("TA-01")
                .sedeCodigo("CBB")
                .sedeNombre("COCHABAMBA")
                .carreraCodigo("SIS")
                .carreraNombre("INGENIERÍA DE SISTEMAS")
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .estadoFlujo(EstadoFlujo.CALIFICADO)
                .seaGroupId(groupId.toString())
                .seaSyllabusCourseId(syllabusId.toString())
                .sincronizadoSea(false)
                .build();
    }

    @Test
    @DisplayName("Debe generar la vista previa de notas sobre 100 incluyendo ausentes con 0")
    void testObtenerVistaPrevia() {
        when(rolExamenRepository.findById(rolExamenId)).thenReturn(Optional.of(rol));

        // Estudiante 1 con cartilla calificada
        CalificacionOmr cal1 = new CalificacionOmr();
        cal1.setRolExamenId(rolExamenId);
        cal1.setCodigoEstudiante("1113004");
        cal1.setEstudianteNombreCompleto("CRUZ TICONA PAOLA");
        cal1.setNotaSobre100(new BigDecimal("85.50"));
        cal1.setEstadoCalificacion("CALIFICADO");
        cal1.setEsReprogramado(false);

        when(calificacionOmrRepository.findByRolExamenIdOrderByCodigoEstudianteAsc(rolExamenId))
                .thenReturn(List.of(cal1));

        // Nómina oficial con 2 estudiantes (1113004 y 1108137 que estuvo ausente)
        StudentItemDto s1 = new StudentItemDto();
        s1.setStudentCode("1113004");
        s1.setFullName("CRUZ TICONA PAOLA");

        StudentItemDto s2 = new StudentItemDto();
        s2.setStudentCode("1108137");
        s2.setFullName("ALVAREZ GOMEZ JUAN");

        when(unitepcGatewayClient.getStudentsByGroup(groupId.toString()))
                .thenReturn(List.of(s1, s2));

        SincronizacionNotasSeaReporteDto previa = service.obtenerVistaPrevia(rolExamenId, auth);

        assertNotNull(previa);
        assertEquals(2, previa.getTotalEstudiantes());
        assertEquals(syllabusId, previa.getSyllabusCourseId());
        assertEquals(groupId, previa.getGroupId());

        // Verificar que s1 tiene nota 86 (redondeado de 85.50)
        var est1 = previa.getEstudiantes().stream().filter(e -> "1113004".equals(e.getCodigoEstudiante())).findFirst().orElseThrow();
        assertEquals(86, est1.getScore());
        assertEquals(1113004L, est1.getStudentOldCode());

        // Verificar que s2 (ausente) tiene nota 0
        var est2 = previa.getEstudiantes().stream().filter(e -> "1108137".equals(e.getCodigoEstudiante())).findFirst().orElseThrow();
        assertEquals(0, est2.getScore());
        assertEquals(1108137L, est2.getStudentOldCode());
    }

    @Test
    @DisplayName("Debe sincronizar notas con el Gateway SEA, registrar auditoría y marcar el rol como sincronizado")
    void testSincronizarNotasConSea() {
        when(rolExamenRepository.findById(rolExamenId)).thenReturn(Optional.of(rol));

        CalificacionOmr cal1 = new CalificacionOmr();
        cal1.setRolExamenId(rolExamenId);
        cal1.setCodigoEstudiante("5178397");
        cal1.setEstudianteNombreCompleto("QUISPE MAMANI LUIS");
        cal1.setNotaSobre100(new BigDecimal("72.00"));
        cal1.setEstadoCalificacion("CALIFICADO");
        cal1.setEsReprogramado(false);

        CalificacionOmr cal2Reprog = new CalificacionOmr();
        cal2Reprog.setRolExamenId(rolExamenId);
        cal2Reprog.setCodigoEstudiante("4466316");
        cal2Reprog.setEstudianteNombreCompleto("RODRIGUEZ ANA");
        cal2Reprog.setNotaSobre100(new BigDecimal("90.00"));
        cal2Reprog.setEstadoCalificacion("CALIFICADO");
        cal2Reprog.setEsReprogramado(true);
        cal2Reprog.setFechaExamenReprogramado(LocalDate.of(2026, 9, 28));

        when(calificacionOmrRepository.findByRolExamenIdOrderByCodigoEstudianteAsc(rolExamenId))
                .thenReturn(List.of(cal1, cal2Reprog));

        when(unitepcGatewayClient.getStudentsByGroup(groupId.toString()))
                .thenReturn(List.of());

        // Respuesta simulada del Gateway SEA
        ResearchStudentEvaluationRegisterResponseDto resp1 = ResearchStudentEvaluationRegisterResponseDto.builder()
                .syllabusCourseId(syllabusId)
                .groupId(groupId)
                .oldCode(5178397L)
                .completed(true)
                .build();

        ResearchStudentEvaluationRegisterResponseDto resp2 = ResearchStudentEvaluationRegisterResponseDto.builder()
                .syllabusCourseId(syllabusId)
                .groupId(groupId)
                .oldCode(4466316L)
                .completed(true)
                .build();

        when(unitepcGatewayClient.registerStudentEvaluations(any(ResearchStudentEvaluationRegisterInputDto.class)))
                .thenReturn(List.of(resp1, resp2));

        SincronizacionNotasSeaReporteDto resultado = service.sincronizarNotasConSea(rolExamenId, auth);

        assertNotNull(resultado);
        assertEquals(2, resultado.getTotalEstudiantes());
        assertEquals(2, resultado.getTotalExitosos());
        assertEquals(0, resultado.getTotalFallidos());

        // Verificar llamada al Gateway con el payload correcto
        ArgumentCaptor<ResearchStudentEvaluationRegisterInputDto> captor = ArgumentCaptor.forClass(ResearchStudentEvaluationRegisterInputDto.class);
        verify(unitepcGatewayClient).registerStudentEvaluations(captor.capture());

        ResearchStudentEvaluationRegisterInputDto enviado = captor.getValue();
        assertEquals(syllabusId, enviado.getSyllabusCourseId());
        assertEquals(groupId, enviado.getGroupId());
        assertEquals(2, enviado.getStudents().size());

        // Verificar que rol quedó marcado como sincronizado
        assertTrue(rol.getSincronizadoSea());
        assertNotNull(rol.getFechaSincronizacionSea());
        assertEquals("admin", rol.getSincronizadoSeaPor());

        verify(rolExamenRepository).save(rol);
        verify(auditoriaRepository).save(any());
    }
}
