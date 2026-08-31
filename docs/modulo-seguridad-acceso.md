# Módulo de seguridad y acceso interno

## Alcance

El sistema utiliza autenticación interna con sesión HTTP y autorización por roles. La sesión se crea en el backend después de validar usuario y contraseña; el frontend no guarda contraseñas ni tokens en `localStorage`.

## Roles

| Código | Alcance |
|---|---|
| `ADMINISTRADOR_SISTEMA` | Acceso total. |
| `RESPONSABLE_EVALUACIONES` | Campus, carreras, evaluaciones, tiempos y parámetros. |
| `PERSONAL_EVALUACIONES` | Evaluaciones del día, generación, impresión y calificación OMR. |
| `DOCENTE` | Grupos propios, bancos de preguntas y evaluaciones asignadas. |
| `VICERRECTOR` | Lectura y reportes de sedes asignadas. |

## Endpoints

- `POST /api/auth/login`: crea la sesión interna.
- `GET /api/auth/session`: devuelve el usuario autenticado.
- `POST /api/auth/logout`: invalida la sesión.

Las rutas del frontend tienen guards por rol y los endpoints operativos del backend aplican `@PreAuthorize`. El filtrado definitivo por sede, carrera y grupo debe completarse en cada consulta de negocio antes de pasar a producción.

## Usuario inicial de desarrollo

La migración crea el usuario `admin` con la contraseña inicial `Admin123!` exclusivamente para habilitar el primer acceso local. Debe cambiarse o reemplazarse antes de cualquier despliegue compartido o productivo.
