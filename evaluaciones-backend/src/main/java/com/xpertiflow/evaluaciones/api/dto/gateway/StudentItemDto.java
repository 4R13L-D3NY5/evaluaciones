package com.xpertiflow.evaluaciones.api.dto.gateway;

import lombok.Data;

@Data
public class StudentItemDto {

    private String studentCode;
    private String fullName;
    private String courseState;
    private String groupId;
    private String syllabusCourseId;
    private java.time.OffsetDateTime enrollCreatedAt;
    private java.time.OffsetDateTime enrollUpdatedAt;
}
