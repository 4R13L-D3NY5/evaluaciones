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
public class AlcanceCarrera {

    @Column(name = "carrera_codigo", nullable = false, length = 50)
    private String codigo;

    @Column(name = "carrera_nombre", nullable = false, length = 180)
    private String nombre;

    public AlcanceCarrera(String codigo, String nombre) {
        this.codigo = codigo;
        this.nombre = nombre;
    }
}
