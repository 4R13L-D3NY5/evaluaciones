package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.ExamenVariante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamenVarianteRepository extends JpaRepository<ExamenVariante, String> {

    List<ExamenVariante> findByRolExamenId(String rolExamenId);

    Optional<ExamenVariante> findByRolExamenIdAndLetraVariante(String rolExamenId, String letraVariante);

    void deleteByRolExamenId(String rolExamenId);
}
