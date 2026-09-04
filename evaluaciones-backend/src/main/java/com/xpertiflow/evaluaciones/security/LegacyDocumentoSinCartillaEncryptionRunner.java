package com.xpertiflow.evaluaciones.security;

import com.xpertiflow.evaluaciones.domain.entity.DocumentoExamenSinCartilla;
import com.xpertiflow.evaluaciones.domain.repository.DocumentoExamenSinCartillaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Base64;

/**
 * Migra documentos históricos que fueron almacenados antes del cifrado real.
 * Solo se ejecuta durante una ventana explícita de migración.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.kms.migration-enabled", havingValue = "true")
public class LegacyDocumentoSinCartillaEncryptionRunner implements ApplicationRunner {

    private final DocumentoExamenSinCartillaRepository documentoRepository;
    private final BancoCifradoService cifradoService;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        int migrados = 0;
        for (DocumentoExamenSinCartilla documento : documentoRepository.findAll()) {
            if (documento.isArchivoCifrado()) continue;
            migrar(documento);
            migrados++;
        }
        log.info("Migración de documentos sin cartilla completada: {} documentos protegidos", migrados);
    }

    private void migrar(DocumentoExamenSinCartilla documento) {
        Path original = Path.of(documento.getArchivoPath());
        Path cifrado = original.resolveSibling(documento.getId() + ".enc");
        try {
            byte[] contenido = Files.readAllBytes(original);
            BancoEncryptedPayload payload = cifradoService.cifrarBytes(
                    contenido,
                    contextoCifrado(documento.getId(), documento.getRolExamenId()));
            Files.write(cifrado, Base64.getDecoder().decode(payload.getCiphertext()));

            documento.setArchivoPath(cifrado.toString());
            documento.setDekEnvuelta(payload.getWrappedDataKey());
            documento.setNonce(payload.getNonce());
            documento.setKekReferencia(payload.getKeyReference());
            documento.setKekVersion(payload.getKeyVersion());
            documento.setAlgoritmoCifrado(payload.getAlgorithm());
            documento.setArchivoCifrado(true);
            documento.setTamanoBytes((long) contenido.length);
            documento.setHashSha256(sha256(contenido));
            documentoRepository.save(documento);

            Files.delete(original);
        } catch (IOException exception) {
            eliminarSiExiste(cifrado);
            throw new IllegalStateException("No se pudo migrar un documento histórico sin cartilla a cifrado.", exception);
        } catch (RuntimeException exception) {
            eliminarSiExiste(cifrado);
            throw exception;
        }
    }

    private String contextoCifrado(String documentoId, String rolExamenId) {
        return "documento-sin-cartilla:" + documentoId + ":rol:" + rolExamenId;
    }

    private String sha256(byte[] bytes) {
        try {
            return java.util.HexFormat.of().formatHex(
                    java.security.MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (Exception exception) {
            throw new IllegalStateException("No se pudo calcular la integridad del documento histórico.", exception);
        }
    }

    private void eliminarSiExiste(Path archivo) {
        try {
            Files.deleteIfExists(archivo);
        } catch (IOException ignored) {
            // No se registra la ruta ni el contenido del documento.
        }
    }
}
