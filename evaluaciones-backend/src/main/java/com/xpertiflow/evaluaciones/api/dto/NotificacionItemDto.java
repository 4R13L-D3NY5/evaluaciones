package com.xpertiflow.evaluaciones.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificacionItemDto {
    private String id;
    private String tipo;
    private String titulo;
    private String materiaCodigo;
    private String materiaNombre;
    private String grupo;
    private String parcial;
    private String docenteNombre;
    private String mensaje;
    private String fecha;
    private String ruta;
    private Map<String, Object> queryParams;
    private String nivel;
    private String textoAccion;
    private Integer horasRestantes;
}
