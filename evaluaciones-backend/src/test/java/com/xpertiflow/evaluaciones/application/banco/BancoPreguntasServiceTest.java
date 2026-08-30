package com.xpertiflow.evaluaciones.application.banco;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.banco.CargaBancoResponseDto;
import com.xpertiflow.evaluaciones.application.RolExamenService;
import com.xpertiflow.evaluaciones.domain.entity.BancoPreguntas;
import com.xpertiflow.evaluaciones.domain.entity.Reactivo;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.TipoParcial;
import com.xpertiflow.evaluaciones.domain.repository.BancoPreguntasRepository;
import com.xpertiflow.evaluaciones.domain.repository.ReactivoRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BancoPreguntasServiceTest {

    @Mock
    private BancoPreguntasRepository bancoRepository;
    @Mock
    private ReactivoRepository reactivoRepository;
    @Mock
    private RolExamenRepository rolRepository;
    @Mock
    private RolExamenService rolExamenService;

    private BancoPreguntasService service;
    private RolExamen rol;

    @BeforeEach
    void setUp() {
        service = new BancoPreguntasService(
                bancoRepository,
                reactivoRepository,
                rolRepository,
                rolExamenService,
                new ObjectMapper());
        rol = RolExamen.builder()
                .id("ROL-BANCO-001")
                .materiaCodigo("PRD-314")
                .materiaNombre("Prótesis Dental")
                .grupo("TA-01")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .docenteNombre("Docente Oficial")
                .estadoFlujo(EstadoFlujo.PROGRAMADO)
                .build();
    }

    @Test
    void cargaValidaPersisteBancoSesentaReactivosYValidaElRol() throws Exception {
        MockMultipartFile archivo = crearExcel(60);
        when(rolRepository.findById(rol.getId())).thenReturn(Optional.of(rol));

        CargaBancoResponseDto respuesta = service.cargarDesdeExcel(
                rol.getId(), archivo, "Docente Oficial");

        assertThat(respuesta.isExito()).isTrue();
        assertThat(respuesta.getRolExamenId()).isEqualTo(rol.getId());
        assertThat(respuesta.getTotalReactivos()).isEqualTo(60);
        assertThat(respuesta.getFacilesCount()).isEqualTo(15);
        assertThat(respuesta.getMediasCount()).isEqualTo(30);
        assertThat(respuesta.getDificilesCount()).isEqualTo(15);
        assertThat(respuesta.getHashSha256()).hasSize(64);

        ArgumentCaptor<BancoPreguntas> banco = ArgumentCaptor.forClass(BancoPreguntas.class);
        verify(bancoRepository).save(banco.capture());
        assertThat(banco.getValue().getRolExamenId()).isEqualTo(rol.getId());
        assertThat(banco.getValue().getTotalReactivos()).isEqualTo(60);
        assertThat(banco.getValue().getEstado()).isEqualTo("VALIDADO");

        ArgumentCaptor<Reactivo> reactivo = ArgumentCaptor.forClass(Reactivo.class);
        verify(reactivoRepository, times(60)).save(reactivo.capture());
        List<Reactivo> reactivos = reactivo.getAllValues();
        assertThat(reactivos).extracting(Reactivo::getNumeroOrden)
                .containsExactlyElementsOf(java.util.stream.IntStream.rangeClosed(1, 60).boxed().toList());
        assertThat(reactivos).extracting(Reactivo::getBancoId).containsOnly(respuesta.getBancoPreguntasId());

        verify(rolExamenService).validarPorBanco(
                rol.getId(), respuesta.getHashSha256(), "Docente Oficial");
    }

    @Test
    void cargaInvalidaNoPersisteDatosNiCambiaElRol() throws Exception {
        MockMultipartFile archivo = crearExcel(59);
        when(rolRepository.findById(rol.getId())).thenReturn(Optional.of(rol));

        CargaBancoResponseDto respuesta = service.cargarDesdeExcel(
                rol.getId(), archivo, "Docente Oficial");

        assertThat(respuesta.isExito()).isFalse();
        assertThat(respuesta.getErroresValidacion()).anyMatch(error -> error.contains("Total de reactivos"));
        verify(bancoRepository, never()).save(any());
        verify(reactivoRepository, never()).save(any());
        verify(rolExamenService, never()).validarPorBanco(anyString(), anyString(), anyString());
    }

    @Test
    void aceptaLasEtiquetasOficialesDelExcelSinErroresDeTipo() throws Exception {
        String[] tiposOficiales = {
                "Selección de la mejor respuesta",
                "Verdadero o Falso Simple",
                "Respuesta A/B/Ambas/Ninguna",
                "Verdadero o Falso Complejas",
                "Subítem de caso o problema",
                "Opción de Emparejamiento Ampliado"
        };
        MockMultipartFile archivo = crearExcel(60, tiposOficiales);
        when(rolRepository.findById(rol.getId())).thenReturn(Optional.of(rol));

        CargaBancoResponseDto respuesta = service.cargarDesdeExcel(
                rol.getId(), archivo, "Docente Oficial");

        assertThat(respuesta.isExito()).isTrue();
        assertThat(respuesta.getErroresValidacion()).isEmpty();
        verify(reactivoRepository, times(60)).save(any(Reactivo.class));
    }

    private MockMultipartFile crearExcel(int totalFilas) throws Exception {
        return crearExcel(totalFilas, new String[]{"SELECCION_SIMPLE"});
    }

    private MockMultipartFile crearExcel(int totalFilas, String[] tipos) throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Banco");
            Row header = sheet.createRow(0);
            String[] columnas = {
                    "tipo", "grupo", "enunciado", "A", "B", "C", "D", "E",
                    "respuesta", "dificultad"
            };
            for (int columna = 0; columna < columnas.length; columna++) {
                header.createCell(columna).setCellValue(columnas[columna]);
            }

            for (int indice = 1; indice <= totalFilas; indice++) {
                Row row = sheet.createRow(indice);
                row.createCell(0).setCellValue(tipos[(indice - 1) % tipos.length]);
                row.createCell(1).setCellValue("Unidad " + indice);
                row.createCell(2).setCellValue("Pregunta oficial " + indice);
                row.createCell(3).setCellValue("Respuesta A");
                row.createCell(4).setCellValue("Respuesta B");
                row.createCell(5).setCellValue("Respuesta C");
                row.createCell(6).setCellValue("Respuesta D");
                row.createCell(7).setCellValue("Respuesta E");
                row.createCell(8).setCellValue("A");
                row.createCell(9).setCellValue(indice <= 15 ? 1 : indice <= 45 ? 2 : 3);
            }

            workbook.write(output);
            return new MockMultipartFile(
                    "file",
                    "banco-oficial.xlsx",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    output.toByteArray());
        }
    }
}
