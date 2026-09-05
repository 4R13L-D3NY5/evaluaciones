package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.ConfiguracionEvaluacionesDto;
import com.xpertiflow.evaluaciones.api.dto.ConfiguracionParcialDto;
import com.xpertiflow.evaluaciones.domain.entity.ConfiguracionEvaluaciones;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.domain.repository.ConfiguracionEvaluacionesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ConfiguracionEvaluacionesService {

    private static final short CONFIGURACION_ID = 1;
    private static final int RATIO_POR_DEFECTO = 5;
    private static final int DURACION_VIRTUAL_POR_DEFECTO = 45;
    private static final int CUENTA_REGRESIVA_VIRTUAL_POR_DEFECTO = 15;
    private static final String FORMATO_HOJA_POR_DEFECTO = "Oficio (Folio UNITEPC)";
    private static final String TIPO_LETRA_POR_DEFECTO = "Times New Roman";
    private static final int TAMANO_LETRA_POR_DEFECTO = 11;
    private static final String ESPACIADO_LEADING_POR_DEFECTO = "0.8em (línea) · 1.2em (pregunta)";
    private static final int MINUTOS_ENTREGA_POR_DEFECTO = 15;
    private static final int HORAS_GENERACION_POR_DEFECTO = 144;
    private static final int HORAS_PATRON_POR_DEFECTO = 8;
    private static final int HORAS_LISTA_POR_DEFECTO = 24;
    private static final int HORAS_CANDADO_POR_DEFECTO = 72;

    private final ConfiguracionEvaluacionesRepository repository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public ConfiguracionEvaluacionesDto obtener() {
        return mapear(repository.findById(CONFIGURACION_ID).orElseGet(this::configuracionDefecto));
    }

    @Transactional
    public ConfiguracionEvaluacionesDto guardar(ConfiguracionEvaluacionesDto request) {
        ConfiguracionEvaluaciones configuracion = repository.findById(CONFIGURACION_ID)
                .orElseGet(this::configuracionDefecto);
        configuracion.setId(CONFIGURACION_ID);
        configuracion.setRatioEstudiantesPorVariante(request.getRatioEstudiantesPorVariante());
        configuracion.setDuracionExamenVirtualMinutos(request.getDuracionExamenVirtualMinutos() != null
                ? request.getDuracionExamenVirtualMinutos() : DURACION_VIRTUAL_POR_DEFECTO);
        configuracion.setCuentaRegresivaInicioVirtualSegundos(request.getCuentaRegresivaInicioVirtualSegundos() != null
                ? request.getCuentaRegresivaInicioVirtualSegundos() : CUENTA_REGRESIVA_VIRTUAL_POR_DEFECTO);
        configuracion.setFormatoHoja(valorODefecto(request.getFormatoHoja(), FORMATO_HOJA_POR_DEFECTO));
        configuracion.setTipoLetra(valorODefecto(request.getTipoLetra(), TIPO_LETRA_POR_DEFECTO));
        configuracion.setTamanoLetraPt(request.getTamanoLetraPt() != null
                ? request.getTamanoLetraPt() : TAMANO_LETRA_POR_DEFECTO);
        configuracion.setEspaciadoLeading(valorODefecto(request.getEspaciadoLeading(), ESPACIADO_LEADING_POR_DEFECTO));
        configuracion.setEstructuraPreguntasJson(serializarEstructura(request.getEstructuraPreguntas()));
        configuracion.setMinutosAntesEntrega(valorORango(request.getMinutosAntesEntrega(), MINUTOS_ENTREGA_POR_DEFECTO, 0, 10080));
        configuracion.setHorasAntesGeneracion(valorORango(request.getHorasAntesGeneracion(), HORAS_GENERACION_POR_DEFECTO, 0, 720));
        configuracion.setHorasPostPatron(valorORango(request.getHorasPostPatron(), HORAS_PATRON_POR_DEFECTO, 0, 720));
        configuracion.setHorasAntesLista(valorORango(request.getHorasAntesLista(), HORAS_LISTA_POR_DEFECTO, 0, 720));
        configuracion.setHorasCandado72(valorORango(request.getHorasCandado72(), HORAS_CANDADO_POR_DEFECTO, 0, 720));
        configuracion.setActualizadoEn(LocalDateTime.now());
        configuracion.setActualizadoPor(usuarioValido(request.getActualizadoPor()));
        return mapear(repository.save(configuracion));
    }

    private ConfiguracionEvaluaciones configuracionDefecto() {
        ConfiguracionEvaluaciones configuracion = new ConfiguracionEvaluaciones();
        configuracion.setId(CONFIGURACION_ID);
        configuracion.setRatioEstudiantesPorVariante(RATIO_POR_DEFECTO);
        configuracion.setDuracionExamenVirtualMinutos(DURACION_VIRTUAL_POR_DEFECTO);
        configuracion.setCuentaRegresivaInicioVirtualSegundos(CUENTA_REGRESIVA_VIRTUAL_POR_DEFECTO);
        configuracion.setFormatoHoja(FORMATO_HOJA_POR_DEFECTO);
        configuracion.setTipoLetra(TIPO_LETRA_POR_DEFECTO);
        configuracion.setTamanoLetraPt(TAMANO_LETRA_POR_DEFECTO);
        configuracion.setEspaciadoLeading(ESPACIADO_LEADING_POR_DEFECTO);
        configuracion.setEstructuraPreguntasJson(serializarEstructura(null));
        configuracion.setMinutosAntesEntrega(MINUTOS_ENTREGA_POR_DEFECTO);
        configuracion.setHorasAntesGeneracion(HORAS_GENERACION_POR_DEFECTO);
        configuracion.setHorasPostPatron(HORAS_PATRON_POR_DEFECTO);
        configuracion.setHorasAntesLista(HORAS_LISTA_POR_DEFECTO);
        configuracion.setHorasCandado72(HORAS_CANDADO_POR_DEFECTO);
        configuracion.setActualizadoPor("ADMIN_EVALUACIONES");
        configuracion.setActualizadoEn(LocalDateTime.now());
        return configuracion;
    }

    private ConfiguracionEvaluacionesDto mapear(ConfiguracionEvaluaciones configuracion) {
        ConfiguracionEvaluacionesDto dto = new ConfiguracionEvaluacionesDto();
        dto.setRatioEstudiantesPorVariante(configuracion.getRatioEstudiantesPorVariante());
        dto.setDuracionExamenVirtualMinutos(configuracion.getDuracionExamenVirtualMinutos() != null
                ? configuracion.getDuracionExamenVirtualMinutos() : DURACION_VIRTUAL_POR_DEFECTO);
        dto.setCuentaRegresivaInicioVirtualSegundos(configuracion.getCuentaRegresivaInicioVirtualSegundos() != null
                ? configuracion.getCuentaRegresivaInicioVirtualSegundos() : CUENTA_REGRESIVA_VIRTUAL_POR_DEFECTO);
        dto.setFormatoHoja(valorODefecto(configuracion.getFormatoHoja(), FORMATO_HOJA_POR_DEFECTO));
        dto.setTipoLetra(valorODefecto(configuracion.getTipoLetra(), TIPO_LETRA_POR_DEFECTO));
        dto.setTamanoLetraPt(configuracion.getTamanoLetraPt() != null
                ? configuracion.getTamanoLetraPt() : TAMANO_LETRA_POR_DEFECTO);
        dto.setEspaciadoLeading(valorODefecto(configuracion.getEspaciadoLeading(), ESPACIADO_LEADING_POR_DEFECTO));
        dto.setEstructuraPreguntas(deserializarEstructura(configuracion.getEstructuraPreguntasJson()));
        dto.setMinutosAntesEntrega(valorORango(configuracion.getMinutosAntesEntrega(), MINUTOS_ENTREGA_POR_DEFECTO, 0, 10080));
        dto.setHorasAntesGeneracion(valorORango(configuracion.getHorasAntesGeneracion(), HORAS_GENERACION_POR_DEFECTO, 0, 720));
        dto.setHorasPostPatron(valorORango(configuracion.getHorasPostPatron(), HORAS_PATRON_POR_DEFECTO, 0, 720));
        dto.setHorasAntesLista(valorORango(configuracion.getHorasAntesLista(), HORAS_LISTA_POR_DEFECTO, 0, 720));
        dto.setHorasCandado72(valorORango(configuracion.getHorasCandado72(), HORAS_CANDADO_POR_DEFECTO, 0, 720));
        dto.setActualizadoEn(configuracion.getActualizadoEn());
        dto.setActualizadoPor(configuracion.getActualizadoPor());
        return dto;
    }

    private String usuarioValido(String usuario) {
        return usuario == null || usuario.isBlank() ? "ADMIN_EVALUACIONES" : usuario.trim();
    }

    private String valorODefecto(String valor, String defecto) {
        return valor == null || valor.isBlank() ? defecto : valor.trim();
    }

    private int valorORango(Integer valor, int defecto, int minimo, int maximo) {
        if (valor == null) return defecto;
        return Math.min(maximo, Math.max(minimo, valor));
    }

    private Map<String, ConfiguracionParcialDto> estructuraDefecto() {
        Map<String, ConfiguracionParcialDto> estructura = new LinkedHashMap<>();
        estructura.put("1P", parcial(30, 7, 16, 7));
        estructura.put("2P", parcial(30, 7, 16, 7));
        estructura.put("FINAL", parcial(60, 15, 30, 15));
        estructura.put("2DA_INSTANCIA", parcial(50, 10, 25, 15));
        return estructura;
    }

    private ConfiguracionParcialDto parcial(int total, int facil, int medio, int dificil) {
        ConfiguracionParcialDto dto = new ConfiguracionParcialDto();
        dto.setTotalPreguntas(total);
        dto.setFacil(facil);
        dto.setMedio(medio);
        dto.setDificil(dificil);
        return dto;
    }

    private Map<String, ConfiguracionParcialDto> normalizarEstructura(Map<String, ConfiguracionParcialDto> recibida) {
        Map<String, ConfiguracionParcialDto> resultado = estructuraDefecto();
        if (recibida == null) return resultado;
        for (Map.Entry<String, ConfiguracionParcialDto> entry : recibida.entrySet()) {
            String clave = normalizarClave(entry.getKey());
            ConfiguracionParcialDto valor = entry.getValue();
            if (!resultado.containsKey(clave) || valor == null) continue;
            int total = valorORango(valor.getTotalPreguntas(), resultado.get(clave).getTotalPreguntas(), 1, 1000);
            int facil = valorORango(valor.getFacil(), 0, 0, 1000);
            int medio = valorORango(valor.getMedio(), 0, 0, 1000);
            int dificil = valorORango(valor.getDificil(), 0, 0, 1000);
            if (facil + medio + dificil != total) {
                throw new IllegalArgumentException("La distribución de " + clave + " debe sumar el total de preguntas");
            }
            resultado.put(clave, parcial(total, facil, medio, dificil));
        }
        return resultado;
    }

    private String serializarEstructura(Map<String, ConfiguracionParcialDto> estructura) {
        try {
            return objectMapper.writeValueAsString(normalizarEstructura(estructura));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("No se pudo guardar la estructura de preguntas", exception);
        }
    }

    private Map<String, ConfiguracionParcialDto> deserializarEstructura(String json) {
        if (json == null || json.isBlank()) return estructuraDefecto();
        try {
            return normalizarEstructura(objectMapper.readValue(json, new TypeReference<Map<String, ConfiguracionParcialDto>>() {}));
        } catch (JsonProcessingException | RuntimeException exception) {
            return estructuraDefecto();
        }
    }

    private String normalizarClave(String clave) {
        if (clave == null) return "";
        return clave.toUpperCase()
                .replace("º", "")
                .replace("°", "")
                .replace(" ", "_")
                .replace("Á", "A")
                .replace("É", "E")
                .replace("Í", "I")
                .replace("Ó", "O")
                .replace("Ú", "U")
                .replace("2DA_INSTANCIA", "2DA_INSTANCIA");
    }
}
