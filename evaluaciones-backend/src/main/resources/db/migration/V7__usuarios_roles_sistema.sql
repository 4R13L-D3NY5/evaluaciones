CREATE TABLE IF NOT EXISTS sea_roles_sistema (
  codigo VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255) NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO sea_roles_sistema (codigo, nombre, descripcion)
VALUES
  ('ADMINISTRADOR_SISTEMA', 'Administrador del sistema', 'Acceso total al sistema'),
  ('RESPONSABLE_EVALUACIONES', 'Responsable de evaluaciones', 'Gestiona campus, carreras, evaluaciones, tiempos y parámetros'),
  ('PERSONAL_EVALUACIONES', 'Personal de evaluaciones', 'Opera evaluaciones del día, generación, impresión y OMR'),
  ('DOCENTE', 'Docente', 'Gestiona sus grupos, bancos y evaluaciones asignadas'),
  ('VICERRECTOR', 'Vicerrector', 'Consulta y reportes de sedes asignadas')
ON CONFLICT (codigo) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion;

CREATE TABLE IF NOT EXISTS sea_usuarios_sistema (
  id BIGSERIAL PRIMARY KEY,
  usuario VARCHAR(100) NOT NULL UNIQUE,
  correo VARCHAR(150) NULL UNIQUE,
  contrasena_hash VARCHAR(100) NOT NULL,
  nombre_completo VARCHAR(150) NOT NULL,
  rol_codigo VARCHAR(50) NOT NULL,
  sedes_asignadas TEXT NOT NULL DEFAULT '',
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  ultimo_ingreso TIMESTAMP NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuario_rol FOREIGN KEY (rol_codigo) REFERENCES sea_roles_sistema (codigo)
);

CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON sea_usuarios_sistema (rol_codigo);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON sea_usuarios_sistema (activo);

INSERT INTO sea_usuarios_sistema (
  usuario,
  correo,
  contrasena_hash,
  nombre_completo,
  rol_codigo
)
VALUES (
  'admin',
  'admin@unitepc.edu.bo',
  '$2a$10$0RpF5qLCWhLt7mR5lKEj.ggKwDcCy.v2FuL1BpCbpRQT4s1KXrOS',
  'Administrador del sistema',
  'ADMINISTRADOR_SISTEMA'
)
ON CONFLICT (usuario) DO NOTHING;
