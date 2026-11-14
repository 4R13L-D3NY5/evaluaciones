package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.CrearSolicitudModificacionRequestDto;
import com.xpertiflow.evaluaciones.api.dto.ResolverSolicitudModificacionRequestDto;
import com.xpertiflow.evaluaciones.api.dto.SolicitudModificacionResponseDto;
import com.xpertiflow.evaluaciones.domain.entity.AlcanceSede;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.entity.SolicitudModificacionRol;
import com.xpertiflow.evaluaciones.domain.entity.UsuarioSistema;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.EstadoSolicitudModificacion;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.domain.repository.SolicitudModificacionRolRepository;
import com.xpertiflow.evaluaciones.domain.repository.UsuarioSistemaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SolicitudModificacionRolService {

    private final SolicitudModificacionRolRepository repository;
    private final RolExamenRepository rolExamenRepository;
    private final UsuarioSistemaRepository usuarioRepository;
    private final AccesoAcademicoService accesoAcademicoService;
    private final AuditoriaEvaluacionRepository auditoriaRepository;

    @Transactional
    public SolicitudModificacionResponseDto crearSolicitud(CrearSolicitudModificacionRequestDto dto, Authentication authentication) {
        UsuarioSistema solicitante = obtenerUsuarioAutenticado(authentication);

        RolExamen rol = rolExamenRepository.findById(dto.getRolExamenId())
                .orElseThrow(() -> new IllegalArgumentException("El rol de examen no existe"));

        if (!accesoAcademicoService.puedeAccederRol(rol.getId(), authentication)) {
            throw new AccessDeniedException("No tiene permisos para solicitar modificaciones en este examen");
        }

        // Restricción por estado del examen
        EstadoFlujo estadoActual = rol.getEstadoFlujo();
        if (estadoActual == EstadoFlujo.IMPRESO
                || estadoActual == EstadoFlujo.ENTREGADO
                || estadoActual == EstadoFlujo.DEVUELTO
                || estadoActual == EstadoFlujo.PENDIENTE_NOTAS
                || estadoActual == EstadoFlujo.CALIFICADO
                || estadoActual == EstadoFlujo.CONFIRMADO) {
            throw new IllegalStateException("No se puede solicitar modificación para un examen en estado " + (estadoActual != null ? estadoActual.getValor() : "-") + ". Las cartillas ya fueron generadas o el examen ya se rindió.");
        }

        // Validación de fecha propuesta: debe ser hoy o en adelante
        if (dto.getFechaPropuesta() == null) {
            throw new IllegalArgumentException("Debe especificar la nueva fecha propuesta");
        }
        if (dto.getFechaPropuesta().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("La fecha propuesta no puede ser anterior a la fecha actual (" + LocalDate.now() + "). Debe ser desde hoy en adelante.");
        }

        // Idempotencia: una sola solicitud pendiente
        if (repository.existsByRolExamenIdAndEstado(rol.getId(), EstadoSolicitudModificacion.PENDIENTE)) {
            throw new IllegalStateException("Ya existe una solicitud pendiente de revisión para este examen.");
        }

        SolicitudModificacionRol solicitud = SolicitudModificacionRol.builder()
                .id(UUID.randomUUID().toString())
                .rolExamenId(rol.getId())
                .solicitanteId(solicitante.getId())
                .solicitanteUsuario(solicitante.getUsuario())
                .solicitanteNombre(solicitante.getNombreCompleto())
                .solicitanteRol(solicitante.getRolCodigo())
                .sedeCodigo(rol.getSedeCodigo())
                .carreraCodigo(rol.getCarreraCodigo())
                .materiaCodigo(rol.getMateriaCodigo())
                .materiaNombre(rol.getMateriaNombre())
                .grupo(rol.getGrupo())
                .tipoParcial(rol.getTipoParcial() != null ? rol.getTipoParcial().name() : null)
                .fechaOriginal(rol.getFecha())
                .horarioOriginal(rol.getHorario() != null ? rol.getHorario() : "08:00")
                .modalidadOriginal(rol.getModalidad())
                .fechaPropuesta(dto.getFechaPropuesta())
                .horarioPropuesto(dto.getHorarioPropuesto().trim())
                .modalidadPropuesta(dto.getModalidadPropuesta())
                .motivo(dto.getMotivo().trim())
                .estado(EstadoSolicitudModificacion.PENDIENTE)
                .build();

        solicitud = repository.save(solicitud);
        log.info("Solicitud de modificacion creada id={} para rol={} por {}", solicitud.getId(), rol.getId(), solicitante.getUsuario());
        return mapearADto(solicitud);
    }

    @Transactional(readOnly = true)
    public Optional<SolicitudModificacionResponseDto> obtenerSolicitudActivaPorRol(String rolExamenId) {
        return repository.findByRolExamenIdAndEstado(rolExamenId, EstadoSolicitudModificacion.PENDIENTE)
                .map(this::mapearADto);
    }

    @Transactional(readOnly = true)
    public List<SolicitudModificacionResponseDto> listarPendientesVicerrector(Authentication authentication) {
        UsuarioSistema usuario = obtenerUsuarioAutenticado(authentication);

        if (esRol(usuario, "ADMINISTRADOR_SISTEMA") || esRol(usuario, "RESPONSABLE_EVALUACIONES")) {
            return repository.findAll().stream()
                    .filter(s -> s.getEstado() == EstadoSolicitudModificacion.PENDIENTE)
                    .sorted(Comparator.comparing(SolicitudModificacionRol::getCreadoEn).reversed())
                    .map(this::mapearADto)
                    .toList();
        }

        if (esRol(usuario, "VICERRECTOR")) {
            if (!usuario.isPuedeAprobarSolicitudesRol()) {
                return List.of();
            }
            Set<String> sedes = obtenerCodigosSedesUsuario(usuario);

            if (sedes.isEmpty()) {
                return List.of();
            }

            return repository.findBySedeCodigoInAndEstadoOrderByCreadoEnDesc(sedes, EstadoSolicitudModificacion.PENDIENTE)
                    .stream()
                    .map(this::mapearADto)
                    .toList();
        }

        throw new AccessDeniedException("No tiene permisos para consultar solicitudes de vicerrectorado");
    }

    @Transactional(readOnly = true)
    public List<SolicitudModificacionResponseDto> listarHistorialVicerrector(Authentication authentication) {
        UsuarioSistema usuario = obtenerUsuarioAutenticado(authentication);

        if (esRol(usuario, "ADMINISTRADOR_SISTEMA") || esRol(usuario, "RESPONSABLE_EVALUACIONES")) {
            return repository.findAll().stream()
                    .filter(s -> s.getEstado() != EstadoSolicitudModificacion.PENDIENTE)
                    .sorted((a, b) -> {
                        LocalDateTime fa = a.getFechaResolucion() != null ? a.getFechaResolucion() : a.getCreadoEn();
                        LocalDateTime fb = b.getFechaResolucion() != null ? b.getFechaResolucion() : b.getCreadoEn();
                        if (fa == null && fb == null) return 0;
                        if (fa == null) return 1;
                        if (fb == null) return -1;
                        return fb.compareTo(fa);
                    })
                    .map(this::mapearADto)
                    .toList();
        }

        if (esRol(usuario, "VICERRECTOR")) {
            Set<String> sedes = obtenerCodigosSedesUsuario(usuario);
            if (sedes.isEmpty()) {
                return List.of();
            }

            return repository.findBySedeCodigoInOrderByCreadoEnDesc(sedes).stream()
                    .filter(s -> s.getEstado() != EstadoSolicitudModificacion.PENDIENTE)
                    .sorted((a, b) -> {
                        LocalDateTime fa = a.getFechaResolucion() != null ? a.getFechaResolucion() : a.getCreadoEn();
                        LocalDateTime fb = b.getFechaResolucion() != null ? b.getFechaResolucion() : b.getCreadoEn();
                        if (fa == null && fb == null) return 0;
                        if (fa == null) return 1;
                        if (fb == null) return -1;
                        return fb.compareTo(fa);
                    })
                    .map(this::mapearADto)
                    .toList();
        }

        throw new AccessDeniedException("No tiene permisos para consultar el historial de solicitudes");
    }

    @Transactional(readOnly = true)
    public List<SolicitudModificacionResponseDto> listarMisSolicitudes(Authentication authentication) {
        UsuarioSistema usuario = obtenerUsuarioAutenticado(authentication);
        return repository.findBySolicitanteUsuarioOrderByCreadoEnDesc(usuario.getUsuario()).stream()
                .map(this::mapearADto)
                .toList();
    }

    @Transactional
    public SolicitudModificacionResponseDto resolverSolicitud(
            String id,
            ResolverSolicitudModificacionRequestDto dto,
            Authentication authentication) {

        UsuarioSistema resolutor = obtenerUsuarioAutenticado(authentication);
        boolean esAdmin = esRol(resolutor, "ADMINISTRADOR_SISTEMA") || esRol(resolutor, "RESPONSABLE_EVALUACIONES");
        boolean esVicerrector = esRol(resolutor, "VICERRECTOR");

        if (!esAdmin && !esVicerrector) {
            throw new AccessDeniedException("Solo vicerrectores o administradores pueden resolver solicitudes");
        }

        SolicitudModificacionRol solicitud = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Solicitud no encontrada"));

        if (solicitud.getEstado() != EstadoSolicitudModificacion.PENDIENTE) {
            throw new IllegalStateException("La solicitud ya fue procesada anteriormente y está en estado: " + solicitud.getEstado().getValor());
        }

        // Si es vicerrector, verificar permiso expreso y alcance territorial
        if (esVicerrector && !esAdmin) {
            if (!resolutor.isPuedeAprobarSolicitudesRol()) {
                throw new AccessDeniedException("No cuenta con autorización para resolver solicitudes de modificación de exámenes.");
            }
            Set<String> sedesResolutor = obtenerCodigosSedesUsuario(resolutor);
            boolean tieneSede = sedesResolutor.stream()
                    .anyMatch(s -> s.equalsIgnoreCase(solicitud.getSedeCodigo()));
            if (!tieneSede) {
                throw new AccessDeniedException("No tiene asignada la sede " + solicitud.getSedeCodigo() + " de esta solicitud");
            }
        }

        if (Boolean.TRUE.equals(dto.getAprobado())) {
            if (solicitud.getFechaPropuesta() != null && solicitud.getFechaPropuesta().isBefore(LocalDate.now())) {
                throw new IllegalStateException("No se puede aprobar la solicitud porque la fecha propuesta (" + solicitud.getFechaPropuesta() + ") ya ha vencido. El director debe emitir una nueva solicitud.");
            }

            solicitud.setEstado(EstadoSolicitudModificacion.APROBADA);

            // Mutación atómica del examen
            RolExamen rol = rolExamenRepository.findById(solicitud.getRolExamenId())
                    .orElseThrow(() -> new IllegalArgumentException("Rol de examen asociado no encontrado"));

            rol.setFecha(solicitud.getFechaPropuesta());
            rol.setHorario(solicitud.getHorarioPropuesto());
            rol.setModalidad(solicitud.getModalidadPropuesta());
            rol.setActualizadoEn(LocalDateTime.now());
            rolExamenRepository.save(rol);

            // Registro forense en auditoría de evaluaciones
            AuditoriaEvaluacion audit = AuditoriaEvaluacion.builder()
                    .rolExamen(rol)
                    .etapaOrigen(rol.getEstadoFlujo() != null ? rol.getEstadoFlujo().getValor() : "-")
                    .etapaDestino(rol.getEstadoFlujo() != null ? rol.getEstadoFlujo().getValor() : "-")
                    .accion("REPROGRAMACION_APROBADA_VICERRECTOR")
                    .usuario(resolutor.getUsuario())
                    .detallesJson(String.format("{\"motivo\":\"%s\",\"de\":\"%s %s (%s)\",\"a\":\"%s %s (%s)\",\"observacion\":\"%s\"}",
                            escaparJson(solicitud.getMotivo()),
                            solicitud.getFechaOriginal(), solicitud.getHorarioOriginal(), solicitud.getModalidadOriginal(),
                            solicitud.getFechaPropuesta(), solicitud.getHorarioPropuesto(), solicitud.getModalidadPropuesta(),
                            escaparJson(dto.getObservacion() != null ? dto.getObservacion() : "")))
                    .fechaEvento(LocalDateTime.now())
                    .build();
            auditoriaRepository.save(audit);

            log.info("Solicitud id={} APROBADA por {}. Rol examen={} reprogramado a {} {}",
                    id, resolutor.getUsuario(), rol.getId(), solicitud.getFechaPropuesta(), solicitud.getHorarioPropuesto());
        } else {
            solicitud.setEstado(EstadoSolicitudModificacion.RECHAZADA);
            log.info("Solicitud id={} RECHAZADA por {}", id, resolutor.getUsuario());
        }

        solicitud.setResolutorId(resolutor.getId());
        solicitud.setResolutorUsuario(resolutor.getUsuario());
        solicitud.setResolutorNombre(resolutor.getNombreCompleto());
        solicitud.setObservacionResolucion(dto.getObservacion() != null ? dto.getObservacion().trim() : null);
        solicitud.setFechaResolucion(LocalDateTime.now());

        return mapearADto(repository.save(solicitud));
    }

    private UsuarioSistema obtenerUsuarioAutenticado(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Usuario no autenticado");
        }
        return usuarioRepository.findByUsuarioIgnoreCase(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Usuario no registrado en el sistema"));
    }

    private boolean esRol(UsuarioSistema usuario, String rolCodigo) {
        return rolCodigo != null && rolCodigo.equalsIgnoreCase(usuario.getRolCodigo());
    }

    private String escaparJson(String valor) {
        if (valor == null) return "";
        return valor.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", "\\r")
                .replace("\n", "\\n");
    }

    private SolicitudModificacionResponseDto mapearADto(SolicitudModificacionRol entidad) {
        return SolicitudModificacionResponseDto.builder()
                .id(entidad.getId())
                .rolExamenId(entidad.getRolExamenId())
                .solicitanteId(entidad.getSolicitanteId())
                .solicitanteUsuario(entidad.getSolicitanteUsuario())
                .solicitanteNombre(entidad.getSolicitanteNombre())
                .solicitanteRol(entidad.getSolicitanteRol())
                .sedeCodigo(entidad.getSedeCodigo())
                .carreraCodigo(entidad.getCarreraCodigo())
                .materiaCodigo(entidad.getMateriaCodigo())
                .materiaNombre(entidad.getMateriaNombre())
                .grupo(entidad.getGrupo())
                .tipoParcial(entidad.getTipoParcial())
                .fechaOriginal(entidad.getFechaOriginal())
                .horarioOriginal(entidad.getHorarioOriginal())
                .modalidadOriginal(entidad.getModalidadOriginal())
                .fechaPropuesta(entidad.getFechaPropuesta())
                .horarioPropuesto(entidad.getHorarioPropuesto())
                .modalidadPropuesta(entidad.getModalidadPropuesta())
                .motivo(entidad.getMotivo())
                .estado(entidad.getEstado())
                .resolutorId(entidad.getResolutorId())
                .resolutorUsuario(entidad.getResolutorUsuario())
                .resolutorNombre(entidad.getResolutorNombre())
                .observacionResolucion(entidad.getObservacionResolucion())
                .fechaResolucion(entidad.getFechaResolucion())
                .creadoEn(entidad.getCreadoEn())
                .actualizadoEn(entidad.getActualizadoEn())
                .build();
    }

    private Set<String> obtenerCodigosSedesUsuario(UsuarioSistema usuario) {
        Set<String> codigos = new HashSet<>();
        if (usuario.getSedesAsignadas() != null && !usuario.getSedesAsignadas().isBlank()) {
            Arrays.stream(usuario.getSedesAsignadas().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .forEach(s -> codigos.add(s.toUpperCase()));
        }
        if (usuario.getSedes() != null) {
            usuario.getSedes().forEach(s -> {
                if (s.getCodigo() != null && !s.getCodigo().isBlank()) {
                    codigos.add(s.getCodigo().trim().toUpperCase());
                }
            });
        }
        return codigos;
    }
}
