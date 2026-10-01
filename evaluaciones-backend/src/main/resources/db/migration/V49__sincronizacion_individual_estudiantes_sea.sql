-- V49: Trazabilidad individual de sincronización al SEA por estudiante
-- Agrega columnas de estado de sincronización en calificaciones OMR, notas docentes e intentos virtuales

ALTER TABLE sea_calificaciones_omr
    ADD COLUMN IF NOT EXISTS sincronizado_sea BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS fecha_sincronizacion_sea TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN IF NOT EXISTS sincronizado_sea_por VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_calificaciones_omr_sincronizado_sea
    ON sea_calificaciones_omr(rol_examen_id, sincronizado_sea);

ALTER TABLE sea_notas_docentes
    ADD COLUMN IF NOT EXISTS sincronizado_sea BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS fecha_sincronizacion_sea TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN IF NOT EXISTS sincronizado_sea_por VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_notas_docentes_sincronizado_sea
    ON sea_notas_docentes(rol_examen_id, sincronizado_sea);

ALTER TABLE sea_intentos_examen_virtual
    ADD COLUMN IF NOT EXISTS sincronizado_sea BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS fecha_sincronizacion_sea TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN IF NOT EXISTS sincronizado_sea_por VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_intentos_virtual_sincronizado_sea
    ON sea_intentos_examen_virtual(sala_id, sincronizado_sea);

-- Retrocompatibilidad: Marcar como sincronizados los estudiantes de roles que ya fueron sincronizados al SEA
UPDATE sea_calificaciones_omr c
SET sincronizado_sea = true,
    fecha_sincronizacion_sea = r.fecha_sincronizacion_sea,
    sincronizado_sea_por = r.sincronizado_sea_por
FROM sea_roles_evaluaciones r
WHERE c.rol_examen_id = r.id AND r.sincronizado_sea = true;

UPDATE sea_notas_docentes n
SET sincronizado_sea = true,
    fecha_sincronizacion_sea = r.fecha_sincronizacion_sea,
    sincronizado_sea_por = r.sincronizado_sea_por
FROM sea_roles_evaluaciones r
WHERE n.rol_examen_id = r.id AND r.sincronizado_sea = true;
