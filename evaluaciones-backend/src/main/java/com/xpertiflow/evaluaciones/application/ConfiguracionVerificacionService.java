package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.verificacion.ConfiguracionVerificacionDto;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaVerificacion;
import com.xpertiflow.evaluaciones.domain.entity.ConfiguracionVerificacion;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaVerificacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.ConfiguracionVerificacionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ConfiguracionVerificacionService {

    private final ConfiguracionVerificacionRepository repository;
    private final AuditoriaVerificacionRepository auditoriaRepository;

    public List<ConfiguracionVerificacionDto> listar() {
        return repository.findAllByOrderBySedeCodigoAscCarreraCodigoAsc().stream().map(this::mapear).toList();
    }

    @Transactional
    public List<ConfiguracionVerificacionDto> guardar(ConfiguracionVerificacionDto request, String actor) {
        String sede = normalizarObligatorio(request.getSedeCodigo(), "La sede es obligatoria");
        String carrera = normalizar(request.getCarreraCodigo());
        ConfiguracionVerificacion entidad = carrera.isBlank()
                ? repository.findBySedeCodigoAndCarreraCodigoIsNull(sede).orElseGet(ConfiguracionVerificacion::new)
                : repository.findBySedeCodigoAndCarreraCodigo(sede, carrera).orElseGet(ConfiguracionVerificacion::new);
        entidad.setSedeCodigo(sede);
        entidad.setSedeNombre(valor(request.getSedeNombre(), sede));
        entidad.setCarreraCodigo(carrera.isBlank() ? null : carrera);
        entidad.setCarreraNombre(carrera.isBlank() ? null : valor(request.getCarreraNombre(), carrera));
        entidad.setHabilitada(request.isHabilitada());
        entidad.setActualizadoEn(LocalDateTime.now());
        entidad.setActualizadoPor(actor == null || actor.isBlank() ? "SISTEMA" : actor.trim());
        ConfiguracionVerificacion guardada = repository.save(entidad);
        registrarAuditoria(guardada, actor);
        return listar();
    }

    private ConfiguracionVerificacionDto mapear(ConfiguracionVerificacion entidad) {
        ConfiguracionVerificacionDto dto = new ConfiguracionVerificacionDto();
        dto.setId(entidad.getId());
        dto.setSedeCodigo(entidad.getSedeCodigo());
        dto.setSedeNombre(entidad.getSedeNombre());
        dto.setCarreraCodigo(entidad.getCarreraCodigo());
        dto.setCarreraNombre(entidad.getCarreraNombre());
        dto.setHabilitada(entidad.isHabilitada());
        dto.setActualizadoEn(entidad.getActualizadoEn() == null ? null : entidad.getActualizadoEn().toString());
        dto.setActualizadoPor(entidad.getActualizadoPor());
        return dto;
    }

    private void registrarAuditoria(ConfiguracionVerificacion configuracion, String actor) {
        AuditoriaVerificacion auditoria = new AuditoriaVerificacion();
        auditoria.setAccion("CONFIGURACION_VERIFICACION");
        auditoria.setRealizadoPor(actor == null || actor.isBlank() ? "SISTEMA" : actor.trim());
        auditoria.setDetalle(configuracion.getSedeCodigo() + "/"
                + (configuracion.getCarreraCodigo() == null ? "TODAS_LAS_CARRERAS" : configuracion.getCarreraCodigo())
                + " = " + (configuracion.isHabilitada() ? "HABILITADA" : "DESHABILITADA"));
        auditoria.setFechaEvento(LocalDateTime.now());
        auditoriaRepository.save(auditoria);
    }

    private String normalizar(String valor) {
        return valor == null ? "" : valor.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizarObligatorio(String valor, String mensaje) {
        String resultado = normalizar(valor);
        if (resultado.isBlank()) throw new IllegalArgumentException(mensaje);
        return resultado;
    }

    private String valor(String valor, String defecto) {
        return valor == null || valor.isBlank() ? defecto : valor.trim();
    }
}
