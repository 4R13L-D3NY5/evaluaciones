package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.NotificacionItemDto;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.entity.UsuarioSistema;
import com.xpertiflow.evaluaciones.domain.entity.VerificacionExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.domain.repository.UsuarioSistemaRepository;
import com.xpertiflow.evaluaciones.domain.repository.VerificacionExamenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class NotificacionesService {

    private final RolExamenRepository rolExamenRepository;
    private final VerificacionExamenRepository verificacionExamenRepository;
    private final UsuarioSistemaRepository usuarioRepository;
    private final AccesoAcademicoService accesoAcademicoService;

    public List<NotificacionItemDto> obtenerResumen(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return List.of();
        }

        // El usuario Administrador NO necesita ver notificaciones
        if (tieneRol(authentication, "ADMINISTRADOR_SISTEMA")) {
            return List.of();
        }

        if (tieneRol(authentication, "DOCENTE")) {
            return obtenerNotificacionesDocente(authentication);
        }

        if (tieneRol(authentication, "DIRECTOR_CARRERA")) {
            return obtenerNotificacionesDirector(authentication);
        }

        return List.of();
    }

    private List<NotificacionItemDto> obtenerNotificacionesDocente(Authentication authentication) {
        UsuarioSistema usuario = usuarioRepository.findByUsuarioIgnoreCase(authentication.getName()).orElse(null);
        if (usuario == null) {
            return List.of();
        }

        String ci = usuario.getCi() != null && !usuario.getCi().isBlank()
                ? usuario.getCi().trim()
                : usuario.getUsuario().trim();

        List<RolExamen> rolesDocente = rolExamenRepository.findByDocenteCi(ci);
        if (rolesDocente.isEmpty()) {
            rolesDocente = rolExamenRepository.findAll().stream()
                    .filter(r -> r.getDocenteCi() != null && r.getDocenteCi().trim().equalsIgnoreCase(ci))
                    .toList();
        }

        if (rolesDocente.isEmpty()) {
            return List.of();
        }

        Set<String> rolesIds = rolesDocente.stream().map(RolExamen::getId).collect(Collectors.toSet());
        Map<String, VerificacionExamen> verificaciones = verificacionExamenRepository.findByRolExamenIdIn(rolesIds).stream()
                .collect(Collectors.toMap(VerificacionExamen::getRolExamenId, v -> v, (v1, v2) -> v1));

        List<NotificacionItemDto> lista = new ArrayList<>();
        for (RolExamen rol : rolesDocente) {
            VerificacionExamen verif = verificaciones.get(rol.getId());
            String estadoVerif = verif != null ? verif.getEstado() : null;

            // 1. Banco devuelto con observaciones
            if ("DEVUELTO".equalsIgnoreCase(estadoVerif)) {
                String fechaStr = verif.getFechaVerificacion() != null
                        ? verif.getFechaVerificacion().format(DateTimeFormatter.ISO_DATE_TIME)
                        : (rol.getActualizadoEn() != null ? rol.getActualizadoEn().format(DateTimeFormatter.ISO_DATE_TIME) : null);

                lista.add(NotificacionItemDto.builder()
                        .id("obs-" + rol.getId())
                        .tipo("OBSERVACION_BANCO")
                        .titulo("Banco de preguntas observado")
                        .materiaCodigo(rol.getMateriaCodigo())
                        .materiaNombre(rol.getMateriaNombre())
                        .grupo(rol.getGrupo())
                        .parcial(rol.getTipoParcial() != null ? rol.getTipoParcial().name() : null)
                        .docenteNombre(rol.getDocenteNombre())
                        .mensaje(String.format("El banco de %s (%s) fue devuelto con observaciones por el verificador.",
                                rol.getMateriaNombre(), rol.getGrupo()))
                        .fecha(fechaStr)
                        .ruta("/banco-preguntas")
                        .queryParams(Map.of("rolId", rol.getId()))
                        .textoAccion("Ver banco")
                        .nivel("error")
                        .build());
            } else if ("VERIFICADO".equalsIgnoreCase(estadoVerif)) {
                // 2. Banco aprobado y verificado
                String fechaStr = verif.getFechaVerificacion() != null
                        ? verif.getFechaVerificacion().format(DateTimeFormatter.ISO_DATE_TIME)
                        : (rol.getActualizadoEn() != null ? rol.getActualizadoEn().format(DateTimeFormatter.ISO_DATE_TIME) : null);

                lista.add(NotificacionItemDto.builder()
                        .id("verif-" + rol.getId())
                        .tipo("BANCO_VERIFICADO")
                        .titulo("Examen validado y verificado")
                        .materiaCodigo(rol.getMateriaCodigo())
                        .materiaNombre(rol.getMateriaNombre())
                        .grupo(rol.getGrupo())
                        .parcial(rol.getTipoParcial() != null ? rol.getTipoParcial().name() : null)
                        .docenteNombre(rol.getDocenteNombre())
                        .mensaje(String.format("El examen de %s (%s) fue verificado y aprobado conforme por la dirección académica.",
                                rol.getMateriaNombre(), rol.getGrupo()))
                        .fecha(fechaStr)
                        .ruta("/banco-preguntas")
                        .queryParams(Map.of("rolId", rol.getId()))
                        .textoAccion("Ver examen")
                        .nivel("success")
                        .build());
            }

            // 3. Examen sin cartilla pendiente de notas
            boolean esSinCartilla = rol.getModalidad() == ModalidadExamen.PRESENCIAL_SIN_CARTILLA;
            boolean habilitadoParaNotas = rol.getEstadoFlujo() == EstadoFlujo.PENDIENTE_NOTAS
                    || rol.getEstadoFlujo() == EstadoFlujo.DEVUELTO
                    || rol.getEstadoFlujo() == EstadoFlujo.ENTREGADO
                    || (rol.getEstadoFlujo() == EstadoFlujo.IMPRESO
                        && (rol.getFecha() == null || !rol.getFecha().isAfter(LocalDate.now())));
            if (esSinCartilla && habilitadoParaNotas) {
                String fechaStr = rol.getActualizadoEn() != null
                        ? rol.getActualizadoEn().format(DateTimeFormatter.ISO_DATE_TIME)
                        : null;

                lista.add(NotificacionItemDto.builder()
                        .id("sin-cartilla-notas-" + rol.getId())
                        .tipo("NOTAS_SIN_CARTILLA_PENDIENTES")
                        .titulo("Examen sin cartilla: Subir notas")
                        .materiaCodigo(rol.getMateriaCodigo())
                        .materiaNombre(rol.getMateriaNombre())
                        .grupo(rol.getGrupo())
                        .parcial(rol.getTipoParcial() != null ? rol.getTipoParcial().name() : null)
                        .docenteNombre(rol.getDocenteNombre())
                        .mensaje(String.format("El examen sin cartilla de %s (%s) no tiene notas subidas aún. Ingresa a registrar las calificaciones sobre 60 puntos.",
                                rol.getMateriaNombre(), rol.getGrupo()))
                        .fecha(fechaStr)
                        .ruta("/banco-preguntas")
                        .queryParams(Map.of("rolId", rol.getId(), "abrirNotas", "true"))
                        .textoAccion("Cargar notas")
                        .nivel("warning")
                        .build());
            }
        }
        return lista;
    }

    private List<NotificacionItemDto> obtenerNotificacionesDirector(Authentication authentication) {
        List<RolExamen> todosLosRoles = rolExamenRepository.findAll();
        List<RolExamen> rolesDirector = accesoAcademicoService.filtrarRolesParaUsuario(todosLosRoles, authentication);
        if (rolesDirector.isEmpty()) {
            return List.of();
        }

        Set<String> rolesIds = rolesDirector.stream().map(RolExamen::getId).collect(Collectors.toSet());
        Map<String, VerificacionExamen> verificaciones = verificacionExamenRepository.findByRolExamenIdIn(rolesIds).stream()
                .collect(Collectors.toMap(VerificacionExamen::getRolExamenId, v -> v, (v1, v2) -> v1));

        List<NotificacionItemDto> lista = new ArrayList<>();
        LocalDateTime ahora = LocalDateTime.now();

        for (RolExamen rol : rolesDirector) {
            String docente = rol.getDocenteNombre() != null && !rol.getDocenteNombre().isBlank()
                    ? rol.getDocenteNombre().trim() : "Docente por designar";
            VerificacionExamen verif = verificaciones.get(rol.getId());
            String estadoVerif = verif != null ? verif.getEstado() : null;

            // 1. Grupos con observaciones en la verificación (DEVUELTO)
            if ("DEVUELTO".equalsIgnoreCase(estadoVerif)) {
                String fechaStr = verif.getFechaVerificacion() != null
                        ? verif.getFechaVerificacion().format(DateTimeFormatter.ISO_DATE_TIME)
                        : (rol.getActualizadoEn() != null ? rol.getActualizadoEn().format(DateTimeFormatter.ISO_DATE_TIME) : null);

                lista.add(NotificacionItemDto.builder()
                        .id("dir-obs-" + rol.getId())
                        .tipo("OBSERVACION_BANCO")
                        .titulo("Examen observado en verificación")
                        .materiaCodigo(rol.getMateriaCodigo())
                        .materiaNombre(rol.getMateriaNombre())
                        .grupo(rol.getGrupo())
                        .parcial(rol.getTipoParcial() != null ? rol.getTipoParcial().name() : null)
                        .docenteNombre(docente)
                        .mensaje(String.format("Docente: %s. El banco de preguntas de %s (%s) fue devuelto con observaciones por el verificador. Comuníquese con el docente para su corrección urgente.",
                                docente, rol.getMateriaNombre(), rol.getGrupo()))
                        .fecha(fechaStr)
                        .ruta("/rol-examenes")
                        .queryParams(Map.of("busqueda", rol.getMateriaCodigo() != null ? rol.getMateriaCodigo() : rol.getMateriaNombre()))
                        .textoAccion("Ver en rol")
                        .nivel("error")
                        .horasRestantes(0)
                        .build());
            }

            // 2. Grupos a menos de 72 horas del examen sin banco de preguntas validado
            boolean noEstaValidado = rol.getEstadoFlujo() == EstadoFlujo.PROGRAMADO;
            boolean noEstaSuspendido = rol.getEstadoFlujo() != EstadoFlujo.SUSPENDIDO;
            boolean noEsDevuelto = !"DEVUELTO".equalsIgnoreCase(estadoVerif);

            if (noEstaValidado && noEstaSuspendido && noEsDevuelto && rol.getFecha() != null) {
                LocalDateTime fechaHoraExamen = parseFechaHoraExamen(rol.getFecha(), rol.getHorario());
                if (fechaHoraExamen != null) {
                    long diffHoras = java.time.Duration.between(ahora, fechaHoraExamen).toHours();
                    if (diffHoras <= 72 && diffHoras >= -12) {
                        String tiempoRestante;
                        if (diffHoras <= 0) {
                            tiempoRestante = "Examen programado para hoy";
                        } else if (diffHoras < 24) {
                            tiempoRestante = String.format("Faltan %dh", diffHoras);
                        } else {
                            long dias = diffHoras / 24;
                            long horas = diffHoras % 24;
                            tiempoRestante = String.format("Faltan %dd %dh", dias, horas);
                        }

                        lista.add(NotificacionItemDto.builder()
                                .id("dir-72h-" + rol.getId())
                                .tipo("EXAMEN_SIN_BANCO_72H")
                                .titulo("Examen en < 72h sin banco validado")
                                .materiaCodigo(rol.getMateriaCodigo())
                                .materiaNombre(rol.getMateriaNombre())
                                .grupo(rol.getGrupo())
                                .parcial(rol.getTipoParcial() != null ? rol.getTipoParcial().name() : null)
                                .docenteNombre(docente)
                                .mensaje(String.format("Docente: %s. Examen el %s a las %s (%s). Aún no ha cargado ni validado su banco de preguntas.",
                                        docente,
                                        rol.getFechaDisplay() != null ? rol.getFechaDisplay() : rol.getFecha().toString(),
                                        rol.getHorario() != null ? rol.getHorario() : "horario regular",
                                        tiempoRestante))
                                .fecha(rol.getFecha().toString())
                                .ruta("/rol-examenes")
                                .queryParams(Map.of("busqueda", rol.getMateriaCodigo() != null ? rol.getMateriaCodigo() : rol.getMateriaNombre()))
                                .textoAccion("Ver en rol")
                                .nivel("error")
                                .horasRestantes((int) Math.max(0, diffHoras))
                                .build());
                    }
                }
            }
        }

        lista.sort(Comparator.comparingInt(n -> n.getHorasRestantes() != null ? n.getHorasRestantes() : 999));
        return lista;
    }

    private LocalDateTime parseFechaHoraExamen(LocalDate fecha, String horario) {
        if (fecha == null) return null;
        int hora = 8;
        int min = 0;
        if (horario != null && !horario.isBlank()) {
            Matcher matcher = Pattern.compile("(\\d{1,2}):(\\d{2})").matcher(horario);
            if (matcher.find()) {
                try {
                    hora = Integer.parseInt(matcher.group(1));
                    min = Integer.parseInt(matcher.group(2));
                } catch (NumberFormatException ignored) {}
            }
        }
        return LocalDateTime.of(fecha, LocalTime.of(hora, min));
    }

    private boolean tieneRol(Authentication authentication, String rol) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + rol));
    }
}
