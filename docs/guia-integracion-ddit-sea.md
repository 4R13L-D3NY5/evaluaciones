# Guía Técnica de Integración de APIs — DDIT (SEA / SISA)

**Destinatario:** Departamento de Desarrollo e Innovación Tecnológica (DDIT)  
**Proyecto:** Sistema de Gestión de Evaluaciones (SGE / SEA)  
**Versión de API:** 1.0.0 (Spring Boot 3.3.2 / REST JSON)  
**Fecha de Publicación:** Septiembre 2026  
**Responsable Técnico:** Equipo de Arquitectura de Software  

---

## 1. Resumen Ejecutivo y Propósito

El Sistema de Evaluaciones expone una suite de servicios REST orientados a dos objetivos prioritarios para el DDIT:

1. **Portal y Aplicación del Estudiante:** Permitir a los estudiantes consultar en tiempo real su historial de evaluaciones, calificaciones oficiales sobre 60 y sobre 100 puntos, y la retroalimentación pregunta por pregunta (con respuestas marcadas, respuestas correctas del patrón oficial y preguntas anuladas).
2. **Sincronización Institucional con SISA (Actas y Calificaciones):** Permitir a los servicios de fondo del SISA/SEA sincronizar y volcar automáticamente las notas finales y de asistencia de los estudiantes por grupo (`seaGroupId`) o por examen (`rolExamenId`), eliminando la transcripción manual de actas.

---

## 2. Autenticación y Seguridad

### 2.1. Métodos de Acceso

| Tipo de Consumo | Endpoints | Mecanismo de Seguridad |
| :--- | :--- | :--- |
| **Portal Estudiante (Público/Frontend)** | `/api/consulta-estudiante/**` | Acceso directo por Matrícula (diseñado para ser consumido por el portal web/móvil autenticado del estudiante). |
| **Integración SISA / SEA (Servidor a Servidor)** | `/api/integracion/**` | **API Key** vía cabecera HTTP `X-Api-Key` o token JWT con roles `ROLE_ADMINISTRADOR_SISTEMA` / `ROLE_RESPONSABLE_EVALUACIONES`. |

### 2.2. Cabecera HTTP para Integración SISA / DDIT
En todas las peticiones a la ruta `/api/integracion/**`, el servidor del DDIT debe enviar la siguiente cabecera:

```http
X-Api-Key: <INTEGRACION_API_KEY>
Content-Type: application/json
Accept: application/json
```

> **Configuración en Servidor:**  
> La clave se parametriza en el archivo `.env` o en las variables de entorno del contenedor Docker mediante `INTEGRACION_API_KEY`.  
> *Valor por defecto en entorno de desarrollo:* `sea-dev-secret-api-key-2026`.

---

## 3. Matriz de Endpoints

