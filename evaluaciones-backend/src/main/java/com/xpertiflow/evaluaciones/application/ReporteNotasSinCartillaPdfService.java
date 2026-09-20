package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.sincartilla.NotaDocenteResponseDto;
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
 * Genera la planilla oficial de calificaciones para exámenes presenciales sin cartilla.
 * Incluye cabecera institucional UNITEPC, nómina de estudiantes con notas sobre 60 y 100,
 * y recuadros formales para firma/sello del docente y recepción de Evaluaciones.
 */
@Service
public class ReporteNotasSinCartillaPdfService {

    private static final float PAGE_WIDTH = 595f;
    private static final float PAGE_HEIGHT = 841f;
    private static final float MARGEN = 28f;
    private static final float ALTO_FILA = 22f;
    private static final float ALTO_FIRMAS = 78f;
    private static final int ESTUDIANTES_POR_PAGINA_COMPLETA = 22;
    private static final int ESTUDIANTES_CON_FIRMAS = 17;

    private static final String FUENTE_REGULAR = "/fonts/NotoSans-Regular.ttf";
    private static final String FUENTE_NEGRITA = "/fonts/NotoSans-Bold.ttf";
    private static final DateTimeFormatter FECHA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private static final Color COLOR_PRIMARIO = new Color(55, 43, 125);
    private static final Color COLOR_SECUNDARIO = new Color(0, 126, 116);
    private static final Color COLOR_BORDE = new Color(205, 214, 228);
    private static final Color COLOR_FONDO_CABECERA = new Color(247, 248, 253);
    private static final Color COLOR_FILA_ALTERNADA = new Color(250, 251, 254);
    private static final Color COLOR_CABECERA_TABLA = new Color(41, 48, 92);

    private record FuentesPdf(PDType0Font regular, PDType0Font bold) {}

    public byte[] generar(RolExamen rol, List<NotaDocenteResponseDto> notas) throws IOException {
        try (ByteArrayOutputStream salida = new ByteArrayOutputStream();
             PDDocument documento = new PDDocument()) {
            FuentesPdf fuentes = cargarFuentes(documento);

            List<NotaDocenteResponseDto> lista = new ArrayList<>(notas != null ? notas : List.of());
            lista.sort(Comparator.comparing(
                    NotaDocenteResponseDto::getCodigoEstudiante,
                    OrdenEstudiantes.comparadorCodigo()));

            if (lista.isEmpty()) {
                PDPage pagina = new PDPage(new PDRectangle(PAGE_WIDTH, PAGE_HEIGHT));
                documento.addPage(pagina);
                try (PDPageContentStream contenido = new PDPageContentStream(documento, pagina)) {
                    dibujarCabecera(documento, contenido, rol, 0, fuentes, 1, 1);
                    textoDesdeArriba(contenido, "No se registraron notas para este examen.",
                            MARGEN, 180f, fuentes.regular(), 10f, Color.DARK_GRAY);
                    dibujarFirmas(contenido, rol, 220f, fuentes);
                }
            } else {
                int total = lista.size();
                // Determinar paginación
                List<List<NotaDocenteResponseDto>> paginas = segmentar(lista);
                int totalPaginas = paginas.size();

                for (int i = 0; i < totalPaginas; i++) {
                    List<NotaDocenteResponseDto> estudiantesPagina = paginas.get(i);
                    boolean esUltimaPagina = (i == totalPaginas - 1);
                    int offsetIndice = calcularOffset(paginas, i);

                    PDPage pagina = new PDPage(new PDRectangle(PAGE_WIDTH, PAGE_HEIGHT));
                    documento.addPage(pagina);
                    try (PDPageContentStream contenido = new PDPageContentStream(documento, pagina)) {
                        float topY = 57f;
                        float altoCabecera = 82f;
                        dibujarCabecera(documento, contenido, rol, total, fuentes, i + 1, totalPaginas);

                        float tablaTop = topY + altoCabecera + 14f;
                        float tablaBottom = dibujarTabla(contenido, estudiantesPagina, tablaTop, fuentes, offsetIndice);

                        if (esUltimaPagina) {
                            float espacioRestante = PAGE_HEIGHT - tablaBottom - 30f;
                            float firmasTop = tablaBottom + 16f;
                            if (espacioRestante < ALTO_FIRMAS) {
                                // No alcanza en esta página, crear una página adicional de firmas
                                contenido.close();
                                PDPage paginaFirmas = new PDPage(new PDRectangle(PAGE_WIDTH, PAGE_HEIGHT));
                                documento.addPage(paginaFirmas);
                                try (PDPageContentStream contenidoFirmas = new PDPageContentStream(documento, paginaFirmas)) {
                                    dibujarCabecera(documento, contenidoFirmas, rol, total, fuentes, totalPaginas + 1, totalPaginas + 1);
                                    dibujarFirmas(contenidoFirmas, rol, 160f, fuentes);
                                    textoDesdeArriba(contenidoFirmas,
                                            "Planilla de calificaciones sin cartilla · Generado el " + FECHA_HORA.format(LocalDateTime.now()) + " · Sistema de Evaluaciones UNITEPC",
                                            MARGEN, 815f, fuentes.regular(), 6.8f, Color.GRAY);
                                }
                                break;
                            } else {
                                dibujarFirmas(contenido, rol, firmasTop, fuentes);
                            }
                        }

                        textoDesdeArriba(contenido,
                                "Planilla de calificaciones sin cartilla · Página " + (i + 1) + " de " + totalPaginas
                                        + " · Generado el " + FECHA_HORA.format(LocalDateTime.now()) + " · Documento oficial con firma y sello",
                                MARGEN, 815f, fuentes.regular(), 6.8f, Color.GRAY);
                    }
                }
            }

            documento.save(salida);
            return salida.toByteArray();
        }
    }

