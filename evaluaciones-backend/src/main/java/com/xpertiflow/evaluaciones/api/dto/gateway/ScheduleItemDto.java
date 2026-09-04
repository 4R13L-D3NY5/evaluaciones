package com.xpertiflow.evaluaciones.api.dto.gateway;

import lombok.Data;

@Data
public class ScheduleItemDto {

    private String day;
    private String startTime;
    private String endTime;
    private String classroom;
    private String campus;
}
