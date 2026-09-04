package com.xpertiflow.evaluaciones.api.dto.generacion;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DocumentoExamenDto {

    private String rolExamenId;
    private String variante;
    private String archivoPdfPath;
    private String nombreArchivo;
}
