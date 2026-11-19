package com.xpertiflow.evaluaciones.application.generacion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionTypstRequestDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionTypstResultadoDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.StudentItemDto;
import com.xpertiflow.evaluaciones.application.RolExamenService;
import com.xpertiflow.evaluaciones.application.ConfiguracionEvaluacionesService;
import com.xpertiflow.evaluaciones.application.OmrProcesamientoService;
import com.xpertiflow.evaluaciones.application.VerificacionPoliticaService;
import com.xpertiflow.evaluaciones.application.PoliticaTiempoEvaluacionesService;
import com.xpertiflow.evaluaciones.api.dto.ConfiguracionEvaluacionesDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionHistorialItemDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.RestaurarGeneracionResponseDto;
import com.xpertiflow.evaluaciones.config.AppProperties;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import com.xpertiflow.evaluaciones.domain.entity.BancoPreguntas;
import com.xpertiflow.evaluaciones.domain.entity.CalificacionOmr;
import com.xpertiflow.evaluaciones.domain.entity.GeneracionTypstJob;
import com.xpertiflow.evaluaciones.domain.entity.MapeoEstudianteVariante;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.BancoPreguntasRepository;
import com.xpertiflow.evaluaciones.domain.repository.CalificacionOmrRepository;
import com.xpertiflow.evaluaciones.domain.repository.ExamenVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.GeneracionTypstJobRepository;
import com.xpertiflow.evaluaciones.domain.repository.MapeoEstudianteVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.domain.repository.SalaExamenVirtualRepository;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GeneracionTypstServiceTest {

    @Mock
    private RabbitTemplate rabbitTemplate;
    @Mock
    private BancoPreguntasRepository bancoRepository;
    @Mock
    private RolExamenRepository rolRepository;
    @Mock
    private ExamenVarianteRepository varianteRepository;
    @Mock
    private GeneracionTypstJobRepository generacionTypstJobRepository;
    @Mock
    private MapeoEstudianteVarianteRepository mapeoRepository;
    @Mock
    private RolExamenService rolExamenService;
    @Mock
    private ConfiguracionEvaluacionesService configuracionEvaluacionesService;
    @Mock
    private UnitepcGatewayClient unitepcGatewayClient;
    @Mock
    private VerificacionPoliticaService verificacionPoliticaService;
    @Mock
    private PoliticaTiempoEvaluacionesService politicaTiempoEvaluacionesService;
    @Mock
    private SalaExamenVirtualRepository salaRepository;
    @Mock
    private CalificacionOmrRepository calificacionOmrRepository;
    @Mock
    private AuditoriaEvaluacionRepository auditoriaEvaluacionRepository;
    @Mock
    private OmrProcesamientoService omrProcesamientoService;

    private GeneracionTypstService service;

    @BeforeEach
    void setUp() {
        AppProperties properties = new AppProperties();
        properties.getStorage().setBasePath("/tmp/evaluaciones-storage");
        service = new GeneracionTypstService(
                rabbitTemplate,
                new ObjectMapper(),
                bancoRepository,
                rolRepository,
                varianteRepository,
                generacionTypstJobRepository,
                mapeoRepository,
                rolExamenService,
                configuracionEvaluacionesService,
                properties,
                unitepcGatewayClient,
                verificacionPoliticaService,
                politicaTiempoEvaluacionesService,
                salaRepository,
                calificacionOmrRepository,
                auditoriaEvaluacionRepository,
                omrProcesamientoService);
    }

    @Test
    void conservaElJobIdDelClienteParaQueElPollingConsulteElMismoResultado() throws Exception {
        String jobId = "job-correlacionado-001";
        RolExamen rol = new RolExamen();
        rol.setId("ROL-001");
        rol.setSeaGroupId("GROUP-001");
        BancoPreguntas banco = new BancoPreguntas();
        banco.setId("BANCO-001");
        when(rolRepository.findById("ROL-001")).thenReturn(Optional.of(rol));
        when(bancoRepository.findById("BANCO-001")).thenReturn(Optional.of(banco));
        StudentItemDto estudiante = new StudentItemDto();
        estudiante.setStudentCode("1234567");
        estudiante.setFullName("ESTUDIANTE DE PRUEBA");
        when(unitepcGatewayClient.getStudentsByGroup("GROUP-001")).thenReturn(List.of(estudiante));

        GeneracionTypstRequestDto request = new GeneracionTypstRequestDto();
        request.setJobId(jobId);
        request.setRolExamenId("ROL-001");
        request.setBancoPreguntasId("BANCO-001");
        request.setVariantes(List.of("A", "B", "C"));
        when(rolExamenService.resolverGrupoOficial(rol)).thenReturn("GROUP-001");
        when(rolExamenService.resolverNombreDocenteOficial(rol)).thenReturn("DOCENTE OFICIAL");
        ConfiguracionEvaluacionesDto configuracion = new ConfiguracionEvaluacionesDto();
        configuracion.setRatioEstudiantesPorVariante(5);
        when(configuracionEvaluacionesService.obtener()).thenReturn(configuracion);

        GeneracionTypstResultadoDto respuesta = service.solicitarGeneracion(request);

        assertThat(respuesta.getJobId()).isEqualTo(jobId);
        assertThat(service.consultarEstado(jobId)).isSameAs(respuesta);

        ArgumentCaptor<String> mensaje = ArgumentCaptor.forClass(String.class);
        verify(rabbitTemplate).convertAndSend(
                org.mockito.ArgumentMatchers.eq("evaluaciones.generacion.typst"), mensaje.capture());
        assertThat(new ObjectMapper().readTree(mensaje.getValue()).get("jobId").asText())
                .isEqualTo(jobId);
    }

    @Test
    void solicitarGeneracion_bloqueaSiYaEstaImpresoYNoEsAdmin() {
        RolExamen rol = new RolExamen();
        rol.setId("ROL-IMP");
        rol.setEstadoFlujo(EstadoFlujo.IMPRESO);
        BancoPreguntas banco = new BancoPreguntas();
        banco.setId("BANCO-001");

        when(rolRepository.findById("ROL-IMP")).thenReturn(Optional.of(rol));
        when(bancoRepository.findById("BANCO-001")).thenReturn(Optional.of(banco));

        GeneracionTypstRequestDto request = new GeneracionTypstRequestDto();
        request.setRolExamenId("ROL-IMP");
        request.setBancoPreguntasId("BANCO-001");

        Authentication docAuth = new TestingAuthenticationToken("docente", "pass", "ROLE_DOCENTE");

        assertThatThrownBy(() -> service.solicitarGeneracion(request, docAuth))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("No se puede volver a generar el examen porque ya se encuentra en estado");
    }

    @Test
    void listarHistorial_retornaListaConVersionActivaDetectada() {
        String rolId = "ROL-HIST";
        RolExamen rol = new RolExamen();
        rol.setId(rolId);
        when(rolRepository.findById(rolId)).thenReturn(Optional.of(rol));

        GeneracionTypstJob job1 = new GeneracionTypstJob();
        job1.setJobId("JOB-1");
        job1.setRolExamenId(rolId);
        job1.setEstado("COMPLETADO");
        job1.setSolicitadoEn(LocalDateTime.now().minusHours(2));
        job1.setResultadoJson("{\"jobId\":\"JOB-1\",\"mapeos\":[{\"codigoEstudiante\":\"1001\",\"letraVariante\":\"A\"}]}");

        GeneracionTypstJob job2 = new GeneracionTypstJob();
        job2.setJobId("JOB-2");
        job2.setRolExamenId(rolId);
        job2.setEstado("COMPLETADO");
        job2.setSolicitadoEn(LocalDateTime.now().minusHours(1));
        job2.setResultadoJson("{\"jobId\":\"JOB-2\",\"mapeos\":[{\"codigoEstudiante\":\"1001\",\"letraVariante\":\"B\"}]}");

        when(generacionTypstJobRepository.findByRolExamenIdOrderBySolicitadoEnDesc(rolId))
                .thenReturn(List.of(job2, job1));

        MapeoEstudianteVariante mapeoActual = new MapeoEstudianteVariante();
        mapeoActual.setCodigoEstudiante("1001");
        mapeoActual.setLetraVariante("B");
        when(mapeoRepository.findByRolExamenId(rolId)).thenReturn(List.of(mapeoActual));

        List<GeneracionHistorialItemDto> historial = service.listarHistorial(rolId);

        assertThat(historial).hasSize(2);
        assertThat(historial.get(0).getJobId()).isEqualTo("JOB-2");
        assertThat(historial.get(0).isEsVersionActiva()).isTrue();
        assertThat(historial.get(1).getJobId()).isEqualTo("JOB-1");
        assertThat(historial.get(1).isEsVersionActiva()).isFalse();
    }

    @Test
    void restaurarGeneracion_restauraMapeosYRecalificaOmrSiAplica() {
        String rolId = "ROL-REST";
        String jobId = "JOB-OLD";
        RolExamen rol = new RolExamen();
        rol.setId(rolId);
        rol.setEstadoFlujo(EstadoFlujo.CALIFICADO);
        when(rolRepository.findById(rolId)).thenReturn(Optional.of(rol));

        GeneracionTypstJob job = new GeneracionTypstJob();
        job.setJobId(jobId);
        job.setRolExamenId(rolId);
        job.setEstado("COMPLETADO");
        job.setResultadoJson("{\"jobId\":\"JOB-OLD\",\"mapeos\":[{\"codigoEstudiante\":\"1001\",\"nombres\":\"JUAN PEREZ\",\"letraVariante\":\"D\"}]}");

        when(generacionTypstJobRepository.findById(jobId)).thenReturn(Optional.of(job));

        CalificacionOmr calificacion = new CalificacionOmr();
        calificacion.setRolExamenId(rolId);
        calificacion.setCodigoEstudiante("1001");
        calificacion.setLetraVariante("F");
        when(calificacionOmrRepository.findByRolExamenIdOrderByCodigoEstudianteAsc(rolId))
                .thenReturn(List.of(calificacion));

        Authentication adminAuth = new TestingAuthenticationToken("admin", "pass", "ROLE_ADMINISTRADOR_SISTEMA");

        RestaurarGeneracionResponseDto res = service.restaurarGeneracion(rolId, jobId, adminAuth, "192.168.1.50");

        assertThat(res.getRolExamenId()).isEqualTo(rolId);
        assertThat(res.getJobIdRestaurado()).isEqualTo(jobId);
        assertThat(res.getTotalMapeosRestaurados()).isEqualTo(1);
        assertThat(res.getTotalCalificacionesRecalibradas()).isEqualTo(1);
        assertThat(calificacion.getLetraVariante()).isEqualTo("D");

        verify(mapeoRepository).deleteByRolExamenId(rolId);
        verify(mapeoRepository).save(any(MapeoEstudianteVariante.class));
        verify(calificacionOmrRepository).save(calificacion);
        verify(omrProcesamientoService).recalificarEvaluacion(eq(rolId), any(), eq(adminAuth), eq("192.168.1.50"));
        verify(auditoriaEvaluacionRepository).save(any(AuditoriaEvaluacion.class));
    }
}
