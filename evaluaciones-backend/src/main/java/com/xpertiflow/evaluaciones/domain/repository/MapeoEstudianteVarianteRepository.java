package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.MapeoEstudianteVariante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MapeoEstudianteVarianteRepository extends JpaRepository<MapeoEstudianteVariante, Long> {

    List<MapeoEstudianteVariante> findByRolExamenId(String rolExamenId);

    void deleteByRolExamenId(String rolExamenId);
}
