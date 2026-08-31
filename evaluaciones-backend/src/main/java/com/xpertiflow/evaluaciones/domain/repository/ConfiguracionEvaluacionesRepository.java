package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.ConfiguracionEvaluaciones;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfiguracionEvaluacionesRepository extends JpaRepository<ConfiguracionEvaluaciones, Short> {
}
