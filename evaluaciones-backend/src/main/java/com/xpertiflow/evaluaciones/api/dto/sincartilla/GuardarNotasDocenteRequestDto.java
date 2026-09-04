package com.xpertiflow.evaluaciones.api.dto.sincartilla;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class GuardarNotasDocenteRequestDto {
    @NotEmpty @Valid private List<NotaDocenteItemDto> notas;
    private String usuario;
}
