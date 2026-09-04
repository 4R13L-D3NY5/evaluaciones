package com.xpertiflow.evaluaciones.api.dto.banco;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class BancoPreguntasResponseDto {

    private String id;
    private String rolExamenId;
    private String materiaCodigo;
    private String materiaNombre;
    private String grupo;
    private String tipoParcial;
    private Integer totalReactivos;
    private Integer facilesCount;
    private Integer mediasCount;
    private Integer dificilesCount;
    private String nombreArchivoExcel;
    private String hashSha256Integridad;
    private String estado;
    private String docenteAprobador;
    private LocalDateTime fechaAprobacion;
}
