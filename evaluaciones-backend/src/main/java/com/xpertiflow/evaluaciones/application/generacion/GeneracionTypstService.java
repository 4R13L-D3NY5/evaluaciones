package com.xpertiflow.evaluaciones.application.generacion;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.TransicionEstadoRequestDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionTypstRequestDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionTypstResultadoDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionColaItemDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.GeneracionColaResponseDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.DocumentoExamenDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.ConfiguracionGeneracionResponseDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.MapeoResultadoDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.VarianteResultadoDto;
import com.xpertiflow.evaluaciones.api.dto.generacion.PrevisualizacionTypstRequestDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.GroupItemDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.StudentItemDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.TimeFrameDto;
import com.xpertiflow.evaluaciones.api.dto.ConfiguracionEvaluacionesDto;
import com.xpertiflow.evaluaciones.application.RolExamenService;
import com.xpertiflow.evaluaciones.application.ConfiguracionEvaluacionesService;
import com.xpertiflow.evaluaciones.config.AppProperties;
import com.xpertiflow.evaluaciones.domain.entity.BancoPreguntas;
import com.xpertiflow.evaluaciones.domain.entity.ExamenVariante;
import com.xpertiflow.evaluaciones.domain.entity.GeneracionTypstJob;
import com.xpertiflow.evaluaciones.domain.entity.MapeoEstudianteVariante;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.repository.BancoPreguntasRepository;
import com.xpertiflow.evaluaciones.domain.repository.ExamenVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.GeneracionTypstJobRepository;
import com.xpertiflow.evaluaciones.domain.repository.MapeoEstudianteVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.infrastructure.messaging.RabbitMQConfig;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeneracionTypstService {

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;
    private final BancoPreguntasRepository bancoRepository;
    private final RolExamenRepository rolRepository;
    private final ExamenVarianteRepository varianteRepository;
    private final GeneracionTypstJobRepository generacionTypstJobRepository;
    private final MapeoEstudianteVarianteRepository mapeoRepository;
    private final RolExamenService rolExamenService;
    private final ConfiguracionEvaluacionesService configuracionEvaluacionesService;
    private final AppProperties appProperties;
    private final UnitepcGatewayClient unitepcGatewayClient;

    private final Map<String, GeneracionTypstResultadoDto> estados = new ConcurrentHashMap<>();
    private static final Set<EstadoFlujo> ESTADOS_CON_DOCUMENTO = Set.of(
            EstadoFlujo.GENERADO,
            EstadoFlujo.IMPRESO,
            EstadoFlujo.ENTREGADO,
            EstadoFlujo.DEVUELTO,
            EstadoFlujo.PENDIENTE_NOTAS,
            EstadoFlujo.CALIFICADO
    );

    public GeneracionTypstResultadoDto solicitarGeneracion(GeneracionTypstRequestDto request) {
        RolExamen rol = rolRepository.findById(request.getRolExamenId())
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + request.getRolExamenId()));

        BancoPreguntas banco = bancoRepository.findById(request.getBancoPreguntasId())
                .orElseThrow(() -> new RuntimeException("Banco de preguntas no encontrado: " + request.getBancoPreguntasId()));

        String jobId = request.getJobId();
        if (jobId == null || jobId.isBlank()) {
            jobId = UUID.randomUUID().toString();
        }

        String basePath = appProperties.getStorage().getBasePath();
        String outputBase = request.getOutputBasePath();
        if (outputBase == null || outputBase.isBlank()) {
            outputBase = Path.of(basePath, "generados").toString();
        }
        // Normalizar slash para compatibilidad cross-platform en mensajes JSON
        outputBase = outputBase.replace("/", java.io.File.separator);

        Map<String, Object> mensaje = new HashMap<>();
        mensaje.put("jobId", jobId);
        mensaje.put("rolExamenId", request.getRolExamenId());
        mensaje.put("bancoPreguntasId", request.getBancoPreguntasId());
        mensaje.put("variantes", request.getVariantes());
        Integer ratio = request.getRatioEstudiantesPorVariante();
        if (ratio == null) {
            ratio = configuracionEvaluacionesService.obtener().getRatioEstudiantesPorVariante();
        }
        if (ratio == null) {
            ratio = 5;
        }
        mensaje.put("ratioEstudiantesPorVariante", ratio);
        mensaje.put("configuracionGeneracion", configuracionParaWorker(
                rol.getTipoParcial() == null ? null : rol.getTipoParcial().getValor()));
        mensaje.put("soloVirtual", Boolean.TRUE.equals(request.getSoloVirtual()) || rol.getModalidad() == ModalidadExamen.VIRTUAL);
        mensaje.put("outputBasePath", outputBase);
        mensaje.put("estudiantes", obtenerEstudiantesOficiales(rol, request.getSeaGroupId()));

        GeneracionTypstResultadoDto estadoInicial = new GeneracionTypstResultadoDto();
        estadoInicial.setJobId(jobId);
        estadoInicial.setRolExamenId(request.getRolExamenId());
        estadoInicial.setEstado("PENDIENTE");
        estadoInicial.setMensaje("Generación encolada, esperando el motor de generación");
        estados.put(jobId, estadoInicial);
        guardarEstadoPersistente(estadoInicial);

        try {
            String json = objectMapper.writeValueAsString(mensaje);
            rabbitTemplate.convertAndSend(RabbitMQConfig.QUEUE_GENERACION_TYPST, json);
            log.info("Job {} encolado para generacion Typst del rol {}", jobId, request.getRolExamenId());
        } catch (JsonProcessingException e) {
            estados.remove(jobId, estadoInicial);
            throw new RuntimeException("Error al serializar mensaje RabbitMQ", e);
        } catch (RuntimeException e) {
            estados.remove(jobId, estadoInicial);
            throw e;
        }

        return estadoInicial;
    }

    /**
     * Genera un PDF temporal con los reactivos que están en revisión en el
     * navegador. No crea banco, variantes, mapeos ni cambia el estado del rol.
     */
    public GeneracionTypstResultadoDto solicitarPrevisualizacion(PrevisualizacionTypstRequestDto request) {
        RolExamen rol = rolRepository.findById(request.getRolExamenId())
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + request.getRolExamenId()));

        String jobId = request.getJobId();
        if (jobId == null || jobId.isBlank()) jobId = "PREVIEW-" + UUID.randomUUID();
        String previewDirectory = jobId.replaceAll("[^A-Za-z0-9_-]", "_");

        String outputBase = Path.of(appProperties.getStorage().getBasePath(), "generados", "previsualizaciones", previewDirectory).toString()
                .replace("/", java.io.File.separator);
        Map<String, Object> mensaje = new HashMap<>();
        mensaje.put("jobId", jobId);
        mensaje.put("rolExamenId", request.getRolExamenId());
        mensaje.put("modoPrevisualizacion", true);
        mensaje.put("preguntasPreview", request.getPreguntas());
        mensaje.put("outputBasePath", outputBase);
        mensaje.put("configuracionGeneracion", configuracionParaWorker(
                rol.getTipoParcial() == null ? null : rol.getTipoParcial().getValor()));

        GeneracionTypstResultadoDto estadoInicial = new GeneracionTypstResultadoDto();
        estadoInicial.setJobId(jobId);
        estadoInicial.setRolExamenId(request.getRolExamenId());
        estadoInicial.setEstado("PENDIENTE");
        estadoInicial.setModoPrevisualizacion(true);
        estadoInicial.setMensaje("Previsualización Typst encolada, esperando el motor de generación");
        estadoInicial.setVariantes(List.of());
        estadoInicial.setMapeos(List.of());
        estados.put(jobId, estadoInicial);
        guardarEstadoPersistente(estadoInicial);

        try {
            rabbitTemplate.convertAndSend(RabbitMQConfig.QUEUE_GENERACION_TYPST,
                    objectMapper.writeValueAsString(mensaje));
        } catch (JsonProcessingException | RuntimeException exception) {
            estados.remove(jobId, estadoInicial);
            throw new RuntimeException("No se pudo encolar la previsualización Typst", exception);
        }
        return estadoInicial;
    }

    /**
     * La generación debe usar la nómina oficial del grupo SEA. Los mapeos de
     * variante se crean recién al persistir el resultado y nunca pueden ser
     * la fuente inicial de estudiantes.
     */
    private List<Map<String, String>> obtenerEstudiantesOficiales(RolExamen rol, String groupIdSolicitado) {
        if (rol.getSeaGroupId() == null || rol.getSeaGroupId().isBlank()) {
            throw new RuntimeException("No se puede preparar el examen porque este rol de examen no tiene un grupo oficial asociado");
        }

        // El groupId enviado por el navegador solo sirve como referencia de
        // preparación. Se vuelve a validar contra SEA para evitar que un dato
        // antiguo termine cargando la nómina de otro grupo.
        String groupIdOficial = resolverGrupoOficial(rol);
        if (groupIdOficial == null || groupIdOficial.isBlank()) {
            throw new RuntimeException("No se encontró el grupo oficial en los servicios institucionales; no se puede preparar el examen");
        }
        // Algunos roles importados pueden traer un groupId antiguo o de otra
        // asignatura que usa el mismo código de grupo. Una vez resuelto el
        // grupo correcto por asignatura, grupo y docente, se deja corregido
        // también en el rol para las siguientes operaciones.
        if (groupIdOficial != null && !groupIdOficial.equals(rol.getSeaGroupId())) {
            rol.setSeaGroupId(groupIdOficial);
            rolRepository.save(rol);
        }
        String docenteOficial = rolExamenService.resolverNombreDocenteOficial(rol);
        if (docenteOficial == null || docenteOficial.isBlank()) {
            throw new RuntimeException("No se encontró el docente oficial en los servicios institucionales; no se puede preparar el examen");
        }
        if (!docenteOficial.equalsIgnoreCase(rol.getDocenteNombre())) {
            rol.setDocenteNombre(docenteOficial);
            rolRepository.save(rol);
        }
        List<StudentItemDto> estudiantes = unitepcGatewayClient.getStudentsByGroup(groupIdOficial);
        if (estudiantes == null || estudiantes.isEmpty()) {
            throw new RuntimeException("No se encontraron estudiantes inscritos en la nómina oficial del grupo. Verifique la asignatura, el grupo y el docente");
        }

        List<Map<String, String>> resultado = new ArrayList<>();
        for (StudentItemDto estudiante : estudiantes) {
            if (estudiante.getStudentCode() == null || estudiante.getStudentCode().isBlank()
                    || estudiante.getFullName() == null || estudiante.getFullName().isBlank()) {
            throw new RuntimeException("La nómina oficial contiene un estudiante sin código o nombre completo");
            }
            resultado.add(Map.of(
                    "codigo_estudiante", estudiante.getStudentCode(),
                    "nombres", estudiante.getFullName(),
                    "apellido_paterno", "",
                    "apellido_materno", ""
            ));
        }
        return resultado;
    }

    private Map<String, Object> configuracionParaWorker(String tipoParcial) {
        ConfiguracionEvaluacionesDto configuracion = configuracionEvaluacionesService.obtener();
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("tipoParcial", tipoParcial);
        resultado.put("formatoHoja", configuracion.getFormatoHoja());
        resultado.put("tipoLetra", configuracion.getTipoLetra());
        resultado.put("tamanoLetraPt", configuracion.getTamanoLetraPt());
        resultado.put("espaciadoLeading", configuracion.getEspaciadoLeading());
        resultado.put("estructuraPreguntas", configuracion.getEstructuraPreguntas());
        return resultado;
    }

    /**
     * Resuelve nuevamente el grupo en SEA por asignatura, código de grupo y
     * docente. Esto evita que un rol antiguo con TA-01, por ejemplo, consulte
     * accidentalmente la nómina de otra asignatura que también usa TA-01.
     */
    private String resolverGrupoOficial(RolExamen rol) {
        return rolExamenService.resolverGrupoOficial(rol);
    }

    public GeneracionTypstResultadoDto consultarEstado(String jobId) {
        GeneracionTypstResultadoDto estado = estados.get(jobId);
        if (estado != null) {
            return estado;
        }
        return generacionTypstJobRepository.findById(jobId)
                .map(this::reconstruirResultadoPersistido)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public DocumentoExamenDto consultarDocumentoExamen(String rolExamenId) {
        RolExamen rol = rolRepository.findById(rolExamenId)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + rolExamenId));

        if (rol.getEstadoFlujo() == null || !ESTADOS_CON_DOCUMENTO.contains(rol.getEstadoFlujo())) {
            throw new RuntimeException("El examen solo está disponible después de completar la generación");
        }

        ExamenVariante variante = varianteRepository.findByRolExamenIdAndLetraVariante(rolExamenId, "A")
                .orElseGet(() -> varianteRepository.findByRolExamenId(rolExamenId).stream().findFirst()
                        .orElseThrow(() -> new RuntimeException("No existe un examen generado para el rol de examen")));

        if (variante.getArchivoPdfPath() == null || variante.getArchivoPdfPath().isBlank()) {
            throw new RuntimeException("El examen generado no tiene un PDF disponible");
        }

        Path archivo = Paths.get(variante.getArchivoPdfPath());
        return DocumentoExamenDto.builder()
                .rolExamenId(rolExamenId)
                .variante(variante.getLetraVariante())
                .archivoPdfPath(variante.getArchivoPdfPath())
                .nombreArchivo(archivo.getFileName().toString())
                .build();
    }

    /**
     * Consulta la configuración ya persistida de una generación. Esta vista
     * permite auditar variantes, patrones y asignaciones después de cerrar el
     * diálogo de generación o reiniciar el navegador.
     */
    @Transactional(readOnly = true)
    public ConfiguracionGeneracionResponseDto consultarConfiguracion(String rolExamenId) {
        rolRepository.findById(rolExamenId)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + rolExamenId));

        List<VarianteResultadoDto> variantes = varianteRepository.findByRolExamenId(rolExamenId).stream()
                .sorted(Comparator.comparing(ExamenVariante::getLetraVariante))
                .map(variante -> {
                    VarianteResultadoDto dto = new VarianteResultadoDto();
                    dto.setLetra(variante.getLetraVariante());
                    dto.setSemilla(variante.getSemillaPermutacion());
                    dto.setTotalPreguntas(variante.getTotalPreguntas());
                    dto.setArchivoPdfPath(variante.getArchivoPdfPath());
                    dto.setArchivoTypstPath(variante.getArchivoTypstPath());
                    dto.setArchivoRemarkXlsxPath(variante.getArchivoRemarkXlsxPath());
                    return dto;
                })
                .toList();

        List<MapeoResultadoDto> mapeos = mapeoRepository.findByRolExamenId(rolExamenId).stream()
                .sorted(Comparator.comparing(MapeoEstudianteVariante::getCodigoEstudiante))
                .map(mapeo -> {
                    MapeoResultadoDto dto = new MapeoResultadoDto();
                    dto.setCodigoEstudiante(mapeo.getCodigoEstudiante());
                    dto.setNombres(mapeo.getNombres());
                    dto.setApellidoPaterno(mapeo.getApellidoPaterno());
                    dto.setApellidoMaterno(mapeo.getApellidoMaterno());
                    dto.setLetraVariante(mapeo.getLetraVariante());
                    dto.setHashControl(mapeo.getHashControlSeguridad());
                    dto.setCuadernilloPdfPath(mapeo.getCuadernilloIndividualPdf());
                    return dto;
                })
                .toList();

        ConfiguracionGeneracionResponseDto respuesta = new ConfiguracionGeneracionResponseDto();
        respuesta.setRolExamenId(rolExamenId);
        respuesta.setVariantes(variantes);
        respuesta.setMapeos(mapeos);
        return respuesta;
    }

    /**
     * Expone una vista operativa de las solicitudes que conoce el backend y
     * la cantidad real de mensajes todavía pendientes en RabbitMQ. El detalle
     * de cada mensaje no se extrae consumiendo la cola, para no alterar el
     * procesamiento del worker.
     */
    public GeneracionColaResponseDto listarCola() {
        GeneracionColaResponseDto respuesta = new GeneracionColaResponseDto();
        respuesta.setCola(RabbitMQConfig.QUEUE_GENERACION_TYPST);
        respuesta.setMensajesPendientes(contarMensajesPendientes());
        respuesta.setTareas(estados.values().stream()
                .sorted(Comparator.comparing(GeneracionTypstResultadoDto::getJobId,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(50)
                .map(this::mapearTareaCola)
                .toList());
        return respuesta;
    }

    public void actualizarEstado(GeneracionTypstResultadoDto resultado) {
        estados.put(resultado.getJobId(), resultado);
        guardarEstadoPersistente(resultado);
        log.info("Job {} actualizado a estado {}", resultado.getJobId(), resultado.getEstado());
    }

    /**
     * Guarda el estado fuera de la memoria del proceso. Esto permite que otra
     * instancia del backend, o una instancia reiniciada, responda el polling
     * del navegador. No se copia el contenido cifrado del examen al historial.
     */
    private void guardarEstadoPersistente(GeneracionTypstResultadoDto resultado) {
        if (resultado == null || resultado.getJobId() == null || resultado.getJobId().isBlank()) return;
        try {
            GeneracionTypstJob registro = generacionTypstJobRepository.findById(resultado.getJobId())
                    .orElseGet(GeneracionTypstJob::new);
            registro.setJobId(resultado.getJobId());
            registro.setRolExamenId(resultado.getRolExamenId() == null ? "" : resultado.getRolExamenId());
            registro.setEstado(resultado.getEstado() == null ? "PENDIENTE" : resultado.getEstado());
            registro.setMensaje(resultado.getMensaje());
            registro.setResultadoJson(objectMapper.writeValueAsString(resumenResultado(resultado)));
            if (registro.getSolicitadoEn() == null) registro.setSolicitadoEn(LocalDateTime.now());
            registro.setActualizadoEn(LocalDateTime.now());
            generacionTypstJobRepository.save(registro);
        } catch (Exception exception) {
            // El historial no debe interrumpir la generación ni el ACK de RabbitMQ.
            log.error("No se pudo persistir el estado del job {}", resultado.getJobId(), exception);
        }
    }

    private GeneracionTypstResultadoDto reconstruirResultadoPersistido(GeneracionTypstJob registro) {
        try {
            return objectMapper.readValue(registro.getResultadoJson(), GeneracionTypstResultadoDto.class);
        } catch (Exception exception) {
            GeneracionTypstResultadoDto resultado = new GeneracionTypstResultadoDto();
            resultado.setJobId(registro.getJobId());
            resultado.setRolExamenId(registro.getRolExamenId());
            resultado.setEstado(registro.getEstado());
            resultado.setMensaje(registro.getMensaje());
            resultado.setVariantes(List.of());
            resultado.setMapeos(List.of());
            return resultado;
        }
    }

    private GeneracionTypstResultadoDto resumenResultado(GeneracionTypstResultadoDto original) {
        GeneracionTypstResultadoDto resumen = new GeneracionTypstResultadoDto();
        resumen.setJobId(original.getJobId());
        resumen.setRolExamenId(original.getRolExamenId());
        resumen.setEstado(original.getEstado());
        resumen.setMensaje(original.getMensaje());
        resumen.setModoPrevisualizacion(original.getModoPrevisualizacion());

        List<VarianteResultadoDto> variantes = new ArrayList<>();
        if (original.getVariantes() != null) {
            for (VarianteResultadoDto originalVariante : original.getVariantes()) {
                VarianteResultadoDto variante = new VarianteResultadoDto();
                variante.setLetra(originalVariante.getLetra());
                variante.setSemilla(originalVariante.getSemilla());
                variante.setTotalPreguntas(originalVariante.getTotalPreguntas());
                variante.setArchivoPdfPath(originalVariante.getArchivoPdfPath());
                variante.setArchivoTypstPath(originalVariante.getArchivoTypstPath());
                variante.setArchivoRemarkXlsxPath(originalVariante.getArchivoRemarkXlsxPath());
                variantes.add(variante);
            }
        }
        resumen.setVariantes(variantes);

        List<MapeoResultadoDto> mapeos = new ArrayList<>();
        if (original.getMapeos() != null) {
            for (MapeoResultadoDto originalMapeo : original.getMapeos()) {
                MapeoResultadoDto mapeo = new MapeoResultadoDto();
                mapeo.setCodigoEstudiante(originalMapeo.getCodigoEstudiante());
                mapeo.setNombres(originalMapeo.getNombres());
                mapeo.setApellidoPaterno(originalMapeo.getApellidoPaterno());
                mapeo.setApellidoMaterno(originalMapeo.getApellidoMaterno());
                mapeo.setLetraVariante(originalMapeo.getLetraVariante());
                mapeo.setHashControl(originalMapeo.getHashControl());
                mapeo.setCuadernilloPdfPath(originalMapeo.getCuadernilloPdfPath());
                mapeos.add(mapeo);
            }
        }
        resumen.setMapeos(mapeos);
        return resumen;
    }

    private GeneracionColaItemDto mapearTareaCola(GeneracionTypstResultadoDto estado) {
        GeneracionColaItemDto item = new GeneracionColaItemDto();
        item.setJobId(estado.getJobId());
        item.setRolExamenId(estado.getRolExamenId());
        item.setEstado(estado.getEstado());
        item.setMensaje(estado.getMensaje());
        item.setVariantesSolicitadas(estado.getVariantes() == null ? 0 : estado.getVariantes().size());
        item.setVariantesGeneradas(estado.getVariantes() == null ? 0 : estado.getVariantes().size());
        return item;
    }

    private int contarMensajesPendientes() {
        try {
            Integer cantidad = rabbitTemplate.execute(channel ->
                    channel.queueDeclarePassive(RabbitMQConfig.QUEUE_GENERACION_TYPST).getMessageCount());
            return cantidad == null ? 0 : cantidad;
        } catch (Exception e) {
            log.warn("No se pudo consultar la profundidad de la cola de generación", e);
            return -1;
        }
    }

    @Transactional
    public void persistirResultado(GeneracionTypstResultadoDto resultado) {
        String rolExamenId = resultado.getRolExamenId();
        log.info("Persistiendo resultado de generacion Typst para rol {}", rolExamenId);

        // 1. Borrar mapeos primero (FK a variantes) y luego variantes previas
        mapeoRepository.deleteByRolExamenId(rolExamenId);
        varianteRepository.deleteByRolExamenId(rolExamenId);

        // 2. Insertar nuevas variantes
        List<VarianteResultadoDto> variantesDto = resultado.getVariantes() != null ? resultado.getVariantes() : List.of();
        for (VarianteResultadoDto dto : variantesDto) {
            String letra = dto.getLetra();
            String varianteId = String.format("VAR-%s-%s", rolExamenId, letra);
            ExamenVariante variante = new ExamenVariante();
            variante.setId(varianteId);
            variante.setRolExamenId(rolExamenId);
            variante.setLetraVariante(letra);
            variante.setNombreVariante("TIPO " + letra);
            variante.setSemillaPermutacion(dto.getSemilla() != null ? dto.getSemilla() : 0);
            variante.setTotalPreguntas(dto.getTotalPreguntas() != null ? dto.getTotalPreguntas() : 30);
            variante.setCuotaFaciles(7);
            variante.setCuotaMedias(16);
            variante.setCuotaDificiles(7);
            variante.setPatronClavesJson(null);
            variante.setOrdenReactivosIdsJson(null);
            variante.setContenidoVirtualJson(null);
            variante.setContenidoSeguroCifrado(dto.getContenidoCifrado());
            variante.setContenidoSeguroNonce(dto.getContenidoNonce());
            variante.setContenidoSeguroDekEnvuelta(dto.getContenidoDekEnvuelta());
            variante.setContenidoSeguroKekReferencia(dto.getContenidoKekReferencia());
            variante.setContenidoSeguroKekVersion(dto.getContenidoKekVersion());
            variante.setContenidoSeguroAlgoritmo(dto.getContenidoAlgoritmo());
            variante.setArchivoTypstPath(dto.getArchivoTypstPath());
            variante.setArchivoPdfPath(dto.getArchivoPdfPath());
            variante.setArchivoRemarkXlsxPath(dto.getArchivoRemarkXlsxPath());
            varianteRepository.save(variante);
        }

        // 3. Insertar nuevos mapeos estudiante-variante
        List<MapeoResultadoDto> mapeosDto = resultado.getMapeos() != null ? resultado.getMapeos() : List.of();
        for (MapeoResultadoDto dto : mapeosDto) {
            if (dto.getCodigoEstudiante() == null || dto.getCodigoEstudiante().isBlank()
                    || dto.getNombres() == null || dto.getNombres().isBlank()) {
                throw new IllegalStateException(
                        "El resultado de generación contiene un estudiante sin código o nombre oficial");
            }
            String letra = dto.getLetraVariante();
            String varianteId = String.format("VAR-%s-%s", rolExamenId, letra);
            MapeoEstudianteVariante mapeo = new MapeoEstudianteVariante();
            mapeo.setRolExamenId(rolExamenId);
            mapeo.setVarianteId(varianteId);
            mapeo.setCodigoEstudiante(dto.getCodigoEstudiante());
            mapeo.setNombres(dto.getNombres().trim());
            // El Gateway entrega el nombre completo oficial; no inventar apellidos
            // cuando la fuente no los separa en campos independientes.
            mapeo.setApellidoPaterno(valorODefault(dto.getApellidoPaterno(), ""));
            mapeo.setApellidoMaterno(valorODefault(dto.getApellidoMaterno(), ""));
            mapeo.setLetraVariante(letra);
            mapeo.setHashControlSeguridad(dto.getHashControl());
            mapeo.setCuadernilloIndividualPdf(dto.getCuadernilloPdfPath());
            mapeo.setEstadoAsistencia("PRESENTE");
            mapeoRepository.save(mapeo);
        }

        // 4. Actualizar contadores del rol
        RolExamen rol = rolRepository.findById(rolExamenId)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + rolExamenId));
        rol.setVariantesGeneradasCount(variantesDto.size());
        rol.setEstudiantesInscritosCount(mapeosDto.size());
        rolRepository.save(rol);

        // 5. Transicionar a GENERADO usando la maquina de estados existente
        if (rol.getEstadoFlujo() == EstadoFlujo.VALIDADO) {
            if (rol.getModalidad() == ModalidadExamen.VIRTUAL) {
                log.info("Rol virtual {} preparado: se conservan variantes y asignaciones en VALIDADO, sin PDF", rolExamenId);
                return;
            }
            TransicionEstadoRequestDto transicion = TransicionEstadoRequestDto.builder()
                    .nuevoEstado(EstadoFlujo.GENERADO)
                    .usuario("Sistema")
                    .ipOrigen("127.0.0.1")
                    .build();
            rolExamenService.transicionarEstado(rolExamenId, transicion);
            log.info("Rol {} transicionado a GENERADO", rolExamenId);
        } else {
            log.warn("Rol {} no se transiciono a GENERADO porque su estado actual es {}", rolExamenId, rol.getEstadoFlujo());
        }
    }

    private String valorODefault(String valor, String defaultValue) {
        return valor != null && !valor.isBlank() ? valor : defaultValue;
    }
}
