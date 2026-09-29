# Sincronización de Nómina Oficial por Toma de Grupos Tardía

## 1. Contexto y Problemática

En los periodos de evaluación presencial y virtual, es frecuente que estudiantes realicen la **toma de grupos tardía** o regularicen su inscripción después de que el examen ya fue programado, validado, generado o incluso impreso para los primeros estudiantes registrados (por ejemplo, pasar de 3 alumnos iniciales a 5 o más alumnos).

### Riesgos que se debían evitar
- **Invalidez de exámenes ya impresos:** No se debe regenerar el lote completo si ya se imprimieron cartillas o cuadernillos para los primeros estudiantes, pues cambiaría la semilla de preguntas o las variantes ya asignadas.
- **Desfase en calificación OMR:** Los estudiantes nuevos deben quedar registrados con una variante válida y su hash de seguridad en la base de datos para que el lector OMR reconozca sus respuestas.
- **Inconsistencia de firmas:** La lista de asistencia y firmas debe reflejar la nómina completa y actualizada.

---

## 2. Solución Técnica Implementada

Se implementó una arquitectura de **sincronización diferencial no destructiva** tanto en el backend como en el frontend.

### A. Backend (Spring Boot 3.3.2)

1. **DTOs de Comunicación:**
   - [`SincronizacionNominaResponseDto`](../evaluaciones-backend/src/main/java/com/xpertiflow/evaluaciones/api/dto/SincronizacionNominaResponseDto.java): Retorna el resumen de la sincronización (total de estudiantes, cantidad y códigos de nuevos inscritos, mensaje descriptivo y la preparación actualizada).
   - [`DatosCartillaOmrDto`](../evaluaciones-backend/src/main/java/com/xpertiflow/evaluaciones/api/dto/DatosCartillaOmrDto.java): Enriquecido con `letraVariante` y `cuadernilloPdfPath` manteniendo constructores sobrecargados para compatibilidad total hacia atrás.

2. **Lógica de Sincronización ([`CartillaOmrService.java`](../evaluaciones-backend/src/main/java/com/xpertiflow/evaluaciones/application/CartillaOmrService.java)):**
   - **Examen sin generar (`PROGRAMADO` o `VALIDADO`):** Consulta la nómina oficial en el Gateway institucional y actualiza el contador `estudiantesInscritosCount` del rol de examen.
   - **Examen ya generado (`GENERADO`, `IMPRESO`, etc.):**
     - Obtiene los estudiantes de UNITEPC Gateway y los compara contra los mapeos existentes en `sea_mapeo_estudiantes_variantes`.
     - Detecta los códigos que no existían previamente.
     - Asigna variantes existentes (`ExamenVariante`) a los nuevos alumnos mediante distribución balanceada (*round-robin*), garantizando que las variantes (A, B, C...) queden equilibradas.
     - Genera para cada alumno nuevo su hash de control de seguridad (`CTL-{codigo}-{variante}`).
     - Enlaza el `cuadernilloIndividualPdf` al archivo PDF de la variante correspondiente.
     - Inserta los nuevos registros en `MapeoEstudianteVariante` dejando **completamente intactos** los registros y variantes de los estudiantes previos.
     - Actualiza el contador oficial del rol de examen.
   - **Auditoría inmutable:** Registra el evento `SINCRONIZACION_NOMINA_TOMA_GRUPOS` con el total previo, nuevo total y lista de códigos agregados.
   - **Manejo robusto de nulos:** Se corrigió la concatenación de nombres en `nombreCompleto` utilizando `Stream.of()` para tolerar apellidos nulos sin lanzar `NullPointerException`.

3. **Endpoint REST ([`CartillaOmrController.java`](../evaluaciones-backend/src/main/java/com/xpertiflow/evaluaciones/api/controller/CartillaOmrController.java)):**
   - `POST /api/roles-examen/{rolExamenId}/cartillas/sincronizar-nomina`
   - Protegido con `@PreAuthorize("hasAnyRole('ADMINISTRADOR_SISTEMA','RESPONSABLE_EVALUACIONES','PERSONAL_EVALUACIONES')")`.

