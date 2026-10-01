package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.auditoria.AuditoriaEstudianteGlobalDto;
import com.xpertiflow.evaluaciones.api.dto.auditoria.AuditoriaTomaGrupoReporteDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.StudentItemDto;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import com.xpertiflow.evaluaciones.domain.entity.MapeoEstudianteVariante;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.MapeoEstudianteVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditoriaTomaGruposServiceTest {

    @Mock
    private UnitepcGatewayClient unitepcGatewayClient;

    @Mock
    private RolExamenRepository rolExamenRepository;

    @Mock
    private MapeoEstudianteVarianteRepository mapeoRepository;

    @Mock
    private AuditoriaEvaluacionRepository auditoriaRepository;

    @InjectMocks
    private AuditoriaTomaGruposService service;

    private static final ZoneId ZONA = ZoneId.of("America/La_Paz");

    @Test
    @DisplayName("Debe clasificar como REGULAR a estudiante inscrito antes de la generación y EXTEMPORÁNEO tras impresión")
    void testClasificacionForensePorGrupo() {
        String groupId = "GRP-MED-01";
        String rolId = "ROL-001";

        LocalDateTime genLdt = LocalDateTime.of(2026, 9, 2, 8, 0);
        LocalDateTime impLdt = LocalDateTime.of(2026, 9, 2, 9, 0);

        RolExamen rol = new RolExamen();
        rol.setId(rolId);
        rol.setSeaGroupId(groupId);
        rol.setGrupo("TA-01");
        rol.setMateriaNombre("HISTOLOGÍA HUMANA I");
        rol.setEstadoFlujo(EstadoFlujo.IMPRESO);
        rol.setFechaGeneracion(genLdt);

        when(rolExamenRepository.findTopBySeaGroupIdOrderByVersionDesc(groupId)).thenReturn(Optional.of(rol));

        AuditoriaEvaluacion audImp = AuditoriaEvaluacion.builder()
                .rolExamenId(rolId)
                .accion("IMPRESION_MARCAS_OMR")
                .fechaEvento(impLdt)
                .build();
        when(auditoriaRepository.findFirstByRolExamenIdAndAccionOrderByFechaEventoDesc(rolId, "IMPRESION_MARCAS_OMR"))
                .thenReturn(Optional.of(audImp));

        // Estudiante 1: Regular (inscrito días antes)
        StudentItemDto s1 = new StudentItemDto();
        s1.setStudentCode("11001");
        s1.setFullName("PEREZ JUAN");
        s1.setCourseState("CURSANDO");
        s1.setEnrollCreatedAt(OffsetDateTime.of(2026, 8, 25, 10, 0, 0, 0, ZONA.getRules().getOffset(genLdt)));

        // Estudiante 2: Extemporáneo (inscrito después de imprimir)
        StudentItemDto s2 = new StudentItemDto();
        s2.setStudentCode("11002");
        s2.setFullName("GOMEZ MARIA");
        s2.setCourseState("CURSANDO");
        s2.setEnrollCreatedAt(OffsetDateTime.of(2026, 9, 2, 10, 30, 0, 0, ZONA.getRules().getOffset(genLdt)));

        when(unitepcGatewayClient.getStudentsByGroup(groupId)).thenReturn(List.of(s1, s2));

        MapeoEstudianteVariante m1 = new MapeoEstudianteVariante();
        m1.setCodigoEstudiante("11001");
        m1.setLetraVariante("A");
        when(mapeoRepository.findByRolExamenId(rolId)).thenReturn(List.of(m1));

        AuditoriaTomaGrupoReporteDto reporte = service.obtenerAuditoriaPorGrupo(groupId);

        assertNotNull(reporte);
        assertEquals(2, reporte.getTotalEstudiantes());
        assertEquals(1, reporte.getTotalRegulares());
        assertEquals(1, reporte.getTotalExtemporaneos());

        // Verificamos el estudiante extemporáneo
        var estExt = reporte.getEstudiantes().stream().filter(e -> "11002".equals(e.getStudentCode())).findFirst().orElseThrow();
        assertEquals("EXTEMPORANEO_POST_IMPRESION", estExt.getEstadoForense());
        assertEquals("DANGER", estExt.getNivelAlerta());
        assertTrue(estExt.getMensajeForense().contains("DESPUÉS de imprimir cartillas"));

        // Verificamos el estudiante regular
        var estReg = reporte.getEstudiantes().stream().filter(e -> "11001".equals(e.getStudentCode())).findFirst().orElseThrow();
        assertEquals("REGULAR", estReg.getEstadoForense());
        assertEquals("SUCCESS", estReg.getNivelAlerta());
    }

    @Test
    @DisplayName("Debe buscar el historial global de todas las asignaturas inscritas de un estudiante")
    void testBuscarPorEstudiante() {
        String studentCode = "1601772";

        MapeoEstudianteVariante m1 = new MapeoEstudianteVariante();
        m1.setRolExamenId("ROL-ANAT");
        m1.setCodigoEstudiante(studentCode);
        m1.setNombres("SOLIS MOREIRA MATOS KIMBERLY");
        m1.setLetraVariante("A");
        m1.setSeaEnrollCreatedAt(OffsetDateTime.of(2026, 9, 14, 10, 20, 0, 0, ZoneId.of("-04:00").getRules().getOffset(LocalDateTime.now())));

        when(mapeoRepository.findByCodigoEstudianteOrderByCreadoEnDesc(studentCode)).thenReturn(List.of(m1));

        RolExamen rol = new RolExamen();
        rol.setId("ROL-ANAT");
        rol.setMateriaNombre("ANATOMÍA HUMANA I");
        rol.setGrupo("TA-01");
        rol.setFechaGeneracion(LocalDateTime.of(2026, 9, 2, 8, 0));
        when(rolExamenRepository.findById("ROL-ANAT")).thenReturn(Optional.of(rol));

        AuditoriaEstudianteGlobalDto global = service.buscarPorEstudiante(studentCode, "2-2026");

        assertNotNull(global);
        assertEquals(studentCode, global.getStudentCode());
        assertEquals("SOLIS MOREIRA MATOS KIMBERLY", global.getFullName());
        assertEquals(1, global.getTotalMateriasInscritas());
        assertEquals("TOMA_TARDIA", global.getMaterias().get(0).getEstadoForense());
    }

    @Test
    @DisplayName("Debe exportar un archivo Excel XLSX no vacío con la tabla forense")
    void testExportarExcel() throws IOException {
        String groupId = "GRP-01";
        RolExamen rol = new RolExamen();
        rol.setId("ROL-1");
        rol.setSeaGroupId(groupId);
        rol.setGrupo("TA-01");
        rol.setMateriaNombre("ANATOMÍA");

        when(rolExamenRepository.findTopBySeaGroupIdOrderByVersionDesc(groupId)).thenReturn(Optional.of(rol));
        when(unitepcGatewayClient.getStudentsByGroup(groupId)).thenReturn(List.of());

        byte[] bytes = service.exportarReporteExcel(groupId);

        assertNotNull(bytes);
        assertTrue(bytes.length > 100);
    }
}
