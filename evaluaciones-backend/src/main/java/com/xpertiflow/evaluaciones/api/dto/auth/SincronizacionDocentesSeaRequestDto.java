package com.xpertiflow.evaluaciones.api.dto.auth;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class SincronizacionDocentesSeaRequestDto {

    private List<String> cis = new ArrayList<>();
    private boolean desactivarAusentes;
}
