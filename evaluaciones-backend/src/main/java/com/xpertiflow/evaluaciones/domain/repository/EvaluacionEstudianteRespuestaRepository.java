package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.EvaluacionEstudianteRespuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluacionEstudianteRespuestaRepository extends JpaRepository<EvaluacionEstudianteRespuesta, Long> {

    List<EvaluacionEstudianteRespuesta> findByRegistroId(String registroId);

    List<EvaluacionEstudianteRespuesta> findByRegistroIdIn(List<String> registroIds);
}
