package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.RespuestaExamenVirtual;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RespuestaExamenVirtualRepository extends JpaRepository<RespuestaExamenVirtual, Long> {
    List<RespuestaExamenVirtual> findByIntentoIdOrderByNumeroPreguntaAsc(String intentoId);
    Optional<RespuestaExamenVirtual> findByIntentoIdAndNumeroPregunta(String intentoId, Integer numeroPregunta);
}
