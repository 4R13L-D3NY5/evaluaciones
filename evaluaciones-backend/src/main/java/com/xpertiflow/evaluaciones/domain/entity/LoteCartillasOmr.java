package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "sea_lotes_cartillas_omr")
@Getter
@Setter
@NoArgsConstructor
public class LoteCartillasOmr {

    @Id
    @Column(length = 64)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rol_examen_id", nullable = false)
    private RolExamen rolExamen;

    @Column(nullable = false, length = 20)
    private String estado = "GENERADO";

    @Column(name = "total_cartillas", nullable = false)
    private Integer totalCartillas;

    @Column(name = "archivo_pdf_path", nullable = false, length = 255)
    private String archivoPdfPath;

    @CreationTimestamp
    @Column(name = "generado_en", nullable = false, updatable = false)
    private LocalDateTime generadoEn;

    @Column(name = "impreso_en")
    private LocalDateTime impresoEn;

    @Column(name = "usuario_impresion", length = 100)
    private String usuarioImpresion;
}
