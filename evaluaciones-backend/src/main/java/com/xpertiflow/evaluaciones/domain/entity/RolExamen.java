package com.xpertiflow.evaluaciones.domain.entity;

import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.enums.TipoParcial;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sea_roles_evaluaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RolExamen {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "sea_group_id", length = 64)
    private String seaGroupId;

    @Column(name = "sea_syllabus_course_id", length = 64)
    private String seaSyllabusCourseId;

    @Column(name = "sede_codigo", length = 10, nullable = false)
    private String sedeCodigo;

    @Column(name = "sede_nombre", length = 100, nullable = false)
    private String sedeNombre;

    @Column(name = "carrera_codigo", length = 30, nullable = false)
    private String carreraCodigo;

    @Column(name = "carrera_nombre", length = 150, nullable = false)
    private String carreraNombre;

    @Column(name = "materia_codigo", length = 30, nullable = false)
    private String materiaCodigo;

    @Column(name = "materia_nombre", length = 150, nullable = false)
    private String materiaNombre;

    @Column(name = "semestre")
    private Integer semestre;

    @Column(name = "grupo", length = 20, nullable = false)
    private String grupo;

    @Column(name = "tipo_clase", length = 20)
    private String tipoClase;

    @Column(name = "docente_nombre", length = 150, nullable = false)
    private String docenteNombre;

    @Column(name = "docente_ci", length = 30)
    private String docenteCi;

    @Column(name = "tipo_parcial", nullable = false)
    private TipoParcial tipoParcial;

    @Column(name = "version", nullable = false)
    private Integer version;

    @Column(name = "modalidad", nullable = false)
    private ModalidadExamen modalidad;

    @Column(name = "con_cartilla")
    private Boolean conCartilla;

    @Column(name = "estado_flujo", nullable = false)
    private EstadoFlujo estadoFlujo;

    @Column(name = "semana")
    private Integer semana;

    @Column(name = "dia", length = 20)
    private String dia;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "fecha_display", length = 20)
    private String fechaDisplay;

    @Column(name = "horario", length = 50)
    private String horario;

    @Column(name = "aula", length = 50)
    private String aula;

    @Column(name = "campus", length = 100)
    private String campus;

    @Column(name = "estudiantes_inscritos_count")
    private Integer estudiantesInscritosCount;

    @Column(name = "variantes_generadas_count")
    private Integer variantesGeneradasCount;

    @Column(name = "hash_encriptacion", length = 128)
    private String hashEncriptacion;

    @Column(name = "fecha_validacion")
    private LocalDateTime fechaValidacion;

    @Column(name = "fecha_generacion")
    private LocalDateTime fechaGeneracion;

    @CreationTimestamp
    @Column(name = "creado_en", updatable = false)
    private LocalDateTime creadoEn;

    @UpdateTimestamp
    @Column(name = "actualizado_en")
    private LocalDateTime actualizadoEn;
}
