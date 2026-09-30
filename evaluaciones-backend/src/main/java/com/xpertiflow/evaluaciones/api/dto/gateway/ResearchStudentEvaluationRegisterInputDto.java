package com.xpertiflow.evaluaciones.api.dto.gateway;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResearchStudentEvaluationRegisterInputDto {

    @NotNull
    private UUID syllabusCourseId;

    @NotNull
    private UUID groupId;

    @NotEmpty
    @Valid
    private List<StudentOldCodeScoreInputDto> students;
}
