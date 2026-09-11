package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.AnulacionPreguntaOmr;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AnulacionPreguntaOmrRepository extends JpaRepository<AnulacionPreguntaOmr, Long> {

    List<AnulacionPreguntaOmr> findByRolExamenIdAndActivoTrueOrderByLetraVarianteAscNumeroPreguntaAsc(String rolExamenId);

    List<AnulacionPreguntaOmr> findByRolExamenIdAndLetraVarianteAndActivoTrueOrderByNumeroPreguntaAsc(
            String rolExamenId, String letraVariante);

    Optional<AnulacionPreguntaOmr> findByRolExamenIdAndLetraVarianteAndNumeroPreguntaAndActivoTrue(
            String rolExamenId, String letraVariante, Integer numeroPregunta);

    Optional<AnulacionPreguntaOmr> findFirstByRolExamenIdAndLetraVarianteAndNumeroPreguntaOrderByIdDesc(
            String rolExamenId, String letraVariante, Integer numeroPregunta);
}
