package com.xpertiflow.evaluaciones.api.dto.evaluaciondocente;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocenteRatificacionMateriaDto {
    private Long id;
    private String gestion;
    private String sedeCodigo;
    private String carreraCodigo;
    private String materiaCodigo;
    private String materiaNombre;
    private String grupoCodigo;
    private String docenteCi;
    private String docenteNombre;

    // Notas oficiales
    private BigDecimal notaDirector;    // max 50 pts
    private BigDecimal notaEstudiantes; // max 50 pts
    private BigDecimal notaFinal;       // max 100 pts (suma Director + Estudiantes)

    // Estados
    private String estadoCalculado;     // RATIFICADO (>=71) o NO_RATIFICADO (<=70)
    private String estadoDefinitivo;    // RATIFICADO o NO_RATIFICADO (respetando override)

    // Auditoría de modificación
    private boolean esModificadoManualmente;
    private String modificadoPorUsuario;
    private String modificadoPorNombre;
    private String motivoModificacion;
    private LocalDateTime fechaModificacion;

    // Metadatos auxiliares de avance
    private boolean directorEvaluado;
    private int totalEstudiantesEvaluaron;
    private int totalEstudiantesMatriculados;
    private BigDecimal estudiantesParticipacionPorcentaje;

    // Compatibility getters & setters for frontend contracts
    @JsonProperty("notaDirector50")
    public BigDecimal getNotaDirector50() {
        return notaDirector;
    }

    @JsonProperty("notaDirector50")
    public void setNotaDirector50(BigDecimal val) {
        if (this.notaDirector == null) this.notaDirector = val;
    }

    @JsonProperty("notaEstudiantes50")
    public BigDecimal getNotaEstudiantes50() {
        return notaEstudiantes;
    }

    @JsonProperty("notaEstudiantes50")
    public void setNotaEstudiantes50(BigDecimal val) {
        if (this.notaEstudiantes == null) this.notaEstudiantes = val;
    }

    @JsonProperty("notaFinal100")
    public BigDecimal getNotaFinal100() {
        return notaFinal;
    }

    @JsonProperty("notaFinal100")
    public void setNotaFinal100(BigDecimal val) {
        if (this.notaFinal == null) this.notaFinal = val;
    }

    @JsonProperty("estadoFinal")
    public String getEstadoFinal() {
        return estadoDefinitivo != null ? estadoDefinitivo : estadoCalculado;
    }

    @JsonProperty("estadoFinal")
    public void setEstadoFinal(String val) {
        if (this.estadoDefinitivo == null) this.estadoDefinitivo = val;
    }

    @JsonProperty("modificadoManualmente")
    public boolean isModificadoManualmente() {
        return esModificadoManualmente;
    }

    @JsonProperty("modificadoManualmente")
    public void setModificadoManualmente(boolean val) {
        this.esModificadoManualmente = val;
    }

    @JsonProperty("modificadoPor")
    public String getModificadoPor() {
        return modificadoPorUsuario;
    }

    @JsonProperty("modificadoPor")
    public void setModificadoPor(String val) {
        if (this.modificadoPorUsuario == null) this.modificadoPorUsuario = val;
    }

    @JsonProperty("modificadoEn")
    public LocalDateTime getModificadoEn() {
        return fechaModificacion;
    }

    @JsonProperty("modificadoEn")
    public void setModificadoEn(LocalDateTime val) {
        if (this.fechaModificacion == null) this.fechaModificacion = val;
    }
}
