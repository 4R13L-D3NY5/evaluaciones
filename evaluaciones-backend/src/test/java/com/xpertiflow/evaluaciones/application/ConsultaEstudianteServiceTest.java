package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.consulta.*;
import com.xpertiflow.evaluaciones.domain.entity.*;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.enums.TipoParcial;
import com.xpertiflow.evaluaciones.domain.repository.*;
import com.xpertiflow.evaluaciones.security.BancoCifradoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ConsultaEstudianteServiceTest {

    private RolExamenRepository rolExamenRepository;
    private MapeoEstudianteVarianteRepository mapeoRepository;
    private CalificacionOmrRepository calificacionOmrRepository;
    private NotaDocenteRepository notaDocenteRepository;
    private IntentoExamenVirtualRepository intentoVirtualRepository;
    private SalaExamenVirtualRepository salaVirtualRepository;
    private ExamenVarianteRepository varianteRepository;
    private AnulacionPreguntaOmrRepository anulacionRepository;
    private PoliticaTiempoEvaluacionesService politicaTiempoService;
    private BancoCifradoService cifradoService;
    private ObjectMapper objectMapper;

    private ConsultaEstudianteService service;

    @BeforeEach
    void setUp() {
        rolExamenRepository = mock(RolExamenRepository.class);
        mapeoRepository = mock(MapeoEstudianteVarianteRepository.class);
        calificacionOmrRepository = mock(CalificacionOmrRepository.class);
        notaDocenteRepository = mock(NotaDocenteRepository.class);
        intentoVirtualRepository = mock(IntentoExamenVirtualRepository.class);
        salaVirtualRepository = mock(SalaExamenVirtualRepository.class);
        varianteRepository = mock(ExamenVarianteRepository.class);
        anulacionRepository = mock(AnulacionPreguntaOmrRepository.class);
        politicaTiempoService = mock(PoliticaTiempoEvaluacionesService.class);
        cifradoService = mock(BancoCifradoService.class);
        objectMapper = new ObjectMapper();

        service = new ConsultaEstudianteService(
                rolExamenRepository,
                mapeoRepository,
                calificacionOmrRepository,
                notaDocenteRepository,
                intentoVirtualRepository,
                salaVirtualRepository,
                varianteRepository,
                anulacionRepository,
                politicaTiempoService,
                cifradoService,
                objectMapper
        );
    }

    @Test
    void consultaEstudianteConCartilla_retornaMetricasYRetroalimentacion() {
        String matricula = "1500765";
        String rolId = "ROL-001";

        RolExamen rol = RolExamen.builder()
                .id(rolId)
                .seaGroupId("GRP-ENF-323")
                .materiaCodigo("ENF-323")
                .materiaNombre("TERAPIA INTENSIVA")
                .carreraNombre("ENFERMERÍA")
                .sedeNombre("COCHABAMBA")
                .grupo("TA-01")
                .docenteNombre("DRA. PAOLA LAYME")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .conCartilla(true)
                .estadoFlujo(EstadoFlujo.CALIFICADO)
                .fecha(LocalDate.of(2026, 9, 16))
                .horario("08:00 - 09:30")
                .build();

        MapeoEstudianteVariante mapeo = new MapeoEstudianteVariante();
        mapeo.setRolExamenId(rolId);
        mapeo.setCodigoEstudiante(matricula);
        mapeo.setNombres("MARIA ISABEL");
        mapeo.setApellidoPaterno("OLIVERA");
        mapeo.setApellidoMaterno("CONDORI");
        mapeo.setLetraVariante("A");
        mapeo.setEstadoAsistencia("PRESENTE");

        CalificacionOmr calificacion = new CalificacionOmr();
        calificacion.setRolExamenId(rolId);
        calificacion.setCodigoEstudiante(matricula);
        calificacion.setEstudianteNombreCompleto("OLIVERA CONDORI MARIA ISABEL");
        calificacion.setLetraVariante("A");
        calificacion.setTotalReactivos(30);
        calificacion.setAciertos(26);
        calificacion.setFallos(3);
        calificacion.setBlancos(1);
        calificacion.setDoblesMarcas(0);
        calificacion.setNotaSobre60(new BigDecimal("52.00"));
        calificacion.setNotaSobre100(new BigDecimal("86.67"));
        calificacion.setRespuestasDetectadasJson("{\"1\":\"A\",\"2\":\"B\",\"27\":\"-\"}");

        ExamenVariante variante = new ExamenVariante();
        variante.setId("VAR-A");
        variante.setRolExamenId(rolId);
        variante.setLetraVariante("A");
        variante.setPatronClavesJson("{\"1\":\"A\",\"2\":\"A\",\"27\":\"C\"}");

        when(rolExamenRepository.findById(rolId)).thenReturn(Optional.of(rol));
        when(mapeoRepository.findByRolExamenIdAndCodigoEstudiante(rolId, matricula)).thenReturn(Optional.of(mapeo));
        when(calificacionOmrRepository.findByRolExamenIdAndCodigoEstudiante(rolId, matricula)).thenReturn(Optional.of(calificacion));
        when(politicaTiempoService.esPatronLiberado(rol)).thenReturn(true);
        when(varianteRepository.findByRolExamenIdAndLetraVariante(rolId, "A")).thenReturn(Optional.of(variante));
        when(anulacionRepository.findByRolExamenIdAndLetraVarianteAndActivoTrueOrderByNumeroPreguntaAsc(rolId, "A")).thenReturn(Collections.emptyList());

        ConsultaEstudianteEvaluacionDto dto = service.consultarDetalleEvaluacionEstudiante(matricula, rolId);

        assertThat(dto).isNotNull();
        assertThat(dto.getCodigoEstudiante()).isEqualTo(matricula);
        assertThat(dto.getModalidad()).isEqualTo("PRESENCIAL_CARTILLA");
        assertThat(dto.getVariante()).isEqualTo("A");
        assertThat(dto.getNotaSobre60()).isEqualByComparingTo("52.00");
        assertThat(dto.getNotaSobre100()).isEqualByComparingTo("86.67");
        assertThat(dto.getAciertos()).isEqualTo(26);
        assertThat(dto.getFallos()).isEqualTo(3);
        assertThat(dto.getBlancos()).isEqualTo(1);
        assertThat(dto.getRetroalimentacion()).isNotNull();
        assertThat(dto.getRetroalimentacion().isPatronLiberado()).isTrue();
        assertThat(dto.getRetroalimentacion().getDetallePreguntas()).isNotEmpty();
        assertThat(dto.getRetroalimentacion().getDetallePreguntas().get(0).getEstado()).isEqualTo("CORRECTA");
        assertThat(dto.getRetroalimentacion().getDetallePreguntas().get(1).getEstado()).isEqualTo("INCORRECTA");
    }

    @Test
    void consultaEstudianteSinCartilla_omiteCamposDeBurbujasYRetroalimentacion() {
        String matricula = "1500765";
        String rolId = "ROL-002";

        RolExamen rol = RolExamen.builder()
                .id(rolId)
                .seaGroupId("GRP-MED-401")
                .materiaCodigo("MED-401")
                .materiaNombre("PEDIATRÍA PRÁCTICA")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .modalidad(ModalidadExamen.PRESENCIAL_SIN_CARTILLA)
                .conCartilla(false)
                .estadoFlujo(EstadoFlujo.CONFIRMADO)
                .fecha(LocalDate.of(2026, 9, 18))
                .build();

        NotaDocente nota = new NotaDocente();
        nota.setRolExamenId(rolId);
        nota.setCodigoEstudiante(matricula);
        nota.setEstudianteNombreCompleto("OLIVERA CONDORI MARIA ISABEL");
        nota.setNotaSobre60(new BigDecimal("54.00"));
        nota.setNotaSobre100(new BigDecimal("90.00"));

        when(rolExamenRepository.findById(rolId)).thenReturn(Optional.of(rol));
        when(notaDocenteRepository.findByRolExamenIdAndCodigoEstudiante(rolId, matricula)).thenReturn(Optional.of(nota));

        ConsultaEstudianteEvaluacionDto dto = service.consultarDetalleEvaluacionEstudiante(matricula, rolId);

        assertThat(dto).isNotNull();
        assertThat(dto.getModalidad()).isEqualTo("PRESENCIAL_SIN_CARTILLA");
        assertThat(dto.getNotaSobre60()).isEqualByComparingTo("54.00");
        assertThat(dto.getNotaSobre100()).isEqualByComparingTo("90.00");
        // Campos que NO deben existir en sin cartilla
        assertThat(dto.getVariante()).isNull();
        assertThat(dto.getTotalReactivos()).isNull();
        assertThat(dto.getAciertos()).isNull();
        assertThat(dto.getFallos()).isNull();
        assertThat(dto.getBlancos()).isNull();
        assertThat(dto.getRetroalimentacion()).isNull();
    }

    @Test
    void consultaGrupoNotas_retornaListaConsolidadaParaSisa() {
        String seaGroupId = "GRP-ENF-323";
        String rolId = "ROL-001";

        RolExamen rol = RolExamen.builder()
                .id(rolId)
                .seaGroupId(seaGroupId)
                .materiaCodigo("ENF-323")
                .materiaNombre("TERAPIA INTENSIVA")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .conCartilla(true)
                .estadoFlujo(EstadoFlujo.CALIFICADO)
                .build();

        MapeoEstudianteVariante m1 = new MapeoEstudianteVariante();
        m1.setRolExamenId(rolId);
        m1.setCodigoEstudiante("1500765");
        m1.setNombres("MARIA ISABEL");
        m1.setApellidoPaterno("OLIVERA");
        m1.setApellidoMaterno("CONDORI");
        m1.setLetraVariante("A");

        CalificacionOmr c1 = new CalificacionOmr();
        c1.setRolExamenId(rolId);
        c1.setCodigoEstudiante("1500765");
        c1.setEstudianteNombreCompleto("OLIVERA CONDORI MARIA ISABEL");
        c1.setLetraVariante("A");
        c1.setEstadoCalificacion("CALIFICADO");
        c1.setNotaSobre60(new BigDecimal("52.00"));
        c1.setNotaSobre100(new BigDecimal("86.67"));
        c1.setAciertos(26);
        c1.setFallos(3);
        c1.setBlancos(1);
        c1.setTotalReactivos(30);

        when(rolExamenRepository.findTopBySeaGroupIdOrderByVersionDesc(seaGroupId)).thenReturn(Optional.of(rol));
        when(mapeoRepository.findByRolExamenId(rolId)).thenReturn(List.of(m1));
        when(calificacionOmrRepository.findByRolExamenIdOrderByCodigoEstudianteAsc(rolId)).thenReturn(List.of(c1));

        ConsultaGrupoNotasResponseDto response = service.consultarNotasGrupo(seaGroupId, null);

        assertThat(response).isNotNull();
        assertThat(response.getGrupo().getSeaGroupId()).isEqualTo(seaGroupId);
        assertThat(response.getGrupo().getTotalInscritos()).isEqualTo(1);
        assertThat(response.getGrupo().getTotalEvaluados()).isEqualTo(1);
        assertThat(response.getEstudiantes()).hasSize(1);
        assertThat(response.getEstudiantes().get(0).getCodigoEstudiante()).isEqualTo("1500765");
        assertThat(response.getEstudiantes().get(0).getNotaSobre60()).isEqualByComparingTo("52.00");
    }
}
