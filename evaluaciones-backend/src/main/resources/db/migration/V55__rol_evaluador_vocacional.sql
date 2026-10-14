-- V55: Registro del rol institucional EVALUADOR_VOCACIONAL
INSERT INTO sea_roles_sistema (codigo, nombre, descripcion, activo)
VALUES (
    'EVALUADOR_VOCACIONAL',
    'Evaluador de test vocacionales',
    'Acceso exclusivo a la lectura óptica OMR/OCR y generación de informes del Test de Orientación Vocacional RIASEC',
    TRUE
)
ON CONFLICT (codigo) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    activo = TRUE;
