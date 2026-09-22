package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.HistorialVerificacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HistorialVerificacionRepository extends JpaRepository<HistorialVerificacion, Long> {

    List<HistorialVerificacion> findByRolExamenIdOrderByFechaDevolucionDescIdDesc(String rolExamenId);

    boolean existsByRolExamenIdAndBancoPreguntasId(String rolExamenId, String bancoPreguntasId);

    boolean existsByRolExamenId(String rolExamenId);
}