    private List<List<NotaDocenteResponseDto>> segmentar(List<NotaDocenteResponseDto> lista) {
        List<List<NotaDocenteResponseDto>> resultado = new ArrayList<>();
        int total = lista.size();
        if (total <= ESTUDIANTES_CON_FIRMAS) {
            resultado.add(lista);
            return resultado;
        }
        int indice = 0;
        while (indice < total) {
            int restantes = total - indice;
            int capacidad = (restantes <= ESTUDIANTES_CON_FIRMAS)
                    ? restantes
                    : (restantes <= ESTUDIANTES_POR_PAGINA_COMPLETA ? restantes : ESTUDIANTES_POR_PAGINA_COMPLETA);
            int fin = Math.min(indice + capacidad, total);
            resultado.add(lista.subList(indice, fin));
            indice = fin;
        }
        return resultado;
    }

    private int calcularOffset(List<List<NotaDocenteResponseDto>> paginas, int index) {
        int suma = 0;
        for (int k = 0; k < index; k++) {
            suma += paginas.get(k).size();
        }
        return suma;
    }

    private void dibujarCabecera(PDDocument doc, PDPageContentStream contenido, RolExamen rol,
                                 int totalEstudiantes, FuentesPdf fuentes, int numPagina, int totalPaginas) throws IOException {
        dibujarLogo(doc, contenido);

        textoDesdeArriba(contenido, "PLANILLA OFICIAL DE CALIFICACIONES", 175f, 25f, fuentes.bold(), 13.5f, COLOR_PRIMARIO);
        textoDesdeArriba(contenido, "EVALUACIÓN PRESENCIAL SIN CARTILLA · RESPALDO DE NÓMINA Y NOTAS", 175f, 38f, fuentes.regular(), 7f, Color.DARK_GRAY);

        // Barra decorativa
        contenido.setNonStrokingColor(COLOR_SECUNDARIO);
        contenido.addRect(MARGEN, PAGE_HEIGHT - 45f, PAGE_WIDTH - (MARGEN * 2f), 2.5f);
        contenido.fill();

        float cajaX = MARGEN;
        float cajaY = 52f;
        float cajaAncho = PAGE_WIDTH - (MARGEN * 2f);
        float cajaAlto = 82f;

        // Fondo y borde del cuadro
        contenido.setNonStrokingColor(COLOR_FONDO_CABECERA);
        contenido.addRect(cajaX, PAGE_HEIGHT - cajaY - cajaAlto, cajaAncho, cajaAlto);
        contenido.fill();
        contenido.setStrokingColor(COLOR_BORDE);
        contenido.addRect(cajaX, PAGE_HEIGHT - cajaY - cajaAlto, cajaAncho, cajaAlto);
        contenido.stroke();

        // Barra lateral del cuadro
        contenido.setNonStrokingColor(COLOR_PRIMARIO);
        contenido.addRect(cajaX, PAGE_HEIGHT - cajaY - cajaAlto, 4f, cajaAlto);
        contenido.fill();

        String sede = limitar(normalizar(rol.getSedeNombre()), 36);
        String carrera = limitar(normalizar(rol.getCarreraNombre()), 50);
        String materia = limitar(normalizar(rol.getMateriaCodigo()) + " - " + normalizar(rol.getMateriaNombre()), 68);
        String evaluacion = rol.getTipoParcial() == null ? "" : normalizar(rol.getTipoParcial().getValor());
        String fecha = rol.getFechaDisplay() != null && !rol.getFechaDisplay().isBlank()
                ? normalizar(rol.getFechaDisplay()) : String.valueOf(rol.getFecha());
        String docente = normalizar(rol.getDocenteNombre());
        if (docente.isBlank()) docente = "No asignado";

        textoDesdeArriba(contenido, "SEDE: " + sede, cajaX + 12f, 66f, fuentes.bold(), 7.8f, Color.BLACK);
        textoDesdeArriba(contenido, "CARRERA: " + carrera, cajaX + 195f, 66f, fuentes.bold(), 7.8f, Color.BLACK);
        textoDesdeArriba(contenido, "MATERIA: " + materia, cajaX + 12f, 82f, fuentes.bold(), 7.8f, Color.BLACK);
        textoDesdeArriba(contenido,
                "GRUPO: " + normalizar(rol.getGrupo()) + "   PARCIAL: " + evaluacion + "   FECHA: " + fecha,
                cajaX + 12f, 98f, fuentes.bold(), 7.8f, Color.BLACK);
        textoDesdeArriba(contenido, "DOCENTE TITULAR: " + docente, cajaX + 12f, 114f, fuentes.bold(), 7.8f, COLOR_PRIMARIO);
        textoDesdeArriba(contenido, "TOTAL: " + totalEstudiantes + " estudiantes oficiales",
                cajaX + 12f, 127f, fuentes.regular(), 7.2f, Color.DARK_GRAY);
        textoDesdeArriba(contenido, "Pág. " + numPagina + " / " + totalPaginas,
                PAGE_WIDTH - MARGEN - 60f, 127f, fuentes.regular(), 7.2f, Color.DARK_GRAY);
    }

