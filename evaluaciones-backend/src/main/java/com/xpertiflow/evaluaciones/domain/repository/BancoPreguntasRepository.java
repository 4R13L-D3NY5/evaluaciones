package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.BancoPreguntas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BancoPreguntasRepository extends JpaRepository<BancoPreguntas, String> {

    Optional<BancoPreguntas> findTopByRolExamenIdOrderByFechaAprobacionDesc(String rolExamenId);

    List<BancoPreguntas> findByRolExamenIdOrderByFechaAprobacionDesc(String rolExamenId);

    boolean existsByRolExamenIdAndHashSha256Integridad(String rolExamenId, String hashSha256Integridad);
}
