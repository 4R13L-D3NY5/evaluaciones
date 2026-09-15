package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.ConfiguracionEvaluacionesDto;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
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
    private PoliticaTiempoEvaluacionesService service;
    private Authentication personal;

    @BeforeEach
    void setUp() {
        configuracionService = mock(ConfiguracionEvaluacionesService.class);
        ConfiguracionEvaluacionesDto configuracion = new ConfiguracionEvaluacionesDto();
        configuracion.setHorasAntesLista(24);
        configuracion.setHorasAntesGeneracion(144);
        configuracion.setMinutosAntesEntrega(15);
        configuracion.setHorasPostPatron(8);
        when(configuracionService.obtener()).thenReturn(configuracion);
        service = new PoliticaTiempoEvaluacionesService(configuracionService);
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

    private RolExamen rolEn(LocalDate fecha) {
        return RolExamen.builder()
                .id("ROL-TEST-TIEMPO-" + fecha)
                .fecha(fecha)
                .horario("08:15 - 09:45")
                .build();
    }
}
