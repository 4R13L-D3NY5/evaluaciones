package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sea_configuracion_omr")
@Getter
@Setter
@NoArgsConstructor
public class ConfiguracionOmr {
    @Id
    private Short id;

    @Column(name = "umbral_densidad_marca", nullable = false, precision = 5, scale = 2)
    private BigDecimal umbralDensidadMarca;

    @Column(name = "umbral_diferencial_doble", nullable = false, precision = 5, scale = 2)
    private BigDecimal umbralDiferencialDoble;

    @Column(name = "umbral_binario_grilla", nullable = false)
    private Short umbralBinarioGrilla;

    @Column(name = "nivel_tinta_marca", nullable = false)
    private Short nivelTintaMarca;

    @Column(name = "zona_codigo_x", nullable = false, precision = 6, scale = 4)
    private BigDecimal zonaCodigoX;

    @Column(name = "zona_codigo_y", nullable = false, precision = 6, scale = 4)
    private BigDecimal zonaCodigoY;

    @Column(name = "zona_codigo_ancho", nullable = false, precision = 6, scale = 4)
    private BigDecimal zonaCodigoAncho;

    @Column(name = "zona_codigo_alto", nullable = false, precision = 6, scale = 4)
    private BigDecimal zonaCodigoAlto;

    @Column(name = "escala_ocr", nullable = false, precision = 4, scale = 2)
    private BigDecimal escalaOcr;

    @Column(name = "radio_busqueda_pixeles", nullable = false)
    private Short radioBusquedaPixeles;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    @Column(name = "actualizado_por", nullable = false, length = 100)
    private String actualizadoPor;
}
