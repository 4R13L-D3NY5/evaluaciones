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
public class AlcanceSede {

    @Column(name = "sede_codigo", nullable = false, length = 30)
    private String codigo;

    @Column(name = "sede_nombre", nullable = false, length = 150)
    private String nombre;

    public AlcanceSede(String codigo, String nombre) {
        this.codigo = codigo;
        this.nombre = nombre;
    }
}
