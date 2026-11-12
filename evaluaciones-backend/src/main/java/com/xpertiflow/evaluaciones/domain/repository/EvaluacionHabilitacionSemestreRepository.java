package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.EvaluacionHabilitacionSemestre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluacionHabilitacionSemestreRepository extends JpaRepository<EvaluacionHabilitacionSemestre, String> {

    List<EvaluacionHabilitacionSemestre> findBySedeCodigoAndCarreraCodigoAndGestion(
            String sedeCodigo, String carreraCodigo, String gestion
    );

    Optional<EvaluacionHabilitacionSemestre> findBySedeCodigoAndCarreraCodigoAndGestionAndSemestre(
            String sedeCodigo, String carreraCodigo, String gestion, Integer semestre
    );

    @Query("SELECT CASE WHEN COUNT(h) > 0 THEN true ELSE false END " +
           "FROM EvaluacionHabilitacionSemestre h " +
           "WHERE h.sedeCodigo = :sedeCodigo AND h.carreraCodigo = :carreraCodigo " +
           "AND (h.gestion = :gestion OR h.gestion = 'ACTIVA' OR :gestion = 'ACTIVA' OR (h.gestion IN ('II-2026', '2-2026') AND :gestion IN ('II-2026', '2-2026'))) " +
           "AND h.semestre = :semestre AND h.habilitado = true AND h.expiraEn > :ahora")
    boolean isSemestreActivo(
            @Param("sedeCodigo") String sedeCodigo,
            @Param("carreraCodigo") String carreraCodigo,
            @Param("gestion") String gestion,
            @Param("semestre") Integer semestre,
            @Param("ahora") LocalDateTime ahora
    );
}
