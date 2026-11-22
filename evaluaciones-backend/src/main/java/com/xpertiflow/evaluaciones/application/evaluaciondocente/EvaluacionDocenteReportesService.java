package com.xpertiflow.evaluaciones.application.evaluaciondocente;

import com.xpertiflow.evaluaciones.api.dto.evaluaciondocente.*;
import com.xpertiflow.evaluaciones.domain.entity.*;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaUsuarioRepository;
import com.xpertiflow.evaluaciones.domain.repository.ConfiguracionEvaluacionesRepository;
import com.xpertiflow.evaluaciones.domain.repository.DocenteRatificacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.EvaluacionDocenteObservacionTerceroRepository;
import com.xpertiflow.evaluaciones.domain.repository.EvaluacionDocenteRegistroRepository;
import com.xpertiflow.evaluaciones.domain.repository.EvaluacionEstudianteRegistroRepository;
import com.xpertiflow.evaluaciones.domain.repository.EvaluacionEstudianteRespuestaRepository;
import com.xpertiflow.evaluaciones.domain.repository.EvaluacionInstrumentoRepository;
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
    private final EvaluacionDocenteRegistroRepository docenteRegistroRepository;
    private final EvaluacionEstudianteRegistroRepository estudianteRegistroRepository;
    private final EvaluacionEstudianteRespuestaRepository estudianteRespuestaRepository;
    private final EvaluacionDocenteObservacionTerceroRepository observacionTerceroRepository;
    private final EvaluacionInstrumentoRepository instrumentoRepository;

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

    /**
     * Obtiene la Ficha Oficial de Evaluación Docente por Asignatura consolidando:
     * - Evaluación del Director de Carrera (50 pts, competencias actitudinal, procedimental, cognitiva, obs y retroalimentación)
     * - Evaluación de los Estudiantes (50 pts, desglose de las 5 dimensiones oficiales, participación)
     * - Puntaje Final Consolidado (100 pts) y estado de Ratificación
     * - Observaciones de Terceros (Vicerrectores / Directores con título oficial)
     * - Firmantes Oficiales Institucionales
     */
    @Transactional(readOnly = true)
    public FichaOficialMateriaDocenteDto obtenerFichaOficial(
            String gestion, String sedeCodigo, String carreraCodigo, String materiaCodigo, String docenteCi, String docenteNombre) {

        String gActual = evaluacionDocenteEstudianteService.resolverGestionActiva(gestion);
        String matCod = materiaCodigo != null ? materiaCodigo.trim() : "";
        String docCi = docenteCi != null ? docenteCi.trim() : "";
        String docNom = docenteNombre != null ? docenteNombre.trim() : "";

        // 1. Componente Director
        List<EvaluacionDocenteRegistro> registrosDirector = docenteRegistroRepository
                .findByGestionAndSedeCodigoAndCarreraCodigoOrderByCreadoEnDesc(gActual, sedeCodigo, carreraCodigo);

        EvaluacionDocenteRegistro regDir = registrosDirector.stream()
                .filter(r -> r.getMateriaCodigo().trim().equalsIgnoreCase(matCod)
                        && (r.getDocenteNombre().trim().equalsIgnoreCase(docNom)
                            || (!docCi.isBlank() && docCi.equalsIgnoreCase(r.getDocenteIdentificacion()))))
                .findFirst()
                .orElse(null);

        boolean dirEvaluado = regDir != null;
        BigDecimal dirPuntos50 = BigDecimal.ZERO;
        List<EvaluacionDocenteRespuestaDto> dirRespuestas = new ArrayList<>();
        if (dirEvaluado) {
            BigDecimal puntajeTotal = regDir.getPuntajeTotal() != null ? regDir.getPuntajeTotal() : BigDecimal.ZERO;
            dirPuntos50 = puntajeTotal.multiply(BigDecimal.valueOf(50)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            if (regDir.getRespuestas() != null) {
                dirRespuestas = regDir.getRespuestas().stream()
                        .map(r -> EvaluacionDocenteRespuestaDto.builder()
                                .criterioId(r.getCriterio() != null ? r.getCriterio().getId() : null)
                                .seccionCodigo(r.getCriterio() != null && r.getCriterio().getSeccion() != null ? r.getCriterio().getSeccion().getCodigo() : null)
                                .numero(r.getCriterio() != null ? r.getCriterio().getNumero() : null)
                                .puntuacion(r.getPuntuacion())
                                .build())
                        .toList();
            }
        }

        // 2. Componente Estudiantes
        List<EvaluacionEstudianteRegistro> evalsEst = estudianteRegistroRepository
                .findByGestionAndMateriaCodigoAndDocenteNombre(gActual, matCod, docNom);

        Map<String, EvaluacionEstudianteRegistro> evalsPorEstudiante = new HashMap<>();
        for (EvaluacionEstudianteRegistro er : evalsEst) {
            evalsPorEstudiante.putIfAbsent(er.getEstudianteCodigo().trim(), er);
        }
        int totalEvaluaron = evalsPorEstudiante.size();

        // Obtener total matriculados de roles examen
        List<EvaluacionConsolidadaDocenteMateriaDto> consolidados =
                evaluacionDocenteEstudianteService.listarResumenConsolidado(sedeCodigo, carreraCodigo, gActual);
        EvaluacionConsolidadaDocenteMateriaDto consolidadoMateria = consolidados.stream()
                .filter(c -> c.getMateriaCodigo().trim().equalsIgnoreCase(matCod)
                        && c.getDocenteNombre().trim().equalsIgnoreCase(docNom))
                .findFirst()
                .orElse(null);

        int totalMatriculados = consolidadoMateria != null ? consolidadoMateria.getTotalEstudiantesMatriculados() : 0;
        BigDecimal estPromedioPct = BigDecimal.ZERO;
        BigDecimal estPuntos50 = BigDecimal.ZERO;
        BigDecimal estParticipacionPct = BigDecimal.ZERO;

        if (totalEvaluaron > 0) {
            BigDecimal sumaPorcentajes = evalsPorEstudiante.values().stream()
                    .map(EvaluacionEstudianteRegistro::getPorcentaje)
                    .filter(Objects::nonNull)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            estPromedioPct = sumaPorcentajes.divide(BigDecimal.valueOf(totalEvaluaron), 2, RoundingMode.HALF_UP);
            estPuntos50 = estPromedioPct.multiply(BigDecimal.valueOf(50)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        }
        if (totalMatriculados > 0) {
            estParticipacionPct = BigDecimal.valueOf((double) totalEvaluaron * 100 / totalMatriculados)
                    .setScale(2, RoundingMode.HALF_UP);
        }

        // Desglose de áreas estudiantiles (5 dimensiones oficiales)
        List<AreaPuntajeEstudianteDto> areasEstudiantes = calcularAreasEstudiantes(evalsPorEstudiante.values());

        // 3. Consolidado Final (100 Pts)
        BigDecimal puntajeFinal100 = dirPuntos50.add(estPuntos50).setScale(2, RoundingMode.HALF_UP);

        // Estado Ratificación
        Optional<DocenteRatificacion> optR = docenteRatificacionRepository
                .findByGestionAndSedeCodigoAndCarreraCodigoAndMateriaCodigoAndDocenteCi(
                        gActual, sedeCodigo, carreraCodigo, matCod, docCi);

        String estadoRatificacion;
        boolean ratifManual = false;
        String modificadoPor = null;
        String motivoModificacion = null;

        if (optR.isPresent()) {
            DocenteRatificacion r = optR.get();
            estadoRatificacion = r.getEstadoDefinitivo();
            ratifManual = r.isEsModificadoManualmente();
            modificadoPor = r.getModificadoPorNombre() != null ? r.getModificadoPorNombre() : r.getModificadoPorUsuario();
            motivoModificacion = r.getMotivoModificacion();
        } else {
            estadoRatificacion = puntajeFinal100.compareTo(BigDecimal.valueOf(71)) >= 0 ? "RATIFICADO" : "NO_RATIFICADO";
        }

        // 4. Observaciones de Terceros
        List<EvaluacionDocenteObservacionTercero> obsList = observacionTerceroRepository
                .findByGestionAndSedeCodigoAndCarreraCodigoAndMateriaCodigoAndDocenteCiOrderByCreadoEnAsc(
                        gActual, sedeCodigo, carreraCodigo, matCod, docCi);

        List<ObservacionTerceroDto> obsDtos = obsList.stream()
                .map(this::mapearObservacionTercero)
                .toList();

        // 5. Firmantes Oficiales
        List<FirmanteOficialDto> firmantes = listarFirmantesOficiales();

        String sedeNom = regDir != null ? regDir.getSedeNombre() : (consolidadoMateria != null ? consolidadoMateria.getSedeCodigo() : sedeCodigo);
        String carNom = regDir != null ? regDir.getCarreraNombre() : (consolidadoMateria != null ? consolidadoMateria.getCarreraCodigo() : carreraCodigo);
        String matNom = regDir != null ? regDir.getMateriaNombre() : (consolidadoMateria != null ? consolidadoMateria.getMateriaNombre() : matCod);
        String grpCod = regDir != null ? regDir.getGrupoCodigo() : (consolidadoMateria != null ? consolidadoMateria.getGrupoCodigo() : "");

        return FichaOficialMateriaDocenteDto.builder()
                .gestion(gActual)
                .sedeCodigo(sedeCodigo)
                .sedeNombre(sedeNom)
                .carreraCodigo(carreraCodigo)
                .carreraNombre(carNom)
                .materiaCodigo(matCod)
                .materiaNombre(matNom)
                .grupoCodigo(grpCod)
                .docenteCi(docCi)
                .docenteNombre(docNom)
                .directorEvaluado(dirEvaluado)
                .directorRegistroId(regDir != null ? regDir.getId() : null)
                .directorEvaluadorNombre(regDir != null ? regDir.getEvaluadorNombre() : null)
                .directorEvaluadorRol(regDir != null ? regDir.getEvaluadorRol() : null)
                .directorFechaEvaluacion(regDir != null && regDir.getFechaEvaluacion() != null ? regDir.getFechaEvaluacion().toString() : null)
                .directorHoraEvaluacion(regDir != null ? regDir.getHoraEvaluacion() : null)
                .directorInstrumentoTitulo(regDir != null && regDir.getInstrumento() != null ? regDir.getInstrumento().getTitulo() : "EVALUACIÓN DE LA COMPETENCIA DOCENTE")
                .directorPuntajeActitudinal(regDir != null ? regDir.getPuntajeActitudinal() : BigDecimal.ZERO)
                .directorPuntajeProcedimental(regDir != null ? regDir.getPuntajeProcedimental() : BigDecimal.ZERO)
                .directorPuntajeCognitivo(regDir != null ? regDir.getPuntajeCognitivo() : BigDecimal.ZERO)
                .directorPuntajeTotal(regDir != null ? regDir.getPuntajeTotal() : BigDecimal.ZERO)
                .directorPuntos50(dirPuntos50)
                .directorObservaciones(regDir != null ? regDir.getObservaciones() : null)
                .directorRetroalimentacion(regDir != null ? regDir.getRetroalimentacion() : null)
                .directorRespuestas(dirRespuestas)
                .totalEstudiantesMatriculados(totalMatriculados)
                .totalEstudiantesEvaluaron(totalEvaluaron)
                .estudiantesParticipacionPorcentaje(estParticipacionPct)
                .estudiantesPromedioPorcentaje(estPromedioPct)
                .estudiantesPuntos50(estPuntos50)
                .estudiantesPuntajePorAreas(areasEstudiantes)
                .puntajeFinal100(puntajeFinal100)
                .estadoRatificacion(estadoRatificacion)
                .ratificacionModificadaManualmente(ratifManual)
                .ratificacionModificadoPor(modificadoPor)
                .ratificacionMotivo(motivoModificacion)
                .observacionesTerceros(obsDtos)
                .firmantesOficiales(firmantes)
                .build();
    }

    /**
     * Calcula los puntajes por dimensión/área de las evaluaciones estudiantiles.
     */
    private List<AreaPuntajeEstudianteDto> calcularAreasEstudiantes(Collection<EvaluacionEstudianteRegistro> registros) {
        EvaluacionInstrumento inst = instrumentoRepository.findById("inst-estudiante-unitepc-v1").orElse(null);

        Map<String, String> nombresPorCodigo = new LinkedHashMap<>();
        if (inst != null && inst.getSecciones() != null && !inst.getSecciones().isEmpty()) {
            inst.getSecciones().stream()
                    .sorted(Comparator.comparingInt(com.xpertiflow.evaluaciones.domain.entity.EvaluacionSeccion::getOrden))
                    .forEach(s -> nombresPorCodigo.put(s.getCodigo(), s.getNombre()));
        } else {
            nombresPorCodigo.put("DOMINIO", "DOMINIO DE LA ASIGNATURA");
            nombresPorCodigo.put("PLANIFICACION", "PLANIFICACIÓN DE LA ASIGNATURA");
            nombresPorCodigo.put("METODOLOGIA", "METODOLOGÍA DE ENSEÑANZA");
            nombresPorCodigo.put("EVALUACION", "EVALUACIÓN DE APRENDIZAJES");
            nombresPorCodigo.put("ACTITUD", "ACTITUD DOCENTE");
        }

        if (registros == null || registros.isEmpty()) {
            return nombresPorCodigo.entrySet().stream()
                    .map(e -> AreaPuntajeEstudianteDto.builder()
                            .areaCodigo(e.getKey())
                            .areaNombre(e.getValue())
                            .puntajePromedio(BigDecimal.ZERO)
                            .puntajeMaximo(BigDecimal.valueOf(3.00))
                            .porcentaje(BigDecimal.ZERO)
                            .build())
                    .toList();
        }

        List<String> regIds = registros.stream().map(EvaluacionEstudianteRegistro::getId).toList();
        List<EvaluacionEstudianteRespuesta> respuestas = estudianteRespuestaRepository.findByRegistroIdIn(regIds);

        Map<String, List<Integer>> puntuacionesPorArea = new LinkedHashMap<>();
        nombresPorCodigo.keySet().forEach(k -> puntuacionesPorArea.put(k, new ArrayList<>()));

        for (EvaluacionEstudianteRespuesta r : respuestas) {
            if (r.getCriterio() != null && r.getCriterio().getSeccion() != null) {
                String secCod = r.getCriterio().getSeccion().getCodigo();
                if (puntuacionesPorArea.containsKey(secCod) && r.getPuntuacion() != null) {
                    puntuacionesPorArea.get(secCod).add(r.getPuntuacion());
                }
            }
        }

        List<AreaPuntajeEstudianteDto> resultado = new ArrayList<>();
        for (Map.Entry<String, String> entry : nombresPorCodigo.entrySet()) {
            String cod = entry.getKey();
            String nom = entry.getValue();
            List<Integer> pts = puntuacionesPorArea.getOrDefault(cod, Collections.emptyList());

            BigDecimal prom = BigDecimal.ZERO;
            BigDecimal pct = BigDecimal.ZERO;
            if (!pts.isEmpty()) {
                double avg = pts.stream().mapToInt(Integer::intValue).average().orElse(0.0);
                prom = BigDecimal.valueOf(avg).setScale(2, RoundingMode.HALF_UP);
                pct = prom.divide(BigDecimal.valueOf(3), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).setScale(2, RoundingMode.HALF_UP);
            }

            resultado.add(AreaPuntajeEstudianteDto.builder()
                    .areaCodigo(cod)
                    .areaNombre(nom)
                    .puntajePromedio(prom)
                    .puntajeMaximo(BigDecimal.valueOf(3.00))
                    .porcentaje(pct)
                    .build());
        }

        return resultado;
    }

    /**
     * Guarda o actualiza las observaciones y retroalimentación del Director de Carrera.
     */
    @Transactional
    public void guardarObservacionesDirector(GuardarObservacionesDirectorRequestDto dto, Authentication authentication) {
        if (dto.getRegistroId() == null || dto.getRegistroId().isBlank()) {
            throw new IllegalArgumentException("El ID del registro de evaluación es obligatorio");
        }
        EvaluacionDocenteRegistro reg = docenteRegistroRepository.findById(dto.getRegistroId())
                .orElseThrow(() -> new IllegalArgumentException("Registro no encontrado: " + dto.getRegistroId()));

        reg.setObservaciones(dto.getObservaciones());
        reg.setRetroalimentacion(dto.getRetroalimentacion());
        reg.setActualizadoEn(LocalDateTime.now());
        docenteRegistroRepository.save(reg);
    }

    /**
     * Guarda o actualiza una observación de un tercero autorizado (Vicerrector / autoridad) para la materia.
     */
    @Transactional
    public ObservacionTerceroDto guardarObservacionTercero(
            GuardarObservacionTerceroRequestDto dto, Authentication authentication) {
        if (authentication == null) {
            throw new AccessDeniedException("Usuario no autenticado");
        }
        UsuarioSistema usuario = usuarioRepository.findByUsuario(authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Usuario no encontrado"));

        boolean esAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMINISTRADOR_SISTEMA"));
        boolean esVicerrector = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_VICERRECTOR"));
        if (!esAdmin && !esVicerrector && !usuario.isPuedeObservarEvaluacionDocente()) {
            throw new AccessDeniedException("No tiene permisos para registrar observaciones en esta asignatura");
        }

        String titulo = usuario.getTituloFirmaEvaluacionDocente();
        if (titulo == null || titulo.isBlank()) {
            titulo = switch (usuario.getRolCodigo()) {
                case "VICERRECTOR" -> "Dirección Académica";
                case "TALENTO_HUMANO" -> "Jefe de Talento Humano";
                default -> "Observador Institucional";
            };
        }

        String gActual = evaluacionDocenteEstudianteService.resolverGestionActiva(dto.getGestion());

        Optional<EvaluacionDocenteObservacionTercero> optObs = observacionTerceroRepository
                .findByGestionAndSedeCodigoAndCarreraCodigoAndMateriaCodigoAndDocenteCiAndUsuarioId(
                        gActual, dto.getSedeCodigo(), dto.getCarreraCodigo(),
                        dto.getMateriaCodigo(), dto.getDocenteCi(), usuario.getId());

        EvaluacionDocenteObservacionTercero obs;
        if (optObs.isPresent()) {
            obs = optObs.get();
            obs.setObservacion(dto.getObservacion().trim());
            obs.setTituloFirma(titulo);
            obs.setActualizadoEn(LocalDateTime.now());
        } else {
            obs = EvaluacionDocenteObservacionTercero.builder()
                    .gestion(gActual)
                    .sedeCodigo(dto.getSedeCodigo())
                    .carreraCodigo(dto.getCarreraCodigo())
                    .materiaCodigo(dto.getMateriaCodigo())
                    .materiaNombre(dto.getMateriaNombre() != null ? dto.getMateriaNombre() : "")
                    .grupoCodigo(dto.getGrupoCodigo() != null ? dto.getGrupoCodigo() : "")
                    .docenteCi(dto.getDocenteCi())
                    .docenteNombre(dto.getDocenteNombre() != null ? dto.getDocenteNombre() : "")
                    .usuarioId(usuario.getId())
                    .usuarioNombre(usuario.getNombreCompleto())
                    .usuarioRol(usuario.getRolCodigo())
                    .tituloFirma(titulo)
                    .observacion(dto.getObservacion().trim())
                    .build();
        }
        EvaluacionDocenteObservacionTercero guardada = observacionTerceroRepository.save(obs);
        return mapearObservacionTercero(guardada);
    }

    /**
     * Lista los firmantes institucionales configurados para el bloque de firmas.
     */
    @Transactional(readOnly = true)
    public List<FirmanteOficialDto> listarFirmantesOficiales() {
        return usuarioRepository.findAllByOrderByNombreCompletoAsc().stream()
                .filter(u -> u.isActivo() && ("VICERRECTOR".equals(u.getRolCodigo())
                        || "TALENTO_HUMANO".equals(u.getRolCodigo())
                        || u.isPuedeObservarEvaluacionDocente()
                        || u.isPuedeModificarRatificacionDocente()
                        || (u.getTituloFirmaEvaluacionDocente() != null && !u.getTituloFirmaEvaluacionDocente().isBlank())))
                .map(u -> {
                    String titulo = u.getTituloFirmaEvaluacionDocente();
                    if (titulo == null || titulo.isBlank()) {
                        titulo = switch (u.getRolCodigo()) {
                            case "TALENTO_HUMANO" -> "Jefe de Talento Humano";
                            case "VICERRECTOR" -> "Dirección Académica";
                            default -> "Autoridad Institucional";
                        };
                    }
                    boolean esSoloVisual = "TALENTO_HUMANO".equals(u.getRolCodigo());
                    return FirmanteOficialDto.builder()
                            .usuarioId(u.getId())
                            .usuario(u.getUsuario())
                            .nombreCompleto(u.getNombreCompleto())
                            .rol(u.getRolCodigo())
                            .tituloFirma(titulo)
                            .ordenFirma(u.getOrdenFirmaEvaluacionDocente())
                            .puedeObservar(u.isPuedeObservarEvaluacionDocente())
                            .puedeRatificar(u.isPuedeModificarRatificacionDocente())
                            .esSoloVisual(esSoloVisual)
                            .build();
                })
                .sorted(Comparator.comparingInt(FirmanteOficialDto::getOrdenFirma)
                        .thenComparing(FirmanteOficialDto::getNombreCompleto))
                .toList();
    }

    /**
     * Lista todos los usuarios candidatos o configurados como firmantes/observadores para la vista de Administración.
     */
    @Transactional(readOnly = true)
    public List<FirmanteConfiguracionDto> listarFirmantesConfiguracion() {
        return usuarioRepository.findAllByOrderByNombreCompletoAsc().stream()
                .filter(u -> "VICERRECTOR".equals(u.getRolCodigo())
                        || "TALENTO_HUMANO".equals(u.getRolCodigo())
                        || "ADMINISTRADOR_SISTEMA".equals(u.getRolCodigo())
                        || u.isPuedeObservarEvaluacionDocente()
                        || u.isPuedeModificarRatificacionDocente()
                        || (u.getTituloFirmaEvaluacionDocente() != null && !u.getTituloFirmaEvaluacionDocente().isBlank()))
                .map(this::mapearFirmanteConfiguracion)
                .sorted(Comparator.comparingInt(FirmanteConfiguracionDto::getOrdenFirma)
                        .thenComparing(FirmanteConfiguracionDto::getNombreCompleto))
                .toList();
    }

    /**
     * Actualiza la configuración de un firmante (permisos de observación, ratificación, título oficial y orden).
     */
    @Transactional
    public FirmanteConfiguracionDto actualizarFirmanteConfiguracion(
            Long usuarioId, ActualizarFirmanteRequestDto dto, Authentication authentication, String ipOrigen) {
        UsuarioSistema u = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + usuarioId));

        u.setPuedeObservarEvaluacionDocente(dto.isPuedeObservar());
        u.setPuedeModificarRatificacionDocente(dto.isPuedeModificarRatificacion());
        u.setTituloFirmaEvaluacionDocente(dto.getTituloFirma() != null ? dto.getTituloFirma().trim() : null);
        u.setOrdenFirmaEvaluacionDocente(dto.getOrdenFirma());
        u.setActualizadoEn(LocalDateTime.now());
        UsuarioSistema guardado = usuarioRepository.save(u);

        String actor = authentication != null ? authentication.getName() : "ADMIN";
        registrarAuditoria(guardado, "FIRMANTE_ACTUALIZADO", actor,
                "Título: " + u.getTituloFirmaEvaluacionDocente() + ", Obs: " + u.isPuedeObservarEvaluacionDocente() + ", Ratif: " + u.isPuedeModificarRatificacionDocente(), ipOrigen);

        return mapearFirmanteConfiguracion(guardado);
    }

    private ObservacionTerceroDto mapearObservacionTercero(EvaluacionDocenteObservacionTercero obs) {
        return ObservacionTerceroDto.builder()
                .id(obs.getId())
                .usuarioId(obs.getUsuarioId())
                .usuarioNombre(obs.getUsuarioNombre())
                .usuarioRol(obs.getUsuarioRol())
                .tituloFirma(obs.getTituloFirma())
                .observacion(obs.getObservacion())
                .fechaRegistro(obs.getCreadoEn())
                .fechaActualizacion(obs.getActualizadoEn())
                .build();
    }

    private FirmanteConfiguracionDto mapearFirmanteConfiguracion(UsuarioSistema u) {
        String titulo = u.getTituloFirmaEvaluacionDocente();
        if (titulo == null || titulo.isBlank()) {
            titulo = switch (u.getRolCodigo()) {
                case "TALENTO_HUMANO" -> "Jefe de Talento Humano";
                case "VICERRECTOR" -> "Dirección Académica";
                default -> "Autoridad Institucional";
            };
        }
        String rolNombre = switch (u.getRolCodigo()) {
            case "TALENTO_HUMANO" -> "Talento Humano";
            case "VICERRECTOR" -> "Vicerrector";
            case "ADMINISTRADOR_SISTEMA" -> "Administrador del Sistema";
            default -> u.getRolCodigo();
        };
        boolean esSoloVisual = "TALENTO_HUMANO".equals(u.getRolCodigo());
        return FirmanteConfiguracionDto.builder()
                .usuarioId(u.getId())
                .usuario(u.getUsuario())
                .nombreCompleto(u.getNombreCompleto())
                .correo(u.getCorreo())
                .rolCodigo(u.getRolCodigo())
                .rolNombre(rolNombre)
                .activo(u.isActivo())
                .puedeObservar(u.isPuedeObservarEvaluacionDocente())
                .puedeModificarRatificacion(u.isPuedeModificarRatificacionDocente())
                .tituloFirma(titulo)
                .ordenFirma(u.getOrdenFirmaEvaluacionDocente())
                .esSoloVisual(esSoloVisual)
                .build();
    }

    private void registrarAuditoria(UsuarioSistema usuario, String accion, String actor, String detalle, String ipOrigen) {
        AuditoriaUsuario auditoria = new AuditoriaUsuario();
        auditoria.setUsuarioObjetivoId(usuario.getId());
        auditoria.setUsuarioObjetivoCi(usuario.getCi());
        auditoria.setAccion(accion);
        auditoria.setRealizadoPor(actor == null || actor.isBlank() ? "SISTEMA" : actor);
        auditoria.setDetalle(detalle);
        auditoria.setIpOrigen(ipOrigen != null && !ipOrigen.isBlank() ? ipOrigen : "127.0.0.1");
        auditoria.setFechaEvento(LocalDateTime.now());
        auditoriaUsuarioRepository.save(auditoria);
    }
}
