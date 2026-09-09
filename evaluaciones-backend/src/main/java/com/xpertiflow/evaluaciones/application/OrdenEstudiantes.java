package com.xpertiflow.evaluaciones.application;

import java.math.BigInteger;
import java.util.Comparator;
import java.util.Locale;

/**
 * Orden institucional para las nóminas de estudiantes.
 *
 * Los códigos normalmente son numéricos, pero se deja un respaldo
 * alfanumérico para no romper nóminas históricas o futuras.
 */
public final class OrdenEstudiantes {

    private OrdenEstudiantes() {
    }

    public static Comparator<String> comparadorCodigo() {
        return (izquierda, derecha) -> {
            String codigoIzquierda = normalizar(izquierda);
            String codigoDerecha = normalizar(derecha);

            boolean izquierdaNumerica = codigoIzquierda.matches("\\d+");
            boolean derechaNumerica = codigoDerecha.matches("\\d+");
            if (izquierdaNumerica && derechaNumerica) {
                int comparacionNumerica = new BigInteger(codigoIzquierda)
                        .compareTo(new BigInteger(codigoDerecha));
                if (comparacionNumerica != 0) {
                    return comparacionNumerica;
                }
                int comparacionLongitud = Integer.compare(codigoIzquierda.length(), codigoDerecha.length());
                if (comparacionLongitud != 0) {
                    return comparacionLongitud;
                }
            } else if (izquierdaNumerica != derechaNumerica) {
                return izquierdaNumerica ? -1 : 1;
            }

            return codigoIzquierda.toLowerCase(Locale.ROOT)
                    .compareTo(codigoDerecha.toLowerCase(Locale.ROOT));
        };
    }

    private static String normalizar(String codigo) {
        return codigo == null ? "" : codigo.trim();
    }
}
