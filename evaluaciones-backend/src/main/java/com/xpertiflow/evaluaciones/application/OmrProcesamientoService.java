package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.xpertiflow.evaluaciones.api.dto.AjustarCalificacionOmrRequestDto;
import com.xpertiflow.evaluaciones.api.dto.CalificacionOmrResponseDto;
import com.xpertiflow.evaluaciones.api.dto.ConfiguracionOmrDto;
import com.xpertiflow.evaluaciones.api.dto.DetalleRespuestaOmrDto;
import com.xpertiflow.evaluaciones.config.AppProperties;
import com.xpertiflow.evaluaciones.domain.entity.CalificacionOmr;
import com.xpertiflow.evaluaciones.domain.entity.ConfiguracionOmr;
import com.xpertiflow.evaluaciones.domain.entity.ExamenVariante;
import com.xpertiflow.evaluaciones.domain.entity.LoteCartillasOmr;
import com.xpertiflow.evaluaciones.domain.entity.MapeoEstudianteVariante;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.repository.CalificacionOmrRepository;
import com.xpertiflow.evaluaciones.domain.repository.ConfiguracionOmrRepository;
import com.xpertiflow.evaluaciones.domain.repository.ExamenVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.LoteCartillasOmrRepository;
import com.xpertiflow.evaluaciones.domain.repository.MapeoEstudianteVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.security.BancoCifradoService;
import com.xpertiflow.evaluaciones.security.BancoEncryptedPayload;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OmrProcesamientoService {
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;
    private final AppProperties appProperties;
    private final CalificacionOmrRepository calificacionRepository;
    private final ConfiguracionOmrRepository configuracionRepository;
    private final MapeoEstudianteVarianteRepository mapeoRepository;
    private final ExamenVarianteRepository varianteRepository;
    private final RolExamenRepository rolExamenRepository;
    private final LoteCartillasOmrRepository loteCartillasRepository;
    private final BancoCifradoService cifradoService;
    private final Map<String, JsonNode> resultados = new ConcurrentHashMap<>();

    public JsonNode solicitar(String rolExamenId, MultipartFile archivo) {
        return solicitar(rolExamenId, archivo, "CALIFICACION");
    }

    public JsonNode solicitarLecturaConciliacion(String rolExamenId, MultipartFile archivo) {
        return solicitar(rolExamenId, archivo, "LECTURA_CONCILIACION");
    }

    private JsonNode solicitar(String rolExamenId, MultipartFile archivo, String modo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("Debe seleccionar un PDF o imagen escaneada.");
        }
        validarCantidadPaginas(rolExamenId, archivo);
        String jobId = "OMR-" + UUID.randomUUID();
        String original = archivo.getOriginalFilename() == null ? "" : archivo.getOriginalFilename().toLowerCase(Locale.ROOT);
        String extension = original.endsWith(".pdf") ? ".pdf" : original.endsWith(".jpg") || original.endsWith(".jpeg") ? ".jpg" : ".png";
        Path destino = Path.of(appProperties.getStorage().getBasePath(), "omr", rolExamenId, "entrada", jobId + extension);
        try {
            Files.createDirectories(destino.getParent());
            archivo.transferTo(destino);
            JsonNode solicitud = objectMapper.valueToTree(Map.of(
                    "jobId", jobId,
                    "rolExamenId", rolExamenId,
                    "archivoPath", destino.toString(),
                    "modo", modo
            ));
            rabbitTemplate.convertAndSend("evaluaciones.omr.procesar", solicitud.toString());
            JsonNode aceptado = objectMapper.createObjectNode().put("jobId", jobId).put("estado", "EN_COLA");
            resultados.put(jobId, aceptado);
            return aceptado;
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo guardar el escaneo OMR", exception);
        }
    }

    private void validarCantidadPaginas(String rolExamenId, MultipartFile archivo) {
        RolExamen rol = rolExamenRepository.findById(rolExamenId)
                .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + rolExamenId));
        if (rol.getModalidad() != ModalidadExamen.PRESENCIAL_CARTILLA) {
            throw new IllegalArgumentException("El procesamiento OMR solo corresponde a exámenes con cartilla.");
        }

        int cartillasEsperadas = loteCartillasRepository.findFirstByRolExamenIdOrderByGeneradoEnDesc(rolExamenId)
                .map(LoteCartillasOmr::getTotalCartillas)
                .filter(total -> total != null && total > 0)
                .orElse(rol.getEstudiantesInscritosCount() == null ? 0 : rol.getEstudiantesInscritosCount());
        if (cartillasEsperadas <= 0) {
            throw new IllegalArgumentException("No se pudo determinar la cantidad de cartillas entregadas para este rol. Genere primero el lote de cartillas.");
        }

        int paginas = contarPaginas(archivo);
        if (paginas != cartillasEsperadas) {
            throw new IllegalArgumentException(String.format(
                    "El escaneado contiene %d página%s, pero el rol tiene %d cartilla%s entregada%s. Verifique que corresponda al mismo grupo y vuelva a cargar el archivo.",
                    paginas, paginas == 1 ? "" : "s", cartillasEsperadas, cartillasEsperadas == 1 ? "" : "s", cartillasEsperadas == 1 ? "" : "s"));
        }
    }

    private int contarPaginas(MultipartFile archivo) {
        String nombre = archivo.getOriginalFilename() == null ? "" : archivo.getOriginalFilename().toLowerCase(Locale.ROOT);
        if (!nombre.endsWith(".pdf") && !"application/pdf".equalsIgnoreCase(archivo.getContentType())) {
            return 1;
        }
        try (PDDocument documento = PDDocument.load(archivo.getInputStream())) {
            return documento.getNumberOfPages();
        } catch (IOException | RuntimeException exception) {
            throw new IllegalArgumentException("No se pudo leer el PDF escaneado para validar sus páginas. Verifique que el archivo no esté dañado.", exception);
        }
    }

    public JsonNode consultar(String jobId) {
        return resultados.getOrDefault(jobId, objectMapper.createObjectNode().put("jobId", jobId).put("estado", "NO_ENCONTRADO"));
    }

    @Transactional(readOnly = true)
    public List<CalificacionOmrResponseDto> listarCalificaciones(String rolExamenId) {
        return calificacionRepository.findByRolExamenIdOrderByCodigoEstudianteAsc(rolExamenId).stream()
                .map(this::mapearCalificacion)
                .toList();
    }

    @Transactional(readOnly = true)
    public ConfiguracionOmrDto obtenerConfiguracion() {
        return mapearConfiguracion(configuracionRepository.findById((short) 1)
                .orElseGet(this::configuracionDefecto));
    }

    @Transactional
    public ConfiguracionOmrDto guardarConfiguracion(ConfiguracionOmrDto request) {
        ConfiguracionOmr configuracion = configuracionRepository.findById((short) 1)
                .orElseGet(this::configuracionDefecto);
        configuracion.setId((short) 1);
        if (request.getUmbralDensidadMarca() != null) configuracion.setUmbralDensidadMarca(request.getUmbralDensidadMarca());
        if (request.getUmbralDiferencialDoble() != null) configuracion.setUmbralDiferencialDoble(request.getUmbralDiferencialDoble());
        if (request.getUmbralBinarioGrilla() != null) configuracion.setUmbralBinarioGrilla(request.getUmbralBinarioGrilla());
        if (request.getNivelTintaMarca() != null) configuracion.setNivelTintaMarca(request.getNivelTintaMarca());
        if (request.getZonaCodigoX() != null) configuracion.setZonaCodigoX(request.getZonaCodigoX());
        if (request.getZonaCodigoY() != null) configuracion.setZonaCodigoY(request.getZonaCodigoY());
        if (request.getZonaCodigoAncho() != null) configuracion.setZonaCodigoAncho(request.getZonaCodigoAncho());
        if (request.getZonaCodigoAlto() != null) configuracion.setZonaCodigoAlto(request.getZonaCodigoAlto());
        if (request.getEscalaOcr() != null) configuracion.setEscalaOcr(request.getEscalaOcr());
        if (request.getRadioBusquedaPixeles() != null) configuracion.setRadioBusquedaPixeles(request.getRadioBusquedaPixeles());
        configuracion.setActualizadoEn(LocalDateTime.now());
        configuracion.setActualizadoPor(usuarioValido(request.getActualizadoPor()));
        return mapearConfiguracion(configuracionRepository.save(configuracion));
    }

    private ConfiguracionOmr configuracionDefecto() {
        ConfiguracionOmr configuracion = new ConfiguracionOmr();
        configuracion.setId((short) 1);
        configuracion.setUmbralDensidadMarca(new BigDecimal("70.00"));
        configuracion.setUmbralDiferencialDoble(new BigDecimal("18.00"));
        configuracion.setUmbralBinarioGrilla((short) 185);
        configuracion.setNivelTintaMarca((short) 145);
        configuracion.setZonaCodigoX(new BigDecimal("0.5300"));
        configuracion.setZonaCodigoY(new BigDecimal("0.0900"));
        configuracion.setZonaCodigoAncho(new BigDecimal("0.2200"));
        configuracion.setZonaCodigoAlto(new BigDecimal("0.0500"));
        configuracion.setEscalaOcr(new BigDecimal("2.50"));
        configuracion.setRadioBusquedaPixeles((short) 2);
        configuracion.setActualizadoPor("ADMIN_EVALUACIONES");
        return configuracion;
    }

    private ConfiguracionOmrDto mapearConfiguracion(ConfiguracionOmr configuracion) {
        ConfiguracionOmrDto dto = new ConfiguracionOmrDto();
        dto.setUmbralDensidadMarca(configuracion.getUmbralDensidadMarca());
        dto.setUmbralDiferencialDoble(configuracion.getUmbralDiferencialDoble());
        dto.setUmbralBinarioGrilla(configuracion.getUmbralBinarioGrilla());
        dto.setNivelTintaMarca(configuracion.getNivelTintaMarca());
        dto.setZonaCodigoX(configuracion.getZonaCodigoX());
        dto.setZonaCodigoY(configuracion.getZonaCodigoY());
        dto.setZonaCodigoAncho(configuracion.getZonaCodigoAncho());
        dto.setZonaCodigoAlto(configuracion.getZonaCodigoAlto());
        dto.setEscalaOcr(configuracion.getEscalaOcr());
        dto.setRadioBusquedaPixeles(configuracion.getRadioBusquedaPixeles());
        dto.setActualizadoEn(configuracion.getActualizadoEn());
        dto.setActualizadoPor(configuracion.getActualizadoPor());
        return dto;
    }

    @Transactional
    public CalificacionOmrResponseDto ajustarCalificacion(String rolExamenId, AjustarCalificacionOmrRequestDto request) {
        String codigo = request.getCodigoEstudiante() == null ? "" : request.getCodigoEstudiante().trim();
        if (codigo.isBlank()) {
            throw new IllegalArgumentException("El código del estudiante es obligatorio.");
        }

        MapeoEstudianteVariante mapeo = mapeoRepository.findByRolExamenIdAndCodigoEstudiante(rolExamenId, codigo)
                .orElseThrow(() -> new IllegalArgumentException(
                        "El código " + codigo + " no pertenece a la nómina oficial de esta evaluación."));
        ExamenVariante variante = varianteRepository.findById(mapeo.getVarianteId())
                .orElseThrow(() -> new IllegalStateException("No existe el patrón de la variante asignada al estudiante."));

        if (request.getCodigoAnterior() != null && !request.getCodigoAnterior().isBlank()
                && !request.getCodigoAnterior().trim().equals(codigo)) {
            calificacionRepository.findByRolExamenIdAndCodigoEstudiante(rolExamenId, request.getCodigoAnterior().trim())
                    .ifPresent(calificacionRepository::delete);
        }

        Map<String, String> respuestas = normalizarRespuestas(request.getRespuestas());
        Map<String, String> patron = leerPatron(variante);
        int total = patron.isEmpty() ? (respuestas.isEmpty() ? 30 : respuestas.size()) : patron.size();
        int aciertos = 0;
        int blancos = 0;
        int dobles = 0;
        for (int pregunta = 1; pregunta <= total; pregunta++) {
            String respuesta = respuestas.getOrDefault(String.valueOf(pregunta), "");
            if (respuesta.isBlank()) {
                blancos++;
            } else if (respuesta.length() > 1) {
                dobles++;
            } else if (respuesta.equalsIgnoreCase(patron.getOrDefault(String.valueOf(pregunta), ""))) {
                aciertos++;
            }
        }
        int fallos = Math.max(0, total - aciertos - blancos);
        BigDecimal nota100 = total == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(aciertos * 100.0 / total).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal nota30 = total == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(aciertos * 30.0 / total).setScale(2, java.math.RoundingMode.HALF_UP);

        CalificacionOmr calificacion = calificacionRepository
                .findByRolExamenIdAndCodigoEstudiante(rolExamenId, codigo)
                .orElseGet(CalificacionOmr::new);
        calificacion.setRolExamenId(rolExamenId);
        calificacion.setCodigoEstudiante(codigo);
        calificacion.setEstudianteNombreCompleto(nombreCompleto(mapeo));
        calificacion.setLetraVariante(mapeo.getLetraVariante());
        calificacion.setTotalReactivos(total);
        calificacion.setAciertos(aciertos);
        calificacion.setFallos(fallos);
        calificacion.setBlancos(blancos);
        calificacion.setDoblesMarcas(dobles);
        calificacion.setNotaSobre30(nota30);
        calificacion.setNotaSobre100(nota100);
        calificacion.setEstadoCalificacion(nota100.doubleValue() >= 51 ? "APROBADO" : "REPROBADO");
        try {
            calificacion.setRespuestasDetectadasJson(objectMapper.writeValueAsString(respuestas));
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudieron serializar las respuestas ajustadas.", exception);
        }
        calificacion.setProcesadoPor(usuarioValido(request.getUsuario()) + "_AJUSTE_OMR");
        return mapearCalificacion(calificacionRepository.save(calificacion));
    }

    private Map<String, String> leerPatron(ExamenVariante variante) {
        try {
            String contenidoSeguro = descifrarContenidoVariante(variante);
            JsonNode contenido = objectMapper.readTree(contenidoSeguro);
            String patronJson = contenido.path("patronClavesJson").asText("");
            if (patronJson.isBlank()) return Map.of();
            return objectMapper.readValue(patronJson, new TypeReference<LinkedHashMap<String, String>>() {});
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo leer el patrón cifrado de la variante.", exception);
        }
    }

    private String descifrarContenidoVariante(ExamenVariante variante) {
        if (variante.getContenidoSeguroCifrado() == null || variante.getContenidoSeguroCifrado().isBlank()) {
            throw new IllegalStateException("La variante no tiene contenido cifrado; debe regenerarse con la protección vigente");
        }
        BancoEncryptedPayload payload = BancoEncryptedPayload.builder()
                .ciphertext(variante.getContenidoSeguroCifrado())
                .nonce(variante.getContenidoSeguroNonce())
                .wrappedDataKey(variante.getContenidoSeguroDekEnvuelta())
                .keyReference(variante.getContenidoSeguroKekReferencia())
                .keyVersion(variante.getContenidoSeguroKekVersion())
                .algorithm(variante.getContenidoSeguroAlgoritmo())
                .build();
        return cifradoService.descifrarTexto(payload,
                "variante:" + variante.getId() + ":rol:" + variante.getRolExamenId());
    }

    private Map<String, String> normalizarRespuestas(Map<String, String> respuestas) {
        Map<String, String> normalizadas = new LinkedHashMap<>();
        if (respuestas == null) return normalizadas;
        respuestas.forEach((pregunta, respuesta) -> {
            if (pregunta == null || pregunta.isBlank()) return;
            String valor = respuesta == null ? "" : respuesta.trim().toUpperCase(Locale.ROOT);
            normalizadas.put(pregunta.trim(), "—".equals(valor) ? "" : valor);
        });
        return normalizadas;
    }

    private String nombreCompleto(MapeoEstudianteVariante mapeo) {
        return String.join(" ", List.of(mapeo.getNombres(), mapeo.getApellidoPaterno(), mapeo.getApellidoMaterno()).stream()
                .filter(valor -> valor != null && !valor.isBlank()).toList());
    }

    private String usuarioValido(String usuario) {
        return usuario == null || usuario.isBlank() ? "ADMIN_EVALUACIONES" : usuario.trim();
    }

    private CalificacionOmrResponseDto mapearCalificacion(CalificacionOmr calificacion) {
        CalificacionOmrResponseDto dto = new CalificacionOmrResponseDto();
        dto.setId(calificacion.getId());
        dto.setRolExamenId(calificacion.getRolExamenId());
        dto.setCodigoEstudiante(calificacion.getCodigoEstudiante());
        dto.setEstudianteNombreCompleto(calificacion.getEstudianteNombreCompleto());
        dto.setLetraVariante(calificacion.getLetraVariante());
        dto.setTotalReactivos(calificacion.getTotalReactivos());
        dto.setAciertos(calificacion.getAciertos());
        dto.setFallos(calificacion.getFallos());
        dto.setBlancos(calificacion.getBlancos());
        dto.setDoblesMarcas(calificacion.getDoblesMarcas());
        dto.setNotaSobre30(calificacion.getNotaSobre30());
        dto.setNotaSobre100(calificacion.getNotaSobre100());
        dto.setEstadoCalificacion(calificacion.getEstadoCalificacion());
        dto.setRespuestasDetectadasJson(calificacion.getRespuestasDetectadasJson());
        dto.setDetalles(detallesCalificacion(calificacion));
        dto.setImagenCartillaAnotadaPath(calificacion.getImagenCartillaAnotadaPath());
        dto.setArchivoEscaneadoPath(calificacion.getArchivoEscaneadoPath());
        dto.setProcesadoPor(calificacion.getProcesadoPor());
        dto.setFechaProcesamiento(calificacion.getFechaProcesamiento());
        return dto;
    }

    private List<DetalleRespuestaOmrDto> detallesCalificacion(CalificacionOmr calificacion) {
        Map<String, String> respuestas = new LinkedHashMap<>();
        if (calificacion.getRespuestasDetectadasJson() != null && !calificacion.getRespuestasDetectadasJson().isBlank()) {
            try {
                respuestas = objectMapper.readValue(calificacion.getRespuestasDetectadasJson(), new TypeReference<LinkedHashMap<String, String>>() {});
            } catch (IOException exception) {
                throw new IllegalStateException("No se pudieron leer las respuestas guardadas del OMR.", exception);
            }
        }
        Map<String, String> patron = varianteRepository
                .findByRolExamenIdAndLetraVariante(calificacion.getRolExamenId(), calificacion.getLetraVariante())
                .map(this::leerPatron)
                .orElse(Map.of());
        int total = calificacion.getTotalReactivos() == null ? 0 : calificacion.getTotalReactivos();
        List<DetalleRespuestaOmrDto> detalles = new ArrayList<>();
        for (int pregunta = 1; pregunta <= total; pregunta++) {
            String numero = String.valueOf(pregunta);
            String respuesta = respuestas.getOrDefault(numero, "");
            String correcta = patron.getOrDefault(numero, "");
            String estado;
            if (respuesta.isBlank()) {
                estado = "EN_BLANCO";
            } else if (respuesta.length() > 1) {
                estado = "DOBLE_MARCA";
            } else if (correcta.isBlank()) {
                estado = "SIN_PATRON";
            } else {
                estado = respuesta.equalsIgnoreCase(correcta) ? "CORRECTA" : "INCORRECTA";
            }
            DetalleRespuestaOmrDto detalle = new DetalleRespuestaOmrDto();
            detalle.setPregunta(pregunta);
            detalle.setRespuesta(respuesta);
            detalle.setRespuestaCorrecta(correcta);
            detalle.setEstado(estado);
            detalles.add(detalle);
        }
        return detalles;
    }

    public void registrarResultado(String mensaje) throws IOException {
        JsonNode resultado = objectMapper.readTree(mensaje);
        resultados.put(resultado.path("jobId").asText(), resultado);
    }
}
