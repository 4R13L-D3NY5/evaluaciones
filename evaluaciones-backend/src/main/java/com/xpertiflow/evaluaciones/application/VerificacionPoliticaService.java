package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.domain.entity.ConfiguracionVerificacion;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.entity.VerificacionExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.repository.BancoPreguntasRepository;
import com.xpertiflow.evaluaciones.domain.repository.ConfiguracionVerificacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.VerificacionExamenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class VerificacionPoliticaService {

    private final ConfiguracionVerificacionRepository configuracionRepository;
    private final VerificacionExamenRepository verificacionRepository;
    private final BancoPreguntasRepository bancoRepository;

    public boolean aplica(RolExamen rol) {
        return rol != null && (rol.getModalidad() == ModalidadExamen.PRESENCIAL_CARTILLA
                || rol.getModalidad() == ModalidadExamen.VIRTUAL);
    }

    @Transactional(readOnly = true)
    public boolean requiere(RolExamen rol) {
        if (!aplica(rol)) return false;
        String sede = normalizar(rol.getSedeCodigo());
        String carrera = normalizar(rol.getCarreraCodigo());
        ConfiguracionVerificacion reglaCarrera = carrera.isBlank()
                ? null
                : configuracionRepository.findBySedeCodigoAndCarreraCodigo(sede, carrera).orElse(null);
        if (reglaCarrera != null) return reglaCarrera.isHabilitada();
        return configuracionRepository.findBySedeCodigoAndCarreraCodigoIsNull(sede)
                .map(ConfiguracionVerificacion::isHabilitada)
                .orElse(false);
    }

    @Transactional(readOnly = true)
    public void exigirVerificado(RolExamen rol) {
        if (!requiere(rol)) return;
        VerificacionExamen verificacion = verificacionRepository.findByRolExamenId(rol.getId()).orElse(null);
        String bancoActual = bancoRepository.findTopByRolExamenIdOrderByFechaAprobacionDesc(rol.getId())
                .map(banco -> banco.getId()).orElse(null);
        if (verificacion == null
                || !"VERIFICADO".equalsIgnoreCase(verificacion.getEstado())
                || bancoActual == null
                || !bancoActual.equals(verificacion.getBancoPreguntasId())) {
            throw new VerificacionRequeridaException(
                    "El examen debe ser verificado antes de generar el documento oficial.");
        }
    }

    public boolean esValidado(RolExamen rol) {
        return rol != null && rol.getEstadoFlujo() == EstadoFlujo.VALIDADO;
    }

    private String normalizar(String valor) {
        return valor == null ? "" : valor.trim().toUpperCase(Locale.ROOT);
    }
}
