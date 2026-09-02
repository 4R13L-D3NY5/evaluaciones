# Módulo de seguridad y acceso interno

## Alcance

El sistema utiliza autenticación interna con sesión HTTP y autorización por roles. La sesión se crea en el backend después de validar usuario y contraseña; el frontend no guarda contraseñas ni tokens en `localStorage`.

## Roles

| Código | Alcance |
|---|---|
| `ADMINISTRADOR_SISTEMA` | Acceso total. |
| `RESPONSABLE_EVALUACIONES` | Campus, carreras, evaluaciones, tiempos y parámetros. |
| `PERSONAL_EVALUACIONES` | Evaluaciones del día, generación, impresión y calificación OMR. |
| `DOCENTE` | Bancos de preguntas y salas virtuales propias; sin acceso al Plan de Estudios ni a la Lista de Evaluaciones. |
| `VICERRECTOR` | Lectura y reportes de sedes asignadas. |
| `DIRECTOR_CARRERA` | Gestión y consulta del rol de exámenes de las carreras asignadas. |

## Endpoints

- `POST /api/auth/login`: crea la sesión interna.
- `GET /api/auth/session`: devuelve el usuario autenticado.
- `POST /api/auth/logout`: invalida la sesión.
- `POST /api/auth/cambiar-contrasena`: completa el cambio obligatorio de la contraseña temporal.

La administración de usuarios se encuentra documentada en [módulo de usuarios, roles y alcance académico](modulo-usuarios-accesos.md). Las cuentas nuevas usan el CI como usuario y contraseña temporal; el primer ingreso exige definir una contraseña personal. Los alcances por sede y carrera se almacenan en relaciones separadas y se importan mediante columnas marcables del Excel.

Las rutas del frontend tienen guards por rol y los endpoints operativos del backend aplican `@PreAuthorize`. Para docentes, el acceso ya se filtra por el CI oficial del docente recibido desde SEA en grupos, materias y banco de preguntas; el resto de consultas de evaluaciones, OMR, virtuales y reportes debe completar el mismo control antes de pasar a producción.

## Usuario inicial de desarrollo

La migración crea el usuario `admin` con la contraseña inicial `Admin123!` exclusivamente para habilitar el primer acceso local. Debe cambiarse o reemplazarse antes de cualquier despliegue compartido o productivo.
