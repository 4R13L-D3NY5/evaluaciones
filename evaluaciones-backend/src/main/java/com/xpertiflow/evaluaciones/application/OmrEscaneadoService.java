package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.config.AppProperties;
import com.xpertiflow.evaluaciones.domain.repository.CalificacionOmrRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.InvalidPathException;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OmrEscaneadoService {
    private final CalificacionOmrRepository calificacionRepository;
    private final AppProperties appProperties;

    public Optional<Path> buscar(String rolExamenId, Long calificacionId) {
        return calificacionRepository.findById(calificacionId)
                .filter(nota -> rolExamenId.equals(nota.getRolExamenId()))
                .map(nota -> nota.getArchivoEscaneadoPath())
                .filter(ruta -> !ruta.isBlank())
                .flatMap(this::resolver);
    }

    private Optional<Path> resolver(String ruta) {
        try {
            Path base = Path.of(appProperties.getStorage().getBasePath()).toRealPath();
            Path archivo = Path.of(ruta.replace('\\', '/'));
            if (!archivo.isAbsolute()) archivo = base.resolve(archivo);
            archivo = archivo.toRealPath();
            if (!archivo.startsWith(base) || !Files.isRegularFile(archivo) || !Files.isReadable(archivo)) {
                return Optional.empty();
            }
            String nombre = archivo.getFileName().toString().toLowerCase(Locale.ROOT);
            if (Set.of(".pdf", ".png", ".jpg", ".jpeg").stream().noneMatch(nombre::endsWith)) {
                return Optional.empty();
            }
            return Optional.of(archivo);
        } catch (IOException | InvalidPathException exception) {
            return Optional.empty();
        }
    }
}
