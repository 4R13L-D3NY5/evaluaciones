package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import com.xpertiflow.evaluaciones.api.dto.AjustarCalificacionOmrRequestDto;
import com.xpertiflow.evaluaciones.api.dto.CalificacionOmrResponseDto;
import com.xpertiflow.evaluaciones.api.dto.ConfiguracionOmrDto;
import com.xpertiflow.evaluaciones.api.dto.DetalleRespuestaOmrDto;
import com.xpertiflow.evaluaciones.api.dto.PatronCalificadoResponseDto;
import com.xpertiflow.evaluaciones.config.AppProperties;
import com.xpertiflow.evaluaciones.domain.entity.CalificacionOmr;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import com.xpertiflow.evaluaciones.domain.entity.ConfiguracionOmr;
import com.xpertiflow.evaluaciones.domain.entity.ExamenVariante;
import com.xpertiflow.evaluaciones.domain.entity.LoteCartillasOmr;
import com.xpertiflow.evaluaciones.domain.entity.MapeoEstudianteVariante;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.repository.CalificacionOmrRepository;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
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
import java.util.Comparator;

@Service
@RequiredArgsConstructor
public class OmrProcesamientoService {
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;
    private final AppProperties appProperties;
    private final CalificacionOmrRepository calificacionRepository;
    private final AuditoriaEvaluacionRepository auditoriaRepository;
    private final ConfiguracionOmrRepository configuracionRepository;
    private final MapeoEstudianteVarianteRepository mapeoRepository;
    private final ExamenVarianteRepository varianteRepository;
    private final RolExamenRepository rolExamenRepository;
    private final LoteCartillasOmrRepository loteCartillasRepository;
    private final BancoCifradoService cifradoService;
    private final PatronOmrPdfService patronOmrPdfService;
    private final Map<String, JsonNode> resultados = new ConcurrentHashMap<>();

    public JsonNode solicitar(String rolExamenId, MultipartFile archivo) {
        return solicitar(rolExamenId, archivo, "CALIFICACION", null);
    }

    public JsonNode solicitar(String rolExamenId, MultipartFile archivo, String impresora) {
        return solicitar(rolExamenId, archivo, "CALIFICACION", impresora);
    }

    public JsonNode solicitarLecturaConciliacion(String rolExamenId, MultipartFile archivo) {
        return solicitar(rolExamenId, archivo, "LECTURA_CONCILIACION", null);
    }

    public JsonNode solicitarLecturaConciliacion(String rolExamenId, MultipartFile archivo, String impresora) {
        return solicitar(rolExamenId, archivo, "LECTURA_CONCILIACION", impresora);
    }

