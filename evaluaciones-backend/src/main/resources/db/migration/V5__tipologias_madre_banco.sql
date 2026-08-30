-- Las plantillas oficiales incluyen filas madre para casos y emparejamientos.
-- Se habilitan como tipologías persistibles para que la validación no termine
-- en un error de restricción después de aceptar el archivo.
ALTER TABLE sea_reactivos
    DROP CONSTRAINT IF EXISTS sea_reactivos_tipo_reactivo_check;

ALTER TABLE sea_reactivos
    ADD CONSTRAINT sea_reactivos_tipo_reactivo_check
    CHECK (tipo_reactivo IN (
        'SELECCION_MEJOR_RESPUESTA',
        'VERDADERO_O_FALSO_SIMPLE',
        'RESPUESTA_PREMISAS_ABCD',
        'VERDADERO_O_FALSO_COMPLEJAS',
        'CASO_CLINICO_TRONCO',
        'SUBITEM_CASO',
        'EMPAREJAMIENTO_TRONCO',
        'OPCION_EMPAREJAMIENTO'
    ));
