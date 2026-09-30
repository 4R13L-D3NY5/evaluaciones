# Sincronización Push de Calificaciones Teóricas al Gateway SEA / SISA (T-045)

## 1. Resumen Ejecutivo y Objetivo

Este documento detalla la arquitectura, implementación y guía operativa del módulo de **Sincronización Push de Calificaciones Teóricas** hacia la API institucional de UNITEPC.

El objetivo central es automatizar el volcado de notas de exámenes teóricos (sobre 100 puntos) generadas y consolidadas en el Sistema de Evaluaciones (SEA / SISA), eliminando la carga manual y burocrática para docentes y personal administrativo, protegiendo al mismo tiempo la integridad de los estudiantes ausentes o reprogramados.

---

## 2. Especificación Técnica de la API Institucional UNITEPC

### Endpoint y Autenticación
* **Método**: `POST`
* **URL Base Dev**: `https://gw-dev.unitepc.solutions/api/v1/university/externals/research`
* **Ruta**: `/student-evaluations`
* **Cabeceras obligatorias**:
  * `Authorization: Bearer <access_token>` (obtenido mediante OAuth2 Client Credentials con `UNITEPC_CLIENT_ID` y `UNITEPC_CLIENT_SECRET`)
  * `clientId: sea-evaluaciones` (cabecera requerida por el Gateway)
  * `Content-Type: application/json`

### Contrato de Entrada (`ResearchStudentEvaluationRegisterInput`)
```json
{
  "syllabusCourseId": "7f5f0d4e-2e0b-4d8b-a8f1-9f5b2c2e3a11",
  "groupId": "8a6c2d13-6d9c-45f3-9f20-1c1e7b5a9d22",
  "students": [
    {
      "studentOldCode": 5178397,
      "score": 85
    },
    {
      "studentOldCode": 4466316,
      "score": 72
    },
    {
      "studentOldCode": 8004816,
      "score": 60
    }
  ]
}
```

### Contrato de Respuesta (`List<ResearchStudentEvaluationRegisterResponse>`)
```json
[
  {
    "syllabusCourseId": "7f5f0d4e-2e0b-4d8b-a8f1-9f5b2c2e3a11",
    "groupId": "8a6c2d13-6d9c-45f3-9f20-1c1e7b5a9d22",
    "oldCode": 5178397,
    "completed": true
  },
  {
    "syllabusCourseId": "7f5f0d4e-2e0b-4d8b-a8f1-9f5b2c2e3a11",
    "groupId": "8a6c2d13-6d9c-45f3-9f20-1c1e7b5a9d22",
    "oldCode": 4466316,
    "completed": false
  }
]
```

---

## 3. Decisiones Arquitectónicas Implementadas

### A. Sandbox / Mock Gateway Local Persistente (Aislamiento de Riesgo)
Al tratarse de calificaciones institucionales, **no se pueden realizar pruebas destructivas en la API real**. Se construyó un entorno de pruebas controlado y persistente en el backend:
1. **Migración Flyway V48** (`sea_mock_gateway_calificaciones`):
   * Almacena: `id`, `syllabus_course_id`, `group_id`, `student_old_code`, `score`, `client_id`, `recibido_en`, `actualizado_en`, `intentos_recibidos` y `raw_request_json`.
   * Restricción única sobre `(group_id, syllabus_course_id, student_old_code)` que soporta `UPSERT` automático e incrementa el contador de intentos ante re-envíos.
2. **Controlador Mock** (`MockUnitepcGatewayController`):
   * Emula el token OAuth2 y el endpoint `/api/v1/university/externals/research/student-evaluations`.
   * Provee endpoints de inspección:
     * `GET /api/mock-gateway/calificaciones` (ver registros persistidos en la BD).
     * `DELETE /api/mock-gateway/calificaciones/limpiar` (vaciar tabla de pruebas).
3. **Toggle de Enrutamiento en `UnitepcGatewayClient`**:
   * Mediante la propiedad `app.unitepc.mock-evaluations-enabled: true` (o variable de entorno `UNITEPC_MOCK_EVALUATIONS_ENABLED`), el cliente HTTP conmuta automáticamente entre el mock local y el gateway real sin alterar código.

### B. Sincronización Incremental (Delta) — Protección a Estudiantes Ausentes
* **Problema evitado**: Asignar un `0` preventivo a los estudiantes que no asistieron bloquearía o distorsionaría su historial antes de que tengan derecho a justificación, reprogramación o rezagado.
* **Regla de negocio implementada**:
  * El servicio `SincronizacionNotasSeaService` consolida la lista de inscritos.
  * Solo los estudiantes que cuenten con una calificación efectiva (`score != null`, entre 0 y 100) son incluidos en el array `students` del POST.
  * Los estudiantes ausentes o pendientes quedan omitidos del envío al SEA, marcados con la observación local: `Pendiente de evaluación / Ausente`.
  * Si un estudiante ausente posteriormente rinde un examen oral reprogramado o rezagado, el usuario vuelve a presionar "Sincronizar" y el sistema envía el nuevo delta sin conflictos.

