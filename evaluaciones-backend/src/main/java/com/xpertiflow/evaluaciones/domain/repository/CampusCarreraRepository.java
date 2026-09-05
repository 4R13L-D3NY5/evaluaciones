package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.CampusCarrera;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CampusCarreraRepository extends JpaRepository<CampusCarrera, Long> {

    List<CampusCarrera> findBySedeCodigoAndCampusClaveAndActivoTrueOrderByCarreraNombreAsc(
            String sedeCodigo, String campusClave);

    void deleteBySedeCodigoAndCampusClave(String sedeCodigo, String campusClave);
}
