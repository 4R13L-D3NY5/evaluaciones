package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.gateway.CampusCarreraItemDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.CampusCarrerasRequestDto;
import com.xpertiflow.evaluaciones.domain.entity.CampusCarrera;
import com.xpertiflow.evaluaciones.domain.repository.CampusCarreraRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CampusCarrerasService {

    private final CampusCarreraRepository repository;
    private final AccesoAcademicoService accesoAcademicoService;

    @Transactional(readOnly = true)
    public List<CampusCarreraItemDto> listar(CampusCarrerasRequestDto request,
                                              Authentication authentication) {
        exigirSede(request, authentication);
        List<CampusCarrera> asignadas = repository.findBySedeCodigoAndCampusClaveAndActivoTrueOrderByCarreraNombreAsc(
                request.getSedeCodigo(), claveCampus(request));
        // Compatibilidad con asignaciones creadas usando el nombre del campus
        // antes de que el catálogo institucional expusiera su identificador.
        if (asignadas.isEmpty()) {
            String clavePorNombre = normalizar(request.getCampusNombre());
            if (!clavePorNombre.equals(claveCampus(request))) {
                asignadas = repository.findBySedeCodigoAndCampusClaveAndActivoTrueOrderByCarreraNombreAsc(
                        request.getSedeCodigo(), clavePorNombre);
            }
        }
        return asignadas
                .stream()
                .map(item -> new CampusCarreraItemDto(item.getCarreraCodigo(), item.getCarreraNombre()))
                .toList();
    }

    @Transactional
    public List<CampusCarreraItemDto> guardar(CampusCarrerasRequestDto request,
                                               Authentication authentication) {
        exigirSede(request, authentication);
        String claveCampus = claveCampus(request);
        repository.deleteBySedeCodigoAndCampusClave(request.getSedeCodigo(), claveCampus);
        List<CampusCarreraItemDto> carreras = request.getCarreras() == null ? List.of() : request.getCarreras();
        carreras.stream()
                .filter(item -> item != null && item.getCodigo() != null && !item.getCodigo().isBlank()
                        && item.getNombre() != null && !item.getNombre().isBlank())
                .map(item -> entidad(request, claveCampus, item))
                .forEach(repository::save);
        return listar(request, authentication);
    }

    private CampusCarrera entidad(CampusCarrerasRequestDto request,
                                  String claveCampus,
                                  CampusCarreraItemDto item) {
        CampusCarrera entity = new CampusCarrera();
        entity.setSedeCodigo(request.getSedeCodigo().trim());
        entity.setCampusClave(claveCampus);
        entity.setCampusId(valor(request.getCampusId()));
        entity.setCampusCodigo(valor(request.getCampusCodigo()));
        entity.setCampusNombre(request.getCampusNombre().trim());
        entity.setCarreraCodigo(item.getCodigo().trim().toUpperCase());
        entity.setCarreraNombre(item.getNombre().trim());
        entity.setActivo(true);
        entity.setActualizadoEn(LocalDateTime.now());
        return entity;
    }

    private void exigirSede(CampusCarrerasRequestDto request, Authentication authentication) {
        if (!accesoAcademicoService.puedeConsultarSede(request.getSedeCodigo(), authentication)) {
            throw new AccessDeniedException("No tiene acceso a la sede indicada");
        }
    }

    private String claveCampus(CampusCarrerasRequestDto request) {
        String identificador = valor(request.getCampusId());
        if (identificador.isBlank()) identificador = valor(request.getCampusCodigo());
        if (identificador.isBlank()) identificador = request.getCampusNombre();
        return normalizar(identificador);
    }

    private String valor(String valor) {
        return valor == null ? "" : valor.trim();
    }

    private String normalizar(String valor) {
        return Normalizer.normalize(valor == null ? "" : valor, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .trim()
                .toUpperCase();
    }
}
