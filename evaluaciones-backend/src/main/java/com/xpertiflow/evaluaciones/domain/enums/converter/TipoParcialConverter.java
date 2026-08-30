package com.xpertiflow.evaluaciones.domain.enums.converter;

import com.xpertiflow.evaluaciones.domain.enums.TipoParcial;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class TipoParcialConverter implements AttributeConverter<TipoParcial, String> {

    @Override
    public String convertToDatabaseColumn(TipoParcial attribute) {
        return attribute == null ? null : attribute.getValor();
    }

    @Override
    public TipoParcial convertToEntityAttribute(String dbData) {
        return dbData == null ? null : TipoParcial.fromValor(dbData);
    }
}