| Método | Endpoint | Descripción | Parámetros Query | Cabeceras Requeridas |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/consulta-estudiante/{matricula}` | Lista todas las evaluaciones históricas y vigentes del estudiante. | `tipoParcial` *(opcional)*: `PRIMER_PARCIAL`, `SEGUNDA_INSTANCIA`, `FINAL`. | Ninguna |
| `GET` | `/api/consulta-estudiante/{matricula}/evaluacion/{rolExamenId}` | Detalle exhaustivo de una evaluación individual con desglose de reactivos y retroalimentación. | Ninguno | Ninguna |
| `GET` | `/api/integracion/grupos/{seaGroupId}/notas` | **(SISA Actas)** Obtiene las notas consolidadas de todos los estudiantes de un grupo docente por su identificador de SEA. | `tipoParcial` *(opcional)*: Filtra por parcial si el grupo tiene varios exámenes asociados. | `X-Api-Key` |
| `GET` | `/api/integracion/roles/{rolExamenId}/notas` | **(SISA Actas)** Obtiene las notas consolidadas de un examen específico a través de su `rolExamenId`. | Ninguno | `X-Api-Key` |
| `GET` | `/api/integracion/estudiantes/{matricula}/notas` | Consulta individual de notas de un estudiante para procesos batch del DDIT. | `tipoParcial` *(opcional)* | `X-Api-Key` |

---

## 4. Diferenciación Estricta por Modalidad de Examen

El sistema gestiona tres modalidades de examen con esquemas de datos diferenciados para evitar campos fantasmas o información inconsistente:

### 4.1. Presencial con Cartilla OMR (`PRESENCIAL_CARTILLA`)
- **Calificación:** Procesada automáticamente por el motor de visión computacional OMR.
- **Campos Disponibles:**
  - `variante` ("A", "B", etc.)
  - `totalReactivos` (ej. 30)
  - `aciertos`, `fallos`, `blancos`, `doblesMarcas`
  - `notaSobre60`, `notaSobre100`
  - `retroalimentacion`: Objeto con el listado pregunta por pregunta (`marcada`, `correcta`, `estado: CORRECTA | INCORRECTA | BLANCO | DOBLE_MARCA | ANULADA`).
- **Candado Criptográfico Post-Patrón:**
  - Si el examen concluyó recientemente y **aún no se han cumplido las horas de resguardo institucional** (por defecto 8 horas, configuradas en la directriz de seguridad), el objeto `retroalimentacion` reporta `patronLiberado: false` junto con el motivo del resguardo. Las respuestas correctas del docente no se exponen hasta que expire dicho plazo de seguridad.

### 4.2. Presencial sin Cartilla (`PRESENCIAL_SIN_CARTILLA`)
- **Calificación:** Ingresada por el docente mediante planilla oficial (defensas prácticas, exámenes orales, laboratorios clínicos).
- **Campos Disponibles:**
  - `notaSobre60`, `notaSobre100`
  - `asistencia` ("PRESENTE", "ABANDONO", "FALTA")
- **Campos Omitidos (Valor `null` estricto):**
  - `variante`: `null`
  - `totalReactivos`: `null`
  - `aciertos`: `null`
  - `fallos`: `null`
  - `blancos`: `null`
  - `doblesMarcas`: `null`
  - `retroalimentacion`: `null`

### 4.3. Virtual (`VIRTUAL`)
- **Calificación:** Procesada a través de la plataforma de exámenes virtuales.
- **Campos Disponibles:**
  - `notaSobre60` (equivalente ponderado), `notaSobre100`, `totalReactivos`, `aciertos`.

> **Regla de Liberación de Calificaciones:**  
> Las notas solo son visibles (`notaSobre60` y `notaSobre100` con valor numérico) cuando el examen ha alcanzado el estado de flujo `CALIFICADO` o `CONFIRMADO`. Si el examen está en estados previos (`PROGRAMADO`, `IMPRESO`, `ENTREGADO`, `RECEPCIONADO`, `EN_CALIFICACION`), los campos de notas se entregan en `null` para evitar filtraciones de borradores.

---

## 5. Especificación de Esquemas y Ejemplos JSON

### 5.1. Consulta de Historial del Estudiante
**Petición:**
```http
GET /api/consulta-estudiante/1500765 HTTP/1.1
Host: evaluaciones.unitepc.edu.bo
```

**Respuesta (`200 OK`):**
```json
[
  {
    "codigoEstudiante": "1500765",
    "nombreCompleto": "OLIVERA CONDORI MARIA ISABEL",
    "rolExamenId": "rol-enf323-2026-p1",
    "seaGroupId": "GRP-ENF-323-TA1",
    "materiaCodigo": "ENF-323",
    "materiaNombre": "TERAPIA INTENSIVA",
    "carreraCodigo": "ENF",
    "carreraNombre": "ENFERMERÍA",
    "sedeCodigo": "CBB",
    "sedeNombre": "COCHABAMBA",
    "grupo": "TA-01",
    "docenteNombre": "DRA. PAOLA LAYME",
    "tipoParcial": "PRIMER_PARCIAL",
    "fechaExamen": "2026-09-16",
    "horario": "08:00 - 09:30",
    "modalidad": "PRESENCIAL_CARTILLA",
    "modalidadDescripcion": "Presencial con Cartilla OMR",
    "estadoExamen": "CALIFICADO",
    "asistencia": "PRESENTE",
    "variante": "A",
    "notaSobre60": 52.00,
    "notaSobre100": 86.67,
    "totalReactivos": 30,
    "aciertos": 26,
    "fallos": 3,
    "blancos": 1,
    "doblesMarcas": 0,
    "retroalimentacion": {
      "patronLiberado": true,
      "motivoBloqueo": null,
      "totalPreguntas": 30,
      "preguntasAnuladas": [],
      "detallePreguntas": [
        { "pregunta": 1, "numero": 1, "marcada": "A", "correcta": "A", "estado": "CORRECTA" },
        { "pregunta": 2, "numero": 2, "marcada": "B", "correcta": "A", "estado": "INCORRECTA" }
      ]
    }
  },
  {
    "codigoEstudiante": "1500765",
    "nombreCompleto": "OLIVERA CONDORI MARIA ISABEL",
    "rolExamenId": "rol-med401-2026-p1",
    "seaGroupId": "GRP-MED-401-CB1",
    "materiaCodigo": "MED-401",
    "materiaNombre": "PEDIATRÍA CLÍNICA PRÁCTICA",
    "carreraCodigo": "MED",
    "carreraNombre": "MEDICINA",
    "sedeCodigo": "CBB",
    "sedeNombre": "COCHABAMBA",
    "grupo": "PB-02",
    "docenteNombre": "DR. MARCELO ROCHA",
    "tipoParcial": "PRIMER_PARCIAL",
    "fechaExamen": "2026-09-18",
    "horario": "10:00 - 12:00",
    "modalidad": "PRESENCIAL_SIN_CARTILLA",
    "modalidadDescripcion": "Presencial sin Cartilla (Planilla Docente)",
    "estadoExamen": "CONFIRMADO",
    "asistencia": "PRESENTE",
    "variante": null,
    "notaSobre60": 55.00,
    "notaSobre100": 91.67,
    "totalReactivos": null,
    "aciertos": null,
    "fallos": null,
    "blancos": null,
    "doblesMarcas": null,
    "retroalimentacion": null
  }
]
```

---

### 5.2. Detalle Individual con Retroalimentación OMR
**Petición:**
```http
GET /api/consulta-estudiante/1500765/evaluacion/rol-enf323-2026-p1 HTTP/1.1
Host: evaluaciones.unitepc.edu.bo
```

**Respuesta (`200 OK` con Patrón Oficial Liberado):**
```json
{
  "codigoEstudiante": "1500765",
  "nombreCompleto": "OLIVERA CONDORI MARIA ISABEL",
  "rolExamenId": "rol-enf323-2026-p1",
  "seaGroupId": "GRP-ENF-323-TA1",
  "materiaCodigo": "ENF-323",
  "materiaNombre": "TERAPIA INTENSIVA",
  "carreraNombre": "ENFERMERÍA",
  "grupo": "TA-01",
  "docenteNombre": "DRA. PAOLA LAYME",
  "tipoParcial": "PRIMER_PARCIAL",
  "fechaExamen": "2026-09-16",
  "horario": "08:00 - 09:30",
  "modalidad": "PRESENCIAL_CARTILLA",
  "modalidadDescripcion": "Presencial con Cartilla OMR",
  "estadoExamen": "CALIFICADO",
  "asistencia": "PRESENTE",
  "variante": "A",
  "notaSobre60": 52.00,
  "notaSobre100": 86.67,
  "totalReactivos": 30,
  "aciertos": 26,
  "fallos": 3,
  "blancos": 1,
  "doblesMarcas": 0,
  "retroalimentacion": {
    "patronLiberado": true,
    "motivoBloqueo": null,
    "totalPreguntas": 30,
    "preguntasAnuladas": [15],
    "detallePreguntas": [
      {
        "numero": 1,
        "marcada": "A",
        "correcta": "A",
        "estado": "CORRECTA"
      },
      {
        "numero": 2,
        "marcada": "B",
        "correcta": "A",
        "estado": "INCORRECTA"
      },
      {
        "numero": 15,
        "marcada": "C",
        "correcta": "C",
        "estado": "ANULADA"
      },
      {
        "numero": 27,
        "marcada": "-",
        "correcta": "D",
        "estado": "BLANCO"
      }
    ]
  }
}
```

> **Detalle si el patrón aún se encuentra bloqueado por tiempo:**
> ```json
> "retroalimentacion": {
>   "patronLiberado": false,
>   "motivoBloqueo": "El patrón de respuestas oficial se encuentra bajo resguardo institucional de seguridad (8 horas posteriores al examen).",
>   "totalPreguntas": 30,
>   "preguntasAnuladas": [],
>   "detallePreguntas": []
> }
> ```

---

### 5.3. Sincronización de Calificaciones para Actas SISA / SEA
**Petición:**
```http
GET /api/integracion/grupos/GRP-ENF-323-TA1/notas?tipoParcial=PRIMER_PARCIAL HTTP/1.1
Host: evaluaciones.unitepc.edu.bo
X-Api-Key: sea-dev-secret-api-key-2026
```

**Respuesta (`200 OK`):**
```json
{
  "grupo": {
    "seaGroupId": "GRP-ENF-323-TA1",
    "rolExamenId": "rol-enf323-2026-p1",
    "materiaCodigo": "ENF-323",
    "materiaNombre": "TERAPIA INTENSIVA",
    "carreraCodigo": "ENF",
    "carreraNombre": "ENFERMERÍA",
    "sedeCodigo": "CBB",
    "sedeNombre": "COCHABAMBA",
    "grupo": "TA-01",
    "docenteNombre": "DRA. PAOLA LAYME",
    "tipoParcial": "PRIMER_PARCIAL",
    "fechaExamen": "2026-09-16",
    "horario": "08:00 - 09:30",
    "modalidad": "PRESENCIAL_CARTILLA",
    "modalidadDescripcion": "Presencial con Cartilla OMR",
    "estadoExamen": "CALIFICADO",
    "totalInscritos": 42,
    "totalEvaluados": 40
  },
  "variantes": [
    {
      "letra": "A",
      "totalPreguntas": 30,
      "totalEstudiantes": 21,
      "promedioSobre60": 48.50,
      "promedioSobre100": 80.83,
      "preguntasAnuladas": [],
      "patronLiberado": true,
      "patronClaves": { "1": "A", "2": "B", "3": "A", "4": "D", "30": "C" }
    },
    {
      "letra": "B",
      "totalPreguntas": 30,
      "totalEstudiantes": 21,
      "promedioSobre60": 46.20,
      "promedioSobre100": 77.00,
      "preguntasAnuladas": [15],
      "patronLiberado": true,
      "patronClaves": { "1": "C", "2": "A", "3": "D", "4": "B", "30": "A" }
    }
  ],
  "estudiantes": [
    {
      "codigoEstudiante": "1500765",
      "nombreCompleto": "OLIVERA CONDORI MARIA ISABEL",
      "modalidad": "PRESENCIAL_CARTILLA",
      "asistencia": "PRESENTE",
      "variante": "A",
      "estadoCalificacion": "CALIFICADO",
      "notaSobre60": 52.00,
      "notaSobre100": 86.67,
      "totalReactivos": 30,
      "aciertos": 26,
      "fallos": 3,
      "blancos": 1,
      "doblesMarcas": 0,
      "respuestasDetectadas": {
        "1": "A", "2": "B", "3": "A", "4": "D", "27": "-", "30": "C"
      }
    },
    {
      "codigoEstudiante": "1500892",
      "nombreCompleto": "QUISPE MAMANI JORGE LUIS",
      "modalidad": "PRESENCIAL_CARTILLA",
      "asistencia": "FALTA",
      "variante": "B",
      "estadoCalificacion": "FALTA",
      "notaSobre60": 0.00,
      "notaSobre100": 0.00,
      "totalReactivos": 30,
      "aciertos": 0,
      "fallos": 0,
      "blancos": 30,
      "doblesMarcas": 0
    }
  ]
}
```

---

## 6. Códigos de Estado HTTP y Tratamiento de Errores

| Código | Significado | Causa común |
| :--- | :--- | :--- |
| `200 OK` | Operación exitosa. | La consulta se procesó correctamente. |
| `400 Bad Request` | Parámetros inválidos. | Parámetro `matricula`, `seaGroupId` o `rolExamenId` vacío o inexistente. |
| `401 Unauthorized` | Autenticación fallida en `/api/integracion/**`. | Falta la cabecera `X-Api-Key` o la clave no coincide con el valor configurado. |
| `404 Not Found` | Recurso no encontrado. | El examen o grupo consultado no existe o no tiene registros en el sistema. |
| `500 Internal Error` | Error de servidor. | Excepción no controlada; se registra traza en logs de backend. |

**Formato estándar de error:**
```json
{
  "timestamp": "2026-09-23T18:00:00Z",
  "status": 401,
  "error": "Acceso denegado: Se requiere una API Key válida (cabecera X-Api-Key) o sesión autorizada.",
  "path": "/api/integracion/grupos/GRP-ENF-323-TA1/notas"
}
```

---

## 7. Ejemplos de Implementación para el Consumidor

### 7.1. cURL (Pruebas de terminal)
```bash
# 1. Consulta pública por matrícula
curl -X GET "https://evaluaciones.unitepc.edu.bo/api/consulta-estudiante/1500765" \
     -H "Accept: application/json"

# 2. Sincronización de acta por grupo desde backend SISA
curl -X GET "https://evaluaciones.unitepc.edu.bo/api/integracion/grupos/GRP-ENF-323-TA1/notas?tipoParcial=PRIMER_PARCIAL" \
     -H "X-Api-Key: sea-dev-secret-api-key-2026" \
     -H "Accept: application/json"
```

### 7.2. Node.js / TypeScript (Portal del Estudiante o Microservicio SISA)
```typescript
import axios from 'axios';

interface NotaEstudiante {
  codigoEstudiante: string;
  nombreCompleto: string;
  notaSobre60: number | null;
  notaSobre100: number | null;
  asistencia: string;
}

interface SisaSincronizacionResponse {
  grupo: {
    seaGroupId: string;
    materiaNombre: string;
    totalEvaluados: number;
  };
  estudiantes: NotaEstudiante[];
}

export async function sincronizarActaSisa(seaGroupId: string, tipoParcial: string): Promise<SisaSincronizacionResponse> {
  const url = `https://evaluaciones.unitepc.edu.bo/api/integracion/grupos/${seaGroupId}/notas`;
  const response = await axios.get<SisaSincronizacionResponse>(url, {
    params: { tipoParcial },
    headers: {
      'X-Api-Key': process.env.INTEGRACION_API_KEY || 'sea-dev-secret-api-key-2026',
      'Accept': 'application/json'
    },
    timeout: 10000
  });
  return response.data;
}
```

### 7.3. PHP / Laravel (SISA Backend)
```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class EvaluacionesSyncService
{
    private string $baseUrl;
    private string $apiKey;

    public function __construct()
    {
        $this->baseUrl = config('services.evaluaciones.url', 'https://evaluaciones.unitepc.edu.bo');
        $this->apiKey = config('services.evaluaciones.api_key', 'sea-dev-secret-api-key-2026');
    }

    public function obtenerNotasGrupo(string $seaGroupId, ?string $tipoParcial = null): ?array
    {
        $response = Http::withHeaders([
            'X-Api-Key' => $this->apiKey,
            'Accept' => 'application/json'
        ])->get("{$this->baseUrl}/api/integracion/grupos/{$seaGroupId}/notas", [
            'tipoParcial' => $tipoParcial
        ]);

        if ($response->successful()) {
            return $response->json();
        }

        logger()->error("Error consultando notas de grupo {$seaGroupId}: " . $response->body());
        return null;
    }
}
```

---

## 8. Consideraciones Operativas y de Despliegue

1. **Variables de Entorno Backend:**
   - Asegurarse de que en `docker-compose.yml` o en el archivo `.env` del servidor de producción se defina:
     ```env
     INTEGRACION_API_KEY=tu_clave_secreta_institucional_compleja_2026
     ```
2. **Caché y Concurrencia:**
   - Para evitar saturación en días de publicación masiva de notas, los endpoints admiten cabeceras de caché o pueden ser balanceados a través de NGINX con `proxy_cache`.
3. **Soporte y Contacto Técnico:**
   - En caso de dudas sobre estructuras o casos especiales (exámenes por suficiencia, segundas instancias combinadas), contactar al equipo de arquitectura de Evaluaciones.
