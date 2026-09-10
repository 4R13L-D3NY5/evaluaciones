package com.xpertiflow.evaluaciones.api.mapper;

import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class RolExamenMapperTest {

    private final RolExamenMapper mapper = new RolExamenMapper();

    @Test
    void derivaElDiaCorrectoDesdeLaFechaAunqueElValorPersistidoSeaIncorrecto() {
        RolExamen rol = RolExamen.builder()
                .id("ROL-TEST-15-09-2026")
                .fecha(LocalDate.of(2026, 9, 15))
                .dia("Jueves")
                .fechaDisplay("15/09/2026")
                .build();

        var respuesta = mapper.toResponseDto(rol);

        assertThat(respuesta.getDia()).isEqualTo("Martes");
        assertThat(respuesta.getFechaDisplay()).isEqualTo("15/09/2026");
    }
}
