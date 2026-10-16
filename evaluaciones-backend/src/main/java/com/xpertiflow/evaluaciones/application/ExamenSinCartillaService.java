package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.TransicionEstadoRequestDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.StudentItemDto;
import com.xpertiflow.evaluaciones.api.dto.sincartilla.DocumentoSinCartillaResponseDto;
import com.xpertiflow.evaluaciones.api.dto.sincartilla.GuardarNotasDocenteRequestDto;
import com.xpertiflow.evaluaciones.api.dto.sincartilla.NotaDocenteItemDto;
import com.xpertiflow.evaluaciones.api.dto.sincartilla.NotaDocenteResponseDto;
import com.xpertiflow.evaluaciones.config.AppProperties;
import com.xpertiflow.evaluaciones.domain.entity.DocumentoExamenSinCartilla;
import com.xpertiflow.evaluaciones.domain.entity.NotaDocente;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.repository.DocumentoExamenSinCartillaRepository;
import com.xpertiflow.evaluaciones.domain.repository.NotaDocenteRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import com.xpertiflow.evaluaciones.security.BancoCifradoService;
import com.xpertiflow.evaluaciones.security.BancoEncryptedPayload;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.ReprogramacionOmrRequestDto;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Base64;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExamenSinCartillaService {

    private static final long MAX_ARCHIVO_BYTES = 5L * 1024L * 1024L;
    private static final Set<String> EXTENSIONES_VALIDAS = Set.of(".doc", ".docx");

    private final RolExamenRepository rolRepository;
    private final DocumentoExamenSinCartillaRepository documentoRepository;
    private final NotaDocenteRepository notaRepository;
    private final RolExamenService rolExamenService;
    private final UnitepcGatewayClient unitepcGatewayClient;
    private final AppProperties appProperties;
    private final BancoCifradoService cifradoService;
    private final ReporteNotasSinCartillaPdfService reporteNotasPdfService;
    private final AuditoriaEvaluacionRepository auditoriaRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public DocumentoSinCartillaResponseDto obtenerDocumento(String rolExamenId, Authentication authentication) {
        obtenerRolSinCartilla(rolExamenId, authentication);
        return documentoRepository.findByRolExamenId(rolExamenId)
                .map(this::mapearDocumento)
                .orElseThrow(() -> new RuntimeException("El examen sin cartilla todavía no tiene un documento cargado."));
    }

    @Transactional
    public DocumentoSinCartillaResponseDto cargarDocumento(String rolExamenId, MultipartFile file, Authentication authentication) {
        RolExamen rol = obtenerRolSinCartilla(rolExamenId, authentication);
        validarEstadoCarga(rol);
        String usuario = usuarioAutenticado(authentication);
        validarArchivo(file);
        Path archivo = null;
        try {
            byte[] contenido = file.getBytes();
            String hash = sha256(contenido);
            String nombreOriginal = Objects.requireNonNullElse(file.getOriginalFilename(), "examen.doc");
            String documentoId = "DOC-SC-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase(Locale.ROOT);
            String contexto = contextoCifrado(documentoId, rolExamenId);
            BancoEncryptedPayload payload = cifradoService.cifrarBytes(contenido, contexto);
            Path directorio = Path.of(appProperties.getStorage().getBasePath(), "generados", rolExamenId, "sin-cartilla");
            Files.createDirectories(directorio);
            archivo = directorio.resolve(documentoId + ".enc").normalize();
            if (!archivo.startsWith(directorio.normalize())) {
                throw new IllegalStateException("Nombre de archivo no permitido.");
            }

            documentoRepository.findByRolExamenId(rolExamenId).ifPresent(anterior -> {
                try {
                    Files.deleteIfExists(Path.of(anterior.getArchivoPath()));
                } catch (IOException ignored) {
                    // El registro nuevo sigue siendo válido aunque el archivo anterior ya no exista.
                }
                documentoRepository.delete(anterior);
            });

            Files.write(archivo, Base64.getDecoder().decode(payload.getCiphertext()));
            DocumentoExamenSinCartilla documento = new DocumentoExamenSinCartilla();
            documento.setId(documentoId);
            documento.setRolExamenId(rolExamenId);
            documento.setNombreArchivo(nombreOriginal);
            documento.setTipoArchivo(Objects.requireNonNullElse(file.getContentType(), "application/msword"));
            documento.setTamanoBytes((long) contenido.length);
            documento.setHashSha256(hash);
            documento.setArchivoPath(archivo.toString());
            documento.setDekEnvuelta(payload.getWrappedDataKey());
            documento.setNonce(payload.getNonce());
            documento.setKekReferencia(payload.getKeyReference());
            documento.setKekVersion(payload.getKeyVersion());
            documento.setAlgoritmoCifrado(payload.getAlgorithm());
            documento.setArchivoCifrado(true);
            documento.setCargadoPor(usuarioValido(usuario));
            documento.setCargadoEn(LocalDateTime.now());
            DocumentoExamenSinCartilla guardado = documentoRepository.save(documento);
            rolExamenService.validarPorDocumentoSinCartilla(rolExamenId, hash, usuario);
            return mapearDocumento(guardado);
        } catch (IOException ex) {
            eliminarArchivoSilenciosamente(archivo);
            throw new IllegalStateException("No se pudo almacenar el documento del examen sin cartilla.", ex);
        } catch (RuntimeException ex) {
            eliminarArchivoSilenciosamente(archivo);
            throw ex;
        }
    }

    @Transactional(readOnly = true)
    public List<NotaDocenteResponseDto> listarNotas(String rolExamenId, Authentication authentication) {
        RolExamen rol = obtenerRolSinCartilla(rolExamenId, authentication);
        Map<String, NotaDocente> notas = notaRepository.findByRolExamenId(rolExamenId).stream()
                .collect(Collectors.toMap(NotaDocente::getCodigoEstudiante, Function.identity()));
        Map<String, NotaDocenteResponseDto> mapa = new LinkedHashMap<>();
        for (StudentItemDto estudiante : obtenerEstudiantesOficiales(rol)) {
            NotaDocente nota = notas.get(estudiante.getStudentCode());
            mapa.put(estudiante.getStudentCode(), mapearNotaResponse(estudiante.getStudentCode(), estudiante.getFullName(), nota));
        }
        for (NotaDocente nd : notas.values()) {
            if (!mapa.containsKey(nd.getCodigoEstudiante())) {
                mapa.put(nd.getCodigoEstudiante(), mapearNotaResponse(nd.getCodigoEstudiante(), nd.getEstudianteNombreCompleto(), nd));
            }
        }
        return mapa.values().stream()
                .sorted(Comparator.comparing(
                        NotaDocenteResponseDto::getCodigoEstudiante,
                        OrdenEstudiantes.comparadorCodigo()))
                .toList();
    }

    private NotaDocenteResponseDto mapearNotaResponse(String codigo, String nombreCompleto, NotaDocente nota) {
        return NotaDocenteResponseDto.builder()
                .id(nota == null ? null : nota.getId())
                .codigoEstudiante(codigo)
                .estudianteNombreCompleto(nombreCompleto)
                .notaSobre60(nota == null ? null : nota.getNotaSobre60())
                .notaSobre100(nota == null ? null : nota.getNotaSobre100())
                .guardadoEn(nota == null ? null : nota.getGuardadoEn())
                .guardadoPor(nota == null ? null : nota.getGuardadoPor())
                .sincronizadoSea(nota != null && Boolean.TRUE.equals(nota.getSincronizadoSea()))
                .fechaSincronizacionSea(nota == null ? null : nota.getFechaSincronizacionSea())
                .sincronizadoSeaPor(nota == null ? null : nota.getSincronizadoSeaPor())
                .esReprogramado(nota != null && Boolean.TRUE.equals(nota.getEsReprogramado()))
                .fechaExamenReprogramado(nota == null ? null : nota.getFechaExamenReprogramado())
                .motivoReprogramacion(nota == null ? null : nota.getMotivoReprogramacion())
                .comprobanteReprogramacion(nota == null ? null : nota.getComprobanteReprogramacion())
                .observacionReprogramacion(nota == null ? null : nota.getObservacionReprogramacion())
                .reprogramadoPor(nota == null ? null : nota.getReprogramadoPor())
                .fechaReprogramacion(nota == null ? null : nota.getFechaReprogramacion())
                .notaOriginal60(nota == null ? null : nota.getNotaOriginal60())
                .notaOriginal100(nota == null ? null : nota.getNotaOriginal100())
                .build();
    }

    @Transactional
    public List<NotaDocenteResponseDto> guardarNotas(String rolExamenId,
                                                     GuardarNotasDocenteRequestDto request,
                                                     Authentication authentication) {
        RolExamen rol = obtenerRolSinCartilla(rolExamenId, authentication);
        Set<EstadoFlujo> estadosPermitidos = Set.of(
                EstadoFlujo.IMPRESO,
                EstadoFlujo.ENTREGADO,
                EstadoFlujo.DEVUELTO,
                EstadoFlujo.PENDIENTE_NOTAS
        );
        if (!estadosPermitidos.contains(rol.getEstadoFlujo())) {
            throw new IllegalStateException("La carga de notas se habilita a partir del estado IMPRESO (actual: " + rol.getEstadoFlujo() + ").");
        }

        List<StudentItemDto> estudiantes = obtenerEstudiantesOficiales(rol);
        Map<String, StudentItemDto> oficiales = estudiantes.stream()
                .collect(Collectors.toMap(StudentItemDto::getStudentCode, Function.identity()));
        Map<String, Long> frecuencias = request.getNotas().stream()
                .collect(Collectors.groupingBy(item -> item.getCodigoEstudiante().trim(), Collectors.counting()));
        Set<String> duplicados = frecuencias.entrySet().stream()
                .filter(entry -> entry.getValue() > 1)
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());
        if (!duplicados.isEmpty()) {
            throw new IllegalArgumentException("No se puede registrar más de una nota para el mismo estudiante: "
                    + String.join(", ", duplicados));
        }
        Map<String, NotaDocenteItemDto> recibidas = request.getNotas().stream()
                .collect(Collectors.toMap(item -> item.getCodigoEstudiante().trim(), Function.identity()));

        Set<String> faltantes = oficiales.keySet().stream()
                .filter(codigo -> !recibidas.containsKey(codigo))
                .collect(Collectors.toSet());
        if (!faltantes.isEmpty()) {
            throw new IllegalArgumentException("Debe registrar una nota para todos los estudiantes oficiales. Faltan: " + String.join(", ", faltantes));
        }
        Set<String> desconocidos = recibidas.keySet().stream()
                .filter(codigo -> !oficiales.containsKey(codigo))
                .collect(Collectors.toSet());
        if (!desconocidos.isEmpty()) {
            throw new IllegalArgumentException("Se recibieron códigos que no pertenecen a la nómina oficial: " + String.join(", ", desconocidos));
        }

        String usuario = usuarioAutenticado(authentication);
        for (StudentItemDto estudiante : estudiantes) {
            NotaDocenteItemDto item = recibidas.get(estudiante.getStudentCode());
            BigDecimal nota60 = item.getNotaSobre60().setScale(2, RoundingMode.HALF_UP);
            BigDecimal nota100 = nota60.multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
            NotaDocente nota = notaRepository.findByRolExamenIdAndCodigoEstudiante(rolExamenId, estudiante.getStudentCode())
                    .orElseGet(NotaDocente::new);
            nota.setRolExamenId(rolExamenId);
            nota.setCodigoEstudiante(estudiante.getStudentCode());
            nota.setEstudianteNombreCompleto(estudiante.getFullName());
            nota.setNotaSobre60(nota60);
            nota.setNotaSobre100(nota100);
            nota.setGuardadoPor(usuario);
            nota.setGuardadoEn(LocalDateTime.now());
            notaRepository.save(nota);
        }

        rolExamenService.transicionarEstado(rolExamenId, TransicionEstadoRequestDto.builder()
                .nuevoEstado(EstadoFlujo.CALIFICADO)
                .motivo("Carga completa de notas por docente")
                .usuario(usuario)
                .ipOrigen("127.0.0.1")
                .build());
        return listarNotas(rolExamenId, authentication);
    }

    @Transactional
    public NotaDocenteResponseDto registrarReprogramacion(String rolExamenId,
                                                          String codigoEstudiante,
                                                          ReprogramacionOmrRequestDto request,
                                                          Authentication authentication,
                                                          String ipOrigen) {
        RolExamen rol = obtenerRolSinCartilla(rolExamenId, authentication);

        if (rol.getEstadoFlujo() == null || !Set.of("PENDIENTE_NOTAS", "CALIFICADO", "CONFIRMADO", "DEVUELTO").contains(rol.getEstadoFlujo().name())) {
            throw new IllegalStateException("Solo se puede registrar reprogramación para exámenes en calificación o confirmación (estado actual: " + rol.getEstadoFlujo() + ").");
        }

        if (codigoEstudiante == null || codigoEstudiante.isBlank()) {
            throw new IllegalArgumentException("El código del estudiante es obligatorio.");
        }
        String codigo = codigoEstudiante.trim();

        if (request.getFechaExamenReprogramado() == null) {
            throw new IllegalArgumentException("La fecha del examen reprogramado es obligatoria.");
        }
        if (request.getMotivo() == null || request.getMotivo().trim().length() < 5) {
            throw new IllegalArgumentException("El motivo o justificación de la reprogramación es obligatorio (mínimo 5 caracteres).");
        }

        BigDecimal nota100 = request.getNotaSobre100();
        BigDecimal nota60 = request.getNotaSobre60();

        if (nota100 == null && nota60 == null) {
            throw new IllegalArgumentException("Debe proporcionar al menos una nota (sobre 100 o sobre 60).");
        }

        if (nota100 != null) {
            if (nota100.compareTo(BigDecimal.ZERO) < 0 || nota100.compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new IllegalArgumentException("La nota sobre 100 debe estar entre 0 y 100.");
            }
            if (nota60 == null) {
                nota60 = nota100.multiply(BigDecimal.valueOf(60)).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            }
        } else {
            if (nota60.compareTo(BigDecimal.ZERO) < 0 || nota60.compareTo(BigDecimal.valueOf(60)) > 0) {
                throw new IllegalArgumentException("La nota sobre 60 debe estar entre 0 y 60.");
            }
            nota100 = nota60.multiply(BigDecimal.valueOf(100)).divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);
        }

        List<StudentItemDto> estudiantes = obtenerEstudiantesOficiales(rol);
        StudentItemDto estudianteOficial = estudiantes.stream()
                .filter(e -> codigo.equalsIgnoreCase(e.getStudentCode().trim()))
                .findFirst()
                .orElse(null);

        String nombreEstudiante = estudianteOficial != null ? estudianteOficial.getFullName() : null;

        NotaDocente nota = notaRepository.findByRolExamenIdAndCodigoEstudiante(rolExamenId, codigo)
                .orElseGet(() -> {
                    NotaDocente nueva = new NotaDocente();
                    nueva.setRolExamenId(rolExamenId);
                    nueva.setCodigoEstudiante(codigo);
                    return nueva;
                });

        if (nombreEstudiante != null) {
            nota.setEstudianteNombreCompleto(nombreEstudiante);
        } else if (nota.getEstudianteNombreCompleto() == null || nota.getEstudianteNombreCompleto().isBlank()) {
            throw new IllegalArgumentException("El estudiante con código " + codigo + " no pertenece a la nómina oficial de esta evaluación.");
        }

        if (!Boolean.TRUE.equals(nota.getEsReprogramado())) {
            nota.setNotaOriginal60(nota.getNotaSobre60());
            nota.setNotaOriginal100(nota.getNotaSobre100());
        }

        String usuario = usuarioAutenticado(authentication);
        nota.setNotaSobre60(nota60.setScale(2, RoundingMode.HALF_UP));
        nota.setNotaSobre100(nota100.setScale(2, RoundingMode.HALF_UP));
        nota.setEsReprogramado(true);
        nota.setFechaExamenReprogramado(request.getFechaExamenReprogramado());
        nota.setMotivoReprogramacion(request.getMotivo().trim());
        nota.setComprobanteReprogramacion(request.getComprobantePago() == null || request.getComprobantePago().isBlank() ? null : request.getComprobantePago().trim());
        nota.setObservacionReprogramacion(request.getObservaciones() == null || request.getObservaciones().isBlank() ? null : request.getObservaciones().trim());
        nota.setReprogramadoPor(usuario);
        nota.setFechaReprogramacion(LocalDateTime.now());
        if (nota.getGuardadoPor() == null) {
            nota.setGuardadoPor(usuario);
            nota.setGuardadoEn(LocalDateTime.now());
        }

        nota.setSincronizadoSea(false);
        nota.setFechaSincronizacionSea(null);
        nota.setSincronizadoSeaPor(null);

        NotaDocente guardada = notaRepository.save(nota);

        try {
            Map<String, Object> auditoriaData = new LinkedHashMap<>();
            auditoriaData.put("accion", "REPROGRAMACION_EXAMEN_SIN_CARTILLA");
            auditoriaData.put("rolExamenId", rolExamenId);
            auditoriaData.put("codigoEstudiante", codigo);
            auditoriaData.put("notaSobre60", nota60);
            auditoriaData.put("notaSobre100", nota100);
            auditoriaData.put("fechaExamenReprogramado", request.getFechaExamenReprogramado().toString());
            auditoriaData.put("comprobantePago", request.getComprobantePago());
            auditoriaData.put("motivo", request.getMotivo());
            auditoriaData.put("observaciones", request.getObservaciones());
            auditoriaData.put("usuario", usuario);
            auditoriaData.put("fechaRegistro", LocalDateTime.now().toString());

            auditoriaRepository.save(AuditoriaEvaluacion.builder()
                    .rolExamen(rol)
                    .etapaOrigen(rol.getEstadoFlujo().getValor())
                    .etapaDestino(rol.getEstadoFlujo().getValor())
                    .accion("REPROGRAMACION_EXAMEN_SIN_CARTILLA")
                    .usuario(usuario)
                    .ipOrigen(ipOrigen == null || ipOrigen.isBlank() ? "127.0.0.1" : ipOrigen)
                    .detallesJson(objectMapper.writeValueAsString(auditoriaData))
                    .build());
        } catch (IOException e) {
            log.error("Error al registrar auditoría de reprogramación sin cartilla", e);
        }

        return mapearNotaResponse(guardada.getCodigoEstudiante(), guardada.getEstudianteNombreCompleto(), guardada);
    }

    @Transactional
    public NotaDocenteResponseDto revertirReprogramacion(String rolExamenId,
                                                         String codigoEstudiante,
                                                         Authentication authentication,
                                                         String ipOrigen) {
        RolExamen rol = obtenerRolSinCartilla(rolExamenId, authentication);

        if (codigoEstudiante == null || codigoEstudiante.isBlank()) {
            throw new IllegalArgumentException("El código del estudiante es obligatorio.");
        }
        String codigo = codigoEstudiante.trim();

        NotaDocente nota = notaRepository.findByRolExamenIdAndCodigoEstudiante(rolExamenId, codigo)
                .orElseThrow(() -> new IllegalArgumentException("No se encontró la calificación para el estudiante " + codigo));

        if (!Boolean.TRUE.equals(nota.getEsReprogramado())) {
            throw new IllegalStateException("El estudiante no tiene una calificación por reprogramación.");
        }

        nota.setEsReprogramado(false);
        nota.setFechaExamenReprogramado(null);
        nota.setMotivoReprogramacion(null);
        nota.setComprobanteReprogramacion(null);
        nota.setObservacionReprogramacion(null);
        nota.setReprogramadoPor(null);
        nota.setFechaReprogramacion(null);

        if (nota.getNotaOriginal60() != null) {
            nota.setNotaSobre60(nota.getNotaOriginal60());
            nota.setNotaSobre100(nota.getNotaOriginal100());
        } else {
            nota.setNotaSobre60(BigDecimal.ZERO);
            nota.setNotaSobre100(BigDecimal.ZERO);
        }

        nota.setSincronizadoSea(false);
        nota.setFechaSincronizacionSea(null);
        nota.setSincronizadoSeaPor(null);

        NotaDocente guardada = notaRepository.save(nota);

        String usuario = usuarioAutenticado(authentication);
        try {
            Map<String, Object> auditoriaData = new LinkedHashMap<>();
            auditoriaData.put("accion", "REVERSION_REPROGRAMACION_SIN_CARTILLA");
            auditoriaData.put("rolExamenId", rolExamenId);
            auditoriaData.put("codigoEstudiante", codigo);
            auditoriaData.put("notaSobre60Restaurada", guardada.getNotaSobre60());
            auditoriaData.put("notaSobre100Restaurada", guardada.getNotaSobre100());
            auditoriaData.put("revertidoPor", usuario);
            auditoriaData.put("fechaRegistro", LocalDateTime.now().toString());

            auditoriaRepository.save(AuditoriaEvaluacion.builder()
                    .rolExamen(rol)
                    .etapaOrigen(rol.getEstadoFlujo().getValor())
                    .etapaDestino(rol.getEstadoFlujo().getValor())
                    .accion("REVERSION_REPROGRAMACION_SIN_CARTILLA")
                    .usuario(usuario)
                    .ipOrigen(ipOrigen == null || ipOrigen.isBlank() ? "127.0.0.1" : ipOrigen)
                    .detallesJson(objectMapper.writeValueAsString(auditoriaData))
                    .build());
        } catch (IOException e) {
            log.error("Error al registrar auditoría de reversión de reprogramación sin cartilla", e);
        }

        return mapearNotaResponse(guardada.getCodigoEstudiante(), guardada.getEstudianteNombreCompleto(), guardada);
    }

    @Transactional(readOnly = true)
    public byte[] generarReporteNotasPdf(String rolExamenId, Authentication authentication) {
        RolExamen rol = obtenerRolSinCartilla(rolExamenId, authentication);
        List<NotaDocenteResponseDto> notas = listarNotas(rolExamenId, authentication);
        try {
            return reporteNotasPdfService.generar(rol, notas);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo generar la planilla PDF oficial de notas: " + e.getMessage(), e);
        }
    }

    public byte[] descargarDocumento(String rolExamenId, Authentication authentication) {
        obtenerRolSinCartilla(rolExamenId, authentication);
        DocumentoExamenSinCartilla documento = documentoRepository.findByRolExamenId(rolExamenId)
                .orElseThrow(() -> new RuntimeException("El examen sin cartilla todavía no tiene un documento cargado."));
        if (!documento.isArchivoCifrado()
                || documento.getDekEnvuelta() == null
                || documento.getNonce() == null
                || documento.getKekReferencia() == null
                || documento.getAlgoritmoCifrado() == null) {
            throw new IllegalStateException("El documento histórico aún no está protegido. Ejecute la migración de cifrado antes de descargarlo.");
        }
        try {
            byte[] ciphertext = Files.readAllBytes(Path.of(documento.getArchivoPath()));
            BancoEncryptedPayload payload = BancoEncryptedPayload.builder()
                    .ciphertext(Base64.getEncoder().encodeToString(ciphertext))
                    .nonce(documento.getNonce())
                    .wrappedDataKey(documento.getDekEnvuelta())
                    .keyReference(documento.getKekReferencia())
                    .keyVersion(documento.getKekVersion())
                    .algorithm(documento.getAlgoritmoCifrado())
                    .build();
            byte[] contenido = cifradoService.descifrarBytes(payload, contextoCifrado(documento.getId(), rolExamenId));
            if (!MessageDigest.isEqual(
                    HexFormat.of().parseHex(documento.getHashSha256()),
                    HexFormat.of().parseHex(sha256(contenido)))) {
                throw new IllegalStateException("La integridad del documento no pudo verificarse después del descifrado.");
            }
            return contenido;
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo leer el documento almacenado.", ex);
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException("La huella de integridad del documento no tiene un formato válido.", ex);
        }
    }

    public DocumentoExamenSinCartilla obtenerDocumentoEntidad(String rolExamenId, Authentication authentication) {
        obtenerRolSinCartilla(rolExamenId, authentication);
        return documentoRepository.findByRolExamenId(rolExamenId)
                .orElseThrow(() -> new RuntimeException("El examen sin cartilla todavía no tiene un documento cargado."));
    }

    @Transactional
    public void eliminarDocumento(String rolExamenId, Authentication authentication) {
        RolExamen rol = obtenerRolSinCartilla(rolExamenId, authentication);
        validarEstadoCarga(rol);
        DocumentoExamenSinCartilla documento = documentoRepository.findByRolExamenId(rolExamenId)
                .orElseThrow(() -> new RuntimeException("El examen sin cartilla todavía no tiene un documento cargado."));

        Path archivo = Path.of(documento.getArchivoPath());
        documentoRepository.delete(documento);
        rolExamenService.revertirPorEliminacionDocumentoSinCartilla(
                rolExamenId, usuarioAutenticado(authentication));
        eliminarArchivoSilenciosamente(archivo);
    }

    private RolExamen obtenerRolSinCartilla(String rolExamenId, Authentication authentication) {
        RolExamen rol = rolRepository.findById(rolExamenId)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + rolExamenId));
        if (rol.getModalidad() != ModalidadExamen.PRESENCIAL_SIN_CARTILLA) {
            throw new IllegalStateException("Esta operación solo corresponde a exámenes presenciales sin cartilla.");
        }
        return rol;
    }

    private void validarEstadoCarga(RolExamen rol) {
        if (rol.getEstadoFlujo() != EstadoFlujo.PROGRAMADO
                && rol.getEstadoFlujo() != EstadoFlujo.VALIDADO) {
            throw new IllegalStateException(
                    "El examen sin cartilla solo se puede cargar, reemplazar o eliminar antes de GENERADO; estado actual: "
                            + rol.getEstadoFlujo().getValor());
        }
    }

    private String usuarioAutenticado(Authentication authentication) {
        return authentication == null ? "SISTEMA" : usuarioValido(authentication.getName());
    }

    private List<StudentItemDto> obtenerEstudiantesOficiales(RolExamen rol) {
        String grupoOficial = rolExamenService.resolverGrupoOficial(rol);
        if (grupoOficial == null || grupoOficial.isBlank()) grupoOficial = rol.getSeaGroupId();
        if (grupoOficial == null || grupoOficial.isBlank()) {
            throw new IllegalStateException("No se encontró el grupo oficial en los servicios institucionales.");
        }
        List<StudentItemDto> estudiantes = unitepcGatewayClient.getStudentsByGroup(grupoOficial);
        if (estudiantes == null || estudiantes.isEmpty()) {
            throw new IllegalStateException("La nómina oficial del grupo no tiene estudiantes inscritos.");
        }
        return estudiantes.stream()
                .filter(estudiante -> estudiante.getStudentCode() != null && !estudiante.getStudentCode().isBlank())
                .filter(estudiante -> estudiante.getFullName() != null && !estudiante.getFullName().isBlank())
                .map(estudiante -> {
                    estudiante.setStudentCode(estudiante.getStudentCode().trim());
                    estudiante.setFullName(estudiante.getFullName().trim());
                    return estudiante;
                })
                .sorted(Comparator.comparing(
                        StudentItemDto::getStudentCode,
                        OrdenEstudiantes.comparadorCodigo()))
                .toList();
    }

    private void validarArchivo(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Seleccione el examen en formato .doc o .docx.");
        if (file.getSize() > MAX_ARCHIVO_BYTES) throw new IllegalArgumentException("El documento supera el límite máximo de 5 MB para exámenes sin cartilla.");
        String nombre = Objects.requireNonNullElse(file.getOriginalFilename(), "").toLowerCase(Locale.ROOT);
        if (EXTENSIONES_VALIDAS.stream().noneMatch(nombre::endsWith)) {
            throw new IllegalArgumentException("Solo se aceptan documentos .doc o .docx para exámenes sin cartilla.");
        }
    }

    private DocumentoSinCartillaResponseDto mapearDocumento(DocumentoExamenSinCartilla documento) {
        return DocumentoSinCartillaResponseDto.builder()
                .id(documento.getId()).rolExamenId(documento.getRolExamenId()).nombreArchivo(documento.getNombreArchivo())
                .tipoArchivo(documento.getTipoArchivo()).tamanoBytes(documento.getTamanoBytes()).hashSha256(documento.getHashSha256())
                .cargadoPor(documento.getCargadoPor()).cargadoEn(documento.getCargadoEn()).build();
    }

    private String sha256(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (Exception ex) {
            throw new IllegalStateException("No se pudo calcular la integridad del archivo.", ex);
        }
    }

    private String usuarioValido(String usuario) {
        return usuario == null || usuario.isBlank() ? "SISTEMA" : usuario.trim();
    }

    private String contextoCifrado(String documentoId, String rolExamenId) {
        return "documento-sin-cartilla:" + documentoId + ":rol:" + rolExamenId;
    }

    private void eliminarArchivoSilenciosamente(Path archivo) {
        if (archivo == null) return;
        try {
            Files.deleteIfExists(archivo);
        } catch (IOException ignored) {
            // El error original contiene la causa operativa; no se registra contenido sensible.
        }
    }
}
