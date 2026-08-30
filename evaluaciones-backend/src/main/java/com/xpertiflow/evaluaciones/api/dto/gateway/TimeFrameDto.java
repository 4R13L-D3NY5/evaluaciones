package com.xpertiflow.evaluaciones.api.dto.gateway;

import lombok.Data;

@Data
public class TimeFrameDto {

    private String timeFrameId;
    private String name;
    private String code;
    private Boolean isActive;
}
