package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.mapper.RolExamenMapper;
import com.xpertiflow.evaluaciones.api.dto.RestablecerRolRequestDto;
import com.xpertiflow.evaluaciones.api.dto.TransicionEstadoRequestDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.GroupItemDto;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import com.xpertiflow.evaluaciones.domain.repository.DocumentoExamenSinCartillaRepository;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.BancoPreguntasRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RolExamenServiceTest {

    @Mock
    private RolExamenRepository rolExamenRepository;
    @Mock
    private AuditoriaEvaluacionRepository auditoriaRepository;
    @Mock
    private BancoPreguntasRepository bancoPreguntasRepository;
    @Mock
    private DocumentoExamenSinCartillaRepository documentoSinCartillaRepository;
    @Mock
    private RolExamenMapper mapper;
    @Mock
    private UnitepcGatewayClient unitepcGatewayClient;
    @Mock
    private AccesoAcademicoService accesoAcademicoService;

    private RolExamenService service;

    @BeforeEach
    void setUp() {
        service = new RolExamenService(rolExamenRepository, auditoriaRepository, bancoPreguntasRepository, documentoSinCartillaRepository, mapper, unitepcGatewayClient, accesoAcademicoService);
    }

    @Test
    void validarPorBancoActualizaElRolYRegistraAuditoria() {
        RolExamen rol = RolExamen.builder()
                .id("ROL-TEST-001")
                .docenteNombre("Docente Oficial")
                .estadoFlujo(EstadoFlujo.PROGRAMADO)
                .build();
        when(rolExamenRepository.findById(rol.getId())).thenReturn(Optional.of(rol));
        when(rolExamenRepository.save(rol)).thenReturn(rol);

        RolExamen resultado = service.validarPorBanco(rol.getId(), "hash-oficial", "Docente Oficial");

        assertThat(resultado.getEstadoFlujo()).isEqualTo(EstadoFlujo.VALIDADO);
        assertThat(resultado.getHashEncriptacion()).isEqualTo("hash-oficial");
        assertThat(resultado.getFechaValidacion()).isNotNull();

        ArgumentCaptor<AuditoriaEvaluacion> auditoria = ArgumentCaptor.forClass(AuditoriaEvaluacion.class);
        verify(auditoriaRepository).save(auditoria.capture());
        assertThat(auditoria.getValue().getRolExamen()).isSameAs(rol);
        assertThat(auditoria.getValue().getEtapaOrigen()).isEqualTo("PROGRAMADO");
        assertThat(auditoria.getValue().getEtapaDestino()).isEqualTo("VALIDADO");
        assertThat(auditoria.getValue().getAccion()).isEqualTo("VALIDACION_BANCO_PREGUNTAS");
        assertThat(auditoria.getValue().getUsuario()).isEqualTo("Docente Oficial");
    }

    @Test
    void validarPorBancoRechazaUnRolQueYaAvanzoEnElFlujo() {
        RolExamen rol = RolExamen.builder()
                .id("ROL-TEST-002")
                .estadoFlujo(EstadoFlujo.GENERADO)
                .build();
        when(rolExamenRepository.findById(rol.getId())).thenReturn(Optional.of(rol));

        assertThatThrownBy(() -> service.validarPorBanco(rol.getId(), "hash", "Docente"))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("GENERADO");

        verify(rolExamenRepository, never()).save(rol);
        verify(auditoriaRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void restablecerAValidadoRegresaUnEstadoPosteriorYRegistraMotivo() {
        RolExamen rol = RolExamen.builder()
                .id("ROL-TEST-003")
                .estadoFlujo(EstadoFlujo.GENERADO)
                .build();
        when(rolExamenRepository.findById(rol.getId())).thenReturn(Optional.of(rol));
        when(rolExamenRepository.save(rol)).thenReturn(rol);
        when(mapper.toResponseDto(rol)).thenReturn(null);

        service.restablecerAValidado(rol.getId(), RestablecerRolRequestDto.builder()
                .motivo("Corrección de la parametrización del banco")
                .usuario("Administrador QA")
                .ipOrigen("10.0.0.5")
                .build());

        assertThat(rol.getEstadoFlujo()).isEqualTo(EstadoFlujo.VALIDADO);
        ArgumentCaptor<AuditoriaEvaluacion> auditoria = ArgumentCaptor.forClass(AuditoriaEvaluacion.class);
        verify(auditoriaRepository).save(auditoria.capture());
        assertThat(auditoria.getValue().getEtapaOrigen()).isEqualTo("GENERADO");
        assertThat(auditoria.getValue().getEtapaDestino()).isEqualTo("VALIDADO");
        assertThat(auditoria.getValue().getAccion()).isEqualTo("RESTABLECIMIENTO_A_VALIDADO");
        assertThat(auditoria.getValue().getDetallesJson()).contains("Corrección de la parametrización del banco");
    }

    @Test
    void restablecerAValidadoRechazaEstadosNoPosteriores() {
        RolExamen rol = RolExamen.builder()
                .id("ROL-TEST-004")
                .estadoFlujo(EstadoFlujo.VALIDADO)
                .build();
        when(rolExamenRepository.findById(rol.getId())).thenReturn(Optional.of(rol));

        assertThatThrownBy(() -> service.restablecerAValidado(rol.getId(), RestablecerRolRequestDto.builder()
                .motivo("No debe ejecutarse")
                .build()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("posterior a VALIDADO");

        verify(rolExamenRepository, never()).save(rol);
        verify(auditoriaRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void restablecerAValidadoExigeMotivo() {
        RolExamen rol = RolExamen.builder()
                .id("ROL-TEST-005")
                .estadoFlujo(EstadoFlujo.IMPRESO)
                .build();
        when(rolExamenRepository.findById(rol.getId())).thenReturn(Optional.of(rol));

        assertThatThrownBy(() -> service.restablecerAValidado(rol.getId(), RestablecerRolRequestDto.builder()
                .motivo("  ")
                .build()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("motivo");

        verify(rolExamenRepository, never()).save(rol);
        verify(auditoriaRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void noPermiteImprimirSinCartillaSiNoTieneDocumentoCargado() {
        RolExamen rol = RolExamen.builder()
                .id("ROL-TEST-SIN-CARTILLA-001")
                .modalidad(ModalidadExamen.PRESENCIAL_SIN_CARTILLA)
                .estadoFlujo(EstadoFlujo.VALIDADO)
                .build();
        when(rolExamenRepository.findById(rol.getId())).thenReturn(Optional.of(rol));
        when(documentoSinCartillaRepository.findByRolExamenId(rol.getId())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.transicionarEstado(rol.getId(), TransicionEstadoRequestDto.builder()
                .nuevoEstado(EstadoFlujo.IMPRESO)
                .usuario("ADMIN_EVALUACIONES")
                .build()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Primero cargue el archivo del examen sin cartilla");

        assertThat(rol.getEstadoFlujo()).isEqualTo(EstadoFlujo.VALIDADO);
        verify(rolExamenRepository, never()).save(rol);
        verify(auditoriaRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void alDevolverUnaCartillaPasaAutomaticamenteAPendienteDeCalificacion() {
        RolExamen rol = RolExamen.builder()
                .id("ROL-TEST-CARTILLA-001")
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .estadoFlujo(EstadoFlujo.ENTREGADO)
                .build();
        when(rolExamenRepository.findById(rol.getId())).thenReturn(Optional.of(rol));
        when(rolExamenRepository.save(rol)).thenReturn(rol);
        when(mapper.toResponseDto(rol)).thenReturn(null);

        service.transicionarEstado(rol.getId(), TransicionEstadoRequestDto.builder()
                .nuevoEstado(EstadoFlujo.DEVUELTO)
                .usuario("PERSONAL_EVALUACIONES")
                .ipOrigen("10.0.0.10")
                .build());

        assertThat(rol.getEstadoFlujo()).isEqualTo(EstadoFlujo.PENDIENTE_NOTAS);
        verify(rolExamenRepository, org.mockito.Mockito.times(2)).save(rol);
        ArgumentCaptor<AuditoriaEvaluacion> auditorias = ArgumentCaptor.forClass(AuditoriaEvaluacion.class);
        verify(auditoriaRepository, org.mockito.Mockito.times(2)).save(auditorias.capture());
        assertThat(auditorias.getAllValues().get(0).getEtapaOrigen()).isEqualTo("ENTREGADO");
        assertThat(auditorias.getAllValues().get(0).getEtapaDestino()).isEqualTo("DEVUELTO");
        assertThat(auditorias.getAllValues().get(1).getEtapaOrigen()).isEqualTo("DEVUELTO");
        assertThat(auditorias.getAllValues().get(1).getEtapaDestino()).isEqualTo("PENDIENTE_NOTAS");
        assertThat(auditorias.getAllValues().get(1).getAccion()).isEqualTo("INICIO_CALIFICACION_OMR");
    }

    @Test
    void noPermiteEntregarUnaCartillaSinConfirmarMarcasYLista() {
        RolExamen rol = RolExamen.builder()
                .id("ROL-TEST-CARTILLA-ENTREGA-001")
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .estadoFlujo(EstadoFlujo.IMPRESO)
                .build();
        when(rolExamenRepository.findById(rol.getId())).thenReturn(Optional.of(rol));
        when(auditoriaRepository.findFirstByRolExamenIdAndAccionOrderByFechaEventoDesc(
                rol.getId(), "IMPRESION_MARCAS_OMR")).thenReturn(Optional.empty());
        when(auditoriaRepository.findFirstByRolExamenIdAndAccionOrderByFechaEventoDesc(
                rol.getId(), "IMPRESION_LISTA_ESTUDIANTES")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.transicionarEstado(rol.getId(), TransicionEstadoRequestDto.builder()
                .nuevoEstado(EstadoFlujo.ENTREGADO)
                .usuario("PERSONAL_EVALUACIONES")
                .build()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("marcas OMR y lista de estudiantes");

        verify(rolExamenRepository, never()).save(rol);
        verify(auditoriaRepository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void permiteEntregarUnaCartillaCuandoMarcasYListaEstanConfirmadas() {
        RolExamen rol = RolExamen.builder()
                .id("ROL-TEST-CARTILLA-ENTREGA-002")
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .estadoFlujo(EstadoFlujo.IMPRESO)
                .build();
        when(rolExamenRepository.findById(rol.getId())).thenReturn(Optional.of(rol));
        when(rolExamenRepository.save(rol)).thenReturn(rol);
        when(mapper.toResponseDto(rol)).thenReturn(null);
        when(auditoriaRepository.findFirstByRolExamenIdAndAccionOrderByFechaEventoDesc(
                rol.getId(), "IMPRESION_MARCAS_OMR")).thenReturn(Optional.of(new AuditoriaEvaluacion()));
        when(auditoriaRepository.findFirstByRolExamenIdAndAccionOrderByFechaEventoDesc(
                rol.getId(), "IMPRESION_LISTA_ESTUDIANTES")).thenReturn(Optional.of(new AuditoriaEvaluacion()));

        service.transicionarEstado(rol.getId(), TransicionEstadoRequestDto.builder()
                .nuevoEstado(EstadoFlujo.ENTREGADO)
                .usuario("PERSONAL_EVALUACIONES")
                .build());

        assertThat(rol.getEstadoFlujo()).isEqualTo(EstadoFlujo.ENTREGADO);
        verify(rolExamenRepository).save(rol);
        verify(auditoriaRepository).save(org.mockito.ArgumentMatchers.any());
    }

    @Test
    void usaElDocenteOficialCuandoElRolTieneUnGroupIdAntiguo() {
        RolExamen rol = RolExamen.builder()
                .id("ROL-SIS-413-1P")
                .materiaCodigo("SIS-413")
                .grupo("TA-01")
                .seaSyllabusCourseId("COURSE-TELECOM")
                .seaGroupId("GROUP-ANTIGUO")
                .docenteNombre("Docente SEA (CI 6452339)")
                .docenteCi("6452339")
                .build();
        RolExamen rolRelacionado = RolExamen.builder()
                .id("ROL-SIS-413-2P")
                .materiaCodigo("SIS-413")
                .grupo("TA-01")
                .seaGroupId("GROUP-ARIEL")
                .build();

        GroupItemDto grupoAriel = new GroupItemDto();
        grupoAriel.setGroupId("GROUP-ARIEL");
        grupoAriel.setCode("TA-01");
        grupoAriel.setSyllabusCourseId("COURSE-TELECOM");
        grupoAriel.setTeacherFullName("ARIEL DENYS CAMARA ARZE");
        GroupItemDto grupoDeOtraAsignatura = new GroupItemDto();
        grupoDeOtraAsignatura.setGroupId("GROUP-OTRA-ASIGNATURA");
        grupoDeOtraAsignatura.setCode("TA-01");
        grupoDeOtraAsignatura.setSyllabusCourseId("COURSE-OTRA");
        grupoDeOtraAsignatura.setTeacherFullName("DANIEL CAMACHO PASTOR");

        when(unitepcGatewayClient.getGroups("2-2026", null, null, null))
                .thenReturn(List.of(grupoDeOtraAsignatura, grupoAriel));
        when(rolExamenRepository.findByMateriaCodigoAndGrupo("SIS-413", "TA-01"))
                .thenReturn(List.of(rol, rolRelacionado));

        assertThat(service.resolverNombreDocenteOficial(rol))
                .isEqualTo("ARIEL DENYS CAMARA ARZE");
    }
}