    private float dibujarTabla(PDPageContentStream contenido, List<NotaDocenteResponseDto> notas,
                               float tablaTop, FuentesPdf fuentes, int offsetIndice) throws IOException {
        float anchoTotal = PAGE_WIDTH - (MARGEN * 2f);
        float x = MARGEN;
        int filas = Math.max(1, notas.size());
        float altoTabla = (filas + 1) * ALTO_FILA;
        float yInferior = PAGE_HEIGHT - tablaTop - altoTabla;

        float colCodigo = x + 35f;
        float colNombre = colCodigo + 85f;
        float colNota60 = colNombre + 259f;
        float colNota100 = colNota60 + 80f;

        // Cabecera oscura
        contenido.setNonStrokingColor(COLOR_CABECERA_TABLA);
        contenido.addRect(x, yInferior + altoTabla - ALTO_FILA, anchoTotal, ALTO_FILA);
        contenido.fill();

        // Filas alternadas
        for (int i = 0; i < notas.size(); i++) {
            if (i % 2 == 1) {
                float filaY = yInferior + altoTabla - ALTO_FILA * (i + 2);
                contenido.setNonStrokingColor(COLOR_FILA_ALTERNADA);
                contenido.addRect(x + 0.5f, filaY + 0.5f, anchoTotal - 1f, ALTO_FILA - 1f);
                contenido.fill();
            }
        }

        // Bordes de la tabla
        contenido.setStrokingColor(COLOR_BORDE);
        contenido.addRect(x, yInferior, anchoTotal, altoTabla);
        contenido.stroke();

        for (float lx : new float[]{colCodigo, colNombre, colNota60, colNota100}) {
            contenido.moveTo(lx, yInferior);
            contenido.lineTo(lx, yInferior + altoTabla);
        }
        for (int fila = 1; fila <= filas + 1; fila++) {
            float y = yInferior + fila * ALTO_FILA;
            contenido.moveTo(x, y);
            contenido.lineTo(x + anchoTotal, y);
        }
        contenido.stroke();

        // Texto cabecera
        textoDesdeArribaBlanco(contenido, "N°", x + 10f, tablaTop + 15f, fuentes.bold(), 7.2f);
        textoDesdeArribaBlanco(contenido, "CÓDIGO", colCodigo + 8f, tablaTop + 15f, fuentes.bold(), 7.2f);
        textoDesdeArribaBlanco(contenido, "APELLIDOS Y NOMBRES", colNombre + 8f, tablaTop + 15f, fuentes.bold(), 7.2f);
        textoDesdeArribaBlanco(contenido, "NOTA / 60", colNota60 + 16f, tablaTop + 15f, fuentes.bold(), 7.2f);
        textoDesdeArribaBlanco(contenido, "NOTA / 100", colNota100 + 14f, tablaTop + 15f, fuentes.bold(), 7.2f);

        // Filas con datos
        for (int i = 0; i < notas.size(); i++) {
            NotaDocenteResponseDto item = notas.get(i);
            float y = tablaTop + ALTO_FILA * (i + 1) + 15f;
            int numOrden = offsetIndice + i + 1;

            textoDesdeArriba(contenido, String.valueOf(numOrden), x + 10f, y, fuentes.regular(), 7.5f, Color.DARK_GRAY);
            textoDesdeArriba(contenido, normalizar(item.getCodigoEstudiante()), colCodigo + 8f, y, fuentes.bold(), 7.5f, Color.BLACK);
            textoAjustado(contenido, normalizar(item.getEstudianteNombreCompleto()), colNombre + 8f, y, fuentes.regular(), 7.5f, colNota60 - colNombre - 14f);

            String nota60Str = item.getNotaSobre60() != null ? item.getNotaSobre60().stripTrailingZeros().toPlainString() : "—";
            String nota100Str = item.getNotaSobre100() != null ? item.getNotaSobre100().stripTrailingZeros().toPlainString() : "—";

            textoDesdeArriba(contenido, nota60Str, colNota60 + 28f, y, fuentes.bold(), 8f, COLOR_PRIMARIO);
            textoDesdeArriba(contenido, nota100Str, colNota100 + 26f, y, fuentes.bold(), 8f, new Color(16, 107, 72));
        }

        return tablaTop + altoTabla;
    }

