package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.GeneracionTypstJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GeneracionTypstJobRepository extends JpaRepository<GeneracionTypstJob, String> {

    List<GeneracionTypstJob> findByRolExamenIdOrderBySolicitadoEnDesc(String rolExamenId);
}
