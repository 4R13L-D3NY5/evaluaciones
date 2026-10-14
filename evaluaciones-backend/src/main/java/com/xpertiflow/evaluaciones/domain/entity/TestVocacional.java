package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "sea_test_vocacional")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestVocacional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "lote_id", nullable = false, length = 100)
    private String loteId;

    @Column(name = "colegio", nullable = false, length = 250)
    private String colegio;

    @Column(name = "curso", nullable = false, length = 100)
    private String curso;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "sede", length = 100)
    private String sede;

    @Column(name = "gestion", length = 20)
    private String gestion;

    @Column(name = "municipio", length = 100)
    private String municipio;

    @Column(name = "nombre_completo", length = 250)
    private String nombreCompleto;

    @Column(name = "celular", length = 50)
    private String celular;

    @Column(name = "correo", length = 150)
    private String correo;

    @Column(name = "candidatos_nombre_json", columnDefinition = "TEXT")
    private String candidatosNombreJson;

    @Column(name = "candidatos_celular_json", columnDefinition = "TEXT")
    private String candidatosCelularJson;

    @Column(name = "candidatos_correo_json", columnDefinition = "TEXT")
    private String candidatosCorreoJson;

    @Column(name = "numeros_marcados_json", nullable = false, columnDefinition = "TEXT")
    private String numerosMarcadosJson;

    @Column(name = "total_marcados", nullable = false)
    @Builder.Default
    private Integer totalMarcados = 0;

    @Column(name = "codigo_holland", length = 20)
    private String codigoHolland;

    @Column(name = "facultad_sugerida", length = 150)
    private String facultadSugerida;

    @Column(name = "puntajes_riasec_json", columnDefinition = "TEXT")
    private String puntajesRiasecJson;

    @Column(name = "facultades_afinidad_json", columnDefinition = "TEXT")
    private String facultadesAfinidadJson;

    @Column(name = "carreras_sugeridas_json", columnDefinition = "TEXT")
    private String carrerasSugeridasJson;

    @Column(name = "archivo_nombre", length = 255)
    private String archivoNombre;

    @Column(name = "archivo_escaneado_path", columnDefinition = "TEXT")
    private String archivoEscaneadoPath;

    @Column(name = "imagen_preview_path", columnDefinition = "TEXT")
    private String imagenPreviewPath;

    @Column(name = "pagina_numero", nullable = false)
    @Builder.Default
    private Integer paginaNumero = 1;

    @Column(name = "estado", nullable = false, length = 50)
    @Builder.Default
    private String estado = "PROCESADO";

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "creado_por", length = 100)
    private String creadoPor;

    @CreationTimestamp
    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @UpdateTimestamp
    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;
}
