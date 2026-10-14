package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.TestVocacional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TestVocacionalRepository extends JpaRepository<TestVocacional, Long> {

    List<TestVocacional> findByLoteIdOrderByPaginaNumeroAsc(String loteId);

    @Query("SELECT t FROM TestVocacional t WHERE " +
           "(:colegio IS NULL OR LOWER(t.colegio) LIKE :colegio) AND " +
           "(:curso IS NULL OR LOWER(t.curso) LIKE :curso) AND " +
           "(:fecha IS NULL OR t.fecha = :fecha) AND " +
           "(:busqueda IS NULL OR LOWER(t.nombreCompleto) LIKE :busqueda OR " +
           " LOWER(t.celular) LIKE :busqueda OR " +
           " LOWER(t.correo) LIKE :busqueda OR " +
           " LOWER(t.colegio) LIKE :busqueda OR " +
           " LOWER(t.curso) LIKE :busqueda OR " +
           " LOWER(COALESCE(t.sede, '')) LIKE :busqueda OR " +
           " LOWER(COALESCE(t.gestion, '')) LIKE :busqueda OR " +
           " LOWER(COALESCE(t.municipio, '')) LIKE :busqueda OR " +
           " LOWER(t.loteId) LIKE :busqueda) " +
           "ORDER BY t.creadoEn DESC, t.paginaNumero ASC")
    List<TestVocacional> buscarConFiltros(
            @Param("colegio") String colegio,
            @Param("curso") String curso,
            @Param("fecha") LocalDate fecha,
            @Param("busqueda") String busqueda
    );

    @Query("SELECT DISTINCT t.colegio FROM TestVocacional t WHERE t.colegio IS NOT NULL ORDER BY t.colegio ASC")
    List<String> findDistinctColegios();

    @Query("SELECT DISTINCT t.curso FROM TestVocacional t WHERE t.curso IS NOT NULL ORDER BY t.curso ASC")
    List<String> findDistinctCursos();

    @Query("SELECT DISTINCT t.sede FROM TestVocacional t WHERE t.sede IS NOT NULL AND t.sede <> '' ORDER BY t.sede ASC")
    List<String> findDistinctSedes();

    @Query("SELECT DISTINCT t.gestion FROM TestVocacional t WHERE t.gestion IS NOT NULL AND t.gestion <> '' ORDER BY t.gestion ASC")
    List<String> findDistinctGestiones();

    @Query("SELECT DISTINCT t.municipio FROM TestVocacional t WHERE t.municipio IS NOT NULL AND t.municipio <> '' ORDER BY t.municipio ASC")
    List<String> findDistinctMunicipios();

    List<TestVocacional> findByColegioIgnoreCaseAndCursoIgnoreCase(String colegio, String curso);
}
