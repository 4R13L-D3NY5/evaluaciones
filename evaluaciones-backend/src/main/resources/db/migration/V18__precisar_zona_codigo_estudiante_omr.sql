-- La zona anterior incluía N°, materia y grupo. Esta zona se limita a los
-- dígitos del código dentro del recuadro grande del estudiante.
UPDATE sea_configuracion_omr
SET zona_codigo_x = 0.7000,
    zona_codigo_y = 0.1600,
    zona_codigo_ancho = 0.2700,
    zona_codigo_alto = 0.0600,
    actualizado_en = CURRENT_TIMESTAMP,
    actualizado_por = 'AJUSTE_CODIGO_ESTUDIANTE'
WHERE id = 1;
