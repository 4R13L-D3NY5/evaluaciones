package com.xpertiflow.evaluaciones.api.dto.gateway;

import lombok.Data;

@Data
public class CourseDto {

    private String syllabusCourseId;
    private String courseCode;
    private String courseName;
    private Integer credits;
    private Integer theoryHours;
    private Integer practiceHours;
    private Integer semester;
}
