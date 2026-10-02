package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.EventoExamenVirtual;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventoExamenVirtualRepository extends JpaRepository<EventoExamenVirtual, Long> {

    List<EventoExamenVirtual> findAllByOrderByOcurridoEnDesc(Pageable pageable);

    List<EventoExamenVirtual> findAllByOrderByOcurridoEnDesc();
}
