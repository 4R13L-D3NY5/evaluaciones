package com.xpertiflow.evaluaciones.api.controller;

import com.xpertiflow.evaluaciones.api.dto.reportes.ReporteCalidadResumenDto;
import com.xpertiflow.evaluaciones.api.dto.reportes.ReporteCoberturaBancosResumenDto;
import com.xpertiflow.evaluaciones.api.dto.reportes.ReporteConsolidadoOmrResumenDto;
import com.xpertiflow.evaluaciones.application.ReportesService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportesControllerTest {

    @Mock
    private ReportesService reportesService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ReportesController controller;

    @Test
    @DisplayName("Controlador: delega reporte de calidad con parámetros al servicio")
    void testObtenerReporteCalidad() {
        ReporteCalidadResumenDto mockDto = ReporteCalidadResumenDto.builder()
                .totalExamenes(10)
                .aprobadosDirectos(5)
                .build();

        when(reportesService.obtenerReporteCalidad("CBBA", "MED", "1er Parcial", "TODOS", "Anatomia", authentication))
                .thenReturn(mockDto);

        ResponseEntity<ReporteCalidadResumenDto> response = controller.obtenerReporteCalidad(
                "CBBA", "MED", "1er Parcial", "TODOS", "Anatomia", authentication);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isSameAs(mockDto);
        verify(reportesService).obtenerReporteCalidad("CBBA", "MED", "1er Parcial", "TODOS", "Anatomia", authentication);
    }

    @Test
    @DisplayName("Controlador: delega cobertura de bancos al servicio")
    void testObtenerCoberturaBancos() {
        ReporteCoberturaBancosResumenDto mockDto = ReporteCoberturaBancosResumenDto.builder()
                .totalMaterias(20)
                .porcentajeCobertura(80.0)
                .build();

        when(reportesService.obtenerCoberturaBancos("LPZ", "DER", "Final", authentication))
                .thenReturn(mockDto);

        ResponseEntity<ReporteCoberturaBancosResumenDto> response = controller.obtenerCoberturaBancos(
                "LPZ", "DER", "Final", authentication);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isSameAs(mockDto);
        verify(reportesService).obtenerCoberturaBancos("LPZ", "DER", "Final", authentication);
    }

    @Test
    @DisplayName("Controlador: delega consolidado OMR al servicio")
    void testObtenerConsolidadoOmr() {
        ReporteConsolidadoOmrResumenDto mockDto = ReporteConsolidadoOmrResumenDto.builder()
                .totalExamenesCalificados(8)
                .promedioGeneral(72.5)
                .build();

        when(reportesService.obtenerConsolidadoOmr("SCZ", "ODO", "2do Parcial", authentication))
                .thenReturn(mockDto);

        ResponseEntity<ReporteConsolidadoOmrResumenDto> response = controller.obtenerConsolidadoOmr(
                "SCZ", "ODO", "2do Parcial", authentication);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isSameAs(mockDto);
        verify(reportesService).obtenerConsolidadoOmr("SCZ", "ODO", "2do Parcial", authentication);
    }
}
