package com.xpertiflow.evaluaciones.domain.enums.converter;

import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class EstadoFlujoConverter implements AttributeConverter<EstadoFlujo, String> {

    @Override
    public String convertToDatabaseColumn(EstadoFlujo attribute) {
        return attribute == null ? null : attribute.getValor();
    }

    @Override
    public EstadoFlujo convertToEntityAttribute(String dbData) {
        return dbData == null ? null : EstadoFlujo.fromValor(dbData);
    }
}
