package com.xpertiflow.evaluaciones.security;

import com.xpertiflow.evaluaciones.domain.entity.DocumentoExamenSinCartilla;
import com.xpertiflow.evaluaciones.domain.repository.DocumentoExamenSinCartillaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;

/** Reenvuelve las DEK de documentos sin cartilla sin descifrar su contenido. */
@Service
@RequiredArgsConstructor
public class DocumentoSinCartillaRotationService {

    private final DocumentoExamenSinCartillaRepository documentoRepository;
    private final BancoCifradoService cifradoService;

    @Transactional
    public int reenfundarTodo() {
        int documentos = 0;
        for (DocumentoExamenSinCartilla documento : documentoRepository.findAll()) {
            if (!documento.isArchivoCifrado()
                    || documento.getDekEnvuelta() == null
                    || documento.getNonce() == null
                    || documento.getKekReferencia() == null
                    || documento.getAlgoritmoCifrado() == null) {
                continue;
            }

            BancoEncryptedPayload actual = BancoEncryptedPayload.builder()
                    .ciphertext(Base64.getEncoder().encodeToString(
                            leerCiphertext(documento)))
                    .nonce(documento.getNonce())
                    .wrappedDataKey(documento.getDekEnvuelta())
                    .keyReference(documento.getKekReferencia())
                    .keyVersion(documento.getKekVersion())
                    .algorithm(documento.getAlgoritmoCifrado())
                    .build();
            BancoEncryptedPayload reenvuelto = cifradoService.reenfundar(actual,
                    contextoCifrado(documento.getId(), documento.getRolExamenId()));
            documento.setDekEnvuelta(reenvuelto.getWrappedDataKey());
            documento.setKekReferencia(reenvuelto.getKeyReference());
            documento.setKekVersion(reenvuelto.getKeyVersion());
            documentoRepository.save(documento);
            documentos++;
        }
        return documentos;
    }

    private byte[] leerCiphertext(DocumentoExamenSinCartilla documento) {
        try {
            return java.nio.file.Files.readAllBytes(java.nio.file.Path.of(documento.getArchivoPath()));
        } catch (java.io.IOException exception) {
            throw new IllegalStateException("No se pudo leer un documento cifrado para rotar su DEK.", exception);
        }
    }

    private String contextoCifrado(String documentoId, String rolExamenId) {
        return "documento-sin-cartilla:" + documentoId + ":rol:" + rolExamenId;
    }
}
