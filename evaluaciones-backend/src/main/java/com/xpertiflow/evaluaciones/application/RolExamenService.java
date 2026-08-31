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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
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

    // Máquina de estados: de -> conjunto de estados permitidos
    private static final Map<EstadoFlujo, Set<EstadoFlujo>> TRANSICIONES_VALIDAS = Map.of(
            EstadoFlujo.PROGRAMADO, Set.of(EstadoFlujo.VALIDADO, EstadoFlujo.SUSPENDIDO),
            EstadoFlujo.VALIDADO, Set.of(EstadoFlujo.GENERADO, EstadoFlujo.SUSPENDIDO),
            EstadoFlujo.GENERADO, Set.of(EstadoFlujo.IMPRESO, EstadoFlujo.SUSPENDIDO),
            EstadoFlujo.IMPRESO, Set.of(EstadoFlujo.ENTREGADO, EstadoFlujo.SUSPENDIDO),
            EstadoFlujo.ENTREGADO, Set.of(EstadoFlujo.DEVUELTO, EstadoFlujo.SUSPENDIDO),
            EstadoFlujo.DEVUELTO, Set.of(EstadoFlujo.REVISADO, EstadoFlujo.SUSPENDIDO),
            EstadoFlujo.REVISADO, Set.of(EstadoFlujo.SUBIDO, EstadoFlujo.SUSPENDIDO),
            EstadoFlujo.SUBIDO, Set.of(EstadoFlujo.RECIBIDO, EstadoFlujo.SUSPENDIDO),
            EstadoFlujo.SUSPENDIDO, Set.of(EstadoFlujo.PROGRAMADO)
    );

    private static final Set<EstadoFlujo> ESTADOS_POSTERIORES_A_VALIDADO = Set.of(
            EstadoFlujo.GENERADO,
            EstadoFlujo.IMPRESO,
            EstadoFlujo.ENTREGADO,
            EstadoFlujo.DEVUELTO,
            EstadoFlujo.REVISADO,
            EstadoFlujo.SUBIDO,
            EstadoFlujo.RECIBIDO
    );

    @Transactional(readOnly = true)
    public List<RolExamenResponseDto> listarTodos() {
        return listarFiltrado(null, null);
    }

    @Transactional(readOnly = true)
    public List<RolExamenResponseDto> listarFiltrado(String sedeCodigo, String carreraCodigo) {
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

        return roles.stream()
                .map(mapper::toResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RolExamenResponseDto obtenerPorId(String id) {
        RolExamen rol = rolExamenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + id));
        return mapper.toResponseDto(rol);
    }

    @Transactional
    public RolExamenResponseDto crear(RolExamenRequestDto dto) {
        normalizarModalidadVigente(dto);
        int version = siguienteVersion(dto);
        dto.setVersion(version);
        dto.setId(construirId(dto, version));
        while (rolExamenRepository.existsById(dto.getId())) {
            version++;
            dto.setVersion(version);
            dto.setId(construirId(dto, version));
        }
        RolExamen entity = mapper.toEntity(dto);
        entity.setEstadoFlujo(EstadoFlujo.PROGRAMADO);
        entity.setFechaDisplay(formatearFecha(dto.getFecha()));
        RolExamen guardado = rolExamenRepository.save(entity);
        registrarAuditoria(guardado, null, EstadoFlujo.PROGRAMADO, "CREACION_ROL_EXAMEN", "Sistema", "127.0.0.1");
        return mapper.toResponseDto(guardado);
    }

    @Transactional
    public RolExamenResponseDto actualizar(String id, RolExamenRequestDto dto) {
        if (!id.equals(dto.getId())) {
            throw new RuntimeException("El id del rol no coincide con el id de la solicitud");
        }

        RolExamen rol = rolExamenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + id));

        if (rol.getEstadoFlujo() != EstadoFlujo.PROGRAMADO && rol.getEstadoFlujo() != EstadoFlujo.VALIDADO) {
            throw new RuntimeException("Solo se puede editar un rol en estado PROGRAMADO o VALIDADO");
        }

        normalizarModalidadVigente(dto);
        mapper.updateEntity(dto, rol);
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
            throw new RuntimeException("Solo se puede eliminar un rol en estado PROGRAMADO o VALIDADO");
        }

        rolExamenRepository.delete(rol);
    }

    @Transactional
    public RolExamen validarPorBanco(String id, String hash, String usuario) {
        RolExamen rol = rolExamenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + id));
        EstadoFlujo origen = rol.getEstadoFlujo();

        if (origen != EstadoFlujo.PROGRAMADO && origen != EstadoFlujo.VALIDADO) {
            throw new RuntimeException("No se puede cargar un banco para un rol en estado " + origen.getValor()
                    + ". Restablezca el rol a VALIDADO antes de reemplazar el banco de preguntas.");
        }

        rol.setEstadoFlujo(EstadoFlujo.VALIDADO);
        rol.setFechaValidacion(LocalDateTime.now());
        rol.setHashEncriptacion(hash);
        RolExamen guardado = rolExamenRepository.save(rol);

        registrarAuditoria(guardado, origen, EstadoFlujo.VALIDADO,
                origen == EstadoFlujo.PROGRAMADO
                        ? "VALIDACION_BANCO_PREGUNTAS"
                        : "REVALIDACION_BANCO_PREGUNTAS",
                usuario != null && !usuario.isBlank() ? usuario : rol.getDocenteNombre(),
                "127.0.0.1");
        return guardado;
    }

    @Transactional
    public RolExamen revertirPorEliminacionBanco(String id, String usuario) {
        RolExamen rol = rolExamenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + id));
        EstadoFlujo origen = rol.getEstadoFlujo();
        if (origen != EstadoFlujo.PROGRAMADO && origen != EstadoFlujo.VALIDADO) {
            throw new RuntimeException("El banco solo se puede eliminar cuando el rol está PROGRAMADO o VALIDADO; estado actual: " + origen.getValor());
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
            throw new RuntimeException("El rol ya está suspendido");
        }

        boolean transicionVirtualFinal = rol.getModalidad() == ModalidadExamen.VIRTUAL
                && (origen == EstadoFlujo.VALIDADO || origen == EstadoFlujo.GENERADO)
                && destino == EstadoFlujo.REVISADO;
        Set<EstadoFlujo> permitidos = TRANSICIONES_VALIDAS.getOrDefault(origen, Set.of());
        if (!transicionVirtualFinal && !permitidos.contains(destino)) {
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
                    "Solo se puede restablecer un rol cuyo estado sea posterior a VALIDADO; estado actual: "
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

    private String formatearFecha(LocalDateTime fecha) {
        return String.format("%02d/%02d/%d", fecha.getDayOfMonth(), fecha.getMonthValue(), fecha.getYear());
    }

    private String formatearFecha(java.time.LocalDate fecha) {
        return String.format("%02d/%02d/%d", fecha.getDayOfMonth(), fecha.getMonthValue(), fecha.getYear());
    }
}
