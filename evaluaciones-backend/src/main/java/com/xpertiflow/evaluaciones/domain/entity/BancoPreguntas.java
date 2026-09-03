package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sea_bancos_preguntas")
public class BancoPreguntas {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "rol_examen_id", length = 64)
    private String rolExamenId;

    @Column(name = "materia_codigo", length = 30, nullable = false)
    private String materiaCodigo;

    @Column(name = "materia_nombre", length = 150, nullable = false)
    private String materiaNombre;

    @Column(name = "grupo", length = 20, nullable = false)
    private String grupo;

    @Column(name = "tipo_parcial", length = 30, nullable = false)
    private String tipoParcial;

    @Column(name = "total_reactivos", nullable = false)
    private Integer totalReactivos = 60;

    @Column(name = "faciles_count", nullable = false)
    private Integer facilesCount = 15;

    @Column(name = "medias_count", nullable = false)
    private Integer mediasCount = 30;

    @Column(name = "dificiles_count", nullable = false)
    private Integer dificilesCount = 15;

    @Column(name = "nombre_archivo_excel", length = 255, nullable = false)
    private String nombreArchivoExcel;

    @Column(name = "hash_sha256_integridad", length = 128, nullable = false)
    private String hashSha256Integridad;

    /** Columna histórica. Se limpia durante la migración y ya no se utiliza. */
    @Column(name = "paquete_json_encriptado", columnDefinition = "TEXT")
    private String paqueteJsonEncriptado;

    @Column(name = "contenido_cifrado", columnDefinition = "TEXT")
    private String contenidoCifrado;

    @Column(name = "contenido_nonce", length = 64)
    private String contenidoNonce;

    @Column(name = "contenido_dek_envuelta", columnDefinition = "TEXT")
    private String contenidoDekEnvuelta;

    @Column(name = "contenido_kek_referencia", length = 150)
    private String contenidoKekReferencia;

    @Column(name = "contenido_kek_version", length = 30)
    private String contenidoKekVersion;

    @Column(name = "contenido_algoritmo", length = 40)
    private String contenidoAlgoritmo;

    @Column(name = "estado", length = 30, nullable = false)
    private String estado = "VALIDADO";

    @Column(name = "docente_aprobador", length = 150, nullable = false)
    private String docenteAprobador;

    @Column(name = "fecha_aprobacion", nullable = false)
    private LocalDateTime fechaAprobacion = LocalDateTime.now();

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;
}
