package com.xpertiflow.evaluaciones.api.dto.gateway;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResearchStudentEvaluationRegisterResponseDto {

    private UUID syllabusCourseId;
    private UUID groupId;
    private Long oldCode;
    private Boolean completed;
}
