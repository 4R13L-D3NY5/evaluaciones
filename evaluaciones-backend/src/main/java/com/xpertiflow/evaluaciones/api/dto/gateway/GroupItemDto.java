package com.xpertiflow.evaluaciones.api.dto.gateway;

import com.fasterxml.jackson.annotation.JsonProperty;
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
    @JsonProperty("teacherFullName")
    private String teacherFullName;
    private String teacherIdentityNumber;
    private String groupLinkId;
    private List<ScheduleItemDto> schedules;
    private Object rotations;

    public String getTeacherName() {
        return teacherName != null && !teacherName.isBlank() ? teacherName : teacherFullName;
    }
}
