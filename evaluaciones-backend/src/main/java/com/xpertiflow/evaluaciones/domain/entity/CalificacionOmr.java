package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "sea_calificaciones_omr")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CalificacionOmr {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rol_examen_id", nullable = false, length = 64)
    private String rolExamenId;

    @Column(name = "codigo_estudiante", nullable = false, length = 30)
    private String codigoEstudiante;

    @Column(name = "estudiante_nombre_completo", nullable = false, length = 200)
    private String estudianteNombreCompleto;

    @Column(name = "letra_variante", nullable = false, length = 4)
    private String letraVariante;

    @Column(name = "total_reactivos", nullable = false)
    private Integer totalReactivos;

    @Column(name = "aciertos", nullable = false)
    private Integer aciertos;

    @Column(name = "fallos", nullable = false)
    private Integer fallos;

    @Column(name = "blancos", nullable = false)
    private Integer blancos;

    @Column(name = "dobles_marcas", nullable = false)
    private Integer doblesMarcas;

    @Column(name = "nota_sobre_30", nullable = false, precision = 5, scale = 2)
    private BigDecimal notaSobre30;

    @Column(name = "nota_sobre_100", nullable = false, precision = 5, scale = 2)
    private BigDecimal notaSobre100;

    @Column(name = "estado_calificacion", nullable = false, length = 30)
    private String estadoCalificacion;

    @Column(name = "respuestas_detectadas_json", nullable = false, columnDefinition = "TEXT")
    private String respuestasDetectadasJson;

    @Column(name = "imagen_cartilla_anotada_path", length = 255)
    private String imagenCartillaAnotadaPath;

    @Column(name = "archivo_escaneado_path", length = 255)
    private String archivoEscaneadoPath;

    @Column(name = "procesado_por", nullable = false, length = 50)
    private String procesadoPor;

    @CreationTimestamp
    @Column(name = "fecha_procesamiento", nullable = false, updatable = false)
    private LocalDateTime fechaProcesamiento;
}
