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
@Table(name = "sea_configuracion_respaldos")
@Getter
@Setter
@NoArgsConstructor
public class ConfiguracionRespaldos {
    @Id
    private Short id;

    @Column(nullable = false)
    private boolean activo;

    @Column(name = "frecuencia_minutos", nullable = false)
    private Integer frecuenciaMinutos;

    @Column(name = "retencion_dias", nullable = false)
    private Integer retencionDias;

    @Column(name = "destino_externo_configurado", nullable = false, length = 500)
    private String destinoExternoConfigurado;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    @Column(name = "actualizado_por", nullable = false, length = 100)
    private String actualizadoPor;
}
