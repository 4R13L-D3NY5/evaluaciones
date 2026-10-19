package com.xpertiflow.evaluaciones.api.dto.sincronizacion;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscrepanciaGrupoItemDto {

    private String codigoEstudiante;
    private Long studentOldCode;
    private String nombreEstudiante;

    private String materiaCodigo;
    private String materiaNombre;
    private String sedeCodigo;
    private String carreraCodigo;
    private String tipoParcial;

    // Origen (donde rindió examen / donde tiene calificación actualmente)
    private String rolExamenOrigenId;
    private String grupoOrigen;
    private String seaGroupIdOrigen;

    // Destino (donde figura formalmente matriculado en el Gateway SEA)
    private String rolExamenDestinoId;
    private String grupoDestino;
    private String seaGroupIdDestino;

    // Calificación
    private BigDecimal notaSobre60;
    private BigDecimal notaSobre100;
    private Boolean esReprogramado;
    private String modalidad;

    // Estado de la discrepancia
    // LISTO_PARA_TRASLADAR, CONFLICTO_TIENE_NOTA_EN_DESTINO, NO_ENCONTRADO_EN_SEA
    private String estadoDiscrepancia;
    private String detalle;

    // Si ya existe nota en el grupo destino (conflicto)
    private BigDecimal notaExistenteDestino100;
}
