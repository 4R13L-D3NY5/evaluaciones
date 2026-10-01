package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.AuditoriaGlobalItemDto;
import com.xpertiflow.evaluaciones.api.dto.AuditoriaResumenDto;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaRespaldo;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaUsuario;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaVerificacion;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaRespaldoRepository;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaUsuarioRepository;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaVerificacionRepository;
import com.xpertiflow.evaluaciones.domain.entity.EventoExamenVirtual;
import com.xpertiflow.evaluaciones.domain.repository.EventoExamenVirtualRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditoriaService {

    private final AuditoriaEvaluacionRepository auditoriaEvaluacionRepository;
    private final AuditoriaUsuarioRepository auditoriaUsuarioRepository;
    private final AuditoriaRespaldoRepository auditoriaRespaldoRepository;
    private final AuditoriaVerificacionRepository auditoriaVerificacionRepository;
    private final EventoExamenVirtualRepository eventoExamenVirtualRepository;

    @Transactional(readOnly = true)
    public AuditoriaResumenDto obtenerAuditoriaGlobal(String modulo, String nivel, String busqueda, int limite) {
        return obtenerAuditoriaGlobal(modulo, nivel, busqueda, null, null, limite);
    }

    @Transactional(readOnly = true)
    public AuditoriaResumenDto obtenerAuditoriaGlobal(
            String modulo,
            String nivel,
            String busqueda,
            LocalDate fechaInicio,
            LocalDate fechaFin,
            int limite) {
        int boundedLimit = Math.min(Math.max(limite, 50), 1000);
        PageRequest pageRequest = PageRequest.of(0, boundedLimit, Sort.by(Sort.Direction.DESC, "fechaEvento"));
        PageRequest pageRequestVirtual = PageRequest.of(0, boundedLimit, Sort.by(Sort.Direction.DESC, "ocurridoEn"));

        List<AuditoriaGlobalItemDto> todosLosItems = new ArrayList<>();

        // 1. Auditoría de Evaluaciones
        try {
            List<AuditoriaEvaluacion> evaluacionItems = auditoriaEvaluacionRepository.findAllByOrderByFechaEventoDesc(pageRequest);
            evaluacionItems.forEach(e -> todosLosItems.add(mapearEvaluacion(e)));
        } catch (Exception ex) {
            log.warn("Error al consultar auditoria de evaluaciones: {}", ex.getMessage());
        }

        // 2. Auditoría de Usuarios, Autenticación y Administración de Evaluaciones
        try {
            List<AuditoriaUsuario> usuarioItems = auditoriaUsuarioRepository.findAllByOrderByFechaEventoDesc(pageRequest);
            usuarioItems.forEach(u -> todosLosItems.add(mapearUsuario(u)));
        } catch (Exception ex) {
            log.warn("Error al consultar auditoria de usuarios: {}", ex.getMessage());
        }

        // 3. Auditoría de Respaldos
        try {
            List<AuditoriaRespaldo> respaldoItems = auditoriaRespaldoRepository.findAllByOrderByFechaEventoDesc(pageRequest);
            respaldoItems.forEach(r -> todosLosItems.add(mapearRespaldo(r)));
        } catch (Exception ex) {
            log.warn("Error al consultar auditoria de respaldos: {}", ex.getMessage());
        }

        // 4. Auditoría de Verificación
        try {
            List<AuditoriaVerificacion> verificacionItems = auditoriaVerificacionRepository.findAllByOrderByFechaEventoDesc(pageRequest);
            verificacionItems.forEach(v -> todosLosItems.add(mapearVerificacion(v)));
        } catch (Exception ex) {
            log.warn("Error al consultar auditoria de verificaciones: {}", ex.getMessage());
        }

        // 5. Auditoría de Examen Virtual
        try {
            List<EventoExamenVirtual> virtualItems = eventoExamenVirtualRepository.findAllByOrderByOcurridoEnDesc(pageRequestVirtual);
            virtualItems.forEach(ev -> todosLosItems.add(mapearEventoVirtual(ev)));
        } catch (Exception ex) {
            log.warn("Error al consultar auditoria de examen virtual: {}", ex.getMessage());
        }

        // Ordenar cronológicamente descendente
        todosLosItems.sort((a, b) -> {
            if (a.getFechaEvento() == null && b.getFechaEvento() == null) return 0;
            if (a.getFechaEvento() == null) return 1;
            if (b.getFechaEvento() == null) return -1;
            return b.getFechaEvento().compareTo(a.getFechaEvento());
        });

        // Filtrar
        List<AuditoriaGlobalItemDto> filtrados = todosLosItems.stream()
                .filter(i -> modulo == null || modulo.isBlank() || modulo.equalsIgnoreCase("TODOS")
                        || i.getModulo().equalsIgnoreCase(modulo))
                .filter(i -> nivel == null || nivel.isBlank() || nivel.equalsIgnoreCase("TODOS")
                        || i.getNivel().equalsIgnoreCase(nivel))
                .filter(i -> busqueda == null || busqueda.isBlank()
                        || coincideBusqueda(i, busqueda.trim().toLowerCase()))
                .filter(i -> {
                    if (i.getFechaEvento() == null) return true;
                    LocalDate fecha = i.getFechaEvento().toLocalDate();
                    if (fechaInicio != null && fecha.isBefore(fechaInicio)) return false;
                    if (fechaFin != null && fecha.isAfter(fechaFin)) return false;
                    return true;
                })
                .collect(Collectors.toList());

        // Calcular KPIs sobre los registros filtrados
        long totalEventos = filtrados.size();
        long ipsUnicas = filtrados.stream()
                .map(AuditoriaGlobalItemDto::getIpOrigen)
                .filter(ip -> ip != null && !ip.isBlank() && !ip.equals("127.0.0.1"))
                .distinct()
                .count();
        if (ipsUnicas == 0 && totalEventos > 0) {
            ipsUnicas = 1; // Al menos una terminal/IP activa registrada
        }

        long operacionesCriticas = filtrados.stream()
                .filter(i -> "OPERACION_CRITICA".equalsIgnoreCase(i.getNivel()))
                .count();

        long alertasSeguridad = filtrados.stream()
                .filter(i -> "ADVERTENCIA".equalsIgnoreCase(i.getNivel()) || "LOGIN_FALLIDO".equalsIgnoreCase(i.getCodigoAccion()))
                .count();

        return AuditoriaResumenDto.builder()
                .totalEventos(totalEventos)
                .ipsUnicas(ipsUnicas)
                .operacionesCriticas(operacionesCriticas)
                .alertasSeguridad(alertasSeguridad)
                .items(filtrados)
                .build();
    }

    private boolean coincideBusqueda(AuditoriaGlobalItemDto item, String q) {
        return (item.getUsuario() != null && item.getUsuario().toLowerCase().contains(q))
                || (item.getUsuarioNombre() != null && item.getUsuarioNombre().toLowerCase().contains(q))
                || (item.getAccion() != null && item.getAccion().toLowerCase().contains(q))
                || (item.getCodigoAccion() != null && item.getCodigoAccion().toLowerCase().contains(q))
                || (item.getIpOrigen() != null && item.getIpOrigen().toLowerCase().contains(q))
                || (item.getCampus() != null && item.getCampus().toLowerCase().contains(q))
                || (item.getModulo() != null && item.getModulo().toLowerCase().contains(q))
                || (item.getDetallesJson() != null && item.getDetallesJson().toLowerCase().contains(q));
    }

    private AuditoriaGlobalItemDto mapearEvaluacion(AuditoriaEvaluacion a) {
        RolExamen rol = a.getRolExamen();
        String campus = "";
        String materiaInfo = "";
        if (rol != null) {
            campus = (rol.getCampus() != null ? rol.getCampus() : "") +
                    (rol.getSedeCodigo() != null ? " (" + rol.getSedeCodigo() + ")" : "");
            materiaInfo = (rol.getMateriaNombre() != null ? rol.getMateriaNombre() : "") +
                    (rol.getGrupo() != null ? " - " + rol.getGrupo() : "");
        }

        String accion = a.getAccion() != null ? a.getAccion() : "";
        String modulo = resolverModuloEvaluacion(accion);
        String nivel = resolverNivelEvaluacion(accion);
        String descripcion = describirAccionEvaluacion(accion, a.getEtapaOrigen(), a.getEtapaDestino(), materiaInfo);

        return AuditoriaGlobalItemDto.builder()
                .id("EVAL-" + a.getId())
                .tipo("EVALUACION")
                .modulo(modulo)
                .accion(descripcion)
                .codigoAccion(accion)
                .usuario(a.getUsuario() != null ? a.getUsuario() : "Sistema")
                .usuarioNombre(a.getUsuario() != null ? a.getUsuario() : "Usuario del Sistema")
                .usuarioCargo("Gestión de Evaluaciones")
                .ipOrigen(a.getIpOrigen() != null && !a.getIpOrigen().isBlank() ? a.getIpOrigen() : "127.0.0.1")
                .campus(campus)
                .nivel(nivel)
                .detallesJson(a.getDetallesJson())
                .fechaEvento(a.getFechaEvento())
                .build();
    }

    private AuditoriaGlobalItemDto mapearUsuario(AuditoriaUsuario u) {
        String accion = u.getAccion() != null ? u.getAccion() : "";

        // Clasificación de módulo
        String modulo;
        if (accion.startsWith("LOGIN_") || accion.equals("LOGOUT")) {
            modulo = "Autenticación y Sesiones";
        } else if (accion.startsWith("CONFIGURACION_") || accion.startsWith("CAMPUS_")) {
            modulo = "Administración de Evaluaciones";
        } else {
            modulo = "Usuarios y Accesos";
        }

        // Clasificación de nivel
        String nivel;
        if ("LOGIN_FALLIDO".equalsIgnoreCase(accion)) {
            nivel = "ADVERTENCIA";
        } else if (accion.contains("RESTABLECER") || accion.contains("RESTABLECIDA")
                || accion.contains("CONFIGURACION") || accion.contains("CREAR") || accion.contains("CREADO")
                || accion.contains("SINCRONIZAR") || accion.contains("SINCRONIZADO")) {
            nivel = "OPERACION_CRITICA";
        } else if (accion.contains("DESACTIVAR") || accion.contains("BLOQUEAR") || accion.contains("FALLO")) {
            nivel = "ADVERTENCIA";
        } else {
            nivel = "INFO";
        }

        String realizadoPor = (u.getRealizadoPor() != null && !u.getRealizadoPor().isBlank())
                ? u.getRealizadoPor()
                : (u.getUsuarioObjetivoCi() != null ? u.getUsuarioObjetivoCi() : "SISTEMA");

        String ip = (u.getIpOrigen() != null && !u.getIpOrigen().isBlank()) ? u.getIpOrigen() : "127.0.0.1";

        return AuditoriaGlobalItemDto.builder()
                .id("USR-" + u.getId())
                .tipo("USUARIO")
                .modulo(modulo)
                .accion(describirAccionUsuario(accion, u))
                .codigoAccion(accion)
                .usuario(realizadoPor)
                .usuarioNombre(realizadoPor)
                .usuarioCargo(determinarCargoUsuario(modulo, accion))
                .ipOrigen(ip)
                .campus("")
                .nivel(nivel)
                .detallesJson(u.getDetalle())
                .fechaEvento(u.getFechaEvento())
                .build();
    }

    private AuditoriaGlobalItemDto mapearEventoVirtual(EventoExamenVirtual ev) {
        String tipo = ev.getTipoEvento() != null ? ev.getTipoEvento() : "";
        String nivel;
        if (tipo.contains("ANULACION") || tipo.contains("FRAUDE") || tipo.contains("BLOQUEO") || tipo.contains("EXPULSION") || tipo.contains("FORZADO")) {
            nivel = "OPERACION_CRITICA";
        } else if (tipo.contains("ADVERTENCIA") || tipo.contains("FALLO") || tipo.contains("DESCONEXION") || tipo.contains("FOCO") || tipo.contains("PESTANA")) {
            nivel = "ADVERTENCIA";
        } else {
            nivel = "INFO";
        }

        String descripcion = describirAccionExamenVirtual(tipo, ev.getSalaId());
        String usuario = (ev.getUsuario() != null && !ev.getUsuario().isBlank()) ? ev.getUsuario() : "Estudiante";

        return AuditoriaGlobalItemDto.builder()
                .id("VIRT-" + ev.getId())
                .tipo("EXAMEN_VIRTUAL")
                .modulo("Examen Virtual")
                .accion(descripcion)
                .codigoAccion(tipo)
                .usuario(usuario)
                .usuarioNombre(usuario)
                .usuarioCargo("Examen Virtual")
                .ipOrigen(ev.getIpOrigen() != null && !ev.getIpOrigen().isBlank() ? ev.getIpOrigen() : "127.0.0.1")
                .campus("")
                .nivel(nivel)
                .detallesJson(ev.getDetallesJson())
                .fechaEvento(ev.getOcurridoEn())
                .build();
    }

    private String describirAccionUsuario(String accion, AuditoriaUsuario u) {
        return switch (accion) {
            case "LOGIN_EXITOSO" -> "Inicio de sesión exitoso";
            case "LOGIN_FALLIDO" -> "Intento fallido de inicio de sesión";
            case "LOGOUT" -> "Cierre de sesión";
            case "CONTRASENA_CAMBIADA_USUARIO" -> "Cambio de contraseña por el propio usuario";
            case "CONTRASENA_RESTABLECIDA_POR_ADMIN", "CONTRASENA_RESTABLECIDA" ->
                    "Restablecimiento de contraseña por administrador" + (u.getUsuarioObjetivoCi() != null ? " para " + u.getUsuarioObjetivoCi() : "");
            case "USUARIO_CREADO" -> "Creación de nuevo usuario en el sistema";
            case "USUARIO_ACTUALIZADO" -> "Actualización de usuario y asignaciones";
            case "USUARIO_IMPORTADO" -> "Usuario importado desde plantilla Excel";
            case "USUARIO_ACTUALIZADO_IMPORTACION" -> "Usuario actualizado desde plantilla Excel";
            case "CONFIGURACION_EXAMENES_ACTUALIZADA" -> "Actualización de parámetros globales de exámenes";
            case "CAMPUS_CARRERAS_ASIGNADAS" -> "Asignación de carreras por campus físico";
            case "DOCENTE_SINCRONIZADO_SEA" -> "Docente sincronizado desde catálogo SEA";
            case "DOCENTE_ACTUALIZADO_SEA" -> "Docente actualizado desde catálogo SEA";
            case "DOCENTE_DESACTIVADO_AUSENTE_SEA" -> "Docente desactivado por ausencia en SEA";
            default -> accion.replace('_', ' ');
        };
    }

    private String determinarCargoUsuario(String modulo, String accion) {
        if ("Autenticación y Sesiones".equals(modulo)) {
            return "Acceso y Seguridad";
        }
        if ("Administración de Evaluaciones".equals(modulo)) {
            return "Gestión de Evaluaciones";
        }
        return "Administrador del Sistema";
    }

    private String describirAccionExamenVirtual(String tipo, String salaId) {
        String base = switch (tipo) {
            case "INGRESO_SALA", "ESTUDIANTE_CONECTADO" -> "Ingreso de estudiante a la sala virtual";
            case "INICIO_EXAMEN" -> "Inicio de resolución de examen virtual";
            case "FINALIZACION_EXAMEN", "ENTREGA_EXAMEN" -> "Finalización y entrega de respuestas virtual";
            case "ANULACION_EXAMEN_VIRTUAL" -> "Anulación de intento de examen virtual";
            case "ADVERTENCIA_PESTANA", "CAMBIO_PESTANA" -> "Alerta por cambio de pestaña o pérdida de foco";
            case "SALIDA_PANTALLA_COMPLETA" -> "Alerta por abandono de pantalla completa";
            case "DESCONEXION_SALA" -> "Desconexión de estudiante de la sala virtual";
            case "CREACION_SALA" -> "Apertura y activación de sala virtual por docente";
            case "CIERRE_SALA" -> "Cierre de sala virtual por docente/sistema";
            default -> tipo.replace('_', ' ');
        };
        return (salaId != null && !salaId.isBlank()) ? base + " [Sala " + salaId + "]" : base;
    }

    private AuditoriaGlobalItemDto mapearRespaldo(AuditoriaRespaldo r) {
        String accion = r.getAccion() != null ? r.getAccion() : "";
        String nivel = accion.contains("BORRAR") || accion.contains("RESTAURAR")
                ? "OPERACION_CRITICA"
                : (accion.contains("CORRUPCION") || accion.contains("FALLO") ? "ADVERTENCIA" : "INFO");

        return AuditoriaGlobalItemDto.builder()
                .id("RESP-" + r.getId())
                .tipo("RESPALDO")
                .modulo("Respaldos")
                .accion(describirAccionRespaldo(accion))
                .codigoAccion(accion)
                .usuario(r.getActor() != null ? r.getActor() : "Sistema")
                .usuarioNombre(r.getActor() != null ? r.getActor() : "Operador de Respaldos")
                .usuarioCargo("Seguridad & Contingencia")
                .ipOrigen(r.getIpOrigen() != null && !r.getIpOrigen().isBlank() ? r.getIpOrigen() : "127.0.0.1")
                .campus("")
                .nivel(nivel)
                .detallesJson(r.getDetalleJson())
                .fechaEvento(r.getFechaEvento())
                .build();
    }

    private AuditoriaGlobalItemDto mapearVerificacion(AuditoriaVerificacion v) {
        String accion = v.getAccion() != null ? v.getAccion() : "";
        String nivel = accion.contains("DEVOLVER") || accion.contains("OBSERVAR")
                ? "ADVERTENCIA"
                : "INFO";

        return AuditoriaGlobalItemDto.builder()
                .id("VERIF-" + v.getId())
                .tipo("VERIFICACION")
                .modulo("Verificación de Exámenes")
                .accion(describirAccionVerificacion(accion))
                .codigoAccion(accion)
                .usuario(v.getRealizadoPor() != null ? v.getRealizadoPor() : "Verificador")
                .usuarioNombre(v.getRealizadoPor() != null ? v.getRealizadoPor() : "Personal Verificador")
                .usuarioCargo("Verificador Académico")
                .ipOrigen("127.0.0.1")
                .campus("")
                .nivel(nivel)
                .detallesJson(v.getDetalle())
                .fechaEvento(v.getFechaEvento())
                .build();
    }

    private String resolverModuloEvaluacion(String accion) {
        if (accion.contains("BANCO")) return "Banco de Preguntas";
        if (accion.contains("OMR") || accion.contains("CALIFICACION") || accion.contains("PATRON")) return "Calificación OMR";
        if (accion.contains("GENERACION") || accion.contains("CARTILLAS")) return "Generación Typst";
        if (accion.contains("VIRTUAL") || accion.contains("SALA")) return "Examen Virtual";
        if (accion.contains("SINCRONIZACION") || accion.contains("SEA")) return "Sincronización Institucional (SEA)";
        return "Evaluaciones";
    }

    private String resolverNivelEvaluacion(String accion) {
        if (accion.startsWith("SUSPENSION") || accion.contains("ELIMINACION") || accion.contains("RESTABLECIMIENTO")
                || accion.contains("GENERACION_LOTE")) {
            return "OPERACION_CRITICA";
        }
        if (accion.contains("ANULACION") || accion.contains("FALLO") || accion.contains("ERROR")) {
            return "ADVERTENCIA";
        }
        return "INFO";
    }

    private String describirAccionEvaluacion(String accion, String origen, String destino, String materia) {
        String base;
        switch (accion) {
            case "CREACION_ROL_EXAMEN":
                base = "Se creó el rol de examen";
                break;
            case "ACTUALIZACION_ROL_EXAMEN":
                base = "Se actualizó la programación del examen";
                break;
            case "VALIDACION_BANCO_PREGUNTAS":
                base = "Se validó el banco de preguntas institucional";
                break;
            case "REVALIDACION_BANCO_PREGUNTAS":
                base = "Se volvió a validar el banco de preguntas";
                break;
            case "ELIMINACION_BANCO_PREGUNTAS":
                base = "Se eliminó el banco de preguntas asociado";
                break;
            case "GENERACION_LOTE_CARTILLAS_OMR":
                base = "Se generaron las marcas OMR para impresión";
                break;
            case "CONFIRMACION_IMPRESION_CARTILLAS_OMR":
                base = "Se confirmó la impresión de las cartillas OMR";
                break;
            case "IMPRESION_MARCAS_OMR":
                base = "Se enviaron a impresión las marcas OMR";
                break;
            case "IMPRESION_LISTA_ESTUDIANTES":
                base = "Se imprimió la lista oficial de estudiantes";
                break;
            case "IMPRESION_PATRON_CALIFICADO":
                base = "Se imprimió el patrón calificado oficial";
                break;
            case "INICIO_CALIFICACION_OMR":
                base = "Se inició la calificación automatizada OMR";
                break;
            case "TRANSICION_ESTADO":
                base = "Transición de estado: " + (origen != null ? origen : "—") + " → " + (destino != null ? destino : "—");
                break;
            case "RESTABLECIMIENTO_A_VALIDADO":
                base = "Se restableció el rol de examen a estado Validado";
                break;
            case "SINCRONIZACION_NOTAS_SEA":
                base = "Sincronización oficial de notas hacia Gateway SEA";
                break;
            case "SINCRONIZACION_INDIVIDUAL_ESTUDIANTE_SEA":
                base = "Sincronización individual de calificación hacia Gateway SEA";
                break;
            default:
                if (accion.startsWith("SUSPENSION")) {
                    base = "Se suspendió el rol de examen";
                } else {
                    base = accion.replace('_', ' ');
                }
        }
        return materia.isBlank() ? base : base + " [" + materia + "]";
    }

    private String describirAccionRespaldo(String accion) {
        switch (accion) {
            case "CREAR_SNAPSHOT_LOCAL": return "Creación de snapshot local de respaldo";
            case "COPIAR_A_DESTINO_EXTERNO": return "Copia de respaldo a repositorio externo";
            case "VERIFICAR_INTEGRIDAD": return "Verificación de integridad criptográfica SHA-256";
            case "ELIMINAR_COPIA_LOCAL": return "Eliminación de copia local verificada";
            case "RESTAURAR_RESPALDO": return "Restauración de respaldo en entorno";
            default: return accion.replace('_', ' ');
        }
    }

    private String describirAccionVerificacion(String accion) {
        switch (accion) {
            case "APROBAR_EXAMEN": return "Aprobación y certificación de examen por verificador";
            case "DEVOLVER_EXAMEN": return "Devolución de examen con observaciones técnicas";
            default: return accion.replace('_', ' ');
        }
    }
}
