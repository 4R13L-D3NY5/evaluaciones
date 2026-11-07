package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.EvaluacionInstrumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EvaluacionInstrumentoRepository extends JpaRepository<EvaluacionInstrumento, String> {

    Optional<EvaluacionInstrumento> findByEstado(String estado);

    Optional<EvaluacionInstrumento> findByCodigo(String codigo);

    List<EvaluacionInstrumento> findAllByOrderByCreadoEnDesc();

    @Modifying
    @Query("UPDATE EvaluacionInstrumento i SET i.estado = 'HISTORICO' WHERE i.estado = 'VIGENTE'")
    void desactivarInstrumentosVigentes();

    @Modifying
    @Query("UPDATE EvaluacionInstrumento i SET i.estado = 'VIGENTE' WHERE i.id = :id")
    void activarInstrumento(@Param("id") String id);
}