### C. Unificación de Nómina en el Modal "Notas OMR"
* **Problema resuelto**: Anteriormente, el modal "Marcas OMR" mostraba a los 50 estudiantes inscritos, mientras que "Notas OMR" solo mostraba a los 3 calificados físicamente, generando confusión respecto a si faltaban estudiantes en la evaluación.
* **Solución**:
  * `OmrProcesamientoService.listarCalificaciones` ahora cruza `sea_mapeo_estudiantes_variantes` con `sea_calificaciones_omr`.
  * La tabla de "Notas OMR" ahora lista a los 50 estudiantes completos:
    * Calificados: muestran variante, aciertos, nota `/60`, nota `/100` y estado `APROBADO`.
    * Ausentes / Pendientes: muestran variante, guiones `—` y badge `SIN NOTA / AUSENTE`.
    * Cada estudiante ausente cuenta con un botón directo `Reprog.` para registrar su examen oral reprogramado sin salir del modal.
    * El encabezado resume: `Calificaciones registradas: X de Y (Z reprogramado(s))`.

### D. Blindaje de Auditoría Inmutable y Transaccionalidad
* Se solucionó el fallo `Transaction silently rolled back`: la tabla `sea_auditoria_evaluaciones` tiene restricción `NOT NULL` en `ip_origen`. Se configuró la captura de la IP real en el controlador y un valor por defecto seguro (`127.0.0.1`) con `@Builder.Default` en la entidad JPA `AuditoriaEvaluacion`.

---

## 4. Estructura de Componentes Modificados

```
evaluaciones-backend/
├── src/main/java/com/xpertiflow/evaluaciones/
│   ├── api/controller/
│   │   ├── MockUnitepcGatewayController.java          # Servidor Mock Gateway persistente
│   │   ├── SincronizacionSeaController.java           # Endpoint REST de sincronización y previa
│   │   └── OmrProcesamientoController.java            # Listado unificado de calificaciones
│   ├── application/
│   │   ├── SincronizacionNotasSeaService.java         # Lógica delta y mapeo de calificaciones teóricas
│   │   └── OmrProcesamientoService.java               # Cruce de nómina completa con notas OMR
│   ├── domain/entity/
│   │   ├── MockGatewayCalificacion.java               # Entidad JPA para el sandbox
│   │   └── AuditoriaEvaluacion.java                   # Entidad con ipOrigen garantizada
│   ├── domain/repository/
│   │   └── MockGatewayCalificacionRepository.java     # Repositorio JPA del sandbox
│   └── infrastructure/gateway/
│       └── UnitepcGatewayClient.java                  # Cliente HTTP con toggle mock/real
├── src/main/resources/db/migration/
│   └── V48__sandbox_mock_gateway_calificaciones.sql   # DDL del sandbox
└── src/test/java/
    ├── api/controller/MockUnitepcGatewayControllerTest.java
    └── application/SincronizacionNotasSeaServiceTest.java

evaluaciones-frontend/
└── src/app/pages/evaluaciones-dia/
    └── evaluaciones-dia.component.ts                  # Botón nube, modal previa y tabla 50/50 en Notas OMR
```

---

## 5. Guía de Uso para el Usuario / Operador

1. **Acceso al Examen**:
   * En `http://localhost:4200/evaluaciones-dia`, ubicar la materia evaluada (por ejemplo, *PSICOLOGÍA MÉDICA*).
   * El examen debe estar en estado **Calificado** o **Confirmado**.
2. **Revisar Notas OMR de la Nómina Completa**:
   * Hacer clic en el ícono de **Notas OMR** (hoja de lista).
   * Se apreciará la lista completa (50 estudiantes): los 3 calificados con su nota y los 47 ausentes como `SIN NOTA / AUSENTE`.
   * Si un estudiante ausente regulariza su situación de forma oral, hacer clic en `Reprog.` en su fila para registrar su calificación sobre 100.
3. **Transmitir al Gateway SEA**:
   * En la columna **Acciones**, hacer clic en el botón celeste con ícono de nube (`pi pi-cloud-upload`).
   * Se abrirá el modal **"INTEGRACIÓN INSTITUCIONAL - ACTAS SISA/SEA"**.
   * Se previsualizan los estudiantes listos para envío y los ausentes omitidos.
   * Presionar **"Sincronizar calificaciones con SEA"**.
   * El sistema devuelve el reporte de éxito (`completed: true`) y actualiza el estado de la evaluación como sincronizada.

---

## 6. Procedimiento para Pase a Producción

Cuando la API de UNITEPC esté oficialmente disponible en producción:

1. **Configurar Variables de Entorno en `docker-compose.yml` o Servidor**:
   ```yaml
   UNITEPC_GATEWAY_BASE_URL: https://gw.unitepc.solutions/api/v1/university/externals/research
   UNITEPC_CLIENT_ID: <CLIENT_ID_PRODUCCION>
   UNITEPC_CLIENT_SECRET: <CLIENT_SECRET_PRODUCCION>
   UNITEPC_SYSTEM_CLIENT_ID: sea-evaluaciones
   UNITEPC_MOCK_EVALUATIONS_ENABLED: false   # <-- Cambiar a false para salir del sandbox
   ```
2. **Reinicio de Servicios**:
   ```bash
   docker compose up -d backend
   ```
   No se requiere ninguna modificación de código ni migración adicional.

---

## 7. Estado de la Tarea y Git

* **Rama activa**: `feat/sandbox-sincronizacion-sea`
* **Repositorios actualizados**:
  * GitHub: `origin/feat/sandbox-sincronizacion-sea`
  * GitLab UNITEPC: `gitlab/feat/sandbox-sincronizacion-sea`
* **Tablero Kanban**: Tarea `T-045` en estado **`En revisión`** (`review`).
