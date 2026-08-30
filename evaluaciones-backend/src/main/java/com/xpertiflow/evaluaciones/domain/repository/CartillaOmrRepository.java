package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.CartillaOmr;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartillaOmrRepository extends JpaRepository<CartillaOmr, Long> {

    List<CartillaOmr> findByLoteIdOrderByNumeroOrdenAsc(String loteId);
}
