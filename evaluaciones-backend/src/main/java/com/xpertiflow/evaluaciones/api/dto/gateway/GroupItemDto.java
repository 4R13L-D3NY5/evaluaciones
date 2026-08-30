package com.xpertiflow.evaluaciones.api.dto.gateway;

import lombok.Data;

import java.util.List;

@Data
public class GroupItemDto {

    private String groupId;
    private String code;
    private String classType;
    private String syllabusCourseId;
    private String careerId;
    private String branchOfficeId;
    private String term;
    private String teacherName;
    private String teacherIdentityNumber;
    private String groupLinkId;
    private List<ScheduleItemDto> schedules;
    private Object rotations;
}