    private void dibujarFirmas(PDPageContentStream contenido, RolExamen rol, float topY, FuentesPdf fuentes) throws IOException {
        float cajaAncho = (PAGE_WIDTH - (MARGEN * 2f) - 16f) / 2f;
        float cajaAlto = ALTO_FIRMAS;
        float yBottom = PAGE_HEIGHT - topY - cajaAlto;

        // Caja 1: Docente
        float box1X = MARGEN;
        contenido.setNonStrokingColor(COLOR_FONDO_CABECERA);
        contenido.addRect(box1X, yBottom, cajaAncho, cajaAlto);
        contenido.fill();
        contenido.setStrokingColor(COLOR_BORDE);
        contenido.addRect(box1X, yBottom, cajaAncho, cajaAlto);
        contenido.stroke();
        contenido.setNonStrokingColor(COLOR_PRIMARIO);
        contenido.addRect(box1X, yBottom + cajaAlto - 18f, cajaAncho, 18f);
        contenido.fill();

        textoDesdeArribaBlanco(contenido, "FIRMA Y SELLO DEL DOCENTE EVALUADOR", box1X + 10f, topY + 12f, fuentes.bold(), 7.2f);
        String docente = normalizar(rol.getDocenteNombre());
        if (docente.isBlank()) docente = "Docente Titular";
        textoDesdeArriba(contenido, "Docente: " + limitar(docente, 42), box1X + 10f, topY + 30f, fuentes.regular(), 7.2f, Color.DARK_GRAY);
        textoDesdeArriba(contenido, "Firma y sello: ____________________________________", box1X + 10f, topY + 62f, fuentes.regular(), 7f, Color.BLACK);

        // Caja 2: Evaluaciones
        float box2X = MARGEN + cajaAncho + 16f;
        contenido.setNonStrokingColor(COLOR_FONDO_CABECERA);
        contenido.addRect(box2X, yBottom, cajaAncho, cajaAlto);
        contenido.fill();
        contenido.setStrokingColor(COLOR_BORDE);
        contenido.addRect(box2X, yBottom, cajaAncho, cajaAlto);
        contenido.stroke();
        contenido.setNonStrokingColor(COLOR_SECUNDARIO);
        contenido.addRect(box2X, yBottom + cajaAlto - 18f, cajaAncho, 18f);
        contenido.fill();

        textoDesdeArribaBlanco(contenido, "RECEPCIÓN UNIDAD DE EVALUACIONES", box2X + 10f, topY + 12f, fuentes.bold(), 7.2f);
        textoDesdeArriba(contenido, "Recibido por: ____________________________________", box2X + 10f, topY + 30f, fuentes.regular(), 7f, Color.DARK_GRAY);
        textoDesdeArriba(contenido, "Fecha de recepción: _____ / _____ / 2026", box2X + 10f, topY + 46f, fuentes.regular(), 7f, Color.DARK_GRAY);
        textoDesdeArriba(contenido, "Firma y sello de recepción: ________________________", box2X + 10f, topY + 62f, fuentes.regular(), 7f, Color.BLACK);
    }

