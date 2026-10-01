package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sea_mock_gateway_calificaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockGatewayCalificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "syllabus_course_id", nullable = false)
    private UUID syllabusCourseId;

    @Column(name = "group_id", nullable = false)
    private UUID groupId;

    @Column(name = "student_old_code", nullable = false)
    private Long studentOldCode;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "client_id", length = 100)
    private String clientId;

    @CreationTimestamp
    @Column(name = "recibido_en", nullable = false, updatable = false)
    private LocalDateTime recibidoEn;

    @UpdateTimestamp
    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    @Column(name = "intentos_recibidos", nullable = false)
    @Builder.Default
    private Integer intentosRecibidos = 1;

    @Column(name = "raw_request_json", columnDefinition = "TEXT")
    private String rawRequestJson;
}