4. **Pruebas Unitarias Automatizadas ([`CartillaOmrServiceTest.java`](../evaluaciones-backend/src/test/java/com/xpertiflow/evaluaciones/application/CartillaOmrServiceTest.java)):**
   - Cobertura de balanceo round-robin con nuevos alumnos.
   - Verificación de hash de seguridad y asignación de PDFs.
   - Verificación de escenario sin cambios (idempotencia).

---

### B. Frontend (Angular 18)

1. **Servicio ([`cartillas-omr.service.ts`](../evaluaciones-frontend/src/app/core/services/cartillas-omr.service.ts)):**
   - Agregada la interfaz `SincronizacionNominaResponse` y campos `letraVariante`, `cuadernilloPdfPath` en `CartillaOmr`.
   - Método `sincronizarNomina(rolExamenId: string): Observable<SincronizacionNominaResponse>`.

2. **Componente de Evaluaciones ([`evaluaciones-dia.component.ts`](../evaluaciones-frontend/src/app/pages/evaluaciones-dia/evaluaciones-dia.component.ts)):**
   - **Botón de Sincronización:** En la cabecera del modal de Marcas OMR y Lista de Estudiantes, se integró el botón `[ Sincronizar nómina (Toma de grupos) ]` con spinner reactivo y bloqueo contra doble clic.
   - **Columna de Variante:** Muestra la insignia visual de la variante asignada (`Tipo A`, `Tipo B`, etc.).
   - **Columna de Descarga de Examen:** Botón `[ Descargar ]` que abre directamente el PDF del examen correspondiente al alumno.
   - **Impresión Actualizada:** Al pulsar `[ Imprimir marcas ]` o `[ Imprimir lista ]`, el backend sobreimprime las cartillas OMR y la planilla de firmas incluyendo a todos los estudiantes (originales y nuevos).

---

## 3. Procedimiento Operativo de Ahora en Adelante

Cuando un docente o personal reporte que se inscribieron nuevos estudiantes tras la toma de grupos tardía, se debe seguir este flujo estándar:

```
[Estudiante realiza toma de grupo tardía en SEA/UNITEPC]
                         │
                         ▼
[Personal abre módulo "Evaluaciones del Día" en el sistema]
                         │
                         ▼
[Clic en "Marcas OMR / Lista" de la evaluación correspondiente]
                         │
                         ▼
[Clic en botón "Sincronizar nómina (Toma de grupos)"]
                         │
           ┌─────────────┴─────────────┐
           ▼                           ▼
[Si examen NO estaba generado]     [Si examen YA estaba generado / impreso]
• Actualiza conteo oficial         • Detecta solo a los alumnos nuevos
• En la generación ordinaria       • Asigna variante balanceada (round-robin)
  se incluirán todos               • Genera hash de seguridad CTL-{código}-{variante}
                                   • Habilita botón individual "Descargar examen"
                                   • Al pulsar "Imprimir marcas", genera la cartilla
                                     adicional sin alterar los exámenes previos
```

### Reglas de Operación:
1. **Nunca anular ni regenerar el examen completo si ya se imprimieron copias:**
   - La sincronización se encarga automáticamente de crear el mapeo individual sin tocar las pruebas de los compañeros.
2. **Impresión del examen para el alumno rezagado:**
   - Si solo se necesita el examen para el 6to alumno, hacer clic en el botón **`[ Descargar ]`** en su fila respectiva dentro del modal de Marcas OMR e imprimir solo esa prueba.
3. **Impresión de Marcas OMR y Firmas:**
   - Hacer clic en **`[ Imprimir marcas ]`** para obtener la cartilla OMR del nuevo estudiante, o **`[ Imprimir lista ]`** para tener la hoja de firmas con todos los alumnos.
4. **Calificación OMR:**
   - Al escanear la cartilla del nuevo estudiante, el sistema leerá el código del estudiante y su variante asignada normalmente, calificando sus respuestas con la clave oficial de esa variante.
