package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.PreparacionCartillasOmrResponseDto;
import com.xpertiflow.evaluaciones.api.dto.SincronizacionNominaResponseDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.StudentItemDto;
import com.xpertiflow.evaluaciones.config.AppProperties;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import com.xpertiflow.evaluaciones.domain.entity.CartillaOmr;
import com.xpertiflow.evaluaciones.domain.entity.ExamenVariante;
import com.xpertiflow.evaluaciones.domain.entity.MapeoEstudianteVariante;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.enums.TipoParcial;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.CalificacionOmrRepository;
import com.xpertiflow.evaluaciones.domain.repository.CartillaOmrRepository;
import com.xpertiflow.evaluaciones.domain.repository.ExamenVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.LoteCartillasOmrRepository;
import com.xpertiflow.evaluaciones.domain.repository.MapeoEstudianteVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class CartillaOmrServiceTest {

    private RolExamenRepository rolExamenRepository;
    private MapeoEstudianteVarianteRepository mapeoRepository;
    private ExamenVarianteRepository varianteRepository;
    private LoteCartillasOmrRepository loteRepository;
    private CartillaOmrRepository cartillaRepository;
    private CalificacionOmrRepository calificacionOmrRepository;
    private AuditoriaEvaluacionRepository auditoriaRepository;
    private CartillaOmrPdfService pdfService;
    private AppProperties appProperties;
    private UnitepcGatewayClient unitepcGatewayClient;
    private RolExamenService rolExamenService;

    private CartillaOmrService service;

    @BeforeEach
    void setUp() {
        rolExamenRepository = mock(RolExamenRepository.class);
        mapeoRepository = mock(MapeoEstudianteVarianteRepository.class);
        varianteRepository = mock(ExamenVarianteRepository.class);
        loteRepository = mock(LoteCartillasOmrRepository.class);
        cartillaRepository = mock(CartillaOmrRepository.class);
        calificacionOmrRepository = mock(CalificacionOmrRepository.class);
        auditoriaRepository = mock(AuditoriaEvaluacionRepository.class);
        pdfService = mock(CartillaOmrPdfService.class);
        appProperties = mock(AppProperties.class);
        unitepcGatewayClient = mock(UnitepcGatewayClient.class);
        rolExamenService = mock(RolExamenService.class);

        service = new CartillaOmrService(
                rolExamenRepository,
                mapeoRepository,
                varianteRepository,
                loteRepository,
                cartillaRepository,
                calificacionOmrRepository,
                auditoriaRepository,
                pdfService,
                appProperties,
                unitepcGatewayClient,
                rolExamenService
        );
    }

    private RolExamen crearRolExamen(String id, EstadoFlujo estado, int inscritos) {
        return RolExamen.builder()
                .id(id)
                .seaGroupId("GRP-123")
                .sedeNombre("COCHABAMBA (CBA)")
                .carreraNombre("INGENIERIA DE SISTEMAS")
                .materiaCodigo("SIS-114")
                .materiaNombre("ALGEBRA")
                .grupo("TA-01")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .estadoFlujo(estado)
                .estudiantesInscritosCount(inscritos)
                .fecha(LocalDate.of(2026, 9, 3))
                .fechaDisplay("03/09/2026")
                .build();
    }

    private StudentItemDto crearEstudiante(String codigo, String nombre) {
        StudentItemDto dto = new StudentItemDto();
        dto.setStudentCode(codigo);
        dto.setFullName(nombre);
        return dto;
    }

    @Test
    @DisplayName("Sincroniza nuevos estudiantes para un examen ya generado asignando variantes round-robin")
    void sincronizarNominaConNuevosEstudiantesEnExamenGenerado() {
        String rolId = "ROL-001";
        RolExamen rol = crearRolExamen(rolId, EstadoFlujo.GENERADO, 3);
        when(rolExamenRepository.findById(rolId)).thenReturn(Optional.of(rol));
        when(rolExamenService.resolverGrupoOficial(rol)).thenReturn("GRP-123");

        // 3 estudiantes existentes
        MapeoEstudianteVariante m1 = new MapeoEstudianteVariante();
        m1.setId(1L);
        m1.setRolExamenId(rolId);
        m1.setCodigoEstudiante("1001");
        m1.setNombres("JUAN PEREZ");
        m1.setLetraVariante("A");
        m1.setVarianteId("VAR-ROL-001-A");

        MapeoEstudianteVariante m2 = new MapeoEstudianteVariante();
        m2.setId(2L);
        m2.setRolExamenId(rolId);
        m2.setCodigoEstudiante("1002");
        m2.setNombres("MARIA LOPEZ");
        m2.setLetraVariante("B");
        m2.setVarianteId("VAR-ROL-001-B");

        MapeoEstudianteVariante m3 = new MapeoEstudianteVariante();
        m3.setId(3L);
        m3.setRolExamenId(rolId);
        m3.setCodigoEstudiante("1003");
        m3.setNombres("CARLOS GOMEZ");
        m3.setLetraVariante("A");
        m3.setVarianteId("VAR-ROL-001-A");

        List<MapeoEstudianteVariante> mapeosActuales = new ArrayList<>(List.of(m1, m2, m3));
        when(mapeoRepository.findByRolExamenId(rolId)).thenAnswer(inv -> new ArrayList<>(mapeosActuales));

        // Variantes disponibles: A y B
        ExamenVariante vA = new ExamenVariante();
        vA.setId("VAR-ROL-001-A");
        vA.setRolExamenId(rolId);
        vA.setLetraVariante("A");
        vA.setArchivoPdfPath("/storage/exam_A.pdf");

        ExamenVariante vB = new ExamenVariante();
        vB.setId("VAR-ROL-001-B");
        vB.setRolExamenId(rolId);
        vB.setLetraVariante("B");
        vB.setArchivoPdfPath("/storage/exam_B.pdf");

        when(varianteRepository.findByRolExamenId(rolId)).thenReturn(List.of(vA, vB));

        StudentItemDto s1 = crearEstudiante("1001", "JUAN PEREZ");
        StudentItemDto s2 = crearEstudiante("1002", "MARIA LOPEZ");
        StudentItemDto s3 = crearEstudiante("1003", "CARLOS GOMEZ");
        StudentItemDto s4 = crearEstudiante("1004", "ANA SUAREZ");
        StudentItemDto s5 = crearEstudiante("1005", "PEDRO ROJAS");

        when(unitepcGatewayClient.getStudentsByGroup("GRP-123")).thenReturn(List.of(s1, s2, s3, s4, s5));

        // Al guardar nuevos mapeos, los agregamos a la lista simulada
        when(mapeoRepository.save(any(MapeoEstudianteVariante.class))).thenAnswer(inv -> {
            MapeoEstudianteVariante guardado = inv.getArgument(0);
            mapeosActuales.add(guardado);
            return guardado;
        });

        // Ejecutar sincronización
        SincronizacionNominaResponseDto resultado = service.sincronizarNomina(rolId, "admin_user");

        // Validaciones
        assertNotNull(resultado);
        assertEquals(2, resultado.nuevosEstudiantes());
        assertTrue(resultado.codigosNuevos().contains("1004"));
        assertTrue(resultado.codigosNuevos().contains("1005"));
        assertEquals(5, rol.getEstudiantesInscritosCount());

        // Verificar que se guardaron 2 nuevos mapeos
        ArgumentCaptor<MapeoEstudianteVariante> mapeoCaptor = ArgumentCaptor.forClass(MapeoEstudianteVariante.class);
        verify(mapeoRepository, times(2)).save(mapeoCaptor.capture());

        List<MapeoEstudianteVariante> guardados = mapeoCaptor.getAllValues();
        assertEquals(2, guardados.size());

        MapeoEstudianteVariante guardado1 = guardados.get(0);
        assertEquals("1004", guardado1.getCodigoEstudiante());
        // Como había 2 en A y 1 en B, el nuevo estudiante debe asignarse a B para balancear
        assertEquals("B", guardado1.getLetraVariante());
        assertEquals("CTL-1004-B", guardado1.getHashControlSeguridad());
        assertEquals("/storage/exam_B.pdf", guardado1.getCuadernilloIndividualPdf());

        MapeoEstudianteVariante guardado2 = guardados.get(1);
        assertEquals("1005", guardado2.getCodigoEstudiante());
        // Ahora ambos tienen 2, entonces se asigna a A
        assertEquals("A", guardado2.getLetraVariante());
        assertEquals("CTL-1005-A", guardado2.getHashControlSeguridad());

        // Verificar auditoría
        verify(auditoriaRepository, atLeastOnce()).save(any(AuditoriaEvaluacion.class));
    }

    @Test
    @DisplayName("Sincroniza nómina cuando no hay nuevos estudiantes inscritos")
    void sincronizarNominaSinCambios() {
        String rolId = "ROL-002";
        RolExamen rol = crearRolExamen(rolId, EstadoFlujo.GENERADO, 2);
        when(rolExamenRepository.findById(rolId)).thenReturn(Optional.of(rol));
        when(rolExamenService.resolverGrupoOficial(rol)).thenReturn("GRP-123");

        MapeoEstudianteVariante m1 = new MapeoEstudianteVariante();
        m1.setId(1L);
        m1.setRolExamenId(rolId);
        m1.setCodigoEstudiante("1001");
        m1.setNombres("JUAN PEREZ");

        MapeoEstudianteVariante m2 = new MapeoEstudianteVariante();
        m2.setId(2L);
        m2.setRolExamenId(rolId);
        m2.setCodigoEstudiante("1002");
        m2.setNombres("MARIA LOPEZ");

        when(mapeoRepository.findByRolExamenId(rolId)).thenReturn(List.of(m1, m2));

        StudentItemDto s1 = crearEstudiante("1001", "JUAN PEREZ");
        StudentItemDto s2 = crearEstudiante("1002", "MARIA LOPEZ");
        when(unitepcGatewayClient.getStudentsByGroup("GRP-123")).thenReturn(List.of(s1, s2));

        SincronizacionNominaResponseDto resultado = service.sincronizarNomina(rolId, "admin_user");

        assertEquals(0, resultado.nuevosEstudiantes());
        assertTrue(resultado.codigosNuevos().isEmpty());
        verify(mapeoRepository, never()).save(any());
    }
}
