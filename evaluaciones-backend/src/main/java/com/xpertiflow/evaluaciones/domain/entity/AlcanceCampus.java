package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode
public class AlcanceCampus {

    @Column(name = "sede_codigo", nullable = false, length = 30)
    private String sedeCodigo;

    @Column(name = "sede_nombre", nullable = false, length = 150)
    private String sedeNombre;

    @Column(name = "campus_id", nullable = false, length = 100)
    private String campusId = "";

    @Column(name = "campus_codigo", nullable = false, length = 100)
    private String campusCodigo = "";

    @Column(name = "campus_nombre", nullable = false, length = 180)
    private String campusNombre;

    @Column(name = "habilitado", nullable = false)
    private boolean habilitado = true;

    public AlcanceCampus(String sedeCodigo, String sedeNombre, String campusId,
                         String campusCodigo, String campusNombre, boolean habilitado) {
        this.sedeCodigo = sedeCodigo;
        this.sedeNombre = sedeNombre;
        this.campusId = campusId == null ? "" : campusId;
        this.campusCodigo = campusCodigo == null ? "" : campusCodigo;
        this.campusNombre = campusNombre;
        this.habilitado = habilitado;
    }
}
