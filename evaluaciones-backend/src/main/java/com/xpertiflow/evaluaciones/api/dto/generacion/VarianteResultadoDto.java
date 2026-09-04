package com.xpertiflow.evaluaciones.api.dto.generacion;

import lombok.Data;

@Data
public class VarianteResultadoDto {

    private String letra;
    private Integer semilla;
    private String patronClavesJson;
    private String ordenReactivosIdsJson;
    private String contenidoVirtualJson;
    private Integer totalPreguntas;
    private String contenidoCifrado;
    private String contenidoNonce;
    private String contenidoDekEnvuelta;
    private String contenidoKekReferencia;
    private String contenidoKekVersion;
    private String contenidoAlgoritmo;
    private String archivoPdfPath;
    private String archivoTypstPath;
    private String archivoRemarkXlsxPath;
}
