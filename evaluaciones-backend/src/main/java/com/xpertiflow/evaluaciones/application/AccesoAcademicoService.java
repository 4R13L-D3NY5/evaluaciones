package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.gateway.BranchOfficeDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.CareerDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.CourseDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.CampusDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.GroupItemDto;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.entity.AlcanceCampus;
import com.xpertiflow.evaluaciones.domain.entity.AsignacionAcademica;
import com.xpertiflow.evaluaciones.domain.entity.UsuarioSistema;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.domain.repository.UsuarioSistemaRepository;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.Locale;
import java.util.stream.Collectors;

@Service("accesoAcademicoService")
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AccesoAcademicoService {

    private final UsuarioSistemaRepository usuarioRepository;
    private final RolExamenRepository rolExamenRepository;
    private final UnitepcGatewayClient unitepcGatewayClient;

    private static final String GESTION_ACTIVA = "2-2026";
    private static final long CACHE_SEA_MILLIS = 60_000L;
    private volatile List<GroupItemDto> gruposSeaCache = List.of();
    private volatile long gruposSeaCacheAt;
    private volatile List<BranchOfficeDto> sedesSeaCache = List.of();
    private volatile long sedesSeaCacheAt;

    public List<RolExamen> filtrarRolesParaUsuario(List<RolExamen> roles, Authentication authentication) {
        return roles.stream().filter(rol -> puedeAcceder(rol, authentication)).toList();
    }

    public List<GroupItemDto> filtrarGruposParaUsuario(List<GroupItemDto> grupos, Authentication authentication) {
        if (!esDocente(authentication)) return grupos;
        String ci = ciAutenticado(authentication);
        if (ci.isBlank()) return List.of();
        return grupos.stream().filter(grupo -> coincideIdentidad(grupo.getTeacherIdentityNumber(), ci)).toList();
    }

    /**
     * Filtra el catálogo institucional antes de entregarlo al frontend. Esto evita que un
     * usuario vea sedes, carreras o asignaturas fuera de su alcance aunque consulte el API
     * directamente, y no solamente cuando utiliza los selectores de la pantalla.
     */
    public List<BranchOfficeDto> filtrarSedesParaUsuario(List<BranchOfficeDto> sedes,
                                                          Authentication authentication) {
        if (usaAlcanceSeaDelDocente(authentication)) {
            List<GroupItemDto> gruposDocente = gruposSeaDelDocente(authentication);
            if (!gruposDocente.isEmpty()) {
                return sedes.stream()
                        .filter(sede -> gruposDocente.stream().anyMatch(grupo -> perteneceASede(grupo, sede)))
                        .toList();
            }
        }
        Set<String> sedesPermitidas = codigosSedesPermitidas(authentication);
        if (sedesPermitidas == null) return sedes;
        return sedes.stream()
                .filter(sede -> sedesPermitidas.contains(normalizar(sede.getCode())))
                .toList();
    }

    public List<CampusDto> filtrarCampusParaUsuario(List<CampusDto> campuses,
                                                     String sedeCodigo,
                                                     Authentication authentication) {
        if (!tieneRol(authentication, "PERSONAL_EVALUACIONES")) return campuses;
        UsuarioSistema usuario = usuarioAutenticado(authentication);
        if (usuario == null || !usuario.isActivo() || !puedeConsultarSede(sedeCodigo, authentication)) {
            return List.of();
        }
        return campuses.stream()
                .filter(campus -> usuario.getCampuses().stream().anyMatch(asignacion ->
                        asignacion.isHabilitado()
                                && coincide(asignacion.getSedeCodigo(), sedeCodigo)
                                && coincideCampus(asignacion, campus)))
                .toList();
    }

    public List<CareerDto> filtrarCarrerasParaUsuario(List<CareerDto> carreras,
                                                       String sedeCodigo,
                                                       Authentication authentication) {
        if (!puedeConsultarSede(sedeCodigo, authentication)) return List.of();
        UsuarioSistema usuario = usuarioAutenticado(authentication);
        if (usaAlcanceSeaDelDocente(authentication)) {
            List<GroupItemDto> gruposDocente = gruposSeaDelDocente(authentication);
            if (!gruposDocente.isEmpty()) {
                return carreras.stream()
                        .filter(carrera -> gruposDocente.stream().anyMatch(grupo ->
                                perteneceASede(grupo, sedeCodigo)
                                        && coincide(grupo.getCareerId(), carrera.getCareerId())))
                        .toList();
            }
        }
        if (usuario != null && !usuario.getAsignaciones().isEmpty()
                && ("DOCENTE".equals(usuario.getRolCodigo()) || "DIRECTOR_CARRERA".equals(usuario.getRolCodigo()))) {
            return carreras.stream()
                    .filter(carrera -> usuario.getAsignaciones().stream().anyMatch(item ->
                            coincide(item.getSedeCodigo(), sedeCodigo)
                                    && coincide(item.getCarreraCodigo(), carrera.getCareerCode())))
                    .toList();
        }
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

        UsuarioSistema usuario = usuarioAutenticado(authentication);
        if (usaAlcanceSeaDelDocente(authentication)) {
            List<GroupItemDto> gruposDocente = gruposSeaDelDocente(authentication);
            String careerId = resolverCareerId(sedeCodigo, carreraCodigo);
            if (!gruposDocente.isEmpty() && careerId != null) {
                Set<String> materiasPermitidas = gruposDocente.stream()
                        .filter(grupo -> perteneceASede(grupo, sedeCodigo))
                        .filter(grupo -> coincide(grupo.getCareerId(), careerId))
                        .map(GroupItemDto::getSyllabusCourseId)
                        .map(this::normalizar)
                        .filter(codigo -> !codigo.isBlank())
                        .collect(Collectors.toSet());
                return asignaturas.stream()
                        .filter(asignatura -> materiasPermitidas.contains(normalizar(asignatura.getSyllabusCourseId())))
                        .toList();
            }
        }
        Set<String> materiasPermitidas;
        if (usuario != null && !usuario.getAsignaciones().isEmpty()) {
            materiasPermitidas = usuario.getAsignaciones().stream()
                    .filter(item -> coincide(item.getSedeCodigo(), sedeCodigo))
                    .filter(item -> coincide(item.getCarreraCodigo(), carreraCodigo))
                    .map(AsignacionAcademica::getAsignaturaCodigo)
                    .map(this::normalizar)
                    .filter(codigo -> !codigo.isBlank())
                    .collect(Collectors.toSet());
        } else {
            materiasPermitidas = rolesVisiblesDelDocente(authentication).stream()
                    .filter(rol -> coincide(rol.getSedeCodigo(), sedeCodigo))
                    .filter(rol -> coincide(rol.getCarreraCodigo(), carreraCodigo))
                    .map(RolExamen::getMateriaCodigo)
                    .map(this::normalizar)
                    .filter(codigo -> !codigo.isBlank())
                    .collect(Collectors.toSet());
        }
        return asignaturas.stream()
                .filter(asignatura -> materiasPermitidas.contains(normalizar(asignatura.getCourseCode())))
                .toList();
    }

    public boolean puedeConsultarSede(String sedeCodigo, Authentication authentication) {
        if (!estaAutenticado(authentication) || sedeCodigo == null || sedeCodigo.isBlank()) return false;
        if (usaAlcanceSeaDelDocente(authentication)) {
            List<GroupItemDto> gruposDocente = gruposSeaDelDocente(authentication);
            if (!gruposDocente.isEmpty()) {
                return gruposDocente.stream().anyMatch(grupo -> perteneceASede(grupo, sedeCodigo));
            }
        }
        Set<String> sedesPermitidas = codigosSedesPermitidas(authentication);
        return sedesPermitidas == null || sedesPermitidas.contains(normalizar(sedeCodigo));
    }

    public boolean puedeConsultarCarrera(String sedeCodigo,
                                          String carreraCodigo,
                                          Authentication authentication) {
        if (!puedeConsultarSede(sedeCodigo, authentication)
                || carreraCodigo == null || carreraCodigo.isBlank()) return false;
        UsuarioSistema usuario = usuarioAutenticado(authentication);
        if (usaAlcanceSeaDelDocente(authentication)) {
            List<GroupItemDto> gruposDocente = gruposSeaDelDocente(authentication);
            String careerId = resolverCareerId(sedeCodigo, carreraCodigo);
            if (!gruposDocente.isEmpty() && careerId != null) {
                return gruposDocente.stream().anyMatch(grupo ->
                        perteneceASede(grupo, sedeCodigo) && coincide(grupo.getCareerId(), careerId));
            }
        }
        if (usuario != null && !usuario.getAsignaciones().isEmpty()
                && ("DOCENTE".equals(usuario.getRolCodigo()) || "DIRECTOR_CARRERA".equals(usuario.getRolCodigo()))) {
            return usuario.getAsignaciones().stream().anyMatch(item ->
                    coincide(item.getSedeCodigo(), sedeCodigo)
                            && coincide(item.getCarreraCodigo(), carreraCodigo));
        }
        Set<String> carrerasPermitidas = codigosCarrerasPermitidas(authentication);
        return carrerasPermitidas == null || carrerasPermitidas.contains(normalizar(carreraCodigo));
    }

    /**
     * Resuelve un grupo oficial dentro del alcance del usuario. Se usa para
     * operaciones que todavía no tienen un rol de examen, como la carga
     * anticipada de un banco de preguntas.
     */
    public GroupItemDto exigirGrupoAccesible(String sedeCodigo,
                                              String carreraCodigo,
                                              String branchOfficeId,
                                              String careerId,
                                              String syllabusCourseId,
                                              String groupId,
                                              String groupCode,
                                              Authentication authentication) {
        if (!puedeConsultarCarrera(sedeCodigo, carreraCodigo, authentication)) {
            throw new AccessDeniedException("No tienes acceso a la sede o carrera seleccionada");
        }

        List<GroupItemDto> grupos = unitepcGatewayClient.getGroups(
                GESTION_ACTIVA, branchOfficeId, careerId, syllabusCourseId);
        Optional<GroupItemDto> grupo = filtrarGruposParaUsuario(grupos, authentication).stream()
                .filter(item -> coincideGrupo(item, syllabusCourseId, groupId, groupCode))
                .findFirst();
        return grupo.orElseThrow(() -> new AccessDeniedException(
                "El grupo seleccionado no pertenece al alcance académico del usuario"));
    }

    private boolean coincideGrupo(GroupItemDto grupo,
                                  String syllabusCourseId,
                                  String groupId,
                                  String groupCode) {
        if (syllabusCourseId != null && !syllabusCourseId.isBlank()
                && !coincide(grupo.getSyllabusCourseId(), syllabusCourseId)) return false;
        if (groupId != null && !groupId.isBlank()) {
            return coincide(grupo.getGroupId(), groupId);
        }
        return groupCode != null && !groupCode.isBlank()
                && coincide(grupo.getCode(), groupCode);
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
            if (!coincideIdentidad(rol.getDocenteCi(), ciAutenticado(authentication, usuario))) return false;
            return usuario.getAsignaciones().isEmpty() || usuario.getAsignaciones().stream()
                    .anyMatch(item -> coincide(item.getSedeCodigo(), rol.getSedeCodigo())
                            && coincide(item.getCarreraCodigo(), rol.getCarreraCodigo())
                            && (item.getAsignaturaCodigo().isBlank()
                                || coincide(item.getAsignaturaCodigo(), rol.getMateriaCodigo())));
        }
        if ("DIRECTOR_CARRERA".equals(rolUsuario)) {
            boolean asignacionAcademicaValida = usuario.getAsignaciones().stream().anyMatch(item ->
                        coincide(item.getSedeCodigo(), rol.getSedeCodigo())
                                && coincide(item.getCarreraCodigo(), rol.getCarreraCodigo()));
            if (asignacionAcademicaValida) return true;

            boolean sedeValida = !usuario.getSedes().isEmpty() && usuario.getSedes().stream()
                    .anyMatch(item -> coincide(item.getCodigo(), rol.getSedeCodigo()));
            boolean carreraValida = !usuario.getCarreras().isEmpty() && usuario.getCarreras().stream()
                    .anyMatch(item -> coincide(item.getCodigo(), rol.getCarreraCodigo()));
            if (sedeValida && carreraValida) return true;

            // Algunas cuentas de dirección se cargaron con el alcance nuevo de
            // campus. En ese caso el campus habilitado es el límite operativo;
            // no se concede acceso global ni se ignoran los campus deshabilitados.
            return usuario.getCampuses().stream().anyMatch(item ->
                    item.isHabilitado()
                            && coincide(item.getSedeCodigo(), rol.getSedeCodigo())
                            && coincideCampus(item, rol.getCampus()));
        }
        if ("PERSONAL_EVALUACIONES".equals(rolUsuario)) {
            return usuario.getCampuses().stream().anyMatch(item ->
                    item.isHabilitado()
                            && coincide(item.getSedeCodigo(), rol.getSedeCodigo())
                            && coincideCampus(item, rol.getCampus()));
        }
        if ("VICERRECTOR".equals(rolUsuario)) {
            return !usuario.getSedes().isEmpty() && usuario.getSedes().stream()
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
            if (!usuario.getAsignaciones().isEmpty()) {
                return usuario.getAsignaciones().stream()
                        .map(AsignacionAcademica::getSedeCodigo)
                        .map(this::normalizar)
                        .filter(codigo -> !codigo.isBlank())
                        .collect(Collectors.toSet());
            }
            return rolesVisiblesDelDocente(authentication).stream()
                    .map(RolExamen::getSedeCodigo)
                    .map(this::normalizar)
                    .filter(codigo -> !codigo.isBlank())
                    .collect(Collectors.toSet());
        }
        if (usuario.getSedes().isEmpty()) {
            return Set.of("PERSONAL_EVALUACIONES", "DIRECTOR_CARRERA", "VICERRECTOR").contains(usuario.getRolCodigo())
                    ? Set.of() : null;
        }
        return usuario.getSedes().stream()
                .map(item -> normalizar(item.getCodigo()))
                .filter(codigo -> !codigo.isBlank())
                .collect(Collectors.toSet());
    }

    private Set<String> codigosCarrerasPermitidas(Authentication authentication) {
        if (!estaAutenticado(authentication)) return Set.of();
        if (tieneRol(authentication, "ADMINISTRADOR_SISTEMA")
                || tieneRol(authentication, "RESPONSABLE_EVALUACIONES")
                || tieneRol(authentication, "PERSONAL_EVALUACIONES")
                || tieneRol(authentication, "VICERRECTOR")) {
            return null;
        }

        UsuarioSistema usuario = usuarioAutenticado(authentication);
        if (usuario == null || !usuario.isActivo()) return Set.of();
        if ("DOCENTE".equals(usuario.getRolCodigo())) {
            if (!usuario.getAsignaciones().isEmpty()) {
                return usuario.getAsignaciones().stream()
                        .map(AsignacionAcademica::getCarreraCodigo)
                        .map(this::normalizar)
                        .filter(codigo -> !codigo.isBlank())
                        .collect(Collectors.toSet());
            }
            return rolesVisiblesDelDocente(authentication).stream()
                    .map(RolExamen::getCarreraCodigo)
                    .map(this::normalizar)
                    .filter(codigo -> !codigo.isBlank())
                    .collect(Collectors.toSet());
        }
        if (usuario.getCarreras().isEmpty()) {
            return Set.of("PERSONAL_EVALUACIONES", "DIRECTOR_CARRERA").contains(usuario.getRolCodigo())
                    ? Set.of() : null;
        }
        return usuario.getCarreras().stream()
                .map(item -> normalizar(item.getCodigo()))
                .filter(codigo -> !codigo.isBlank())
                .collect(Collectors.toSet());
    }

    private List<RolExamen> rolesVisiblesDelDocente(Authentication authentication) {
        String ci = ciAutenticado(authentication);
        return rolExamenRepository.findAll().stream()
                .filter(rol -> coincideIdentidad(rol.getDocenteCi(), ci))
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

    private boolean coincideIdentidad(String izquierdo, String derecho) {
        String ciIzquierdo = normalizarIdentidad(izquierdo);
        String ciDerecho = normalizarIdentidad(derecho);
        return !ciIzquierdo.isBlank() && ciIzquierdo.equals(ciDerecho);
    }

    private boolean coincideCampus(AlcanceCampus asignacion, CampusDto campus) {
        return coincideNoVacio(asignacion.getCampusId(), campus.getCampusId())
                || coincideNoVacio(asignacion.getCampusCodigo(), campus.getCode())
                || coincideNoVacio(asignacion.getCampusNombre(), campus.getName())
                || coincideNoVacio(asignacion.getCampusCodigo(), campus.getName())
                || coincideNoVacio(asignacion.getCampusNombre(), campus.getCode());
    }

    private boolean coincideCampus(AlcanceCampus asignacion, String campus) {
        return coincideNoVacio(asignacion.getCampusId(), campus)
                || coincideNoVacio(asignacion.getCampusCodigo(), campus)
                || coincideNoVacio(asignacion.getCampusNombre(), campus);
    }

    private boolean coincideNoVacio(String izquierdo, String derecho) {
        return !normalizar(izquierdo).isBlank() && !normalizar(derecho).isBlank()
                && coincide(izquierdo, derecho);
    }

    private String normalizar(String valor) {
        return valor == null ? "" : valor.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizarIdentidad(String valor) {
        return normalizar(valor).replaceAll("[^A-Z0-9]", "");
    }

    private boolean usaAlcanceSeaDelDocente(Authentication authentication) {
        UsuarioSistema usuario = usuarioAutenticado(authentication);
        return esDocente(authentication) && usuario != null && usuario.isActivo()
                && usuario.getAsignaciones().isEmpty();
    }

    private List<GroupItemDto> gruposSeaDelDocente(Authentication authentication) {
        String ci = ciAutenticado(authentication);
        if (ci.isBlank()) return List.of();
        return obtenerGruposSea().stream()
                .filter(grupo -> coincideIdentidad(grupo.getTeacherIdentityNumber(), ci))
                .toList();
    }

    private List<GroupItemDto> obtenerGruposSea() {
        long ahora = System.currentTimeMillis();
        if (ahora - gruposSeaCacheAt < CACHE_SEA_MILLIS) return gruposSeaCache;
        synchronized (this) {
            ahora = System.currentTimeMillis();
            if (ahora - gruposSeaCacheAt < CACHE_SEA_MILLIS) return gruposSeaCache;
            try {
                List<GroupItemDto> grupos = unitepcGatewayClient.getGroups(GESTION_ACTIVA, null, null, null);
                gruposSeaCache = grupos == null ? List.of() : List.copyOf(grupos);
            } catch (RuntimeException ignored) {
                gruposSeaCache = List.of();
            }
            gruposSeaCacheAt = ahora;
            return gruposSeaCache;
        }
    }

    private boolean perteneceASede(GroupItemDto grupo, String sedeCodigo) {
        if (coincide(grupo.getBranchOfficeId(), sedeCodigo)) return true;
        return obtenerSedesSea().stream()
                .filter(sede -> coincide(sede.getCode(), sedeCodigo))
                .anyMatch(sede -> perteneceASede(grupo, sede));
    }

    private boolean perteneceASede(GroupItemDto grupo, BranchOfficeDto sede) {
        return coincide(grupo.getBranchOfficeId(), sede.getBranchOfficeId())
                || coincide(grupo.getBranchOfficeId(), sede.getCode());
    }

    private List<BranchOfficeDto> obtenerSedesSea() {
        long ahora = System.currentTimeMillis();
        if (ahora - sedesSeaCacheAt < CACHE_SEA_MILLIS) return sedesSeaCache;
        synchronized (this) {
            ahora = System.currentTimeMillis();
            if (ahora - sedesSeaCacheAt < CACHE_SEA_MILLIS) return sedesSeaCache;
            try {
                List<BranchOfficeDto> sedes = unitepcGatewayClient.getBranchOffices();
                sedesSeaCache = sedes == null ? List.of() : List.copyOf(sedes);
            } catch (RuntimeException ignored) {
                sedesSeaCache = List.of();
            }
            sedesSeaCacheAt = ahora;
            return sedesSeaCache;
        }
    }

    private String resolverCareerId(String sedeCodigo, String carreraCodigo) {
        try {
            return unitepcGatewayClient.getCareers(sedeCodigo).stream()
                    .filter(carrera -> coincide(carrera.getCareerCode(), carreraCodigo))
                    .map(CareerDto::getCareerId)
                    .filter(id -> id != null && !id.isBlank())
                    .findFirst()
                    .orElse(null);
        } catch (RuntimeException ignored) {
            return null;
        }
    }
}
