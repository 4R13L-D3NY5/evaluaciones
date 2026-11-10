package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.EvaluacionEstudianteRegistro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluacionEstudianteRegistroRepository extends JpaRepository<EvaluacionEstudianteRegistro, String> {

    List<EvaluacionEstudianteRegistro> findByEstudianteCodigoAndGestion(String estudianteCodigo, String gestion);

    Optional<EvaluacionEstudianteRegistro> findByEstudianteCodigoAndMateriaCodigoAndGrupoCodigoAndGestion(
            String estudianteCodigo, String materiaCodigo, String grupoCodigo, String gestion
    );

    @Query("SELECT r FROM EvaluacionEstudianteRegistro r WHERE r.estudianteCodigo = :estudianteCodigo " +
           "AND r.materiaCodigo = :materiaCodigo AND r.docenteNombre = :docenteNombre " +
           "AND (r.gestion = :gestion OR r.gestion = 'ACTIVA' OR :gestion = 'ACTIVA' OR (r.gestion IN ('II-2026', '2-2026') AND :gestion IN ('II-2026', '2-2026')))")
    Optional<EvaluacionEstudianteRegistro> findByEstudianteCodigoAndMateriaCodigoAndDocenteNombreAndGestion(
            @Param("estudianteCodigo") String estudianteCodigo,
            @Param("materiaCodigo") String materiaCodigo,
            @Param("docenteNombre") String docenteNombre,
            @Param("gestion") String gestion
    );

    @Query("SELECT r FROM EvaluacionEstudianteRegistro r WHERE (r.gestion = :gestion OR r.gestion = 'ACTIVA' OR :gestion = 'ACTIVA' OR (r.gestion IN ('II-2026', '2-2026') AND :gestion IN ('II-2026', '2-2026'))) " +
           "AND r.sedeCodigo = :sedeCodigo AND r.carreraCodigo = :carreraCodigo")
    List<EvaluacionEstudianteRegistro> findByGestionAndSedeCodigoAndCarreraCodigo(
            @Param("gestion") String gestion,
            @Param("sedeCodigo") String sedeCodigo,
            @Param("carreraCodigo") String carreraCodigo
    );

    @Query("SELECT r FROM EvaluacionEstudianteRegistro r WHERE (r.gestion = :gestion OR r.gestion = 'ACTIVA' OR :gestion = 'ACTIVA' OR (r.gestion IN ('II-2026', '2-2026') AND :gestion IN ('II-2026', '2-2026'))) " +
           "AND r.materiaCodigo = :materiaCodigo AND r.docenteNombre = :docenteNombre")
    List<EvaluacionEstudianteRegistro> findByGestionAndMateriaCodigoAndDocenteNombre(
            @Param("gestion") String gestion,
            @Param("materiaCodigo") String materiaCodigo,
            @Param("docenteNombre") String docenteNombre
    );

    @Query("SELECT r FROM EvaluacionEstudianteRegistro r WHERE r.gestion = :gestion " +
           "AND r.materiaCodigo = :materiaCodigo AND r.grupoCodigo = :grupoCodigo")
    List<EvaluacionEstudianteRegistro> findByGestionAndMateriaAndGrupo(
            @Param("gestion") String gestion,
            @Param("materiaCodigo") String materiaCodigo,
            @Param("grupoCodigo") String grupoCodigo
    );
}
