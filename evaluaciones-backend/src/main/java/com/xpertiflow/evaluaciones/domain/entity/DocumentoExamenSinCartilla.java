package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sea_documentos_examen_sin_cartilla")
public class DocumentoExamenSinCartilla {
    @Id @Column(name = "id", length = 64) private String id;
    @Column(name = "rol_examen_id", nullable = false, unique = true, length = 64) private String rolExamenId;
    @Column(name = "nombre_archivo", nullable = false, length = 255) private String nombreArchivo;
    @Column(name = "tipo_archivo", nullable = false, length = 120) private String tipoArchivo;
    @Column(name = "tamano_bytes", nullable = false) private Long tamanoBytes;
    @Column(name = "hash_sha256", nullable = false, length = 128) private String hashSha256;
    @Column(name = "archivo_path", nullable = false, length = 500) private String archivoPath;
    @Column(name = "dek_envuelta", columnDefinition = "TEXT") private String dekEnvuelta;
    @Column(name = "nonce", length = 64) private String nonce;
    @Column(name = "kek_referencia", length = 255) private String kekReferencia;
    @Column(name = "kek_version", length = 32) private String kekVersion;
    @Column(name = "algoritmo_cifrado", length = 80) private String algoritmoCifrado;
    @Column(name = "archivo_cifrado", nullable = false) private boolean archivoCifrado;
    @Column(name = "cargado_por", nullable = false, length = 100) private String cargadoPor;
    @Column(name = "cargado_en", nullable = false) private LocalDateTime cargadoEn = LocalDateTime.now();
}
