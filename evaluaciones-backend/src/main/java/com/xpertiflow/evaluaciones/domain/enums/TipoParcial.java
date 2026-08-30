package com.xpertiflow.evaluaciones.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum TipoParcial {
    PRIMER_PARCIAL("1er Parcial"),
    SEGUNDO_PARCIAL("2do Parcial"),
    FINAL("Final"),
    SEGUNDA_INSTANCIA("2da Instancia");

    private final String valor;

    TipoParcial(String valor) {
        this.valor = valor;
    }

    @JsonValue
    public String getValor() {
        return valor;
    }

    @JsonCreator
    public static TipoParcial fromValor(String valor) {
        for (TipoParcial t : values()) {
            if (t.valor.equalsIgnoreCase(valor)) {
                return t;
            }
        }
        throw new IllegalArgumentException("TipoParcial no válido: " + valor);
    }
}
