package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.AuditoriaResumenDto;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaRespaldo;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaUsuario;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaVerificacion;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaRespaldoRepository;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaUsuarioRepository;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaVerificacionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatchers;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuditoriaServiceTest {

    private AuditoriaEvaluacionRepository evaluacionRepository;
    private AuditoriaUsuarioRepository usuarioRepository;
    private AuditoriaRespaldoRepository respaldoRepository;
    private AuditoriaVerificacionRepository verificacionRepository;
    private AuditoriaService service;

    @BeforeEach
    void setUp() {
        evaluacionRepository = mock(AuditoriaEvaluacionRepository.class);
        usuarioRepository = mock(AuditoriaUsuarioRepository.class);
        respaldoRepository = mock(AuditoriaRespaldoRepository.class);
        verificacionRepository = mock(AuditoriaVerificacionRepository.class);

        service = new AuditoriaService(
                evaluacionRepository,
                usuarioRepository,
                respaldoRepository,
                verificacionRepository
        );
    }

    @Test
    void debeConsolidarAuditoriasYCalcularKpisCorrectamente() {
        RolExamen rol = new RolExamen();
        rol.setId("ROL-101");
        rol.setMateriaNombre("Farmacología");
        rol.setGrupo("TA-01");
        rol.setCampus("Campus Colonial");
        rol.setSedeCodigo("CBA");

        AuditoriaEvaluacion eval = AuditoriaEvaluacion.builder()
                .id(1L)
                .rolExamen(rol)
                .accion("GENERACION_LOTE_CARTILLAS_OMR")
                .etapaOrigen("VALIDADO")
                .etapaDestino("GENERADO")
                .usuario("admin")
                .ipOrigen("192.168.1.100")
                .fechaEvento(LocalDateTime.of(2026, 9, 21, 14, 30))
                .build();

        AuditoriaUsuario usr = new AuditoriaUsuario();
        usr.setId(2L);
        usr.setAccion("RESTABLECER_CONTRASENA");
        usr.setRealizadoPor("superadmin");
        usr.setDetalle("Contraseña reseteada");
        usr.setFechaEvento(LocalDateTime.of(2026, 9, 21, 15, 0));

        AuditoriaRespaldo resp = new AuditoriaRespaldo();
        resp.setId(3L);
        resp.setAccion("CREAR_SNAPSHOT_LOCAL");
        resp.setActor("sistema_cron");
        resp.setIpOrigen("127.0.0.1");
        resp.setFechaEvento(LocalDateTime.of(2026, 9, 21, 13, 0));

        AuditoriaVerificacion verif = new AuditoriaVerificacion();
        verif.setId(4L);
        verif.setAccion("DEVOLVER_EXAMEN");
        verif.setRealizadoPor("verificador1");
        verif.setDetalle("Banco incompleto");
        verif.setFechaEvento(LocalDateTime.of(2026, 9, 21, 16, 0));

        when(evaluacionRepository.findAllByOrderByFechaEventoDesc(ArgumentMatchers.any()))
                .thenReturn(List.of(eval));
        when(usuarioRepository.findAllByOrderByFechaEventoDesc(ArgumentMatchers.any()))
                .thenReturn(List.of(usr));
        when(respaldoRepository.findAllByOrderByFechaEventoDesc(ArgumentMatchers.any()))
                .thenReturn(List.of(resp));
        when(verificacionRepository.findAllByOrderByFechaEventoDesc(ArgumentMatchers.any()))
                .thenReturn(List.of(verif));

        AuditoriaResumenDto resultado = service.obtenerAuditoriaGlobal("TODOS", "TODOS", null, 100);

        assertThat(resultado.getTotalEventos()).isEqualTo(4);
        assertThat(resultado.getOperacionesCriticas()).isEqualTo(2); // GENERACION_LOTE y RESTABLECER
        assertThat(resultado.getAlertasSeguridad()).isEqualTo(1);    // DEVOLVER_EXAMEN
        assertThat(resultado.getItems().get(0).getId()).isEqualTo("VERIF-4"); // Más reciente (16:00)
    }

    @Test
    void debeFiltrarPorModuloYTexto() {
        AuditoriaEvaluacion eval = AuditoriaEvaluacion.builder()
                .id(1L)
                .accion("VALIDACION_BANCO_PREGUNTAS")
                .etapaOrigen("PROGRAMADO")
                .etapaDestino("VALIDADO")
                .usuario("docente1")
                .ipOrigen("192.168.1.50")
                .fechaEvento(LocalDateTime.now())
                .build();

        when(evaluacionRepository.findAllByOrderByFechaEventoDesc(ArgumentMatchers.any()))
                .thenReturn(List.of(eval));
        when(usuarioRepository.findAllByOrderByFechaEventoDesc(ArgumentMatchers.any()))
                .thenReturn(Collections.emptyList());
        when(respaldoRepository.findAllByOrderByFechaEventoDesc(ArgumentMatchers.any()))
                .thenReturn(Collections.emptyList());
        when(verificacionRepository.findAllByOrderByFechaEventoDesc(ArgumentMatchers.any()))
                .thenReturn(Collections.emptyList());

        AuditoriaResumenDto resultado = service.obtenerAuditoriaGlobal("Banco de Preguntas", "TODOS", "docente1", 100);

        assertThat(resultado.getTotalEventos()).isEqualTo(1);
        assertThat(resultado.getItems().get(0).getModulo()).isEqualTo("Banco de Preguntas");
        assertThat(resultado.getItems().get(0).getUsuario()).isEqualTo("docente1");
    }
}
