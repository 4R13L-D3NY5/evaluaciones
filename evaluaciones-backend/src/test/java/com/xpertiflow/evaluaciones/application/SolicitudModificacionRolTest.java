package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.CrearSolicitudModificacionRequestDto;
import com.xpertiflow.evaluaciones.api.dto.ResolverSolicitudModificacionRequestDto;
import com.xpertiflow.evaluaciones.api.dto.SolicitudModificacionResponseDto;
import com.xpertiflow.evaluaciones.domain.entity.AlcanceSede;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.entity.SolicitudModificacionRol;
import com.xpertiflow.evaluaciones.domain.entity.UsuarioSistema;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.EstadoSolicitudModificacion;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.domain.repository.SolicitudModificacionRolRepository;
import com.xpertiflow.evaluaciones.domain.repository.UsuarioSistemaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SolicitudModificacionRolTest {

    @Mock
    private SolicitudModificacionRolRepository repository;

    @Mock
    private RolExamenRepository rolExamenRepository;

    @Mock
    private UsuarioSistemaRepository usuarioRepository;

    @Mock
    private AccesoAcademicoService accesoAcademicoService;

    @Mock
    private AuditoriaEvaluacionRepository auditoriaRepository;

    private SolicitudModificacionRolService service;

    @BeforeEach
    void setUp() {
        service = new SolicitudModificacionRolService(
                repository,
                rolExamenRepository,
                usuarioRepository,
                accesoAcademicoService,
                auditoriaRepository
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
    @DisplayName("Director de carrera puede crear solicitud para examen en estado PROGRAMADO")
    void directorPuedeCrearSolicitud() {
        String username = "director_sistemas";
        Authentication auth = crearAuth(username, "DIRECTOR_CARRERA");

        UsuarioSistema usuario = new UsuarioSistema();
        usuario.setId(10L);
        usuario.setUsuario(username);
        usuario.setNombreCompleto("Lic. Juan Director");
        usuario.setRolCodigo("DIRECTOR_CARRERA");

        when(usuarioRepository.findByUsuarioIgnoreCase(username)).thenReturn(Optional.of(usuario));

        RolExamen rol = new RolExamen();
        rol.setId("ROL-100");
        rol.setSedeCodigo("CBA");
        rol.setCarreraCodigo("SIS");
        rol.setMateriaCodigo("MAT101");
        rol.setMateriaNombre("Calculo I");
        rol.setGrupo("G1");
        rol.setFecha(LocalDate.of(2026, 11, 20));
        rol.setHorario("08:00");
        rol.setModalidad(ModalidadExamen.PRESENCIAL_CARTILLA);
        rol.setEstadoFlujo(EstadoFlujo.PROGRAMADO);

        when(rolExamenRepository.findById("ROL-100")).thenReturn(Optional.of(rol));
        when(accesoAcademicoService.puedeAccederRol("ROL-100", auth)).thenReturn(true);
        when(repository.existsByRolExamenIdAndEstado("ROL-100", EstadoSolicitudModificacion.PENDIENTE)).thenReturn(false);
        when(repository.save(any(SolicitudModificacionRol.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CrearSolicitudModificacionRequestDto dto = CrearSolicitudModificacionRequestDto.builder()
                .rolExamenId("ROL-100")
                .fechaPropuesta(LocalDate.of(2026, 11, 25))
                .horarioPropuesto("10:00")
                .modalidadPropuesta(ModalidadExamen.PRESENCIAL_CARTILLA)
                .motivo("Cruce con feria académica institucional debidamente autorizada")
                .build();

        SolicitudModificacionResponseDto resp = service.crearSolicitud(dto, auth);

        assertNotNull(resp);
        assertEquals("ROL-100", resp.getRolExamenId());
        assertEquals(LocalDate.of(2026, 11, 25), resp.getFechaPropuesta());
        assertEquals("10:00", resp.getHorarioPropuesto());
        assertEquals(EstadoSolicitudModificacion.PENDIENTE, resp.getEstado());
        verify(repository, times(1)).save(any(SolicitudModificacionRol.class));
    }

    @Test
    @DisplayName("Rechaza creación si ya existe una solicitud PENDIENTE para el examen")
    void rechazaSolicitudSiYaExistePendiente() {
        String username = "director_sistemas";
        Authentication auth = crearAuth(username, "DIRECTOR_CARRERA");

        UsuarioSistema usuario = new UsuarioSistema();
        usuario.setId(10L);
        usuario.setUsuario(username);
        usuario.setRolCodigo("DIRECTOR_CARRERA");

        when(usuarioRepository.findByUsuarioIgnoreCase(username)).thenReturn(Optional.of(usuario));

        RolExamen rol = new RolExamen();
        rol.setId("ROL-100");
        rol.setEstadoFlujo(EstadoFlujo.PROGRAMADO);

        when(rolExamenRepository.findById("ROL-100")).thenReturn(Optional.of(rol));
        when(accesoAcademicoService.puedeAccederRol("ROL-100", auth)).thenReturn(true);
        when(repository.existsByRolExamenIdAndEstado("ROL-100", EstadoSolicitudModificacion.PENDIENTE)).thenReturn(true);

        CrearSolicitudModificacionRequestDto dto = CrearSolicitudModificacionRequestDto.builder()
                .rolExamenId("ROL-100")
                .fechaPropuesta(LocalDate.of(2026, 11, 25))
                .horarioPropuesto("10:00")
                .modalidadPropuesta(ModalidadExamen.PRESENCIAL_CARTILLA)
                .motivo("Intento duplicado de solicitud")
                .build();

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> service.crearSolicitud(dto, auth));
        assertTrue(ex.getMessage().contains("Ya existe una solicitud pendiente"));
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Rechaza creación si el examen ya fue impreso o entregado")
    void rechazaSolicitudSiExamenYaFueImpreso() {
        String username = "director_sistemas";
        Authentication auth = crearAuth(username, "DIRECTOR_CARRERA");

        UsuarioSistema usuario = new UsuarioSistema();
        usuario.setId(10L);
        usuario.setUsuario(username);
        usuario.setRolCodigo("DIRECTOR_CARRERA");

        when(usuarioRepository.findByUsuarioIgnoreCase(username)).thenReturn(Optional.of(usuario));

        RolExamen rol = new RolExamen();
        rol.setId("ROL-100");
        rol.setEstadoFlujo(EstadoFlujo.IMPRESO);

        when(rolExamenRepository.findById("ROL-100")).thenReturn(Optional.of(rol));
        when(accesoAcademicoService.puedeAccederRol("ROL-100", auth)).thenReturn(true);

        CrearSolicitudModificacionRequestDto dto = CrearSolicitudModificacionRequestDto.builder()
                .rolExamenId("ROL-100")
                .fechaPropuesta(LocalDate.of(2026, 11, 25))
                .horarioPropuesto("10:00")
                .modalidadPropuesta(ModalidadExamen.PRESENCIAL_CARTILLA)
                .motivo("Cambio tardio de fecha")
                .build();

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> service.crearSolicitud(dto, auth));
        assertTrue(ex.getMessage().contains("Las cartillas ya fueron generadas"));
    }

    @Test
    @DisplayName("Vicerrector aprueba solicitud: actualiza estado a APROBADA y muta RolExamen")
    void vicerrectorApruebaSolicitudYMutaExamen() {
        String username = "vicerrector_cba";
        Authentication auth = crearAuth(username, "VICERRECTOR");

        AlcanceSede sedeCba = new AlcanceSede();
        sedeCba.setCodigo("CBA");

        UsuarioSistema vicerrector = new UsuarioSistema();
        vicerrector.setId(20L);
        vicerrector.setUsuario(username);
        vicerrector.setNombreCompleto("Dr. Vicerrector CBA");
        vicerrector.setRolCodigo("VICERRECTOR");
        vicerrector.setPuedeAprobarSolicitudesRol(true);
        vicerrector.setSedes(Set.of(sedeCba));

        when(usuarioRepository.findByUsuarioIgnoreCase(username)).thenReturn(Optional.of(vicerrector));

        SolicitudModificacionRol solicitud = SolicitudModificacionRol.builder()
                .id("SOL-1")
                .rolExamenId("ROL-100")
                .sedeCodigo("CBA")
                .fechaOriginal(LocalDate.of(2026, 11, 20))
                .horarioOriginal("08:00")
                .modalidadOriginal(ModalidadExamen.PRESENCIAL_CARTILLA)
                .fechaPropuesta(LocalDate.of(2026, 11, 25))
                .horarioPropuesto("10:00")
                .modalidadPropuesta(ModalidadExamen.PRESENCIAL_CARTILLA)
                .motivo("Feria institucional")
                .estado(EstadoSolicitudModificacion.PENDIENTE)
                .build();

        when(repository.findById("SOL-1")).thenReturn(Optional.of(solicitud));

        RolExamen rol = new RolExamen();
        rol.setId("ROL-100");
        rol.setFecha(LocalDate.of(2026, 11, 20));
        rol.setHorario("08:00");
        rol.setModalidad(ModalidadExamen.PRESENCIAL_CARTILLA);
        rol.setEstadoFlujo(EstadoFlujo.PROGRAMADO);

        when(rolExamenRepository.findById("ROL-100")).thenReturn(Optional.of(rol));
        when(repository.save(any(SolicitudModificacionRol.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ResolverSolicitudModificacionRequestDto dto = ResolverSolicitudModificacionRequestDto.builder()
                .aprobado(true)
                .observacion("Aprobado conforme a la justificación presentada.")
                .build();

        SolicitudModificacionResponseDto resp = service.resolverSolicitud("SOL-1", dto, auth);

        assertNotNull(resp);
        assertEquals(EstadoSolicitudModificacion.APROBADA, resp.getEstado());
        assertEquals("Aprobado conforme a la justificación presentada.", resp.getObservacionResolucion());

        // Verificar mutación en RolExamen
        assertEquals(LocalDate.of(2026, 11, 25), rol.getFecha());
        assertEquals("10:00", rol.getHorario());
        verify(rolExamenRepository, times(1)).save(rol);
        verify(auditoriaRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Vicerrector de otra sede es bloqueado al intentar resolver solicitud")
    void vicerrectorDeSedeAjenaEsBloqueado() {
        String username = "vicerrector_lpz";
        Authentication auth = crearAuth(username, "VICERRECTOR");

        AlcanceSede sedeLpz = new AlcanceSede();
        sedeLpz.setCodigo("LPZ");

        UsuarioSistema vicerrector = new UsuarioSistema();
        vicerrector.setId(21L);
        vicerrector.setUsuario(username);
        vicerrector.setRolCodigo("VICERRECTOR");
        vicerrector.setPuedeAprobarSolicitudesRol(true);
        vicerrector.setSedes(Set.of(sedeLpz));

        when(usuarioRepository.findByUsuarioIgnoreCase(username)).thenReturn(Optional.of(vicerrector));

        SolicitudModificacionRol solicitud = SolicitudModificacionRol.builder()
                .id("SOL-CBA")
                .sedeCodigo("CBA")
                .estado(EstadoSolicitudModificacion.PENDIENTE)
                .build();

        when(repository.findById("SOL-CBA")).thenReturn(Optional.of(solicitud));

        ResolverSolicitudModificacionRequestDto dto = ResolverSolicitudModificacionRequestDto.builder()
                .aprobado(true)
                .build();

        AccessDeniedException ex = assertThrows(AccessDeniedException.class,
                () -> service.resolverSolicitud("SOL-CBA", dto, auth));

        assertTrue(ex.getMessage().contains("No tiene asignada la sede CBA"));
        verify(rolExamenRepository, never()).save(any());
    }

    @Test
    @DisplayName("Vicerrector de la sede pero sin permiso expreso de aprobación es bloqueado")
    void vicerrectorSinPermisoAprobacionEsBloqueado() {
        String username = "vicerrector_sin_permiso";
        Authentication auth = crearAuth(username, "VICERRECTOR");

        AlcanceSede sedeCba = new AlcanceSede();
        sedeCba.setCodigo("CBA");

        UsuarioSistema vicerrector = new UsuarioSistema();
        vicerrector.setId(22L);
        vicerrector.setUsuario(username);
        vicerrector.setRolCodigo("VICERRECTOR");
        vicerrector.setPuedeAprobarSolicitudesRol(false); // NO AUTORIZADO
        vicerrector.setSedes(Set.of(sedeCba));

        when(usuarioRepository.findByUsuarioIgnoreCase(username)).thenReturn(Optional.of(vicerrector));

        SolicitudModificacionRol solicitud = SolicitudModificacionRol.builder()
                .id("SOL-CBA-2")
                .sedeCodigo("CBA")
                .estado(EstadoSolicitudModificacion.PENDIENTE)
                .build();

        when(repository.findById("SOL-CBA-2")).thenReturn(Optional.of(solicitud));

        ResolverSolicitudModificacionRequestDto dto = ResolverSolicitudModificacionRequestDto.builder()
                .aprobado(true)
                .build();

        AccessDeniedException ex = assertThrows(AccessDeniedException.class,
                () -> service.resolverSolicitud("SOL-CBA-2", dto, auth));

        assertTrue(ex.getMessage().contains("No cuenta con autorización"));
        verify(rolExamenRepository, never()).save(any());
    }
}
