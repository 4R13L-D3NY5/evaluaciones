package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.Reactivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReactivoRepository extends JpaRepository<Reactivo, Integer> {

    List<Reactivo> findByBancoIdOrderByNumeroOrdenAsc(String bancoId);
}
