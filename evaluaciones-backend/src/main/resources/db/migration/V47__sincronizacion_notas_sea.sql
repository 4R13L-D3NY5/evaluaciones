-- =========================================================================
-- V47: Trazabilidad y Estado de Sincronización de Calificaciones con SEA
-- =========================================================================

ALTER TABLE sea_roles_evaluaciones
    ADD COLUMN IF NOT EXISTS sincronizado_sea BOOLEAN DEFAULT FALSE NOT NULL,
    ADD COLUMN IF NOT EXISTS fecha_sincronizacion_sea TIMESTAMP,
    ADD COLUMN IF NOT EXISTS sincronizado_sea_por VARCHAR(100),
    ADD COLUMN IF NOT EXISTS sincronizacion_sea_resultado TEXT;

CREATE INDEX IF NOT EXISTS idx_roles_sincronizado_sea
    ON sea_roles_evaluaciones(sincronizado_sea);
