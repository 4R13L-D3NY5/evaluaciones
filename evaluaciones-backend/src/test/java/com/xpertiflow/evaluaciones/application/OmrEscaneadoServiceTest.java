package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.config.AppProperties;
import com.xpertiflow.evaluaciones.domain.entity.CalificacionOmr;
import com.xpertiflow.evaluaciones.domain.repository.CalificacionOmrRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class OmrEscaneadoServiceTest {
    @TempDir Path temporal;
    private Path storage;
    private CalificacionOmrRepository repository;
    private OmrEscaneadoService service;
    private CalificacionOmr nota;

    @BeforeEach
    void preparar() throws Exception {
        storage = Files.createDirectory(temporal.resolve("storage"));
        AppProperties properties = new AppProperties();
        properties.getStorage().setBasePath(storage.toString());
        repository = mock(CalificacionOmrRepository.class);
        service = new OmrEscaneadoService(repository, properties);
        nota = new CalificacionOmr();
        nota.setRolExamenId("ROL-1");
        when(repository.findById(1L)).thenReturn(Optional.of(nota));
    }

    @Test
    void recuperaOriginalPersistidoSinModificarNota() throws Exception {
        Path archivo = Files.writeString(storage.resolve("escaneado.pdf"), "%PDF-1.4");
        nota.setArchivoEscaneadoPath(archivo.toString());
        assertEquals(archivo.toRealPath(), service.buscar("ROL-1", 1L).orElseThrow());
        verify(repository).findById(1L);
        verifyNoMoreInteractions(repository);
    }

    @Test
    void rechazaCalificacionDeOtraEvaluacion() throws Exception {
        nota.setArchivoEscaneadoPath(Files.createFile(storage.resolve("scan.pdf")).toString());
        assertTrue(service.buscar("ROL-2", 1L).isEmpty());
    }

    @Test
    void rechazaArchivoFueraDeStorageIncluidoDirectorioConPrefijoSimilar() throws Exception {
        Path externo = Files.createDirectories(temporal.resolve("storage-otro")).resolve("scan.pdf");
        Files.createFile(externo);
        nota.setArchivoEscaneadoPath(externo.toString());
        assertTrue(service.buscar("ROL-1", 1L).isEmpty());
        nota.setArchivoEscaneadoPath("../storage-otro/scan.pdf");
        assertTrue(service.buscar("ROL-1", 1L).isEmpty());
    }

    @Test
    void admiteImagenRelativaYRechazaContenidoActivo() throws Exception {
        Files.createFile(storage.resolve("scan.png"));
        nota.setArchivoEscaneadoPath("scan.png");
        assertTrue(service.buscar("ROL-1", 1L).isPresent());
        Files.createFile(storage.resolve("scan.html"));
        nota.setArchivoEscaneadoPath("scan.html");
        assertTrue(service.buscar("ROL-1", 1L).isEmpty());
    }

    @Test
    void informaAusenciaParaHistoricosSinArchivoYArchivosPerdidos() {
        assertTrue(service.buscar("ROL-1", 1L).isEmpty());
        nota.setArchivoEscaneadoPath("perdido.pdf");
        assertTrue(service.buscar("ROL-1", 1L).isEmpty());
        assertTrue(service.buscar("ROL-1", 2L).isEmpty());
    }
}
