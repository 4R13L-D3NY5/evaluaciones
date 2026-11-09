package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.EvaluacionDocenteRespuesta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluacionDocenteRespuestaRepository extends JpaRepository<EvaluacionDocenteRespuesta, Long> {

    @Query("SELECT r FROM EvaluacionDocenteRespuesta r JOIN FETCH r.criterio c LEFT JOIN FETCH c.seccion s WHERE r.registro.id = :registroId ORDER BY s.orden ASC, c.orden ASC")
    List<EvaluacionDocenteRespuesta> findByRegistroId(@Param("registroId") String registroId);

    @Query("SELECT r FROM EvaluacionDocenteRespuesta r JOIN FETCH r.criterio c LEFT JOIN FETCH c.seccion s WHERE r.registro.id IN :registroIds ORDER BY s.orden ASC, c.orden ASC")
    List<EvaluacionDocenteRespuesta> findByRegistroIdInOrderByCriterioOrdenAsc(@Param("registroIds") List<String> registroIds);
}
