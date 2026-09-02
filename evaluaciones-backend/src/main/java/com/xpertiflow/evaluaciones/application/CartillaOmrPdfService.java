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
import java.io.ByteArrayOutputStream;
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
    // Campo oficial "Carrera:" de la cartilla preimpresa. Se ubica en la
    // franja superior, junto a la etiqueta, no en la casilla de identificación.
    private static final float CARRERA_X = 190f;
    private static final float CARRERA_Y = 24f;
    private static final float DATOS_X = 250f;
    // Ajuste de la segunda iteración: el código debe iniciar 10 puntos más
    // a la izquierda dentro de su casilla superior derecha.
    private static final float CODIGO_X = 315f;
    private static final float NOMBRE_X = 250f;
    // Desplazamiento vertical solicitado para todos los datos preimpresos:
    // cinco puntos hacia arriba respecto de la primera iteración.
    private static final float DATOS_Y = 90f;
    private static final float NOMBRE_Y = 120f;
    private static final float NOMBRE_TAMANO = 10.5f;
    private static final float CARRERA_TAMANO = 6.5f;

    public void generar(Path archivo, RolExamen rol, List<CartillaOmr> cartillas) throws IOException {
        Files.createDirectories(archivo.getParent());
        Files.write(archivo, generarBytes(rol, cartillas));
    }

    public byte[] generarBytes(RolExamen rol, List<CartillaOmr> cartillas) throws IOException {
        try (ByteArrayOutputStream salida = new ByteArrayOutputStream();
             PDDocument documento = new PDDocument()) {
            for (CartillaOmr cartilla : cartillas) {
                PDPage pagina = new PDPage(new PDRectangle(PAGE_WIDTH, PAGE_HEIGHT));
                documento.addPage(pagina);

                try (PDPageContentStream contenido = new PDPageContentStream(documento, pagina)) {
                    dibujarDatos(contenido, rol, cartilla);
                }
            }
            documento.save(salida);
            return salida.toByteArray();
        }
    }

    private void dibujarDatos(PDPageContentStream contenido, RolExamen rol, CartillaOmr cartilla) throws IOException {
        // Casilla superior izquierda: N°, materia y grupo en líneas separadas.
        // La etiqueta "CARRERA:" ya pertenece a la cartilla preimpresa; aquí
        // solo se agrega el nombre oficial del rol en el espacio superior.
        textoDesdeArriba(contenido, limitar(rol.getCarreraNombre(), 42),
                CARRERA_X, CARRERA_Y, PDType1Font.HELVETICA_BOLD, CARRERA_TAMANO);
        textoDesdeArriba(contenido, "N° " + cartilla.getNumeroOrden(),
                DATOS_X + 5f, DATOS_Y + 8f, PDType1Font.HELVETICA_BOLD, 7.2f);
        textoDesdeArriba(contenido, cartilla.getCodigoMateria(),
                DATOS_X + 5f, DATOS_Y + 15f, PDType1Font.HELVETICA_BOLD, 7.2f);
        textoDesdeArriba(contenido, "GRUPO " + cartilla.getGrupo(),
                DATOS_X + 5f, DATOS_Y + 22f, PDType1Font.HELVETICA_BOLD, 7.2f);

        // Casilla superior derecha: únicamente el código del estudiante.
        textoDesdeArriba(contenido, cartilla.getCodigoEstudiante(),
                CODIGO_X + 19f, DATOS_Y + 18f, PDType1Font.HELVETICA_BOLD, 22f);

        // Casilla inferior: únicamente el nombre completo del estudiante.
        // Se usa peso normal para reducir el ancho y evitar que nombres largos
        // se salgan de la casilla al imprimir.
        textoDesdeArriba(contenido, limitar(cartilla.getNombreCompleto(), 34),
                NOMBRE_X + 5f, NOMBRE_Y + 17f, PDType1Font.HELVETICA, NOMBRE_TAMANO);
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
