package com.xpertiflow.evaluaciones.security;

import com.xpertiflow.evaluaciones.domain.entity.BancoPreguntas;
import com.xpertiflow.evaluaciones.domain.entity.ExamenVariante;
import com.xpertiflow.evaluaciones.domain.repository.BancoPreguntasRepository;
import com.xpertiflow.evaluaciones.domain.repository.ExamenVarianteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Reenvuelve DEK existentes con la versión activa de Vault Transit. */
@Service
@RequiredArgsConstructor
public class BancoCifradoRotationService {

    private final BancoPreguntasRepository bancoRepository;
    private final ExamenVarianteRepository varianteRepository;
    private final BancoCifradoService cifradoService;

    @Transactional
    public RotationResult reenfundarTodo() {
        int bancos = 0;
        for (BancoPreguntas banco : bancoRepository.findAll()) {
            if (banco.getContenidoCifrado() == null || banco.getContenidoCifrado().isBlank()) continue;
            BancoEncryptedPayload actual = BancoEncryptedPayload.builder()
                    .ciphertext(banco.getContenidoCifrado())
                    .nonce(banco.getContenidoNonce())
                    .wrappedDataKey(banco.getContenidoDekEnvuelta())
                    .keyReference(banco.getContenidoKekReferencia())
                    .keyVersion(banco.getContenidoKekVersion())
                    .algorithm(banco.getContenidoAlgoritmo())
                    .build();
            aplicarBanco(banco, cifradoService.reenfundar(actual,
                    "banco:" + banco.getId() + ":rol:" + banco.getRolExamenId()));
            bancoRepository.save(banco);
            bancos++;
        }

        int variantes = 0;
        for (ExamenVariante variante : varianteRepository.findAll()) {
            if (variante.getContenidoSeguroCifrado() == null || variante.getContenidoSeguroCifrado().isBlank()) continue;
            BancoEncryptedPayload actual = BancoEncryptedPayload.builder()
                    .ciphertext(variante.getContenidoSeguroCifrado())
                    .nonce(variante.getContenidoSeguroNonce())
                    .wrappedDataKey(variante.getContenidoSeguroDekEnvuelta())
                    .keyReference(variante.getContenidoSeguroKekReferencia())
                    .keyVersion(variante.getContenidoSeguroKekVersion())
                    .algorithm(variante.getContenidoSeguroAlgoritmo())
                    .build();
            aplicarVariante(variante, cifradoService.reenfundar(actual,
                    "variante:" + variante.getId() + ":rol:" + variante.getRolExamenId()));
            varianteRepository.save(variante);
            variantes++;
        }
        return new RotationResult(bancos, variantes);
    }

    private void aplicarBanco(BancoPreguntas banco, BancoEncryptedPayload payload) {
        banco.setContenidoDekEnvuelta(payload.getWrappedDataKey());
        banco.setContenidoKekReferencia(payload.getKeyReference());
        banco.setContenidoKekVersion(payload.getKeyVersion());
    }

    private void aplicarVariante(ExamenVariante variante, BancoEncryptedPayload payload) {
        variante.setContenidoSeguroDekEnvuelta(payload.getWrappedDataKey());
        variante.setContenidoSeguroKekReferencia(payload.getKeyReference());
        variante.setContenidoSeguroKekVersion(payload.getKeyVersion());
    }

    public record RotationResult(int bancos, int variantes) {}
}
