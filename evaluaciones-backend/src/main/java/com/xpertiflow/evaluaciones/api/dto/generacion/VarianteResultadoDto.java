package com.xpertiflow.evaluaciones.api.dto.generacion;

import lombok.Data;

@Data
public class VarianteResultadoDto {

    private String letra;
    private Integer semilla;
    private String patronClavesJson;
    private String ordenReactivosIdsJson;
    private String contenidoVirtualJson;
    private String archivoPdfPath;
    private String archivoTypstPath;
    private String archivoRemarkXlsxPath;
}
