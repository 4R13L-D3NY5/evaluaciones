package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sea_cartillas_omr")
@Getter
@Setter
@NoArgsConstructor
public class CartillaOmr {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lote_id", nullable = false)
    private LoteCartillasOmr lote;

    @Column(name = "rol_examen_id", nullable = false, length = 64)
    private String rolExamenId;

    @Column(name = "numero_orden", nullable = false)
    private Integer numeroOrden;

    @Column(name = "codigo_materia", nullable = false, length = 30)
    private String codigoMateria;

    @Column(nullable = false, length = 20)
    private String grupo;

    @Column(name = "codigo_estudiante", nullable = false, length = 30)
    private String codigoEstudiante;

    @Column(name = "nombre_completo", nullable = false, length = 220)
    private String nombreCompleto;

    @Column(nullable = false, length = 20)
    private String estado = "GENERADA";

    @Column(name = "impresa_en")
    private LocalDateTime impresaEn;
}
