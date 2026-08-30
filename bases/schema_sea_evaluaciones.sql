-- =============================================================================
-- SISTEMA DE EVALUACIONES (SEA / XPERTIFLOW) - BASE DE DATOS OPTIMIZADA
-- Motor: MySQL 8.0+ / MariaDB
-- Base de Datos: sea_evaluaciones
-- Arquitectura: Encriptación híbrida, 6 Tipologías, Algoritmo 7F/16M/7D, Mapeo OMR y Auditoría
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `sea_evaluaciones` 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

USE `sea_evaluaciones`;

-- Desactivar temporalmente foreign keys para inicialización limpia
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `sea_auditoria_evaluaciones`;
DROP TABLE IF EXISTS `sea_calificaciones_omr`;
DROP TABLE IF EXISTS `sea_mapeo_estudiantes_variantes`;
DROP TABLE IF EXISTS `sea_examenes_variantes`;
DROP TABLE IF EXISTS `sea_reactivos`;
DROP TABLE IF EXISTS `sea_bancos_preguntas`;
DROP TABLE IF EXISTS `sea_roles_evaluaciones`;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================================
-- 1. TABLA: sea_roles_evaluaciones (Cronograma Oficial y Flujo de 9 Estados)
-- =============================================================================
CREATE TABLE `sea_roles_evaluaciones` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `sea_group_id` VARCHAR(64) NULL,
  `sea_syllabus_course_id` VARCHAR(64) NULL,
  `sede_codigo` VARCHAR(10) NOT NULL DEFAULT 'CBA',
  `sede_nombre` VARCHAR(100) NOT NULL DEFAULT 'Cochabamba',
  `carrera_codigo` VARCHAR(30) NOT NULL,
  `carrera_nombre` VARCHAR(150) NOT NULL,
  `materia_codigo` VARCHAR(30) NOT NULL,
  `materia_nombre` VARCHAR(150) NOT NULL,
  `semestre` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `grupo` VARCHAR(20) NOT NULL DEFAULT 'TA-01',
  `tipo_clase` VARCHAR(20) NOT NULL DEFAULT 'TA',
  `docente_nombre` VARCHAR(150) NOT NULL,
  `docente_ci` VARCHAR(30) NULL,
  `tipo_parcial` ENUM('1er Parcial', '2do Parcial', 'Final', '2da Instancia') NOT NULL DEFAULT '1er Parcial',
  `modalidad` ENUM('PRESENCIAL_CARTILLA', 'PRESENCIAL_SIN_CARTILLA', 'VIRTUAL') NOT NULL DEFAULT 'PRESENCIAL_CARTILLA',
  `con_cartilla` TINYINT(1) NOT NULL DEFAULT 1,
  `estado_flujo` ENUM(
    'PROGRAMADO', 'VALIDADO', 'GENERADO', 'IMPRESO', 
    'ENTREGADO', 'DEVUELTO', 'REVISADO', 'SUBIDO', 'RECIBIDO'
  ) NOT NULL DEFAULT 'PROGRAMADO',
  `semana` TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `dia` VARCHAR(20) NOT NULL DEFAULT 'Sábado',
  `fecha` DATE NOT NULL,
  `fecha_display` VARCHAR(20) NOT NULL,
  `horario` VARCHAR(50) NOT NULL DEFAULT '08:15 - 09:45',
  `aula` VARCHAR(50) NOT NULL DEFAULT 'Aula 204',
  `campus` VARCHAR(100) NOT NULL DEFAULT 'Campus Colonial',
  `estudiantes_inscritos_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `variantes_generadas_count` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `hash_encriptacion` VARCHAR(128) NULL,
  `fecha_validacion` DATETIME NULL,
  `fecha_generacion` DATETIME NULL,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `actualizado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_roles_sede_carrera` (`sede_codigo`, `carrera_codigo`),
  INDEX `idx_roles_materia_grupo` (`materia_codigo`, `grupo`),
  INDEX `idx_roles_estado` (`estado_flujo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 2. TABLA: sea_bancos_preguntas (Bancos de Preguntas Validados y Encriptados)
