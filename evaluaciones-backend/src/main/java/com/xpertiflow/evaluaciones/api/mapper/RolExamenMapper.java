package com.xpertiflow.evaluaciones.api.mapper;

import com.xpertiflow.evaluaciones.api.dto.RolExamenRequestDto;
import com.xpertiflow.evaluaciones.api.dto.RolExamenResponseDto;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import org.springframework.stereotype.Component;

@Component
public class RolExamenMapper {

    public RolExamen toEntity(RolExamenRequestDto dto) {
        if (dto == null) return null;
        return RolExamen.builder()
                .id(dto.getId())
                .seaGroupId(dto.getSeaGroupId())
                .seaSyllabusCourseId(dto.getSeaSyllabusCourseId())
                .sedeCodigo(dto.getSedeCodigo())
                .sedeNombre(dto.getSedeNombre())
                .carreraCodigo(dto.getCarreraCodigo())
                .carreraNombre(dto.getCarreraNombre())
                .materiaCodigo(dto.getMateriaCodigo())
                .materiaNombre(dto.getMateriaNombre())
                .semestre(dto.getSemestre() != null ? dto.getSemestre() : 1)
                .grupo(dto.getGrupo())
                .tipoClase(dto.getTipoClase() != null ? dto.getTipoClase() : "TA")
                .docenteNombre(dto.getDocenteNombre())
                .docenteCi(dto.getDocenteCi())
                .tipoParcial(dto.getTipoParcial())
                .modalidad(dto.getModalidad())
                .conCartilla(dto.getModalidad() == com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen.PRESENCIAL_CARTILLA)
                .fecha(dto.getFecha())
                .horario(dto.getHorario() != null ? dto.getHorario() : "08:15 - 09:45")
                .aula(dto.getAula() != null ? dto.getAula() : "Aula 204")
                .campus(dto.getCampus() != null ? dto.getCampus() : "Campus Colonial")
                .dia(dto.getDia() != null ? dto.getDia() : "Sábado")
                .semana(dto.getSemana() != null ? dto.getSemana() : 1)
                .estudiantesInscritosCount(0)
                .variantesGeneradasCount(0)
                .build();
    }

    public void updateEntity(RolExamenRequestDto dto, RolExamen entity) {
        entity.setSeaGroupId(dto.getSeaGroupId());
        entity.setSeaSyllabusCourseId(dto.getSeaSyllabusCourseId());
        entity.setSedeCodigo(dto.getSedeCodigo());
        entity.setSedeNombre(dto.getSedeNombre());
        entity.setCarreraCodigo(dto.getCarreraCodigo());
        entity.setCarreraNombre(dto.getCarreraNombre());
        entity.setMateriaCodigo(dto.getMateriaCodigo());
        entity.setMateriaNombre(dto.getMateriaNombre());
        entity.setSemestre(dto.getSemestre() != null ? dto.getSemestre() : 1);
        entity.setGrupo(dto.getGrupo());
        entity.setTipoClase(dto.getTipoClase() != null ? dto.getTipoClase() : "TA");
        entity.setDocenteNombre(dto.getDocenteNombre());
        entity.setDocenteCi(dto.getDocenteCi());
        entity.setTipoParcial(dto.getTipoParcial());
        entity.setModalidad(dto.getModalidad());
        entity.setConCartilla(dto.getModalidad() == com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen.PRESENCIAL_CARTILLA);
        entity.setFecha(dto.getFecha());
        entity.setHorario(dto.getHorario() != null ? dto.getHorario() : "08:15 - 09:45");
        entity.setAula(dto.getAula() != null ? dto.getAula() : "Aula 204");
        entity.setCampus(dto.getCampus() != null ? dto.getCampus() : "Campus Colonial");
        entity.setDia(dto.getDia() != null ? dto.getDia() : "Sábado");
        entity.setSemana(dto.getSemana() != null ? dto.getSemana() : 1);
    }

    public RolExamenResponseDto toResponseDto(RolExamen entity) {
        if (entity == null) return null;
        return RolExamenResponseDto.builder()
                .id(entity.getId())
                .seaGroupId(entity.getSeaGroupId())
                .seaSyllabusCourseId(entity.getSeaSyllabusCourseId())
                .sedeCodigo(entity.getSedeCodigo())
                .sedeNombre(entity.getSedeNombre())
                .carreraCodigo(entity.getCarreraCodigo())
                .carreraNombre(entity.getCarreraNombre())
                .materiaCodigo(entity.getMateriaCodigo())
                .materiaNombre(entity.getMateriaNombre())
                .semestre(entity.getSemestre())
                .grupo(entity.getGrupo())
                .tipoClase(entity.getTipoClase())
                .docenteNombre(entity.getDocenteNombre())
                .docenteCi(entity.getDocenteCi())
                .tipoParcial(entity.getTipoParcial())
                .modalidad(entity.getModalidad())
                .estadoFlujo(entity.getEstadoFlujo())
                .semana(entity.getSemana())
                .dia(entity.getDia())
                .fecha(entity.getFecha())
                .fechaDisplay(entity.getFechaDisplay())
                .horario(entity.getHorario())
                .aula(entity.getAula())
                .campus(entity.getCampus())
                .estudiantesInscritosCount(entity.getEstudiantesInscritosCount())
                .variantesGeneradasCount(entity.getVariantesGeneradasCount())
                .hashEncriptacion(entity.getHashEncriptacion())
                .fechaValidacion(entity.getFechaValidacion())
                .fechaGeneracion(entity.getFechaGeneracion())
                .creadoEn(entity.getCreadoEn())
                .actualizadoEn(entity.getActualizadoEn())
                .build();
    }
}
