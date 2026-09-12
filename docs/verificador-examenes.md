# Verificador de exámenes

## Alcance

La rama `verficicador_v1` incorpora el rol `VERIFICADOR` para revisar bancos de preguntas que ya fueron validados. La función se aplica únicamente a exámenes con cartilla y virtuales; los exámenes sin cartilla mantienen el flujo actual.

## Flujo operativo

1. El administrador crea o edita el usuario y le asigna el rol `VERIFICADOR`.
2. En Administración de Evaluaciones se habilita la verificación para una sede o una carrera. Una regla de carrera prevalece sobre la regla general de la sede.
3. El verificador consulta los exámenes en estado `VALIDADO`, dentro de sus sedes/carreras asignadas.
4. La previsualización contiene todas las preguntas del banco, agrupadas por tipo, conserva el orden original dentro de cada grupo y muestra el número original entre paréntesis, además de una clave separada.
5. El verificador aprueba o devuelve el banco. Una devolución exige observación general o por pregunta y se muestra al docente.
6. Si el docente reemplaza el banco antes de generar, la revisión anterior se reinicia a `PENDIENTE` para el nuevo banco.

## Seguridad y datos

- La ruta y las decisiones están protegidas en frontend y backend; solo `VERIFICADOR` puede operar el módulo.
- Las asignaciones por sede, carrera y combinación académica se acumulan como unión de permisos. Sin asignaciones no hay exámenes visibles.
- La verificación está deshabilitada por defecto. Al habilitarla, el bloqueo se aplica retroactivamente a exámenes validados que todavía no fueron generados.
- El bloqueo se comprueba al solicitar la generación y al realizar la transición manual a `GENERADO`, con respuesta HTTP 409.
- Los bancos cifrados, las variantes y los PDF ya generados no se modifican.
- La migración `V37__verificacion_examenes.sql` crea el catálogo del rol, configuraciones, decisiones y auditoría.

## API principal

- `GET /api/verificacion-examenes`
- `GET /api/verificacion-examenes/{rolExamenId}`
- `POST /api/verificacion-examenes/{rolExamenId}/previsualizacion`
- `POST /api/verificacion-examenes/{rolExamenId}/decision`
- `GET /api/configuracion-evaluaciones/verificacion`
- `PUT /api/configuracion-evaluaciones/verificacion`

## Verificación local

La compilación del frontend se validó con `npm run build`. En este equipo no está instalado un JDK 21 ni se encontraba activo Docker, por lo que la compilación Spring y la migración deben validarse en el entorno de despliegue con Java 21, PostgreSQL y el stack Docker institucional.
