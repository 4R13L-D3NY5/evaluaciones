package com.xpertiflow.evaluaciones.domain.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum EstadoSolicitudModificacion {
    PENDIENTE("PENDIENTE"),
    APROBADA("APROBADA"),
    RECHAZADA("RECHAZADA"),
    CANCELADA("CANCELADA");

    private final String valor;

    EstadoSolicitudModificacion(String valor) {
        this.valor = valor;
    }

    @JsonValue
    public String getValor() {
        return valor;
    }

    @JsonCreator
    public static EstadoSolicitudModificacion fromValor(String valor) {
        for (EstadoSolicitudModificacion e : values()) {
            if (e.valor.equalsIgnoreCase(valor)) {
                return e;
            }
        }
        throw new IllegalArgumentException("EstadoSolicitudModificacion no válido: " + valor);
    }
}
