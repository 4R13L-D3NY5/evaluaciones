package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.ConfiguracionEvaluacionesDto;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Política única para las ventanas operativas de Lista de Evaluaciones.
 *
 * El rol Personal de Evaluaciones se controla con la hora del servidor. La
 * interfaz puede anticipar el bloqueo, pero nunca puede sustituir estas
 * validaciones.
 */
@Service
@RequiredArgsConstructor
public class PoliticaTiempoEvaluacionesService {

    private static final Pattern HORA = Pattern.compile("(\\d{1,2}):(\\d{2})");
    private static final DateTimeFormatter HORA_CORTA = DateTimeFormatter.ofPattern("H:mm", Locale.ROOT);

    private final ConfiguracionEvaluacionesService configuracionService;

    public boolean esPersonal(Authentication authentication) {
        return authentication != null
                && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_PERSONAL_EVALUACIONES".equals(authority.getAuthority()));
    }

    /**
     * Oculta al personal los roles cuya publicación operativa todavía no se
     * encuentra dentro de la anticipación configurada.
     */
    public List<RolExamen> filtrarListaParaPersonal(List<RolExamen> roles,
                                                     Authentication authentication) {
        if (!esPersonal(authentication)) return roles;
        LocalDateTime ahora = LocalDateTime.now();
        int horasAntes = configuracion().getHorasAntesLista();
        return roles.stream()
                .filter(rol -> inicioExamenSeguro(rol)
                        .map(inicio -> !ahora.isBefore(inicio.minusHours(horasAntes)))
                        .orElse(false))
                .toList();
    }

    public void exigirGeneracionHabilitada(RolExamen rol, Authentication authentication) {
        if (!esPersonal(authentication)) return;
        LocalDateTime inicio = inicioExamenObligatorio(rol);
        int horasAntes = configuracion().getHorasAntesGeneracion();
        LocalDateTime habilitadoDesde = inicio.minusHours(horasAntes);
        if (LocalDateTime.now().isBefore(habilitadoDesde)) {
            throw new VentanaTemporalException("La generación todavía no está habilitada para el personal de evaluaciones. "
                    + "Se habilita desde " + formatear(habilitadoDesde) + " (" + horasAntes + " h antes del examen).");
        }
    }

    public void exigirEntregaHabilitada(RolExamen rol, Authentication authentication) {
        if (!esPersonal(authentication)) return;
        LocalDateTime inicio = inicioExamenObligatorio(rol);
        int minutosAntes = configuracion().getMinutosAntesEntrega();
        LocalDateTime habilitadoDesde = inicio.minusMinutes(minutosAntes);
        if (LocalDateTime.now().isBefore(habilitadoDesde)) {
            throw new VentanaTemporalException("La entrega todavía no está habilitada para el personal de evaluaciones. "
                    + "Se habilita desde " + formatear(habilitadoDesde) + " (" + minutosAntes + " min antes del examen).");
        }
    }

    public void exigirPatronHabilitado(RolExamen rol, Authentication authentication) {
        if (!esPersonal(authentication)) return;
        LocalDateTime inicio = inicioExamenObligatorio(rol);
        int horasPostPatron = configuracion().getHorasPostPatron();
        LocalDateTime habilitadoDesde = inicio.plusHours(horasPostPatron);
        if (LocalDateTime.now().isBefore(habilitadoDesde)) {
            throw new VentanaTemporalException("El patrón oficial todavía está protegido para el personal de evaluaciones. "
                    + "Estará disponible desde " + formatear(habilitadoDesde) + " (" + horasPostPatron + " h después del examen).");
        }
    }

    public boolean estaHabilitadaGeneracion(RolExamen rol, Authentication authentication) {
        if (!esPersonal(authentication)) return true;
        return inicioExamenSeguro(rol)
                .map(inicio -> !LocalDateTime.now().isBefore(
                        inicio.minusHours(configuracion().getHorasAntesGeneracion())))
                .orElse(false);
    }

    public boolean estaHabilitadaEntrega(RolExamen rol, Authentication authentication) {
        if (!esPersonal(authentication)) return true;
        return inicioExamenSeguro(rol)
                .map(inicio -> !LocalDateTime.now().isBefore(
                        inicio.minusMinutes(configuracion().getMinutosAntesEntrega())))
                .orElse(false);
    }

    private ConfiguracionEvaluacionesDto configuracion() {
        ConfiguracionEvaluacionesDto configuracion = configuracionService.obtener();
        if (configuracion.getHorasAntesLista() == null) configuracion.setHorasAntesLista(24);
        if (configuracion.getHorasAntesGeneracion() == null) configuracion.setHorasAntesGeneracion(144);
        if (configuracion.getMinutosAntesEntrega() == null) configuracion.setMinutosAntesEntrega(15);
        if (configuracion.getHorasPostPatron() == null) configuracion.setHorasPostPatron(8);
        return configuracion;
    }

    private LocalDateTime inicioExamenObligatorio(RolExamen rol) {
        return inicioExamenSeguro(rol).orElseThrow(() -> new VentanaTemporalException(
                "El examen no tiene una fecha y hora oficial válidas; no se puede aplicar la ventana cronológica."));
    }

    private java.util.Optional<LocalDateTime> inicioExamenSeguro(RolExamen rol) {
        if (rol == null || rol.getFecha() == null || rol.getHorario() == null) {
            return java.util.Optional.empty();
        }
        Matcher matcher = HORA.matcher(rol.getHorario());
        if (!matcher.find()) return java.util.Optional.empty();
        try {
            int hora = Integer.parseInt(matcher.group(1));
            int minuto = Integer.parseInt(matcher.group(2));
            if (hora > 23 || minuto > 59) return java.util.Optional.empty();
            return java.util.Optional.of(LocalDateTime.of(rol.getFecha(), LocalTime.of(hora, minuto)));
        } catch (NumberFormatException | DateTimeParseException exception) {
            return java.util.Optional.empty();
        }
    }

    private String formatear(LocalDateTime fecha) {
        return fecha.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm", Locale.ROOT));
    }
}