-- =============================================================================
CREATE TABLE `sea_bancos_preguntas` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `rol_examen_id` VARCHAR(64) NULL,
  `materia_codigo` VARCHAR(30) NOT NULL,
  `materia_nombre` VARCHAR(150) NOT NULL,
  `grupo` VARCHAR(20) NOT NULL DEFAULT 'TA-01',
  `tipo_parcial` VARCHAR(30) NOT NULL DEFAULT '1er Parcial',
  `total_reactivos` INT UNSIGNED NOT NULL DEFAULT 60,
  `faciles_count` INT UNSIGNED NOT NULL DEFAULT 15,
  `medias_count` INT UNSIGNED NOT NULL DEFAULT 30,
  `dificiles_count` INT UNSIGNED NOT NULL DEFAULT 15,
  `nombre_archivo_excel` VARCHAR(255) NOT NULL,
  `hash_sha256_integridad` VARCHAR(128) NOT NULL,
  `paquete_json_encriptado` LONGTEXT NOT NULL COMMENT 'Payload completo del banco para generación rápida',
  `estado` ENUM('BORRADOR', 'VALIDADO', 'ENCRIPTADO') NOT NULL DEFAULT 'VALIDADO',
  `docente_aprobador` VARCHAR(150) NOT NULL,
  `fecha_aprobacion` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_banco_rol_examen` FOREIGN KEY (`rol_examen_id`) 
    REFERENCES `sea_roles_evaluaciones` (`id`) ON DELETE SET NULL,
  INDEX `idx_banco_materia` (`materia_codigo`, `tipo_parcial`, `grupo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 3. TABLA: sea_reactivos (Detalle de Preguntas Individuales y 6 Tipologías)
-- =============================================================================
CREATE TABLE `sea_reactivos` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `banco_id` VARCHAR(64) NOT NULL,
  `numero_orden` INT UNSIGNED NOT NULL,
  `tipo_reactivo` ENUM(
    'SELECCION_MEJOR_RESPUESTA',
    'VERDADERO_O_FALSO_SIMPLE',
    'RESPUESTA_PREMISAS_ABCD',
    'VERDADERO_O_FALSO_COMPLEJAS',
    'SUBITEM_CASO',
    'OPCION_EMPAREJAMIENTO'
  ) NOT NULL DEFAULT 'SELECCION_MEJOR_RESPUESTA',
  `dificultad` ENUM('Fácil', 'Medio', 'Difícil') NOT NULL DEFAULT 'Medio',
  `nivel_dificultad` TINYINT UNSIGNED NOT NULL DEFAULT 2 COMMENT '1=Facil, 2=Medio, 3=Dificil',
  `grupo_contexto` VARCHAR(100) NULL COMMENT 'Identificador de Caso Práctico o Grupo de Emparejamiento',
  `enunciado` TEXT NOT NULL,
  `opciones_json` JSON NOT NULL COMMENT 'Array de opciones [A, B, C, D, E] con su texto y bandera de correcta',
  `respuesta_correcta` CHAR(1) NOT NULL DEFAULT 'A',
  `peso_puntos` DECIMAL(5,2) NOT NULL DEFAULT 1.00,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_reactivo_banco` FOREIGN KEY (`banco_id`) 
    REFERENCES `sea_bancos_preguntas` (`id`) ON DELETE CASCADE,
  INDEX `idx_reactivo_dificultad` (`banco_id`, `nivel_dificultad`),
  INDEX `idx_reactivo_tipo` (`tipo_reactivo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 4. TABLA: sea_examenes_variantes (Variantes Generadas A, B, C, D, E con 30 Reactivos)
