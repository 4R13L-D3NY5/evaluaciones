package com.xpertiflow.evaluaciones.api.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ConfiguracionOmrDto {
    @DecimalMin("40") @DecimalMax("95")
    private BigDecimal umbralDensidadMarca;

    @DecimalMin("1") @DecimalMax("50")
    private BigDecimal umbralDiferencialDoble;

    @Min(80) @Max(240)
    private Short umbralBinarioGrilla;

    @Min(40) @Max(220)
    private Short nivelTintaMarca;

    @DecimalMin("0") @DecimalMax("1")
    private BigDecimal zonaCodigoX;

    @DecimalMin("0") @DecimalMax("1")
    private BigDecimal zonaCodigoY;

    @DecimalMin("0.01") @DecimalMax("1")
    private BigDecimal zonaCodigoAncho;

    @DecimalMin("0.01") @DecimalMax("1")
    private BigDecimal zonaCodigoAlto;

    @DecimalMin("1") @DecimalMax("5")
    private BigDecimal escalaOcr;

    @Min(0) @Max(5)
    private Short radioBusquedaPixeles;

    private LocalDateTime actualizadoEn;

    private String actualizadoPor;
}
