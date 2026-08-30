package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.LoteCartillasOmr;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoteCartillasOmrRepository extends JpaRepository<LoteCartillasOmr, String> {

    Optional<LoteCartillasOmr> findFirstByRolExamenIdOrderByGeneradoEnDesc(String rolExamenId);
}
