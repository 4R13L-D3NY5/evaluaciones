package com.xpertiflow.evaluaciones.api.dto.testvocacional;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestVocacionalItemDto {

    private Long id;
    private String loteId;
    private String colegio;
    private String curso;
    private LocalDate fecha;
    private String sede;
    private String gestion;
    private String municipio;
    private String nombreCompleto;
    private String celular;
    private String correo;
    private List<String> candidatosNombre;
    private List<String> candidatosCelular;
    private List<String> candidatosCorreo;
    private List<Integer> numerosMarcados;
    private Integer totalMarcados;
    private String codigoHolland;
    private String facultadSugerida;
    private java.util.Map<String, DimensionRiasecDto> puntajesRiasec;
    private List<FacultadAfinidadDto> facultadesAfinidad;
    private List<CarreraSugeridaDto> carrerasSugeridas;
    private Integer paginaNumero;
    private String archivoNombre;
    private String imagenPreviewPath;
    private String estado;
    private String observaciones;
    private String creadoPor;
    private LocalDateTime creadoEn;
    private LocalDateTime actualizadoEn;
}
