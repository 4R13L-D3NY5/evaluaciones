package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sea_configuracion_evaluaciones")
@Getter
@Setter
@NoArgsConstructor
public class ConfiguracionEvaluaciones {

    @Id
    private Short id;

    @Column(name = "ratio_estudiantes_por_variante", nullable = false)
    private Integer ratioEstudiantesPorVariante;

    @Column(name = "duracion_examen_virtual_minutos", nullable = false)
    private Integer duracionExamenVirtualMinutos;

    @Column(name = "cuenta_regresiva_inicio_virtual_segundos", nullable = false)
    private Integer cuentaRegresivaInicioVirtualSegundos;

    @Column(name = "formato_hoja", nullable = false, length = 100)
    private String formatoHoja;

    @Column(name = "tipo_letra", nullable = false, length = 100)
    private String tipoLetra;

    @Column(name = "tamano_letra_pt", nullable = false)
    private Integer tamanoLetraPt;

    @Column(name = "espaciado_leading", nullable = false, length = 100)
    private String espaciadoLeading;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    @Column(name = "actualizado_por", nullable = false, length = 100)
    private String actualizadoPor;
}
