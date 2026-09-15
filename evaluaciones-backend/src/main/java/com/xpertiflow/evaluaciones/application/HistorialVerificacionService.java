package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.domain.entity.BancoPreguntas;
import com.xpertiflow.evaluaciones.domain.entity.HistorialVerificacion;
import com.xpertiflow.evaluaciones.domain.entity.VerificacionExamen;
import com.xpertiflow.evaluaciones.domain.repository.HistorialVerificacionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class HistorialVerificacionService {

    private final HistorialVerificacionRepository historialRepository;

    @Transactional
    public void archivarDevolucion(VerificacionExamen verificacion, BancoPreguntas banco) {
        if (verificacion == null || banco == null
                || !"DEVUELTO".equalsIgnoreCase(verificacion.getEstado())
                || !banco.getId().equals(verificacion.getBancoPreguntasId())
                || historialRepository.existsByRolExamenIdAndBancoPreguntasId(
                        verificacion.getRolExamenId(), banco.getId())) {
            return;
        }
        if (banco.getContenidoCifrado() == null || banco.getContenidoNonce() == null
                || banco.getContenidoDekEnvuelta() == null || banco.getContenidoKekReferencia() == null
                || banco.getContenidoKekVersion() == null || banco.getContenidoAlgoritmo() == null) {
            throw new IllegalStateException("No se puede conservar el banco cifrado para el historial de verificación");
        }

        HistorialVerificacion historial = new HistorialVerificacion();
        historial.setRolExamenId(verificacion.getRolExamenId());
        historial.setBancoPreguntasId(banco.getId());
        historial.setObservacionesGenerales(verificacion.getObservacionesGenerales());
        historial.setObservacionesPreguntasJson(verificacion.getObservacionesPreguntasJson());
        historial.setVerificadoPor(verificacion.getVerificadoPor());
        historial.setFechaDevolucion(verificacion.getFechaVerificacion() == null
                ? LocalDateTime.now() : verificacion.getFechaVerificacion());
        historial.setContenidoCifrado(banco.getContenidoCifrado());
        historial.setContenidoNonce(banco.getContenidoNonce());
        historial.setContenidoDekEnvuelta(banco.getContenidoDekEnvuelta());
        historial.setContenidoKekReferencia(banco.getContenidoKekReferencia());
        historial.setContenidoKekVersion(banco.getContenidoKekVersion());
        historial.setContenidoAlgoritmo(banco.getContenidoAlgoritmo());
        historialRepository.save(historial);
    }
}
