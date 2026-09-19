package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.domain.entity.ExamenVariante;
import com.xpertiflow.evaluaciones.domain.entity.IntentoExamenVirtual;
import com.xpertiflow.evaluaciones.domain.entity.RespuestaExamenVirtual;
import com.xpertiflow.evaluaciones.domain.entity.SalaExamenVirtual;
import com.xpertiflow.evaluaciones.domain.repository.*;
import com.xpertiflow.evaluaciones.security.BancoCifradoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ExamenVirtualServiceTest {

    private SalaExamenVirtualRepository salaRepository;
    private IntentoExamenVirtualRepository intentoRepository;
    private RespuestaExamenVirtualRepository respuestaRepository;
    private EventoExamenVirtualRepository eventoRepository;
    private RolExamenRepository rolRepository;
    private ExamenVarianteRepository varianteRepository;
    private MapeoEstudianteVarianteRepository mapeoRepository;
    private RolExamenService rolExamenService;
    private ConfiguracionEvaluacionesService configuracionEvaluacionesService;
    private ObjectMapper objectMapper;
    private BancoCifradoService cifradoService;

    private ExamenVirtualService service;

    @BeforeEach
    void setUp() {
        salaRepository = mock(SalaExamenVirtualRepository.class);
        intentoRepository = mock(IntentoExamenVirtualRepository.class);
        respuestaRepository = mock(RespuestaExamenVirtualRepository.class);
        eventoRepository = mock(EventoExamenVirtualRepository.class);
        rolRepository = mock(RolExamenRepository.class);
        varianteRepository = mock(ExamenVarianteRepository.class);
        mapeoRepository = mock(MapeoEstudianteVarianteRepository.class);
        rolExamenService = mock(RolExamenService.class);
        configuracionEvaluacionesService = mock(ConfiguracionEvaluacionesService.class);
        objectMapper = new ObjectMapper();
        cifradoService = mock(BancoCifradoService.class);

        service = new ExamenVirtualService(
                salaRepository,
                intentoRepository,
                respuestaRepository,
                eventoRepository,
                rolRepository,
                varianteRepository,
                mapeoRepository,
                rolExamenService,
                configuracionEvaluacionesService,
                objectMapper,
                cifradoService
        );
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder out = new StringBuilder();
            for (byte b : digest) out.append(String.format("%02x", b));
            return out.toString();
        } catch (Exception ex) {
            throw new IllegalStateException(ex);
        }
    }

    @Test
    void enviar_conPatronCifradoEnKms_calificaCorrectamente() {
        String token = "tok-123456";
        String tokenHash = hashToken(token);

        SalaExamenVirtual sala = new SalaExamenVirtual();
        sala.setId("SALA-1");
        sala.setEstado("EN_CURSO");
        sala.setIniciadaEn(LocalDateTime.now().minusMinutes(5));
        sala.setTerminaEn(LocalDateTime.now().plusMinutes(50));
        when(salaRepository.findById("SALA-1")).thenReturn(Optional.of(sala));

        IntentoExamenVirtual intento = new IntentoExamenVirtual();
        intento.setId("INT-1");
        intento.setSalaId("SALA-1");
        intento.setVarianteId("VAR-1");
        intento.setEstado("EN_CURSO");
        intento.setTokenHash(tokenHash);
        when(intentoRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(intento));

        ExamenVariante variante = new ExamenVariante();
        variante.setId("VAR-1");
        variante.setRolExamenId("ROL-1");
        variante.setPatronClavesJson(null); // Patron nulo porque está cifrado
        variante.setContenidoSeguroCifrado("ciphertext-kms");
        when(varianteRepository.findById("VAR-1")).thenReturn(Optional.of(variante));

        when(cifradoService.descifrarTexto(any(), any())).thenReturn(
                "{\"patronClavesJson\":\"{\\\"1\\\":\\\"A\\\",\\\"2\\\":\\\"B\\\",\\\"3\\\":\\\"C\\\"}\"}"
        );

        RespuestaExamenVirtual r1 = new RespuestaExamenVirtual();
        r1.setNumeroPregunta(1);
        r1.setRespuesta("A");

        RespuestaExamenVirtual r2 = new RespuestaExamenVirtual();
        r2.setNumeroPregunta(2);
        r2.setRespuesta("B");

        RespuestaExamenVirtual r3 = new RespuestaExamenVirtual();
        r3.setNumeroPregunta(3);
        r3.setRespuesta("D"); // Incorrecta

        when(respuestaRepository.findByIntentoIdOrderByNumeroPreguntaAsc("INT-1"))
                .thenReturn(List.of(r1, r2, r3));

        IntentoExamenVirtual resultado = service.enviar(token);

        assertThat(resultado.getEstado()).isEqualTo("CALIFICADO");
        assertThat(resultado.getAciertos()).isEqualTo(2);
        assertThat(resultado.getNotaSobre100()).isEqualByComparingTo(new BigDecimal("66.67"));
        assertThat(resultado.getNotaSobre30()).isEqualByComparingTo(new BigDecimal("20.00"));
        assertThat(resultado.getEnviadoEn()).isNotNull();

        verify(intentoRepository).save(intento);
        verify(eventoRepository).save(any());
    }

    @Test
    void enviar_conPatronEnTextoPlano_calificaCorrectamente() {
        String token = "tok-789012";
        String tokenHash = hashToken(token);

        SalaExamenVirtual sala = new SalaExamenVirtual();
        sala.setId("SALA-2");
        sala.setEstado("EN_CURSO");
        sala.setIniciadaEn(LocalDateTime.now().minusMinutes(10));
        sala.setTerminaEn(LocalDateTime.now().plusMinutes(30));
        when(salaRepository.findById("SALA-2")).thenReturn(Optional.of(sala));

        IntentoExamenVirtual intento = new IntentoExamenVirtual();
        intento.setId("INT-2");
        intento.setSalaId("SALA-2");
        intento.setVarianteId("VAR-2");
        intento.setEstado("EN_CURSO");
        intento.setTokenHash(tokenHash);
        when(intentoRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(intento));

        ExamenVariante variante = new ExamenVariante();
        variante.setId("VAR-2");
        variante.setRolExamenId("ROL-2");
        variante.setPatronClavesJson("{\"1\":\"C\",\"2\":\"D\"}");
        when(varianteRepository.findById("VAR-2")).thenReturn(Optional.of(variante));

        RespuestaExamenVirtual r1 = new RespuestaExamenVirtual();
        r1.setNumeroPregunta(1);
        r1.setRespuesta("C");

        RespuestaExamenVirtual r2 = new RespuestaExamenVirtual();
        r2.setNumeroPregunta(2);
        r2.setRespuesta("D");

        when(respuestaRepository.findByIntentoIdOrderByNumeroPreguntaAsc("INT-2"))
                .thenReturn(List.of(r1, r2));

        IntentoExamenVirtual resultado = service.enviar(token);

        assertThat(resultado.getEstado()).isEqualTo("CALIFICADO");
        assertThat(resultado.getAciertos()).isEqualTo(2);
        assertThat(resultado.getNotaSobre100()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(resultado.getNotaSobre30()).isEqualByComparingTo(new BigDecimal("30.00"));
    }

    @Test
    void enviar_intentoYaCalificado_retornaInmediatamente() {
        String token = "tok-already-done";
        String tokenHash = hashToken(token);

        SalaExamenVirtual sala = new SalaExamenVirtual();
        sala.setId("SALA-3");
        sala.setEstado("EN_CURSO");
        when(salaRepository.findById("SALA-3")).thenReturn(Optional.of(sala));

        IntentoExamenVirtual intento = new IntentoExamenVirtual();
        intento.setId("INT-3");
        intento.setSalaId("SALA-3");
        intento.setEstado("CALIFICADO");
        intento.setAciertos(30);
        intento.setTokenHash(tokenHash);
        when(intentoRepository.findByTokenHash(tokenHash)).thenReturn(Optional.of(intento));

        IntentoExamenVirtual resultado = service.enviar(token);

        assertThat(resultado.getEstado()).isEqualTo("CALIFICADO");
        assertThat(resultado.getAciertos()).isEqualTo(30);
        verify(intentoRepository, never()).save(any());
    }
}
