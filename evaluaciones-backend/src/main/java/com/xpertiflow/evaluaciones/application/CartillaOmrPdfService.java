package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.domain.entity.CartillaOmr;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/**
 * Genera únicamente la capa de datos que se sobreimprime sobre la cartilla
 * institucional ya preimpresa. No dibuja ni reproduce la cartilla.
 */
@Service
public class CartillaOmrPdfService {

    // La referencia escaneada tiene una página A4 (595 x 841 puntos). Las
    // coordenadas recibidas corresponden al sistema X/Y del documento, con
    // origen en la esquina superior izquierda.
    private static final float PAGE_WIDTH = 595f;
    private static final float PAGE_HEIGHT = 841f;
    private static final float DATOS_X = 250f;
    private static final float CODIGO_X = 315f;
    private static final float NOMBRE_X = 250f;
    private static final float DATOS_Y = 95f;
    private static final float NOMBRE_Y = 125f;

    public void generar(Path archivo, RolExamen rol, List<CartillaOmr> cartillas) throws IOException {
        Files.createDirectories(archivo.getParent());
        try (PDDocument documento = new PDDocument()) {
            for (CartillaOmr cartilla : cartillas) {
                PDPage pagina = new PDPage(new PDRectangle(PAGE_WIDTH, PAGE_HEIGHT));
                documento.addPage(pagina);

                try (PDPageContentStream contenido = new PDPageContentStream(documento, pagina)) {
                    dibujarDatos(contenido, cartilla);
                }
            }
            documento.save(archivo.toFile());
        }
    }

    private void dibujarDatos(PDPageContentStream contenido, CartillaOmr cartilla) throws IOException {
        // Casilla superior izquierda: N°, materia y grupo en líneas separadas.
        textoDesdeArriba(contenido, "N° " + cartilla.getNumeroOrden(),
                DATOS_X + 5f, DATOS_Y + 8f, PDType1Font.HELVETICA_BOLD, 7.2f);
        textoDesdeArriba(contenido, cartilla.getCodigoMateria(),
                DATOS_X + 5f, DATOS_Y + 15f, PDType1Font.HELVETICA_BOLD, 7.2f);
        textoDesdeArriba(contenido, "GRUPO " + cartilla.getGrupo(),
                DATOS_X + 5f, DATOS_Y + 22f, PDType1Font.HELVETICA_BOLD, 7.2f);

        // Casilla superior derecha: únicamente el código del estudiante.
        textoDesdeArriba(contenido, cartilla.getCodigoEstudiante(),
                CODIGO_X + 29f, DATOS_Y + 18f, PDType1Font.HELVETICA_BOLD, 22f);

        // Casilla inferior: únicamente el nombre completo del estudiante.
        textoDesdeArriba(contenido, limitar(cartilla.getNombreCompleto(), 34),
                NOMBRE_X + 5f, NOMBRE_Y + 17f, PDType1Font.HELVETICA_BOLD, 13.5f);
    }

    private void textoDesdeArriba(PDPageContentStream contenido, String valor, float x, float yDesdeArriba,
                                  PDType1Font fuente, float tamanio) throws IOException {
        contenido.beginText();
        contenido.setNonStrokingColor(Color.BLACK);
        contenido.setFont(fuente, tamanio);
        contenido.newLineAtOffset(x, PAGE_HEIGHT - yDesdeArriba);
        contenido.showText(normalizar(valor));
        contenido.endText();
    }

    private String limitar(String valor, int longitud) {
        String limpio = valor == null ? "" : valor.trim();
        return limpio.length() <= longitud ? limpio : limpio.substring(0, longitud - 1) + ".";
    }

    private String normalizar(String valor) {
        return valor == null ? "" : valor
                .replace("á", "a").replace("é", "e").replace("í", "i")
                .replace("ó", "o").replace("ú", "u")
                .replace("Á", "A").replace("É", "E").replace("Í", "I")
                .replace("Ó", "O").replace("Ú", "U")
                .replace("ñ", "n").replace("Ñ", "N");
    }
}
