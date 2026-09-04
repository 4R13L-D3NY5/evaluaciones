package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.backup.ConfiguracionRespaldosRequestDto;
import com.xpertiflow.evaluaciones.api.dto.backup.ConfiguracionRespaldosResponseDto;
import com.xpertiflow.evaluaciones.api.dto.backup.RespaldoResponseDto;
import com.xpertiflow.evaluaciones.api.dto.backup.RestaurarRespaldoRequestDto;
import com.xpertiflow.evaluaciones.config.AppProperties;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaRespaldo;
import com.xpertiflow.evaluaciones.domain.entity.ConfiguracionRespaldos;
import com.xpertiflow.evaluaciones.domain.entity.Respaldo;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaRespaldoRepository;
import com.xpertiflow.evaluaciones.domain.repository.ConfiguracionRespaldosRepository;
import com.xpertiflow.evaluaciones.domain.repository.RespaldoRepository;
import com.xpertiflow.evaluaciones.infrastructure.messaging.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RespaldosService {
    private static final Short CONFIG_ID = 1;
    private final ConfiguracionRespaldosRepository configuracionRepository;
    private final RespaldoRepository respaldoRepository;
    private final AuditoriaRespaldoRepository auditoriaRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;
    private final AppProperties appProperties;

    @Transactional(readOnly = true)
    public ConfiguracionRespaldosResponseDto obtenerConfiguracion() {
        ConfiguracionRespaldos config = configuracion();
        Respaldo ultimo = ultimoExitoso();
        LocalDateTime proxima = config.isActivo() && ultimo != null && ultimo.getFinalizadoEn() != null
                ? ultimo.getFinalizadoEn().plusMinutes(config.getFrecuenciaMinutos()) : null;
        return new ConfiguracionRespaldosResponseDto(config.isActivo(), config.getFrecuenciaMinutos(), config.getRetencionDias(),
                config.getDestinoExternoConfigurado(), appProperties.getBackups().getLocalRepository(),
                appProperties.getBackups().getExternalRepository(), proxima, config.getActualizadoEn());
    }

    @Transactional
    public ConfiguracionRespaldosResponseDto actualizarConfiguracion(ConfiguracionRespaldosRequestDto request, String actor, String ip) {
        ConfiguracionRespaldos config = configuracion();
        config.setActivo(request.activo());
        config.setFrecuenciaMinutos(request.frecuenciaMinutos());
        config.setRetencionDias(request.retencionDias());
        config.setActualizadoEn(LocalDateTime.now());
        config.setActualizadoPor(actor);
        configuracionRepository.save(config);
        auditar(null, "CONFIGURACION_ACTUALIZADA", actor, ip, request);
        return obtenerConfiguracion();
    }

    @Transactional(readOnly = true)
    public List<RespaldoResponseDto> listar() {
        return respaldoRepository.findAllByOrderBySolicitadoEnDesc().stream().map(this::toDto).toList();
    }

    @Transactional
    public RespaldoResponseDto generarAhora(String actor, String ip) {
        return toDto(crearSolicitud("MANUAL", actor, ip));
    }

    @Transactional
    public RespaldoResponseDto copiarExterno(String id, String actor, String ip) {
        Respaldo respaldo = obtener(id);
        exigirEstado(respaldo, List.of("GENERADO", "ERROR"), "Solo se puede copiar un respaldo generado correctamente.");
        respaldo.setEstado("COPIANDO");
        respaldo.setErrorMensaje(null);
        respaldoRepository.save(respaldo);
        auditar(id, "COPIA_EXTERNA_SOLICITADA", actor, ip, null);
        publicar(Map.of("operacion", "COPY_EXTERNAL", "backupId", id));
        return toDto(respaldo);
    }

    @Transactional
    public RespaldoResponseDto verificar(String id, String actor, String ip) {
        Respaldo respaldo = obtener(id);
        exigirEstado(respaldo, List.of("COPIADO", "ERROR"), "La copia externa debe completarse antes de verificarla.");
        respaldo.setEstado("VERIFICANDO");
        respaldo.setErrorMensaje(null);
        respaldoRepository.save(respaldo);
        auditar(id, "VERIFICACION_SOLICITADA", actor, ip, null);
        publicar(Map.of("operacion", "VERIFY", "backupId", id));
        return toDto(respaldo);
    }

    @Transactional
    public RespaldoResponseDto eliminarLocal(String id, String actor, String ip) {
        Respaldo respaldo = obtener(id);
        exigirEstado(respaldo, List.of("VERIFICADO"), "La eliminación local requiere una copia externa verificada.");
        auditar(id, "ELIMINACION_LOCAL_SOLICITADA", actor, ip, null);
        publicar(Map.of("operacion", "DELETE_LOCAL", "backupId", id));
        return toDto(respaldo);
    }

    @Transactional
    public RespaldoResponseDto restaurar(String id, RestaurarRespaldoRequestDto request, String actor, String ip) {
        Respaldo respaldo = obtener(id);
        exigirEstado(respaldo, List.of("VERIFICADO"), "Solo se puede restaurar una copia externa verificada.");
        String esperado = "RESTAURAR " + id;
        if (!esperado.equals(request.confirmacion())) throw new IllegalArgumentException("La confirmación debe ser exactamente: " + esperado);
        respaldo.setEstado("RESTAURANDO");
        respaldoRepository.save(respaldo);
        auditar(id, "RESTAURACION_SOLICITADA", actor, ip, Map.of("confirmado", true));
        publicar(Map.of("operacion", "RESTORE", "backupId", id));
        return toDto(respaldo);
    }

    @Scheduled(fixedDelay = 60000)
    @Transactional
    public void ejecutarProgramacion() {
        ConfiguracionRespaldos config = configuracion();
        if (!config.isActivo() || enMantenimiento() || !respaldoRepository.findByEstadoIn(List.of("SOLICITADO", "EN_PROCESO", "COPIANDO", "VERIFICANDO", "RESTAURANDO")).isEmpty()) return;
        Respaldo ultimo = ultimoExitoso();
        if (ultimo == null || ultimo.getFinalizadoEn() == null || ultimo.getFinalizadoEn().plusMinutes(config.getFrecuenciaMinutos()).isBefore(LocalDateTime.now())) {
            crearSolicitud("PROGRAMADO", "SISTEMA_PROGRAMADOR", "127.0.0.1");
        }
    }

    private Respaldo crearSolicitud(String origen, String actor, String ip) {
        Respaldo respaldo = new Respaldo();
        respaldo.setId("BKP-" + UUID.randomUUID());
        respaldo.setTipo("SNAPSHOT");
        respaldo.setEstado("SOLICITADO");
        respaldo.setSolicitadoPor(actor);
        respaldo.setSolicitadoEn(LocalDateTime.now());
        respaldo.setActualizadoEn(LocalDateTime.now());
        respaldo.setRutaLocal(appProperties.getBackups().getLocalRepository());
        respaldo.setRutaExterna(appProperties.getBackups().getExternalRepository());
        respaldo = respaldoRepository.save(respaldo);
        auditar(respaldo.getId(), "GENERACION_SOLICITADA", actor, ip, Map.of("origen", origen));
        publicar(Map.of("operacion", "CREATE_SNAPSHOT", "backupId", respaldo.getId()));
        return respaldo;
    }

    private void publicar(Object mensaje) {
        try { rabbitTemplate.convertAndSend(RabbitMQConfig.QUEUE_BACKUPS, objectMapper.writeValueAsString(mensaje)); }
        catch (JsonProcessingException exception) { throw new IllegalStateException("No se pudo encolar la operación de respaldo", exception); }
    }

    private ConfiguracionRespaldos configuracion() { return configuracionRepository.findById(CONFIG_ID).orElseThrow(() -> new IllegalStateException("No existe la configuración de respaldos")); }
    private boolean enMantenimiento() { return Files.exists(Path.of(appProperties.getStorage().getBasePath(), ".sea-maintenance")); }
    private Respaldo obtener(String id) { return respaldoRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Respaldo no encontrado: " + id)); }
    private void exigirEstado(Respaldo item, List<String> estados, String mensaje) { if (!estados.contains(item.getEstado())) throw new IllegalStateException(mensaje); }
    private Respaldo ultimoExitoso() { return respaldoRepository.findAllByOrderBySolicitadoEnDesc().stream().filter(item -> List.of("GENERADO", "COPIADO", "VERIFICADO", "ELIMINADO").contains(item.getEstado())).findFirst().orElse(null); }

    private void auditar(String respaldoId, String accion, String actor, String ip, Object detalle) {
        AuditoriaRespaldo item = new AuditoriaRespaldo();
        item.setRespaldoId(respaldoId); item.setAccion(accion); item.setActor(actor == null ? "SISTEMA" : actor); item.setIpOrigen(ip); item.setFechaEvento(LocalDateTime.now());
        if (detalle != null) try { item.setDetalleJson(objectMapper.writeValueAsString(detalle)); } catch (JsonProcessingException ignored) { item.setDetalleJson("{}"); }
        auditoriaRepository.save(item);
    }

    private RespaldoResponseDto toDto(Respaldo item) {
        return new RespaldoResponseDto(item.getId(), item.getTipo(), item.getEstado(), item.getSnapshotLocalId(), item.getSnapshotExternoId(), item.getRutaLocal(), item.getRutaExterna(), item.getTamanoBytes(), item.getArchivosCount(), item.getSolicitadoPor(), item.getSolicitadoEn(), item.getIniciadoEn(), item.getFinalizadoEn(), item.getExternoCopiadoEn(), item.getVerificadoEn(), item.getLocalEliminadoEn(), item.getErrorMensaje());
    }
}
