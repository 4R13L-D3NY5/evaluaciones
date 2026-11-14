package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.domain.entity.AlcanceSede;
import com.xpertiflow.evaluaciones.domain.entity.ConfiguracionEvaluaciones;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.entity.UsuarioSistema;
import com.xpertiflow.evaluaciones.domain.repository.ConfiguracionEvaluacionesRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.domain.repository.UsuarioSistemaRepository;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AccesoAcademicoVicerrectorTest {

    @Mock
    private UsuarioSistemaRepository usuarioRepository;

    @Mock
    private RolExamenRepository rolExamenRepository;

    @Mock
    private UnitepcGatewayClient unitepcGatewayClient;

    @Mock
    private ConfiguracionEvaluacionesRepository configuracionRepository;

    private AccesoAcademicoService accesoAcademicoService;

    @BeforeEach
    void setUp() {
        accesoAcademicoService = new AccesoAcademicoService(
                usuarioRepository,
                rolExamenRepository,
                unitepcGatewayClient,
                configuracionRepository
        );
    }

    private Authentication crearAuth(String username, String rol) {
        return new UsernamePasswordAuthenticationToken(
                username,
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_" + rol))
        );
    }

    @Test
    @DisplayName("Vicerrector NO habilitado no puede modificar roles de examen")
    void vicerrectorNoHabilitado_noPuedeModificar() {
        String username = "vicerrector_bloqueado";
        Authentication auth = crearAuth(username, "VICERRECTOR");

        UsuarioSistema usuario = new UsuarioSistema();
        usuario.setUsuario(username);
        usuario.setRolCodigo("VICERRECTOR");
        usuario.setActivo(true);
        usuario.setPuedeEditarRolesExamen(false);

        when(usuarioRepository.findByUsuarioIgnoreCase(username)).thenReturn(Optional.of(usuario));

        boolean puedeModificar = accesoAcademicoService.puedeModificarRolesExamen(auth);
        assertFalse(puedeModificar, "Un vicerrector con puedeEditarRolesExamen=false NO debe poder modificar exámenes");
    }

    @Test
    @DisplayName("Vicerrector habilitado SÍ puede modificar roles de examen")
    void vicerrectorHabilitado_siPuedeModificar() {
        String username = "vicerrector_autorizado";
        Authentication auth = crearAuth(username, "VICERRECTOR");

        UsuarioSistema usuario = new UsuarioSistema();
        usuario.setUsuario(username);
        usuario.setRolCodigo("VICERRECTOR");
        usuario.setActivo(true);
        usuario.setPuedeEditarRolesExamen(true);

        when(usuarioRepository.findByUsuarioIgnoreCase(username)).thenReturn(Optional.of(usuario));

        boolean puedeModificar = accesoAcademicoService.puedeModificarRolesExamen(auth);
        assertTrue(puedeModificar, "Un vicerrector con puedeEditarRolesExamen=true SÍ debe poder modificar exámenes");
    }

    @Test
    @DisplayName("Vicerrector habilitado solo puede modificar exámenes de sus sedes asignadas")
    void vicerrectorHabilitado_restringidoPorSede() {
        String username = "vicerrector_cba";
        Authentication auth = crearAuth(username, "VICERRECTOR");

        AlcanceSede sedeCba = new AlcanceSede();
        sedeCba.setCodigo("CBA");

        UsuarioSistema usuario = new UsuarioSistema();
        usuario.setUsuario(username);
        usuario.setRolCodigo("VICERRECTOR");
        usuario.setActivo(true);
        usuario.setPuedeEditarRolesExamen(true);
        usuario.setSedes(Set.of(sedeCba));

        when(usuarioRepository.findByUsuarioIgnoreCase(username)).thenReturn(Optional.of(usuario));

        // Rol en CBA (su sede)
        RolExamen rolCba = new RolExamen();
        rolCba.setId("ROL-CBA-001");
        rolCba.setSedeCodigo("CBA");
        when(rolExamenRepository.findById("ROL-CBA-001")).thenReturn(Optional.of(rolCba));

        // Rol en LPZ (sede no asignada)
        RolExamen rolLpz = new RolExamen();
        rolLpz.setId("ROL-LPZ-002");
        rolLpz.setSedeCodigo("LPZ");
        when(rolExamenRepository.findById("ROL-LPZ-002")).thenReturn(Optional.of(rolLpz));

        assertTrue(accesoAcademicoService.puedeModificarRol("ROL-CBA-001", auth),
                "Debe permitir modificar rol en sede CBA asignada");
        assertFalse(accesoAcademicoService.puedeModificarRol("ROL-LPZ-002", auth),
                "Debe bloquear modificar rol en sede LPZ no asignada");
    }

    @Test
    @DisplayName("Vicerrector NO habilitado es bloqueado incluso para exámenes en su propia sede")
    void vicerrectorNoHabilitado_bloqueadoEnPropiaSede() {
        String username = "vicerrector_solo_lectura";
        Authentication auth = crearAuth(username, "VICERRECTOR");

        AlcanceSede sedeCba = new AlcanceSede();
        sedeCba.setCodigo("CBA");

        UsuarioSistema usuario = new UsuarioSistema();
        usuario.setUsuario(username);
        usuario.setRolCodigo("VICERRECTOR");
        usuario.setActivo(true);
        usuario.setPuedeEditarRolesExamen(false);
        usuario.setSedes(Set.of(sedeCba));

        when(usuarioRepository.findByUsuarioIgnoreCase(username)).thenReturn(Optional.of(usuario));

        RolExamen rolCba = new RolExamen();
        rolCba.setId("ROL-CBA-001");
        rolCba.setSedeCodigo("CBA");

        assertFalse(accesoAcademicoService.puedeModificarRol("ROL-CBA-001", auth),
                "Debe rechazar la modificación si no está habilitado aunque pertenezca a su sede");
    }
}
