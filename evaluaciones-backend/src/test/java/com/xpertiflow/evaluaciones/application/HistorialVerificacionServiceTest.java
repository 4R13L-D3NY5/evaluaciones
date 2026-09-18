package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.domain.entity.BancoPreguntas;
import com.xpertiflow.evaluaciones.domain.entity.HistorialVerificacion;
import com.xpertiflow.evaluaciones.domain.entity.VerificacionExamen;
import com.xpertiflow.evaluaciones.domain.repository.HistorialVerificacionRepository;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class HistorialVerificacionServiceTest {

    private final HistorialVerificacionRepository repository = mock(HistorialVerificacionRepository.class);
    private final HistorialVerificacionService service = new HistorialVerificacionService(repository);

    @Test
    void archivaLaDevolucionYConservaElBancoCifradoAntesDeReemplazarlo() {
        VerificacionExamen verificacion = new VerificacionExamen();
        verificacion.setRolExamenId("ROL-1");
        verificacion.setBancoPreguntasId("BANCO-1");
        verificacion.setEstado("DEVUELTO");
        verificacion.setObservacionesGenerales("Revisar redacción");
        verificacion.setObservacionesPreguntasJson("{\"7\":\"Corregir la pregunta\"}");
        verificacion.setVerificadoPor("verificador");
        verificacion.setFechaVerificacion(LocalDateTime.parse("2026-09-14T10:30:00"));
        BancoPreguntas banco = banco("BANCO-1");
        when(repository.existsByRolExamenIdAndBancoPreguntasId("ROL-1", "BANCO-1")).thenReturn(false);

        service.archivarDevolucion(verificacion, banco);

        ArgumentCaptor<HistorialVerificacion> captor = ArgumentCaptor.forClass(HistorialVerificacion.class);
        verify(repository).save(captor.capture());
        HistorialVerificacion guardado = captor.getValue();
        assertThat(guardado.getRolExamenId()).isEqualTo("ROL-1");
        assertThat(guardado.getBancoPreguntasId()).isEqualTo("BANCO-1");
        assertThat(guardado.getObservacionesPreguntasJson()).contains("Corregir la pregunta");
        assertThat(guardado.getVerificadoPor()).isEqualTo("verificador");
        assertThat(guardado.getFechaDevolucion()).isEqualTo(verificacion.getFechaVerificacion());
        assertThat(guardado.getContenidoCifrado()).isEqualTo("ciphertext");
        assertThat(guardado.getContenidoDekEnvuelta()).isEqualTo("wrapped-key");
    }

    @Test
    void noArchivaUnBancoQueNoFueDevuelto() {
        VerificacionExamen verificacion = new VerificacionExamen();
        verificacion.setRolExamenId("ROL-1");
        verificacion.setBancoPreguntasId("BANCO-1");
        verificacion.setEstado("PENDIENTE");

        service.archivarDevolucion(verificacion, banco("BANCO-1"));

        verify(repository, never()).save(org.mockito.ArgumentMatchers.any());
    }

    private BancoPreguntas banco(String id) {
        BancoPreguntas banco = new BancoPreguntas();
        banco.setId(id);
        banco.setRolExamenId("ROL-1");
        banco.setContenidoCifrado("ciphertext");
        banco.setContenidoNonce("nonce");
        banco.setContenidoDekEnvuelta("wrapped-key");
        banco.setContenidoKekReferencia("transit/verificacion");
        banco.setContenidoKekVersion("1");
        banco.setContenidoAlgoritmo("AES-256-GCM");
        return banco;
    }
}
