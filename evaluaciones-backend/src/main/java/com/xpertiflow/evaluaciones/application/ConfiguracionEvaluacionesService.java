package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.ConfiguracionEvaluacionesDto;
import com.xpertiflow.evaluaciones.domain.entity.ConfiguracionEvaluaciones;
import com.xpertiflow.evaluaciones.domain.repository.ConfiguracionEvaluacionesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ConfiguracionEvaluacionesService {

    private static final short CONFIGURACION_ID = 1;
    private static final int RATIO_POR_DEFECTO = 5;
    private static final int DURACION_VIRTUAL_POR_DEFECTO = 45;
    private static final String FORMATO_HOJA_POR_DEFECTO = "Oficio (Folio UNITEPC)";
    private static final String TIPO_LETRA_POR_DEFECTO = "Times New Roman";
    private static final int TAMANO_LETRA_POR_DEFECTO = 11;
    private static final String ESPACIADO_LEADING_POR_DEFECTO = "0.8em (línea) · 1.2em (pregunta)";

    private final ConfiguracionEvaluacionesRepository repository;

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
        configuracion.setFormatoHoja(valorODefecto(request.getFormatoHoja(), FORMATO_HOJA_POR_DEFECTO));
        configuracion.setTipoLetra(valorODefecto(request.getTipoLetra(), TIPO_LETRA_POR_DEFECTO));
        configuracion.setTamanoLetraPt(request.getTamanoLetraPt() != null
                ? request.getTamanoLetraPt() : TAMANO_LETRA_POR_DEFECTO);
        configuracion.setEspaciadoLeading(valorODefecto(request.getEspaciadoLeading(), ESPACIADO_LEADING_POR_DEFECTO));
        configuracion.setActualizadoEn(LocalDateTime.now());
        configuracion.setActualizadoPor(usuarioValido(request.getActualizadoPor()));
        return mapear(repository.save(configuracion));
    }

    private ConfiguracionEvaluaciones configuracionDefecto() {
        ConfiguracionEvaluaciones configuracion = new ConfiguracionEvaluaciones();
        configuracion.setId(CONFIGURACION_ID);
        configuracion.setRatioEstudiantesPorVariante(RATIO_POR_DEFECTO);
        configuracion.setDuracionExamenVirtualMinutos(DURACION_VIRTUAL_POR_DEFECTO);
        configuracion.setFormatoHoja(FORMATO_HOJA_POR_DEFECTO);
        configuracion.setTipoLetra(TIPO_LETRA_POR_DEFECTO);
        configuracion.setTamanoLetraPt(TAMANO_LETRA_POR_DEFECTO);
        configuracion.setEspaciadoLeading(ESPACIADO_LEADING_POR_DEFECTO);
        configuracion.setActualizadoPor("ADMIN_EVALUACIONES");
        configuracion.setActualizadoEn(LocalDateTime.now());
        return configuracion;
    }

    private ConfiguracionEvaluacionesDto mapear(ConfiguracionEvaluaciones configuracion) {
        ConfiguracionEvaluacionesDto dto = new ConfiguracionEvaluacionesDto();
        dto.setRatioEstudiantesPorVariante(configuracion.getRatioEstudiantesPorVariante());
        dto.setDuracionExamenVirtualMinutos(configuracion.getDuracionExamenVirtualMinutos() != null
                ? configuracion.getDuracionExamenVirtualMinutos() : DURACION_VIRTUAL_POR_DEFECTO);
        dto.setFormatoHoja(valorODefecto(configuracion.getFormatoHoja(), FORMATO_HOJA_POR_DEFECTO));
        dto.setTipoLetra(valorODefecto(configuracion.getTipoLetra(), TIPO_LETRA_POR_DEFECTO));
        dto.setTamanoLetraPt(configuracion.getTamanoLetraPt() != null
                ? configuracion.getTamanoLetraPt() : TAMANO_LETRA_POR_DEFECTO);
        dto.setEspaciadoLeading(valorODefecto(configuracion.getEspaciadoLeading(), ESPACIADO_LEADING_POR_DEFECTO));
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
}
