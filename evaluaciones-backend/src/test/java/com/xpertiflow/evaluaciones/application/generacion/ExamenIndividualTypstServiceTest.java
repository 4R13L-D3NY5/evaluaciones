package com.xpertiflow.evaluaciones.application.generacion;

import com.xpertiflow.evaluaciones.config.AppProperties;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import com.xpertiflow.evaluaciones.domain.entity.MapeoEstudianteVariante;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.enums.TipoParcial;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.ExamenVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.MapeoEstudianteVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.ArgumentCaptor;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ExamenIndividualTypstServiceTest {

    private AppProperties appProperties;
    private RolExamenRepository rolExamenRepository;
    private MapeoEstudianteVarianteRepository mapeoRepository;
    private ExamenVarianteRepository varianteRepository;
    private AuditoriaEvaluacionRepository auditoriaRepository;

    private ExamenIndividualTypstService service;

    @TempDir
    Path tempStorage;

    @BeforeEach
    void setUp() {
        appProperties = mock(AppProperties.class);
        AppProperties.Storage storage = new AppProperties.Storage();
        storage.setBasePath(tempStorage.toString());
        when(appProperties.getStorage()).thenReturn(storage);

        rolExamenRepository = mock(RolExamenRepository.class);
        mapeoRepository = mock(MapeoEstudianteVarianteRepository.class);
        varianteRepository = mock(ExamenVarianteRepository.class);
        auditoriaRepository = mock(AuditoriaEvaluacionRepository.class);

        service = new ExamenIndividualTypstService(
                appProperties,
                rolExamenRepository,
                mapeoRepository,
                varianteRepository,
                auditoriaRepository
        );
    }

    private RolExamen crearRol(String rolId) {
        return RolExamen.builder()
                .id(rolId)
                .materiaCodigo("SIS-114")
                .sedeCodigo("CBA")
                .grupo("TA-01")
                .tipoParcial(TipoParcial.PRIMER_PARCIAL)
                .modalidad(ModalidadExamen.PRESENCIAL_CARTILLA)
                .estadoFlujo(EstadoFlujo.GENERADO)
                .fecha(LocalDate.of(2026, 9, 3))
                .estudiantesInscritosCount(10)
                .build();
    }

    @Test
    @DisplayName("Lanza excepción si el rol de examen no existe")
    void rolNoExisteLanzaExcepcion() {
        when(rolExamenRepository.findById("ROL-INVALIDO")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () ->
                service.generarCuadernilloEstudiante("ROL-INVALIDO", "1001", "A", "admin"));
    }

    @Test
    @DisplayName("Lanza excepción si el estudiante no está en el rol")
    void estudianteNoEnRolLanzaExcepcion() {
        String rolId = "ROL-001";
        when(rolExamenRepository.findById(rolId)).thenReturn(Optional.of(crearRol(rolId)));
        when(mapeoRepository.findByRolExamenIdAndCodigoEstudiante(rolId, "1001")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () ->
                service.generarCuadernilloEstudiante(rolId, "1001", "A", "admin"));
    }

    @Test
    @DisplayName("Lanza excepción si no se encuentra el archivo Typst oficial en storage")
    void sinArchivoTypstLanzaExcepcion() {
        String rolId = "ROL-001";
        when(rolExamenRepository.findById(rolId)).thenReturn(Optional.of(crearRol(rolId)));

        MapeoEstudianteVariante m = new MapeoEstudianteVariante();
        m.setRolExamenId(rolId);
        m.setCodigoEstudiante("1001");
        m.setNombres("CARLOS QUINTANILLA");
        when(mapeoRepository.findByRolExamenIdAndCodigoEstudiante(rolId, "1001")).thenReturn(Optional.of(m));

        assertThrows(IllegalStateException.class, () ->
                service.generarCuadernilloEstudiante(rolId, "1001", "A", "admin"));
    }
}
