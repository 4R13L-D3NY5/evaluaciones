package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.AuditoriaResponseDto;
import com.xpertiflow.evaluaciones.api.dto.RolExamenRequestDto;
import com.xpertiflow.evaluaciones.api.dto.RolExamenResponseDto;
import com.xpertiflow.evaluaciones.api.dto.RestablecerRolRequestDto;
import com.xpertiflow.evaluaciones.api.dto.TransicionEstadoRequestDto;
import com.xpertiflow.evaluaciones.api.mapper.RolExamenMapper;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.api.dto.gateway.GroupItemDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.CourseDto;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RolExamenService {

    private final RolExamenRepository rolExamenRepository;
    private final AuditoriaEvaluacionRepository auditoriaRepository;
    private final RolExamenMapper mapper;
    private final UnitepcGatewayClient unitepcGatewayClient;
    private final AccesoAcademicoService accesoAcademicoService;

    private static final long CACHE_GRUPOS_SEA_MILLIS = 60_000L;
    private volatile List<GroupItemDto> gruposSeaCache = List.of();
    private volatile long gruposSeaCacheAt;

    // Máquina de estados: de -> conjunto de estados permitidos
    private static final Map<EstadoFlujo, Set<EstadoFlujo>> TRANSICIONES_VALIDAS = Map.of(
            EstadoFlujo.PROGRAMADO, Set.of(EstadoFlujo.VALIDADO, EstadoFlujo.SUSPENDIDO),
            EstadoFlujo.VALIDADO, Set.of(EstadoFlujo.GENERADO, EstadoFlujo.SUSPENDIDO),
            EstadoFlujo.GENERADO, Set.of(EstadoFlujo.IMPRESO, EstadoFlujo.SUSPENDIDO),
            EstadoFlujo.IMPRESO, Set.of(EstadoFlujo.ENTREGADO, EstadoFlujo.SUSPENDIDO),
            EstadoFlujo.ENTREGADO, Set.of(EstadoFlujo.DEVUELTO, EstadoFlujo.SUSPENDIDO),
            EstadoFlujo.DEVUELTO, Set.of(EstadoFlujo.PENDIENTE_NOTAS, EstadoFlujo.SUSPENDIDO),
            EstadoFlujo.PENDIENTE_NOTAS, Set.of(EstadoFlujo.CALIFICADO, EstadoFlujo.SUSPENDIDO),
            EstadoFlujo.SUSPENDIDO, Set.of(EstadoFlujo.PROGRAMADO)
    );

    private static final Set<EstadoFlujo> ESTADOS_POSTERIORES_A_VALIDADO = Set.of(
            EstadoFlujo.GENERADO,
            EstadoFlujo.IMPRESO,
            EstadoFlujo.ENTREGADO,
            EstadoFlujo.DEVUELTO,
            EstadoFlujo.PENDIENTE_NOTAS,
            EstadoFlujo.CALIFICADO
    );

    @Transactional(readOnly = true)
    public List<RolExamenResponseDto> listarTodos() {
        return listarFiltrado(null, null);
    }

    @Transactional(readOnly = true)
    public List<RolExamenResponseDto> listarFiltrado(String sedeCodigo, String carreraCodigo) {
        return listarFiltrado(sedeCodigo, carreraCodigo, null);
    }

    @Transactional(readOnly = true)
    public List<RolExamenResponseDto> listarFiltrado(String sedeCodigo, String carreraCodigo, Authentication authentication) {
        List<RolExamen> roles;
        boolean tieneSede = sedeCodigo != null && !sedeCodigo.isBlank();
        boolean tieneCarrera = carreraCodigo != null && !carreraCodigo.isBlank();

        if (tieneSede && tieneCarrera) {
            roles = rolExamenRepository.findBySedeCodigoAndCarreraCodigo(sedeCodigo, carreraCodigo);
        } else if (tieneSede) {
            roles = rolExamenRepository.findBySedeCodigo(sedeCodigo);
        } else if (tieneCarrera) {
            roles = rolExamenRepository.findByCarreraCodigo(carreraCodigo);
        } else {
            roles = rolExamenRepository.findAll();
        }

        return mapearRolesConDocenteOficial(authentication == null
                ? roles
                : accesoAcademicoService.filtrarRolesParaUsuario(roles, authentication));
    }

    @Transactional(readOnly = true)
    public RolExamenResponseDto obtenerPorId(String id) {
        return obtenerPorId(id, null);
    }

    @Transactional(readOnly = true)
    public RolExamenResponseDto obtenerPorId(String id, Authentication authentication) {
        RolExamen rol = rolExamenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + id));
        if (authentication != null && !accesoAcademicoService.puedeAcceder(rol, authentication)) {
            throw new org.springframework.security.access.AccessDeniedException("No tienes acceso a esta asignatura o grupo");
        }
        return mapearRolConDocenteOficial(rol);
    }

    @Transactional
    public RolExamenResponseDto crear(RolExamenRequestDto dto) {
        normalizarModalidadVigente(dto);
        RolExamen previsualizacion = mapper.toEntity(dto);
        GroupItemDto grupoOficial = resolverGrupoOficialDesdeSea(previsualizacion);
        aplicarDocenteOficial(previsualizacion, grupoOficial);
        dto.setSeaGroupId(previsualizacion.getSeaGroupId());
        int version = siguienteVersion(dto);
        dto.setVersion(version);
        dto.setId(construirId(dto, version));
        while (rolExamenRepository.existsById(dto.getId())) {
            version++;
            dto.setVersion(version);
            dto.setId(construirId(dto, version));
        }
        RolExamen entity = mapper.toEntity(dto);
        entity.setSeaGroupId(previsualizacion.getSeaGroupId());
        aplicarDocenteOficial(entity, grupoOficial);
        entity.setEstadoFlujo(EstadoFlujo.PROGRAMADO);
        entity.setFechaDisplay(formatearFecha(dto.getFecha()));
        RolExamen guardado = rolExamenRepository.save(entity);
        registrarAuditoria(guardado, null, EstadoFlujo.PROGRAMADO, "CREACION_ROL_EXAMEN", "Sistema", "127.0.0.1");
        return mapper.toResponseDto(guardado);
    }

    @Transactional
    public RolExamenResponseDto actualizar(String id, RolExamenRequestDto dto) {
        if (!id.equals(dto.getId())) {
            throw new RuntimeException("El id del rol de examen no coincide con el id de la solicitud");
        }

        RolExamen rol = rolExamenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + id));

        if (rol.getEstadoFlujo() != EstadoFlujo.PROGRAMADO && rol.getEstadoFlujo() != EstadoFlujo.VALIDADO) {
            throw new RuntimeException("Solo se puede editar un rol de examen en estado PROGRAMADO o VALIDADO");
        }

        normalizarModalidadVigente(dto);
        RolExamen previsualizacion = mapper.toEntity(dto);
        previsualizacion.setId(id);
        GroupItemDto grupoOficial = resolverGrupoOficialDesdeSea(previsualizacion);
        mapper.updateEntity(dto, rol);
        rol.setSeaGroupId(previsualizacion.getSeaGroupId());
        aplicarDocenteOficial(rol, grupoOficial);
        rol.setFechaDisplay(formatearFecha(dto.getFecha()));
        RolExamen guardado = rolExamenRepository.save(rol);
        registrarAuditoria(guardado, rol.getEstadoFlujo(), rol.getEstadoFlujo(),
                "ACTUALIZACION_ROL_EXAMEN", "Sistema", "127.0.0.1");
        return mapper.toResponseDto(guardado);
    }

    private void normalizarModalidadVigente(RolExamenRequestDto dto) {
        if (dto.getModalidad() == null) {
            dto.setModalidad(com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen.PRESENCIAL_CARTILLA);
        }
    }

    private List<RolExamenResponseDto> mapearRolesConDocenteOficial(List<RolExamen> roles) {
        Map<String, GroupItemDto> gruposOficiales = resolverGruposOficiales(roles);
        return roles.stream()
                .map(rol -> mapearRol(rol, gruposOficiales.get(rol.getId())))
                .collect(Collectors.toList());
    }

    private RolExamenResponseDto mapearRolConDocenteOficial(RolExamen rol) {
        Map<String, GroupItemDto> gruposOficiales = resolverGruposOficiales(List.of(rol));
        return mapearRol(rol, gruposOficiales.get(rol.getId()));
    }

    public String resolverNombreDocenteOficial(RolExamen rol) {
        if (rol == null) {
            return null;
        }
        GroupItemDto grupo = resolverGruposOficiales(List.of(rol)).get(rol.getId());
        return grupo != null && grupo.getTeacherName() != null && !grupo.getTeacherName().isBlank()
                ? grupo.getTeacherName().trim()
                : null;
    }

    /**
     * Identificador oficial del grupo en SEA. Se usa durante la generación
     * para que un groupId antiguo no termine consultando estudiantes de otro
     * grupo con el mismo código (por ejemplo, varios TA-01).
     */
    public String resolverGrupoOficial(RolExamen rol) {
        if (rol == null) {
            return null;
        }
        GroupItemDto grupo = resolverGruposOficiales(List.of(rol)).get(rol.getId());
        return grupo != null && grupo.getGroupId() != null && !grupo.getGroupId().isBlank()
                ? grupo.getGroupId()
                : null;
    }

    private RolExamenResponseDto mapearRol(RolExamen rol, GroupItemDto grupoOficial) {
        RolExamenResponseDto dto = mapper.toResponseDto(rol);
        // Los campos locales del rol nunca son una fuente de presentación.
        dto.setDocenteNombre(null);
        dto.setDocenteCi(null);
        if (grupoOficial != null) {
            if (grupoOficial.getTeacherName() != null && !grupoOficial.getTeacherName().isBlank()) {
                dto.setDocenteNombre(grupoOficial.getTeacherName().trim());
            }
            if (grupoOficial.getTeacherIdentityNumber() != null
                    && !grupoOficial.getTeacherIdentityNumber().isBlank()) {
                dto.setDocenteCi(grupoOficial.getTeacherIdentityNumber().trim());
            }
        }
        return dto;
    }

    private GroupItemDto resolverGrupoOficialDesdeSea(RolExamen rol) {
        GroupItemDto grupo = resolverGruposOficiales(List.of(rol)).get(rol.getId());
        if (grupo == null || grupo.getTeacherName() == null || grupo.getTeacherName().isBlank()) {
            throw new RuntimeException("No se encontró un docente oficial en los servicios institucionales para la asignatura y grupo seleccionados");
        }
        return grupo;
    }

    private void aplicarDocenteOficial(RolExamen rol, GroupItemDto grupo) {
        if (grupo == null || grupo.getTeacherName() == null || grupo.getTeacherName().isBlank()) {
            throw new RuntimeException("El rol de examen debe tener un docente oficial proveniente de los servicios institucionales");
        }
        rol.setSeaGroupId(grupo.getGroupId());
        rol.setDocenteNombre(grupo.getTeacherName().trim());
        rol.setDocenteCi(grupo.getTeacherIdentityNumber());
    }

    private Map<String, GroupItemDto> resolverGruposOficiales(List<RolExamen> roles) {
        List<RolExamen> pendientes = roles.stream()
                .filter(rol -> rol != null)
                .toList();
        if (pendientes.isEmpty()) {
            return Map.of();
        }

        try {
            List<GroupItemDto> grupos = obtenerGruposSea();
            Map<String, GroupItemDto> resultado = new HashMap<>();
            for (RolExamen rol : pendientes) {
                GroupItemDto grupo = seleccionarGrupoOficial(rol, grupos);
                if (grupo != null && grupo.getTeacherName() != null && !grupo.getTeacherName().isBlank()) {
                    resultado.put(rol.getId(), grupo);
                }
            }
            return resultado;
        } catch (RuntimeException ex) {
            return Map.of();
        }
    }

    private GroupItemDto seleccionarGrupoOficial(RolExamen rol, List<GroupItemDto> grupos) {
        if (grupos == null || grupos.isEmpty()) {
            return null;
        }

        String syllabusCourseId = rol.getSeaSyllabusCourseId();
        List<GroupItemDto> candidatos = grupos.stream()
                .filter(grupo -> mismoTexto(grupo.getCode(), rol.getGrupo()))
                .filter(grupo -> syllabusCourseId == null || syllabusCourseId.isBlank()
                        || mismoTexto(grupo.getSyllabusCourseId(), syllabusCourseId))
                .toList();

        // Si el identificador guardado pertenece a una versión antigua del
        // catálogo, se vuelve a obtener la asignatura desde SEA antes de
        // escoger el grupo. Nunca se usa el docente local para completar ese
        // dato.
        if (candidatos.isEmpty() && syllabusCourseId != null && !syllabusCourseId.isBlank()) {
            String syllabusCourseIdActual = resolverSyllabusCourseIdDesdeCatalogo(rol);
            if (syllabusCourseIdActual != null && !syllabusCourseIdActual.isBlank()) {
                candidatos = grupos.stream()
                        .filter(grupo -> mismoTexto(grupo.getCode(), rol.getGrupo()))
                        .filter(grupo -> mismoTexto(grupo.getSyllabusCourseId(), syllabusCourseIdActual))
                        .toList();
            }
        }

        if (candidatos.isEmpty()) {
            return null;
        }

        // El groupId solo es confiable si también pertenece a la asignatura
        // oficial; así no se conserva accidentalmente el grupo de otra materia.
        GroupItemDto porId = candidatos.stream()
                .filter(grupo -> mismoTexto(grupo.getGroupId(), rol.getSeaGroupId()))
                .findFirst()
                .orElse(null);
        if (porId != null) {
            return porId;
        }

        // Si el rol local quedó con un groupId de otra asignatura, usamos
        // primero el groupId que ya esté asociado a otro parcial del mismo
        // curso y grupo. Esto mantiene consistente todo el rol de exámenes.
        List<RolExamen> rolesRelacionados = rolExamenRepository.findByMateriaCodigoAndGrupo(
                rol.getMateriaCodigo(), rol.getGrupo());
        for (RolExamen relacionado : rolesRelacionados) {
            GroupItemDto porReferenciaLocal = candidatos.stream()
                    .filter(grupo -> mismoTexto(grupo.getGroupId(), relacionado.getSeaGroupId()))
                    .findFirst()
                    .orElse(null);
            if (porReferenciaLocal != null) {
                return porReferenciaLocal;
            }
        }

        // Como último criterio, relacionamos el horario/campus del rol con la
        // programación académica de SEA. Nunca se usa el nombre local para
        // decidir entre docentes, porque puede estar desactualizado.
        return candidatos.stream()
                .max(Comparator.comparingInt(grupo -> puntajeCompatibilidad(rol, grupo)))
                .orElse(null);
    }

    /**
     * Los roles antiguos pueden no tener guardado el syllabusCourseId. En
     * ese caso se recupera desde el catálogo SEA usando el código oficial de
     * la asignatura antes de buscar el grupo. Así no se consulta la nómina
     * con un groupId local antiguo o de otra materia.
     */
    private String resolverSyllabusCourseIdDesdeCatalogo(RolExamen rol) {
        if (rol.getMateriaCodigo() == null || rol.getMateriaCodigo().isBlank()) {
            return null;
        }
        try {
            List<CourseDto> cursos = unitepcGatewayClient.getCourses(rol.getSedeCodigo(), rol.getCarreraCodigo());
            return cursos == null ? null : cursos.stream()
                    .filter(curso -> mismoTexto(curso.getCourseCode(), rol.getMateriaCodigo()))
                    .map(CourseDto::getSyllabusCourseId)
                    .filter(id -> id != null && !id.isBlank())
                    .findFirst()
                    .orElse(null);
        } catch (RuntimeException ignored) {
            return null;
        }
    }

    private int puntajeCompatibilidad(RolExamen rol, GroupItemDto grupo) {
        if (grupo.getSchedules() == null || grupo.getSchedules().isEmpty()) {
            return 0;
        }
        return grupo.getSchedules().stream().mapToInt(horario -> {
            int puntaje = 0;
            if (mismoTexto(horario.getCampus(), rol.getCampus())) {
                puntaje += 4;
            }
            if (mismoTexto(horario.getClassroom(), rol.getAula())) {
                puntaje += 3;
            }
            String horarioRol = rol.getHorario() == null ? "" : rol.getHorario().replace(" ", "");
            String horarioSea = (horario.getStartTime() == null ? "" : horario.getStartTime())
                    + "-" + (horario.getEndTime() == null ? "" : horario.getEndTime());
            if (!horarioRol.isBlank() && horarioRol.equalsIgnoreCase(horarioSea)) {
                puntaje += 5;
            }
            return puntaje;
        }).max().orElse(0);
    }

    private List<GroupItemDto> obtenerGruposSea() {
        long ahora = System.currentTimeMillis();
        if (ahora - gruposSeaCacheAt < CACHE_GRUPOS_SEA_MILLIS) {
            return gruposSeaCache;
        }
        synchronized (this) {
            ahora = System.currentTimeMillis();
            if (ahora - gruposSeaCacheAt < CACHE_GRUPOS_SEA_MILLIS) {
                return gruposSeaCache;
            }
            List<GroupItemDto> grupos = unitepcGatewayClient.getGroups("2-2026", null, null, null);
            gruposSeaCache = grupos == null ? List.of() : List.copyOf(grupos);
            gruposSeaCacheAt = ahora;
            return gruposSeaCache;
        }
    }

    private boolean mismoTexto(String primero, String segundo) {
        return primero != null && segundo != null && primero.trim().equalsIgnoreCase(segundo.trim());
    }

    private int siguienteVersion(RolExamenRequestDto dto) {
        Optional<RolExamen> ultimo = Optional.empty();
        if (dto.getSeaGroupId() != null && !dto.getSeaGroupId().isBlank()) {
            ultimo = rolExamenRepository.findTopBySeaGroupIdAndTipoParcialOrderByVersionDesc(
                    dto.getSeaGroupId(), dto.getTipoParcial());
        }
        if (ultimo.isEmpty()) {
            ultimo = rolExamenRepository.findTopByMateriaCodigoAndGrupoAndTipoParcialOrderByVersionDesc(
                    dto.getMateriaCodigo(), dto.getGrupo(), dto.getTipoParcial());
        }
        return ultimo.map(rol -> rol.getVersion() == null ? 1 : rol.getVersion() + 1).orElse(1);
    }

    private String construirId(RolExamenRequestDto dto, int version) {
        String tipoCodigo = switch (dto.getTipoParcial()) {
            case PRIMER_PARCIAL -> "1P";
            case SEGUNDO_PARCIAL -> "2P";
            case FINAL -> "FIN";
            case SEGUNDA_INSTANCIA -> "2I";
        };
        String grupo = dto.getSeaGroupId() != null && !dto.getSeaGroupId().isBlank()
                ? dto.getSeaGroupId() : dto.getGrupo();
        String base = "ROL-" + grupo + "-" + tipoCodigo + "-" + dto.getFecha();
        return version <= 1 ? base : base + "-V" + version;
    }

    @Transactional
    public void eliminar(String id) {
        RolExamen rol = rolExamenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + id));

        if (rol.getEstadoFlujo() != EstadoFlujo.PROGRAMADO && rol.getEstadoFlujo() != EstadoFlujo.VALIDADO) {
            throw new RuntimeException("Solo se puede eliminar un rol de examen en estado PROGRAMADO o VALIDADO");
        }

        rolExamenRepository.delete(rol);
    }

    @Transactional
    public RolExamen validarPorBanco(String id, String hash, String usuario) {
        RolExamen rol = rolExamenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + id));
        EstadoFlujo origen = rol.getEstadoFlujo();

        if (origen != EstadoFlujo.PROGRAMADO && origen != EstadoFlujo.VALIDADO) {
            throw new RuntimeException("No se puede cargar un banco para un rol de examen en estado " + origen.getValor()
                    + ". Restablezca el rol de examen a VALIDADO antes de reemplazar el banco de preguntas.");
        }

        rol.setEstadoFlujo(EstadoFlujo.VALIDADO);
        rol.setFechaValidacion(LocalDateTime.now());
        rol.setHashEncriptacion(hash);
        RolExamen guardado = rolExamenRepository.save(rol);

        registrarAuditoria(guardado, origen, EstadoFlujo.VALIDADO,
                origen == EstadoFlujo.PROGRAMADO
                        ? "VALIDACION_BANCO_PREGUNTAS"
                        : "REVALIDACION_BANCO_PREGUNTAS",
                usuario != null && !usuario.isBlank() ? usuario : "Sistema",
                "127.0.0.1");
        return guardado;
    }

    @Transactional
    public RolExamen validarPorDocumentoSinCartilla(String id, String hash, String usuario) {
        RolExamen rol = rolExamenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + id));
        if (rol.getModalidad() != ModalidadExamen.PRESENCIAL_SIN_CARTILLA) {
            throw new IllegalStateException("La carga de un documento .doc solo corresponde a exámenes sin cartilla.");
        }
        EstadoFlujo origen = rol.getEstadoFlujo();
        if (origen != EstadoFlujo.PROGRAMADO && origen != EstadoFlujo.VALIDADO) {
            throw new IllegalStateException("El documento solo se puede cargar cuando el rol de examen está PROGRAMADO o VALIDADO.");
        }
        rol.setEstadoFlujo(EstadoFlujo.VALIDADO);
        rol.setFechaValidacion(LocalDateTime.now());
        rol.setHashEncriptacion(hash);
        RolExamen guardado = rolExamenRepository.save(rol);
        registrarAuditoria(guardado, origen, EstadoFlujo.VALIDADO,
                origen == EstadoFlujo.PROGRAMADO ? "VALIDACION_EXAMEN_SIN_CARTILLA" : "REEMPLAZO_EXAMEN_SIN_CARTILLA",
                usuarioValido(usuario), "127.0.0.1");
        return guardado;
    }

    @Transactional
    public RolExamen revertirPorEliminacionBanco(String id, String usuario) {
        RolExamen rol = rolExamenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + id));
        EstadoFlujo origen = rol.getEstadoFlujo();
        if (origen != EstadoFlujo.PROGRAMADO && origen != EstadoFlujo.VALIDADO) {
            throw new RuntimeException("El banco solo se puede eliminar cuando el rol de examen está PROGRAMADO o VALIDADO; estado actual: " + origen.getValor());
        }

        if (origen == EstadoFlujo.VALIDADO) {
            rol.setEstadoFlujo(EstadoFlujo.PROGRAMADO);
            rol.setHashEncriptacion(null);
            rol.setFechaValidacion(null);
        }
        RolExamen guardado = rolExamenRepository.save(rol);
        registrarAuditoria(guardado, origen, EstadoFlujo.PROGRAMADO,
                "ELIMINACION_BANCO_PREGUNTAS",
                usuario != null && !usuario.isBlank() ? usuario : "Sistema",
                "127.0.0.1");
        return guardado;
    }

    @Transactional
    public RolExamenResponseDto transicionarEstado(String id, TransicionEstadoRequestDto dto) {
        RolExamen rol = rolExamenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + id));

        EstadoFlujo origen = rol.getEstadoFlujo();
        EstadoFlujo destino = dto.getNuevoEstado();

        if (destino == EstadoFlujo.SUSPENDIDO && origen == EstadoFlujo.SUSPENDIDO) {
            throw new RuntimeException("El rol de examen ya está suspendido");
        }

        boolean transicionVirtualFinal = rol.getModalidad() == ModalidadExamen.VIRTUAL
                && (origen == EstadoFlujo.VALIDADO || origen == EstadoFlujo.GENERADO)
                && destino == EstadoFlujo.CALIFICADO;
        boolean transicionSinCartillaAImpreso = rol.getModalidad() == ModalidadExamen.PRESENCIAL_SIN_CARTILLA
                && origen == EstadoFlujo.VALIDADO
                && destino == EstadoFlujo.IMPRESO;
        Set<EstadoFlujo> permitidos = TRANSICIONES_VALIDAS.getOrDefault(origen, Set.of());
        if (rol.getModalidad() == ModalidadExamen.PRESENCIAL_SIN_CARTILLA && destino == EstadoFlujo.GENERADO) {
            throw new RuntimeException("Los exámenes sin cartilla no requieren generación de variantes ni PDF.");
        }
        if (!transicionVirtualFinal && !transicionSinCartillaAImpreso && !permitidos.contains(destino)) {
            throw new RuntimeException(
                    String.format("Transición no permitida de %s a %s", origen, destino));
        }

        if (destino == EstadoFlujo.VALIDADO) {
            rol.setFechaValidacion(LocalDateTime.now());
        } else if (destino == EstadoFlujo.GENERADO) {
            rol.setFechaGeneracion(LocalDateTime.now());
        }

        rol.setEstadoFlujo(destino);
        RolExamen guardado = rolExamenRepository.save(rol);

        String accion = destino == EstadoFlujo.SUSPENDIDO
                ? "SUSPENSION_ROL_EXAMEN: " + dto.getMotivo()
                : "TRANSICION_ESTADO";

        registrarAuditoria(guardado, origen, destino, accion,
                dto.getUsuario() != null ? dto.getUsuario() : "Sistema",
                dto.getIpOrigen() != null ? dto.getIpOrigen() : "127.0.0.1");

        return mapper.toResponseDto(guardado);
    }

    @Transactional
    public RolExamenResponseDto restablecerAValidado(String id, RestablecerRolRequestDto dto) {
        RolExamen rol = rolExamenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + id));

        EstadoFlujo origen = rol.getEstadoFlujo();
        if (!ESTADOS_POSTERIORES_A_VALIDADO.contains(origen)) {
            throw new RuntimeException(
                    "Solo se puede restablecer un rol de examen cuyo estado sea posterior a VALIDADO; estado actual: "
                            + origen.getValor());
        }
        if (dto == null || dto.getMotivo() == null || dto.getMotivo().isBlank()) {
            throw new RuntimeException("El motivo del restablecimiento es obligatorio");
        }

        rol.setEstadoFlujo(EstadoFlujo.VALIDADO);
        RolExamen guardado = rolExamenRepository.save(rol);
        registrarAuditoria(guardado, origen, EstadoFlujo.VALIDADO,
                "RESTABLECIMIENTO_A_VALIDADO",
                dto.getUsuario() != null && !dto.getUsuario().isBlank() ? dto.getUsuario() : "Sistema",
                dto.getIpOrigen() != null && !dto.getIpOrigen().isBlank() ? dto.getIpOrigen() : "127.0.0.1",
                dto.getMotivo());

        return mapper.toResponseDto(guardado);
    }

    @Transactional(readOnly = true)
    public List<AuditoriaResponseDto> listarAuditoria(String rolExamenId) {
        return auditoriaRepository.findByRolExamenIdOrderByFechaEventoDesc(rolExamenId).stream()
                .map(a -> AuditoriaResponseDto.builder()
                        .id(a.getId())
                        .rolExamenId(a.getRolExamen().getId())
                        .etapaOrigen(a.getEtapaOrigen())
                        .etapaDestino(a.getEtapaDestino())
                        .accion(a.getAccion())
                        .usuario(a.getUsuario())
                        .ipOrigen(a.getIpOrigen())
                        .detallesJson(a.getDetallesJson())
                        .fechaEvento(a.getFechaEvento())
                        .build())
                .collect(Collectors.toList());
    }

    private void registrarAuditoria(RolExamen rol, EstadoFlujo origen, EstadoFlujo destino,
                                    String accion, String usuario, String ip) {
        registrarAuditoria(rol, origen, destino, accion, usuario, ip, null);
    }

    private void registrarAuditoria(RolExamen rol, EstadoFlujo origen, EstadoFlujo destino,
                                    String accion, String usuario, String ip, String motivo) {
        AuditoriaEvaluacion audit = AuditoriaEvaluacion.builder()
                .rolExamen(rol)
                .etapaOrigen(origen != null ? origen.getValor() : "-")
                .etapaDestino(destino.getValor())
                .accion(accion)
                .usuario(usuario)
                .ipOrigen(ip)
                .detallesJson(motivo == null ? null : "{\"motivo\":\"" + escaparJson(motivo) + "\"}")
                .build();
        auditoriaRepository.save(audit);
    }

    private String escaparJson(String valor) {
        return valor.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "\\r")
                .replace("\n", "\\n");
    }

    private String usuarioValido(String usuario) {
        return usuario == null || usuario.isBlank() ? "SISTEMA" : usuario.trim();
    }

    private String formatearFecha(LocalDateTime fecha) {
        return String.format("%02d/%02d/%d", fecha.getDayOfMonth(), fecha.getMonthValue(), fecha.getYear());
    }

    private String formatearFecha(java.time.LocalDate fecha) {
        return String.format("%02d/%02d/%d", fecha.getDayOfMonth(), fecha.getMonthValue(), fecha.getYear());
    }
}
