package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FichaOficialMateriaDocenteDto {

    // Identificación Académica
    private String gestion;
    private String sedeCodigo;
    private String sedeNombre;
    private String carreraCodigo;
    private String carreraNombre;
    private String materiaCodigo;
    private String materiaNombre;
    private String grupoCodigo;
    private String docenteCi;
    private String docenteNombre;

    // Componente 1: Evaluación del Director de Carrera (Máx. 50 Pts)
    private boolean directorEvaluado;
    private String directorRegistroId;
    private String directorCarreraNombre;
    private String directorEvaluadorNombre;
    private String directorEvaluadorRol;
    private String directorFechaEvaluacion;
    private String directorHoraEvaluacion;
    private String directorInstrumentoTitulo;
    private BigDecimal directorPuntajeActitudinal;
    private BigDecimal directorPuntajeProcedimental;
    private BigDecimal directorPuntajeCognitivo;
    private BigDecimal directorPuntajeTotal;
    private BigDecimal directorPuntos50;
    private String directorObservaciones;
    private String directorRetroalimentacion;
    @Builder.Default
    private List<EvaluacionDocenteRespuestaDto> directorRespuestas = new ArrayList<>();

    // Componente 2: Evaluación de los Estudiantes (Máx. 50 Pts)
    private int totalEstudiantesMatriculados;
    private int totalEstudiantesEvaluaron;
    private BigDecimal estudiantesParticipacionPorcentaje;
    private BigDecimal estudiantesPromedioPorcentaje;
    private BigDecimal estudiantesPuntos50;
    @Builder.Default
    private List<AreaPuntajeEstudianteDto> estudiantesPuntajePorAreas = new ArrayList<>();

    // Consolidado Institucional (100 Pts)
    private BigDecimal puntajeFinal100;
    private String estadoRatificacion; // RATIFICADO, NO_RATIFICADO
    private boolean ratificacionModificadaManualmente;
    private String ratificacionModificadoPor;
    private String ratificacionMotivo;

    // Observaciones de Terceros (Vicerrectores / Autoridades)
    @Builder.Default
    private List<ObservacionTerceroDto> observacionesTerceros = new ArrayList<>();

    // Firmantes Oficiales Institucionales
    @Builder.Default
    private List<FirmanteOficialDto> firmantesOficiales = new ArrayList<>();
}
