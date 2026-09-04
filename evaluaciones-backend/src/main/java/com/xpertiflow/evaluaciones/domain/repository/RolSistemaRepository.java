package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.RolSistema;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RolSistemaRepository extends JpaRepository<RolSistema, String> {
    List<RolSistema> findByActivoTrueOrderByNombreAsc();
}
