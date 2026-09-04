package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.Respaldo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface RespaldoRepository extends JpaRepository<Respaldo, String> {
    List<Respaldo> findAllByOrderBySolicitadoEnDesc();
    List<Respaldo> findByEstadoIn(Collection<String> estados);
    Optional<Respaldo> findTopByEstadoOrderByFinalizadoEnDesc(String estado);
}
