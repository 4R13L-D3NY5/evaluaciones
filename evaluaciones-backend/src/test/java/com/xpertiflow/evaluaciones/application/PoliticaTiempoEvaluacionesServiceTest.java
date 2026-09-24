package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.ConfiguracionEvaluacionesDto;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class PoliticaTiempoEvaluacionesServiceTest {

    private ConfiguracionEvaluacionesService configuracionService;
    private AuditoriaEvaluacionRepository auditoriaRepository;
    private PoliticaTiempoEvaluacionesService service;
    private Authentication personal;

    @BeforeEach
    void setUp() {
        configuracionService = mock(ConfiguracionEvaluacionesService.class);
        auditoriaRepository = mock(AuditoriaEvaluacionRepository.class);
        ConfiguracionEvaluacionesDto configuracion = new ConfiguracionEvaluacionesDto();
        configuracion.setHorasAntesLista(24);
        configuracion.setHorasAntesGeneracion(144);
        configuracion.setMinutosAntesEntrega(15);
        configuracion.setHorasPostPatron(8);
        configuracion.setMinutosMinimosDevolucion(45);
        when(configuracionService.obtener()).thenReturn(configuracion);
        service = new PoliticaTiempoEvaluacionesService(configuracionService, auditoriaRepository);
        personal = new TestingAuthenticationToken(
                "personal", "",
                List.of(new SimpleGrantedAuthority("ROLE_PERSONAL_EVALUACIONES")));
    }

    @Test
    void bloqueaGeneracionAntesDeLaVentanaConfigurada() {
        RolExamen rol = rolEn(LocalDate.now().plusDays(10));

        assertThatThrownBy(() -> service.exigirGeneracionHabilitada(rol, personal))
                .isInstanceOf(VentanaTemporalException.class)
                .hasMessageContaining("generación todavía no está habilitada");
    }

    @Test
    void permiteGeneracionCuandoLaVentanaYaComenzo() {
        RolExamen rol = rolEn(LocalDate.now().minusDays(1));

        service.exigirGeneracionHabilitada(rol, personal);
    }

    @Test
    void ocultaEnLaListaLosRolesFueraDeLaVentanaDeLiberacion() {
        RolExamen fuera = rolEn(LocalDate.now().plusDays(3));
        RolExamen visible = rolEn(LocalDate.now().minusDays(1));

        assertThat(service.filtrarListaParaPersonal(List.of(fuera, visible), personal))
                .containsExactly(visible);
    }

    @Test
    void administradorNoQuedaSujetoAEstasVentanas() {
        Authentication administrador = new TestingAuthenticationToken(
                "admin", "", List.of(new SimpleGrantedAuthority("ROLE_ADMINISTRADOR_SISTEMA")));
        RolExamen rol = rolEn(LocalDate.now().plusDays(10));

        service.exigirGeneracionHabilitada(rol, administrador);
        assertThat(service.filtrarListaParaPersonal(List.of(rol), administrador))
                .containsExactly(rol);
    }

    @Test
    void bloqueaDevolucionAntesDeLosMinutosConfigurados() {
        RolExamen rol = RolExamen.builder()
                .id("ROL-TEST-DEV")
                .fecha(LocalDate.now())
                .horario("23:50 - 23:59")
                .build();

        assertThatThrownBy(() -> service.exigirDevolucionHabilitada(rol, personal))
                .isInstanceOf(VentanaTemporalException.class)
                .hasMessageContaining("devolución todavía no está habilitada");
    }

    @Test
    void permiteDevolucionCuandoElTiempoMinimoYaTranscurrio() {
        RolExamen rol = RolExamen.builder()
                .id("ROL-TEST-DEV-PASADO")
                .fecha(LocalDate.now().minusDays(1))
                .horario("08:00 - 09:30")
                .build();

        service.exigirDevolucionHabilitada(rol, personal);
    }

    @Test
    void administradorPuedeBypasearTiempoMinimoDevolucion() {
        Authentication administrador = new TestingAuthenticationToken(
                "admin", "", List.of(new SimpleGrantedAuthority("ROLE_ADMINISTRADOR_SISTEMA")));
        RolExamen rol = RolExamen.builder()
                .id("ROL-TEST-DEV-FUTURO")
                .fecha(LocalDate.now().plusDays(1))
                .horario("10:00 - 11:30")
                .build();

        service.exigirDevolucionHabilitada(rol, administrador);
    }

    private RolExamen rolEn(LocalDate fecha) {
        return RolExamen.builder()
                .id("ROL-TEST-TIEMPO-" + fecha)
                .fecha(fecha)
                .horario("08:15 - 09:45")
                .build();
    }
}
