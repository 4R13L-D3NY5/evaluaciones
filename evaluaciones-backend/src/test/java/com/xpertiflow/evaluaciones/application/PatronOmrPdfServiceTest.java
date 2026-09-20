package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.PatronCalificadoResponseDto;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.TipoParcial;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PatronOmrPdfServiceTest {

    @Test
    void generaPatronPdfConEstudiantesRealesYNfd() throws IOException {
        RolExamen rol = RolExamen.builder()
                .sedeNombre("GUAYARAMERIN (GUA)")
                .carreraNombre("LICENCIATURA EN MEDICINA (CARMED)")
                .materiaCodigo("MED-225")
                .materiaNombre("PSICOLOGÍA MÉDICA")
                .grupo("TA-04")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .fecha(LocalDate.of(2026, 9, 16))
                .fechaDisplay("16/09/2026")
                .docenteNombre("BERNARDO CAMADER BEJARANO")
                .build();

        PatronCalificadoResponseDto patron = new PatronCalificadoResponseDto();
        patron.setRolExamenId("ROL-01aee3b5-765e-4268-9d97-c307f72abca3-1P-2026-09-16-V6");
        patron.setEstado("PENDIENTE_NOTAS");

        List<PatronCalificadoResponseDto.VariantePatronDto> variantes = new ArrayList<>();
        String[] letras = {"A", "B", "C", "D", "E", "F", "G"};

        // Estudiantes con nombres reales, incluyendo acentos NFD descompuestos
        String pamelaNfd = Normalizer.normalize("DA SILVA PEREIRA PÂMELA CRISTINA", Normalizer.Form.NFD);
        String proencaNfd = Normalizer.normalize("PROENÇA DE OLIVEIRA ALCIONE BENTO", Normalizer.Form.NFD);
        String amancioNfd = Normalizer.normalize("AMÂNCIO AMARAL GABRIELLE", Normalizer.Form.NFD);

        for (String letra : letras) {
            Map<String, String> respuestas = new LinkedHashMap<>();
            for (int i = 1; i <= 30; i++) {
                respuestas.put(String.valueOf(i), "B");
            }
            List<PatronCalificadoResponseDto.EstudiantePatronDto> ests = new ArrayList<>();
            ests.add(crearEstudiante("1200981", pamelaNfd));
            ests.add(crearEstudiante("1201111", proencaNfd));
            ests.add(crearEstudiante("1201086", amancioNfd));
            ests.add(crearEstudiante("1200875", "FIGUEIREDO DE JESUS SARA VERÍSSIMO"));
            ests.add(crearEstudiante("1200880", "SODRÉ OLIVEIRA FERNANDO AUGUSTO"));

            PatronCalificadoResponseDto.VariantePatronDto v = new PatronCalificadoResponseDto.VariantePatronDto();
            v.setLetra(letra);
            v.setTotalPreguntas(30);
            v.setRespuestas(respuestas);
            v.setEstudiantes(ests);
            variantes.add(v);
        }
        patron.setVariantes(variantes);

        PatronOmrPdfService service = new PatronOmrPdfService();
        byte[] pdf = service.generar(rol, patron);

        assertNotNull(pdf);
        assertTrue(pdf.length > 0);

        try (PDDocument doc = PDDocument.load(pdf)) {
            assertEquals(2, doc.getNumberOfPages(), "7 variantes con 5 estudiantes deben entrar en 2 páginas");
        }
    }

    private PatronCalificadoResponseDto.EstudiantePatronDto crearEstudiante(String codigo, String nombre) {
        PatronCalificadoResponseDto.EstudiantePatronDto e = new PatronCalificadoResponseDto.EstudiantePatronDto();
        e.setCodigoEstudiante(codigo);
        e.setNombreCompleto(nombre);
        return e;
    }
}
