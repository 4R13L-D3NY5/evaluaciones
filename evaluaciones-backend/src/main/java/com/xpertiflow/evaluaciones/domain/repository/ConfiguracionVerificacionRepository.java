package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.ConfiguracionVerificacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ConfiguracionVerificacionRepository extends JpaRepository<ConfiguracionVerificacion, Long> {

    List<ConfiguracionVerificacion> findAllByOrderBySedeCodigoAscCarreraCodigoAsc();

    Optional<ConfiguracionVerificacion> findBySedeCodigoAndCarreraCodigo(String sedeCodigo, String carreraCodigo);

    Optional<ConfiguracionVerificacion> findBySedeCodigoAndCarreraCodigoIsNull(String sedeCodigo);
}
