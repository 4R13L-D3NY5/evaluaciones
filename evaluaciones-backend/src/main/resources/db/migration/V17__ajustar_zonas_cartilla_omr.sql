-- Ajuste basado en las cartillas oficiales escaneadas MED-221 y MED-224.
-- El código institucional está en el recuadro grande de la cabecera derecha.
UPDATE sea_configuracion_omr
SET zona_codigo_x = 0.5500,
    zona_codigo_y = 0.1600,
    zona_codigo_ancho = 0.4200,
    zona_codigo_alto = 0.0700,
    escala_ocr = 3.00,
    actualizado_en = CURRENT_TIMESTAMP,
    actualizado_por = 'AJUSTE_CARTILLA_OFICIAL'
WHERE id = 1;
