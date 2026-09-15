package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sea_historial_devoluciones_verificacion")
@Getter
@Setter
@NoArgsConstructor
public class HistorialVerificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rol_examen_id", nullable = false, length = 64)
    private String rolExamenId;

    @Column(name = "banco_preguntas_id", nullable = false, length = 64)
    private String bancoPreguntasId;

    @Column(name = "observaciones_generales", columnDefinition = "TEXT")
    private String observacionesGenerales;

    @Column(name = "observaciones_preguntas_json", columnDefinition = "TEXT")
    private String observacionesPreguntasJson;

    @Column(name = "verificado_por", length = 100)
    private String verificadoPor;

    @Column(name = "fecha_devolucion", nullable = false)
    private LocalDateTime fechaDevolucion;

    @Column(name = "contenido_cifrado", nullable = false, columnDefinition = "TEXT")
    private String contenidoCifrado;

    @Column(name = "contenido_nonce", nullable = false, length = 64)
    private String contenidoNonce;

    @Column(name = "contenido_dek_envuelta", nullable = false, columnDefinition = "TEXT")
    private String contenidoDekEnvuelta;

    @Column(name = "contenido_kek_referencia", nullable = false, length = 150)
    private String contenidoKekReferencia;

    @Column(name = "contenido_kek_version", nullable = false, length = 30)
    private String contenidoKekVersion;

    @Column(name = "contenido_algoritmo", nullable = false, length = 40)
    private String contenidoAlgoritmo;
}
