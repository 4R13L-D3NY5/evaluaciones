package com.xpertiflow.evaluaciones.api.dto.gateway;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.Data;

@Data
public class CourseDto {

    private String syllabusCourseId;
    private String courseCode;
    private String courseName;
    @JsonAlias({"planCurricular", "planEstudios", "planEstudio", "curriculumPlan", "curricularPlan", "studyPlan", "studyPlanCode", "curriculumCode", "planCode"})
    private String planCurricular;
    private Integer credits;
    private Integer theoryHours;
    private Integer practiceHours;
    private Integer semester;
}
