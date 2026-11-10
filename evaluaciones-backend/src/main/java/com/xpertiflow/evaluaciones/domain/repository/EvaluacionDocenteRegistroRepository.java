package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.EvaluacionDocenteRegistro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluacionDocenteRegistroRepository extends JpaRepository<EvaluacionDocenteRegistro, String> {

    @Query("SELECT r FROM EvaluacionDocenteRegistro r WHERE (r.gestion = :gestion OR r.gestion = 'ACTIVA' OR :gestion = 'ACTIVA' OR (r.gestion IN ('II-2026', '2-2026') AND :gestion IN ('II-2026', '2-2026'))) " +
           "AND r.sedeCodigo = :sedeCodigo AND r.carreraCodigo = :carreraCodigo ORDER BY r.creadoEn DESC")
    List<EvaluacionDocenteRegistro> findByGestionAndSedeCodigoAndCarreraCodigoOrderByCreadoEnDesc(
            @Param("gestion") String gestion,
            @Param("sedeCodigo") String sedeCodigo,
            @Param("carreraCodigo") String carreraCodigo
    );

    @Query("SELECT r FROM EvaluacionDocenteRegistro r WHERE (r.gestion = :gestion OR r.gestion = 'ACTIVA' OR :gestion = 'ACTIVA' OR (r.gestion IN ('II-2026', '2-2026') AND :gestion IN ('II-2026', '2-2026'))) " +
           "AND r.sedeCodigo = :sedeCodigo ORDER BY r.creadoEn DESC")
    List<EvaluacionDocenteRegistro> findByGestionAndSedeCodigoOrderByCreadoEnDesc(
            @Param("gestion") String gestion,
            @Param("sedeCodigo") String sedeCodigo
    );

    List<EvaluacionDocenteRegistro> findByDocenteNombreIgnoreCaseOrderByCreadoEnDesc(String docenteNombre);

    @Query("SELECT r FROM EvaluacionDocenteRegistro r WHERE (r.gestion = :gestion OR r.gestion = 'ACTIVA' OR :gestion = 'ACTIVA' OR (r.gestion IN ('II-2026', '2-2026') AND :gestion IN ('II-2026', '2-2026'))) " +
           "AND r.sedeCodigo = :sedeCodigo AND r.carreraCodigo = :carreraCodigo " +
           "AND r.materiaCodigo = :materiaCodigo AND r.grupoCodigo = :grupoCodigo " +
           "ORDER BY r.creadoEn DESC")
    List<EvaluacionDocenteRegistro> buscarEvaluacionesMateriaGrupo(
            @Param("gestion") String gestion,
            @Param("sedeCodigo") String sedeCodigo,
            @Param("carreraCodigo") String carreraCodigo,
            @Param("materiaCodigo") String materiaCodigo,
            @Param("grupoCodigo") String grupoCodigo
    );
}
