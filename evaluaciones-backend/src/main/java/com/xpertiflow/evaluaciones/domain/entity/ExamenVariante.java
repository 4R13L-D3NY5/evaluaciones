package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "sea_examenes_variantes")
public class ExamenVariante {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "rol_examen_id", length = 64, nullable = false)
    private String rolExamenId;

    @Column(name = "letra_variante", length = 1, nullable = false)
    private String letraVariante;

    @Column(name = "nombre_variante", length = 20, nullable = false)
    private String nombreVariante;

    @Column(name = "semilla_permutacion", nullable = false)
    private Integer semillaPermutacion;

    @Column(name = "total_preguntas", nullable = false)
    private Integer totalPreguntas = 30;

    @Column(name = "cuota_faciles", nullable = false)
    private Integer cuotaFaciles = 7;

    @Column(name = "cuota_medias", nullable = false)
    private Integer cuotaMedias = 16;

    @Column(name = "cuota_dificiles", nullable = false)
    private Integer cuotaDificiles = 7;

    @Column(name = "patron_claves_json", nullable = false, columnDefinition = "TEXT")
    private String patronClavesJson;

    @Column(name = "orden_reactivos_ids_json", nullable = false, columnDefinition = "TEXT")
    private String ordenReactivosIdsJson;

    /** Contenido renderizable para modalidad virtual, sin respuestas correctas. */
    @Column(name = "contenido_virtual_json", columnDefinition = "TEXT")
    private String contenidoVirtualJson;

    @Column(name = "archivo_typst_path", length = 255)
    private String archivoTypstPath;

    @Column(name = "archivo_pdf_path", length = 255)
    private String archivoPdfPath;

    @Column(name = "archivo_remark_xlsx_path", length = 255)
    private String archivoRemarkXlsxPath;

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;
}
