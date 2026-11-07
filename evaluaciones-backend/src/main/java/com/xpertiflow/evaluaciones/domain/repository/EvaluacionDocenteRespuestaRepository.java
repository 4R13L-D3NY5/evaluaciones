package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.EvaluacionDocenteRespuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluacionDocenteRespuestaRepository extends JpaRepository<EvaluacionDocenteRespuesta, Long> {
    List<EvaluacionDocenteRespuesta> findByRegistroId(String registroId);
}
