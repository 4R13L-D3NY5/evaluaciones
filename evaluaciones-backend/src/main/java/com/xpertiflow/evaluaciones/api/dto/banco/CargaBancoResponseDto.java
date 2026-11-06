package com.xpertiflow.evaluaciones.api.dto.banco;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class CargaBancoResponseDto {

    private boolean exito;
    private String mensaje;
    private String bancoPreguntasId;
    private String rolExamenId;
    private String nuevoEstado;
    private Integer totalReactivos;
    private Integer facilesCount;
    private Integer mediasCount;
    private Integer dificilesCount;
    private Integer grupo1Count;
    private Integer grupo2Count;
    private Integer grupo3Count;
    private Boolean cuotasGruposAplicadas;
    private String hashSha256;
    private List<String> erroresValidacion;
}
