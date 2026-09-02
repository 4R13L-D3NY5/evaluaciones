package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sea_notas_docentes", uniqueConstraints = @UniqueConstraint(
        name = "uq_nota_docente_estudiante", columnNames = {"rol_examen_id", "codigo_estudiante"}))
public class NotaDocente {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "rol_examen_id", nullable = false, length = 64) private String rolExamenId;
    @Column(name = "codigo_estudiante", nullable = false, length = 30) private String codigoEstudiante;
    @Column(name = "estudiante_nombre_completo", nullable = false, length = 200) private String estudianteNombreCompleto;
    @Column(name = "nota_sobre_30", nullable = false, precision = 5, scale = 2) private BigDecimal notaSobre30;
    @Column(name = "nota_sobre_100", nullable = false, precision = 5, scale = 2) private BigDecimal notaSobre100;
    @Column(name = "guardado_por", nullable = false, length = 100) private String guardadoPor;
    @Column(name = "guardado_en", nullable = false) private LocalDateTime guardadoEn = LocalDateTime.now();
}
