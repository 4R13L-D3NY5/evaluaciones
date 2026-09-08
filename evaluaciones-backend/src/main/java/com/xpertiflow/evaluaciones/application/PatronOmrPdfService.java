package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.PatronCalificadoResponseDto;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Genera una copia imprimible del patrón ya liberado para una evaluación
 * calificada. El contenido llega a este servicio después de ser descifrado en
 * memoria por OmrProcesamientoService; nunca se persiste una copia adicional.
 */
@Service
public class PatronOmrPdfService {

    private static final float PAGE_WIDTH = 595f;
    private static final float PAGE_HEIGHT = 842f;
    private static final float MARGIN = 32f;
    private static final float CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2f);
    private static final DateTimeFormatter FECHA_HORA = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public byte[] generar(RolExamen rol, PatronCalificadoResponseDto patron) throws IOException {
        try (ByteArrayOutputStream salida = new ByteArrayOutputStream();
             PDDocument documento = new PDDocument()) {
            List<PatronCalificadoResponseDto.VariantePatronDto> variantes = patron.getVariantes() == null
                    ? List.of() : patron.getVariantes();
            for (PatronCalificadoResponseDto.VariantePatronDto variante : variantes) {
                dibujarPagina(documento, rol, variante);
            }
            documento.save(salida);
            return salida.toByteArray();
        }
    }

    private void dibujarPagina(PDDocument documento, RolExamen rol,
                               PatronCalificadoResponseDto.VariantePatronDto variante) throws IOException {
        PDPage pagina = new PDPage(new PDRectangle(PAGE_WIDTH, PAGE_HEIGHT));
        documento.addPage(pagina);
        try (PDPageContentStream contenido = new PDPageContentStream(documento, pagina)) {
            texto(contenido, "UNIVERSIDAD TÉCNICA PRIVADA COSMOS", MARGIN, 34,
                    PDType1Font.HELVETICA_BOLD, 13, new java.awt.Color(55, 43, 125));
            texto(contenido, "PATRÓN OFICIAL DE RESPUESTAS · SOLO LECTURA", MARGIN, 53,
                    PDType1Font.HELVETICA_BOLD, 9, java.awt.Color.DARK_GRAY);

            contenido.setStrokingColor(new java.awt.Color(55, 43, 125));
            contenido.setLineWidth(2f);
            contenido.moveTo(MARGIN, PAGE_HEIGHT - 64);
            contenido.lineTo(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 64);
            contenido.stroke();

            texto(contenido, "Materia: " + seguro(rol.getMateriaCodigo()) + " - " + seguro(rol.getMateriaNombre()),
                    MARGIN, 84, PDType1Font.HELVETICA_BOLD, 8, java.awt.Color.BLACK);
            texto(contenido, "Carrera: " + seguro(rol.getCarreraNombre()),
                    MARGIN, 99, PDType1Font.HELVETICA, 8, java.awt.Color.BLACK);
            texto(contenido, "Grupo: " + seguro(rol.getGrupo()) + "   Parcial: "
                            + (rol.getTipoParcial() == null ? "-" : seguro(rol.getTipoParcial().getValor()))
                            + "   Fecha: " + (rol.getFechaDisplay() == null ? seguro(String.valueOf(rol.getFecha())) : seguro(rol.getFechaDisplay())),
                    MARGIN, 114, PDType1Font.HELVETICA, 8, java.awt.Color.BLACK);
            texto(contenido, "Variante " + seguro(variante.getLetra()) + " · "
                            + (variante.getTotalPreguntas() == null ? 0 : variante.getTotalPreguntas())
                            + " preguntas · Generado: " + FECHA_HORA.format(LocalDateTime.now()),
                    MARGIN, 129, PDType1Font.HELVETICA_BOLD, 8, new java.awt.Color(55, 43, 125));

            dibujarTabla(contenido, variante, 158);
            texto(contenido, "Patrón liberado después de la calificación. Documento de consulta; no modificar.",
                    MARGIN, 810, PDType1Font.HELVETICA, 7, java.awt.Color.GRAY);
        }
    }

    private void dibujarTabla(PDPageContentStream contenido,
                              PatronCalificadoResponseDto.VariantePatronDto variante,
                              float top) throws IOException {
        int total = variante.getTotalPreguntas() == null ? 0 : variante.getTotalPreguntas();
        Map<String, String> respuestas = variante.getRespuestas() == null ? Map.of() : variante.getRespuestas();
        int columnas = 5;
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
            texto(contenido, pregunta + ".", x + 10, y, PDType1Font.HELVETICA_BOLD, 9, java.awt.Color.DARK_GRAY);
            texto(contenido, seguro(respuestas.getOrDefault(String.valueOf(pregunta), "—")),
                    x + cellWidth - 32, y, PDType1Font.HELVETICA_BOLD, 11, new java.awt.Color(55, 43, 125));
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
