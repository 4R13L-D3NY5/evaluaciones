package com.xpertiflow.evaluaciones.api.dto.sincartilla;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Builder
public class DocumentoSinCartillaResponseDto {
    private String id;
    private String rolExamenId;
    private String nombreArchivo;
    private String tipoArchivo;
    private Long tamanoBytes;
    private String hashSha256;
    private String cargadoPor;
    private LocalDateTime cargadoEn;
}