-- =============================================================================
CREATE TABLE `sea_examenes_variantes` (
  `id` VARCHAR(64) NOT NULL PRIMARY KEY,
  `rol_examen_id` VARCHAR(64) NOT NULL,
  `letra_variante` ENUM('A', 'B', 'C', 'D', 'E') NOT NULL,
  `nombre_variante` VARCHAR(20) NOT NULL COMMENT 'TIPO A, TIPO B, etc.',
  `semilla_permutacion` INT UNSIGNED NOT NULL,
  `total_preguntas` TINYINT UNSIGNED NOT NULL DEFAULT 30,
  `cuota_faciles` TINYINT UNSIGNED NOT NULL DEFAULT 7,
  `cuota_medias` TINYINT UNSIGNED NOT NULL DEFAULT 16,
  `cuota_dificiles` TINYINT UNSIGNED NOT NULL DEFAULT 7,
  `patron_claves_json` JSON NOT NULL COMMENT 'Mapeo pregunta -> clave correcta: {"1":"C", "2":"A", ..., "30":"D"}',
  `orden_reactivos_ids_json` JSON NOT NULL COMMENT 'IDs de los reactivos en el orden exacto del examen',
  `archivo_typst_path` VARCHAR(255) NULL,
  `archivo_pdf_path` VARCHAR(255) NULL,
  `archivo_remark_xlsx_path` VARCHAR(255) NULL,
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_variante_rol_examen` FOREIGN KEY (`rol_examen_id`) 
    REFERENCES `sea_roles_evaluaciones` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_rol_variante` (`rol_examen_id`, `letra_variante`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 5. TABLA: sea_mapeo_estudiantes_variantes (Asignación Confidencial Estudiante <-> Examen)
-- =============================================================================
CREATE TABLE `sea_mapeo_estudiantes_variantes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `rol_examen_id` VARCHAR(64) NOT NULL,
  `variante_id` VARCHAR(64) NOT NULL,
  `codigo_estudiante` VARCHAR(30) NOT NULL,
  `nombres` VARCHAR(100) NOT NULL,
  `apellido_paterno` VARCHAR(80) NOT NULL,
  `apellido_materno` VARCHAR(80) NOT NULL,
  `letra_variante` ENUM('A', 'B', 'C', 'D', 'E') NOT NULL,
  `hash_control_seguridad` VARCHAR(128) NOT NULL,
  `cuadernillo_individual_pdf` VARCHAR(255) NULL,
  `estado_asistencia` ENUM('PRESENTE', 'AUSENTE', 'JUSTIFICADO') NOT NULL DEFAULT 'PRESENTE',
  `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_mapeo_rol_examen` FOREIGN KEY (`rol_examen_id`) 
    REFERENCES `sea_roles_evaluaciones` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_mapeo_variante` FOREIGN KEY (`variante_id`) 
    REFERENCES `sea_examenes_variantes` (`id`) ON DELETE CASCADE,
  UNIQUE KEY `uk_rol_estudiante` (`rol_examen_id`, `codigo_estudiante`),
  INDEX `idx_estudiante_cod` (`codigo_estudiante`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 6. TABLA: sea_calificaciones_omr (Resultados del Procesamiento Óptico OpenCV)
-- =============================================================================
CREATE TABLE `sea_calificaciones_omr` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `rol_examen_id` VARCHAR(64) NOT NULL,
  `codigo_estudiante` VARCHAR(30) NOT NULL,
  `estudiante_nombre_completo` VARCHAR(200) NOT NULL,
  `letra_variante` ENUM('A', 'B', 'C', 'D', 'E') NOT NULL DEFAULT 'A',
  `total_reactivos` TINYINT UNSIGNED NOT NULL DEFAULT 30,
  `aciertos` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `fallos` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `blancos` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `dobles_marcas` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `nota_sobre_30` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `nota_sobre_100` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `estado_calificacion` ENUM('APROBADO', 'REPROBADO', 'REVISION_MANUAL') NOT NULL DEFAULT 'APROBADO',
  `respuestas_detectadas_json` JSON NOT NULL COMMENT 'Respuestas 1..30 leídas por visión artificial',
  `imagen_cartilla_anotada_path` VARCHAR(255) NULL,
  `procesado_por` VARCHAR(50) NOT NULL DEFAULT 'OMR_VISION_ENGINE_V2',
  `fecha_procesamiento` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_omr_rol_examen` FOREIGN KEY (`rol_examen_id`) 
    REFERENCES `sea_roles_evaluaciones` (`id`) ON DELETE CASCADE,
  INDEX `idx_omr_estudiante` (`rol_examen_id`, `codigo_estudiante`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
-- 7. TABLA: sea_auditoria_evaluaciones (Bitácora de Seguridad e Inmutabilidad)
-- =============================================================================
CREATE TABLE `sea_auditoria_evaluaciones` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `rol_examen_id` VARCHAR(64) NOT NULL,
  `etapa_origen` VARCHAR(30) NOT NULL,
  `etapa_destino` VARCHAR(30) NOT NULL,
  `accion` VARCHAR(100) NOT NULL,
  `usuario` VARCHAR(100) NOT NULL DEFAULT 'ADMIN_EVALUACIONES',
  `ip_origen` VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
  `detalles_json` JSON NULL,
  `fecha_evento` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_auditoria_rol_examen` FOREIGN KEY (`rol_examen_id`) 
    REFERENCES `sea_roles_evaluaciones` (`id`) ON DELETE CASCADE,
  INDEX `idx_auditoria_rol` (`rol_examen_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================================================
