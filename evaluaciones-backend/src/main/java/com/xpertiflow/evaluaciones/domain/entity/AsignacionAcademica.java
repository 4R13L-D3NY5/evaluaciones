package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Relación académica concreta asignada a una cuenta. La asignatura queda vacía
 * para directores de carrera y se completa para docentes.
 */
@Embeddable
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode
public class AsignacionAcademica {

    @Column(name = "sede_codigo", nullable = false, length = 30)
    private String sedeCodigo;

    @Column(name = "sede_nombre", nullable = false, length = 150)
    private String sedeNombre;

    @Column(name = "carrera_codigo", nullable = false, length = 50)
    private String carreraCodigo;

    @Column(name = "carrera_nombre", nullable = false, length = 180)
    private String carreraNombre;

    @Column(name = "asignatura_codigo", nullable = false, length = 50)
    private String asignaturaCodigo = "";

    @Column(name = "asignatura_nombre", nullable = false, length = 180)
    private String asignaturaNombre = "";

    public AsignacionAcademica(String sedeCodigo, String sedeNombre,
                               String carreraCodigo, String carreraNombre,
                               String asignaturaCodigo, String asignaturaNombre) {
        this.sedeCodigo = sedeCodigo;
        this.sedeNombre = sedeNombre;
        this.carreraCodigo = carreraCodigo;
        this.carreraNombre = carreraNombre;
        this.asignaturaCodigo = asignaturaCodigo == null ? "" : asignaturaCodigo;
        this.asignaturaNombre = asignaturaNombre == null ? "" : asignaturaNombre;
    }
}
