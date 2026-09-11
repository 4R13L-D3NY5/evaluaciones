package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.domain.entity.CartillaOmr;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.TipoParcial;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CartillaOmrPdfServiceTest {

    @Test
    void generaNominaCompletaParaUnGrupoDeCincuentaEstudiantes() throws IOException {
        RolExamen rol = RolExamen.builder()
                .sedeNombre("COCHABAMBA (CBA)")
                .carreraNombre("LICENCIATURA EN INGENIERIA DE SISTEMAS")
                .materiaCodigo("SIS-114")
                .materiaNombre("ALGEBRA")
                .grupo("TA-01")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .fecha(LocalDate.of(2026, 9, 3))
                .fechaDisplay("03/09/2026")
                .build();

        List<CartillaOmr> cartillas = new ArrayList<>();
        for (int indice = 1; indice <= 50; indice++) {
            CartillaOmr cartilla = new CartillaOmr();
            cartilla.setNumeroOrden(indice);
            cartilla.setCodigoMateria("SIS-114");
            cartilla.setGrupo("TA-01");
            cartilla.setCodigoEstudiante("2026" + String.format("%03d", indice));
            cartilla.setNombreCompleto("ESTUDIANTE DE PRUEBA " + indice);
            cartillas.add(cartilla);
        }

        CartillaOmrPdfService servicio = new CartillaOmrPdfService();
        byte[] marcas = servicio.generarBytes(rol, cartillas);
        byte[] lista = servicio.generarListaBytes(rol, cartillas);
        if (Boolean.getBoolean("pdf.qa")) {
            Files.write(Path.of("target/qa-marcas-omr.pdf"), marcas);
            Files.write(Path.of("target/qa-lista-estudiantes.pdf"), lista);
        }

        try (PDDocument documento = PDDocument.load(marcas)) {
            assertEquals(50, documento.getNumberOfPages(),
                    "Las marcas deben conservar una pagina OMR por estudiante");
        }
        try (PDDocument documento = PDDocument.load(lista)) {
            assertEquals(2, documento.getNumberOfPages(),
                    "La lista debe usar una columna y dividir 50 estudiantes en dos paginas");
            String texto = new PDFTextStripper().getText(documento);
            org.junit.jupiter.api.Assertions.assertTrue(texto.contains("LISTA DE ESTUDIANTES"));
            org.junit.jupiter.api.Assertions.assertTrue(texto.contains("FIRMA DEL ESTUDIANTE"));
            org.junit.jupiter.api.Assertions.assertTrue(texto.contains("OBSERVACIONES"));
            org.junit.jupiter.api.Assertions.assertTrue(
                    java.util.stream.StreamSupport.stream(documento.getPage(0).getResources().getXObjectNames().spliterator(), false)
                            .anyMatch(nombre -> documento.getPage(0).getResources().isImageXObject(nombre)),
                    "La lista debe incluir el logo institucional");
        }
    }

    @Test
    void generaPatronOficialImprimiblePorVariante() throws IOException {
        RolExamen rol = RolExamen.builder()
                .carreraNombre("LICENCIATURA EN INGENIERIA DE SISTEMAS")
                .materiaCodigo("SIS-114")
                .materiaNombre("ALGEBRA")
                .grupo("TA-01")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .fecha(LocalDate.of(2026, 9, 3))
                .fechaDisplay("03/09/2026")
                .build();

        var respuestas = new java.util.LinkedHashMap<String, String>();
        for (int pregunta = 1; pregunta <= 60; pregunta++) {
            respuestas.put(String.valueOf(pregunta), pregunta % 2 == 0 ? "B" : "A");
        }
        var variantes = new ArrayList<com.xpertiflow.evaluaciones.api.dto.PatronCalificadoResponseDto.VariantePatronDto>();
        for (char letra = 'A'; letra <= 'D'; letra++) {
            var variante = new com.xpertiflow.evaluaciones.api.dto.PatronCalificadoResponseDto.VariantePatronDto();
            variante.setLetra(String.valueOf(letra));
            variante.setTotalPreguntas(60);
            variante.setRespuestas(new java.util.LinkedHashMap<>(respuestas));
            var estudiante = new com.xpertiflow.evaluaciones.api.dto.PatronCalificadoResponseDto.EstudiantePatronDto();
            estudiante.setCodigoEstudiante("2026" + letra);
            estudiante.setNombreCompleto("ESTUDIANTE VARIANTE " + letra);
            variante.setEstudiantes(java.util.List.of(estudiante));
            variantes.add(variante);
        }
        var patron = new com.xpertiflow.evaluaciones.api.dto.PatronCalificadoResponseDto();
        patron.setRolExamenId("ROL-1");
        patron.setEstado("CALIFICADO");
        patron.setVariantes(variantes);

        byte[] pdf = new PatronOmrPdfService().generar(rol, patron);
        if (Boolean.getBoolean("pdf.qa")) Files.write(Path.of("target/qa-patron.pdf"), pdf);
        try (PDDocument documento = PDDocument.load(pdf)) {
            assertEquals(1, documento.getNumberOfPages());
            assertEquals(612f, documento.getPage(0).getMediaBox().getWidth());
            assertEquals(936f, documento.getPage(0).getMediaBox().getHeight());
            String texto = new PDFTextStripper().getText(documento);
            org.junit.jupiter.api.Assertions.assertTrue(texto.contains("PATRÓN OFICIAL"));
            org.junit.jupiter.api.Assertions.assertTrue(texto.contains("VARIANTE A"));
            org.junit.jupiter.api.Assertions.assertTrue(texto.contains("VARIANTE D"));
            org.junit.jupiter.api.Assertions.assertTrue(texto.contains("60 preguntas"));
            org.junit.jupiter.api.Assertions.assertTrue(texto.contains("ESTUDIANTES ASIGNADOS A LA VARIANTE"));
            org.junit.jupiter.api.Assertions.assertTrue(texto.contains("ESTUDIANTE VARIANTE A"));
            org.junit.jupiter.api.Assertions.assertTrue(texto.contains("FIRMA DEL DOCENTE"));
            org.junit.jupiter.api.Assertions.assertFalse(texto.contains("RECEPCIÓN DE EVALUACIONES"));
            org.junit.jupiter.api.Assertions.assertTrue(
                    java.util.stream.StreamSupport.stream(documento.getPage(0).getResources().getXObjectNames().spliterator(), false)
                            .anyMatch(nombre -> documento.getPage(0).getResources().isImageXObject(nombre)),
                    "La planilla debe incluir el logo institucional");
        }
    }
}
