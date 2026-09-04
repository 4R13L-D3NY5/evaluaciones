package com.xpertiflow.evaluaciones.api.dto.virtual;
import lombok.Data;
@Data
public class IntentoVirtualResponseDto {
    private String intentoId;
    private String estado;
    private Integer aciertos;
    private String notaSobre30;
    private String notaSobre100;
    private String enviadoEn;
}
