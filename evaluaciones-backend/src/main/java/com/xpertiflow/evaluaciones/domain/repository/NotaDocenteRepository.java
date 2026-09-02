package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.NotaDocente;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface NotaDocenteRepository extends JpaRepository<NotaDocente, Long> {
    List<NotaDocente> findByRolExamenId(String rolExamenId);
    Optional<NotaDocente> findByRolExamenIdAndCodigoEstudiante(String rolExamenId, String codigoEstudiante);
}
