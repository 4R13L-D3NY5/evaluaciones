package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.domain.entity.CartillaOmr;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Genera por separado la lista de estudiantes y la capa de datos que se
 * sobreimprime sobre la cartilla institucional ya preimpresa. No dibuja ni
 * reproduce la cartilla.
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
    private static final float CARRERA_Y = 22f;
    private static final float DATOS_X = 250f;
    // Ajuste de la segunda iteración: el código debe iniciar 10 puntos más
    // a la izquierda dentro de su casilla superior derecha.
    private static final float CODIGO_X = 315f;
    private static final float NOMBRE_X = 250f;
    // Desplazamiento vertical solicitado para todos los datos preimpresos:
    // cinco puntos hacia arriba respecto de la primera iteración.
    private static final float DATOS_Y = 88f;
    private static final float NOMBRE_Y = 120f;
    private static final float NOMBRE_TAMANO = 7.5f;
    private static final float CARRERA_TAMANO = 7.5f;
    private static final float MARGEN_NOMINA = 28f;
    private static final float ALTO_FILA_NOMINA = 23f;
    private static final int ESTUDIANTES_POR_PAGINA_NOMINA = 25;
    private static final DateTimeFormatter FECHA_HORA_NOMINA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final Color COLOR_PRIMARIO = new Color(55, 43, 125);
    private static final Color COLOR_SECUNDARIO = new Color(0, 126, 116);
    private static final Color COLOR_BORDE = new Color(205, 214, 228);
    private static final Color COLOR_FONDO_CABECERA = new Color(247, 248, 253);
    private static final Color COLOR_FILA_ALTERNADA = new Color(250, 251, 254);

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

    public byte[] generarListaBytes(RolExamen rol, List<CartillaOmr> cartillas) throws IOException {
        try (ByteArrayOutputStream salida = new ByteArrayOutputStream();
             PDDocument documento = new PDDocument()) {
            dibujarPaginasLista(documento, rol, cartillas);
            documento.save(salida);
            return salida.toByteArray();
        }
    }

    private void dibujarPaginasLista(PDDocument documento, RolExamen rol, List<CartillaOmr> cartillas)
            throws IOException {
        List<CartillaOmr> ordenadas = new ArrayList<>(cartillas);
        ordenadas.sort(Comparator.comparing(CartillaOmr::getNumeroOrden,
                Comparator.nullsLast(Comparator.naturalOrder())));

        if (ordenadas.isEmpty()) {
            PDPage pagina = new PDPage(new PDRectangle(PAGE_WIDTH, PAGE_HEIGHT));
            documento.addPage(pagina);
            try (PDPageContentStream contenido = new PDPageContentStream(documento, pagina)) {
                dibujarCabeceraLista(documento, contenido, rol, 0);
                textoDesdeArriba(contenido, "No hay estudiantes oficiales para este grupo.",
                        MARGEN_NOMINA, 150f, PDType1Font.HELVETICA, 10f);
            }
            return;
        }

        for (int inicio = 0; inicio < ordenadas.size(); inicio += ESTUDIANTES_POR_PAGINA_NOMINA) {
            int fin = Math.min(inicio + ESTUDIANTES_POR_PAGINA_NOMINA, ordenadas.size());
            PDPage pagina = new PDPage(new PDRectangle(PAGE_WIDTH, PAGE_HEIGHT));
            documento.addPage(pagina);
            try (PDPageContentStream contenido = new PDPageContentStream(documento, pagina)) {
                dibujarCabeceraLista(documento, contenido, rol, ordenadas.size());
                dibujarTablaLista(contenido, ordenadas.subList(inicio, fin));
                textoDesdeArriba(contenido,
                        "Lista oficial · Página " + (inicio / ESTUDIANTES_POR_PAGINA_NOMINA + 1)
                                + " de " + (int) Math.ceil(ordenadas.size() / (double) ESTUDIANTES_POR_PAGINA_NOMINA),
                        MARGEN_NOMINA, 812f, PDType1Font.HELVETICA, 7f);
            }
        }
    }

    private void dibujarCabeceraLista(PDDocument documento, PDPageContentStream contenido, RolExamen rol,
                                      int totalEstudiantes)
            throws IOException {
        dibujarLogo(documento, contenido);
        textoDesdeArriba(contenido, "LISTA DE ESTUDIANTES", 185f, 27f,
                PDType1Font.HELVETICA_BOLD, 15f);
        textoDesdeArriba(contenido, "NÓMINA OFICIAL · CONTROL DE ENTREGA",
                185f, 40f, PDType1Font.HELVETICA, 7.5f);
        contenido.setNonStrokingColor(COLOR_SECUNDARIO);
        contenido.addRect(MARGEN_NOMINA, PAGE_HEIGHT - 49f, PAGE_WIDTH - (MARGEN_NOMINA * 2f), 2.5f);
        contenido.fill();
        textoDesdeArriba(contenido, "CONTROL DE ENTREGA",
                PAGE_WIDTH - 166f, 30f, PDType1Font.HELVETICA_BOLD, 8f);

        float cajaX = MARGEN_NOMINA;
        float cajaY = 57f;
        float cajaAncho = PAGE_WIDTH - (MARGEN_NOMINA * 2f);
        float cajaAlto = 72f;
        contenido.setStrokingColor(COLOR_BORDE);
        contenido.setNonStrokingColor(COLOR_FONDO_CABECERA);
        contenido.addRect(cajaX, PAGE_HEIGHT - cajaY - cajaAlto, cajaAncho, cajaAlto);
        contenido.fill();
        contenido.setStrokingColor(COLOR_BORDE);
        contenido.addRect(cajaX, PAGE_HEIGHT - cajaY - cajaAlto, cajaAncho, cajaAlto);
        contenido.stroke();
        contenido.setNonStrokingColor(COLOR_PRIMARIO);
        contenido.addRect(cajaX, PAGE_HEIGHT - cajaY - cajaAlto, 4f, cajaAlto);
        contenido.fill();

        String sede = limitar(normalizar(rol.getSedeNombre()), 36);
        String carrera = limitar(normalizar(rol.getCarreraNombre()), 54);
        String materia = limitar(normalizar(rol.getMateriaCodigo()) + " - " + normalizar(rol.getMateriaNombre()), 72);
        String evaluacion = rol.getTipoParcial() == null ? "" : normalizar(rol.getTipoParcial().getValor());
        String fecha = rol.getFechaDisplay() != null && !rol.getFechaDisplay().isBlank()
                ? normalizar(rol.getFechaDisplay()) : String.valueOf(rol.getFecha());

        textoDesdeArriba(contenido, "SEDE: " + sede, cajaX + 14f, 72f,
                PDType1Font.HELVETICA_BOLD, 8.2f);
        textoDesdeArriba(contenido, "CARRERA: " + carrera, cajaX + 205f, 72f,
                PDType1Font.HELVETICA_BOLD, 8.2f);
        textoDesdeArriba(contenido, "MATERIA: " + materia, cajaX + 14f, 91f,
                PDType1Font.HELVETICA_BOLD, 8.2f);
        textoDesdeArriba(contenido,
                "GRUPO: " + normalizar(rol.getGrupo()) + "   EVALUACIÓN: " + evaluacion + "   FECHA: " + fecha,
                cajaX + 14f, 110f, PDType1Font.HELVETICA_BOLD, 8.2f);
        textoDesdeArriba(contenido, "TOTAL: " + totalEstudiantes + " estudiantes",
                cajaX + 14f, 128f, PDType1Font.HELVETICA, 8f);
        textoDesdeArriba(contenido, "Generado: " + FECHA_HORA_NOMINA.format(LocalDateTime.now()),
                PAGE_WIDTH - 180f, 128f, PDType1Font.HELVETICA, 7f);
    }

    private void dibujarLogo(PDDocument documento, PDPageContentStream contenido) throws IOException {
        for (Path ruta : rutasLogo()) {
            if (!Files.isRegularFile(ruta)) continue;
            try {
                PDImageXObject logo = PDImageXObject.createFromFileByContent(ruta.toFile(), documento);
                float ancho = 142f;
                float alto = ancho * logo.getHeight() / logo.getWidth();
                contenido.drawImage(logo, MARGEN_NOMINA, PAGE_HEIGHT - 12f - alto, ancho, alto);
                return;
            } catch (IOException ignored) {
                // La impresión no debe bloquearse si el recurso gráfico no está disponible.
            }
        }
    }

    private Set<Path> rutasLogo() {
        Set<Path> rutas = new LinkedHashSet<>();
        String configurada = System.getenv("PDF_LOGO_PATH");
        if (configurada != null && !configurada.isBlank()) rutas.add(Path.of(configurada));
        rutas.add(Path.of("/app/assets/logo_unitepc_clean.png"));
        rutas.add(Path.of("bases/logo_unitepc_clean.png"));
        rutas.add(Path.of("../bases/logo_unitepc_clean.png"));
        rutas.add(Path.of("evaluaciones-frontend/src/assets/logo_unitepc_clean.png"));
        rutas.add(Path.of("../evaluaciones-frontend/src/assets/logo_unitepc_clean.png"));
        return rutas;
    }

    private void dibujarTablaLista(PDPageContentStream contenido, List<CartillaOmr> cartillas)
            throws IOException {
        float tablaTop = 143f;
        float anchoTotal = PAGE_WIDTH - (MARGEN_NOMINA * 2f);
        float x = MARGEN_NOMINA;
        int filas = Math.max(1, cartillas.size());
        float altoTabla = (filas + 1) * ALTO_FILA_NOMINA;
        float yInferior = PAGE_HEIGHT - tablaTop - altoTabla;
        float codigoX = x + 38f;
        float estudianteX = x + 132f;
        float firmaX = x + 400f;

        contenido.setNonStrokingColor(new Color(41, 48, 92));
        contenido.addRect(x, yInferior + altoTabla - ALTO_FILA_NOMINA, anchoTotal, ALTO_FILA_NOMINA);
        contenido.fill();

        for (int indice = 0; indice < cartillas.size(); indice++) {
            if (indice % 2 == 1) {
                float filaY = yInferior + altoTabla - ALTO_FILA_NOMINA * (indice + 2);
                contenido.setNonStrokingColor(COLOR_FILA_ALTERNADA);
                contenido.addRect(x + 0.5f, filaY + 0.5f, anchoTotal - 1f, ALTO_FILA_NOMINA - 1f);
                contenido.fill();
            }
        }

        contenido.setStrokingColor(COLOR_BORDE);
        contenido.addRect(x, yInferior, anchoTotal, altoTabla);
        contenido.stroke();
        for (float lineaX : new float[]{codigoX, estudianteX, firmaX}) {
            contenido.moveTo(lineaX, yInferior);
            contenido.lineTo(lineaX, yInferior + altoTabla);
        }
        for (int fila = 1; fila <= filas + 1; fila++) {
            float y = yInferior + fila * ALTO_FILA_NOMINA;
            contenido.moveTo(x, y);
            contenido.lineTo(x + anchoTotal, y);
        }
        contenido.stroke();

        textoDesdeArribaBlanco(contenido, "N°", x + 10f, tablaTop + 16f,
                PDType1Font.HELVETICA_BOLD, 7.5f);
        textoDesdeArribaBlanco(contenido, "CÓDIGO", codigoX + 8f, tablaTop + 16f,
                PDType1Font.HELVETICA_BOLD, 7.5f);
        textoDesdeArribaBlanco(contenido, "ESTUDIANTE", estudianteX + 8f, tablaTop + 16f,
                PDType1Font.HELVETICA_BOLD, 7.5f);
        textoDesdeArribaBlanco(contenido, "FIRMA DEL ESTUDIANTE", firmaX + 8f, tablaTop + 16f,
                PDType1Font.HELVETICA_BOLD, 7.5f);

        for (int indice = 0; indice < cartillas.size(); indice++) {
            CartillaOmr cartilla = cartillas.get(indice);
            float y = tablaTop + ALTO_FILA_NOMINA * (indice + 1) + 15f;
            textoDesdeArriba(contenido, String.valueOf(cartilla.getNumeroOrden()), x + 10f, y,
                    PDType1Font.HELVETICA, 7.5f);
            textoDesdeArriba(contenido, limitar(normalizar(cartilla.getCodigoEstudiante()), 12), codigoX + 8f, y,
                    PDType1Font.HELVETICA_BOLD, 7.5f);
            textoDesdeArriba(contenido, limitar(normalizar(cartilla.getNombreCompleto()), 44), estudianteX + 8f, y,
                    PDType1Font.HELVETICA, 7.5f);
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

    private void textoDesdeArribaBlanco(PDPageContentStream contenido, String valor, float x, float yDesdeArriba,
                                        PDType1Font fuente, float tamanio) throws IOException {
        contenido.beginText();
        contenido.setNonStrokingColor(Color.WHITE);
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
