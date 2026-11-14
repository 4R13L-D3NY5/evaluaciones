package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.SolicitudModificacionRol;
import com.xpertiflow.evaluaciones.domain.enums.EstadoSolicitudModificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface SolicitudModificacionRolRepository extends JpaRepository<SolicitudModificacionRol, String> {

    Optional<SolicitudModificacionRol> findByRolExamenIdAndEstado(String rolExamenId, EstadoSolicitudModificacion estado);

    List<SolicitudModificacionRol> findByRolExamenIdOrderByCreadoEnDesc(String rolExamenId);

    List<SolicitudModificacionRol> findBySedeCodigoInAndEstadoOrderByCreadoEnDesc(Collection<String> sedes, EstadoSolicitudModificacion estado);

    List<SolicitudModificacionRol> findBySolicitanteIdOrderByCreadoEnDesc(Long solicitanteId);

    List<SolicitudModificacionRol> findBySolicitanteUsuarioOrderByCreadoEnDesc(String solicitanteUsuario);

    boolean existsByRolExamenIdAndEstado(String rolExamenId, EstadoSolicitudModificacion estado);

    List<SolicitudModificacionRol> findBySedeCodigoInOrderByCreadoEnDesc(Collection<String> sedes);
}
