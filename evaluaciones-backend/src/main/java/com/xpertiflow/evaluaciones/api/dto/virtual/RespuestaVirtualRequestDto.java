package com.xpertiflow.evaluaciones.api.dto.virtual;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
@Data
public class RespuestaVirtualRequestDto {
    @NotNull private Integer numeroPregunta;
    @NotNull private Integer reactivoId;
    @NotBlank private String respuesta;
}
