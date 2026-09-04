package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.DocumentoExamenSinCartilla;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DocumentoExamenSinCartillaRepository extends JpaRepository<DocumentoExamenSinCartilla, String> {
    Optional<DocumentoExamenSinCartilla> findByRolExamenId(String rolExamenId);
}
