# Módulo Rol de Exámenes

## Alcance de esta iteración

La importación masiva del menú **Rol de Exámenes** acepta la planilla oficial de directores de carrera `SIS ROL DE EXAMENES II-2026.xlsx`.

La fuente que se procesa es la hoja **Rol de Examenes**. Las demás hojas del libro no se utilizan para registrar roles en esta iteración.

## Estructura oficial procesada

- La lectura inicia en la fila 12.
- Columnas `B:F`: asignatura, código, semestre, grupo y nombre del docente.
- Columnas `G:L`: fechas y horas de 1er parcial, 2do parcial y examen final teóricos.
- Columnas `AN:AO`: fecha y hora de segunda instancia.
- Las columnas de exámenes prácticos no se registran todavía.

Cada fila puede generar hasta cuatro roles:

1. 1er Parcial.
2. 2do Parcial.
3. Final.
4. 2da Instancia.

## Reglas de importación

- La asignatura se valida contra el catálogo oficial de SEA.
- El grupo se valida contra SEA usando la asignatura y el código del grupo.
- El docente y el horario oficial de SEA tienen prioridad; si SEA no devuelve el nombre del docente, se utiliza el nombre escrito en la planilla y, como último respaldo, el CI del docente.
- Las fechas numéricas propias de Excel se convierten a fecha ISO para guardar y a `DD/MM/AAAA` para mostrar.
- Las horas numéricas de Excel se convierten a `HH:mm`.
- Todos los roles importados quedan inicialmente en estado `PROGRAMADO`.
- Las únicas modalidades oficiales son `PRESENCIAL_CARTILLA` (Con Cartilla), `PRESENCIAL_SIN_CARTILLA` (Sin Cartilla) y `VIRTUAL` (Virtual).
- La hoja oficial no trae una columna de modalidad. Cuando el grupo tiene formato `TA-##` (teórico), se asigna automáticamente `PRESENCIAL_CARTILLA`.
- Todos los roles existentes se consideran versión 1 cuando no tenían versionado previo.
- Una nueva importación para el mismo grupo y tipo de parcial recibe la siguiente versión disponible (`V2`, `V3`, etc.), aunque la fecha sea la misma.
- La importación posterior no reemplaza la versión anterior: conserva `V1` y registra una nueva versión correlativa.
- Si una fila aparece repetida con el mismo grupo, parcial y fecha dentro del mismo archivo, se omite y se informa la fila afectada.
- Una fecha faltante afecta únicamente al examen de esa columna; los demás exámenes válidos de la fila pueden importarse.
- Las observaciones se muestran antes de importar, con mensajes comprensibles para el usuario.
- La visualización predeterminada de los listados se ordena por código de asignatura; los empates se ordenan por grupo, tipo de parcial y versión.
- La importación dispone de una opción explícita para "Eliminar y subir nuevamente". Solo elimina coincidencias en `PROGRAMADO` o `VALIDADO`; los estados `GENERADO` y posteriores quedan protegidos.
- La edición y eliminación individual solo están disponibles en `PROGRAMADO` o `VALIDADO`, y la regla también se valida en el backend.

## Persistencia y seguridad operativa

La importación envía los roles válidos al backend y PostgreSQL mediante el servicio oficial de roles. No se utiliza `localStorage` ni datos ficticios para completar materias, grupos o docentes.

## Bitácora en Lista de Evaluaciones

- La acción de bitácora del menú **Lista de Evaluaciones** utiliza el icono de reloj y consulta la auditoría persistida del rol.
- La ventana muestra todas las actividades registradas, la etapa de origen y destino, la fecha y hora de finalización, el usuario responsable y el motivo cuando corresponde.
- El flujo de estados también muestra, al pasar el cursor sobre una etapa completada, la fecha, hora y usuario que la completó.
- Las actividades se registran en `sea_auditoria_evaluaciones` y no dependen de datos ficticios del navegador.

## Pendiente

- Confirmar si en una siguiente versión las columnas de exámenes prácticos también deben convertirse en roles.
- Mostrar una advertencia visible si el título de la carrera en la cabecera del Excel no coincide con la carrera seleccionada, aunque los códigos de asignatura sí sean válidos en SEA.
- Agregar pruebas automatizadas con una copia reducida de la hoja oficial y casos con fechas vacías, grupos inexistentes y duplicados.
