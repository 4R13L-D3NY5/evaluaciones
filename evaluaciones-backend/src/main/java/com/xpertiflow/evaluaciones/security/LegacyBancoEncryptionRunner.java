package com.xpertiflow.evaluaciones.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.domain.entity.BancoPreguntas;
import com.xpertiflow.evaluaciones.domain.entity.ExamenVariante;
import com.xpertiflow.evaluaciones.domain.entity.Reactivo;
import com.xpertiflow.evaluaciones.domain.repository.BancoPreguntasRepository;
import com.xpertiflow.evaluaciones.domain.repository.ExamenVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.ReactivoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Migración explícita de las versiones que se guardaron antes del cifrado real.
 * Se activa únicamente durante la ventana de migración mediante configuración.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.kms.migration-enabled", havingValue = "true")
public class LegacyBancoEncryptionRunner implements ApplicationRunner {

    private final BancoPreguntasRepository bancoRepository;
    private final ReactivoRepository reactivoRepository;
    private final ExamenVarianteRepository varianteRepository;
    private final BancoCifradoService cifradoService;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        int bancos = migrarBancos();
        int variantes = migrarVariantes();
        log.info("Migración de cifrado completada: {} bancos y {} variantes protegidos", bancos, variantes);
    }

    private int migrarBancos() {
        int migrados = 0;
        for (BancoPreguntas banco : bancoRepository.findAll()) {
            if (banco.getContenidoCifrado() != null && !banco.getContenidoCifrado().isBlank()) continue;
            String contenido = banco.getPaqueteJsonEncriptado();
            if (contenido == null || contenido.isBlank()) {
                contenido = serializarReactivos(reactivoRepository.findByBancoIdOrderByNumeroOrdenAsc(banco.getId()));
            }
            if (contenido == null || contenido.isBlank() || "[]".equals(contenido)) continue;

            BancoEncryptedPayload cifrado = cifradoService.cifrarTexto(
                    contenido, "banco:" + banco.getId() + ":rol:" + banco.getRolExamenId());
            aplicarCifradoBanco(banco, cifrado);
            banco.setPaqueteJsonEncriptado(null);
            bancoRepository.save(banco);

            for (Reactivo reactivo : reactivoRepository.findByBancoIdOrderByNumeroOrdenAsc(banco.getId())) {
                limpiarContenidoReactivo(reactivo);
                reactivoRepository.save(reactivo);
            }
            migrados++;
        }
        return migrados;
    }

    private int migrarVariantes() {
        int migrados = 0;
        for (ExamenVariante variante : varianteRepository.findAll()) {
            if (variante.getContenidoSeguroCifrado() != null && !variante.getContenidoSeguroCifrado().isBlank()) continue;
            Map<String, String> contenido = new LinkedHashMap<>();
            contenido.put("patronClavesJson", valor(variante.getPatronClavesJson()));
            contenido.put("ordenReactivosIdsJson", valor(variante.getOrdenReactivosIdsJson()));
            contenido.put("contenidoVirtualJson", valor(variante.getContenidoVirtualJson()));
            try {
                BancoEncryptedPayload cifrado = cifradoService.cifrarTexto(
                        objectMapper.writeValueAsString(contenido),
                        "variante:" + variante.getId() + ":rol:" + variante.getRolExamenId());
                variante.setContenidoSeguroCifrado(cifrado.getCiphertext());
                variante.setContenidoSeguroNonce(cifrado.getNonce());
                variante.setContenidoSeguroDekEnvuelta(cifrado.getWrappedDataKey());
                variante.setContenidoSeguroKekReferencia(cifrado.getKeyReference());
                variante.setContenidoSeguroKekVersion(cifrado.getKeyVersion());
                variante.setContenidoSeguroAlgoritmo(cifrado.getAlgorithm());
                variante.setPatronClavesJson(null);
                variante.setOrdenReactivosIdsJson(null);
                variante.setContenidoVirtualJson(null);
                varianteRepository.save(variante);
                migrados++;
            } catch (Exception exception) {
                throw new IllegalStateException("No se pudo migrar la variante " + variante.getId(), exception);
            }
        }
        return migrados;
    }

    private void aplicarCifradoBanco(BancoPreguntas banco, BancoEncryptedPayload cifrado) {
        banco.setContenidoCifrado(cifrado.getCiphertext());
        banco.setContenidoNonce(cifrado.getNonce());
        banco.setContenidoDekEnvuelta(cifrado.getWrappedDataKey());
        banco.setContenidoKekReferencia(cifrado.getKeyReference());
        banco.setContenidoKekVersion(cifrado.getKeyVersion());
        banco.setContenidoAlgoritmo(cifrado.getAlgorithm());
    }

    private void limpiarContenidoReactivo(Reactivo reactivo) {
        reactivo.setEnunciado(null);
        reactivo.setImagenBase64(null);
        reactivo.setOpcionesJson(null);
        reactivo.setRespuestaCorrecta(null);
    }

    private String serializarReactivos(List<Reactivo> reactivos) {
        try {
            return objectMapper.writeValueAsString(new ArrayList<>(reactivos));
        } catch (Exception exception) {
            throw new IllegalStateException("No se pudieron serializar los reactivos históricos", exception);
        }
    }

    private String valor(String valor) {
        return valor == null ? "" : valor;
    }
}
