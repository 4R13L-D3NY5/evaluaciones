package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.VerificacionExamen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificacionExamenRepository extends JpaRepository<VerificacionExamen, Long> {

    Optional<VerificacionExamen> findByRolExamenId(String rolExamenId);
}
