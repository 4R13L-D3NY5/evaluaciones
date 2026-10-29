package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AuditoriaEvaluacionRepository extends JpaRepository<AuditoriaEvaluacion, Long> {

    List<AuditoriaEvaluacion> findByRolExamenIdOrderByFechaEventoDesc(String rolExamenId);

    Optional<AuditoriaEvaluacion> findFirstByRolExamenIdAndAccionOrderByFechaEventoDesc(
            String rolExamenId, String accion);

    Optional<AuditoriaEvaluacion> findFirstByRolExamenIdAndEtapaDestinoOrderByFechaEventoDesc(
            String rolExamenId, String etapaDestino);

    List<AuditoriaEvaluacion> findAllByOrderByFechaEventoDesc(Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT a FROM AuditoriaEvaluacion a JOIN FETCH a.rolExamen WHERE a.accion IN :acciones AND a.fechaEvento >= :fechaDesde ORDER BY a.fechaEvento DESC")
    List<AuditoriaEvaluacion> findReprogramacionesRecientes(
            @org.springframework.data.repository.query.Param("acciones") java.util.Collection<String> acciones,
            @org.springframework.data.repository.query.Param("fechaDesde") java.time.LocalDateTime fechaDesde);
}
