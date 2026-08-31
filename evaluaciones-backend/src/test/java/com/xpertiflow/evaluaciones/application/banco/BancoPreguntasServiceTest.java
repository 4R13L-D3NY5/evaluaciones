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
    void cargaValidaAceptaReactivosPorEncimaDeLasCuotasMinimas() throws Exception {
        MockMultipartFile archivo = crearExcel(61);
        when(rolRepository.findById(rol.getId())).thenReturn(Optional.of(rol));

        CargaBancoResponseDto respuesta = service.cargarDesdeExcel(
                rol.getId(), archivo, "Docente Oficial");

        assertThat(respuesta.isExito()).isTrue();
        assertThat(respuesta.getTotalReactivos()).isEqualTo(61);
        assertThat(respuesta.getFacilesCount()).isEqualTo(15);
        assertThat(respuesta.getMediasCount()).isEqualTo(30);
        assertThat(respuesta.getDificilesCount()).isEqualTo(16);
        verify(reactivoRepository, times(61)).save(any(Reactivo.class));
    }

    @Test
    void cargaInvalidaNoPersisteDatosNiCambiaElRol() throws Exception {
        MockMultipartFile archivo = crearExcel(59);
        when(rolRepository.findById(rol.getId())).thenReturn(Optional.of(rol));

        CargaBancoResponseDto respuesta = service.cargarDesdeExcel(
                rol.getId(), archivo, "Docente Oficial");

        assertThat(respuesta.isExito()).isFalse();
        assertThat(respuesta.getErroresValidacion()).anyMatch(error -> error.contains("mínimo 60 reactivos"));
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
                "Verdadero o Falso Complejas"
        };
        MockMultipartFile archivo = crearExcel(60, tiposOficiales);
        when(rolRepository.findById(rol.getId())).thenReturn(Optional.of(rol));

        CargaBancoResponseDto respuesta = service.cargarDesdeExcel(
                rol.getId(), archivo, "Docente Oficial");

        assertThat(respuesta.isExito()).isTrue();
        assertThat(respuesta.getErroresValidacion()).isEmpty();
        verify(reactivoRepository, times(60)).save(any(Reactivo.class));
    }

    @Test
    void aceptaUnBloqueDeEmparejamientoConUnPrincipalYDosOpciones() throws Exception {
        MockMultipartFile archivo = crearExcelConBloqueEmparejamientoValido();
        when(rolRepository.findById(rol.getId())).thenReturn(Optional.of(rol));

        CargaBancoResponseDto respuesta = service.cargarDesdeExcel(
                rol.getId(), archivo, "Docente Oficial");

        assertThat(respuesta.isExito()).isTrue();
        assertThat(respuesta.getErroresValidacion()).isEmpty();
        verify(reactivoRepository, times(60)).save(any(Reactivo.class));
    }

    @Test
    void rechazaUnaOpcionDeEmparejamientoSinSuEnunciadoPrincipal() throws Exception {
        MockMultipartFile archivo = crearExcelConBloqueEmparejamientoValido();
        try (XSSFWorkbook workbook = new XSSFWorkbook(archivo.getInputStream());
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            workbook.getSheet("Banco").getRow(1).getCell(0).setCellValue("Opción de Emparejamiento Ampliado");
            workbook.write(output);
            archivo = new MockMultipartFile(
                    "file", "banco-sin-principal.xlsx",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    output.toByteArray());
        }
        when(rolRepository.findById(rol.getId())).thenReturn(Optional.of(rol));

        CargaBancoResponseDto respuesta = service.cargarDesdeExcel(
                rol.getId(), archivo, "Docente Oficial");

        assertThat(respuesta.isExito()).isFalse();
        assertThat(respuesta.getErroresValidacion())
                .anyMatch(error -> error.contains("necesita primero un enunciado principal"));
        verify(bancoRepository, never()).save(any());
        verify(reactivoRepository, never()).save(any());
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
                String tipo = tipos[(indice - 1) % tipos.length];
                row.createCell(0).setCellValue(tipo);
                row.createCell(1).setCellValue("Unidad " + indice);
                row.createCell(2).setCellValue("Pregunta oficial " + indice);
                boolean vfSimple = tipo.toUpperCase().contains("VERDADERO O FALSO SIMPLE");
                boolean vfCompleja = tipo.toUpperCase().contains("VERDADERO O FALSO COMPLEJ");
                boolean premisas = tipo.toUpperCase().contains("RESPUESTA A/B") || tipo.toUpperCase().contains("PREMISA");
                boolean emparejamiento = tipo.toUpperCase().contains("EMPAREJAMIENTO");
                boolean subitem = tipo.toUpperCase().contains("SUBÍTEM") || tipo.toUpperCase().contains("SUBITEM");
                boolean emparejamientoHijo = emparejamiento && !subitem;
                row.createCell(3).setCellValue(vfSimple ? "Verdadero" : emparejamientoHijo ? "" : "Respuesta A");
                row.createCell(4).setCellValue(vfSimple ? "Falso" : emparejamientoHijo ? "" : "Respuesta B");
                row.createCell(5).setCellValue(vfSimple || emparejamientoHijo ? "" : "Respuesta C");
                row.createCell(6).setCellValue(vfSimple || emparejamientoHijo ? "" : "Respuesta D");
                row.createCell(7).setCellValue(vfSimple || vfCompleja || premisas || emparejamientoHijo ? "" : "Respuesta E");
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

    private MockMultipartFile crearExcelConBloqueEmparejamientoValido() throws Exception {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Banco");
            String[] columnas = {
                    "tipo", "grupo", "enunciado", "A", "B", "C", "D", "E",
                    "respuesta", "dificultad"
            };
            Row header = sheet.createRow(0);
            for (int columna = 0; columna < columnas.length; columna++) {
                header.createCell(columna).setCellValue(columnas[columna]);
            }

            crearFila(sheet, 1, "Emparejamiento Ampliado", "EMP-01",
                    "Relaciona cada enunciado con el concepto correcto", "Clave A", "Clave B", "", "", "", "", "");
            crearFila(sheet, 2, "Opción de Emparejamiento Ampliado", "EMP-01",
                    "Primera relación", "", "", "", "", "", "A", "1");
            crearFila(sheet, 3, "Opción de Emparejamiento Ampliado", "EMP-01",
                    "Segunda relación", "", "", "", "", "", "B", "1");

            for (int indice = 4; indice <= 60; indice++) {
                int posicion = indice - 3;
                String dificultad = posicion <= 13 ? "1" : posicion <= 42 ? "2" : "3";
                crearFila(sheet, indice, "SELECCION_SIMPLE", "",
                        "Pregunta oficial " + indice, "Respuesta A", "Respuesta B", "Respuesta C", "Respuesta D", "Respuesta E", "A", dificultad);
            }

            workbook.write(output);
            return new MockMultipartFile(
                    "file", "bloque-emparejamiento.xlsx",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    output.toByteArray());
        }
    }

    private void crearFila(Sheet sheet, int fila, String tipo, String grupo, String enunciado,
                           String opcionA, String opcionB, String opcionC, String opcionD, String opcionE,
                           String respuesta, String dificultad) {
        Row row = sheet.createRow(fila);
        String[] valores = {tipo, grupo, enunciado, opcionA, opcionB, opcionC, opcionD, opcionE, respuesta, dificultad};
        for (int columna = 0; columna < valores.length; columna++) {
            row.createCell(columna).setCellValue(valores[columna]);
        }
    }
}
