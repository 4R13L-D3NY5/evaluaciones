package com.xpertiflow.evaluaciones.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaGlobalItemDto {

    private String id;
    private String tipo;
    private String modulo;
    private String accion;
    private String codigoAccion;
    private String usuario;
    private String usuarioNombre;
    private String usuarioCargo;
    private String ipOrigen;
    private String campus;
    private String nivel;
    private String detallesJson;
    private LocalDateTime fechaEvento;
}
