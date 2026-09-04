package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sea_respaldos")
@Getter
@Setter
@NoArgsConstructor
public class Respaldo {
    @Id
    @Column(length = 64)
    private String id;

    @Column(nullable = false, length = 30)
    private String tipo;

    @Column(nullable = false, length = 40)
    private String estado;

    @Column(name = "snapshot_local_id", length = 255)
    private String snapshotLocalId;

    @Column(name = "snapshot_externo_id", length = 255)
    private String snapshotExternoId;

    @Column(name = "ruta_local", length = 500)
    private String rutaLocal;

    @Column(name = "ruta_externa", length = 500)
    private String rutaExterna;

    @Column(name = "tamano_bytes")
    private Long tamanoBytes;

    @Column(name = "archivos_count")
    private Integer archivosCount;

    @Column(name = "solicitado_por", nullable = false, length = 100)
    private String solicitadoPor;

    @Column(name = "solicitado_en", nullable = false)
    private LocalDateTime solicitadoEn;

    @Column(name = "iniciado_en")
    private LocalDateTime iniciadoEn;

    @Column(name = "finalizado_en")
    private LocalDateTime finalizadoEn;

    @Column(name = "externo_copiado_en")
    private LocalDateTime externoCopiadoEn;

    @Column(name = "verificado_en")
    private LocalDateTime verificadoEn;

    @Column(name = "local_eliminado_en")
    private LocalDateTime localEliminadoEn;

    @Column(name = "error_mensaje", columnDefinition = "TEXT")
    private String errorMensaje;

    @Column(name = "metadata_json", columnDefinition = "jsonb")
    private String metadataJson;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;
}
