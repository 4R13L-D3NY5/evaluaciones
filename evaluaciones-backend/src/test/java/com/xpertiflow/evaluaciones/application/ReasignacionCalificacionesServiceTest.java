package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.gateway.StudentItemDto;
import com.xpertiflow.evaluaciones.api.dto.sincronizacion.*;
import com.xpertiflow.evaluaciones.domain.entity.*;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.enums.TipoParcial;
import com.xpertiflow.evaluaciones.domain.repository.*;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.math.BigDecimal;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReasignacionCalificacionesServiceTest {

    @Mock
    private RolExamenRepository rolExamenRepository;

    @Mock
    private CalificacionOmrRepository calificacionOmrRepository;

    @Mock
    private NotaDocenteRepository notaDocenteRepository;

    @Mock
    private MapeoEstudianteVarianteRepository mapeoRepository;

    @Mock
    private ExamenVarianteRepository varianteRepository;

    @Mock
    private AuditoriaEvaluacionRepository auditoriaRepository;

    @Mock
    private UnitepcGatewayClient unitepcGatewayClient;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ReasignacionCalificacionesService service;

    private RolExamen rolOrigen;
    private RolExamen rolDestino;

    @BeforeEach
    void setUp() {
        rolOrigen = RolExamen.builder()
                .sedeCodigo("GYA")
                .sedeNombre("GUAYARAMERIN")
                .carreraCodigo("MED")
                .carreraNombre("MEDICINA")
                .materiaCodigo("MED-101")
                .materiaNombre("INFORMATICA MEDICA")
                .grupo("TA-03")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .estadoFlujo(EstadoFlujo.CALIFICADO)
                .seaGroupId("GROUP-ORIGEN-TA03")
                .seaSyllabusCourseId("SYLLABUS-MED-101")
                .estudiantesInscritosCount(20)
                .sincronizadoSea(true)
                .build();
        rolOrigen.setId("ROL-ORIGEN-03");

        rolDestino = RolExamen.builder()
                .sedeCodigo("GYA")
                .sedeNombre("GUAYARAMERIN")
                .carreraCodigo("MED")
                .carreraNombre("MEDICINA")
                .materiaCodigo("MED-101")
                .materiaNombre("INFORMATICA MEDICA")
                .grupo("TA-07")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .estadoFlujo(EstadoFlujo.CALIFICADO)
                .seaGroupId("GROUP-DESTINO-TA07")
                .seaSyllabusCourseId("SYLLABUS-MED-101")
                .estudiantesInscritosCount(25)
                .sincronizadoSea(true)
                .build();
        rolDestino.setId("ROL-DESTINO-07");
    }

    private CalificacionOmr crearCalificacion(String rolId, String codigo, String nombre, BigDecimal nota100) {
        CalificacionOmr cal = new CalificacionOmr();
        cal.setRolExamenId(rolId);
        cal.setCodigoEstudiante(codigo);
        cal.setEstudianteNombreCompleto(nombre);
        cal.setNotaSobre100(nota100);
        cal.setNotaSobre60(nota100 != null ? nota100.multiply(new BigDecimal("0.6")) : null);
        cal.setLetraVariante("A");
        cal.setTotalReactivos(40);
        cal.setAciertos(24);
        cal.setFallos(16);
        cal.setBlancos(0);
        cal.setSincronizadoSea(true);
        return cal;
    }

    private void mockAuthAdmin() {
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("admin.evaluaciones");
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_ADMINISTRADOR_SISTEMA")))
                .when(authentication).getAuthorities();
    }

    @Test
    @DisplayName("Debe lanzar AccessDeniedException si el usuario no tiene permisos")
    void testValidarPermisos_denegado() {
        when(authentication.isAuthenticated()).thenReturn(true);
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_DOCENTE")))
                .when(authentication).getAuthorities();

        assertThrows(AccessDeniedException.class, () ->
                service.detectarDiscrepancias(List.of("ROL-ORIGEN-03"), authentication)
        );
    }

    @Test
    @DisplayName("Detectar discrepancias: estudiante sin discrepancia (mismo grupo en SEA)")
    void testDetectarDiscrepancias_sinDiscrepancia() {
        mockAuthAdmin();

        when(rolExamenRepository.findAllById(anyList())).thenReturn(List.of(rolOrigen));
        when(rolExamenRepository.findBySedeCodigoAndMateriaCodigoAndTipoParcialAndEstadoFlujoNot(
                anyString(), anyString(), any(), any()
        )).thenReturn(List.of(rolOrigen, rolDestino));

        StudentItemDto estudianteSea = new StudentItemDto();
        estudianteSea.setStudentCode("1200936");
        estudianteSea.setFullName("JENIFER TOME");
        when(unitepcGatewayClient.getStudentsByGroup("GROUP-ORIGEN-TA03")).thenReturn(List.of(estudianteSea));

        CalificacionOmr cal = crearCalificacion(rolOrigen.getId(), "1200936", "JENIFER TOME", new BigDecimal("85.00"));
        when(calificacionOmrRepository.findByRolExamenIdOrderByCodigoEstudianteAsc(rolOrigen.getId()))
                .thenReturn(List.of(cal));

        DiscrepanciaGrupoReporteDto reporte = service.detectarDiscrepancias(List.of(rolOrigen.getId()), authentication);

        assertNotNull(reporte);
        assertEquals(0, reporte.getTotalConDiscrepancia());
        assertEquals(0, reporte.getTotalListosParaTrasladar());
        assertTrue(reporte.getDiscrepancias().isEmpty());
    }

    @Test
    @DisplayName("Detectar discrepancias: estudiante LISTO_PARA_TRASLADAR a grupo paralelo")
    void testDetectarDiscrepancias_listoParaTrasladar() {
        mockAuthAdmin();

        when(rolExamenRepository.findAllById(anyList())).thenReturn(List.of(rolOrigen));
        when(rolExamenRepository.findBySedeCodigoAndMateriaCodigoAndTipoParcialAndEstadoFlujoNot(
                anyString(), anyString(), any(), any()
        )).thenReturn(List.of(rolOrigen, rolDestino));

        when(unitepcGatewayClient.getStudentsByGroup("GROUP-ORIGEN-TA03")).thenReturn(List.of());

        StudentItemDto estudianteSea = new StudentItemDto();
        estudianteSea.setStudentCode("1200936");
        estudianteSea.setFullName("JENIFER TOME DE SOUZA");
        when(unitepcGatewayClient.getStudentsByGroup("GROUP-DESTINO-TA07")).thenReturn(List.of(estudianteSea));

        CalificacionOmr calOrigen = crearCalificacion(rolOrigen.getId(), "1200936", "JENIFER TOME DE SOUZA", new BigDecimal("60.00"));
        when(calificacionOmrRepository.findByRolExamenIdOrderByCodigoEstudianteAsc(rolOrigen.getId()))
                .thenReturn(List.of(calOrigen));

        when(calificacionOmrRepository.findByRolExamenIdAndCodigoEstudiante(rolDestino.getId(), "1200936"))
                .thenReturn(Optional.empty());

        DiscrepanciaGrupoReporteDto reporte = service.detectarDiscrepancias(List.of(rolOrigen.getId()), authentication);

        assertNotNull(reporte);
        assertEquals(1, reporte.getTotalConDiscrepancia());
        assertEquals(1, reporte.getTotalListosParaTrasladar());
        assertEquals(0, reporte.getTotalConflictos());
        assertEquals(0, reporte.getTotalNoEncontradosEnSea());

        DiscrepanciaGrupoItemDto item = reporte.getDiscrepancias().get(0);
        assertEquals("1200936", item.getCodigoEstudiante());
        assertEquals("TA-03", item.getGrupoOrigen());
        assertEquals("TA-07", item.getGrupoDestino());
        assertEquals(rolDestino.getId(), item.getRolExamenDestinoId());
        assertEquals("LISTO_PARA_TRASLADAR", item.getEstadoDiscrepancia());
    }

    @Test
    @DisplayName("Detectar discrepancias: CONFLICTO cuando destino ya tiene calificación")
    void testDetectarDiscrepancias_conflictoDestino() {
        mockAuthAdmin();

        when(rolExamenRepository.findAllById(anyList())).thenReturn(List.of(rolOrigen));
        when(rolExamenRepository.findBySedeCodigoAndMateriaCodigoAndTipoParcialAndEstadoFlujoNot(
                anyString(), anyString(), any(), any()
        )).thenReturn(List.of(rolOrigen, rolDestino));

        when(unitepcGatewayClient.getStudentsByGroup("GROUP-ORIGEN-TA03")).thenReturn(List.of());

        StudentItemDto estudianteSea = new StudentItemDto();
        estudianteSea.setStudentCode("1200936");
        estudianteSea.setFullName("JENIFER TOME DE SOUZA");
        when(unitepcGatewayClient.getStudentsByGroup("GROUP-DESTINO-TA07")).thenReturn(List.of(estudianteSea));

        CalificacionOmr calOrigen = crearCalificacion(rolOrigen.getId(), "1200936", "JENIFER TOME DE SOUZA", new BigDecimal("60.00"));
        when(calificacionOmrRepository.findByRolExamenIdOrderByCodigoEstudianteAsc(rolOrigen.getId()))
                .thenReturn(List.of(calOrigen));

        CalificacionOmr calDestino = crearCalificacion(rolDestino.getId(), "1200936", "JENIFER TOME DE SOUZA", new BigDecimal("75.00"));
        when(calificacionOmrRepository.findByRolExamenIdAndCodigoEstudiante(rolDestino.getId(), "1200936"))
                .thenReturn(Optional.of(calDestino));

        DiscrepanciaGrupoReporteDto reporte = service.detectarDiscrepancias(List.of(rolOrigen.getId()), authentication);

        assertNotNull(reporte);
        assertEquals(1, reporte.getTotalConDiscrepancia());
        assertEquals(0, reporte.getTotalListosParaTrasladar());
        assertEquals(1, reporte.getTotalConflictos());

        DiscrepanciaGrupoItemDto item = reporte.getDiscrepancias().get(0);
        assertEquals("CONFLICTO_TIENE_NOTA_EN_DESTINO", item.getEstadoDiscrepancia());
    }

    @Test
    @DisplayName("Trasladar calificación OMR con éxito: mueve nota, balancea variante y limpia origen")
    void testTrasladarCalificaciones_exitosoOmr() {
        mockAuthAdmin();

        when(rolExamenRepository.findById(rolOrigen.getId())).thenReturn(Optional.of(rolOrigen));
        when(rolExamenRepository.findById(rolDestino.getId())).thenReturn(Optional.of(rolDestino));

        CalificacionOmr calOrigen = crearCalificacion(rolOrigen.getId(), "1200936", "JENIFER TOME DE SOUZA", new BigDecimal("60.00"));
        when(calificacionOmrRepository.findByRolExamenIdAndCodigoEstudiante(rolOrigen.getId(), "1200936"))
                .thenReturn(Optional.of(calOrigen));
        when(calificacionOmrRepository.findByRolExamenIdAndCodigoEstudiante(rolDestino.getId(), "1200936"))
                .thenReturn(Optional.empty());
        when(mapeoRepository.findByRolExamenIdAndCodigoEstudiante(rolDestino.getId(), "1200936"))
                .thenReturn(Optional.empty());

        ExamenVariante varA = new ExamenVariante();
        varA.setId("VAR-07-A");
        varA.setLetraVariante("A");
        when(varianteRepository.findByRolExamenId(rolDestino.getId())).thenReturn(List.of(varA));
        when(mapeoRepository.findByRolExamenId(rolDestino.getId())).thenReturn(List.of());

        MapeoEstudianteVariante mapeoOrigen = new MapeoEstudianteVariante();
        mapeoOrigen.setRolExamenId(rolOrigen.getId());
        mapeoOrigen.setCodigoEstudiante("1200936");
        when(mapeoRepository.findByRolExamenIdAndCodigoEstudiante(rolOrigen.getId(), "1200936"))
                .thenReturn(Optional.of(mapeoOrigen));

        TrasladoCalificacionesRequestDto request = TrasladoCalificacionesRequestDto.builder()
                .traslados(List.of(
                        TrasladoCalificacionItemRequestDto.builder()
                                .codigoEstudiante("1200936")
                                .rolExamenOrigenId(rolOrigen.getId())
                                .rolExamenDestinoId(rolDestino.getId())
                                .sobrescribirSiExiste(false)
                                .build()
                ))
                .build();

        TrasladoCalificacionesResultadoDto resultado = service.trasladarCalificaciones(request, authentication, "192.168.1.100");

        assertNotNull(resultado);
        assertEquals(1, resultado.getTotalExitosos());
        assertEquals(0, resultado.getTotalFallidos());

        assertEquals(rolDestino.getId(), calOrigen.getRolExamenId());
        assertFalse(calOrigen.getSincronizadoSea(), "Debe marcar sincronizadoSea = false para permitir reenvio");
        assertFalse(rolOrigen.getSincronizadoSea(), "Rol origen debe reiniciarse para re-sincronizar");
        assertFalse(rolDestino.getSincronizadoSea(), "Rol destino debe reiniciarse para re-sincronizar");

        verify(mapeoRepository).save(any(MapeoEstudianteVariante.class));
        verify(mapeoRepository).delete(mapeoOrigen);
        verify(auditoriaRepository, times(2)).save(any(AuditoriaEvaluacion.class));
    }

    @Test
    @DisplayName("Trasladar calificación: conflicto sin sobrescribir falla apropiadamente")
    void testTrasladarCalificaciones_conflictoSinSobrescribir() {
        mockAuthAdmin();

        when(rolExamenRepository.findById(rolOrigen.getId())).thenReturn(Optional.of(rolOrigen));
        when(rolExamenRepository.findById(rolDestino.getId())).thenReturn(Optional.of(rolDestino));

        CalificacionOmr calOrigen = crearCalificacion(rolOrigen.getId(), "1200936", "JENIFER TOME DE SOUZA", new BigDecimal("60.00"));
        when(calificacionOmrRepository.findByRolExamenIdAndCodigoEstudiante(rolOrigen.getId(), "1200936"))
                .thenReturn(Optional.of(calOrigen));

        CalificacionOmr calDestino = crearCalificacion(rolDestino.getId(), "1200936", "JENIFER TOME DE SOUZA", new BigDecimal("70.00"));
        when(calificacionOmrRepository.findByRolExamenIdAndCodigoEstudiante(rolDestino.getId(), "1200936"))
                .thenReturn(Optional.of(calDestino));

        TrasladoCalificacionesRequestDto request = TrasladoCalificacionesRequestDto.builder()
                .traslados(List.of(
                        TrasladoCalificacionItemRequestDto.builder()
                                .codigoEstudiante("1200936")
                                .rolExamenOrigenId(rolOrigen.getId())
                                .rolExamenDestinoId(rolDestino.getId())
                                .sobrescribirSiExiste(false)
                                .build()
                ))
                .build();

        TrasladoCalificacionesResultadoDto resultado = service.trasladarCalificaciones(request, authentication, "127.0.0.1");

        assertNotNull(resultado);
        assertEquals(0, resultado.getTotalExitosos());
        assertEquals(1, resultado.getTotalFallidos());
        assertTrue(resultado.getResultados().get(0).getMensaje().contains("confirmación para sobrescribir"));
    }
}
