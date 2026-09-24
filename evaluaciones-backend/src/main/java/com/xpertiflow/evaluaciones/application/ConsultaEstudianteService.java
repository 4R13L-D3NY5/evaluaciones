package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.consulta.*;
import com.xpertiflow.evaluaciones.domain.entity.*;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.enums.TipoParcial;
import com.xpertiflow.evaluaciones.domain.repository.*;
import com.xpertiflow.evaluaciones.security.BancoCifradoService;
import com.xpertiflow.evaluaciones.security.BancoEncryptedPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConsultaEstudianteService {

    private final RolExamenRepository rolExamenRepository;
    private final MapeoEstudianteVarianteRepository mapeoRepository;
    private final CalificacionOmrRepository calificacionOmrRepository;
    private final NotaDocenteRepository notaDocenteRepository;
    private final IntentoExamenVirtualRepository intentoVirtualRepository;
    private final SalaExamenVirtualRepository salaVirtualRepository;
    private final ExamenVarianteRepository varianteRepository;
    private final AnulacionPreguntaOmrRepository anulacionRepository;
    private final PoliticaTiempoEvaluacionesService politicaTiempoService;
    private final BancoCifradoService cifradoService;
    private final ObjectMapper objectMapper;

    /**
     * Consulta todas las evaluaciones a las que pertenece un estudiante por su matrícula.
     */
    @Transactional(readOnly = true)
    public List<ConsultaEstudianteEvaluacionDto> consultarEvaluacionesPorMatricula(String matricula,
                                                                                  String tipoParcial) {
        if (matricula == null || matricula.isBlank()) {
            throw new IllegalArgumentException("La matrícula o código de estudiante es obligatorio.");
        }
        String matriculaLimpia = matricula.trim();

        // 1. Obtener todas las apariciones del estudiante en mapeos, notas docentes e intentos virtuales
        List<MapeoEstudianteVariante> mapeos = mapeoRepository.findByCodigoEstudianteOrderByCreadoEnDesc(matriculaLimpia);
        List<NotaDocente> notasDocentes = notaDocenteRepository.findByCodigoEstudianteOrderByGuardadoEnDesc(matriculaLimpia);
        List<IntentoExamenVirtual> intentosVirtuales = intentoVirtualRepository.findByCodigoEstudianteOrderByCreadoEnDesc(matriculaLimpia);

        Set<String> rolesIds = new LinkedHashSet<>();
        mapeos.forEach(m -> rolesIds.add(m.getRolExamenId()));
        notasDocentes.forEach(n -> rolesIds.add(n.getRolExamenId()));

        for (IntentoExamenVirtual intento : intentosVirtuales) {
            salaVirtualRepository.findById(intento.getSalaId()).ifPresent(s -> rolesIds.add(s.getRolExamenId()));
        }

        TipoParcial filtroParcial = parseTipoParcial(tipoParcial);

        List<ConsultaEstudianteEvaluacionDto> resultado = new ArrayList<>();
        for (String rolId : rolesIds) {
            Optional<RolExamen> rolOpt = rolExamenRepository.findById(rolId);
            if (rolOpt.isEmpty()) continue;
            RolExamen rol = rolOpt.get();

            if (filtroParcial != null && rol.getTipoParcial() != filtroParcial) {
                continue;
            }

            ConsultaEstudianteEvaluacionDto dto = mapearEvaluacionEstudiante(rol, matriculaLimpia, true);
            if (dto != null) {
                resultado.add(dto);
            }
        }

        // Ordenar por fecha de examen descendente
        resultado.sort((a, b) -> {
            if (a.getFechaExamen() == null && b.getFechaExamen() == null) return 0;
            if (a.getFechaExamen() == null) return 1;
            if (b.getFechaExamen() == null) return -1;
            return b.getFechaExamen().compareTo(a.getFechaExamen());
        });

        return resultado;
    }

    /**
     * Consulta el detalle individual y retroalimentación de un examen específico de un estudiante.
     */
    @Transactional(readOnly = true)
    public ConsultaEstudianteEvaluacionDto consultarDetalleEvaluacionEstudiante(String matricula, String rolExamenId) {
        if (matricula == null || matricula.isBlank()) {
            throw new IllegalArgumentException("La matrícula o código de estudiante es obligatorio.");
        }
        if (rolExamenId == null || rolExamenId.isBlank()) {
            throw new IllegalArgumentException("El identificador del examen (rolExamenId) es obligatorio.");
        }
        RolExamen rol = rolExamenRepository.findById(rolExamenId.trim())
                .orElseThrow(() -> new IllegalArgumentException("Examen no encontrado: " + rolExamenId));

        ConsultaEstudianteEvaluacionDto dto = mapearEvaluacionEstudiante(rol, matricula.trim(), true);
        if (dto == null) {
            throw new IllegalArgumentException("El estudiante no está registrado en la evaluación especificada.");
        }
        return dto;
    }

    /**
     * Consulta las notas consolidadas de un grupo por seaGroupId (para sincronización con SISA / SEA).
     */
    @Transactional(readOnly = true)
    public ConsultaGrupoNotasResponseDto consultarNotasGrupo(String seaGroupId, String tipoParcial) {
        if (seaGroupId == null || seaGroupId.isBlank()) {
            throw new IllegalArgumentException("El seaGroupId es obligatorio.");
        }
        TipoParcial parcial = parseTipoParcial(tipoParcial);
        Optional<RolExamen> rolOpt;
        if (parcial != null) {
            rolOpt = rolExamenRepository.findTopBySeaGroupIdAndTipoParcialAndEstadoFlujoNotOrderByVersionDesc(
                    seaGroupId.trim(), parcial, EstadoFlujo.SUSPENDIDO);
        } else {
            rolOpt = rolExamenRepository.findTopBySeaGroupIdOrderByVersionDesc(seaGroupId.trim());
        }

        RolExamen rol = rolOpt.orElseThrow(() -> new IllegalArgumentException(
                "No se encontró un examen para el grupo " + seaGroupId + (tipoParcial != null ? " (" + tipoParcial + ")" : "")));

        return construirRespuestaGrupo(rol);
    }

    /**
     * Consulta las notas consolidadas de un grupo por rolExamenId.
     */
    @Transactional(readOnly = true)
    public ConsultaGrupoNotasResponseDto consultarNotasPorRol(String rolExamenId) {
        if (rolExamenId == null || rolExamenId.isBlank()) {
            throw new IllegalArgumentException("El rolExamenId es obligatorio.");
        }
        RolExamen rol = rolExamenRepository.findById(rolExamenId.trim())
                .orElseThrow(() -> new IllegalArgumentException("Examen no encontrado con id: " + rolExamenId));

        return construirRespuestaGrupo(rol);
    }

    // =========================================================================
    // Mapeos y lógica interna
    // =========================================================================

    private ConsultaEstudianteEvaluacionDto mapearEvaluacionEstudiante(RolExamen rol,
                                                                      String matricula,
                                                                      boolean incluirRetroalimentacion) {
        ModalidadExamen modalidad = rol.getModalidad();
        boolean conCartilla = Boolean.TRUE.equals(rol.getConCartilla()) || modalidad == ModalidadExamen.PRESENCIAL_CARTILLA;

        String nombreCompleto = null;
        String asistencia = "PRESENTE";
        String variante = null;
        BigDecimal notaSobre60 = null;
        BigDecimal notaSobre100 = null;
        Integer totalReactivos = null;
        Integer aciertos = null;
        Integer fallos = null;
        Integer blancos = null;
        Integer doblesMarcas = null;
        RetroalimentacionDto retro = null;

        boolean notasLiberadas = rol.getEstadoFlujo() == EstadoFlujo.CALIFICADO
                || rol.getEstadoFlujo() == EstadoFlujo.CONFIRMADO;

        if (conCartilla) {
            Optional<MapeoEstudianteVariante> mapeoOpt = mapeoRepository
                    .findByRolExamenIdAndCodigoEstudiante(rol.getId(), matricula);
            if (mapeoOpt.isPresent()) {
                MapeoEstudianteVariante mapeo = mapeoOpt.get();
                nombreCompleto = nombreCompleto(mapeo);
                asistencia = mapeo.getEstadoAsistencia() != null ? mapeo.getEstadoAsistencia() : "PRESENTE";
                variante = mapeo.getLetraVariante();
            }

            Optional<CalificacionOmr> califOpt = calificacionOmrRepository
                    .findByRolExamenIdAndCodigoEstudiante(rol.getId(), matricula);

            if (califOpt.isPresent()) {
                CalificacionOmr calif = califOpt.get();
                if (nombreCompleto == null) {
                    nombreCompleto = calif.getEstudianteNombreCompleto();
                }
                if (variante == null) {
                    variante = calif.getLetraVariante();
                }

                if (notasLiberadas) {
                    notaSobre60 = calif.getNotaSobre60();
                    notaSobre100 = calif.getNotaSobre100();
                    totalReactivos = calif.getTotalReactivos();
                    aciertos = calif.getAciertos();
                    fallos = calif.getFallos();
                    blancos = calif.getBlancos();
                    doblesMarcas = calif.getDoblesMarcas();

                    if (incluirRetroalimentacion) {
                        retro = construirRetroalimentacionOmr(rol, calif);
                    }
                }
            } else if (mapeoOpt.isEmpty()) {
                return null; // El estudiante no pertenece a este examen
            }
        } else if (modalidad == ModalidadExamen.PRESENCIAL_SIN_CARTILLA) {
            Optional<NotaDocente> notaOpt = notaDocenteRepository
                    .findByRolExamenIdAndCodigoEstudiante(rol.getId(), matricula);

            if (notaOpt.isEmpty()) {
                return null;
            }
            NotaDocente nota = notaOpt.get();
            nombreCompleto = nota.getEstudianteNombreCompleto();
            if (notasLiberadas) {
                notaSobre60 = nota.getNotaSobre60();
                notaSobre100 = nota.getNotaSobre100();
            }
            // En sin cartilla: variante, totalReactivos, aciertos, fallos, blancos y retroalimentación son nulos.
        } else if (modalidad == ModalidadExamen.VIRTUAL) {
            Optional<SalaExamenVirtual> salaOpt = salaVirtualRepository.findByRolExamenIdOrderByCreadoEnDesc(rol.getId())
                    .stream().findFirst();

            if (salaOpt.isPresent()) {
                Optional<IntentoExamenVirtual> intentoOpt = intentoVirtualRepository
                        .findBySalaIdAndCodigoEstudiante(salaOpt.get().getId(), matricula);

                if (intentoOpt.isPresent()) {
                    IntentoExamenVirtual intento = intentoOpt.get();
                    nombreCompleto = intento.getNombreEstudiante();
                    asistencia = "PRESENTE";
                    if (notasLiberadas) {
                        notaSobre60 = intento.getNotaSobre30();
                        notaSobre100 = intento.getNotaSobre100();
                        aciertos = intento.getAciertos();
                        totalReactivos = 30;
                    }
                } else {
                    return null;
                }
            } else {
                return null;
            }
        }

        return ConsultaEstudianteEvaluacionDto.builder()
                .codigoEstudiante(matricula)
                .nombreCompleto(nombreCompleto)
                .rolExamenId(rol.getId())
                .seaGroupId(rol.getSeaGroupId())
                .materiaCodigo(rol.getMateriaCodigo())
                .materiaNombre(rol.getMateriaNombre())
                .carreraCodigo(rol.getCarreraCodigo())
                .carreraNombre(rol.getCarreraNombre())
                .sedeCodigo(rol.getSedeCodigo())
                .sedeNombre(rol.getSedeNombre())
                .grupo(rol.getGrupo())
                .docenteNombre(rol.getDocenteNombre())
                .tipoParcial(rol.getTipoParcial() != null ? rol.getTipoParcial().getValor() : null)
                .fechaExamen(rol.getFecha())
                .horario(rol.getHorario())
                .modalidad(modalidad != null ? modalidad.getValor() : "PRESENCIAL")
                .modalidadDescripcion(descripcionModalidad(modalidad, conCartilla))
                .estadoExamen(rol.getEstadoFlujo() != null ? rol.getEstadoFlujo().name() : "PROGRAMADO")
                .asistencia(asistencia)
                .variante(variante)
                .notaSobre60(notaSobre60)
                .notaSobre100(notaSobre100)
                .totalReactivos(totalReactivos)
                .aciertos(aciertos)
                .fallos(fallos)
                .blancos(blancos)
                .doblesMarcas(doblesMarcas)
                .retroalimentacion(retro)
                .build();
    }

    private RetroalimentacionDto construirRetroalimentacionOmr(RolExamen rol, CalificacionOmr calificacion) {
        boolean patronLiberado = politicaTiempoService.esPatronLiberado(rol);
        Map<String, String> respuestasEstudiante = leerRespuestasJson(calificacion.getRespuestasDetectadasJson());
        int total = calificacion.getTotalReactivos() != null ? calificacion.getTotalReactivos() : 30;

        if (!patronLiberado) {
            int horas = politicaTiempoService.getHorasPostPatron();
            List<DetallePreguntaEstudianteDto> detalles = new ArrayList<>();
            for (int p = 1; p <= total; p++) {
                String pKey = String.valueOf(p);
                String marcada = respuestasEstudiante.getOrDefault(pKey, "-");
                if (marcada.isBlank()) marcada = "-";
                String estado = "-".equals(marcada) ? "BLANCO" : (marcada.length() > 1 ? "DOBLE_MARCA" : "REGISTRADA");

                detalles.add(DetallePreguntaEstudianteDto.builder()
                        .pregunta(p)
                        .numero(p)
                        .marcada(marcada)
                        .correcta(null)
                        .estado(estado)
                        .build());
            }

            return RetroalimentacionDto.builder()
                    .patronLiberado(false)
                    .motivoBloqueo("El patrón de respuestas oficial se encuentra bajo resguardo institucional de seguridad ("
                            + horas + " horas posteriores al examen). Las claves correctas se liberarán al cumplirse la ventana cronológica.")
                    .totalPreguntas(total)
                    .preguntasAnuladas(Collections.emptyList())
                    .detallePreguntas(detalles)
                    .build();
        }

        String letraVar = calificacion.getLetraVariante();
        Optional<ExamenVariante> varianteOpt = varianteRepository.findByRolExamenIdAndLetraVariante(rol.getId(), letraVar);
        if (varianteOpt.isEmpty()) {
            return RetroalimentacionDto.builder()
                    .patronLiberado(true)
                    .totalPreguntas(calificacion.getTotalReactivos())
                    .detallePreguntas(Collections.emptyList())
                    .build();
        }

        ExamenVariante variante = varianteOpt.get();
        Map<String, String> patron = leerPatronVariante(variante);
        Set<Integer> preguntasAnuladas = anulacionRepository
                .findByRolExamenIdAndLetraVarianteAndActivoTrueOrderByNumeroPreguntaAsc(rol.getId(), letraVar)
                .stream()
                .map(AnulacionPreguntaOmr::getNumeroPregunta)
                .collect(Collectors.toSet());

        List<DetallePreguntaEstudianteDto> detalles = new ArrayList<>();

        for (int p = 1; p <= total; p++) {
            String pKey = String.valueOf(p);
            String marcada = respuestasEstudiante.getOrDefault(pKey, "-");
            if (marcada.isBlank()) marcada = "-";

            String correcta = patron.get(pKey);
            boolean anulada = preguntasAnuladas.contains(p);

            String estado;
            if (anulada) {
                estado = "ANULADA";
            } else if ("-".equals(marcada)) {
                estado = "BLANCO";
            } else if (marcada.length() > 1) {
                estado = "DOBLE_MARCA";
            } else if (correcta != null && marcada.equalsIgnoreCase(correcta)) {
                estado = "CORRECTA";
            } else {
                estado = "INCORRECTA";
            }

            detalles.add(DetallePreguntaEstudianteDto.builder()
                    .pregunta(p)
                    .numero(p)
                    .marcada(marcada)
                    .correcta(correcta)
                    .estado(estado)
                    .build());
        }

        return RetroalimentacionDto.builder()
                .patronLiberado(true)
                .totalPreguntas(total)
                .preguntasAnuladas(new ArrayList<>(preguntasAnuladas))
                .detallePreguntas(detalles)
                .build();
    }

    private ConsultaGrupoNotasResponseDto construirRespuestaGrupo(RolExamen rol) {
        ModalidadExamen modalidad = rol.getModalidad();
        boolean conCartilla = Boolean.TRUE.equals(rol.getConCartilla()) || modalidad == ModalidadExamen.PRESENCIAL_CARTILLA;

        List<EstudianteNotaGrupoDto> estudiantes = new ArrayList<>();
        boolean notasLiberadas = rol.getEstadoFlujo() == EstadoFlujo.CALIFICADO
                || rol.getEstadoFlujo() == EstadoFlujo.CONFIRMADO;

        if (conCartilla) {
            List<MapeoEstudianteVariante> mapeos = mapeoRepository.findByRolExamenId(rol.getId());
            Map<String, CalificacionOmr> califMap = calificacionOmrRepository
                    .findByRolExamenIdOrderByCodigoEstudianteAsc(rol.getId())
                    .stream()
                    .collect(Collectors.toMap(CalificacionOmr::getCodigoEstudiante, c -> c, (a, b) -> a));

            for (MapeoEstudianteVariante m : mapeos) {
                CalificacionOmr c = califMap.get(m.getCodigoEstudiante());
                EstudianteNotaGrupoDto.EstudianteNotaGrupoDtoBuilder b = EstudianteNotaGrupoDto.builder()
                        .codigoEstudiante(m.getCodigoEstudiante())
                        .nombreCompleto(nombreCompleto(m))
                        .modalidad(modalidad != null ? modalidad.getValor() : "PRESENCIAL_CARTILLA")
                        .asistencia(m.getEstadoAsistencia() != null ? m.getEstadoAsistencia() : "PRESENTE")
                        .variante(m.getLetraVariante());

                if (c != null && notasLiberadas) {
                    b.estadoCalificacion(c.getEstadoCalificacion())
                            .notaSobre60(c.getNotaSobre60())
                            .notaSobre100(c.getNotaSobre100())
                            .totalReactivos(c.getTotalReactivos())
                            .aciertos(c.getAciertos())
                            .fallos(c.getFallos())
                            .blancos(c.getBlancos())
                            .doblesMarcas(c.getDoblesMarcas())
                            .respuestasDetectadas(filtrarRespuestasHastaTotal(leerRespuestasJson(c.getRespuestasDetectadasJson()), c.getTotalReactivos()));
                } else {
                    b.estadoCalificacion(notasLiberadas ? "PENDIENTE" : rol.getEstadoFlujo().name());
                }
                estudiantes.add(b.build());
            }
        } else if (modalidad == ModalidadExamen.PRESENCIAL_SIN_CARTILLA) {
            List<NotaDocente> notas = notaDocenteRepository.findByRolExamenId(rol.getId());
            for (NotaDocente n : notas) {
                EstudianteNotaGrupoDto.EstudianteNotaGrupoDtoBuilder b = EstudianteNotaGrupoDto.builder()
                        .codigoEstudiante(n.getCodigoEstudiante())
                        .nombreCompleto(n.getEstudianteNombreCompleto())
                        .modalidad(ModalidadExamen.PRESENCIAL_SIN_CARTILLA.getValor())
                        .asistencia("PRESENTE")
                        .variante(null)
                        .totalReactivos(null)
                        .aciertos(null)
                        .fallos(null)
                        .blancos(null)
                        .doblesMarcas(null);

                if (notasLiberadas) {
                    b.estadoCalificacion("CALIFICADO")
                            .notaSobre60(n.getNotaSobre60())
                            .notaSobre100(n.getNotaSobre100());
                } else {
                    b.estadoCalificacion(rol.getEstadoFlujo().name());
                }
                estudiantes.add(b.build());
            }
        } else if (modalidad == ModalidadExamen.VIRTUAL) {
            Optional<SalaExamenVirtual> salaOpt = salaVirtualRepository.findByRolExamenIdOrderByCreadoEnDesc(rol.getId())
                    .stream().findFirst();
            if (salaOpt.isPresent()) {
                List<IntentoExamenVirtual> intentos = intentoVirtualRepository.findBySalaIdOrderByCodigoEstudianteAsc(salaOpt.get().getId());
                for (IntentoExamenVirtual intento : intentos) {
                    EstudianteNotaGrupoDto.EstudianteNotaGrupoDtoBuilder b = EstudianteNotaGrupoDto.builder()
                            .codigoEstudiante(intento.getCodigoEstudiante())
                            .nombreCompleto(intento.getNombreEstudiante())
                            .modalidad(ModalidadExamen.VIRTUAL.getValor())
                            .asistencia("PRESENTE");

                    if (notasLiberadas) {
                        b.estadoCalificacion(intento.getEstado())
                                .notaSobre60(intento.getNotaSobre30())
                                .notaSobre100(intento.getNotaSobre100())
                                .totalReactivos(30)
                                .aciertos(intento.getAciertos());
                    } else {
                        b.estadoCalificacion(intento.getEstado());
                    }
                    estudiantes.add(b.build());
                }
            }
        }

        // Ordenar estudiantes alfabéticamente
        estudiantes.sort(Comparator.comparing(e -> e.getNombreCompleto() != null ? e.getNombreCompleto() : ""));

        long totalEvaluados = estudiantes.stream()
                .filter(e -> e.getNotaSobre60() != null)
                .count();

        // 2. Construir el bloque de variantes con claves oficiales y promedios por variante
        List<VarianteGrupoDto> variantesDto = new ArrayList<>();
        if (conCartilla) {
            boolean patronLiberado = politicaTiempoService.esPatronLiberado(rol);
            List<ExamenVariante> listaVariantes = varianteRepository.findByRolExamenId(rol.getId());
            listaVariantes.sort(Comparator.comparing(ExamenVariante::getLetraVariante));

            for (ExamenVariante v : listaVariantes) {
                String letra = v.getLetraVariante();
                List<EstudianteNotaGrupoDto> alumnosVar = estudiantes.stream()
                        .filter(e -> letra.equalsIgnoreCase(e.getVariante()))
                        .toList();

                long evaluados = alumnosVar.stream().filter(e -> e.getNotaSobre60() != null).count();
                BigDecimal suma60 = BigDecimal.ZERO;
                BigDecimal suma100 = BigDecimal.ZERO;
                for (EstudianteNotaGrupoDto e : alumnosVar) {
                    if (e.getNotaSobre60() != null) suma60 = suma60.add(e.getNotaSobre60());
                    if (e.getNotaSobre100() != null) suma100 = suma100.add(e.getNotaSobre100());
                }

                BigDecimal prom60 = evaluados > 0 ? suma60.divide(BigDecimal.valueOf(evaluados), 2, RoundingMode.HALF_UP) : null;
                BigDecimal prom100 = evaluados > 0 ? suma100.divide(BigDecimal.valueOf(evaluados), 2, RoundingMode.HALF_UP) : null;

                Set<Integer> anuladas = anulacionRepository
                        .findByRolExamenIdAndLetraVarianteAndActivoTrueOrderByNumeroPreguntaAsc(rol.getId(), letra)
                        .stream().map(AnulacionPreguntaOmr::getNumeroPregunta).collect(Collectors.toSet());

                Map<String, String> claves = (patronLiberado && notasLiberadas) ? leerPatronVariante(v) : Collections.emptyMap();

                variantesDto.add(VarianteGrupoDto.builder()
                        .letra(letra)
                        .totalPreguntas(v.getTotalPreguntas() != null ? v.getTotalPreguntas() : 30)
                        .totalEstudiantes(alumnosVar.size())
                        .promedioSobre60(prom60)
                        .promedioSobre100(prom100)
                        .preguntasAnuladas(new ArrayList<>(anuladas))
                        .patronLiberado(patronLiberado)
                        .patronClaves(claves.isEmpty() ? null : claves)
                        .build());
            }
        }

        GrupoCabeceraDto cabecera = GrupoCabeceraDto.builder()
                .seaGroupId(rol.getSeaGroupId())
                .rolExamenId(rol.getId())
                .materiaCodigo(rol.getMateriaCodigo())
                .materiaNombre(rol.getMateriaNombre())
                .carreraCodigo(rol.getCarreraCodigo())
                .carreraNombre(rol.getCarreraNombre())
                .sedeCodigo(rol.getSedeCodigo())
                .sedeNombre(rol.getSedeNombre())
                .grupo(rol.getGrupo())
                .docenteNombre(rol.getDocenteNombre())
                .tipoParcial(rol.getTipoParcial() != null ? rol.getTipoParcial().getValor() : null)
                .fechaExamen(rol.getFecha())
                .horario(rol.getHorario())
                .modalidad(modalidad != null ? modalidad.getValor() : "PRESENCIAL")
                .modalidadDescripcion(descripcionModalidad(modalidad, conCartilla))
                .estadoExamen(rol.getEstadoFlujo() != null ? rol.getEstadoFlujo().name() : "PROGRAMADO")
                .totalInscritos(estudiantes.size())
                .totalEvaluados((int) totalEvaluados)
                .build();

        return ConsultaGrupoNotasResponseDto.builder()
                .grupo(cabecera)
                .variantes(variantesDto.isEmpty() ? null : variantesDto)
                .estudiantes(estudiantes)
                .build();
    }

    private Map<String, String> leerPatronVariante(ExamenVariante variante) {
        try {
            if (variante.getContenidoSeguroCifrado() != null && !variante.getContenidoSeguroCifrado().isBlank()) {
                BancoEncryptedPayload payload = BancoEncryptedPayload.builder()
                        .ciphertext(variante.getContenidoSeguroCifrado())
                        .nonce(variante.getContenidoSeguroNonce())
                        .wrappedDataKey(variante.getContenidoSeguroDekEnvuelta())
                        .keyReference(variante.getContenidoSeguroKekReferencia())
                        .keyVersion(variante.getContenidoSeguroKekVersion())
                        .algorithm(variante.getContenidoSeguroAlgoritmo())
                        .build();
                String descifrado = cifradoService.descifrarTexto(payload,
                        "variante:" + variante.getId() + ":rol:" + variante.getRolExamenId());
                JsonNode root = objectMapper.readTree(descifrado);
                String patronJson = root.path("patronClavesJson").asText("{}");
                return objectMapper.readValue(patronJson, new TypeReference<LinkedHashMap<String, String>>() {});
            }
            if (variante.getPatronClavesJson() != null && !variante.getPatronClavesJson().isBlank()) {
                return objectMapper.readValue(variante.getPatronClavesJson(), new TypeReference<LinkedHashMap<String, String>>() {});
            }
        } catch (Exception e) {
            log.error("Error al descifrar patrón de variante {}: {}", variante.getLetraVariante(), e.getMessage());
        }
        return Collections.emptyMap();
    }

    private Map<String, String> leerRespuestasJson(String json) {
        if (json == null || json.isBlank()) return Collections.emptyMap();
        try {
            return objectMapper.readValue(json, new TypeReference<LinkedHashMap<String, String>>() {});
        } catch (Exception e) {
            return Collections.emptyMap();
        }
    }

    private Map<String, String> filtrarRespuestasHastaTotal(Map<String, String> respuestas, Integer total) {
        if (respuestas == null || respuestas.isEmpty()) return Collections.emptyMap();
        int max = (total != null && total > 0) ? total : 30;
        Map<String, String> filtradas = new LinkedHashMap<>();
        for (int i = 1; i <= max; i++) {
            String k = String.valueOf(i);
            String v = respuestas.getOrDefault(k, "-");
            filtradas.put(k, (v == null || v.isBlank()) ? "-" : v);
        }
        return filtradas;
    }

    private String nombreCompleto(MapeoEstudianteVariante mapeo) {
        return List.of(
                mapeo.getApellidoPaterno() != null ? mapeo.getApellidoPaterno().trim() : "",
                mapeo.getApellidoMaterno() != null ? mapeo.getApellidoMaterno().trim() : "",
                mapeo.getNombres() != null ? mapeo.getNombres().trim() : ""
        ).stream().filter(s -> !s.isEmpty()).collect(Collectors.joining(" "));
    }

    private String descripcionModalidad(ModalidadExamen modalidad, boolean conCartilla) {
        if (modalidad == ModalidadExamen.PRESENCIAL_SIN_CARTILLA) {
            return "Presencial sin Cartilla (Planilla Docente)";
        }
        if (modalidad == ModalidadExamen.VIRTUAL) {
            return "Examen Virtual (Plataforma)";
        }
        return "Presencial con Cartilla OMR";
    }

    private TipoParcial parseTipoParcial(String valor) {
        if (valor == null || valor.isBlank()) return null;
        String v = valor.trim().toUpperCase(Locale.ROOT);
        for (TipoParcial tp : TipoParcial.values()) {
            if (tp.name().equalsIgnoreCase(v) || tp.getValor().toUpperCase(Locale.ROOT).contains(v)) {
                return tp;
            }
        }
        if (v.contains("1") || v.contains("PRIMER")) return TipoParcial.PRIMER_PARCIAL;
        if (v.contains("2DA") || v.contains("SEGUNDA_INSTANCIA")) return TipoParcial.SEGUNDA_INSTANCIA;
        if (v.contains("2") || v.contains("SEGUNDO")) return TipoParcial.SEGUNDA_INSTANCIA;
        if (v.contains("FIN")) return TipoParcial.FINAL;
        return null;
    }
}
