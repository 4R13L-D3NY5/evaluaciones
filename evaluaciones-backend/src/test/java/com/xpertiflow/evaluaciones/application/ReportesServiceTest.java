package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.reportes.ReporteCalidadResumenDto;
import com.xpertiflow.evaluaciones.api.dto.reportes.ReporteCoberturaBancosResumenDto;
import com.xpertiflow.evaluaciones.api.dto.reportes.ReporteConsolidadoOmrResumenDto;
import com.xpertiflow.evaluaciones.domain.entity.*;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.enums.TipoParcial;
import com.xpertiflow.evaluaciones.domain.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyCollection;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportesServiceTest {

    @Mock
    private RolExamenRepository rolExamenRepository;

    @Mock
    private VerificacionExamenRepository verificacionExamenRepository;

    @Mock
    private HistorialVerificacionRepository historialVerificacionRepository;

    @Mock
    private BancoPreguntasRepository bancoPreguntasRepository;

    @Mock
    private CalificacionOmrRepository calificacionOmrRepository;

    private ReportesService service;

    @BeforeEach
    void setUp() {
        service = new ReportesService(
                rolExamenRepository,
                verificacionExamenRepository,
                historialVerificacionRepository,
                bancoPreguntasRepository,
                calificacionOmrRepository,
                new ObjectMapper()
        );
    }

    @Test
    @DisplayName("Reporte Calidad: clasifica estados de calidad retroactivamente y calcula KPIs correctamente")
    void testObtenerReporteCalidadClasificacionYKpis() {
        // 1. Rol Sin Banco
        RolExamen rolSinBanco = RolExamen.builder()
                .id("ROL-01")
                .sedeCodigo("CBBA")
                .sedeNombre("Cochabamba")
                .carreraCodigo("MED")
                .carreraNombre("Medicina")
                .materiaCodigo("MED-101")
                .materiaNombre("Anatomía I")
                .grupo("1")
                .docenteNombre("Dr. Juan Perez")
                .docenteCi("123456")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .fecha(LocalDate.now())
                .horario("08:00")
                .estadoFlujo(EstadoFlujo.PROGRAMADO)
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .version(1)
                .build();

        // 2. Rol Aprobado Directo (tiene banco, no tiene devoluciones, estado VALIDADO)
        RolExamen rolAprobadoDirecto = RolExamen.builder()
                .id("ROL-02")
                .sedeCodigo("CBBA")
                .sedeNombre("Cochabamba")
                .carreraCodigo("MED")
                .carreraNombre("Medicina")
                .materiaCodigo("MED-102")
                .materiaNombre("Histología")
                .grupo("1")
                .docenteNombre("Dra. Maria Gomez")
                .docenteCi("654321")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .fecha(LocalDate.now())
                .horario("10:00")
                .estadoFlujo(EstadoFlujo.VALIDADO)
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .version(1)
                .build();

        // 3. Rol Observado y Aprobado (tiene banco, tiene devoluciones, estado GENERADO)
        RolExamen rolObsAprobado = RolExamen.builder()
                .id("ROL-03")
                .sedeCodigo("CBBA")
                .sedeNombre("Cochabamba")
                .carreraCodigo("MED")
                .carreraNombre("Medicina")
                .materiaCodigo("MED-103")
                .materiaNombre("Fisiología")
                .grupo("1")
                .docenteNombre("Dr. Carlos Lopez")
                .docenteCi("789123")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .fecha(LocalDate.now())
                .horario("12:00")
                .estadoFlujo(EstadoFlujo.GENERADO)
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .version(1)
                .build();

        // 4. Rol Observado Pendiente (tiene banco, tiene devoluciones, estado DEVUELTO)
        RolExamen rolObsPendiente = RolExamen.builder()
                .id("ROL-04")
                .sedeCodigo("CBBA")
                .sedeNombre("Cochabamba")
                .carreraCodigo("MED")
                .carreraNombre("Medicina")
                .materiaCodigo("MED-104")
                .materiaNombre("Bioquímica")
                .grupo("1")
                .docenteNombre("Dra. Ana Rios")
                .docenteCi("321987")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .fecha(LocalDate.now())
                .horario("14:00")
                .estadoFlujo(EstadoFlujo.DEVUELTO)
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .version(1)
                .build();

        when(rolExamenRepository.findAll()).thenReturn(List.of(
                rolSinBanco, rolAprobadoDirecto, rolObsAprobado, rolObsPendiente
        ));

        // Bancos para ROL-02, ROL-03, ROL-04
        BancoPreguntas banco2 = new BancoPreguntas();
        banco2.setId("BANCO-02");
        banco2.setRolExamenId("ROL-02");
        banco2.setMateriaCodigo("MED-102");
        banco2.setMateriaNombre("Histología");
        banco2.setGrupo("1");
        banco2.setTipoParcial("1er Parcial");
        banco2.setDocenteAprobador("Dra. Maria Gomez");
        banco2.setFechaAprobacion(LocalDateTime.now().minusDays(2));

        BancoPreguntas banco3 = new BancoPreguntas();
        banco3.setId("BANCO-03");
        banco3.setRolExamenId("ROL-03");
        banco3.setMateriaCodigo("MED-103");
        banco3.setMateriaNombre("Fisiología");
        banco3.setGrupo("1");
        banco3.setTipoParcial("1er Parcial");
        banco3.setDocenteAprobador("Dr. Carlos Lopez");
        banco3.setFechaAprobacion(LocalDateTime.now().minusDays(1));

        BancoPreguntas banco4 = new BancoPreguntas();
        banco4.setId("BANCO-04");
        banco4.setRolExamenId("ROL-04");
        banco4.setMateriaCodigo("MED-104");
        banco4.setMateriaNombre("Bioquímica");
        banco4.setGrupo("1");
        banco4.setTipoParcial("1er Parcial");
        banco4.setDocenteAprobador("Dra. Ana Rios");
        banco4.setFechaAprobacion(LocalDateTime.now().minusDays(3));

        when(bancoPreguntasRepository.findByRolExamenIdIn(anyCollection()))
                .thenReturn(List.of(banco2, banco3, banco4));

        when(verificacionExamenRepository.findByRolExamenIdIn(anyCollection()))
                .thenReturn(Collections.emptyList());

        // Devoluciones en historial: para ROL-03 y ROL-04
        HistorialVerificacion hist3 = new HistorialVerificacion();
        hist3.setId(101L);
        hist3.setRolExamenId("ROL-03");
        hist3.setBancoPreguntasId("BANCO-03");
        hist3.setVerificadoPor("Lic. Verificador 1");
        hist3.setFechaDevolucion(LocalDateTime.now().minusDays(2));
        hist3.setObservacionesGenerales("Corregir enunciados de las preguntas 5 y 10");
        hist3.setObservacionesPreguntasJson("{\"5\":\"Falta imagen\",\"10\":\"Opción duplicada\"}");

        HistorialVerificacion hist4 = new HistorialVerificacion();
        hist4.setId(102L);
        hist4.setRolExamenId("ROL-04");
        hist4.setBancoPreguntasId("BANCO-04");
        hist4.setVerificadoPor("Lic. Verificador 2");
        hist4.setFechaDevolucion(LocalDateTime.now().minusDays(1));
        hist4.setObservacionesGenerales("Faltan preguntas de nivel difícil");
        hist4.setObservacionesPreguntasJson("{\"1\":\"Pregunta ambigua\"}");

        when(historialVerificacionRepository.findByRolExamenIdIn(anyCollection()))
                .thenReturn(List.of(hist3, hist4));

        // Ejecutar obtención sin filtros específicos
        ReporteCalidadResumenDto resumen = service.obtenerReporteCalidad(
                "CBBA", "MED", "1er Parcial", "TODOS", null
        );

        assertThat(resumen).isNotNull();
        assertThat(resumen.getTotalExamenes()).isEqualTo(4);
        assertThat(resumen.getSinBanco()).isEqualTo(1);
        assertThat(resumen.getAprobadosDirectos()).isEqualTo(1);
        assertThat(resumen.getObservadosYLuegoAprobados()).isEqualTo(1);
        assertThat(resumen.getObservadosPendientes()).isEqualTo(1);
        assertThat(resumen.getPendientesRevision()).isEqualTo(0);

        // Verificación de porcentajes con 1 decimal
        assertThat(resumen.getPorcentajeAprobadosDirectos()).isEqualTo(25.0);
        assertThat(resumen.getPorcentajeObservados()).isEqualTo(25.0);

        // Verificación de ítems mapeados
        assertThat(resumen.getItems()).hasSize(4);

        var itemSinBanco = resumen.getItems().stream().filter(i -> i.getRolExamenId().equals("ROL-01")).findFirst().orElseThrow();
        assertThat(itemSinBanco.getEstadoCalidad()).isEqualTo("SIN_BANCO");

        var itemAprobadoDirecto = resumen.getItems().stream().filter(i -> i.getRolExamenId().equals("ROL-02")).findFirst().orElseThrow();
        assertThat(itemAprobadoDirecto.getEstadoCalidad()).isEqualTo("APROBADO_DIRECTO");
        assertThat(itemAprobadoDirecto.getTotalObservaciones()).isEqualTo(0);

        var itemObsAprobado = resumen.getItems().stream().filter(i -> i.getRolExamenId().equals("ROL-03")).findFirst().orElseThrow();
        assertThat(itemObsAprobado.getEstadoCalidad()).isEqualTo("OBSERVADO_Y_APROBADO");
        assertThat(itemObsAprobado.getTotalObservaciones()).isEqualTo(1);
        assertThat(itemObsAprobado.getObservaciones()).hasSize(1);
        assertThat(itemObsAprobado.getObservaciones().get(0).getTotalPreguntasObservadas()).isEqualTo(2);

        var itemObsPendiente = resumen.getItems().stream().filter(i -> i.getRolExamenId().equals("ROL-04")).findFirst().orElseThrow();
        assertThat(itemObsPendiente.getEstadoCalidad()).isEqualTo("OBSERVADO_PENDIENTE");
        assertThat(itemObsPendiente.getTotalObservaciones()).isEqualTo(1);
    }

    @Test
    @DisplayName("Reporte Cobertura de Bancos: agrupa por carrera y calcula porcentaje de cobertura")
    void testObtenerCoberturaBancos() {
        RolExamen r1 = RolExamen.builder()
                .id("ROL-C1")
                .sedeCodigo("CBBA")
                .sedeNombre("Cochabamba")
                .carreraCodigo("MED")
                .carreraNombre("Medicina")
                .materiaCodigo("MED-101")
                .materiaNombre("Anatomía I")
                .grupo("1")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .fecha(LocalDate.now())
                .estadoFlujo(EstadoFlujo.PROGRAMADO)
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .version(1)
                .build();

        RolExamen r2 = RolExamen.builder()
                .id("ROL-C2")
                .sedeCodigo("CBBA")
                .sedeNombre("Cochabamba")
                .carreraCodigo("MED")
                .carreraNombre("Medicina")
                .materiaCodigo("MED-102")
                .materiaNombre("Histología")
                .grupo("1")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .fecha(LocalDate.now())
                .estadoFlujo(EstadoFlujo.VALIDADO)
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .version(1)
                .build();

        when(rolExamenRepository.findAll()).thenReturn(List.of(r1, r2));

        BancoPreguntas b2 = new BancoPreguntas();
        b2.setId("B-C2");
        b2.setRolExamenId("ROL-C2");
        b2.setTotalReactivos(60);
        b2.setFacilesCount(18);
        b2.setMediasCount(30);
        b2.setDificilesCount(12);
        b2.setEstado("VALIDADO");
        b2.setFechaAprobacion(LocalDateTime.now());

        when(bancoPreguntasRepository.findByRolExamenIdIn(anyCollection())).thenReturn(List.of(b2));

        ReporteCoberturaBancosResumenDto resultado = service.obtenerCoberturaBancos("CBBA", "MED", "1er Parcial");

        assertThat(resultado.getTotalMaterias()).isEqualTo(2);
        assertThat(resultado.getMateriasConBanco()).isEqualTo(1);
        assertThat(resultado.getMateriasSinBanco()).isEqualTo(1);
        assertThat(resultado.getPorcentajeCobertura()).isEqualTo(50.0);
        assertThat(resultado.getItems()).hasSize(2);
        assertThat(resultado.getCarreras()).hasSize(1);
        assertThat(resultado.getCarreras().get(0).getPorcentajeCobertura()).isEqualTo(50.0);
    }

    @Test
    @DisplayName("Reporte Consolidado OMR: calcula notas, aprobados, reprobados y promedios")
    void testObtenerConsolidadoOmr() {
        RolExamen rol = RolExamen.builder()
                .id("ROL-OMR-1")
                .sedeCodigo("CBBA")
                .sedeNombre("Cochabamba")
                .carreraCodigo("MED")
                .carreraNombre("Medicina")
                .materiaCodigo("MED-101")
                .materiaNombre("Anatomía I")
                .grupo("1")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .fecha(LocalDate.now())
                .estadoFlujo(EstadoFlujo.CALIFICADO)
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .estudiantesInscritosCount(3)
                .sincronizadoSea(true)
                .version(1)
                .build();

        when(rolExamenRepository.findAll()).thenReturn(List.of(rol));

        CalificacionOmr cal1 = new CalificacionOmr();
        cal1.setId(1L);
        cal1.setRolExamenId("ROL-OMR-1");
        cal1.setCodigoEstudiante("EST-01");
        cal1.setNotaSobre100(BigDecimal.valueOf(80.0));
        cal1.setEstadoCalificacion("APROBADO");

        CalificacionOmr cal2 = new CalificacionOmr();
        cal2.setId(2L);
        cal2.setRolExamenId("ROL-OMR-1");
        cal2.setCodigoEstudiante("EST-02");
        cal2.setNotaSobre100(BigDecimal.valueOf(40.0));
        cal2.setEstadoCalificacion("REPROBADO");

        when(calificacionOmrRepository.findByRolExamenIdIn(anyCollection())).thenReturn(List.of(cal1, cal2));

        ReporteConsolidadoOmrResumenDto resultado = service.obtenerConsolidadoOmr("CBBA", "MED", "1er Parcial");

        assertThat(resultado.getTotalExamenesCalificados()).isEqualTo(1);
        assertThat(resultado.getTotalInscritos()).isEqualTo(3);
        assertThat(resultado.getTotalCalificados()).isEqualTo(2);
        assertThat(resultado.getTotalAprobados()).isEqualTo(1);
        assertThat(resultado.getTotalReprobados()).isEqualTo(1);
        assertThat(resultado.getPromedioGeneral()).isEqualTo(60.0);
        assertThat(resultado.getPorcentajeAprobacionGeneral()).isEqualTo(50.0);

        var item = resultado.getItems().get(0);
        assertThat(item.getPromedioNota()).isEqualTo(60.0);
        assertThat(item.getPorcentajeAprobacion()).isEqualTo(50.0);
        assertThat(item.getEstadoSincronizacionSea()).isEqualTo("SINCRONIZADO");
    }
}
