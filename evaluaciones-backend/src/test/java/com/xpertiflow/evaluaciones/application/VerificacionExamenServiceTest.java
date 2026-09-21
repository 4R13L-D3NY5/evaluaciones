package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.domain.entity.BancoPreguntas;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.entity.VerificacionExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.enums.TipoParcial;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaVerificacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.BancoPreguntasRepository;
import com.xpertiflow.evaluaciones.domain.repository.DocumentoExamenSinCartillaRepository;
import com.xpertiflow.evaluaciones.domain.repository.HistorialVerificacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.ReactivoRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.domain.repository.VerificacionExamenRepository;
import com.xpertiflow.evaluaciones.security.BancoCifradoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VerificacionExamenServiceTest {

    @Mock private RolExamenRepository rolRepository;
    @Mock private BancoPreguntasRepository bancoRepository;
    @Mock private ReactivoRepository reactivoRepository;
    @Mock private VerificacionExamenRepository verificacionRepository;
    @Mock private HistorialVerificacionRepository historialRepository;
    @Mock private HistorialVerificacionService historialService;
    @Mock private AuditoriaVerificacionRepository auditoriaRepository;
    @Mock private BancoCifradoService cifradoService;
    @Mock private AccesoAcademicoService accesoAcademicoService;
    @Mock private VerificacionPoliticaService politicaService;
    @Mock private DocumentoExamenSinCartillaRepository documentoSinCartillaRepository;
    @Mock private com.xpertiflow.evaluaciones.application.generacion.GeneracionTypstService generacionService;
    @Mock private Authentication authentication;

    private VerificacionExamenService service;

    @BeforeEach
    void setUp() {
        service = new VerificacionExamenService(rolRepository, bancoRepository, reactivoRepository,
                verificacionRepository, historialRepository, historialService, auditoriaRepository,
                cifradoService, new ObjectMapper(), accesoAcademicoService, politicaService,
                documentoSinCartillaRepository, generacionService);
    }

    @Test
    void listarAprobadosIncluyeExamenAunqueElFlujoYaAvanzoYNoReiniciaLaVerificacion() {
        RolExamen rol = rolAvanzado();
        VerificacionExamen aprobacion = aprobacion("BANCO-1");
        BancoPreguntas banco = banco("BANCO-1", rol.getId());
        when(verificacionRepository.findByEstadoIgnoreCase("VERIFICADO")).thenReturn(List.of(aprobacion));
        when(rolRepository.findById(rol.getId())).thenReturn(Optional.of(rol));
        when(politicaService.aplica(rol)).thenReturn(true);
        when(accesoAcademicoService.puedeAcceder(rol, authentication)).thenReturn(true);
        when(bancoRepository.findTopByRolExamenIdOrderByFechaAprobacionDesc(rol.getId())).thenReturn(Optional.of(banco));

        var resultados = service.listar("FECHA_EXAMEN_DESC", null, null, null, null,
                "VERIFICADO", null, null, authentication);

        assertThat(resultados).hasSize(1);
        assertThat(resultados.get(0).getEstadoVerificacion()).isEqualTo("VERIFICADO");
        assertThat(resultados.get(0).getVerificadoPor()).isEqualTo("verificador");
        assertThat(resultados.get(0).getFechaVerificacion()).isEqualTo(aprobacion.getFechaVerificacion());
        verify(rolRepository, never()).findByEstadoFlujo(EstadoFlujo.VALIDADO);
        verify(verificacionRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void listarAprobadosOmiteUnaAprobacionSiElBancoActualYaNoEsElAprobado() {
        RolExamen rol = rolAvanzado();
        when(verificacionRepository.findByEstadoIgnoreCase("VERIFICADO")).thenReturn(List.of(aprobacion("BANCO-ANTERIOR")));
        when(rolRepository.findById(rol.getId())).thenReturn(Optional.of(rol));
        when(politicaService.aplica(rol)).thenReturn(true);
        when(accesoAcademicoService.puedeAcceder(rol, authentication)).thenReturn(true);
        when(bancoRepository.findTopByRolExamenIdOrderByFechaAprobacionDesc(rol.getId()))
                .thenReturn(Optional.of(banco("BANCO-NUEVO", rol.getId())));

        var resultados = service.listar("FECHA_EXAMEN_DESC", null, null, null, null,
                "VERIFICADO", null, null, authentication);

        assertThat(resultados).isEmpty();
    }

    @Test
    void obtenerDetalleIncluyeSedeImagenYMarcaLaClaveCorrectaAunqueNoEsteEnOpcionesJson() {
        RolExamen rol = rolAvanzado();
        rol.setEstadoFlujo(EstadoFlujo.VALIDADO);
        BancoPreguntas banco = banco("BANCO-1", rol.getId());
        VerificacionExamen verificacion = new VerificacionExamen();
        verificacion.setRolExamenId(rol.getId());
        verificacion.setBancoPreguntasId(banco.getId());
        verificacion.setEstado("PENDIENTE");

        when(rolRepository.findById(rol.getId())).thenReturn(Optional.of(rol));
        when(politicaService.aplica(rol)).thenReturn(true);
        when(accesoAcademicoService.puedeAcceder(rol, authentication)).thenReturn(true);
        when(bancoRepository.findTopByRolExamenIdOrderByFechaAprobacionDesc(rol.getId()))
                .thenReturn(Optional.of(banco));
        when(verificacionRepository.findByRolExamenId(rol.getId())).thenReturn(Optional.of(verificacion));
        when(historialRepository.findByRolExamenIdOrderByFechaDevolucionDescIdDesc(rol.getId()))
                .thenReturn(List.of());
        when(cifradoService.descifrarTexto(org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.eq("banco:BANCO-1:rol:ROL-1")))
                .thenReturn("[{\"numeroOrden\":1,\"tipoReactivo\":\"SELECCION_MEJOR_RESPUESTA\","
                        + "\"dificultad\":\"MEDIO\",\"enunciado\":\"Factor $(P/F)$\","
                        + "\"imagenBase64\":\"data:image/png;base64,aGVsbG8=\","
                        + "\"opcionesJson\":\"[{\\\"letra\\\":\\\"A\\\",\\\"texto\\\":\\\"Distractor\\\"},"
                        + "{\\\"letra\\\":\\\"B\\\",\\\"texto\\\":\\\"Correcta\\\"}]\","
                        + "\"respuestaCorrecta\":\"B\"}]");

        var detalle = service.obtenerDetalle(rol.getId(), authentication);

        assertThat(detalle.getSedeNombre()).isEqualTo("Cochabamba");
        assertThat(detalle.getPreguntas()).singleElement().satisfies(pregunta -> {
            assertThat(pregunta.getEnunciado()).contains("$(P/F)$");
            assertThat(pregunta.getImagenBase64()).startsWith("data:image/png;base64,");
            assertThat(pregunta.getOpciones()).extracting("correcta").containsExactly(false, true);
        });
    }

    @Test
    void obtenerDetalleNoAsignaNumeroDePreguntaATroncoDeEmparejamientoYNumeraCorrelativoSubitems() {
        RolExamen rol = rolAvanzado();
        rol.setEstadoFlujo(EstadoFlujo.VALIDADO);
        BancoPreguntas banco = banco("BANCO-1", rol.getId());
        VerificacionExamen verificacion = new VerificacionExamen();
        verificacion.setRolExamenId(rol.getId());
        verificacion.setBancoPreguntasId(banco.getId());
        verificacion.setEstado("PENDIENTE");

        when(rolRepository.findById(rol.getId())).thenReturn(Optional.of(rol));
        when(politicaService.aplica(rol)).thenReturn(true);
        when(accesoAcademicoService.puedeAcceder(rol, authentication)).thenReturn(true);
        when(bancoRepository.findTopByRolExamenIdOrderByFechaAprobacionDesc(rol.getId()))
                .thenReturn(Optional.of(banco));
        when(verificacionRepository.findByRolExamenId(rol.getId())).thenReturn(Optional.of(verificacion));
        when(historialRepository.findByRolExamenIdOrderByFechaDevolucionDescIdDesc(rol.getId()))
                .thenReturn(List.of());

        when(cifradoService.descifrarTexto(org.mockito.ArgumentMatchers.any(),
                org.mockito.ArgumentMatchers.eq("banco:BANCO-1:rol:ROL-1")))
                .thenReturn("["
                        + "{\"numeroOrden\":1,\"tipoReactivo\":\"EMPAREJAMIENTO_TRONCO\","
                        + "\"dificultad\":null,\"enunciado\":\"Instruccion emparejamiento\","
                        + "\"opcionesJson\":\"[{\\\"letra\\\":\\\"A\\\",\\\"texto\\\":\\\"Concepto A\\\"},{\\\"letra\\\":\\\"B\\\",\\\"texto\\\":\\\"Concepto B\\\"}]\","
                        + "\"respuestaCorrecta\":\"A\"},"
                        + "{\"numeroOrden\":2,\"tipoReactivo\":\"OPCION_EMPAREJAMIENTO\","
                        + "\"dificultad\":\"FACIL\",\"enunciado\":\"Definicion 1\","
                        + "\"opcionesJson\":\"[]\","
                        + "\"respuestaCorrecta\":\"A\"},"
                        + "{\"numeroOrden\":3,\"tipoReactivo\":\"OPCION_EMPAREJAMIENTO\","
                        + "\"dificultad\":\"MEDIO\",\"enunciado\":\"Definicion 2\","
                        + "\"opcionesJson\":\"[]\","
                        + "\"respuestaCorrecta\":\"B\"}"
                        + "]");

        var detalle = service.obtenerDetalle(rol.getId(), authentication);

        assertThat(detalle.getEstadoVerificacion()).isEqualTo("VALIDADO");
        assertThat(detalle.getPreguntas()).hasSize(3);

        var tronco = detalle.getPreguntas().get(0);
        assertThat(tronco.getTipoReactivo()).isEqualTo("EMPAREJAMIENTO_TRONCO");
        assertThat(tronco.getNumeroPregunta()).isNull();
        assertThat(tronco.getEsEnunciadoContexto()).isTrue();
        assertThat(tronco.getDificultad()).isNull();
        assertThat(tronco.getRespuestaCorrecta()).isNull();

        var sub1 = detalle.getPreguntas().get(1);
        assertThat(sub1.getTipoReactivo()).isEqualTo("OPCION_EMPAREJAMIENTO");
        assertThat(sub1.getNumeroPregunta()).isEqualTo(1);
        assertThat(sub1.getEsEnunciadoContexto()).isFalse();
        assertThat(sub1.getRespuestaCorrecta()).isEqualTo("A");

        var sub2 = detalle.getPreguntas().get(2);
        assertThat(sub2.getTipoReactivo()).isEqualTo("OPCION_EMPAREJAMIENTO");
        assertThat(sub2.getNumeroPregunta()).isEqualTo(2);
        assertThat(sub2.getEsEnunciadoContexto()).isFalse();
        assertThat(sub2.getRespuestaCorrecta()).isEqualTo("B");
    }

    @Test
    void listarOmiteExamenDevueltoYRetornaSoloValidados() {
        RolExamen rolDevuelto = rolAvanzado();
        rolDevuelto.setId("ROL-DEV");
        rolDevuelto.setEstadoFlujo(EstadoFlujo.VALIDADO);
        BancoPreguntas bancoDev = banco("BANCO-DEV", "ROL-DEV");
        VerificacionExamen verDev = new VerificacionExamen();
        verDev.setRolExamenId("ROL-DEV");
        verDev.setBancoPreguntasId("BANCO-DEV");
        verDev.setEstado("DEVUELTO");

        RolExamen rolValido = rolAvanzado();
        rolValido.setId("ROL-OK");
        rolValido.setEstadoFlujo(EstadoFlujo.VALIDADO);
        BancoPreguntas bancoOk = banco("BANCO-OK", "ROL-OK");
        VerificacionExamen verOk = new VerificacionExamen();
        verOk.setRolExamenId("ROL-OK");
        verOk.setBancoPreguntasId("BANCO-OK");
        verOk.setEstado("PENDIENTE");

        when(rolRepository.findByEstadoFlujo(EstadoFlujo.VALIDADO)).thenReturn(List.of(rolDevuelto, rolValido));
        when(politicaService.aplica(org.mockito.ArgumentMatchers.any())).thenReturn(true);
        when(accesoAcademicoService.puedeAcceder(org.mockito.ArgumentMatchers.any(), org.mockito.ArgumentMatchers.eq(authentication))).thenReturn(true);
        when(bancoRepository.findTopByRolExamenIdOrderByFechaAprobacionDesc("ROL-DEV")).thenReturn(Optional.of(bancoDev));
        when(bancoRepository.findTopByRolExamenIdOrderByFechaAprobacionDesc("ROL-OK")).thenReturn(Optional.of(bancoOk));
        when(verificacionRepository.findByRolExamenId("ROL-DEV")).thenReturn(Optional.of(verDev));
        when(verificacionRepository.findByRolExamenId("ROL-OK")).thenReturn(Optional.of(verOk));

        var resultados = service.listar("FECHA_EXAMEN_DESC", null, null, null, null,
                null, null, null, authentication);

        assertThat(resultados).hasSize(1);
        assertThat(resultados.get(0).getRolExamenId()).isEqualTo("ROL-OK");
        assertThat(resultados.get(0).getEstadoVerificacion()).isEqualTo("VALIDADO");
    }

    @Test
    void listarSinBancoRetornaExamenesProgramadosSinBancoValidado() {
        RolExamen rolProgramado = rolAvanzado();
        rolProgramado.setId("ROL-SIN-BANCO");
        rolProgramado.setEstadoFlujo(EstadoFlujo.PROGRAMADO);
        rolProgramado.setFecha(LocalDate.of(2026, 9, 20));
        rolProgramado.setAula("Aula 101");
        rolProgramado.setCampus("Colonial");
        when(rolRepository.findByEstadoFlujo(EstadoFlujo.PROGRAMADO)).thenReturn(List.of(rolProgramado));
        when(politicaService.aplica(rolProgramado)).thenReturn(true);
        when(accesoAcademicoService.puedeAcceder(rolProgramado, authentication)).thenReturn(true);
        when(bancoRepository.findTopByRolExamenIdOrderByFechaAprobacionDesc("ROL-SIN-BANCO")).thenReturn(Optional.empty());

        var resultados = service.listarSinBanco("FECHA_EXAMEN_ASC", null, null, null, null, null, null, authentication);

        assertThat(resultados).hasSize(1);
        assertThat(resultados.get(0).getRolExamenId()).isEqualTo("ROL-SIN-BANCO");
        assertThat(resultados.get(0).getEstadoVerificacion()).isEqualTo("SIN_BANCO");
        assertThat(resultados.get(0).getDocenteNombre()).isEqualTo(rolProgramado.getDocenteNombre());
        assertThat(resultados.get(0).getAula()).isEqualTo("Aula 101");
        assertThat(resultados.get(0).getCampus()).isEqualTo("Colonial");
    }

    @Test
    void listarSinBancoIncluyeExamenSinCartillaProgramadoSinDocumento() {
        RolExamen rolSinCartilla = rolAvanzado();
        rolSinCartilla.setId("ROL-SIN-CARTILLA");
        rolSinCartilla.setModalidad(ModalidadExamen.PRESENCIAL_SIN_CARTILLA);
        rolSinCartilla.setEstadoFlujo(EstadoFlujo.PROGRAMADO);
        rolSinCartilla.setFecha(LocalDate.of(2026, 9, 20));
        rolSinCartilla.setAula("Aula 202");
        rolSinCartilla.setCampus("Sarmiento");
        when(rolRepository.findByEstadoFlujo(EstadoFlujo.PROGRAMADO)).thenReturn(List.of(rolSinCartilla));
        when(accesoAcademicoService.puedeAcceder(rolSinCartilla, authentication)).thenReturn(true);
        when(documentoSinCartillaRepository.findByRolExamenId("ROL-SIN-CARTILLA")).thenReturn(Optional.empty());

        var resultados = service.listarSinBanco("FECHA_EXAMEN_ASC", null, null, null, null, null, null, authentication);

        assertThat(resultados).hasSize(1);
        assertThat(resultados.get(0).getRolExamenId()).isEqualTo("ROL-SIN-CARTILLA");
        assertThat(resultados.get(0).getEstadoVerificacion()).isEqualTo("SIN_DOCUMENTO");
        assertThat(resultados.get(0).getModalidad()).isEqualTo("PRESENCIAL_SIN_CARTILLA");
        assertThat(resultados.get(0).getObservacionesGenerales()).contains("sin documento Word");
        assertThat(resultados.get(0).getAula()).isEqualTo("Aula 202");
        assertThat(resultados.get(0).getCampus()).isEqualTo("Sarmiento");
    }

    private RolExamen rolAvanzado() {
        return RolExamen.builder()
                .id("ROL-1")
                .sedeCodigo("CB")
                .sedeNombre("Cochabamba")
                .carreraCodigo("CAR-1")
                .carreraNombre("Carrera")
                .materiaCodigo("MAT-1")
                .materiaNombre("Materia")
                .grupo("A")
                .docenteNombre("Docente")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .version(1)
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .estadoFlujo(EstadoFlujo.GENERADO)
                .fecha(LocalDate.of(2026, 9, 14))
                .horario("08:00 - 10:00")
                .build();
    }

    private VerificacionExamen aprobacion(String bancoId) {
        VerificacionExamen verificacion = new VerificacionExamen();
        verificacion.setRolExamenId("ROL-1");
        verificacion.setBancoPreguntasId(bancoId);
        verificacion.setEstado("VERIFICADO");
        verificacion.setVerificadoPor("verificador");
        verificacion.setFechaVerificacion(LocalDateTime.of(2026, 9, 14, 10, 30));
        return verificacion;
    }

    private BancoPreguntas banco(String id, String rolId) {
        BancoPreguntas banco = new BancoPreguntas();
        banco.setId(id);
        banco.setRolExamenId(rolId);
        banco.setEstado("VALIDADO");
        banco.setFechaAprobacion(LocalDateTime.of(2026, 9, 14, 9, 0));
        return banco;
    }
}
