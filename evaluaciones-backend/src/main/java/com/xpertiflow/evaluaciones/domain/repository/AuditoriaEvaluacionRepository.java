package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuditoriaEvaluacionRepository extends JpaRepository<AuditoriaEvaluacion, Long> {

    List<AuditoriaEvaluacion> findByRolExamenIdOrderByFechaEventoDesc(String rolExamenId);

    Optional<AuditoriaEvaluacion> findFirstByRolExamenIdAndAccionOrderByFechaEventoDesc(
            String rolExamenId, String accion);
}
