package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.EvaluacionCriterio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluacionCriterioRepository extends JpaRepository<EvaluacionCriterio, String> {
    List<EvaluacionCriterio> findBySeccionIdOrderByOrdenAsc(String seccionId);
}
