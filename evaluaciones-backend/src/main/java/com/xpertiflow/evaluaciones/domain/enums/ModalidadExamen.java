package com.xpertiflow.evaluaciones.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum ModalidadExamen {
    PRESENCIAL_CARTILLA("PRESENCIAL_CARTILLA"),
    PRESENCIAL_SIN_CARTILLA("PRESENCIAL_SIN_CARTILLA"),
    VIRTUAL("VIRTUAL");

    private final String valor;

    ModalidadExamen(String valor) {
        this.valor = valor;
    }

    @JsonValue
    public String getValor() {
        return valor;
    }

    @JsonCreator
    public static ModalidadExamen fromValor(String valor) {
        for (ModalidadExamen m : values()) {
            if (m.valor.equalsIgnoreCase(valor)) {
                return m;
            }
        }
        throw new IllegalArgumentException("ModalidadExamen no válida: " + valor);
    }
}
