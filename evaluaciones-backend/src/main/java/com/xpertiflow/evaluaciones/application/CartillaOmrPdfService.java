package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.domain.entity.CartillaOmr;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.Normalizer;
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
    private static final String FUENTE_REGULAR = "/fonts/NotoSans-Regular.ttf";
    private static final String FUENTE_NEGRITA = "/fonts/NotoSans-Bold.ttf";
    // Campo oficial "Carrera:" de la cartilla preimpresa. Se ubica en la
    // franja superior, junto a la etiqueta, no en la casilla de identificación.
    private static final float CARRERA_X = 200f;
    private static final float CARRERA_Y = 27f;
    private static final float DATOS_X = 260f;
    // Ajuste de la segunda iteración: el código debe iniciar 10 puntos más
    // a la izquierda dentro de su casilla superior derecha.
    private static final float CODIGO_X = 325f;
    private static final float NOMBRE_X = 260f;
    // Desplazamiento vertical solicitado para todos los datos preimpresos:
    // cinco puntos hacia arriba respecto de la primera iteración.
    private static final float DATOS_Y = 88f;
    private static final float NOMBRE_Y = 115f;
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

    private record FuentesPdf(PDType0Font regular, PDType0Font bold) {}

    public void generar(Path archivo, RolExamen rol, List<CartillaOmr> cartillas) throws IOException {
        Files.createDirectories(archivo.getParent());
        Files.write(archivo, generarBytes(rol, cartillas));
    }

    public byte[] generarBytes(RolExamen rol, List<CartillaOmr> cartillas) throws IOException {
        try (ByteArrayOutputStream salida = new ByteArrayOutputStream();
             PDDocument documento = new PDDocument()) {
            FuentesPdf fuentes = cargarFuentes(documento);
            for (CartillaOmr cartilla : cartillas) {
                PDPage pagina = new PDPage(new PDRectangle(PAGE_WIDTH, PAGE_HEIGHT));
                documento.addPage(pagina);

                try (PDPageContentStream contenido = new PDPageContentStream(documento, pagina)) {
                    dibujarDatos(contenido, rol, cartilla, fuentes);
                }
            }
            documento.save(salida);
            return salida.toByteArray();
        }
    }

    public byte[] generarListaBytes(RolExamen rol, List<CartillaOmr> cartillas) throws IOException {
        try (ByteArrayOutputStream salida = new ByteArrayOutputStream();
             PDDocument documento = new PDDocument()) {
            FuentesPdf fuentes = cargarFuentes(documento);
            dibujarPaginasLista(documento, rol, cartillas, fuentes);
            documento.save(salida);
            return salida.toByteArray();
        }
    }

    private FuentesPdf cargarFuentes(PDDocument documento) throws IOException {
        return new FuentesPdf(cargarFuente(documento, FUENTE_REGULAR), cargarFuente(documento, FUENTE_NEGRITA));
    }

    private PDType0Font cargarFuente(PDDocument documento, String recurso) throws IOException {
        InputStream fuente = CartillaOmrPdfService.class.getResourceAsStream(recurso);
        if (fuente == null) {
            throw new IOException("No se encontró la fuente PDF requerida: " + recurso);
        }
        try (fuente) {
            return PDType0Font.load(documento, fuente);
        }
    }

    private void dibujarPaginasLista(PDDocument documento, RolExamen rol, List<CartillaOmr> cartillas,
                                     FuentesPdf fuentes)
            throws IOException {
        List<CartillaOmr> ordenadas = new ArrayList<>(cartillas);
        ordenadas.sort(Comparator.comparing(CartillaOmr::getNumeroOrden,
                Comparator.nullsLast(Comparator.naturalOrder())));

        if (ordenadas.isEmpty()) {
            PDPage pagina = new PDPage(new PDRectangle(PAGE_WIDTH, PAGE_HEIGHT));
            documento.addPage(pagina);
            try (PDPageContentStream contenido = new PDPageContentStream(documento, pagina)) {
                dibujarCabeceraLista(documento, contenido, rol, 0, fuentes);
                textoDesdeArriba(contenido, "No hay estudiantes oficiales para este grupo.",
                        MARGEN_NOMINA, 150f, fuentes.regular(), 10f);
            }
            return;
        }

        for (int inicio = 0; inicio < ordenadas.size(); inicio += ESTUDIANTES_POR_PAGINA_NOMINA) {
            int fin = Math.min(inicio + ESTUDIANTES_POR_PAGINA_NOMINA, ordenadas.size());
            PDPage pagina = new PDPage(new PDRectangle(PAGE_WIDTH, PAGE_HEIGHT));
            documento.addPage(pagina);
            try (PDPageContentStream contenido = new PDPageContentStream(documento, pagina)) {
                dibujarCabeceraLista(documento, contenido, rol, ordenadas.size(), fuentes);
                dibujarTablaLista(contenido, ordenadas.subList(inicio, fin), fuentes);
                textoDesdeArriba(contenido,
                        "Lista oficial · Página " + (inicio / ESTUDIANTES_POR_PAGINA_NOMINA + 1)
                                + " de " + (int) Math.ceil(ordenadas.size() / (double) ESTUDIANTES_POR_PAGINA_NOMINA),
                        MARGEN_NOMINA, 812f, fuentes.regular(), 7f);
            }
        }
    }

    private void dibujarCabeceraLista(PDDocument documento, PDPageContentStream contenido, RolExamen rol,
                                      int totalEstudiantes, FuentesPdf fuentes)
            throws IOException {
        dibujarLogo(documento, contenido);
        textoDesdeArriba(contenido, "LISTA DE ESTUDIANTES", 185f, 27f,
                fuentes.bold(), 15f);
        textoDesdeArriba(contenido, "NÓMINA OFICIAL · CONTROL DE ENTREGA",
                185f, 40f, fuentes.regular(), 7.5f);
        contenido.setNonStrokingColor(COLOR_SECUNDARIO);
        contenido.addRect(MARGEN_NOMINA, PAGE_HEIGHT - 49f, PAGE_WIDTH - (MARGEN_NOMINA * 2f), 2.5f);
        contenido.fill();
        textoDesdeArriba(contenido, "CONTROL DE ENTREGA",
                PAGE_WIDTH - 166f, 30f, fuentes.bold(), 8f);

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
                fuentes.bold(), 8.2f);
        textoDesdeArriba(contenido, "CARRERA: " + carrera, cajaX + 205f, 72f,
                fuentes.bold(), 8.2f);
        textoDesdeArriba(contenido, "MATERIA: " + materia, cajaX + 14f, 91f,
                fuentes.bold(), 8.2f);
        textoDesdeArriba(contenido,
                "GRUPO: " + normalizar(rol.getGrupo()) + "   EVALUACIÓN: " + evaluacion + "   FECHA: " + fecha,
                cajaX + 14f, 110f, fuentes.bold(), 8.2f);
        textoDesdeArriba(contenido, "TOTAL: " + totalEstudiantes + " estudiantes",
                cajaX + 14f, 128f, fuentes.regular(), 8f);
        textoDesdeArriba(contenido, "Generado: " + FECHA_HORA_NOMINA.format(LocalDateTime.now()),
                PAGE_WIDTH - 180f, 128f, fuentes.regular(), 7f);
    }

    private void dibujarLogo(PDDocument documento, PDPageContentStream contenido) throws IOException {
        try (var is = getClass().getResourceAsStream("/assets/logo_unitepc_clean.png")) {
            if (is != null) {
                byte[] bytes = is.readAllBytes();
                PDImageXObject logo = PDImageXObject.createFromByteArray(documento, bytes, "logo");
                float ancho = 142f;
                float alto = ancho * logo.getHeight() / logo.getWidth();
                contenido.drawImage(logo, MARGEN_NOMINA, PAGE_HEIGHT - 12f - alto, ancho, alto);
                return;
            }
        } catch (Exception ignored) {
        }
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
        rutas.add(Path.of("assets/logo_unitepc_clean.png"));
        rutas.add(Path.of("logo_unitepc_clean.png"));
        rutas.add(Path.of("bases/logo_unitepc_clean.png"));
        rutas.add(Path.of("../bases/logo_unitepc_clean.png"));
        rutas.add(Path.of("evaluaciones-frontend/src/assets/logo_unitepc_clean.png"));
        rutas.add(Path.of("../evaluaciones-frontend/src/assets/logo_unitepc_clean.png"));
        return rutas;
    }

    private void dibujarTablaLista(PDPageContentStream contenido, List<CartillaOmr> cartillas,
                                   FuentesPdf fuentes)
            throws IOException {
        float tablaTop = 143f;
        float anchoTotal = PAGE_WIDTH - (MARGEN_NOMINA * 2f);
        float x = MARGEN_NOMINA;
        int filas = Math.max(1, cartillas.size());
        float altoTabla = (filas + 1) * ALTO_FILA_NOMINA;
        float yInferior = PAGE_HEIGHT - tablaTop - altoTabla;
        float codigoX = x + 38f;
        float estudianteX = x + 122f;
        float firmaX = x + 340f;
        float observacionesX = x + 455f;

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
        for (float lineaX : new float[]{codigoX, estudianteX, firmaX, observacionesX}) {
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
                fuentes.bold(), 7.5f);
        textoDesdeArribaBlanco(contenido, "CÓDIGO", codigoX + 8f, tablaTop + 16f,
                fuentes.bold(), 7.5f);
        textoDesdeArribaBlanco(contenido, "ESTUDIANTE", estudianteX + 8f, tablaTop + 16f,
                fuentes.bold(), 7.5f);
        textoDesdeArribaBlanco(contenido, "FIRMA DEL ESTUDIANTE", firmaX + 8f, tablaTop + 16f,
                fuentes.bold(), 7.5f);
        textoDesdeArribaBlanco(contenido, "OBSERVACIONES", observacionesX + 6f, tablaTop + 16f,
                fuentes.bold(), 7.5f);

        for (int indice = 0; indice < cartillas.size(); indice++) {
            CartillaOmr cartilla = cartillas.get(indice);
            float y = tablaTop + ALTO_FILA_NOMINA * (indice + 1) + 15f;
            textoDesdeArriba(contenido, String.valueOf(cartilla.getNumeroOrden()), x + 10f, y,
                    fuentes.regular(), 7.5f);
            textoDesdeArriba(contenido, limitar(normalizar(cartilla.getCodigoEstudiante()), 12), codigoX + 8f, y,
                    fuentes.bold(), 7.5f);
            textoAjustado(contenido, cartilla.getNombreCompleto(), estudianteX + 8f, y,
                    fuentes.regular(), 7.5f, firmaX - estudianteX - 16f);
            textoDesdeArriba(contenido, "________________", firmaX + 8f, y,
                    fuentes.regular(), 6.5f);
        }
    }

    private void dibujarDatos(PDPageContentStream contenido, RolExamen rol, CartillaOmr cartilla,
                              FuentesPdf fuentes) throws IOException {
        // Casilla superior izquierda: N°, materia y grupo en líneas separadas.
        // La etiqueta "CARRERA:" ya pertenece a la cartilla preimpresa; aquí
        // solo se agrega el nombre oficial del rol en el espacio superior.
        textoDesdeArriba(contenido, limitar(rol.getCarreraNombre(), 42),
                CARRERA_X, CARRERA_Y, fuentes.bold(), CARRERA_TAMANO);
        textoDesdeArriba(contenido, "N° " + cartilla.getNumeroOrden(),
                DATOS_X + 5f, DATOS_Y + 8f, fuentes.bold(), 7.2f);
        textoDesdeArriba(contenido, cartilla.getCodigoMateria(),
                DATOS_X + 5f, DATOS_Y + 15f, fuentes.bold(), 7.2f);
        textoDesdeArriba(contenido, "GRUPO " + cartilla.getGrupo(),
                DATOS_X + 5f, DATOS_Y + 22f, fuentes.bold(), 7.2f);

        // Casilla superior derecha: únicamente el código del estudiante.
        textoDesdeArriba(contenido, cartilla.getCodigoEstudiante(),
                CODIGO_X + 19f, DATOS_Y + 18f, fuentes.bold(), 22f);

        // Casilla inferior: únicamente el nombre completo del estudiante.
        // Se conserva el nombre completo y se reduce solo el tamaño si hace falta.
        textoAjustado(contenido, cartilla.getNombreCompleto(), NOMBRE_X + 5f, NOMBRE_Y + 17f,
                fuentes.regular(), NOMBRE_TAMANO, PAGE_WIDTH - NOMBRE_X - 20f);
    }

    private void textoDesdeArriba(PDPageContentStream contenido, String valor, float x, float yDesdeArriba,
                                  PDFont fuente, float tamanio) throws IOException {
        contenido.beginText();
        contenido.setNonStrokingColor(Color.BLACK);
        contenido.setFont(fuente, tamanio);
        contenido.newLineAtOffset(x, PAGE_HEIGHT - yDesdeArriba);
        contenido.showText(limpiarParaFuente(valor, fuente));
        contenido.endText();
    }

    private void textoDesdeArribaBlanco(PDPageContentStream contenido, String valor, float x, float yDesdeArriba,
                                        PDFont fuente, float tamanio) throws IOException {
        contenido.beginText();
        contenido.setNonStrokingColor(Color.WHITE);
        contenido.setFont(fuente, tamanio);
        contenido.newLineAtOffset(x, PAGE_HEIGHT - yDesdeArriba);
        contenido.showText(limpiarParaFuente(valor, fuente));
        contenido.endText();
    }

    private void textoAjustado(PDPageContentStream contenido, String valor, float x, float yDesdeArriba,
                               PDFont fuente, float tamanioBase, float anchoMaximo) throws IOException {
        String texto = limpiarParaFuente(valor, fuente);
        float anchoTexto = fuente.getStringWidth(texto) / 1000f * tamanioBase;
        float tamanio = anchoTexto <= anchoMaximo ? tamanioBase : tamanioBase * anchoMaximo / anchoTexto;
        textoDesdeArriba(contenido, texto, x, yDesdeArriba, fuente, Math.max(5.2f, tamanio));
    }

    private String limitar(String valor, int longitud) {
        String limpio = valor == null ? "" : valor.trim();
        return limpio.length() <= longitud ? limpio : limpio.substring(0, longitud - 1) + ".";
    }

    private String limpiarParaFuente(String valor, PDFont fuente) {
        String normalizado = normalizar(valor);
        if (normalizado.isEmpty() || fuente == null) {
            return normalizado;
        }
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < normalizado.length(); i++) {
            int codePoint = normalizado.codePointAt(i);
            String caracter = new String(Character.toChars(codePoint));
            try {
                fuente.encode(caracter);
                sb.append(caracter);
            } catch (Exception ignored) {
                sb.append("?");
            }
            if (Character.isSupplementaryCodePoint(codePoint)) {
                i++;
            }
        }
        return sb.toString();
    }

    private String normalizar(String valor) {
        if (valor == null) return "";
        String espaciosNormalizados = valor.replaceAll("\\s+", " ").trim();
        return Normalizer.normalize(espaciosNormalizados, Normalizer.Form.NFC);
    }
}
