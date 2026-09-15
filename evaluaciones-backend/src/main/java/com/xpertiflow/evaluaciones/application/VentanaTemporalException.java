package com.xpertiflow.evaluaciones.application;

/**
 * Indica que una operación operativa todavía no está habilitada por la
 * configuración cronológica de evaluaciones.
 */
public class VentanaTemporalException extends RuntimeException {

    public VentanaTemporalException(String message) {
        super(message);
    }
}
