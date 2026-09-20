package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.sincartilla.NotaDocenteResponseDto;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.enums.TipoParcial;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ReporteNotasSinCartillaPdfServiceTest {

    @Test
    void generaPlanillaNotasPdfConEstudiantesYFirmas() throws IOException {
        ReporteNotasSinCartillaPdfService service = new ReporteNotasSinCartillaPdfService();

        RolExamen rol = RolExamen.builder()
                .id("ROL-TEST-001")
                .sedeNombre("COCHABAMBA")
                .carreraNombre("INGENIERÍA DE SISTEMAS")
                .materiaCodigo("SIS-101")
                .materiaNombre("PROGRAMACIÓN I")
                .grupo("TA-01")
                .modalidad(ModalidadExamen.PRESENCIAL_SIN_CARTILLA)
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .fecha(LocalDate.of(2026, 9, 28))
                .fechaDisplay("28/09/2026")
                .docenteNombre("ING. ALBERTO ROJAS")
                .build();

        List<NotaDocenteResponseDto> notas = new ArrayList<>();
        notas.add(NotaDocenteResponseDto.builder()
                .codigoEstudiante("1200101")
                .estudianteNombreCompleto("ALVAREZ GOMEZ JUAN")
                .notaSobre60(new BigDecimal("54.00"))
                .notaSobre100(new BigDecimal("90.00"))
                .build());
        notas.add(NotaDocenteResponseDto.builder()
                .codigoEstudiante("1200102")
                .estudianteNombreCompleto("BENITEZ CASTRO MARIA")
                .notaSobre60(new BigDecimal("42.50"))
                .notaSobre100(new BigDecimal("70.83"))
                .build());

        byte[] pdf = service.generar(rol, notas);
        assertNotNull(pdf);
        assertTrue(pdf.length > 0);

        try (PDDocument doc = PDDocument.load(pdf)) {
            assertTrue(doc.getNumberOfPages() >= 1);
        }
    }
}
