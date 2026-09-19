package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.CalificacionOmrResponseDto;
import com.xpertiflow.evaluaciones.api.dto.RecalificarOmrRequestDto;
import com.xpertiflow.evaluaciones.config.AppProperties;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import com.xpertiflow.evaluaciones.domain.entity.CalificacionOmr;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.repository.*;
import com.xpertiflow.evaluaciones.security.BancoCifradoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OmrProcesamientoServiceTest {

    @Mock
    private RabbitTemplate rabbitTemplate;
    @Mock
    private AppProperties appProperties;
    @Mock
    private CalificacionOmrRepository calificacionRepository;
    @Mock
    private AuditoriaEvaluacionRepository auditoriaRepository;
    @Mock
    private AnulacionPreguntaOmrRepository anulacionRepository;
    @Mock
    private ConfiguracionOmrRepository configuracionRepository;
    @Mock
    private MapeoEstudianteVarianteRepository mapeoRepository;
    @Mock
    private ExamenVarianteRepository varianteRepository;
    @Mock
    private RolExamenRepository rolExamenRepository;
    @Mock
    private LoteCartillasOmrRepository loteCartillasRepository;
    @Mock
    private BancoCifradoService cifradoService;
    @Mock
    private PatronOmrPdfService patronOmrPdfService;
    @Mock
    private PoliticaTiempoEvaluacionesService politicaTiempoEvaluacionesService;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private OmrProcesamientoService service;

    private String rolId;
    private RolExamen rol;
    private Authentication auth;

    @BeforeEach
    void setUp() {
        service = new OmrProcesamientoService(
                rabbitTemplate,
                objectMapper,
                appProperties,
                calificacionRepository,
                auditoriaRepository,
                anulacionRepository,
                configuracionRepository,
                mapeoRepository,
                varianteRepository,
                rolExamenRepository,
                loteCartillasRepository,
                cifradoService,
                patronOmrPdfService,
                politicaTiempoEvaluacionesService
        );

        rolId = UUID.randomUUID().toString();
        rol = RolExamen.builder()
                .id(rolId)
                .estadoFlujo(EstadoFlujo.CALIFICADO)
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .sedeCodigo("CBB")
                .sedeNombre("COCHABAMBA")
                .carreraCodigo("SIS")
                .carreraNombre("INGENIERIA DE SISTEMAS")
                .materiaCodigo("MAT-101")
                .materiaNombre("CALCULO I")
                .build();

        auth = new UsernamePasswordAuthenticationToken(
                "responsable.eval",
                "secret",
                List.of(new SimpleGrantedAuthority("ROLE_RESPONSABLE_EVALUACIONES"))
        );
    }

    @Test
    void anularExamenEstudiante_marcaAnuladoYNotasCero() {
        CalificacionOmr calificacion = new CalificacionOmr();
        calificacion.setId(100L);
        calificacion.setRolExamenId(rolId);
        calificacion.setCodigoEstudiante("EST-12345");
        calificacion.setEstudianteNombreCompleto("JUAN PEREZ");
        calificacion.setLetraVariante("A");
        calificacion.setTotalReactivos(30);
        calificacion.setAciertos(25);
        calificacion.setFallos(5);
        calificacion.setBlancos(0);
        calificacion.setDoblesMarcas(0);
        calificacion.setNotaSobre60(new BigDecimal("50.00"));
        calificacion.setNotaSobre100(new BigDecimal("83.33"));
        calificacion.setEstadoCalificacion("APROBADO");
        calificacion.setRespuestasDetectadasJson("{\"1\":\"A\",\"2\":\"B\"}");

        when(rolExamenRepository.findById(rolId)).thenReturn(Optional.of(rol));
        when(calificacionRepository.findByRolExamenIdAndCodigoEstudiante(rolId, "EST-12345"))
                .thenReturn(Optional.of(calificacion));
        when(calificacionRepository.save(any(CalificacionOmr.class))).thenAnswer(i -> i.getArgument(0));

        CalificacionOmrResponseDto response = service.anularExamenEstudiante(
                rolId, "EST-12345", true, "Cartilla adulterada con borrones sospechosos", auth, "127.0.0.1");

        assertThat(response).isNotNull();
        assertThat(response.getEstadoCalificacion()).isEqualTo("ANULADO");
        assertThat(response.getNotaSobre60()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.getNotaSobre100()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(response.getAciertos()).isZero();

        ArgumentCaptor<AuditoriaEvaluacion> auditoriaCaptor = ArgumentCaptor.forClass(AuditoriaEvaluacion.class);
        verify(auditoriaRepository).save(auditoriaCaptor.capture());
        assertThat(auditoriaCaptor.getValue().getAccion()).isEqualTo("EXAMEN_ESTUDIANTE_ANULADO");
        assertThat(auditoriaCaptor.getValue().getUsuario()).isEqualTo("responsable.eval");
        assertThat(auditoriaCaptor.getValue().getIpOrigen()).isEqualTo("127.0.0.1");
    }

    @Test
    void recalificarEvaluacion_registraAuditoriaYUsuario() {
        when(rolExamenRepository.findById(rolId)).thenReturn(Optional.of(rol));
        when(varianteRepository.findByRolExamenId(rolId)).thenReturn(Collections.emptyList());
        when(calificacionRepository.findByRolExamenIdOrderByCodigoEstudianteAsc(rolId)).thenReturn(Collections.emptyList());

        RecalificarOmrRequestDto req = new RecalificarOmrRequestDto();
        req.setMotivo("Recalificación solicitada tras corrección de clave");

        List<CalificacionOmrResponseDto> resultado = service.recalificarEvaluacion(
                rolId, req, auth, "192.168.1.50");

        assertThat(resultado).isEmpty();

        ArgumentCaptor<AuditoriaEvaluacion> captor = ArgumentCaptor.forClass(AuditoriaEvaluacion.class);
        verify(auditoriaRepository).save(captor.capture());
        assertThat(captor.getValue().getAccion()).isEqualTo("RECALIFICACION_OMR");
        assertThat(captor.getValue().getUsuario()).isEqualTo("responsable.eval");
        assertThat(captor.getValue().getIpOrigen()).isEqualTo("192.168.1.50");
        assertThat(captor.getValue().getDetallesJson()).contains("Recalificación solicitada");
    }
}
