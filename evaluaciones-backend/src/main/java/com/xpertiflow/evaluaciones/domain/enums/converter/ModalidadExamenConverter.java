package com.xpertiflow.evaluaciones.domain.enums.converter;

import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class ModalidadExamenConverter implements AttributeConverter<ModalidadExamen, String> {

    @Override
    public String convertToDatabaseColumn(ModalidadExamen attribute) {
        return attribute == null ? null : attribute.getValor();
    }

    @Override
    public ModalidadExamen convertToEntityAttribute(String dbData) {
        return dbData == null ? null : ModalidadExamen.fromValor(dbData);
    }
}
