package com.xpertiflow.evaluaciones.application.evaluaciondocente;

import com.xpertiflow.evaluaciones.api.dto.evaluaciondocente.*;
import com.xpertiflow.evaluaciones.api.dto.gateway.TimeFrameDto;
import com.xpertiflow.evaluaciones.application.VentanaTemporalException;
import com.xpertiflow.evaluaciones.domain.entity.*;
import com.xpertiflow.evaluaciones.domain.repository.*;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EvaluacionDocenteEstudianteService {

    private final EvaluacionEstudianteRegistroRepository estudianteRegistroRepository;
    private final EvaluacionEstudianteRespuestaRepository estudianteRespuestaRepository;
    private final EvaluacionDocenteRegistroRepository docenteRegistroRepository;
    private final EvaluacionInstrumentoRepository instrumentoRepository;
    private final EvaluacionCriterioRepository criterioRepository;
    private final RolExamenRepository rolExamenRepository;
    private final MapeoEstudianteVarianteRepository mapeoRepository;
    private final NotaDocenteRepository notaDocenteRepository;
    private final UnitepcGatewayClient unitepcGatewayClient;
    private final EvaluacionHabilitacionSemestreRepository habilitacionSemestreRepository;

    /**
     * Normaliza los formatos de gestión (ej. '2-2026', 'II-2026', 'ACTIVA') al formato canónico 'II-2026'.
     */
    public String normalizarGestion(String g) {
        if (g == null || g.isBlank() || "ACTIVA".equalsIgnoreCase(g.trim())) {
            return "II-2026";
        }
        String s = g.trim().toUpperCase();
        if (s.matches("^2-\\d{4}$")) {
            return "II-" + s.substring(2);
        }
        if (s.matches("^1-\\d{4}$")) {
            return "I-" + s.substring(2);
        }
        return s;
    }

    /**
     * Resuelve de forma robusta la gestión académica activa normalizada a formato canónico.
     */
    public String resolverGestionActiva(String gestionPropuesta) {
        if (gestionPropuesta != null && !gestionPropuesta.isBlank() && !"ACTIVA".equalsIgnoreCase(gestionPropuesta.trim())) {
            return normalizarGestion(gestionPropuesta.trim());
        }
        try {
            TimeFrameDto tf = unitepcGatewayClient.getActiveTimeFrame();
            if (tf != null && tf.getName() != null && !tf.getName().isBlank()) {
                return normalizarGestion(tf.getName().trim());
            }
        } catch (Exception e) {
            log.warn("No se pudo obtener gestión activa desde Gateway, usando fallback: {}", e.getMessage());
        }
        return "II-2026";
    }

    /**
     * Consulta las materias asignadas a un estudiante en la gestión y el estado de su evaluación.
     */
    @Transactional(readOnly = true)
    public EstudianteAvanceEvaluacionDto consultarMateriasPorCodigoEstudiante(String codigoEstudiante, String gestionFiltro) {
        if (codigoEstudiante == null || codigoEstudiante.isBlank()) {
            throw new IllegalArgumentException("El código de estudiante es obligatorio.");
        }
        String matricula = codigoEstudiante.trim();
        String gestionActual = resolverGestionActiva(gestionFiltro);

        // 1. Obtener todas las asignaciones del estudiante
        List<MapeoEstudianteVariante> mapeos = mapeoRepository.findByCodigoEstudianteOrderByCreadoEnDesc(matricula);
        List<NotaDocente> notas = notaDocenteRepository.findByCodigoEstudianteOrderByGuardadoEnDesc(matricula);

        String estudianteNombre = null;
        for (MapeoEstudianteVariante m : mapeos) {
            if (m.getNombres() != null && !m.getNombres().isBlank()) {
                estudianteNombre = m.getNombres().trim() + " " +
                        Optional.ofNullable(m.getApellidoPaterno()).orElse("").trim() + " " +
                        Optional.ofNullable(m.getApellidoMaterno()).orElse("").trim();
                estudianteNombre = estudianteNombre.trim();
                break;
            }
        }
        if (estudianteNombre == null && !notas.isEmpty()) {
            estudianteNombre = notas.get(0).getEstudianteNombreCompleto();
        }
        if (estudianteNombre == null) {
            estudianteNombre = "Estudiante " + matricula;
        }

        Set<String> rolesIds = new LinkedHashSet<>();
        mapeos.forEach(m -> rolesIds.add(m.getRolExamenId()));
        notas.forEach(n -> rolesIds.add(n.getRolExamenId()));

        Map<String, MateriaEstudianteDto> materiasUnicas = new LinkedHashMap<>();
        String sedeCodigoPrincipal = null;
        String carreraCodigoPrincipal = null;
        String carreraNombrePrincipal = null;

        for (String rolId : rolesIds) {
            Optional<RolExamen> rolOpt = rolExamenRepository.findById(rolId);
            if (rolOpt.isEmpty()) continue;
            RolExamen rol = rolOpt.get();

            // REGLA INSTITUCIONAL: Este módulo aplica exclusivamente a grupos teóricos (TA / T*)
            if (!esGrupoTeorico(rol)) {
                continue;
            }

            if (sedeCodigoPrincipal == null) {
                sedeCodigoPrincipal = rol.getSedeCodigo();
                carreraCodigoPrincipal = rol.getCarreraCodigo();
                carreraNombrePrincipal = rol.getCarreraNombre();
            }

            String docenteNom = Optional.ofNullable(rol.getDocenteNombre())
                    .filter(s -> !s.isBlank())
                    .orElse("Docente Asignado");

            // Clave única: Asignatura + Docente (Permite evaluar docentes distintos en teoría y práctica)
            String claveMateriaDocente = rol.getMateriaCodigo().trim().toUpperCase() + "_" + docenteNom.trim().toUpperCase();

            if (materiasUnicas.containsKey(claveMateriaDocente)) {
                // Si es el mismo docente en la misma materia (ej. teoría y práctica), se consolida el grupo y se evalúa una sola vez
                MateriaEstudianteDto existente = materiasUnicas.get(claveMateriaDocente);
                if (rol.getGrupo() != null && !existente.getGrupoCodigo().contains(rol.getGrupo())) {
                    existente.setGrupoCodigo(existente.getGrupoCodigo() + ", " + rol.getGrupo());
                }
                continue;
            }

            // Verificar si ya evaluó a este docente en esta materia en esta gestión
            Optional<EvaluacionEstudianteRegistro> regOpt = estudianteRegistroRepository
                    .findByEstudianteCodigoAndMateriaCodigoAndDocenteNombreAndGestion(
                            matricula, rol.getMateriaCodigo(), docenteNom, gestionActual
                    );

            boolean evaluada = regOpt.isPresent();
            Integer semestre = rol.getSemestre();
            boolean habilitada = false;
            Long segRestantes = null;
            String motivo = null;

            if (semestre != null && rol.getSedeCodigo() != null && rol.getCarreraCodigo() != null) {
                habilitada = habilitacionSemestreRepository.isSemestreActivo(
                        rol.getSedeCodigo(), rol.getCarreraCodigo(), gestionActual, semestre, LocalDateTime.now()
                );
                if (habilitada) {
                    Optional<EvaluacionHabilitacionSemestre> habOpt = habilitacionSemestreRepository
                            .findBySedeCodigoAndCarreraCodigoAndGestionAndSemestre(
                                    rol.getSedeCodigo(), rol.getCarreraCodigo(), gestionActual, semestre
                            );
                    if (habOpt.isPresent()) {
                        segRestantes = habOpt.get().getSegundosRestantes();
                    }
                } else {
                    motivo = "Evaluación no habilitada para el " + semestre + "° Semestre por Dirección de Carrera.";
                }
            } else {
                motivo = "Semestre no definido para la asignatura.";
            }

            materiasUnicas.put(claveMateriaDocente, MateriaEstudianteDto.builder()
                    .materiaCodigo(rol.getMateriaCodigo())
                    .materiaNombre(rol.getMateriaNombre())
                    .grupoCodigo(rol.getGrupo())
                    .docenteNombre(docenteNom)
                    .sedeCodigo(rol.getSedeCodigo())
                    .carreraCodigo(rol.getCarreraCodigo())
                    .semestre(semestre)
                    .habilitadaParaEvaluacion(habilitada)
                    .motivoBloqueo(motivo)
                    .segundosRestantesVentana(segRestantes)
                    .evaluada(evaluada)
                    .fechaEvaluacion(regOpt.map(EvaluacionEstudianteRegistro::getCreadoEn).orElse(null))
                    .build());
        }

        int total = materiasUnicas.size();
        int evaluadas = (int) materiasUnicas.values().stream().filter(MateriaEstudianteDto::isEvaluada).count();
        double porcentaje = total > 0 ? BigDecimal.valueOf((double) evaluadas * 100 / total)
                .setScale(2, RoundingMode.HALF_UP).doubleValue() : 0.0;

        return EstudianteAvanceEvaluacionDto.builder()
                .estudianteCodigo(matricula)
                .estudianteNombre(estudianteNombre)
                .sedeCodigo(sedeCodigoPrincipal)
                .carreraCodigo(carreraCodigoPrincipal)
                .carreraNombre(carreraNombrePrincipal)
                .gestion(gestionActual)
                .totalMaterias(total)
                .materiasEvaluadas(evaluadas)
                .porcentajeAvance(porcentaje)
                .materias(new ArrayList<>(materiasUnicas.values()))
                .build();
    }

    /**
     * Obtiene el instrumento vigente oficial para la evaluación de estudiantes.
     */
    @Transactional(readOnly = true)
    public EvaluacionInstrumentoDto obtenerInstrumentoEstudianteVigente() {
        EvaluacionInstrumento inst = instrumentoRepository
                .findFirstByDestinatarioAndEstado("ESTUDIANTE", "VIGENTE")
                .orElseGet(() -> instrumentoRepository.findAllByOrderByCreadoEnDesc().stream()
                        .filter(i -> "ESTUDIANTE".equalsIgnoreCase(i.getDestinatario()))
                        .findFirst()
                        .orElseThrow(() -> new NoSuchElementException("No hay un instrumento de evaluación para estudiantes configurado.")));

        return mapearInstrumentoADto(inst);
    }

    /**
     * Registra la evaluación realizada por el estudiante a un docente en un grupo/materia.
     */
    @Transactional
    public EvaluacionEstudianteRegistro registrarEvaluacion(EvaluacionEstudianteAplicarRequestDto request, String ipOrigen) {
        String matricula = request.getEstudianteCodigo().trim();
        String materiaCod = request.getMateriaCodigo().trim();
        String grupoCod = request.getGrupoCodigo().trim();
        String docenteNom = request.getDocenteNombre() != null ? request.getDocenteNombre().trim() : "";
        String gestion = resolverGestionActiva(request.getGestion());

        // 0. Validar que la evaluación corresponda exclusivamente a un grupo teórico
        if (!esGrupoTeorico(grupoCod)) {
            throw new IllegalArgumentException("Este módulo de evaluación docente aplica exclusivamente a grupos teóricos.");
        }

        // 1. Evitar evaluación duplicada por Estudiante + Materia + Docente
        if (estudianteRegistroRepository.findByEstudianteCodigoAndMateriaCodigoAndDocenteNombreAndGestion(
                matricula, materiaCod, docenteNom, gestion).isPresent()) {
            throw new IllegalStateException("Ya registraste tu evaluación para este docente en esta materia durante la gestión actual.");
        }

        // 1.1 Validar que la ventana temporal de 90 minutos para el semestre esté activa
        if (request.getSedeCodigo() != null && request.getCarreraCodigo() != null) {
            List<RolExamen> rolesMat = rolExamenRepository.findBySedeCodigoAndCarreraCodigo(
                    request.getSedeCodigo(), request.getCarreraCodigo()
            );
            Integer semestreMateria = rolesMat.stream()
                    .filter(r -> materiaCod.equalsIgnoreCase(r.getMateriaCodigo()))
                    .map(RolExamen::getSemestre)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElse(null);

            if (semestreMateria != null) {
                boolean semestreActivo = habilitacionSemestreRepository.isSemestreActivo(
                        request.getSedeCodigo(), request.getCarreraCodigo(), gestion, semestreMateria, LocalDateTime.now()
                );
                if (!semestreActivo) {
                    throw new VentanaTemporalException("La evaluación docente para el " + semestreMateria +
                            "° Semestre no se encuentra habilitada o la ventana de 90 minutos ha expirado.");
                }
            }
        }

        // 2. Obtener instrumento
        EvaluacionInstrumento instrumento;
        if (request.getInstrumentoId() != null && !request.getInstrumentoId().isBlank()) {
            instrumento = instrumentoRepository.findById(request.getInstrumentoId())
                    .orElseThrow(() -> new NoSuchElementException("Instrumento no encontrado: " + request.getInstrumentoId()));
        } else {
            instrumento = instrumentoRepository.findFirstByDestinatarioAndEstado("ESTUDIANTE", "VIGENTE")
                    .orElseThrow(() -> new IllegalStateException("No existe un instrumento activo de evaluación para estudiantes."));
        }

        // 3. Validar criterios y calcular puntaje
        Map<String, Integer> respuestasReq = request.getRespuestas();
        List<EvaluacionCriterio> criterios = new ArrayList<>();
        for (EvaluacionSeccion sec : instrumento.getSecciones()) {
            criterios.addAll(sec.getCriterios());
        }

        if (criterios.isEmpty()) {
            throw new IllegalStateException("El instrumento no tiene criterios de evaluación configurados.");
        }

        BigDecimal sumaPuntos = BigDecimal.ZERO;
        BigDecimal puntajeMaximo = BigDecimal.valueOf((long) criterios.size() * instrumento.getEscalaMax());

        List<EvaluacionEstudianteRespuesta> respuestasGuardar = new ArrayList<>();
        String registroId = "REG-EST-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase(Locale.ROOT);

        EvaluacionEstudianteRegistro registro = EvaluacionEstudianteRegistro.builder()
                .id(registroId)
                .instrumento(instrumento)
                .gestion(gestion)
                .sedeCodigo(Optional.ofNullable(request.getSedeCodigo()).orElse("CBA"))
                .carreraCodigo(Optional.ofNullable(request.getCarreraCodigo()).orElse("GENERAL"))
                .materiaCodigo(materiaCod)
                .materiaNombre(request.getMateriaNombre())
                .grupoCodigo(grupoCod)
                .docenteId(request.getDocenteId())
                .docenteNombre(request.getDocenteNombre())
                .estudianteCodigo(matricula)
                .estudianteNombre(Optional.ofNullable(request.getEstudianteNombre()).orElse("Estudiante " + matricula))
                .observaciones(request.getObservaciones())
                .estado("COMPLETADA")
                .ipOrigen(ipOrigen)
                .build();

        for (EvaluacionCriterio crit : criterios) {
            Integer valor = respuestasReq.get(crit.getId());
            if (valor == null || valor < instrumento.getEscalaMin() || valor > instrumento.getEscalaMax()) {
                throw new IllegalArgumentException("Respuesta inválida o faltante para el criterio: " + crit.getNumero());
            }
            sumaPuntos = sumaPuntos.add(BigDecimal.valueOf(valor));

            respuestasGuardar.add(EvaluacionEstudianteRespuesta.builder()
                    .registro(registro)
                    .criterio(crit)
                    .puntuacion(valor)
                    .build());
        }

        BigDecimal porcentaje = puntajeMaximo.compareTo(BigDecimal.ZERO) > 0
                ? sumaPuntos.multiply(BigDecimal.valueOf(100)).divide(puntajeMaximo, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        registro.setPuntajeTotal(sumaPuntos);
        registro.setPuntajeMaximo(puntajeMaximo);
        registro.setPorcentaje(porcentaje);
        registro.setRespuestas(respuestasGuardar);

        EvaluacionEstudianteRegistro guardado = estudianteRegistroRepository.save(registro);
        log.info("Evaluación de estudiante guardada: Registro={}, Estudiante={}, Materia={}, Docente={}, Puntos={}/{}, Gestión={}",
                registroId, matricula, materiaCod, request.getDocenteNombre(), sumaPuntos, puntajeMaximo, gestion);

        return guardado;
    }

    /**
     * Monitoreo para Directores de Carrera: Avance de evaluaciones por estudiante (ej. 3/5).
     */
    @Transactional(readOnly = true)
    public List<EstudianteAvanceEvaluacionDto> listarAvanceEstudiantesPorCarrera(
            String sedeCodigo, String carreraCodigo, String gestion) {
        if (sedeCodigo == null || carreraCodigo == null) {
            return Collections.emptyList();
        }

        String gestionActual = resolverGestionActiva(gestion);

        // 1. Obtener todos los roles de la carrera y sede
        List<RolExamen> roles = rolExamenRepository.findBySedeCodigoAndCarreraCodigo(sedeCodigo, carreraCodigo);
        if (roles.isEmpty()) return Collections.emptyList();

        List<String> rolesIds = roles.stream().map(RolExamen::getId).toList();

        // 2. Obtener los estudiantes mapeados a estos roles
        List<MapeoEstudianteVariante> mapeos = mapeoRepository.findByRolExamenIdIn(rolesIds);

        // Agrupar mapeos por código de estudiante
        Map<String, List<MapeoEstudianteVariante>> mapeosPorEstudiante = mapeos.stream()
                .filter(m -> m.getCodigoEstudiante() != null && !m.getCodigoEstudiante().isBlank())
                .collect(Collectors.groupingBy(m -> m.getCodigoEstudiante().trim()));

        // 3. Obtener todas las evaluaciones ya realizadas en esa carrera y gestión
        List<EvaluacionEstudianteRegistro> evaluacionesCarrera = estudianteRegistroRepository
                .findByGestionAndSedeCodigoAndCarreraCodigo(
                        gestionActual,
                        sedeCodigo, carreraCodigo
                );

        Map<String, Set<String>> evaluadasPorEstudiante = new HashMap<>();
        for (EvaluacionEstudianteRegistro r : evaluacionesCarrera) {
            evaluadasPorEstudiante
                    .computeIfAbsent(r.getEstudianteCodigo().trim(), k -> new HashSet<>())
                    .add(r.getMateriaCodigo().trim().toUpperCase() + "_" + r.getDocenteNombre().trim().toUpperCase());
        }

        Map<String, RolExamen> mapaRoles = roles.stream().collect(Collectors.toMap(RolExamen::getId, r -> r, (a, b) -> a));

        List<EstudianteAvanceEvaluacionDto> listaAvances = new ArrayList<>();

        for (Map.Entry<String, List<MapeoEstudianteVariante>> entry : mapeosPorEstudiante.entrySet()) {
            String codEstudiante = entry.getKey();
            List<MapeoEstudianteVariante> estudianteMapeos = entry.getValue();

            String nombreCompleto = null;
            Map<String, MateriaEstudianteDto> materiasEstudiante = new LinkedHashMap<>();

            for (MapeoEstudianteVariante m : estudianteMapeos) {
                if (nombreCompleto == null && m.getNombres() != null) {
                    nombreCompleto = m.getNombres().trim() + " " +
                            Optional.ofNullable(m.getApellidoPaterno()).orElse("").trim() + " " +
                            Optional.ofNullable(m.getApellidoMaterno()).orElse("").trim();
                    nombreCompleto = nombreCompleto.trim();
                }

                RolExamen rol = mapaRoles.get(m.getRolExamenId());
                if (rol == null || !esGrupoTeorico(rol)) continue;

                String docenteNom = Optional.ofNullable(rol.getDocenteNombre())
                        .filter(s -> !s.isBlank())
                        .orElse("Docente Asignado");
                String clave = rol.getMateriaCodigo().trim().toUpperCase() + "_" + docenteNom.trim().toUpperCase();

                if (materiasEstudiante.containsKey(clave)) {
                    // Mismo docente en múltiples grupos (teoría/práctica): consolidar grupos
                    MateriaEstudianteDto existente = materiasEstudiante.get(clave);
                    if (rol.getGrupo() != null && !existente.getGrupoCodigo().contains(rol.getGrupo())) {
                        existente.setGrupoCodigo(existente.getGrupoCodigo() + ", " + rol.getGrupo());
                    }
                    continue;
                }

                boolean evaluada = evaluadasPorEstudiante
                        .getOrDefault(codEstudiante, Collections.emptySet())
                        .contains(clave);

                materiasEstudiante.put(clave, MateriaEstudianteDto.builder()
                        .materiaCodigo(rol.getMateriaCodigo())
                        .materiaNombre(rol.getMateriaNombre())
                        .grupoCodigo(rol.getGrupo())
                        .docenteNombre(docenteNom)
                        .sedeCodigo(sedeCodigo)
                        .carreraCodigo(carreraCodigo)
                        .semestre(rol.getSemestre())
                        .evaluada(evaluada)
                        .build());
            }

            int total = materiasEstudiante.size();
            int evaluadas = (int) materiasEstudiante.values().stream().filter(MateriaEstudianteDto::isEvaluada).count();
            double pct = total > 0 ? BigDecimal.valueOf((double) evaluadas * 100 / total)
                    .setScale(2, RoundingMode.HALF_UP).doubleValue() : 0.0;

            listaAvances.add(EstudianteAvanceEvaluacionDto.builder()
                    .estudianteCodigo(codEstudiante)
                    .estudianteNombre(nombreCompleto != null ? nombreCompleto : "Estudiante " + codEstudiante)
                    .sedeCodigo(sedeCodigo)
                    .carreraCodigo(carreraCodigo)
                    .carreraNombre(roles.get(0).getCarreraNombre())
                    .gestion(gestionActual)
                    .totalMaterias(total)
                    .materiasEvaluadas(evaluadas)
                    .porcentajeAvance(pct)
                    .materias(new ArrayList<>(materiasEstudiante.values()))
                    .build());
        }

        // Ordenar por porcentaje ascendente (los pendientes primero) y luego alfabéticamente
        listaAvances.sort(Comparator.comparingDouble(EstudianteAvanceEvaluacionDto::getPorcentajeAvance)
                .thenComparing(EstudianteAvanceEvaluacionDto::getEstudianteNombre));

        return listaAvances;
    }

    /**
     * Resumen Consolidado de Evaluaciones: 50 Puntos Director + 50 Puntos Estudiantes (quienes realizaron el test).
     */
    @Transactional(readOnly = true)
    public List<EvaluacionConsolidadaDocenteMateriaDto> listarResumenConsolidado(
            String sedeCodigo, String carreraCodigo, String gestion) {
        if (sedeCodigo == null || carreraCodigo == null) {
            return Collections.emptyList();
        }

        String gestionActual = resolverGestionActiva(gestion);

        // 1. Obtener roles de la carrera y sede
        List<RolExamen> roles = rolExamenRepository.findBySedeCodigoAndCarreraCodigo(sedeCodigo, carreraCodigo);
        if (roles.isEmpty()) return Collections.emptyList();

        List<String> rolesIds = roles.stream().map(RolExamen::getId).toList();

        // 2. Mapeo de estudiantes para contabilizar matriculados por rol
        List<MapeoEstudianteVariante> mapeos = mapeoRepository.findByRolExamenIdIn(rolesIds);
        Map<String, Set<String>> estudiantesPorRol = new HashMap<>();
        for (MapeoEstudianteVariante m : mapeos) {
            if (m.getCodigoEstudiante() != null && !m.getCodigoEstudiante().isBlank()) {
                estudiantesPorRol.computeIfAbsent(m.getRolExamenId(), k -> new HashSet<>())
                        .add(m.getCodigoEstudiante().trim());
            }
        }

        // 3. Evaluaciones realizadas por el Director
        List<EvaluacionDocenteRegistro> registrosDirector = docenteRegistroRepository
                .findByGestionAndSedeCodigoAndCarreraCodigoOrderByCreadoEnDesc(gestionActual, sedeCodigo, carreraCodigo);
        Map<String, EvaluacionDocenteRegistro> dirRegMap = new HashMap<>();
        for (EvaluacionDocenteRegistro r : registrosDirector) {
            String key = r.getDocenteNombre().trim().toUpperCase() + "_" + r.getMateriaCodigo().trim().toUpperCase();
            dirRegMap.putIfAbsent(key, r);
        }

        // 4. Evaluaciones realizadas por Estudiantes
        List<EvaluacionEstudianteRegistro> registrosEstudiantes = estudianteRegistroRepository
                .findByGestionAndSedeCodigoAndCarreraCodigo(gestionActual, sedeCodigo, carreraCodigo);
        Map<String, List<EvaluacionEstudianteRegistro>> estRegMap = new HashMap<>();
        for (EvaluacionEstudianteRegistro r : registrosEstudiantes) {
            String key = r.getDocenteNombre().trim().toUpperCase() + "_" + r.getMateriaCodigo().trim().toUpperCase();
            estRegMap.computeIfAbsent(key, k -> new ArrayList<>()).add(r);
        }

        // 5. Agrupar roles por Materia + Docente (exclusivamente grupos teóricos)
        Map<String, List<RolExamen>> rolesPorMateriaDocente = new LinkedHashMap<>();
        for (RolExamen r : roles) {
            if (!esGrupoTeorico(r)) {
                continue;
            }
            String docNom = r.getDocenteNombre() != null ? r.getDocenteNombre().trim() : "";
            if (docNom.isBlank() || "POR DESIGNAR".equalsIgnoreCase(docNom) || docNom.toUpperCase().contains("SIN ASIGNAR")) {
                continue;
            }
            String key = docNom.toUpperCase() + "_" + r.getMateriaCodigo().trim().toUpperCase();
            rolesPorMateriaDocente.computeIfAbsent(key, k -> new ArrayList<>()).add(r);
        }

        List<EvaluacionConsolidadaDocenteMateriaDto> lista = new ArrayList<>();

        for (Map.Entry<String, List<RolExamen>> entry : rolesPorMateriaDocente.entrySet()) {
            String key = entry.getKey();
            List<RolExamen> grupoRoles = entry.getValue();
            RolExamen primero = grupoRoles.get(0);

            String matCod = primero.getMateriaCodigo().trim();
            String matNom = primero.getMateriaNombre() != null ? primero.getMateriaNombre().trim() : matCod;
            String docNom = primero.getDocenteNombre().trim();
            String docCi = primero.getDocenteCi();

            // Consolidar grupos de la materia para este docente
            String grupos = grupoRoles.stream()
                    .map(RolExamen::getGrupo)
                    .filter(Objects::nonNull)
                    .distinct()
                    .collect(Collectors.joining(", "));

            // Conjunto total de estudiantes matriculados en todos los grupos de esta materia con este docente
            Set<String> matriculadosSet = new HashSet<>();
            for (RolExamen r : grupoRoles) {
                Set<String> setRol = estudiantesPorRol.get(r.getId());
                if (setRol != null) matriculadosSet.addAll(setRol);
            }
            int totalMatriculados = matriculadosSet.size();

            // A) Componente Director (máximo 50 Pts)
            EvaluacionDocenteRegistro regDir = dirRegMap.get(key);
            boolean dirEvaluado = regDir != null;
            BigDecimal dirPuntaje100 = dirEvaluado ? regDir.getPuntajeTotal() : BigDecimal.ZERO;
            BigDecimal dirPuntos50 = dirEvaluado
                    ? dirPuntaje100.multiply(BigDecimal.valueOf(50)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;
            String dirFecha = dirEvaluado && regDir.getFechaEvaluacion() != null ? regDir.getFechaEvaluacion().toString() : null;
            String dirObs = dirEvaluado ? regDir.getObservaciones() : null;

            // B) Componente Estudiantil (máximo 50 Pts)
            List<EvaluacionEstudianteRegistro> evalsEst = estRegMap.getOrDefault(key, Collections.emptyList());
            Map<String, EvaluacionEstudianteRegistro> evalsPorEstudiante = new HashMap<>();
            for (EvaluacionEstudianteRegistro er : evalsEst) {
                evalsPorEstudiante.putIfAbsent(er.getEstudianteCodigo().trim(), er);
            }
            int totalEvaluaron = evalsPorEstudiante.size();

            BigDecimal estPromedioPct = BigDecimal.ZERO;
            BigDecimal estPuntos50 = BigDecimal.ZERO;
            BigDecimal estParticipacionPct = BigDecimal.ZERO;

            if (totalEvaluaron > 0) {
                BigDecimal sumaPorcentajes = evalsPorEstudiante.values().stream()
                        .map(EvaluacionEstudianteRegistro::getPorcentaje)
                        .filter(Objects::nonNull)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                estPromedioPct = sumaPorcentajes.divide(BigDecimal.valueOf(totalEvaluaron), 2, RoundingMode.HALF_UP);
                // 50% ponderado sobre los estudiantes que sí completaron el test (evita sesgo por deserción/abandono)
                estPuntos50 = estPromedioPct.multiply(BigDecimal.valueOf(50)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }

            if (totalMatriculados > 0) {
                estParticipacionPct = BigDecimal.valueOf((double) totalEvaluaron * 100 / totalMatriculados)
                        .setScale(2, RoundingMode.HALF_UP);
            }

            // C) Total Consolidado (100 Pts)
            BigDecimal puntajeFinal100 = dirPuntos50.add(estPuntos50).setScale(2, RoundingMode.HALF_UP);

            String estadoFinal;
            if (dirEvaluado && totalEvaluaron > 0) {
                if (puntajeFinal100.compareTo(BigDecimal.valueOf(80)) >= 0) {
                    estadoFinal = "Sobresaliente";
                } else if (puntajeFinal100.compareTo(BigDecimal.valueOf(51)) >= 0) {
                    estadoFinal = "Aprobado";
                } else {
                    estadoFinal = "Reprobado";
                }
            } else if (dirEvaluado) {
                estadoFinal = "Parcial (Faltan Estudiantes)";
            } else if (totalEvaluaron > 0) {
                estadoFinal = "Parcial (Falta Director)";
            } else {
                estadoFinal = "Pendiente";
            }

            lista.add(EvaluacionConsolidadaDocenteMateriaDto.builder()
                    .materiaCodigo(matCod)
                    .materiaNombre(matNom)
                    .grupoCodigo(grupos)
                    .docenteNombre(docNom)
                    .docenteCi(docCi)
                    .gestion(gestionActual)
                    .sedeCodigo(sedeCodigo)
                    .carreraCodigo(carreraCodigo)
                    .directorEvaluado(dirEvaluado)
                    .directorPuntaje100(dirEvaluado ? dirPuntaje100 : null)
                    .directorPuntos50(dirPuntos50)
                    .directorFechaEvaluacion(dirFecha)
                    .directorObservaciones(dirObs)
                    .totalEstudiantesMatriculados(totalMatriculados)
                    .totalEstudiantesEvaluaron(totalEvaluaron)
                    .estudiantesParticipacionPorcentaje(estParticipacionPct)
                    .estudiantesPromedioPorcentaje(estPromedioPct)
                    .estudiantesPuntos50(estPuntos50)
                    .puntajeFinal100(puntajeFinal100)
                    .estadoFinal(estadoFinal)
                    .build());
        }

        lista.sort(Comparator.comparing(EvaluacionConsolidadaDocenteMateriaDto::getDocenteNombre)
                .thenComparing(EvaluacionConsolidadaDocenteMateriaDto::getMateriaNombre));

        return lista;
    }

    /**
     * Habilita uno o varios semestres con una ventana temporal de duración configurable (por defecto 90 minutos).
     * Se puede volver a habilitar las veces necesarias, renovando los 90 minutos desde el instante de activación.
     */
    @Transactional
    public List<SemestreHabilitacionEstadoDto> habilitarSemestres(HabilitarSemestresRequestDto request, String usuario) {
        if (request == null || request.getSedeCodigo() == null || request.getCarreraCodigo() == null) {
            throw new IllegalArgumentException("Sede y Carrera son obligatorias para habilitar semestres.");
        }
        String sede = request.getSedeCodigo().trim();
        String carrera = request.getCarreraCodigo().trim();
        String gestion = resolverGestionActiva(request.getGestion());
        int duracion = request.getDuracionMinutos() != null && request.getDuracionMinutos() > 0
                ? request.getDuracionMinutos() : 90;

        LocalDateTime ahora = LocalDateTime.now();
        LocalDateTime expira = ahora.plusMinutes(duracion);

        if (request.getSemestres() != null) {
            for (Integer semestre : request.getSemestres()) {
                if (semestre == null || semestre < 1) continue;

                EvaluacionHabilitacionSemestre entidad = habilitacionSemestreRepository
                        .findBySedeCodigoAndCarreraCodigoAndGestionAndSemestre(sede, carrera, gestion, semestre)
                        .orElseGet(() -> EvaluacionHabilitacionSemestre.builder()
                                .id("HAB-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase(Locale.ROOT))
                                .sedeCodigo(sede)
                                .carreraCodigo(carrera)
                                .gestion(gestion)
                                .semestre(semestre)
                                .build());

                entidad.setHabilitado(true);
                entidad.setHabilitadoEn(ahora);
                entidad.setExpiraEn(expira);
                entidad.setDuracionMinutos(duracion);
                entidad.setHabilitadoPor(usuario != null ? usuario : "DIRECTOR");
                entidad.setActualizadoEn(ahora);

                habilitacionSemestreRepository.save(entidad);
            }
        }

        return listarEstadosSemestres(sede, carrera, gestion);
    }

    /**
     * Cierra anticipadamente la ventana de evaluación para un semestre específico.
     */
    @Transactional
    public List<SemestreHabilitacionEstadoDto> deshabilitarSemestre(String sedeCodigo, String carreraCodigo,
                                                                   String gestion, Integer semestre, String usuario) {
        if (sedeCodigo == null || carreraCodigo == null || semestre == null) {
            throw new IllegalArgumentException("Sede, Carrera y Semestre son obligatorios.");
        }
        String sede = sedeCodigo.trim();
        String carrera = carreraCodigo.trim();
        String gestionActual = resolverGestionActiva(gestion);

        habilitacionSemestreRepository
                .findBySedeCodigoAndCarreraCodigoAndGestionAndSemestre(sede, carrera, gestionActual, semestre)
                .ifPresent(entidad -> {
                    entidad.setHabilitado(false);
                    entidad.setExpiraEn(LocalDateTime.now());
                    entidad.setHabilitadoPor(usuario != null ? usuario : entidad.getHabilitadoPor());
                    habilitacionSemestreRepository.save(entidad);
                });

        return listarEstadosSemestres(sede, carrera, gestionActual);
    }

    /**
     * Consulta los estados de habilitación de todos los semestres de la carrera en la sede y gestión activas.
     */
    @Transactional(readOnly = true)
    public List<SemestreHabilitacionEstadoDto> listarEstadosSemestres(String sedeCodigo, String carreraCodigo, String gestion) {
        if (sedeCodigo == null || carreraCodigo == null) {
            return Collections.emptyList();
        }
        String sede = sedeCodigo.trim();
        String carrera = carreraCodigo.trim();
        String gestionActual = resolverGestionActiva(gestion);

        List<RolExamen> roles = rolExamenRepository.findBySedeCodigoAndCarreraCodigo(sede, carrera);

        // Obtener semestres reales asociados a asignaturas de la carrera
        Set<Integer> semestresPresentes = roles.stream()
                .map(RolExamen::getSemestre)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Si la carrera no tiene roles aún, garantizar semestres estándar del 1 al 10
        if (semestresPresentes.isEmpty()) {
            for (int s = 1; s <= 10; s++) {
                semestresPresentes.add(s);
            }
        }

        // Obtener registros de habilitación existentes
        Map<Integer, EvaluacionHabilitacionSemestre> habMap = habilitacionSemestreRepository
                .findBySedeCodigoAndCarreraCodigoAndGestion(sede, carrera, gestionActual).stream()
                .collect(Collectors.toMap(EvaluacionHabilitacionSemestre::getSemestre, h -> h, (a, b) -> a));

        List<SemestreHabilitacionEstadoDto> resultado = new ArrayList<>();
        LocalDateTime ahora = LocalDateTime.now();

        for (Integer s : semestresPresentes.stream().sorted().toList()) {
            EvaluacionHabilitacionSemestre hab = habMap.get(s);
            boolean activo = hab != null && hab.isHabilitado() && hab.getExpiraEn() != null && ahora.isBefore(hab.getExpiraEn());
            Long segRestantes = activo ? Duration.between(ahora, hab.getExpiraEn()).toSeconds() : 0L;

            long matCount = roles.stream()
                    .filter(this::esGrupoTeorico)
                    .filter(r -> Objects.equals(r.getSemestre(), s))
                    .map(RolExamen::getMateriaCodigo).distinct().count();
            long docCount = roles.stream()
                    .filter(this::esGrupoTeorico)
                    .filter(r -> Objects.equals(r.getSemestre(), s))
                    .map(RolExamen::getDocenteNombre).filter(Objects::nonNull).distinct().count();

            resultado.add(SemestreHabilitacionEstadoDto.builder()
                    .semestre(s)
                    .semestreDisplay(s + "° Semestre")
                    .activo(activo)
                    .habilitadoEn(hab != null ? hab.getHabilitadoEn() : null)
                    .expiraEn(hab != null ? hab.getExpiraEn() : null)
                    .segundosRestantes(segRestantes)
                    .duracionMinutos(hab != null ? hab.getDuracionMinutos() : 90)
                    .habilitadoPor(hab != null ? hab.getHabilitadoPor() : null)
                    .totalMaterias((int) matCount)
                    .totalDocentes((int) docCount)
                    .build());
        }

        return resultado;
    }

    private EvaluacionInstrumentoDto mapearInstrumentoADto(EvaluacionInstrumento inst) {
        int totalCrit = inst.getSecciones().stream().mapToInt(s -> s.getCriterios().size()).sum();
        List<EvaluacionSeccionDto> seccionesDto = inst.getSecciones().stream()
                .map(sec -> EvaluacionSeccionDto.builder()
                        .id(sec.getId())
                        .codigo(sec.getCodigo())
                        .nombre(sec.getNombre())
                        .descripcion(sec.getDescripcion())
                        .orden(sec.getOrden())
                        .criterios(sec.getCriterios().stream()
                                .map(crit -> EvaluacionCriterioDto.builder()
                                        .id(crit.getId())
                                        .numero(crit.getNumero())
                                        .enunciado(crit.getEnunciado())
                                        .orden(crit.getOrden())
                                        .build())
                                .collect(Collectors.toList()))
                        .build())
                .collect(Collectors.toList());

        return EvaluacionInstrumentoDto.builder()
                .id(inst.getId())
                .codigo(inst.getCodigo())
                .titulo(inst.getTitulo())
                .descripcion(inst.getDescripcion())
                .estado(inst.getEstado())
                .destinatario(inst.getDestinatario())
                .escalaMin(inst.getEscalaMin())
                .escalaMax(inst.getEscalaMax())
                .creadoPor(inst.getCreadoPor())
                .creadoEn(inst.getCreadoEn())
                .actualizadoEn(inst.getActualizadoEn())
                .totalCriterios(totalCrit)
                .secciones(seccionesDto)
                .build();
    }

    /**
     * Determina si un rol o grupo corresponde a docencia teórica (TA / T*).
     * Los grupos prácticos (PA, PL, PR, PS, etc.) están excluidos de este módulo de evaluación.
     */
    public boolean esGrupoTeorico(RolExamen rol) {
        if (rol == null) return false;
        String tipoClase = rol.getTipoClase();
        if (tipoClase != null && !tipoClase.isBlank()) {
            return tipoClase.trim().toUpperCase().startsWith("T");
        }
        return esGrupoTeorico(rol.getGrupo());
    }

    public boolean esGrupoTeorico(String grupoCodigo) {
        if (grupoCodigo == null || grupoCodigo.isBlank()) return true;
        String g = grupoCodigo.trim().toUpperCase();
        // Si comienza con P (PA, PL, PR, PS), es práctico -> false
        if (g.startsWith("P")) {
            return false;
        }
        // Si comienza con T (TA, T), es teórico -> true
        if (g.startsWith("T")) {
            return true;
        }
        return true;
    }
}
