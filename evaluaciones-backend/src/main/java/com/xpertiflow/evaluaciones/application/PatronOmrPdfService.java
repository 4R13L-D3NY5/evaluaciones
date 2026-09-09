package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.PatronCalificadoResponseDto;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Genera una copia imprimible del patrón ya liberado para una evaluación
 * devuelta y habilitada para revisión de notas. El contenido llega a este servicio después de ser descifrado en
 * memoria por OmrProcesamientoService; nunca se persiste una copia adicional.
 */
@Service
public class PatronOmrPdfService {

    // Oficio horizontal: 13 x 8.5 pulgadas.
    private static final float PAGE_WIDTH = 936f;
    private static final float PAGE_HEIGHT = 612f;
    private static final float MARGIN = 32f;
    private static final float CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2f);
    private static final float ALTO_BLOQUE_VARIANTE = 119f;
    private static final float ALTO_FIRMA = 72f;
    private static final DateTimeFormatter FECHA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public byte[] generar(RolExamen rol, PatronCalificadoResponseDto patron) throws IOException {
        try (ByteArrayOutputStream salida = new ByteArrayOutputStream();
             PDDocument documento = new PDDocument()) {
            List<PatronCalificadoResponseDto.VariantePatronDto> variantes = patron.getVariantes() == null
                    ? List.of() : patron.getVariantes();
            PDPageContentStream contenido = null;
            float cursor = 0f;
            try {
                for (int indice = 0; indice < variantes.size(); indice++) {
                    PatronCalificadoResponseDto.VariantePatronDto variante = variantes.get(indice);
                    if (contenido == null || cursor + ALTO_BLOQUE_VARIANTE > PAGE_HEIGHT - MARGIN) {
                        if (contenido != null) contenido.close();
                        contenido = abrirPagina(documento);
                        cursor = documento.getNumberOfPages() == 1
                                ? dibujarCabecera(documento, contenido, rol, true)
                                : dibujarCabecera(documento, contenido, rol, false);
                    }
                    dibujarVariante(contenido, variante, cursor);
                    cursor += ALTO_BLOQUE_VARIANTE;
                }

                if (contenido == null || cursor + ALTO_FIRMA + 30f > PAGE_HEIGHT - MARGIN) {
                    if (contenido != null) contenido.close();
                    contenido = abrirPagina(documento);
                    cursor = dibujarCabecera(documento, contenido, rol, false);
                }
                dibujarFirmas(contenido, rol, cursor + 10f);
                texto(contenido, "Planilla oficial para firma y sello del docente",
                        MARGIN, PAGE_HEIGHT - 15f, PDType1Font.HELVETICA, 7, java.awt.Color.GRAY);
            } finally {
                if (contenido != null) contenido.close();
            }
            documento.save(salida);
            return salida.toByteArray();
        }
    }

    private PDPageContentStream abrirPagina(PDDocument documento) throws IOException {
        PDPage pagina = new PDPage(new PDRectangle(PAGE_WIDTH, PAGE_HEIGHT));
        documento.addPage(pagina);
        return new PDPageContentStream(documento, pagina);
    }

    private float dibujarCabecera(PDDocument documento, PDPageContentStream contenido,
                                  RolExamen rol, boolean completa) throws IOException {
        texto(contenido, "UNIVERSIDAD TÉCNICA PRIVADA COSMOS", MARGIN, 30,
                PDType1Font.HELVETICA_BOLD, 13, new java.awt.Color(55, 43, 125));
        texto(contenido, completa
                        ? "PATRÓN OFICIAL DE RESPUESTAS · PARA FIRMA Y SELLO"
                        : "PATRÓN OFICIAL DE RESPUESTAS · CONTINUACIÓN",
                MARGIN, 48, PDType1Font.HELVETICA_BOLD, 9, java.awt.Color.DARK_GRAY);
        dibujarLogo(documento, contenido);

        contenido.setStrokingColor(new java.awt.Color(55, 43, 125));
        contenido.setLineWidth(2f);
        contenido.moveTo(MARGIN, PAGE_HEIGHT - 58);
        contenido.lineTo(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 58);
        contenido.stroke();

        if (!completa) return 78f;

        texto(contenido, "Materia: " + seguro(rol.getMateriaCodigo()) + " - " + seguro(rol.getMateriaNombre()),
                MARGIN, 76, PDType1Font.HELVETICA_BOLD, 8, java.awt.Color.BLACK);
        texto(contenido, "Carrera: " + seguro(rol.getCarreraNombre()),
                MARGIN, 90, PDType1Font.HELVETICA, 8, java.awt.Color.BLACK);
        texto(contenido, "Grupo: " + seguro(rol.getGrupo()) + "   Parcial: "
                        + (rol.getTipoParcial() == null ? "-" : seguro(rol.getTipoParcial().getValor()))
                        + "   Fecha: " + (rol.getFechaDisplay() == null ? seguro(String.valueOf(rol.getFecha())) : seguro(rol.getFechaDisplay())),
                MARGIN, 104, PDType1Font.HELVETICA, 8, java.awt.Color.BLACK);
        return 116f;
    }

    private void dibujarVariante(PDPageContentStream contenido,
                                 PatronCalificadoResponseDto.VariantePatronDto variante,
                                 float top) throws IOException {
        texto(contenido, "VARIANTE " + seguro(variante.getLetra()) + " · "
                        + (variante.getTotalPreguntas() == null ? 0 : variante.getTotalPreguntas())
                        + " preguntas · Generado: " + FECHA_HORA.format(LocalDateTime.now()),
                MARGIN, top + 12, PDType1Font.HELVETICA_BOLD, 8, new java.awt.Color(55, 43, 125));
        dibujarTabla(contenido, variante, top + 22);
    }
    }

    private void dibujarFirmas(PDPageContentStream contenido, RolExamen rol, float top) throws IOException {
        float ancho = CONTENT_WIDTH;
        float alto = 72f;
        float yBottom = PAGE_HEIGHT - top - alto;
        contenido.setStrokingColor(new java.awt.Color(205, 214, 228));
        contenido.setLineWidth(0.8f);
        contenido.addRect(MARGIN, yBottom, ancho, alto);
        contenido.stroke();

        texto(contenido, "FIRMA DEL DOCENTE", MARGIN + 10, top + 17,
                PDType1Font.HELVETICA_BOLD, 8, new java.awt.Color(55, 43, 125));
        texto(contenido, seguro(rol.getDocenteNombre()), MARGIN + 10, top + 32,
                PDType1Font.HELVETICA, 8, java.awt.Color.DARK_GRAY);
        texto(contenido, "Firma y sello: ________________________", MARGIN + 10, top + 58,
                PDType1Font.HELVETICA, 8, java.awt.Color.BLACK);
    }

    private void dibujarLogo(PDDocument documento, PDPageContentStream contenido) throws IOException {
        for (Path ruta : rutasLogo()) {
            if (!Files.isRegularFile(ruta)) continue;
            try {
                PDImageXObject logo = PDImageXObject.createFromFileByContent(ruta.toFile(), documento);
                float ancho = 126f;
                float alto = ancho * logo.getHeight() / logo.getWidth();
                contenido.drawImage(logo, PAGE_WIDTH - MARGIN - ancho, 13f, ancho, alto);
                return;
            } catch (IOException ignored) {
                // El logo es decorativo; no debe impedir la impresión de la planilla.
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

    private void dibujarTabla(PDPageContentStream contenido,
                              PatronCalificadoResponseDto.VariantePatronDto variante,
                              float top) throws IOException {
        int total = variante.getTotalPreguntas() == null ? 0 : variante.getTotalPreguntas();
        Map<String, String> respuestas = variante.getRespuestas() == null ? Map.of() : variante.getRespuestas();
        int columnas = 15;
        int filas = Math.max(1, (int) Math.ceil(total / (double) columnas));
        float cellWidth = CONTENT_WIDTH / columnas;
        float rowHeight = 28f;
        float yBottom = PAGE_HEIGHT - top - (filas * rowHeight);

        contenido.setNonStrokingColor(new java.awt.Color(247, 248, 253));
        contenido.addRect(MARGIN, yBottom, CONTENT_WIDTH, filas * rowHeight);
        contenido.fill();
        contenido.setStrokingColor(new java.awt.Color(205, 214, 228));
        contenido.addRect(MARGIN, yBottom, CONTENT_WIDTH, filas * rowHeight);
        contenido.stroke();

        for (int columna = 1; columna < columnas; columna++) {
            float x = MARGIN + columna * cellWidth;
            contenido.moveTo(x, yBottom);
            contenido.lineTo(x, yBottom + filas * rowHeight);
        }
        for (int fila = 1; fila < filas; fila++) {
            float y = yBottom + fila * rowHeight;
            contenido.moveTo(MARGIN, y);
            contenido.lineTo(MARGIN + CONTENT_WIDTH, y);
        }
        contenido.stroke();

        for (int pregunta = 1; pregunta <= total; pregunta++) {
            int indice = pregunta - 1;
            int columna = indice % columnas;
            int fila = indice / columnas;
            float x = MARGIN + columna * cellWidth;
            float y = top + fila * rowHeight + 18;
            texto(contenido, pregunta + ".", x + 3, y, PDType1Font.HELVETICA_BOLD, 7, java.awt.Color.DARK_GRAY);
            texto(contenido, seguro(respuestas.getOrDefault(String.valueOf(pregunta), "—")),
                    x + cellWidth - 9, y, PDType1Font.HELVETICA_BOLD, 9, new java.awt.Color(55, 43, 125));
        }
    }

    private void texto(PDPageContentStream contenido, String valor, float x, float y,
                       PDType1Font fuente, float tamano, java.awt.Color color) throws IOException {
        contenido.beginText();
        contenido.setNonStrokingColor(color);
        contenido.setFont(fuente, tamano);
        contenido.newLineAtOffset(x, PAGE_HEIGHT - y);
        contenido.showText(seguro(valor));
        contenido.endText();
    }

    private String seguro(String valor) {
        if (valor == null || valor.isBlank()) return "-";
        return valor.replaceAll("[\\r\\n]+", " ").trim();
    }
}
