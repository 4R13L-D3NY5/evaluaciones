package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.EvaluacionDocenteObservacionTercero;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluacionDocenteObservacionTerceroRepository extends JpaRepository<EvaluacionDocenteObservacionTercero, Long> {

    List<EvaluacionDocenteObservacionTercero> findByGestionAndSedeCodigoAndCarreraCodigoAndMateriaCodigoAndDocenteCiOrderByCreadoEnAsc(
            String gestion, String sedeCodigo, String carreraCodigo, String materiaCodigo, String docenteCi);

    Optional<EvaluacionDocenteObservacionTercero> findByGestionAndSedeCodigoAndCarreraCodigoAndMateriaCodigoAndDocenteCiAndUsuarioId(
            String gestion, String sedeCodigo, String carreraCodigo, String materiaCodigo, String docenteCi, Long usuarioId);
}
