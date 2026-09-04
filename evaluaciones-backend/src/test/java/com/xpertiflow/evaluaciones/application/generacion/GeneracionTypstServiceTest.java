package com.xpertiflow.evaluaciones.application.generacion;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionTypstRequestDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionTypstResultadoDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.StudentItemDto;
import com.xpertiflow.evaluaciones.application.RolExamenService;
import com.xpertiflow.evaluaciones.application.ConfiguracionEvaluacionesService;
import com.xpertiflow.evaluaciones.api.dto.ConfiguracionEvaluacionesDto;
import com.xpertiflow.evaluaciones.config.AppProperties;
import com.xpertiflow.evaluaciones.domain.entity.BancoPreguntas;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.repository.BancoPreguntasRepository;
import com.xpertiflow.evaluaciones.domain.repository.ExamenVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.GeneracionTypstJobRepository;
import com.xpertiflow.evaluaciones.domain.repository.MapeoEstudianteVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
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
                unitepcGatewayClient);
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
}
