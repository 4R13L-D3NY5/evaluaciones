package com.xpertiflow.evaluaciones.api.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReprogramacionOmrRequestDto {

    @DecimalMin(value = "0.00", message = "La nota sobre 60 no puede ser negativa")
    @DecimalMax(value = "60.00", message = "La nota sobre 60 no puede ser mayor a 60")
    private BigDecimal notaSobre60;

    @DecimalMin(value = "0.00", message = "La nota sobre 100 no puede ser negativa")
    @DecimalMax(value = "100.00", message = "La nota sobre 100 no puede ser mayor a 100")
    private BigDecimal notaSobre100;

    @NotNull(message = "La fecha del examen reprogramado es obligatoria")
    private LocalDate fechaExamenReprogramado;

    @NotBlank(message = "El motivo o justificación de la reprogramación es obligatorio")
    @Size(min = 5, max = 500, message = "El motivo debe tener entre 5 y 500 caracteres")
    private String motivo;

    @Size(max = 100, message = "El número de comprobante o recibo no puede exceder 100 caracteres")
    private String comprobantePago;

    @Size(max = 1000, message = "Las observaciones no pueden exceder 1000 caracteres")
    private String observaciones;
}
