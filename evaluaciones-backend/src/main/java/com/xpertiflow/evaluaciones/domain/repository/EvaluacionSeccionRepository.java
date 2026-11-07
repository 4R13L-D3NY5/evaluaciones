package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.EvaluacionSeccion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluacionSeccionRepository extends JpaRepository<EvaluacionSeccion, String> {
    List<EvaluacionSeccion> findByInstrumentoIdOrderByOrdenAsc(String instrumentoId);
}
