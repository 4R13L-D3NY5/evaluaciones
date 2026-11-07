package com.xpertiflow.evaluaciones.application.evaluaciondocente;

import com.xpertiflow.evaluaciones.api.dto.evaluaciondocente.*;
import com.xpertiflow.evaluaciones.domain.entity.*;
import com.xpertiflow.evaluaciones.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EvaluacionDocenteService {

    private final EvaluacionInstrumentoRepository instrumentoRepository;
    private final EvaluacionSeccionRepository seccionRepository;
    private final EvaluacionCriterioRepository criterioRepository;
    private final EvaluacionDocenteRegistroRepository registroRepository;
    private final EvaluacionDocenteRespuestaRepository respuestaRepository;

    @Transactional(readOnly = true)
    public EvaluacionInstrumentoDto obtenerInstrumentoVigente() {
        EvaluacionInstrumento inst = instrumentoRepository.findByEstado("VIGENTE")
                .orElseGet(() -> instrumentoRepository.findAllByOrderByCreadoEnDesc().stream()
                        .findFirst()
                        .orElseThrow(() -> new IllegalStateException("No hay ningún instrumento de evaluación registrado")));

        return mapInstrumentoCompleto(inst);
    }

    @Transactional(readOnly = true)
    public List<EvaluacionInstrumentoDto> listarInstrumentos() {
        return instrumentoRepository.findAllByOrderByCreadoEnDesc().stream()
                .map(this::mapInstrumentoResumen)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EvaluacionInstrumentoDto obtenerInstrumentoPorId(String id) {
        EvaluacionInstrumento inst = instrumentoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Instrumento no encontrado con ID: " + id));
        return mapInstrumentoCompleto(inst);
    }

    @Transactional
    public EvaluacionInstrumentoDto ponerEnVigencia(String id, String usuario) {
        EvaluacionInstrumento inst = instrumentoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Instrumento no encontrado con ID: " + id));

        instrumentoRepository.desactivarInstrumentosVigentes();
        inst.setEstado("VIGENTE");
        inst.setActualizadoEn(LocalDateTime.now());
        instrumentoRepository.save(inst);

        log.info("Instrumento '{}' ({}) puesto en vigencia por {}", inst.getTitulo(), inst.getCodigo(), usuario);
        return mapInstrumentoCompleto(inst);
    }

    @Transactional
    public EvaluacionInstrumentoDto crearOActualizarInstrumento(CrearOEditarInstrumentoRequestDto dto, String usuario) {
        boolean esNuevo = dto.getId() == null || dto.getId().isBlank();
        EvaluacionInstrumento inst;

        if (esNuevo) {
            String nuevoId = "inst-" + UUID.randomUUID().toString().substring(0, 8);
            inst = EvaluacionInstrumento.builder()
                    .id(nuevoId)
                    .codigo(dto.getCodigo().trim().toUpperCase())
                    .titulo(dto.getTitulo().trim())
                    .descripcion(dto.getDescripcion())
                    .estado("BORRADOR")
                    .escalaMin(dto.getEscalaMin() != null ? dto.getEscalaMin() : 1)
                    .escalaMax(dto.getEscalaMax() != null ? dto.getEscalaMax() : 5)
                    .creadoPor(usuario)
                    .secciones(new ArrayList<>())
                    .build();
        } else {
            inst = instrumentoRepository.findById(dto.getId())
                    .orElseThrow(() -> new NoSuchElementException("Instrumento no encontrado con ID: " + dto.getId()));
            inst.setCodigo(dto.getCodigo().trim().toUpperCase());
            inst.setTitulo(dto.getTitulo().trim());
            inst.setDescripcion(dto.getDescripcion());
            if (dto.getEscalaMin() != null) inst.setEscalaMin(dto.getEscalaMin());
            if (dto.getEscalaMax() != null) inst.setEscalaMax(dto.getEscalaMax());
            inst.getSecciones().clear();
        }

        if ("VIGENTE".equalsIgnoreCase(dto.getEstado())) {
            instrumentoRepository.desactivarInstrumentosVigentes();
            inst.setEstado("VIGENTE");
        }

        EvaluacionInstrumento guardado = instrumentoRepository.save(inst);

        if (dto.getSecciones() != null && !dto.getSecciones().isEmpty()) {
            int secOrden = 1;
            for (EvaluacionSeccionDto secDto : dto.getSecciones()) {
                String secId = secDto.getId() != null && !secDto.getId().isBlank()
                        ? secDto.getId()
                        : "sec-" + UUID.randomUUID().toString().substring(0, 8);

                EvaluacionSeccion sec = EvaluacionSeccion.builder()
                        .id(secId)
                        .instrumento(guardado)
                        .codigo(secDto.getCodigo() != null ? secDto.getCodigo() : "SEC-" + secOrden)
                        .nombre(secDto.getNombre())
                        .descripcion(secDto.getDescripcion())
                        .orden(secOrden++)
                        .criterios(new ArrayList<>())
                        .build();

                if (secDto.getCriterios() != null) {
                    int critOrden = 1;
                    for (EvaluacionCriterioDto critDto : secDto.getCriterios()) {
                        String critId = critDto.getId() != null && !critDto.getId().isBlank()
                                ? critDto.getId()
                                : "crit-" + UUID.randomUUID().toString().substring(0, 8);

                        EvaluacionCriterio crit = EvaluacionCriterio.builder()
                                .id(critId)
                                .seccion(sec)
                                .numero(critDto.getNumero() != null ? critDto.getNumero() : String.valueOf(critOrden))
                                .enunciado(critDto.getEnunciado())
                                .orden(critOrden++)
                                .build();
                        sec.getCriterios().add(crit);
                    }
                }
                guardado.getSecciones().add(sec);
            }
            guardado = instrumentoRepository.save(guardado);
        }

        return mapInstrumentoCompleto(guardado);
    }

    @Transactional(readOnly = true)
    public List<EvaluacionDocenteRegistroDto> listarRegistros(String gestion, String sedeCodigo, String carreraCodigo) {
        List<EvaluacionDocenteRegistro> registros;
        if (carreraCodigo != null && !carreraCodigo.isBlank() && !"TODAS".equalsIgnoreCase(carreraCodigo)) {
            registros = registroRepository.findByGestionAndSedeCodigoAndCarreraCodigoOrderByCreadoEnDesc(
                    gestion, sedeCodigo, carreraCodigo
            );
        } else {
            registros = registroRepository.findByGestionAndSedeCodigoOrderByCreadoEnDesc(
                    gestion, sedeCodigo
            );
        }

        return registros.stream()
                .map(this::mapRegistroResumen)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EvaluacionDocenteRegistroDto obtenerRegistroPorId(String id) {
        EvaluacionDocenteRegistro reg = registroRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Registro de evaluación no encontrado: " + id));

        EvaluacionDocenteRegistroDto dto = mapRegistroResumen(reg);
        List<EvaluacionDocenteRespuesta> respuestas = respuestaRepository.findByRegistroId(id);

        dto.setRespuestas(respuestas.stream().map(r -> EvaluacionDocenteRespuestaDto.builder()
                .criterioId(r.getCriterio().getId())
                .numero(r.getCriterio().getNumero())
                .seccionCodigo(r.getCriterio().getSeccion().getCodigo())
                .puntuacion(r.getPuntuacion())
                .build()
        ).collect(Collectors.toList()));

        return dto;
    }

    @Transactional
    public EvaluacionDocenteRegistroDto aplicarEvaluacion(EvaluacionDocenteAplicarRequestDto req, Authentication auth) {
        String usuario = auth != null ? auth.getName() : "SISTEMA";

        EvaluacionInstrumento inst;
        if (req.getInstrumentoId() != null && !req.getInstrumentoId().isBlank()) {
            inst = instrumentoRepository.findById(req.getInstrumentoId())
                    .orElseGet(() -> instrumentoRepository.findByEstado("VIGENTE")
                            .orElseThrow(() -> new IllegalStateException("No hay instrumento de evaluación disponible")));
        } else {
            inst = instrumentoRepository.findByEstado("VIGENTE")
                    .orElseThrow(() -> new IllegalStateException("No hay un instrumento vigente para aplicar evaluaciones"));
        }

        Map<String, EvaluacionCriterio> criteriosMap = criterioRepository.findAll().stream()
                .collect(Collectors.toMap(EvaluacionCriterio::getId, c -> c));

        BigDecimal actitudinal = BigDecimal.ZERO;
        BigDecimal procedimental = BigDecimal.ZERO;
        BigDecimal cognitivo = BigDecimal.ZERO;
        BigDecimal total = BigDecimal.ZERO;

        int totalItemsRespondidos = 0;

        for (EvaluacionDocenteRespuestaDto r : req.getRespuestas()) {
            EvaluacionCriterio crit = criteriosMap.get(r.getCriterioId());
            if (crit == null) {
                crit = criterioRepository.findById(r.getCriterioId()).orElse(null);
            }
            int puntos = r.getPuntuacion();
            total = total.add(BigDecimal.valueOf(puntos));
            totalItemsRespondidos++;

            if (crit != null && crit.getSeccion() != null) {
                String secCod = crit.getSeccion().getCodigo().toUpperCase(Locale.ROOT);
                if (secCod.contains("ACTITUD")) {
                    actitudinal = actitudinal.add(BigDecimal.valueOf(puntos));
                } else if (secCod.contains("PROCEDIM")) {
                    procedimental = procedimental.add(BigDecimal.valueOf(puntos));
                } else if (secCod.contains("COGNIT")) {
                    cognitivo = cognitivo.add(BigDecimal.valueOf(puntos));
                }
            }
        }

        BigDecimal maximoPuntos = BigDecimal.valueOf(Math.max(totalItemsRespondidos, 1) * inst.getEscalaMax());
        BigDecimal porcentaje = maximoPuntos.compareTo(BigDecimal.ZERO) > 0
                ? total.multiply(BigDecimal.valueOf(100)).divide(maximoPuntos, 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        String registroId = "eval-reg-" + UUID.randomUUID().toString();

        String evaluadorNombre = req.getEvaluadorNombre() != null && !req.getEvaluadorNombre().isBlank()
                ? req.getEvaluadorNombre()
                : usuario;
        String evaluadorRol = req.getEvaluadorRol() != null && !req.getEvaluadorRol().isBlank()
                ? req.getEvaluadorRol()
                : "DIRECTOR_CARRERA";

        EvaluacionDocenteRegistro registro = EvaluacionDocenteRegistro.builder()
                .id(registroId)
                .instrumento(inst)
                .gestion(req.getGestion())
                .sedeId(req.getSedeId())
                .sedeCodigo(req.getSedeCodigo())
                .sedeNombre(req.getSedeNombre())
                .carreraId(req.getCarreraId())
                .carreraCodigo(req.getCarreraCodigo())
                .carreraNombre(req.getCarreraNombre())
                .materiaCodigo(req.getMateriaCodigo())
                .materiaNombre(req.getMateriaNombre())
                .grupoCodigo(req.getGrupoCodigo())
                .docenteId(req.getDocenteId())
                .docenteNombre(req.getDocenteNombre())
                .docenteIdentificacion(req.getDocenteIdentificacion())
                .evaluadorId(req.getEvaluadorId())
                .evaluadorNombre(evaluadorNombre)
                .evaluadorRol(evaluadorRol)
                .fechaEvaluacion(req.getFechaEvaluacion())
                .horaEvaluacion(req.getHoraEvaluacion())
                .puntajeActitudinal(actitudinal)
                .puntajeProcedimental(procedimental)
                .puntajeCognitivo(cognitivo)
                .puntajeTotal(total)
                .puntajeMaximo(maximoPuntos)
                .porcentaje(porcentaje)
                .observaciones(req.getObservaciones())
                .estado("COMPLETADA")
                .creadoPor(usuario)
                .build();

        EvaluacionDocenteRegistro guardado = registroRepository.save(registro);

        List<EvaluacionDocenteRespuesta> respuestasEntities = new ArrayList<>();
        for (EvaluacionDocenteRespuestaDto r : req.getRespuestas()) {
            EvaluacionCriterio crit = criteriosMap.get(r.getCriterioId());
            if (crit == null) {
                crit = criterioRepository.findById(r.getCriterioId())
                        .orElseThrow(() -> new IllegalArgumentException("Criterio inválido: " + r.getCriterioId()));
            }
            respuestasEntities.add(EvaluacionDocenteRespuesta.builder()
                    .registro(guardado)
                    .criterio(crit)
                    .puntuacion(r.getPuntuacion())
                    .build());
        }
        respuestaRepository.saveAll(respuestasEntities);

        log.info("Evaluación docente registrada con éxito: Docente={}, Materia={}, Puntaje={}/{} ({}%)",
                guardado.getDocenteNombre(), guardado.getMateriaNombre(), guardado.getPuntajeTotal(),
                guardado.getPuntajeMaximo(), guardado.getPorcentaje());

        EvaluacionDocenteRegistroDto dto = mapRegistroResumen(guardado);
        dto.setRespuestas(req.getRespuestas());
        return dto;
    }

    private EvaluacionInstrumentoDto mapInstrumentoCompleto(EvaluacionInstrumento inst) {
        List<EvaluacionSeccion> secciones = seccionRepository.findByInstrumentoIdOrderByOrdenAsc(inst.getId());
        List<EvaluacionSeccionDto> seccionesDto = new ArrayList<>();
        int totalCrit = 0;

        for (EvaluacionSeccion s : secciones) {
            List<EvaluacionCriterio> criterios = criterioRepository.findBySeccionIdOrderByOrdenAsc(s.getId());
            totalCrit += criterios.size();
            seccionesDto.add(EvaluacionSeccionDto.builder()
                    .id(s.getId())
                    .codigo(s.getCodigo())
                    .nombre(s.getNombre())
                    .descripcion(s.getDescripcion())
                    .orden(s.getOrden())
                    .criterios(criterios.stream().map(c -> EvaluacionCriterioDto.builder()
                            .id(c.getId())
                            .numero(c.getNumero())
                            .enunciado(c.getEnunciado())
                            .orden(c.getOrden())
                            .build()).collect(Collectors.toList()))
                    .build());
        }

        return EvaluacionInstrumentoDto.builder()
                .id(inst.getId())
                .codigo(inst.getCodigo())
                .titulo(inst.getTitulo())
                .descripcion(inst.getDescripcion())
                .estado(inst.getEstado())
                .escalaMin(inst.getEscalaMin())
                .escalaMax(inst.getEscalaMax())
                .creadoPor(inst.getCreadoPor())
                .creadoEn(inst.getCreadoEn())
                .actualizadoEn(inst.getActualizadoEn())
                .totalCriterios(totalCrit)
                .secciones(seccionesDto)
                .build();
    }

    private EvaluacionInstrumentoDto mapInstrumentoResumen(EvaluacionInstrumento inst) {
        List<EvaluacionSeccion> secciones = seccionRepository.findByInstrumentoIdOrderByOrdenAsc(inst.getId());
        int totalCrit = 0;
        for (EvaluacionSeccion s : secciones) {
            totalCrit += criterioRepository.findBySeccionIdOrderByOrdenAsc(s.getId()).size();
        }

        return EvaluacionInstrumentoDto.builder()
                .id(inst.getId())
                .codigo(inst.getCodigo())
                .titulo(inst.getTitulo())
                .descripcion(inst.getDescripcion())
                .estado(inst.getEstado())
                .escalaMin(inst.getEscalaMin())
                .escalaMax(inst.getEscalaMax())
                .creadoPor(inst.getCreadoPor())
                .creadoEn(inst.getCreadoEn())
                .actualizadoEn(inst.getActualizadoEn())
                .totalCriterios(totalCrit)
                .build();
    }

    private EvaluacionDocenteRegistroDto mapRegistroResumen(EvaluacionDocenteRegistro reg) {
        return EvaluacionDocenteRegistroDto.builder()
                .id(reg.getId())
                .instrumentoId(reg.getInstrumento().getId())
                .instrumentoTitulo(reg.getInstrumento().getTitulo())
                .gestion(reg.getGestion())
                .sedeId(reg.getSedeId())
                .sedeCodigo(reg.getSedeCodigo())
                .sedeNombre(reg.getSedeNombre())
                .carreraId(reg.getCarreraId())
                .carreraCodigo(reg.getCarreraCodigo())
                .carreraNombre(reg.getCarreraNombre())
                .materiaCodigo(reg.getMateriaCodigo())
                .materiaNombre(reg.getMateriaNombre())
                .grupoCodigo(reg.getGrupoCodigo())
                .docenteId(reg.getDocenteId())
                .docenteNombre(reg.getDocenteNombre())
                .docenteIdentificacion(reg.getDocenteIdentificacion())
                .evaluadorId(reg.getEvaluadorId())
                .evaluadorNombre(reg.getEvaluadorNombre())
                .evaluadorRol(reg.getEvaluadorRol())
                .fechaEvaluacion(reg.getFechaEvaluacion())
                .horaEvaluacion(reg.getHoraEvaluacion())
                .puntajeActitudinal(reg.getPuntajeActitudinal())
                .puntajeProcedimental(reg.getPuntajeProcedimental())
                .puntajeCognitivo(reg.getPuntajeCognitivo())
                .puntajeTotal(reg.getPuntajeTotal())
                .puntajeMaximo(reg.getPuntajeMaximo())
                .porcentaje(reg.getPorcentaje())
                .observaciones(reg.getObservaciones())
                .estado(reg.getEstado())
                .creadoPor(reg.getCreadoPor())
                .creadoEn(reg.getCreadoEn())
                .build();
    }
}
