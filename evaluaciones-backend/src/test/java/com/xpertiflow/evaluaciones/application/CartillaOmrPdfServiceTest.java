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
            org.junit.jupiter.api.Assertions.assertTrue(
                    documento.getPage(0).getResources().getXObjectNames().stream()
                            .anyMatch(nombre -> documento.getPage(0).getResources().isImageXObject(nombre)),
                    "La lista debe incluir el logo institucional");
        }
    }
}
