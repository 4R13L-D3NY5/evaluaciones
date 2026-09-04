package com.xpertiflow.evaluaciones.api.dto.sincartilla;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class NotaDocenteItemDto {
    @NotBlank private String codigoEstudiante;
    @NotNull @DecimalMin("0.00") @DecimalMax("30.00") private BigDecimal notaSobre30;
}