    private void dibujarLogo(PDDocument doc, PDPageContentStream contenido) {
        try (var is = getClass().getResourceAsStream("/assets/logo_unitepc_clean.png")) {
            if (is != null) {
                byte[] bytes = is.readAllBytes();
                PDImageXObject logo = PDImageXObject.createFromByteArray(doc, bytes, "logo");
                float ancho = 135f;
                float alto = ancho * logo.getHeight() / logo.getWidth();
                contenido.drawImage(logo, MARGEN, PAGE_HEIGHT - 10f - alto, ancho, alto);
                return;
            }
        } catch (Exception ignored) {
        }
        for (Path ruta : rutasLogo()) {
            if (!Files.isRegularFile(ruta)) continue;
            try {
                PDImageXObject logo = PDImageXObject.createFromFileByContent(ruta.toFile(), doc);
                float ancho = 135f;
                float alto = ancho * logo.getHeight() / logo.getWidth();
                contenido.drawImage(logo, MARGEN, PAGE_HEIGHT - 10f - alto, ancho, alto);
                return;
            } catch (Exception ignored) {
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

    private FuentesPdf cargarFuentes(PDDocument documento) throws IOException {
        return new FuentesPdf(cargarFuente(documento, FUENTE_REGULAR), cargarFuente(documento, FUENTE_NEGRITA));
    }

    private PDType0Font cargarFuente(PDDocument documento, String recurso) throws IOException {
        InputStream fuente = ReporteNotasSinCartillaPdfService.class.getResourceAsStream(recurso);
        if (fuente == null) {
            throw new IOException("No se encontró la fuente PDF requerida: " + recurso);
        }
        try (fuente) {
            return PDType0Font.load(documento, fuente);
        }
    }

    private void textoDesdeArriba(PDPageContentStream contenido, String valor, float x, float yDesdeArriba,
                                  PDFont fuente, float tamanio, Color color) throws IOException {
        contenido.beginText();
        contenido.setNonStrokingColor(color);
        contenido.setFont(fuente, tamanio);
        contenido.newLineAtOffset(x, PAGE_HEIGHT - yDesdeArriba);
        contenido.showText(limpiarParaFuente(valor, fuente));
        contenido.endText();
    }

    private void textoDesdeArribaBlanco(PDPageContentStream contenido, String valor, float x, float yDesdeArriba,
                                        PDFont fuente, float tamanio) throws IOException {
        textoDesdeArriba(contenido, valor, x, yDesdeArriba, fuente, tamanio, Color.WHITE);
    }

    private void textoAjustado(PDPageContentStream contenido, String valor, float x, float yDesdeArriba,
                               PDFont fuente, float tamanioBase, float anchoMaximo) throws IOException {
        String texto = limpiarParaFuente(valor, fuente);
        float anchoTexto = fuente.getStringWidth(texto) / 1000f * tamanioBase;
        float tamanio = anchoTexto <= anchoMaximo ? tamanioBase : tamanioBase * anchoMaximo / anchoTexto;
        textoDesdeArriba(contenido, texto, x, yDesdeArriba, fuente, Math.max(5.2f, tamanio), Color.BLACK);
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
