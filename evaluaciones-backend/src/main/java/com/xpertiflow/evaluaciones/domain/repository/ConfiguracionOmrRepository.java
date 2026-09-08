package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.ConfiguracionOmr;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConfiguracionOmrRepository extends JpaRepository<ConfiguracionOmr, Short> {
    List<ConfiguracionOmr> findAllByOrderByAlcanceAscCampusNombreAscImpresoraClaveAsc();
}
