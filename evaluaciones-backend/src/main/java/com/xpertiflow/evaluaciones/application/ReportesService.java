package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.reportes.*;
import com.xpertiflow.evaluaciones.domain.entity.*;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportesService {

    private final RolExamenRepository rolExamenRepository;
    private final VerificacionExamenRepository verificacionExamenRepository;
    private final HistorialVerificacionRepository historialVerificacionRepository;
    private final BancoPreguntasRepository bancoPreguntasRepository;
    private final CalificacionOmrRepository calificacionOmrRepository;
    private final ObjectMapper objectMapper;

    @Autowired(required = false)
    private AccesoAcademicoService accesoAcademicoService;

    public ReporteCalidadResumenDto obtenerReporteCalidad(
            String sedeCodigo,
            String carreraCodigo,
            String tipoParcial,
            String estadoCalidadFiltro,
            String criterioBusqueda) {
        return obtenerReporteCalidad(sedeCodigo, carreraCodigo, tipoParcial, estadoCalidadFiltro, criterioBusqueda, null);
    }

    public ReporteCalidadResumenDto obtenerReporteCalidad(
            String sedeCodigo,
            String carreraCodigo,
            String tipoParcial,
            String estadoCalidadFiltro,
            String criterioBusqueda,
            Authentication authentication) {

        List<RolExamen> roles = obtenerRolesFiltrados(sedeCodigo, carreraCodigo, tipoParcial, authentication);
        if (roles.isEmpty()) {
            return ReporteCalidadResumenDto.builder()
                    .totalExamenes(0)
                    .aprobadosDirectos(0)
                    .observadosYLuegoAprobados(0)
                    .observadosPendientes(0)
                    .pendientesRevision(0)
                    .sinBanco(0)
                    .porcentajeAprobadosDirectos(0.0)
                    .porcentajeObservados(0.0)
                    .items(new ArrayList<>())
                    .build();
        }

        List<String> rolIds = roles.stream().map(RolExamen::getId).toList();

        Map<String, VerificacionExamen> verificacionesPorRolId = verificacionExamenRepository.findByRolExamenIdIn(rolIds)
                .stream()
                .collect(Collectors.toMap(VerificacionExamen::getRolExamenId, v -> v, (v1, v2) -> v1));

        Map<String, List<HistorialVerificacion>> devolucionesPorRolId = historialVerificacionRepository.findByRolExamenIdIn(rolIds)
                .stream()
                .collect(Collectors.groupingBy(HistorialVerificacion::getRolExamenId,
                        Collectors.collectingAndThen(Collectors.toList(), list -> {
                            list.sort(Comparator.comparing(HistorialVerificacion::getFechaDevolucion,
                                    Comparator.nullsLast(Comparator.reverseOrder()))
                                    .thenComparing(HistorialVerificacion::getId, Comparator.nullsLast(Comparator.reverseOrder())));
                            return list;
                        })));

        Map<String, BancoPreguntas> bancosPorRolId = bancoPreguntasRepository.findByRolExamenIdIn(rolIds)
                .stream()
                .collect(Collectors.toMap(BancoPreguntas::getRolExamenId, b -> b,
                        (b1, b2) -> b1.getFechaAprobacion() != null && (b2.getFechaAprobacion() == null || b1.getFechaAprobacion().isAfter(b2.getFechaAprobacion())) ? b1 : b2));

        List<ReporteCalidadItemDto> todosLosItems = new ArrayList<>();

        for (RolExamen rol : roles) {
            BancoPreguntas banco = bancosPorRolId.get(rol.getId());
            VerificacionExamen verificacion = verificacionesPorRolId.get(rol.getId());
            List<HistorialVerificacion> devoluciones = devolucionesPorRolId.getOrDefault(rol.getId(), Collections.emptyList());

            List<HistorialObservacionItemDto> observacionesDtos = new ArrayList<>();
            if (verificacion != null && "DEVUELTO".equalsIgnoreCase(verificacion.getEstado())) {
                observacionesDtos.add(HistorialObservacionItemDto.builder()
                        .devolucionId(0L)
                        .fechaDevolucion(verificacion.getFechaVerificacion() != null ? verificacion.getFechaVerificacion() : (verificacion.getActualizadoEn() != null ? verificacion.getActualizadoEn() : LocalDateTime.now()))
                        .verificadoPor(verificacion.getVerificadoPor())
                        .observacionesGenerales(verificacion.getObservacionesGenerales())
                        .observacionesPreguntasJson(verificacion.getObservacionesPreguntasJson())
                        .totalPreguntasObservadas(contarPreguntasObservadas(verificacion.getObservacionesPreguntasJson()))
                        .build());
            }
            devoluciones.forEach(d -> observacionesDtos.add(HistorialObservacionItemDto.builder()
                    .devolucionId(d.getId())
                    .fechaDevolucion(d.getFechaDevolucion())
                    .verificadoPor(d.getVerificadoPor())
                    .observacionesGenerales(d.getObservacionesGenerales())
                    .observacionesPreguntasJson(d.getObservacionesPreguntasJson())
                    .totalPreguntasObservadas(contarPreguntasObservadas(d.getObservacionesPreguntasJson()))
                    .build()));

            String estadoCalidad;
            if (banco == null) {
                estadoCalidad = "SIN_BANCO";
            } else {
                boolean esDevuelto = esEstadoDevuelto(rol, verificacion);
                boolean esAprobado = !esDevuelto && esEstadoAprobado(rol, verificacion);

                if (!observacionesDtos.isEmpty()) {
                    if (esDevuelto) {
                        estadoCalidad = "OBSERVADO_PENDIENTE";
                    } else if (esAprobado) {
                        estadoCalidad = "OBSERVADO_Y_APROBADO";
                    } else {
                        estadoCalidad = "PENDIENTE_REVISION";
                    }
                } else {
                    if (esDevuelto) {
                        estadoCalidad = "OBSERVADO_PENDIENTE";
                    } else if (esAprobado) {
                        estadoCalidad = "APROBADO_DIRECTO";
                    } else {
                        estadoCalidad = "PENDIENTE_REVISION";
                    }
                }
            }

            String ultimoVerificador = !observacionesDtos.isEmpty()
                    ? observacionesDtos.get(0).getVerificadoPor()
                    : (verificacion != null ? verificacion.getVerificadoPor() : null);

            var ultimaObsFecha = !observacionesDtos.isEmpty()
                    ? observacionesDtos.get(0).getFechaDevolucion()
                    : null;

            String aprobadoPor = (verificacion != null && "VERIFICADO".equalsIgnoreCase(verificacion.getEstado()))
                    ? verificacion.getVerificadoPor()
                    : (banco != null ? banco.getDocenteAprobador() : null);

            var fechaAprobacion = (verificacion != null && "VERIFICADO".equalsIgnoreCase(verificacion.getEstado()) && verificacion.getFechaVerificacion() != null)
                    ? verificacion.getFechaVerificacion()
                    : (rol.getFechaValidacion() != null ? rol.getFechaValidacion() : (banco != null ? banco.getFechaAprobacion() : null));

            ReporteCalidadItemDto item = ReporteCalidadItemDto.builder()
                    .rolExamenId(rol.getId())
                    .materiaCodigo(rol.getMateriaCodigo())
                    .materiaNombre(rol.getMateriaNombre())
                    .grupo(rol.getGrupo())
                    .carreraCodigo(rol.getCarreraCodigo())
                    .carreraNombre(rol.getCarreraNombre())
                    .sedeCodigo(rol.getSedeCodigo())
                    .sedeNombre(rol.getSedeNombre())
                    .campus(rol.getCampus())
                    .docenteNombre(rol.getDocenteNombre())
                    .docenteCi(rol.getDocenteCi())
                    .tipoParcial(rol.getTipoParcial() != null ? rol.getTipoParcial().getValor() : "")
                    .fechaExamen(rol.getFecha())
                    .horaExamen(rol.getHorario())
                    .estadoFlujo(rol.getEstadoFlujo() != null ? rol.getEstadoFlujo().name() : "")
                    .estadoCalidad(estadoCalidad)
                    .totalObservaciones(observacionesDtos.size())
                    .ultimaObservacionFecha(ultimaObsFecha)
                    .ultimoVerificador(ultimoVerificador)
                    .aprobadoPor(aprobadoPor)
                    .fechaAprobacion(fechaAprobacion)
                    .observaciones(observacionesDtos)
                    .build();

            todosLosItems.add(item);
        }

        int totalExamenes = todosLosItems.size();
        int aprobadosDirectos = (int) todosLosItems.stream().filter(i -> "APROBADO_DIRECTO".equals(i.getEstadoCalidad())).count();
        int observadosYLuegoAprobados = (int) todosLosItems.stream().filter(i -> "OBSERVADO_Y_APROBADO".equals(i.getEstadoCalidad())).count();
        int observadosPendientes = (int) todosLosItems.stream().filter(i -> "OBSERVADO_PENDIENTE".equals(i.getEstadoCalidad())).count();
        int pendientesRevision = (int) todosLosItems.stream().filter(i -> "PENDIENTE_REVISION".equals(i.getEstadoCalidad())).count();
        int sinBanco = (int) todosLosItems.stream().filter(i -> "SIN_BANCO".equals(i.getEstadoCalidad())).count();

        double porcentajeAprobadosDirectos = totalExamenes > 0
                ? Math.round((aprobadosDirectos * 1000.0 / totalExamenes)) / 10.0
                : 0.0;
        double porcentajeObservados = totalExamenes > 0
                ? Math.round((observadosYLuegoAprobados * 1000.0 / totalExamenes)) / 10.0
                : 0.0;

        List<ReporteCalidadItemDto> itemsFiltrados = todosLosItems.stream()
                .filter(item -> {
                    if (estadoCalidadFiltro != null && !estadoCalidadFiltro.isBlank() && !"TODOS".equalsIgnoreCase(estadoCalidadFiltro.trim())) {
                        if (!item.getEstadoCalidad().equalsIgnoreCase(estadoCalidadFiltro.trim())) {
                            return false;
                        }
                    }
                    if (criterioBusqueda != null && !criterioBusqueda.isBlank()) {
                        String busquedaNorm = criterioBusqueda.trim().toLowerCase();
                        String contenido = (item.getMateriaCodigo() + " " +
                                item.getMateriaNombre() + " " +
                                item.getDocenteNombre() + " " +
                                item.getDocenteCi() + " " +
                                item.getGrupo() + " " +
                                item.getCarreraNombre() + " " +
                                item.getSedeNombre()).toLowerCase();
                        if (!contenido.contains(busquedaNorm)) {
                            return false;
                        }
                    }
                    return true;
                })
                .toList();

        List<ReporteCalidadItemDto> itemsOrdenados = itemsFiltrados.stream()
                .sorted(Comparator.comparing(ReporteCalidadItemDto::getMateriaCodigo, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
                        .thenComparing(ReporteCalidadItemDto::getGrupo, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .toList();

        return ReporteCalidadResumenDto.builder()
                .totalExamenes(totalExamenes)
                .aprobadosDirectos(aprobadosDirectos)
                .observadosYLuegoAprobados(observadosYLuegoAprobados)
                .observadosPendientes(observadosPendientes)
                .pendientesRevision(pendientesRevision)
                .sinBanco(sinBanco)
                .porcentajeAprobadosDirectos(porcentajeAprobadosDirectos)
                .porcentajeObservados(porcentajeObservados)
                .items(itemsOrdenados)
                .build();
    }

    public ReporteCoberturaBancosResumenDto obtenerCoberturaBancos(
            String sedeCodigo,
            String carreraCodigo,
            String tipoParcial) {
        return obtenerCoberturaBancos(sedeCodigo, carreraCodigo, tipoParcial, null);
    }

    public ReporteCoberturaBancosResumenDto obtenerCoberturaBancos(
            String sedeCodigo,
            String carreraCodigo,
            String tipoParcial,
            Authentication authentication) {

        List<RolExamen> roles = obtenerRolesFiltrados(sedeCodigo, carreraCodigo, tipoParcial, authentication);
        if (roles.isEmpty()) {
            return ReporteCoberturaBancosResumenDto.builder()
                    .sedeCodigo(sedeCodigo)
                    .carreraCodigo(carreraCodigo)
                    .totalMaterias(0)
                    .materiasConBanco(0)
                    .materiasSinBanco(0)
                    .porcentajeCobertura(0.0)
                    .carreras(new ArrayList<>())
                    .items(new ArrayList<>())
                    .build();
        }

        List<String> rolIds = roles.stream().map(RolExamen::getId).toList();
        Map<String, BancoPreguntas> bancosPorRolId = bancoPreguntasRepository.findByRolExamenIdIn(rolIds)
                .stream()
                .collect(Collectors.toMap(BancoPreguntas::getRolExamenId, b -> b,
                        (b1, b2) -> b1.getFechaAprobacion() != null && (b2.getFechaAprobacion() == null || b1.getFechaAprobacion().isAfter(b2.getFechaAprobacion())) ? b1 : b2));

        List<ReporteCoberturaBancosItemDto> items = new ArrayList<>();

        for (RolExamen rol : roles) {
            BancoPreguntas banco = bancosPorRolId.get(rol.getId());
            boolean tieneBanco = banco != null;

            ReporteCoberturaBancosItemDto item = ReporteCoberturaBancosItemDto.builder()
                    .rolExamenId(rol.getId())
                    .carreraCodigo(rol.getCarreraCodigo())
                    .carreraNombre(rol.getCarreraNombre())
                    .sedeCodigo(rol.getSedeCodigo())
                    .sedeNombre(rol.getSedeNombre())
                    .materiaCodigo(rol.getMateriaCodigo())
                    .materiaNombre(rol.getMateriaNombre())
                    .grupo(rol.getGrupo())
                    .semestre(rol.getSemestre())
                    .docenteNombre(rol.getDocenteNombre())
                    .docenteCi(rol.getDocenteCi())
                    .tipoParcial(rol.getTipoParcial() != null ? rol.getTipoParcial().getValor() : "")
                    .fechaExamen(rol.getFecha())
                    .horaExamen(rol.getHorario())
                    .tieneBanco(tieneBanco)
                    .estadoBanco(tieneBanco ? banco.getEstado() : "SIN_BANCO")
                    .totalReactivos(tieneBanco ? banco.getTotalReactivos() : 0)
                    .facilesCount(tieneBanco ? banco.getFacilesCount() : 0)
                    .mediasCount(tieneBanco ? banco.getMediasCount() : 0)
                    .dificilesCount(tieneBanco ? banco.getDificilesCount() : 0)
                    .fechaAprobacionBanco(tieneBanco ? banco.getFechaAprobacion() : null)
                    .build();

            items.add(item);
        }

        int totalMaterias = items.size();
        int materiasConBanco = (int) items.stream().filter(ReporteCoberturaBancosItemDto::isTieneBanco).count();
        int materiasSinBanco = totalMaterias - materiasConBanco;
        double porcentajeCobertura = totalMaterias > 0
                ? Math.round((materiasConBanco * 1000.0 / totalMaterias)) / 10.0
                : 0.0;

        Map<String, List<ReporteCoberturaBancosItemDto>> porCarrera = items.stream()
                .collect(Collectors.groupingBy(ReporteCoberturaBancosItemDto::getCarreraCodigo));

        List<ReporteCoberturaCarreraDto> carrerasResumen = new ArrayList<>();
        porCarrera.forEach((codigo, lista) -> {
            int tot = lista.size();
            int con = (int) lista.stream().filter(ReporteCoberturaBancosItemDto::isTieneBanco).count();
            int sin = tot - con;
            double pct = tot > 0 ? Math.round((con * 1000.0 / tot)) / 10.0 : 0.0;
            String carreraNom = lista.get(0).getCarreraNombre();
            String sedeCod = lista.get(0).getSedeCodigo();
            String sedeNom = lista.get(0).getSedeNombre();

            carrerasResumen.add(ReporteCoberturaCarreraDto.builder()
                    .carreraCodigo(codigo)
                    .carreraNombre(carreraNom)
                    .sedeCodigo(sedeCod)
                    .sedeNombre(sedeNom)
                    .totalMaterias(tot)
                    .materiasConBanco(con)
                    .materiasSinBanco(sin)
                    .porcentajeCobertura(pct)
                    .build());
        });

        carrerasResumen.sort(Comparator.comparing(ReporteCoberturaCarreraDto::getCarreraNombre));

        return ReporteCoberturaBancosResumenDto.builder()
                .sedeCodigo(sedeCodigo)
                .sedeNombre(!items.isEmpty() ? items.get(0).getSedeNombre() : "")
                .carreraCodigo(carreraCodigo)
                .carreraNombre(!items.isEmpty() ? items.get(0).getCarreraNombre() : "")
                .totalMaterias(totalMaterias)
                .materiasConBanco(materiasConBanco)
                .materiasSinBanco(materiasSinBanco)
                .porcentajeCobertura(porcentajeCobertura)
                .carreras(carrerasResumen)
                .items(items)
                .build();
    }

    public ReporteConsolidadoOmrResumenDto obtenerConsolidadoOmr(
            String sedeCodigo,
            String carreraCodigo,
            String tipoParcial) {
        return obtenerConsolidadoOmr(sedeCodigo, carreraCodigo, tipoParcial, null);
    }

    public ReporteConsolidadoOmrResumenDto obtenerConsolidadoOmr(
            String sedeCodigo,
            String carreraCodigo,
            String tipoParcial,
            Authentication authentication) {

        List<RolExamen> roles = obtenerRolesFiltrados(sedeCodigo, carreraCodigo, tipoParcial, authentication);
        if (roles.isEmpty()) {
            return ReporteConsolidadoOmrResumenDto.builder()
                    .totalExamenesCalificados(0)
                    .totalInscritos(0)
                    .totalCalificados(0)
                    .totalAprobados(0)
                    .totalReprobados(0)
                    .promedioGeneral(0.0)
                    .porcentajeAprobacionGeneral(0.0)
                    .items(new ArrayList<>())
                    .build();
        }

        List<String> rolIds = roles.stream().map(RolExamen::getId).toList();
        List<CalificacionOmr> todasLasCalificaciones = calificacionOmrRepository.findByRolExamenIdIn(rolIds);

        Map<String, List<CalificacionOmr>> calificacionesPorRolId = todasLasCalificaciones.stream()
                .collect(Collectors.groupingBy(CalificacionOmr::getRolExamenId));

        List<ReporteConsolidadoOmrItemDto> items = new ArrayList<>();

        for (RolExamen rol : roles) {
            List<CalificacionOmr> califs = calificacionesPorRolId.getOrDefault(rol.getId(), Collections.emptyList());

            int totalInscritos = rol.getEstudiantesInscritosCount() != null && rol.getEstudiantesInscritosCount() > 0
                    ? rol.getEstudiantesInscritosCount()
                    : califs.size();

            int totalCalificados = califs.size();
            int totalAprobados = (int) califs.stream()
                    .filter(c -> (c.getNotaSobre100() != null && c.getNotaSobre100().doubleValue() >= 51.0)
                            || "APROBADO".equalsIgnoreCase(c.getEstadoCalificacion()))
                    .count();
            int totalReprobados = Math.max(0, totalCalificados - totalAprobados);

            double promedioNota = totalCalificados > 0
                    ? Math.round(califs.stream()
                    .filter(c -> c.getNotaSobre100() != null)
                    .mapToDouble(c -> c.getNotaSobre100().doubleValue())
                    .average().orElse(0.0) * 10.0) / 10.0
                    : 0.0;

            double porcentajeAprobacion = totalCalificados > 0
                    ? Math.round((totalAprobados * 1000.0 / totalCalificados)) / 10.0
                    : 0.0;

            String sincronizadoSea = Boolean.TRUE.equals(rol.getSincronizadoSea())
                    ? "SINCRONIZADO"
                    : "PENDIENTE";

            ReporteConsolidadoOmrItemDto item = ReporteConsolidadoOmrItemDto.builder()
                    .rolExamenId(rol.getId())
                    .materiaCodigo(rol.getMateriaCodigo())
                    .materiaNombre(rol.getMateriaNombre())
                    .grupo(rol.getGrupo())
                    .sedeCodigo(rol.getSedeCodigo())
                    .sedeNombre(rol.getSedeNombre())
                    .carreraCodigo(rol.getCarreraCodigo())
                    .carreraNombre(rol.getCarreraNombre())
                    .docenteNombre(rol.getDocenteNombre())
                    .tipoParcial(rol.getTipoParcial() != null ? rol.getTipoParcial().getValor() : "")
                    .fechaExamen(rol.getFecha())
                    .horaExamen(rol.getHorario())
                    .totalInscritos(totalInscritos)
                    .totalCalificados(totalCalificados)
                    .totalAprobados(totalAprobados)
                    .totalReprobados(totalReprobados)
                    .promedioNota(promedioNota)
                    .porcentajeAprobacion(porcentajeAprobacion)
                    .estadoSincronizacionSea(sincronizadoSea)
                    .build();

            items.add(item);
        }

        int totalExamenesCalificados = (int) items.stream().filter(i -> i.getTotalCalificados() > 0).count();
        int totalInscritos = items.stream().mapToInt(ReporteConsolidadoOmrItemDto::getTotalInscritos).sum();
        int totalCalificados = items.stream().mapToInt(ReporteConsolidadoOmrItemDto::getTotalCalificados).sum();
        int totalAprobados = items.stream().mapToInt(ReporteConsolidadoOmrItemDto::getTotalAprobados).sum();
        int totalReprobados = items.stream().mapToInt(ReporteConsolidadoOmrItemDto::getTotalReprobados).sum();

        double promedioGeneral = totalCalificados > 0
                ? Math.round(todasLasCalificaciones.stream()
                .filter(c -> c.getNotaSobre100() != null)
                .mapToDouble(c -> c.getNotaSobre100().doubleValue())
                .average().orElse(0.0) * 10.0) / 10.0
                : 0.0;

        double porcentajeAprobacionGeneral = totalCalificados > 0
                ? Math.round((totalAprobados * 1000.0 / totalCalificados)) / 10.0
                : 0.0;

        return ReporteConsolidadoOmrResumenDto.builder()
                .totalExamenesCalificados(totalExamenesCalificados)
                .totalInscritos(totalInscritos)
                .totalCalificados(totalCalificados)
                .totalAprobados(totalAprobados)
                .totalReprobados(totalReprobados)
                .promedioGeneral(promedioGeneral)
                .porcentajeAprobacionGeneral(porcentajeAprobacionGeneral)
                .items(items)
                .build();
    }

    private List<RolExamen> obtenerRolesFiltrados(
            String sedeCodigo,
            String carreraCodigo,
            String tipoParcial,
            Authentication authentication) {

        List<RolExamen> roles = rolExamenRepository.findAll();

        if (authentication != null && accesoAcademicoService != null) {
            roles = accesoAcademicoService.filtrarRolesParaUsuario(roles, authentication);
        }

        return roles.stream()
                .filter(rol -> rol.getEstadoFlujo() != EstadoFlujo.SUSPENDIDO)
                .filter(rol -> {
                    if (sedeCodigo != null && !sedeCodigo.isBlank() && !"TODOS".equalsIgnoreCase(sedeCodigo.trim())) {
                        if (!rol.getSedeCodigo().equalsIgnoreCase(sedeCodigo.trim())) {
                            return false;
                        }
                    }
                    if (carreraCodigo != null && !carreraCodigo.isBlank() && !"TODOS".equalsIgnoreCase(carreraCodigo.trim())) {
                        if (!rol.getCarreraCodigo().equalsIgnoreCase(carreraCodigo.trim())) {
                            return false;
                        }
                    }
                    if (tipoParcial != null && !tipoParcial.isBlank() && !"TODOS".equalsIgnoreCase(tipoParcial.trim())) {
                        String tpNorm = tipoParcial.trim();
                        boolean coincideNombre = rol.getTipoParcial() != null && rol.getTipoParcial().name().equalsIgnoreCase(tpNorm);
                        boolean coincideValor = rol.getTipoParcial() != null && rol.getTipoParcial().getValor().equalsIgnoreCase(tpNorm);
                        if (!coincideNombre && !coincideValor) {
                            return false;
                        }
                    }
                    return true;
                })
                .sorted(Comparator.comparing(RolExamen::getMateriaCodigo, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER))
                        .thenComparing(RolExamen::getGrupo, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)))
                .toList();
    }

    private boolean esEstadoAprobado(RolExamen rol, VerificacionExamen verificacion) {
        if (verificacion != null) {
            return "VERIFICADO".equalsIgnoreCase(verificacion.getEstado());
        }
        if (rol.getEstadoFlujo() != null) {
            EstadoFlujo ef = rol.getEstadoFlujo();
            return ef == EstadoFlujo.GENERADO
                    || ef == EstadoFlujo.IMPRESO
                    || ef == EstadoFlujo.ENTREGADO
                    || ef == EstadoFlujo.PENDIENTE_NOTAS
                    || ef == EstadoFlujo.CALIFICADO
                    || ef == EstadoFlujo.CONFIRMADO;
        }
        return false;
    }

    private boolean esEstadoDevuelto(RolExamen rol, VerificacionExamen verificacion) {
        if (verificacion != null && "DEVUELTO".equalsIgnoreCase(verificacion.getEstado())) {
            return true;
        }
        return rol.getEstadoFlujo() == EstadoFlujo.DEVUELTO;
    }

    private int contarPreguntasObservadas(String json) {
        if (json == null || json.isBlank() || "{}".equals(json.trim())) {
            return 0;
        }
        try {
            JsonNode nodo = objectMapper.readTree(json);
            if (nodo.isObject()) {
                int contador = 0;
                Iterator<Map.Entry<String, JsonNode>> campos = nodo.fields();
                while (campos.hasNext()) {
                    Map.Entry<String, JsonNode> entrada = campos.next();
                    if (entrada.getValue() != null && !entrada.getValue().asText("").isBlank()) {
                        contador++;
                    }
                }
                return contador;
            } else if (nodo.isArray()) {
                return nodo.size();
            }
        } catch (Exception e) {
            log.debug("No se pudo interpretar JSON de observaciones de preguntas: {}", json);
        }
        return 0;
    }
}
