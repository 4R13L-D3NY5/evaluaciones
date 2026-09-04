package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.SalaExamenVirtual;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

public interface SalaExamenVirtualRepository extends JpaRepository<SalaExamenVirtual, String> {
    Optional<SalaExamenVirtual> findByCodigoSala(String codigoSala);
    List<SalaExamenVirtual> findByRolExamenIdOrderByCreadoEnDesc(String rolExamenId);
    List<SalaExamenVirtual> findByEstadoAndTerminaEnBefore(String estado, LocalDateTime terminaEn);
}
