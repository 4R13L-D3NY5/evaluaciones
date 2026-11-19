package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.DocenteRatificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocenteRatificacionRepository extends JpaRepository<DocenteRatificacion, Long> {

    List<DocenteRatificacion> findByGestionAndSedeCodigo(String gestion, String sedeCodigo);

    List<DocenteRatificacion> findByGestionAndSedeCodigoAndCarreraCodigo(String gestion, String sedeCodigo, String carreraCodigo);

    List<DocenteRatificacion> findByGestion(String gestion);

    Optional<DocenteRatificacion> findByGestionAndSedeCodigoAndCarreraCodigoAndMateriaCodigoAndDocenteCi(
            String gestion, String sedeCodigo, String carreraCodigo, String materiaCodigo, String docenteCi);
}
