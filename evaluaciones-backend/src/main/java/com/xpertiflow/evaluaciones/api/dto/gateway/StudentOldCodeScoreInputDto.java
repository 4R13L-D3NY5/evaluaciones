package com.xpertiflow.evaluaciones.api.dto.gateway;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentOldCodeScoreInputDto {

    @NotNull
    private Long studentOldCode;

    @NotNull
    @DecimalMin("0")
    @DecimalMax("100")
    private Integer score;
}
