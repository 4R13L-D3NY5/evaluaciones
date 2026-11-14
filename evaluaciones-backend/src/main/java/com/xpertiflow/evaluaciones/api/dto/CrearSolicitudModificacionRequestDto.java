package com.xpertiflow.evaluaciones.api.dto;

import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearSolicitudModificacionRequestDto {

    @NotBlank(message = "El ID del rol de examen es obligatorio")
    private String rolExamenId;

    @NotNull(message = "La fecha propuesta es obligatoria")
    private LocalDate fechaPropuesta;

    @NotBlank(message = "El horario propuesto es obligatorio")
    private String horarioPropuesto;

    @NotNull(message = "La modalidad propuesta es obligatoria")
    private ModalidadExamen modalidadPropuesta;

    @NotBlank(message = "El motivo de la solicitud es obligatorio")
    @Size(min = 10, max = 1000, message = "El motivo debe tener entre 10 y 1000 caracteres")
    private String motivo;
}
