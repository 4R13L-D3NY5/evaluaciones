package com.xpertiflow.evaluaciones.api.dto.generacion;

import lombok.Data;

@Data
public class MapeoResultadoDto {

    private String codigoEstudiante;
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String letraVariante;
    private String hashControl;
    private String cuadernilloPdfPath;
}
