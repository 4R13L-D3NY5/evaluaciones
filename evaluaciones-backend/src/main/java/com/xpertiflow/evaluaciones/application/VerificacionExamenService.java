package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionTypstResultadoDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.PrevisualizacionTypstRequestDto;
import com.xpertiflow.evaluaciones.api.dto.verificacion.VerificacionDecisionRequestDto;
import com.xpertiflow.evaluaciones.api.dto.verificacion.VerificacionExamenDetalleDto;
import com.xpertiflow.evaluaciones.api.dto.verificacion.VerificacionExamenListaDto;
import com.xpertiflow.evaluaciones.api.dto.verificacion.VerificacionOpcionDto;
import com.xpertiflow.evaluaciones.api.dto.verificacion.VerificacionPreguntaDto;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaVerificacion;
import com.xpertiflow.evaluaciones.domain.entity.BancoPreguntas;
import com.xpertiflow.evaluaciones.domain.entity.Reactivo;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.entity.VerificacionExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaVerificacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.BancoPreguntasRepository;
import com.xpertiflow.evaluaciones.domain.repository.ReactivoRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.domain.repository.VerificacionExamenRepository;
import com.xpertiflow.evaluaciones.security.BancoCifradoService;
import com.xpertiflow.evaluaciones.security.BancoEncryptedPayload;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class VerificacionExamenService {

    private static final Set<String> ESTADOS_VISIBLES = Set.of("PENDIENTE", "DEVUELTO");
    private static final Map<String, Integer> ORDEN_TIPOS = Map.of(
            "VERDADERO_O_FALSO_SIMPLE", 1,
            "RESPUESTA_PREMISAS_ABCD", 2,
            "VERDADERO_O_FALSO_COMPLEJAS", 3,
            "SELECCION_MEJOR_RESPUESTA", 4,
            "EMPAREJAMIENTO_TRONCO", 5,
            "OPCION_EMPAREJAMIENTO", 5,
            "CASO_CLINICO_TRONCO", 6,
            "SUBITEM_CASO", 6);

    private final RolExamenRepository rolRepository;
    private final BancoPreguntasRepository bancoRepository;
    private final ReactivoRepository reactivoRepository;
    private final VerificacionExamenRepository verificacionRepository;
    private final AuditoriaVerificacionRepository auditoriaRepository;
    private final BancoCifradoService cifradoService;
    private final ObjectMapper objectMapper;
    private final AccesoAcademicoService accesoAcademicoService;
    private final VerificacionPoliticaService politicaService;
    private final com.xpertiflow.evaluaciones.application.generacion.GeneracionTypstService generacionTypstService;

    @Transactional
    public List<VerificacionExamenListaDto> listar(String orden, String sedeCodigo, String carreraCodigo,
                                                    String tipoParcial, String modalidad, String estado,
                                                    Authentication authentication) {
        List<VerificacionExamenListaDto> resultado = new ArrayList<>();
        for (RolExamen rol : rolRepository.findByEstadoFlujo(EstadoFlujo.VALIDADO)) {
            if (!politicaService.aplica(rol)
                    || !accesoAcademicoService.puedeAcceder(rol, authentication)) continue;
            if (!coincideOpcional(rol.getSedeCodigo(), sedeCodigo)
                    || !coincideOpcional(rol.getCarreraCodigo(), carreraCodigo)
                    || !coincideOpcional(rol.getTipoParcial() == null ? null : rol.getTipoParcial().getValor(), tipoParcial)
                    || !coincideOpcional(rol.getModalidad() == null ? null : rol.getModalidad().getValor(), modalidad)) continue;
            BancoPreguntas banco = bancoRepository.findTopByRolExamenIdOrderByFechaAprobacionDesc(rol.getId()).orElse(null);
            if (banco == null || !"VALIDADO".equalsIgnoreCase(banco.getEstado())) continue;
            VerificacionExamen verificacion = asegurarPendiente(rol, banco);
            if (estado != null && !estado.isBlank()) {
                if (!estado.equalsIgnoreCase(verificacion.getEstado())) continue;
            } else if (!ESTADOS_VISIBLES.contains(verificacion.getEstado())) {
                continue;
            }
            resultado.add(mapearLista(rol, banco, verificacion));
        }
        Comparator<VerificacionExamenListaDto> comparador;
        if ("FECHA_SUBIDA_ASC".equalsIgnoreCase(orden)) {
            comparador = Comparator.comparing(VerificacionExamenListaDto::getFechaSubida,
                    Comparator.nullsLast(Comparator.naturalOrder()));
        } else if ("FECHA_SUBIDA_DESC".equalsIgnoreCase(orden)) {
            comparador = Comparator.comparing(VerificacionExamenListaDto::getFechaSubida,
                    Comparator.nullsLast(Comparator.reverseOrder()));
        } else if ("FECHA_EXAMEN_DESC".equalsIgnoreCase(orden)) {
            comparador = Comparator.comparing(VerificacionExamenListaDto::getFechaExamen,
                    Comparator.nullsLast(Comparator.reverseOrder()));
        } else {
            comparador = Comparator.comparing(VerificacionExamenListaDto::getFechaExamen,
                    Comparator.nullsLast(Comparator.naturalOrder()));
        }
        return resultado.stream().sorted(comparador.thenComparing(VerificacionExamenListaDto::getHorario,
                Comparator.nullsLast(Comparator.naturalOrder())).thenComparing(VerificacionExamenListaDto::getMateriaCodigo,
                Comparator.nullsLast(Comparator.naturalOrder()))).toList();
    }

    @Transactional
    public VerificacionExamenDetalleDto obtenerDetalle(String rolExamenId, Authentication authentication) {
        RolExamen rol = obtenerRolAccesible(rolExamenId, authentication);
        BancoPreguntas banco = obtenerBancoValidado(rol);
        VerificacionExamen verificacion = asegurarPendiente(rol, banco);
        List<Reactivo> reactivos = descifrarReactivos(banco);
        Map<String, String> observaciones = observaciones(verificacion);
        VerificacionExamenDetalleDto dto = mapearDetalle(rol, banco, verificacion);
        dto.setPreguntas(reactivos.stream()
                .sorted(Comparator.comparingInt(this::ordenTipo).thenComparing(Reactivo::getNumeroOrden,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(reactivo -> mapearPregunta(reactivo, observaciones.get(String.valueOf(reactivo.getNumeroOrden()))))
                .toList());
        return dto;
    }

    @Transactional
    public GeneracionTypstResultadoDto solicitarPrevisualizacion(String rolExamenId, Authentication authentication) {
        RolExamen rol = obtenerRolAccesible(rolExamenId, authentication);
        BancoPreguntas banco = obtenerBancoValidado(rol);
        asegurarPendiente(rol, banco);
        List<Map<String, Object>> preguntas = descifrarReactivos(banco).stream()
                .sorted(Comparator.comparingInt(this::ordenTipo).thenComparing(Reactivo::getNumeroOrden,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::mapaParaWorker)
                .toList();
        PrevisualizacionTypstRequestDto request = new PrevisualizacionTypstRequestDto();
        request.setRolExamenId(rolExamenId);
        request.setPreguntas(preguntas);
        request.setModoVerificacion(true);
        request.setIncluirClave(true);
        registrarAuditoria(rolExamenId, "PREVISUALIZACION_VERIFICACION", authentication.getName(),
                "Se generó la vista completa del banco validado");
        return generacionTypstService.solicitarPrevisualizacion(request);
    }

    @Transactional
    public VerificacionExamenDetalleDto decidir(String rolExamenId, VerificacionDecisionRequestDto request,
                                                Authentication authentication) {
        RolExamen rol = obtenerRolAccesible(rolExamenId, authentication);
        BancoPreguntas banco = obtenerBancoValidado(rol);
        VerificacionExamen verificacion = asegurarPendiente(rol, banco);
        String decision = request.getDecision().trim().toUpperCase(Locale.ROOT);
        boolean aprobar = Set.of("APROBAR", "APROBADO", "VERIFICAR", "VERIFICADO").contains(decision);
        boolean devolver = Set.of("DEVOLVER", "DEVUELTO", "RECHAZAR", "RECHAZADO").contains(decision);
        if (!aprobar && !devolver) throw new IllegalArgumentException("La decisión debe ser APROBAR o DEVOLVER");
        String general = valor(request.getObservacionesGenerales());
        Map<String, String> notas = limpiarObservaciones(request.getObservacionesPreguntas());
        if (devolver && general.isBlank() && notas.isEmpty()) {
            throw new IllegalArgumentException("Para devolver el examen debe registrar observaciones");
        }
        verificacion.setEstado(aprobar ? "VERIFICADO" : "DEVUELTO");
        verificacion.setObservacionesGenerales(general.isBlank() ? null : general);
        verificacion.setObservacionesPreguntasJson(serializar(notas));
        verificacion.setVerificadoPor(authentication.getName());
        verificacion.setFechaVerificacion(LocalDateTime.now());
        verificacion.setActualizadoEn(LocalDateTime.now());
        verificacionRepository.save(verificacion);
        registrarAuditoria(rolExamenId, aprobar ? "EXAMEN_VERIFICADO" : "EXAMEN_DEVUELTO",
                authentication.getName(), general);
        return obtenerDetalle(rolExamenId, authentication);
    }

    @Transactional
    public void reiniciarPorReemplazo(String rolExamenId, String bancoPreguntasId, String actor) {
        verificacionRepository.findByRolExamenId(rolExamenId).ifPresent(verificacion -> {
            verificacion.setBancoPreguntasId(bancoPreguntasId);
            verificacion.setEstado("PENDIENTE");
            verificacion.setObservacionesGenerales(null);
            verificacion.setObservacionesPreguntasJson(null);
            verificacion.setVerificadoPor(null);
            verificacion.setFechaVerificacion(null);
            verificacion.setActualizadoEn(LocalDateTime.now());
            verificacionRepository.save(verificacion);
            registrarAuditoria(rolExamenId, "REINICIO_VERIFICACION_POR_REEMPLAZO", actor,
                    "El banco validado fue reemplazado");
        });
    }

    private VerificacionExamen asegurarPendiente(RolExamen rol, BancoPreguntas banco) {
        VerificacionExamen existente = verificacionRepository.findByRolExamenId(rol.getId()).orElse(null);
        if (existente != null && banco.getId().equals(existente.getBancoPreguntasId())) return existente;
        VerificacionExamen nueva = existente == null ? new VerificacionExamen() : existente;
        nueva.setRolExamenId(rol.getId());
        nueva.setBancoPreguntasId(banco.getId());
        nueva.setEstado("PENDIENTE");
        nueva.setObservacionesGenerales(null);
        nueva.setObservacionesPreguntasJson(null);
        nueva.setVerificadoPor(null);
        nueva.setFechaVerificacion(null);
        if (nueva.getCreadoEn() == null) nueva.setCreadoEn(LocalDateTime.now());
        nueva.setActualizadoEn(LocalDateTime.now());
        return verificacionRepository.save(nueva);
    }

    private RolExamen obtenerRolAccesible(String id, Authentication authentication) {
        RolExamen rol = rolRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + id));
        if (rol.getEstadoFlujo() != EstadoFlujo.VALIDADO || !politicaService.aplica(rol)
                || !accesoAcademicoService.puedeAcceder(rol, authentication)) {
            throw new AccessDeniedException("El examen no está disponible para verificación");
        }
        return rol;
    }

    private BancoPreguntas obtenerBancoValidado(RolExamen rol) {
        BancoPreguntas banco = bancoRepository.findTopByRolExamenIdOrderByFechaAprobacionDesc(rol.getId())
                .orElseThrow(() -> new IllegalArgumentException("No existe un banco de preguntas para este examen"));
        if (!"VALIDADO".equalsIgnoreCase(banco.getEstado())) {
            throw new IllegalArgumentException("El banco de preguntas todavía no está validado");
        }
        return banco;
    }

    private List<Reactivo> descifrarReactivos(BancoPreguntas banco) {
        BancoEncryptedPayload payload = BancoEncryptedPayload.builder()
                .ciphertext(banco.getContenidoCifrado())
                .nonce(banco.getContenidoNonce())
                .wrappedDataKey(banco.getContenidoDekEnvuelta())
                .keyReference(banco.getContenidoKekReferencia())
                .keyVersion(banco.getContenidoKekVersion())
                .algorithm(banco.getContenidoAlgoritmo())
                .build();
        String json = cifradoService.descifrarTexto(payload, "banco:" + banco.getId() + ":rol:" + banco.getRolExamenId());
        try {
            return objectMapper.readValue(json, new TypeReference<List<Reactivo>>() { });
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("No se pudo leer el contenido del banco validado", exception);
        }
    }

    private VerificacionExamenListaDto mapearLista(RolExamen rol, BancoPreguntas banco, VerificacionExamen verificacion) {
        VerificacionExamenListaDto dto = new VerificacionExamenListaDto();
        dto.setRolExamenId(rol.getId()); dto.setBancoPreguntasId(banco.getId());
        dto.setSedeCodigo(rol.getSedeCodigo()); dto.setSedeNombre(rol.getSedeNombre());
        dto.setCarreraCodigo(rol.getCarreraCodigo()); dto.setCarreraNombre(rol.getCarreraNombre());
        dto.setMateriaCodigo(rol.getMateriaCodigo()); dto.setMateriaNombre(rol.getMateriaNombre());
        dto.setGrupo(rol.getGrupo()); dto.setTipoParcial(rol.getTipoParcial().getValor());
        dto.setVersion(rol.getVersion()); dto.setModalidad(rol.getModalidad().getValor());
        dto.setFechaExamen(rol.getFecha()); dto.setHorario(rol.getHorario());
        dto.setFechaSubida(banco.getCreadoEn() == null ? banco.getFechaAprobacion() : banco.getCreadoEn());
        dto.setDocenteNombre(rol.getDocenteNombre()); dto.setEstadoVerificacion(verificacion.getEstado());
        dto.setObservacionesGenerales(verificacion.getObservacionesGenerales());
        return dto;
    }

    private VerificacionExamenDetalleDto mapearDetalle(RolExamen rol, BancoPreguntas banco, VerificacionExamen verificacion) {
        VerificacionExamenDetalleDto dto = new VerificacionExamenDetalleDto();
        dto.setRolExamenId(rol.getId()); dto.setBancoPreguntasId(banco.getId());
        dto.setSedeNombre(rol.getSedeNombre()); dto.setCarreraNombre(rol.getCarreraNombre());
        dto.setMateriaCodigo(rol.getMateriaCodigo()); dto.setMateriaNombre(rol.getMateriaNombre());
        dto.setGrupo(rol.getGrupo()); dto.setTipoParcial(rol.getTipoParcial().getValor());
        dto.setVersion(rol.getVersion()); dto.setModalidad(rol.getModalidad().getValor());
        dto.setFechaExamen(rol.getFecha()); dto.setHorario(rol.getHorario());
        dto.setFechaSubida(banco.getCreadoEn() == null ? banco.getFechaAprobacion() : banco.getCreadoEn());
        dto.setDocenteNombre(rol.getDocenteNombre()); dto.setEstadoVerificacion(verificacion.getEstado());
        dto.setObservacionesGenerales(verificacion.getObservacionesGenerales());
        return dto;
    }

    private VerificacionPreguntaDto mapearPregunta(Reactivo reactivo, String observacion) {
        VerificacionPreguntaDto dto = new VerificacionPreguntaDto();
        dto.setNumeroOriginal(reactivo.getNumeroOrden());
        dto.setIdentificadorOriginal(String.valueOf(reactivo.getNumeroOrden()));
        dto.setTipoReactivo(reactivo.getTipoReactivo()); dto.setDificultad(reactivo.getDificultad());
        dto.setNivelDificultad(reactivo.getNivelDificultad()); dto.setGrupoContexto(reactivo.getGrupoContexto());
        dto.setEnunciado(reactivo.getEnunciado()); dto.setImagenBase64(reactivo.getImagenBase64());
        dto.setRespuestaCorrecta(reactivo.getRespuestaCorrecta()); dto.setPesoPuntos(reactivo.getPesoPuntos());
        dto.setObservacion(observacion);
        dto.setOpciones(parsearOpciones(reactivo.getOpcionesJson()));
        return dto;
    }

    private List<VerificacionOpcionDto> parsearOpciones(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            JsonNode nodo = objectMapper.readTree(json);
            List<VerificacionOpcionDto> resultado = new ArrayList<>();
            if (nodo.isArray()) for (JsonNode item : nodo) {
                VerificacionOpcionDto opcion = new VerificacionOpcionDto();
                opcion.setLetra(item.path("letra").asText(item.path("opcion").asText("")));
                opcion.setTexto(item.path("texto").asText(item.path("enunciado_opcion").asText("")));
                opcion.setCorrecta(item.path("correcta").asBoolean(item.path("es_correcta").asBoolean(false)));
                resultado.add(opcion);
            }
            return resultado;
        } catch (JsonProcessingException exception) {
            return List.of();
        }
    }

    private Map<String, Object> mapaParaWorker(Reactivo reactivo) {
        Map<String, Object> mapa = new HashMap<>();
        mapa.put("id", reactivo.getId()); mapa.put("numero_orden", reactivo.getNumeroOrden());
        mapa.put("tipo_reactivo", reactivo.getTipoReactivo()); mapa.put("dificultad", reactivo.getDificultad());
        mapa.put("nivel_dificultad", reactivo.getNivelDificultad()); mapa.put("grupo_contexto", reactivo.getGrupoContexto());
        mapa.put("enunciado", reactivo.getEnunciado()); mapa.put("imagen_base64", reactivo.getImagenBase64());
        mapa.put("opciones_json", reactivo.getOpcionesJson()); mapa.put("respuesta_correcta", reactivo.getRespuestaCorrecta());
        mapa.put("peso_puntos", reactivo.getPesoPuntos());
        return mapa;
    }

    private int ordenTipo(Reactivo reactivo) {
        return ORDEN_TIPOS.getOrDefault(reactivo.getTipoReactivo(), 99);
    }

    private Map<String, String> observaciones(VerificacionExamen verificacion) {
        if (verificacion.getObservacionesPreguntasJson() == null) return Map.of();
        try { return objectMapper.readValue(verificacion.getObservacionesPreguntasJson(), new TypeReference<Map<String, String>>() { }); }
        catch (JsonProcessingException exception) { return Map.of(); }
    }

    private Map<String, String> limpiarObservaciones(Map<String, String> entradas) {
        Map<String, String> resultado = new HashMap<>();
        if (entradas == null) return resultado;
        entradas.forEach((clave, valor) -> { if (!valor(valor).isBlank()) resultado.put(clave, valor(valor)); });
        return resultado;
    }

    private String serializar(Map<String, String> valor) {
        try { return objectMapper.writeValueAsString(valor); }
        catch (JsonProcessingException exception) { throw new IllegalStateException("No se pudieron guardar las observaciones", exception); }
    }

    private void registrarAuditoria(String rolExamenId, String accion, String actor, String detalle) {
        AuditoriaVerificacion auditoria = new AuditoriaVerificacion();
        auditoria.setRolExamenId(rolExamenId); auditoria.setAccion(accion);
        auditoria.setRealizadoPor(actor == null || actor.isBlank() ? "SISTEMA" : actor);
        auditoria.setDetalle(detalle); auditoria.setFechaEvento(LocalDateTime.now());
        auditoriaRepository.save(auditoria);
    }

    private boolean coincideOpcional(String actual, String filtro) {
        return filtro == null || filtro.isBlank() || Objects.equals(normalizar(actual), normalizar(filtro));
    }

    private String normalizar(String valor) { return valor == null ? "" : valor.trim().toUpperCase(Locale.ROOT); }
    private String valor(String valor) { return valor == null ? "" : valor.trim(); }
}
