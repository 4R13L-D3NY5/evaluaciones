package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocenteRatificacionMateriaDto {
    private Long id;
    private String gestion;
    private String sedeCodigo;
    private String carreraCodigo;
    private String materiaCodigo;
    private String materiaNombre;
    private String grupoCodigo;
    private String docenteCi;
    private String docenteNombre;

    // Notas oficiales
    private BigDecimal notaDirector;    // max 50 pts
    private BigDecimal notaEstudiantes; // max 50 pts
    private BigDecimal notaFinal;       // max 100 pts (suma Director + Estudiantes)

    // Estados
    private String estadoCalculado;     // RATIFICADO (>=71) o NO_RATIFICADO (<=70)
    private String estadoDefinitivo;    // RATIFICADO o NO_RATIFICADO (respetando override)

    // Auditoría de modificación
    private boolean esModificadoManualmente;
    private String modificadoPorUsuario;
    private String modificadoPorNombre;
    private String motivoModificacion;
    private LocalDateTime fechaModificacion;

    // Metadatos auxiliares de avance
    private boolean directorEvaluado;
    private int totalEstudiantesEvaluaron;
    private int totalEstudiantesMatriculados;
    private BigDecimal estudiantesParticipacionPorcentaje;
}
