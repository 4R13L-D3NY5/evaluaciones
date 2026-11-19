package com.xpertiflow.evaluaciones.application.evaluaciondocente;

import com.xpertiflow.evaluaciones.api.dto.evaluaciondocente.CumplimientoEvaluacionDto;
import com.xpertiflow.evaluaciones.api.dto.evaluaciondocente.DocenteRatificacionMateriaDto;
import com.xpertiflow.evaluaciones.api.dto.evaluaciondocente.EvaluacionConsolidadaDocenteMateriaDto;
import com.xpertiflow.evaluaciones.api.dto.evaluaciondocente.ModificarRatificacionRequestDto;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaUsuario;
import com.xpertiflow.evaluaciones.domain.entity.ConfiguracionEvaluaciones;
import com.xpertiflow.evaluaciones.domain.entity.DocenteRatificacion;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.entity.UsuarioSistema;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaUsuarioRepository;
import com.xpertiflow.evaluaciones.domain.repository.ConfiguracionEvaluacionesRepository;
import com.xpertiflow.evaluaciones.domain.repository.DocenteRatificacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.domain.repository.UsuarioSistemaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class EvaluacionDocenteReportesService {

    private final EvaluacionDocenteEstudianteService evaluacionDocenteEstudianteService;
    private final DocenteRatificacionRepository docenteRatificacionRepository;
    private final ConfiguracionEvaluacionesRepository configuracionEvaluacionesRepository;
    private final UsuarioSistemaRepository usuarioRepository;
    private final AuditoriaUsuarioRepository auditoriaUsuarioRepository;
    private final RolExamenRepository rolExamenRepository;

    /**
     * Consulta el estado del período de evaluación docente (abierto o cerrado).
     */
    @Transactional(readOnly = true)
    public boolean obtenerEstadoPeriodo() {
        return configuracionEvaluacionesRepository.findById((short) 1)
                .map(ConfiguracionEvaluaciones::getPeriodoEvaluacionDocenteAbierto)
                .orElse(true);
    }

    /**
     * Conmuta el estado del período de evaluación docente (exclusivo Administrador).
     */
    @Transactional
    public boolean conmutarPeriodoEvaluacion(boolean abierto, Authentication authentication, String ipOrigen) {
        ConfiguracionEvaluaciones config = configuracionEvaluacionesRepository.findById((short) 1)
                .orElseGet(() -> {
                    ConfiguracionEvaluaciones c = new ConfiguracionEvaluaciones();
                    c.setId((short) 1);
                    return c;
                });
        config.setPeriodoEvaluacionDocenteAbierto(abierto);
        config.setActualizadoEn(LocalDateTime.now());
        String actor = authentication != null ? authentication.getName() : "ADMIN";
        config.setActualizadoPor(actor);
        configuracionEvaluacionesRepository.save(config);

        AuditoriaUsuario auditoria = new AuditoriaUsuario();
        auditoria.setAccion("PERIODO_EVALUACION_DOCENTE_CONMUTADO");
        auditoria.setRealizadoPor(actor);
        auditoria.setDetalle("Se " + (abierto ? "ABRIO" : "CERRO") + " el periodo de evaluacion docente institucional");
        auditoria.setIpOrigen(ipOrigen != null && !ipOrigen.isBlank() ? ipOrigen : "127.0.0.1");
        auditoria.setFechaEvento(LocalDateTime.now());
        auditoriaUsuarioRepository.save(auditoria);

        log.info("Período de evaluación docente conmutado a abierto={} por {}", abierto, actor);
        return abierto;
    }

    /**
     * Reporte de Ratificación de Docentes por Materia.
     * Regla institucional:
     * - Nota Final (Director 50% + Estudiantes 50%) >= 71.00 -> RATIFICADO
     * - Nota Final <= 70.99 -> NO_RATIFICADO
     */
    @Transactional
    public List<DocenteRatificacionMateriaDto> listarReporteRatificados(
            String gestion, String sedeCodigo, String carreraCodigo, String estadoFiltro) {

        if (sedeCodigo == null || sedeCodigo.isBlank()) {
            return Collections.emptyList();
        }

        // Obtener carreras a procesar
        List<String> carreras = new ArrayList<>();
        if (carreraCodigo != null && !carreraCodigo.isBlank() && !"TODAS".equalsIgnoreCase(carreraCodigo)) {
            carreras.add(carreraCodigo.trim());
        } else {
            List<RolExamen> rolesSede = rolExamenRepository.findBySedeCodigo(sedeCodigo.trim());
            rolesSede.stream()
                    .map(RolExamen::getCarreraCodigo)
                    .filter(c -> c != null && !c.isBlank())
                    .distinct()
                    .forEach(carreras::add);
        }

        List<DocenteRatificacionMateriaDto> resultado = new ArrayList<>();

        for (String carCod : carreras) {
            List<EvaluacionConsolidadaDocenteMateriaDto> consolidados =
                    evaluacionDocenteEstudianteService.listarResumenConsolidado(sedeCodigo.trim(), carCod, gestion);

            for (EvaluacionConsolidadaDocenteMateriaDto c : consolidados) {
                BigDecimal notaDir = c.getDirectorPuntos50() != null ? c.getDirectorPuntos50() : BigDecimal.ZERO;
                BigDecimal notaEst = c.getEstudiantesPuntos50() != null ? c.getEstudiantesPuntos50() : BigDecimal.ZERO;
                BigDecimal notaTotal = notaDir.add(notaEst).setScale(2, RoundingMode.HALF_UP);

                // Regla oficial: >= 71 RATIFICADO, <= 70 NO_RATIFICADO
                String estadoCalc = notaTotal.compareTo(BigDecimal.valueOf(71)) >= 0 ? "RATIFICADO" : "NO_RATIFICADO";

                String docCi = c.getDocenteCi() != null ? c.getDocenteCi().trim() : "";
                String matCod = c.getMateriaCodigo() != null ? c.getMateriaCodigo().trim() : "";

                Optional<DocenteRatificacion> optR = docenteRatificacionRepository
                        .findByGestionAndSedeCodigoAndCarreraCodigoAndMateriaCodigoAndDocenteCi(
                                c.getGestion(), c.getSedeCodigo(), c.getCarreraCodigo(), matCod, docCi);

                DocenteRatificacion r;
                if (optR.isPresent()) {
                    r = optR.get();
                    r.setNotaDirector(notaDir);
                    r.setNotaEstudiantes(notaEst);
                    r.setNotaFinal(notaTotal);
                    r.setEstadoCalculado(estadoCalc);
                    if (!r.isEsModificadoManualmente()) {
                        r.setEstadoDefinitivo(estadoCalc);
                    }
                    r = docenteRatificacionRepository.save(r);
                } else {
                    r = DocenteRatificacion.builder()
                            .gestion(c.getGestion())
                            .sedeCodigo(c.getSedeCodigo())
                            .carreraCodigo(c.getCarreraCodigo())
                            .materiaCodigo(matCod)
                            .materiaNombre(c.getMateriaNombre())
                            .grupoCodigo(c.getGrupoCodigo() != null ? c.getGrupoCodigo() : "")
                            .docenteCi(docCi)
                            .docenteNombre(c.getDocenteNombre())
                            .notaDirector(notaDir)
                            .notaEstudiantes(notaEst)
                            .notaFinal(notaTotal)
                            .estadoCalculado(estadoCalc)
                            .estadoDefinitivo(estadoCalc)
                            .esModificadoManualmente(false)
                            .build();
                    r = docenteRatificacionRepository.save(r);
                }

                // Filtrar si se solicitó estadoFiltro (RATIFICADO o NO_RATIFICADO)
                if (estadoFiltro != null && !estadoFiltro.isBlank() && !"TODOS".equalsIgnoreCase(estadoFiltro)) {
                    if (!r.getEstadoDefinitivo().equalsIgnoreCase(estadoFiltro.trim())) {
                        continue;
                    }
                }

                resultado.add(DocenteRatificacionMateriaDto.builder()
                        .id(r.getId())
                        .gestion(r.getGestion())
                        .sedeCodigo(r.getSedeCodigo())
                        .carreraCodigo(r.getCarreraCodigo())
                        .materiaCodigo(r.getMateriaCodigo())
                        .materiaNombre(r.getMateriaNombre())
                        .grupoCodigo(r.getGrupoCodigo())
                        .docenteCi(r.getDocenteCi())
                        .docenteNombre(r.getDocenteNombre())
                        .notaDirector(r.getNotaDirector())
                        .notaEstudiantes(r.getNotaEstudiantes())
                        .notaFinal(r.getNotaFinal())
                        .estadoCalculado(r.getEstadoCalculado())
                        .estadoDefinitivo(r.getEstadoDefinitivo())
                        .esModificadoManualmente(r.isEsModificadoManualmente())
                        .modificadoPorUsuario(r.getModificadoPorUsuario())
                        .modificadoPorNombre(r.getModificadoPorNombre())
                        .motivoModificacion(r.getMotivoModificacion())
                        .fechaModificacion(r.getFechaModificacion())
                        .directorEvaluado(c.isDirectorEvaluado())
                        .totalEstudiantesEvaluaron(c.getTotalEstudiantesEvaluaron())
                        .totalEstudiantesMatriculados(c.getTotalEstudiantesMatriculados())
                        .estudiantesParticipacionPorcentaje(c.getEstudiantesParticipacionPorcentaje())
                        .build());
            }
        }

        // Ordenar alfabéticamente por docente y materia
        resultado.sort(Comparator.comparing(DocenteRatificacionMateriaDto::getDocenteNombre)
                .thenComparing(DocenteRatificacionMateriaDto::getMateriaNombre));

        return resultado;
    }

    /**
     * Modifica manualmente el estado de ratificación de un docente en una materia específica.
     * Solo usuarios autorizados:
     * - ADMINISTRADOR_SISTEMA
     * - TALENTO_HUMANO
     * - VICERRECTOR (o usuario) con puedeModificarRatificacionDocente == true
     */
    @Transactional
    public DocenteRatificacionMateriaDto modificarRatificacion(
            Long id, ModificarRatificacionRequestDto dto, Authentication authentication, String ipOrigen) {

        if (authentication == null) {
            throw new AccessDeniedException("Usuario no autenticado");
        }

        boolean esAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR_SISTEMA"));
        boolean esTalento = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_TALENTO_HUMANO"));

        UsuarioSistema usuarioAuth = usuarioRepository.findByUsuarioIgnoreCase(authentication.getName()).orElse(null);
        boolean puedeModificar = esAdmin || esTalento || (usuarioAuth != null && usuarioAuth.isPuedeModificarRatificacionDocente());

        if (!puedeModificar) {
            throw new AccessDeniedException("No tiene permisos para modificar la ratificación de docentes.");
        }

        DocenteRatificacion r = docenteRatificacionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Registro de ratificación no encontrado con ID: " + id));

        String estadoAnterior = r.getEstadoDefinitivo();
        r.setEstadoDefinitivo(dto.getNuevoEstado());
        r.setEsModificadoManualmente(true);
        r.setModificadoPorUsuario(authentication.getName());
        r.setModificadoPorNombre(usuarioAuth != null ? usuarioAuth.getNombreCompleto() : authentication.getName());
        r.setMotivoModificacion(dto.getMotivo().trim());
        r.setFechaModificacion(LocalDateTime.now());
        r = docenteRatificacionRepository.save(r);

        AuditoriaUsuario auditoria = new AuditoriaUsuario();
        auditoria.setAccion("DOCENTE_RATIFICACION_MODIFICADA");
        auditoria.setRealizadoPor(authentication.getName());
        auditoria.setDetalle(String.format("Docente %s en materia %s (%s) cambio estado de %s a %s. Motivo: %s",
                r.getDocenteNombre(), r.getMateriaNombre(), r.getMateriaCodigo(), estadoAnterior, r.getEstadoDefinitivo(), dto.getMotivo().trim()));
        auditoria.setIpOrigen(ipOrigen != null && !ipOrigen.isBlank() ? ipOrigen : "127.0.0.1");
        auditoria.setFechaEvento(LocalDateTime.now());
        auditoriaUsuarioRepository.save(auditoria);

        log.info("Ratificación modificada para {} en {}: {} -> {} por {}",
                r.getDocenteNombre(), r.getMateriaCodigo(), estadoAnterior, r.getEstadoDefinitivo(), authentication.getName());

        return DocenteRatificacionMateriaDto.builder()
                .id(r.getId())
                .gestion(r.getGestion())
                .sedeCodigo(r.getSedeCodigo())
                .carreraCodigo(r.getCarreraCodigo())
                .materiaCodigo(r.getMateriaCodigo())
                .materiaNombre(r.getMateriaNombre())
                .grupoCodigo(r.getGrupoCodigo())
                .docenteCi(r.getDocenteCi())
                .docenteNombre(r.getDocenteNombre())
                .notaDirector(r.getNotaDirector())
                .notaEstudiantes(r.getNotaEstudiantes())
                .notaFinal(r.getNotaFinal())
                .estadoCalculado(r.getEstadoCalculado())
                .estadoDefinitivo(r.getEstadoDefinitivo())
                .esModificadoManualmente(r.isEsModificadoManualmente())
                .modificadoPorUsuario(r.getModificadoPorUsuario())
                .modificadoPorNombre(r.getModificadoPorNombre())
                .motivoModificacion(r.getMotivoModificacion())
                .fechaModificacion(r.getFechaModificacion())
                .build();
    }

    /**
     * Reporte de Cumplimiento de Evaluación Docente por Sede, Carrera y Materia.
     */
    @Transactional(readOnly = true)
    public List<CumplimientoEvaluacionDto> listarCumplimiento(String gestion, String sedeCodigo, String carreraCodigo) {
        if (sedeCodigo == null || sedeCodigo.isBlank()) {
            return Collections.emptyList();
        }

        List<String> carreras = new ArrayList<>();
        if (carreraCodigo != null && !carreraCodigo.isBlank() && !"TODAS".equalsIgnoreCase(carreraCodigo)) {
            carreras.add(carreraCodigo.trim());
        } else {
            List<RolExamen> rolesSede = rolExamenRepository.findBySedeCodigo(sedeCodigo.trim());
            rolesSede.stream()
                    .map(RolExamen::getCarreraCodigo)
                    .filter(c -> c != null && !c.isBlank())
                    .distinct()
                    .forEach(carreras::add);
        }

        List<CumplimientoEvaluacionDto> lista = new ArrayList<>();

        for (String carCod : carreras) {
            List<EvaluacionConsolidadaDocenteMateriaDto> consolidados =
                    evaluacionDocenteEstudianteService.listarResumenConsolidado(sedeCodigo.trim(), carCod, gestion);

            for (EvaluacionConsolidadaDocenteMateriaDto c : consolidados) {
                String estado;
                if (c.isDirectorEvaluado() && c.getTotalEstudiantesEvaluaron() > 0) {
                    estado = "COMPLETO";
                } else if (c.isDirectorEvaluado()) {
                    estado = "SOLO_DIRECTOR";
                } else if (c.getTotalEstudiantesEvaluaron() > 0) {
                    estado = "SOLO_ESTUDIANTES";
                } else {
                    estado = "PENDIENTE";
                }

                lista.add(CumplimientoEvaluacionDto.builder()
                        .sedeCodigo(c.getSedeCodigo())
                        .carreraCodigo(c.getCarreraCodigo())
                        .materiaCodigo(c.getMateriaCodigo())
                        .materiaNombre(c.getMateriaNombre())
                        .grupoCodigo(c.getGrupoCodigo())
                        .docenteNombre(c.getDocenteNombre())
                        .docenteCi(c.getDocenteCi())
                        .directorEvaluado(c.isDirectorEvaluado())
                        .totalEstudiantesMatriculados(c.getTotalEstudiantesMatriculados())
                        .totalEstudiantesEvaluaron(c.getTotalEstudiantesEvaluaron())
                        .estudiantesParticipacionPorcentaje(c.getEstudiantesParticipacionPorcentaje())
                        .estadoEvaluacion(estado)
                        .build());
            }
        }

        lista.sort(Comparator.comparing(CumplimientoEvaluacionDto::getCarreraCodigo)
                .thenComparing(CumplimientoEvaluacionDto::getMateriaNombre));

        return lista;
    }
}
