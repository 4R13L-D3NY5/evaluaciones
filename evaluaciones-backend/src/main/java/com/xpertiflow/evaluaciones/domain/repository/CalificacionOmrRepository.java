package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.CalificacionOmr;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CalificacionOmrRepository extends JpaRepository<CalificacionOmr, Long> {

    List<CalificacionOmr> findByRolExamenIdOrderByCodigoEstudianteAsc(String rolExamenId);

    Optional<CalificacionOmr> findByRolExamenIdAndCodigoEstudiante(String rolExamenId, String codigoEstudiante);
}
