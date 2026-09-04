-- Las cartillas reales incluyen marcas claras que quedan entre 60% y 70%
-- de densidad. El diferencial mínimo del worker evita falsos positivos del
-- texto preimpreso de las burbujas vacías.
UPDATE sea_configuracion_omr
SET umbral_densidad_marca = 60.00,
    actualizado_en = CURRENT_TIMESTAMP,
    actualizado_por = 'AJUSTE_MARCAS_CLARAS_OMR'
WHERE id = 1;
