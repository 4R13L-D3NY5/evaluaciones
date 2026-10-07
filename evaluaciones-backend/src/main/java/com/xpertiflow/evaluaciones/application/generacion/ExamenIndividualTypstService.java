package com.xpertiflow.evaluaciones.application.generacion;

import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import com.xpertiflow.evaluaciones.domain.entity.ExamenVariante;
import com.xpertiflow.evaluaciones.domain.entity.MapeoEstudianteVariante;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.ExamenVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.MapeoEstudianteVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.config.AppProperties;
import com.xpertiflow.evaluaciones.security.BancoCifradoService;
import com.xpertiflow.evaluaciones.security.BancoEncryptedPayload;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Servicio encargado de generar exámenes individuales (cuadernillos Typst/PDF)
 * para estudiantes que se incorporan por toma de grupos tardía o rezagados,
 * asegurando la asignación de variante y la personalización de nombre, código y control hash.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExamenIndividualTypstService {

    private final AppProperties appProperties;
    private final RolExamenRepository rolExamenRepository;
    private final MapeoEstudianteVarianteRepository mapeoRepository;
    private final ExamenVarianteRepository varianteRepository;
    private final AuditoriaEvaluacionRepository auditoriaRepository;
    private final BancoCifradoService cifradoService;

    private static final Pattern PATTERN_NOMBRE_FOOTER = Pattern.compile("#raw\\(\"([^\"]+)\",\\s*block:\\s*false\\)");
    private static final Pattern PATTERN_CODIGO_FOOTER = Pattern.compile("#text\\(size:\\s*15pt,\\s*weight:\\s*\"bold\"\\)\\[([^\\]]+)\\]");
    private static final Pattern PAGEBREAK_PATTERN = Pattern.compile("(?m)^\\s*#pagebreak(?:\\([^)]*\\))?\\s*");

    @Transactional
    public String generarCuadernilloEstudiante(String rolExamenId, String codigoEstudiante, String letraVarianteDeseada, String usuario) {
        RolExamen rol = rolExamenRepository.findById(rolExamenId)
                .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + rolExamenId));

        MapeoEstudianteVariante mapeo = mapeoRepository.findByRolExamenIdAndCodigoEstudiante(rolExamenId, codigoEstudiante)
                .orElseThrow(() -> new IllegalArgumentException("Estudiante no registrado en el rol: " + codigoEstudiante));

        // Determinar variante
        String letra = (letraVarianteDeseada != null && !letraVarianteDeseada.isBlank())
                ? letraVarianteDeseada.trim().toUpperCase()
                : (mapeo.getLetraVariante() != null && !mapeo.getLetraVariante().isBlank() ? mapeo.getLetraVariante().trim().toUpperCase() : "A");

        // Buscar archivo Typst oficial en storage/generados/{rolExamenId}/documentos
        Path documentosDir = Path.of(appProperties.getStorage().getBasePath(), "generados", rolExamenId, "documentos");
        Path typOficial = buscarArchivoTypstOficial(documentosDir);
        if (typOficial == null || !Files.exists(typOficial)) {
            throw new IllegalStateException("No se encontró el documento Typst oficial en " + documentosDir);
        }

        String fullTypst;
        try {
            fullTypst = Files.readString(typOficial, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Error al leer el archivo Typst oficial: " + typOficial, e);
        }

        // Extraer preámbulo (todo antes del primer #set page()
        int setPageIdx = fullTypst.indexOf("#set page(");
        String preamble;
        String body;
        if (setPageIdx > 0) {
            preamble = fullTypst.substring(0, setPageIdx).trim();
            body = fullTypst.substring(setPageIdx);
        } else {
            preamble = """
                    #set text(
                      font: "Libertinus Serif",
                      size: 11pt,
                      lang: "es"
                    )
                    #show raw: set text(font: "Libertinus Serif")
                    #set par(leading: 0.8em, spacing: 0.8em)
                    """;
            body = fullTypst;
        }

        // Buscar todos los mapeos para este rol
        List<MapeoEstudianteVariante> mapeosRol = mapeoRepository.findByRolExamenId(rolExamenId);

        // Encontrar un estudiante de referencia que tenga la variante deseada y esté presente en el Typst
        MapeoEstudianteVariante refStudent = mapeosRol.stream()
                .filter(m -> m.getLetraVariante() != null && m.getLetraVariante().equalsIgnoreCase(letra))
                .filter(m -> fullTypst.contains(m.getCodigoEstudiante().trim()))
                .findFirst()
                .orElseGet(() -> mapeosRol.stream()
                        .filter(m -> fullTypst.contains(m.getCodigoEstudiante().trim()))
                        .findFirst()
                        .orElse(null));

        // Dividir el cuerpo en bloques por estudiante
        String[] chunks = PAGEBREAK_PATTERN.split(body);
        String targetChunk = null;

        if (refStudent != null) {
            String refCode = refStudent.getCodigoEstudiante().trim();
            for (String chunk : chunks) {
                if (chunk.contains(refCode)) {
                    targetChunk = chunk;
                    break;
                }
            }
        }

        if (targetChunk == null && chunks.length > 0) {
            targetChunk = chunks[0];
        }

        if (targetChunk == null || targetChunk.isBlank()) {
            throw new IllegalStateException("No se pudo extraer el bloque del examen desde " + typOficial);
        }

        // Extraer datos del estudiante de referencia presentes en el bloque
        Matcher matcherNombre = PATTERN_NOMBRE_FOOTER.matcher(targetChunk);
        String refNombreDoc = matcherNombre.find() ? matcherNombre.group(1) : (refStudent != null ? nombreCompleto(refStudent) : "");

        Matcher matcherCodigo = PATTERN_CODIGO_FOOTER.matcher(targetChunk);
        String refCodigoDoc = matcherCodigo.find() ? matcherCodigo.group(1) : (refStudent != null ? refStudent.getCodigoEstudiante().trim() : "");

        String nuevoNombre = nombreCompleto(mapeo);
        if (nuevoNombre.isBlank()) {
            nuevoNombre = codigoEstudiante;
        }

        // Reemplazar nombre y código en el bloque del estudiante
        String chunkModificado = targetChunk;
        if (!refNombreDoc.isBlank()) {
            chunkModificado = chunkModificado.replace(refNombreDoc, nuevoNombre);
        }
        if (!refCodigoDoc.isBlank()) {
            chunkModificado = chunkModificado.replace(refCodigoDoc, codigoEstudiante.trim());
        }

        // Reemplazar hash de control CTL-
        chunkModificado = chunkModificado.replaceAll("CTL-[A-Za-z0-9_-]+-[A-Za-z]", "CTL-" + codigoEstudiante.trim() + "-" + letra);

        // Reemplazar menciones explícitas de la variante si el estudiante de referencia tenía otra letra
        if (refStudent != null && refStudent.getLetraVariante() != null && !refStudent.getLetraVariante().equalsIgnoreCase(letra)) {
            String refL = refStudent.getLetraVariante().trim();
            chunkModificado = chunkModificado.replaceAll("(?i)\\bVARIANTE\\s+" + Pattern.quote(refL) + "\\b", "VARIANTE " + letra);
            chunkModificado = chunkModificado.replaceAll("(?i)\\bTIPO\\s+" + Pattern.quote(refL) + "\\b", "TIPO " + letra);
        }

        // Ensamblar código Typst individual
        String individualTypst = preamble + "\n\n" + chunkModificado.trim() + "\n";

        // Preparar directorio de destino storage/generados/{rolExamenId}/cuadernillos
        Path cuadernillosDir = Path.of(appProperties.getStorage().getBasePath(), "generados", rolExamenId, "cuadernillos");
        try {
            Files.createDirectories(cuadernillosDir);
            copiarRecursos(documentosDir, cuadernillosDir);
        } catch (IOException e) {
            throw new IllegalStateException("Error al preparar directorio de cuadernillos: " + cuadernillosDir, e);
        }

        String slugMateria = slugify(rol.getMateriaCodigo() + "_" + rol.getSedeCodigo() + "_" + rol.getGrupo() + "_" + rol.getTipoParcial());
        String slugEstudiante = slugify(nuevoNombre);
        String baseName = slugMateria + "_" + codigoEstudiante.trim() + "_" + slugEstudiante + "_Examen";

        Path typOut = cuadernillosDir.resolve(baseName + ".typ");
        Path pdfOut = cuadernillosDir.resolve(baseName + ".pdf");

        try {
            Files.writeString(typOut, individualTypst, StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new IllegalStateException("Error al escribir el archivo Typst individual: " + typOut, e);
        }

        // Compilar con Typst CLI
        compilarTypst(typOut, pdfOut);

        // Asegurar que la variante exista en sea_examenes_variantes
        String varianteId = String.format("VAR-%s-%s", rolExamenId, letra);
        Optional<ExamenVariante> optVariante = varianteRepository.findByRolExamenIdAndLetraVariante(rolExamenId, letra);
        if (optVariante.isEmpty()) {
            ExamenVariante refVariante = null;
            if (refStudent != null && refStudent.getLetraVariante() != null) {
                refVariante = varianteRepository.findByRolExamenIdAndLetraVariante(rolExamenId, refStudent.getLetraVariante()).orElse(null);
            }
            if (refVariante == null) {
                refVariante = varianteRepository.findByRolExamenId(rolExamenId).stream().findFirst().orElse(null);
            }

            ExamenVariante nuevaVariante = new ExamenVariante();
            nuevaVariante.setId(varianteId);
            nuevaVariante.setRolExamenId(rolExamenId);
            nuevaVariante.setLetraVariante(letra);
            nuevaVariante.setNombreVariante("TIPO " + letra);
            nuevaVariante.setSemillaPermutacion(refVariante != null && refVariante.getSemillaPermutacion() != null ? refVariante.getSemillaPermutacion() + 1 : 1);
            nuevaVariante.setTotalPreguntas(refVariante != null && refVariante.getTotalPreguntas() != null ? refVariante.getTotalPreguntas() : 30);
            nuevaVariante.setCuotaFaciles(refVariante != null && refVariante.getCuotaFaciles() != null ? refVariante.getCuotaFaciles() : 7);
            nuevaVariante.setCuotaMedias(refVariante != null && refVariante.getCuotaMedias() != null ? refVariante.getCuotaMedias() : 16);
            nuevaVariante.setCuotaDificiles(refVariante != null && refVariante.getCuotaDificiles() != null ? refVariante.getCuotaDificiles() : 7);

            if (refVariante != null && refVariante.getContenidoSeguroCifrado() != null && !refVariante.getContenidoSeguroCifrado().isBlank() && cifradoService != null) {
                try {
                    BancoEncryptedPayload payloadRef = BancoEncryptedPayload.builder()
                            .ciphertext(refVariante.getContenidoSeguroCifrado())
                            .nonce(refVariante.getContenidoSeguroNonce())
                            .wrappedDataKey(refVariante.getContenidoSeguroDekEnvuelta())
                            .keyReference(refVariante.getContenidoSeguroKekReferencia())
                            .keyVersion(refVariante.getContenidoSeguroKekVersion())
                            .algorithm(refVariante.getContenidoSeguroAlgoritmo())
                            .build();
                    String jsonPlano = cifradoService.descifrarTexto(payloadRef, "variante:" + refVariante.getId() + ":rol:" + refVariante.getRolExamenId());
                    BancoEncryptedPayload nuevoPayload = cifradoService.cifrarTexto(jsonPlano, "variante:" + varianteId + ":rol:" + rolExamenId);

                    nuevaVariante.setContenidoSeguroCifrado(nuevoPayload.getCiphertext());
                    nuevaVariante.setContenidoSeguroNonce(nuevoPayload.getNonce());
                    nuevaVariante.setContenidoSeguroDekEnvuelta(nuevoPayload.getWrappedDataKey());
                    nuevaVariante.setContenidoSeguroKekReferencia(nuevoPayload.getKeyReference());
                    nuevaVariante.setContenidoSeguroKekVersion(nuevoPayload.getKeyVersion());
                    nuevaVariante.setContenidoSeguroAlgoritmo(nuevoPayload.getAlgorithm());
                } catch (Exception e) {
                    log.warn("No se pudo descifrar/cifrar el contenido protegido de la nueva variante {}: {}", varianteId, e.getMessage());
                }
            }

            nuevaVariante.setArchivoTypstPath(typOut.toString().replace("\\", "/"));
            nuevaVariante.setArchivoPdfPath(pdfOut.toString().replace("\\", "/"));
            varianteRepository.save(nuevaVariante);

            rol.setVariantesGeneradasCount(varianteRepository.findByRolExamenId(rolExamenId).size());
            rolExamenRepository.save(rol);
        }

        // Actualizar mapeo del estudiante
        String pdfPathNormalizado = pdfOut.toString().replace("\\", "/");
        mapeo.setVarianteId(varianteId);
        mapeo.setLetraVariante(letra);
        mapeo.setHashControlSeguridad("CTL-" + codigoEstudiante.trim() + "-" + letra);
        mapeo.setCuadernilloIndividualPdf(pdfPathNormalizado);
        mapeoRepository.save(mapeo);

        // Registrar auditoría
        AuditoriaEvaluacion auditoria = AuditoriaEvaluacion.builder()
                .rolExamen(rol)
                .etapaOrigen(rol.getEstadoFlujo().getValor())
                .etapaDestino(rol.getEstadoFlujo().getValor())
                .accion("GENERACION_EXAMEN_REZAGADO")
                .usuario(usuario != null ? usuario : "SISTEMA")
                .ipOrigen("127.0.0.1")
                .detallesJson("{\"codigoEstudiante\":\"" + codigoEstudiante + "\",\"variante\":\"" + letra + "\",\"archivoPdfPath\":\"" + pdfPathNormalizado + "\"}")
                .build();
        auditoriaRepository.save(auditoria);

        log.info("Examen individual generado exitosamente para estudiante {} (Variante {}) en {}", codigoEstudiante, letra, pdfPathNormalizado);
        return pdfPathNormalizado;
    }

    private Path buscarArchivoTypstOficial(Path documentosDir) {
        if (!Files.exists(documentosDir)) {
            return null;
        }
        try (Stream<Path> stream = Files.list(documentosDir)) {
            return stream
                    .filter(p -> p.getFileName().toString().endsWith(".typ"))
                    .sorted((a, b) -> {
                        boolean aOficial = a.getFileName().toString().contains("_Examenes_Oficiales");
                        boolean bOficial = b.getFileName().toString().contains("_Examenes_Oficiales");
                        if (aOficial && !bOficial) return -1;
                        if (!aOficial && bOficial) return 1;
                        return a.getFileName().toString().compareTo(b.getFileName().toString());
                    })
                    .findFirst()
                    .orElse(null);
        } catch (IOException e) {
            log.error("Error listando directorio de documentos Typst: {}", documentosDir, e);
            return null;
        }
    }

    private void copiarRecursos(Path sourceDir, Path targetDir) {
        try {
            if (Files.exists(sourceDir)) {
                try (Stream<Path> files = Files.list(sourceDir)) {
                    files.filter(f -> {
                        String name = f.getFileName().toString().toLowerCase();
                        return name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".svg");
                    }).forEach(f -> {
                        try {
                            Files.copy(f, targetDir.resolve(f.getFileName()), StandardCopyOption.REPLACE_EXISTING);
                        } catch (IOException e) {
                            log.warn("No se pudo copiar recurso de imagen {}: {}", f.getFileName(), e.getMessage());
                        }
                    });
                }
            }
            // También verificar logo institucional base
            Path logoBase = Path.of(appProperties.getStorage().getBasePath()).getParent();
            if (logoBase != null) {
                Path logoCandidato = logoBase.resolve("bases").resolve("logo_unitepc_clean.png");
                Path logoDest = targetDir.resolve("logo_unitepc_clean.png");
                if (Files.exists(logoCandidato) && !Files.exists(logoDest)) {
                    Files.copy(logoCandidato, logoDest, StandardCopyOption.REPLACE_EXISTING);
                }
            }
        } catch (Exception e) {
            log.warn("Aviso al copiar recursos para Typst: {}", e.getMessage());
        }
    }

    private void compilarTypst(Path typFile, Path pdfFile) {
        String comando = resolverComandoTypst();
        List<String> cmd = List.of(comando, "compile", typFile.toAbsolutePath().toString(), pdfFile.toAbsolutePath().toString());
        log.info("Compilando examen individual Typst: {}", String.join(" ", cmd));
        try {
            ProcessBuilder pb = new ProcessBuilder(cmd);
            pb.directory(typFile.getParent().toFile());
            Process process = pb.start();
            String output;
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getErrorStream(), StandardCharsets.UTF_8))) {
                output = reader.lines().collect(Collectors.joining("\n"));
            }
            int exitCode = process.waitFor();
            if (exitCode != 0) {
                log.error("Fallo al compilar Typst (código {}): {}", exitCode, output);
                throw new IllegalStateException("Error al compilar examen individual con Typst: " + output);
            }
            if (!Files.exists(pdfFile)) {
                throw new IllegalStateException("El comando Typst finalizó exitosamente pero no se creó el PDF en " + pdfFile);
            }
            log.info("Examen individual compilado con éxito: {} ({} bytes)", pdfFile, Files.size(pdfFile));
        } catch (IOException | InterruptedException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new IllegalStateException("Error al invocar el compilador Typst: " + e.getMessage(), e);
        }
    }

    private String resolverComandoTypst() {
        String envTypst = System.getenv("TYPST_BIN");
        if (envTypst != null && !envTypst.isBlank() && Files.isExecutable(Path.of(envTypst))) {
            return envTypst;
        }
        List<String> candidatos = List.of("typst", "typst.exe", "/usr/local/bin/typst", "/usr/bin/typst");
        for (String c : candidatos) {
            try {
                Process p = new ProcessBuilder(c, "--version").start();
                if (p.waitFor() == 0) {
                    return c;
                }
            } catch (Exception ignored) {
            }
        }
        return "typst";
    }

    private String nombreCompleto(MapeoEstudianteVariante m) {
        if (m == null) return "";
        return Stream.of(m.getNombres(), m.getApellidoPaterno(), m.getApellidoMaterno())
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.joining(" "));
    }

    private String slugify(String texto) {
        if (texto == null || texto.isBlank()) return "DESCONOCIDO";
        String normalizado = Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return normalizado.replaceAll("[^a-zA-Z0-9_-]+", "_")
                .replaceAll("_+", "_")
                .replaceAll("^_|_$", "")
                .toUpperCase();
    }
}