    private JsonNode solicitar(String rolExamenId, MultipartFile archivo, String modo, String impresora) {
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
            RolExamen rol = rolExamenRepository.findById(rolExamenId)
                    .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + rolExamenId));
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("jobId", jobId);
            payload.put("rolExamenId", rolExamenId);
            payload.put("archivoPath", destino.toString());
            payload.put("modo", modo);
            payload.put("campus", rol.getCampus() == null ? "" : rol.getCampus().trim());
            payload.put("impresora", impresora == null ? "" : impresora.trim());
            JsonNode solicitud = objectMapper.valueToTree(payload);
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

    /**
     * Devuelve el patrón exclusivamente después de cerrar la calificación.
     * Las claves se leen desde el contenido protegido de cada variante para
     * evitar depender de la columna histórica en texto plano.
     */
    @Transactional(readOnly = true)
    public PatronCalificadoResponseDto consultarPatronCalificado(String rolExamenId) {
        RolExamen rol = rolExamenRepository.findById(rolExamenId)
                .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + rolExamenId));
        if (rol.getEstadoFlujo() == null || !"CALIFICADO".equals(rol.getEstadoFlujo().name())) {
            throw new IllegalStateException("El patrón solo puede consultarse después de pasar la evaluación a Calificado.");
        }

        List<PatronCalificadoResponseDto.VariantePatronDto> variantes = varianteRepository.findByRolExamenId(rolExamenId)
                .stream()
                .sorted(Comparator.comparing(ExamenVariante::getLetraVariante))
                .map(variante -> {
                    Map<String, String> respuestas = leerPatron(variante);
                    if (respuestas.isEmpty()) {
                        throw new IllegalStateException("La variante " + variante.getLetraVariante() + " no tiene un patrón protegido disponible.");
                    }
                    PatronCalificadoResponseDto.VariantePatronDto dto = new PatronCalificadoResponseDto.VariantePatronDto();
                    dto.setLetra(variante.getLetraVariante());
                    dto.setTotalPreguntas(variante.getTotalPreguntas() == null ? respuestas.size() : variante.getTotalPreguntas());
                    dto.setRespuestas(respuestas);
                    return dto;
                })
                .toList();

        if (variantes.isEmpty()) {
            throw new IllegalStateException("No existe un patrón persistido para esta evaluación.");
        }

        PatronCalificadoResponseDto respuesta = new PatronCalificadoResponseDto();
        respuesta.setRolExamenId(rolExamenId);
        respuesta.setEstado(rol.getEstadoFlujo().name());
        respuesta.setVariantes(variantes);
        return respuesta;
    }

    /**
     * Genera el patrón en memoria para impresión, reutilizando la misma
     * consulta protegida que alimenta la vista de solo lectura.
     */
    @Transactional
    public byte[] generarPatronCalificadoPdf(String rolExamenId, String usuario) {
        RolExamen rol = rolExamenRepository.findById(rolExamenId)
                .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + rolExamenId));
        try {
            byte[] pdf = patronOmrPdfService.generar(rol, consultarPatronCalificado(rolExamenId));
            auditoriaRepository.save(AuditoriaEvaluacion.builder()
                    .rolExamen(rol)
                    .etapaOrigen("CALIFICADO")
                    .etapaDestino("CALIFICADO")
                    .accion("IMPRESION_PATRON_CALIFICADO")
                    .usuario(usuarioValido(usuario))
                    .detallesJson("{\"variantes\":\"oficiales\"}")
                    .build());
            return pdf;
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo generar el PDF del patrón oficial.", exception);
        }
    }

    @Transactional(readOnly = true)
    public ConfiguracionOmrDto obtenerConfiguracion() {
        return mapearConfiguracion(configuracionGeneral());
    }

    @Transactional
    public ConfiguracionOmrDto guardarConfiguracion(ConfiguracionOmrDto request) {
        request.setAlcance("GENERAL");
        request.setCampusClave(null);
        request.setCampusNombre(null);
        request.setImpresoraClave(null);
        return guardarConfiguracionPorAlcance(request);
    }

    @Transactional(readOnly = true)
    public List<ConfiguracionOmrDto> listarConfiguraciones() {
        return configuracionRepository.findAllByOrderByAlcanceAscCampusNombreAscImpresoraClaveAsc()
                .stream()
                .filter(ConfiguracionOmr::isActivo)
                .map(this::mapearConfiguracion)
                .toList();
    }

    @Transactional
    public ConfiguracionOmrDto guardarConfiguracionPorAlcance(ConfiguracionOmrDto request) {
        String alcance = normalizarAlcance(request.getAlcance());
        String campusClave = clave(request.getCampusClave());
        String campusNombre = texto(request.getCampusNombre());
        String impresoraClave = clave(request.getImpresoraClave());
        campusClave = campusClave.isBlank() ? null : campusClave;
        campusNombre = campusNombre.isBlank() ? null : campusNombre;
        impresoraClave = impresoraClave.isBlank() ? null : impresoraClave;
        validarAlcance(alcance, campusClave, impresoraClave);
        final String campusClaveFiltro = campusClave;
        final String impresoraClaveFiltro = impresoraClave;

        ConfiguracionOmr configuracion = request.getId() == null ? null : configuracionRepository.findById(request.getId())
                .filter(ConfiguracionOmr::isActivo)
                .filter(item -> alcance.equals(item.getAlcance())
                        && igual(item.getCampusClave(), campusClaveFiltro)
                        && igual(item.getImpresoraClave(), impresoraClaveFiltro))
                .orElse(null);
        if (configuracion == null) {
            configuracion = configuracionRepository.findAll().stream()
                .filter(item -> item.isActivo()
                        && alcance.equals(item.getAlcance())
                        && igual(item.getCampusClave(), campusClaveFiltro)
                        && igual(item.getImpresoraClave(), impresoraClaveFiltro))
                .findFirst()
                .orElseGet(() -> {
                    ConfiguracionOmr nueva = configuracionDefecto();
                    nueva.setId(siguienteId());
                    return nueva;
                });
        }

        configuracion.setAlcance(alcance);
        configuracion.setCampusClave(campusClave);
        configuracion.setCampusNombre(campusNombre);
        configuracion.setImpresoraClave(impresoraClave);
        configuracion.setActivo("GENERAL".equals(alcance) || request.getActivo() == null || request.getActivo());
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

    @Transactional
    public void eliminarConfiguracion(Short id) {
        ConfiguracionOmr configuracion = configuracionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Configuración OMR no encontrada."));
        if ("GENERAL".equals(configuracion.getAlcance())) {
            throw new IllegalArgumentException("La configuración general no se puede eliminar; restaure sus valores predeterminados.");
        }
        configuracion.setActivo(false);
        configuracion.setActualizadoEn(LocalDateTime.now());
        configuracion.setActualizadoPor("ADMIN_EVALUACIONES");
        configuracionRepository.save(configuracion);
    }

    private ConfiguracionOmr configuracionGeneral() {
        return configuracionRepository.findAll().stream()
                .filter(item -> item.isActivo() && "GENERAL".equals(item.getAlcance()))
                .findFirst()
                .orElseGet(() -> configuracionRepository.findById((short) 1).orElseGet(this::configuracionDefecto));
    }

    private Short siguienteId() {
        return configuracionRepository.findAll().stream()
                .map(ConfiguracionOmr::getId)
                .filter(java.util.Objects::nonNull)
                .max(Short::compareTo)
                .map(maximo -> (short) (maximo + 1))
                .orElse((short) 1);
    }

    private void validarAlcance(String alcance, String campusClave, String impresoraClave) {
        if ("GENERAL".equals(alcance) && (!texto(campusClave).isBlank() || !texto(impresoraClave).isBlank())) {
            throw new IllegalArgumentException("La configuración general no puede tener campus ni impresora.");
        }
        if ("CAMPUS".equals(alcance) && texto(campusClave).isBlank()) {
            throw new IllegalArgumentException("Debe indicar el campus para una configuración por campus.");
        }
        if ("IMPRESORA".equals(alcance) && texto(impresoraClave).isBlank()) {
            throw new IllegalArgumentException("Debe indicar la impresora para una configuración por impresora.");
        }
    }

    private String normalizarAlcance(String alcance) {
        String valor = texto(alcance).toUpperCase(Locale.ROOT);
        return List.of("GENERAL", "CAMPUS", "IMPRESORA").contains(valor) ? valor : "GENERAL";
    }

    private String clave(String valor) {
        return texto(valor).replaceAll("\\s+", " ").toUpperCase(Locale.ROOT);
    }

    private String texto(String valor) {
        return valor == null ? "" : valor.trim();
    }

    private boolean igual(String primero, String segundo) {
        return clave(primero).equals(clave(segundo));
    }

    private ConfiguracionOmr configuracionDefecto() {
        ConfiguracionOmr configuracion = new ConfiguracionOmr();
        configuracion.setId((short) 1);
        configuracion.setAlcance("GENERAL");
        configuracion.setActivo(true);
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
        dto.setId(configuracion.getId());
        dto.setAlcance(configuracion.getAlcance());
        dto.setCampusClave(configuracion.getCampusClave());
        dto.setCampusNombre(configuracion.getCampusNombre());
        dto.setImpresoraClave(configuracion.getImpresoraClave());
        dto.setActivo(configuracion.isActivo());
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
        BigDecimal nota60 = total == 0
                ? BigDecimal.ZERO
                : BigDecimal.valueOf(aciertos * 60.0 / total).setScale(2, java.math.RoundingMode.HALF_UP);

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
        calificacion.setNotaSobre60(nota60);
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
        dto.setNotaSobre60(calificacion.getNotaSobre60());
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
