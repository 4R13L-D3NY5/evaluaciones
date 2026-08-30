package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RolExamenRepository extends JpaRepository<RolExamen, String> {

    List<RolExamen> findByEstadoFlujo(EstadoFlujo estadoFlujo);

    List<RolExamen> findBySedeCodigo(String sedeCodigo);

    List<RolExamen> findByCarreraCodigo(String carreraCodigo);

    List<RolExamen> findBySedeCodigoAndCarreraCodigo(String sedeCodigo, String carreraCodigo);

    List<RolExamen> findByMateriaCodigoAndGrupo(String materiaCodigo, String grupo);

    Optional<RolExamen> findFirstByMateriaCodigoAndGrupoAndTipoParcialAndEstadoFlujo(
            String materiaCodigo, String grupo, com.xpertiflow.evaluaciones.domain.enums.TipoParcial tipoParcial, EstadoFlujo estadoFlujo);

    Optional<RolExamen> findFirstByMateriaCodigoAndGrupoAndTipoParcialOrderByCreadoEnDesc(
            String materiaCodigo, String grupo, com.xpertiflow.evaluaciones.domain.enums.TipoParcial tipoParcial);
}
