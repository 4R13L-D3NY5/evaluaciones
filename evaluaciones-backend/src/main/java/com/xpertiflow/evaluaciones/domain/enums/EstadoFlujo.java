package com.xpertiflow.evaluaciones.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum EstadoFlujo {
    PROGRAMADO("PROGRAMADO"),
    VALIDADO("VALIDADO"),
    GENERADO("GENERADO"),
    IMPRESO("IMPRESO"),
    ENTREGADO("ENTREGADO"),
    DEVUELTO("DEVUELTO"),
    PENDIENTE_NOTAS("PENDIENTE_NOTAS"),
    CALIFICADO("CALIFICADO"),
    SUSPENDIDO("SUSPENDIDO");

    private final String valor;

    EstadoFlujo(String valor) {
        this.valor = valor;
    }

    @JsonValue
    public String getValor() {
        return valor;
    }

    @JsonCreator
    public static EstadoFlujo fromValor(String valor) {
        for (EstadoFlujo e : values()) {
            if (e.valor.equalsIgnoreCase(valor)) {
                return e;
            }
        }
        throw new IllegalArgumentException("EstadoFlujo no válido: " + valor);
    }
}
