package com.xpertiflow.evaluaciones.domain.repository;

import com.xpertiflow.evaluaciones.domain.entity.MockGatewayCalificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MockGatewayCalificacionRepository extends JpaRepository<MockGatewayCalificacion, Long> {

    List<MockGatewayCalificacion> findByGroupIdOrderByStudentOldCodeAsc(UUID groupId);

    Optional<MockGatewayCalificacion> findByGroupIdAndSyllabusCourseIdAndStudentOldCode(
            UUID groupId, UUID syllabusCourseId, Long studentOldCode);

    List<MockGatewayCalificacion> findAllByOrderByRecibidoEnDesc();

    long countByGroupId(UUID groupId);
}
