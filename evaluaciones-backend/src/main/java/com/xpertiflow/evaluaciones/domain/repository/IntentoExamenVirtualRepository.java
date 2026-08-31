package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.IntentoExamenVirtual;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface IntentoExamenVirtualRepository extends JpaRepository<IntentoExamenVirtual, String> {
    List<IntentoExamenVirtual> findBySalaIdOrderByCodigoEstudianteAsc(String salaId);
    Optional<IntentoExamenVirtual> findBySalaIdAndTokenHash(String salaId, String tokenHash);
    Optional<IntentoExamenVirtual> findByTokenHash(String tokenHash);
}
