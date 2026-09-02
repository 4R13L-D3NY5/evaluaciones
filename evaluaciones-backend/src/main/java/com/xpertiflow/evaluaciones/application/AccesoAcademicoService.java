package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.gateway.BranchOfficeDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.CareerDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.CourseDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.GroupItemDto;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.entity.UsuarioSistema;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.domain.repository.UsuarioSistemaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.Locale;
import java.util.stream.Collectors;

@Service("accesoAcademicoService")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccesoAcademicoService {

    private final UsuarioSistemaRepository usuarioRepository;
    private final RolExamenRepository rolExamenRepository;

    public List<RolExamen> filtrarRolesParaUsuario(List<RolExamen> roles, Authentication authentication) {
        return roles.stream().filter(rol -> puedeAcceder(rol, authentication)).toList();
    }

    public List<GroupItemDto> filtrarGruposParaUsuario(List<GroupItemDto> grupos, Authentication authentication) {
        if (!esDocente(authentication)) return grupos;
        String ci = ciAutenticado(authentication);
        return grupos.stream().filter(grupo -> coincide(grupo.getTeacherIdentityNumber(), ci)).toList();
    }

    /**
     * Filtra el catálogo institucional antes de entregarlo al frontend. Esto evita que un
     * usuario vea sedes, carreras o asignaturas fuera de su alcance aunque consulte el API
     * directamente, y no solamente cuando utiliza los selectores de la pantalla.
     */
    public List<BranchOfficeDto> filtrarSedesParaUsuario(List<BranchOfficeDto> sedes,
                                                          Authentication authentication) {
        Set<String> sedesPermitidas = codigosSedesPermitidas(authentication);
        if (sedesPermitidas == null) return sedes;
        return sedes.stream()
                .filter(sede -> sedesPermitidas.contains(normalizar(sede.getCode())))
                .toList();
    }

    public List<CareerDto> filtrarCarrerasParaUsuario(List<CareerDto> carreras,
                                                       String sedeCodigo,
                                                       Authentication authentication) {
        if (!puedeConsultarSede(sedeCodigo, authentication)) return List.of();
        Set<String> carrerasPermitidas = codigosCarrerasPermitidas(authentication);
        if (carrerasPermitidas == null) return carreras;
        return carreras.stream()
                .filter(carrera -> carrerasPermitidas.contains(normalizar(carrera.getCareerCode())))
                .toList();
    }

    public List<CourseDto> filtrarAsignaturasParaUsuario(List<CourseDto> asignaturas,
                                                          String sedeCodigo,
                                                          String carreraCodigo,
                                                          Authentication authentication) {
        if (!puedeConsultarSede(sedeCodigo, authentication)
                || !puedeConsultarCarrera(sedeCodigo, carreraCodigo, authentication)) {
            return List.of();
        }
        if (!esDocente(authentication)) return asignaturas;

        Set<String> materiasPermitidas = rolesVisiblesDelDocente(authentication).stream()
                .filter(rol -> coincide(rol.getSedeCodigo(), sedeCodigo))
                .filter(rol -> coincide(rol.getCarreraCodigo(), carreraCodigo))
                .map(RolExamen::getMateriaCodigo)
                .map(this::normalizar)
                .filter(codigo -> !codigo.isBlank())
                .collect(Collectors.toSet());
        return asignaturas.stream()
                .filter(asignatura -> materiasPermitidas.contains(normalizar(asignatura.getCourseCode())))
                .toList();
    }

    public boolean puedeConsultarSede(String sedeCodigo, Authentication authentication) {
        if (!estaAutenticado(authentication) || sedeCodigo == null || sedeCodigo.isBlank()) return false;
        Set<String> sedesPermitidas = codigosSedesPermitidas(authentication);
        return sedesPermitidas == null || sedesPermitidas.contains(normalizar(sedeCodigo));
    }

    public boolean puedeConsultarCarrera(String sedeCodigo,
                                          String carreraCodigo,
                                          Authentication authentication) {
        if (!puedeConsultarSede(sedeCodigo, authentication)
                || carreraCodigo == null || carreraCodigo.isBlank()) return false;
        Set<String> carrerasPermitidas = codigosCarrerasPermitidas(authentication);
        return carrerasPermitidas == null || carrerasPermitidas.contains(normalizar(carreraCodigo));
    }

    public void exigirAccesoRol(String rolExamenId, Authentication authentication) {
        RolExamen rol = rolExamenRepository.findById(rolExamenId)
                .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + rolExamenId));
        if (!puedeAcceder(rol, authentication)) {
            throw new AccessDeniedException("El docente no tiene acceso a esta asignatura o grupo");
        }
    }

    public boolean puedeAccederRol(String rolExamenId, Authentication authentication) {
        return rolExamenRepository.findById(rolExamenId)
                .map(rol -> puedeAcceder(rol, authentication))
                .orElse(false);
    }

    public boolean puedeAcceder(RolExamen rol, Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return false;
        if (tieneRol(authentication, "ADMINISTRADOR_SISTEMA")
                || tieneRol(authentication, "RESPONSABLE_EVALUACIONES")) return true;

        UsuarioSistema usuario = usuarioRepository.findByUsuarioIgnoreCase(authentication.getName()).orElse(null);
        if (usuario == null || !usuario.isActivo()) return false;
        String rolUsuario = usuario.getRolCodigo();
        if ("DOCENTE".equals(rolUsuario)) {
            return coincide(rol.getDocenteCi(), ciAutenticado(authentication, usuario));
        }
        if ("DIRECTOR_CARRERA".equals(rolUsuario)) {
            boolean sedeValida = usuario.getSedes().isEmpty() || usuario.getSedes().stream()
                    .anyMatch(item -> coincide(item.getCodigo(), rol.getSedeCodigo()));
            boolean carreraValida = usuario.getCarreras().isEmpty() || usuario.getCarreras().stream()
                    .anyMatch(item -> coincide(item.getCodigo(), rol.getCarreraCodigo()));
            return sedeValida && carreraValida;
        }
        if ("PERSONAL_EVALUACIONES".equals(rolUsuario)) {
            boolean sedeValida = usuario.getSedes().isEmpty() || usuario.getSedes().stream()
                    .anyMatch(item -> coincide(item.getCodigo(), rol.getSedeCodigo()));
            boolean carreraValida = usuario.getCarreras().isEmpty() || usuario.getCarreras().stream()
                    .anyMatch(item -> coincide(item.getCodigo(), rol.getCarreraCodigo()));
            return sedeValida && carreraValida;
        }
        if ("VICERRECTOR".equals(rolUsuario)) {
            return usuario.getSedes().isEmpty() || usuario.getSedes().stream()
                    .anyMatch(item -> coincide(item.getCodigo(), rol.getSedeCodigo()));
        }
        return false;
    }

    private boolean esDocente(Authentication authentication) {
        return tieneRol(authentication, "DOCENTE");
    }

    private Set<String> codigosSedesPermitidas(Authentication authentication) {
        if (!estaAutenticado(authentication)) return Set.of();
        if (tieneRol(authentication, "ADMINISTRADOR_SISTEMA")
                || tieneRol(authentication, "RESPONSABLE_EVALUACIONES")) {
            return null;
        }

        UsuarioSistema usuario = usuarioAutenticado(authentication);
        if (usuario == null || !usuario.isActivo()) return Set.of();
        if ("DOCENTE".equals(usuario.getRolCodigo())) {
            return rolesVisiblesDelDocente(authentication).stream()
                    .map(RolExamen::getSedeCodigo)
                    .map(this::normalizar)
                    .filter(codigo -> !codigo.isBlank())
                    .collect(Collectors.toSet());
        }
        if (usuario.getSedes().isEmpty()) return null;
        return usuario.getSedes().stream()
                .map(item -> normalizar(item.getCodigo()))
                .filter(codigo -> !codigo.isBlank())
                .collect(Collectors.toSet());
    }

    private Set<String> codigosCarrerasPermitidas(Authentication authentication) {
        if (!estaAutenticado(authentication)) return Set.of();
        if (tieneRol(authentication, "ADMINISTRADOR_SISTEMA")
                || tieneRol(authentication, "RESPONSABLE_EVALUACIONES")
                || tieneRol(authentication, "VICERRECTOR")) {
            return null;
        }

        UsuarioSistema usuario = usuarioAutenticado(authentication);
        if (usuario == null || !usuario.isActivo()) return Set.of();
        if ("DOCENTE".equals(usuario.getRolCodigo())) {
            return rolesVisiblesDelDocente(authentication).stream()
                    .map(RolExamen::getCarreraCodigo)
                    .map(this::normalizar)
                    .filter(codigo -> !codigo.isBlank())
                    .collect(Collectors.toSet());
        }
        if (usuario.getCarreras().isEmpty()) return null;
        return usuario.getCarreras().stream()
                .map(item -> normalizar(item.getCodigo()))
                .filter(codigo -> !codigo.isBlank())
                .collect(Collectors.toSet());
    }

    private List<RolExamen> rolesVisiblesDelDocente(Authentication authentication) {
        String ci = ciAutenticado(authentication);
        return rolExamenRepository.findAll().stream()
                .filter(rol -> coincide(rol.getDocenteCi(), ci))
                .toList();
    }

    private UsuarioSistema usuarioAutenticado(Authentication authentication) {
        return usuarioRepository.findByUsuarioIgnoreCase(authentication.getName()).orElse(null);
    }

    private boolean estaAutenticado(Authentication authentication) {
        return authentication != null && authentication.isAuthenticated();
    }

    private boolean tieneRol(Authentication authentication, String rol) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + rol));
    }

    private String ciAutenticado(Authentication authentication) {
        return usuarioRepository.findByUsuarioIgnoreCase(authentication.getName())
                .map(usuario -> ciAutenticado(authentication, usuario))
                .orElse(normalizar(authentication.getName()));
    }

    private String ciAutenticado(Authentication authentication, UsuarioSistema usuario) {
        return normalizar(usuario.getCi() == null || usuario.getCi().isBlank()
                ? authentication.getName() : usuario.getCi());
    }

    private boolean coincide(String izquierdo, String derecho) {
        return izquierdo != null && derecho != null && normalizar(izquierdo).equals(normalizar(derecho));
    }

    private String normalizar(String valor) {
        return valor == null ? "" : valor.trim().toUpperCase(Locale.ROOT);
    }
}
