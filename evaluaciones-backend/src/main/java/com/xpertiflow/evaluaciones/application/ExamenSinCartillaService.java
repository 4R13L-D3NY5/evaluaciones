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
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
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
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamenSinCartillaService {

    private static final long MAX_ARCHIVO_BYTES = 50L * 1024L * 1024L;
    private static final Set<String> EXTENSIONES_VALIDAS = Set.of(".doc", ".docx");

    private final RolExamenRepository rolRepository;
    private final DocumentoExamenSinCartillaRepository documentoRepository;
    private final NotaDocenteRepository notaRepository;
    private final RolExamenService rolExamenService;
    private final UnitepcGatewayClient unitepcGatewayClient;
    private final AppProperties appProperties;

    @Transactional(readOnly = true)
    public DocumentoSinCartillaResponseDto obtenerDocumento(String rolExamenId) {
        return documentoRepository.findByRolExamenId(rolExamenId)
                .map(this::mapearDocumento)
                .orElseThrow(() -> new RuntimeException("El examen sin cartilla todavía no tiene un documento cargado."));
    }

    @Transactional
    public DocumentoSinCartillaResponseDto cargarDocumento(String rolExamenId, MultipartFile file, String usuario) {
        RolExamen rol = obtenerRolSinCartilla(rolExamenId);
        validarArchivo(file);
        try {
            byte[] contenido = file.getBytes();
            String hash = sha256(contenido);
            String nombreOriginal = Objects.requireNonNullElse(file.getOriginalFilename(), "examen.doc");
            String nombreSeguro = nombreOriginal.replaceAll("[^A-Za-z0-9._-]", "_");
            Path directorio = Path.of(appProperties.getStorage().getBasePath(), "generados", rolExamenId, "sin-cartilla");
            Files.createDirectories(directorio);
            Path archivo = directorio.resolve(UUID.randomUUID() + "_" + nombreSeguro).normalize();
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

            Files.write(archivo, contenido);
            DocumentoExamenSinCartilla documento = new DocumentoExamenSinCartilla();
            documento.setId("DOC-SC-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase(Locale.ROOT));
            documento.setRolExamenId(rolExamenId);
            documento.setNombreArchivo(nombreOriginal);
            documento.setTipoArchivo(Objects.requireNonNullElse(file.getContentType(), "application/msword"));
            documento.setTamanoBytes((long) contenido.length);
            documento.setHashSha256(hash);
            documento.setArchivoPath(archivo.toString());
            documento.setCargadoPor(usuarioValido(usuario));
            documento.setCargadoEn(LocalDateTime.now());
            DocumentoExamenSinCartilla guardado = documentoRepository.save(documento);
            rolExamenService.validarPorDocumentoSinCartilla(rolExamenId, hash, usuario);
            return mapearDocumento(guardado);
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo almacenar el documento del examen sin cartilla.", ex);
        }
    }

    @Transactional(readOnly = true)
    public List<NotaDocenteResponseDto> listarNotas(String rolExamenId) {
        RolExamen rol = obtenerRolSinCartilla(rolExamenId);
        Map<String, NotaDocente> notas = notaRepository.findByRolExamenId(rolExamenId).stream()
                .collect(Collectors.toMap(NotaDocente::getCodigoEstudiante, Function.identity()));
        return obtenerEstudiantesOficiales(rol).stream()
                .map(estudiante -> {
                    NotaDocente nota = notas.get(estudiante.getStudentCode());
                    return NotaDocenteResponseDto.builder()
                            .id(nota == null ? null : nota.getId())
                            .codigoEstudiante(estudiante.getStudentCode())
                            .estudianteNombreCompleto(estudiante.getFullName())
                            .notaSobre30(nota == null ? null : nota.getNotaSobre30())
                            .notaSobre100(nota == null ? null : nota.getNotaSobre100())
                            .guardadoEn(nota == null ? null : nota.getGuardadoEn())
                            .guardadoPor(nota == null ? null : nota.getGuardadoPor())
                            .build();
                })
                .sorted(Comparator.comparing(NotaDocenteResponseDto::getCodigoEstudiante))
                .toList();
    }

    @Transactional
    public List<NotaDocenteResponseDto> guardarNotas(String rolExamenId, GuardarNotasDocenteRequestDto request) {
        RolExamen rol = obtenerRolSinCartilla(rolExamenId);
        if (rol.getEstadoFlujo() != EstadoFlujo.PENDIENTE_NOTAS) {
            throw new IllegalStateException("La carga de notas se habilita únicamente cuando la evaluación está en PENDIENTE_NOTAS.");
        }

        List<StudentItemDto> estudiantes = obtenerEstudiantesOficiales(rol);
        Map<String, StudentItemDto> oficiales = estudiantes.stream()
                .collect(Collectors.toMap(StudentItemDto::getStudentCode, Function.identity()));
        Map<String, NotaDocenteItemDto> recibidas = request.getNotas().stream()
                .collect(Collectors.toMap(item -> item.getCodigoEstudiante().trim(), Function.identity(), (primero, ultimo) -> ultimo));

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

        String usuario = usuarioValido(request.getUsuario());
        for (StudentItemDto estudiante : estudiantes) {
            NotaDocenteItemDto item = recibidas.get(estudiante.getStudentCode());
            BigDecimal nota30 = item.getNotaSobre30().setScale(2, RoundingMode.HALF_UP);
            BigDecimal nota100 = nota30.multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
            NotaDocente nota = notaRepository.findByRolExamenIdAndCodigoEstudiante(rolExamenId, estudiante.getStudentCode())
                    .orElseGet(NotaDocente::new);
            nota.setRolExamenId(rolExamenId);
            nota.setCodigoEstudiante(estudiante.getStudentCode());
            nota.setEstudianteNombreCompleto(estudiante.getFullName());
            nota.setNotaSobre30(nota30);
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
        return listarNotas(rolExamenId);
    }

    public byte[] descargarDocumento(String rolExamenId) {
        DocumentoExamenSinCartilla documento = documentoRepository.findByRolExamenId(rolExamenId)
                .orElseThrow(() -> new RuntimeException("El examen sin cartilla todavía no tiene un documento cargado."));
        try {
            return Files.readAllBytes(Path.of(documento.getArchivoPath()));
        } catch (IOException ex) {
            throw new IllegalStateException("No se pudo leer el documento almacenado.", ex);
        }
    }

    public DocumentoExamenSinCartilla obtenerDocumentoEntidad(String rolExamenId) {
        return documentoRepository.findByRolExamenId(rolExamenId)
                .orElseThrow(() -> new RuntimeException("El examen sin cartilla todavía no tiene un documento cargado."));
    }

    private RolExamen obtenerRolSinCartilla(String rolExamenId) {
        RolExamen rol = rolRepository.findById(rolExamenId)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado: " + rolExamenId));
        if (rol.getModalidad() != ModalidadExamen.PRESENCIAL_SIN_CARTILLA) {
            throw new IllegalStateException("Esta operación solo corresponde a exámenes presenciales sin cartilla.");
        }
        return rol;
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
                .toList();
    }

    private void validarArchivo(MultipartFile file) {
        if (file == null || file.isEmpty()) throw new IllegalArgumentException("Seleccione el examen en formato .doc o .docx.");
        if (file.getSize() > MAX_ARCHIVO_BYTES) throw new IllegalArgumentException("El documento supera el límite máximo de 50 MB.");
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
}
