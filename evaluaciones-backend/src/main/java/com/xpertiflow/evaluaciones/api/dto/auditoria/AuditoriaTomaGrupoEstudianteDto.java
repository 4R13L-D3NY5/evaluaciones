package com.xpertiflow.evaluaciones.api.dto.auditoria;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaTomaGrupoEstudianteDto {

    private String studentCode;
    private String fullName;
    private String courseState;
    private String groupId;
    private String groupCode;
    private String syllabusCourseId;
    private String materiaNombre;
    private String carreraCodigo;
    private String carreraNombre;
    private String sedeNombre;
    private String docenteNombre;

    // Marcas temporales de la inscripción oficial en el SEA
    private OffsetDateTime enrollCreatedAt;
    private OffsetDateTime enrollUpdatedAt;

    // Datos del examen en nuestro sistema (si existe)
    private String rolExamenId;
    private String estadoExamen;
    private OffsetDateTime fechaGeneracionExamen;
    private OffsetDateTime fechaImpresionExamen;
    private String letraVariante;

    // Dictamen y análisis forense
    private String estadoForense; // REGULAR, TOMA_TARDIA, EXTEMPORANEO_POST_IMPRESION, SIN_EXAMEN_GENERADO
    private String nivelAlerta;   // SUCCESS, WARNING, DANGER, INFO
    private String mensajeForense;
    private Long diferenciaMinutosConGeneracion;

    // Peritaje de Calificaciones, Alteraciones de Notas y Reprogramaciones
    private BigDecimal notaSobre100;
    private BigDecimal notaSobre60;
    private String estadoCalificacion; // APROBADO, REPROBADO, AUSENTE, PENDIENTE
    private String origenCalificacion; // OMR_AUTOMATICO, EXAMEN_ORAL_REPROGRAMADO, AJUSTADO_MANUAL, DOCENTE_SIN_CARTILLA, PENDIENTE
    private Boolean esReprogramado;
    private String reprogramadoPor;
    private LocalDateTime fechaReprogramacion;
    private String motivoReprogramacion;
    private String comprobanteReprogramacion;
    private String observacionReprogramacion;
    private String procesadoPor;
    private LocalDateTime fechaProcesamiento;
    private Boolean modificadoManualmente;
    private String detalleAjusteManual;
}
