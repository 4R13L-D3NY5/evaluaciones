# Guía Operativa: Rol Talento Humano y Ratificación Docente por Materia

Esta guía describe el funcionamiento, flujo de configuración y operación del módulo de **Ratificación de Docentes por Asignatura** y el rol **Talento Humano (`TALENTO_HUMANO`)** en el Sistema de Evaluación Académica (SEA).

---

## 1. Reglas Institucionales de Negocio

### A. Criterio de Ratificación por Materia
La evaluación docente se consolida en una escala sobre **100 puntos**:
- **Evaluación del Director de Carrera:** Máximo **50 puntos** (ponderado del test de directores).
- **Evaluación de los Estudiantes:** Máximo **50 puntos** (ponderado de las evaluaciones estudiantiles de esa materia/grupo).
- **Nota Final Consolidada:** $\text{Nota Director (50)} + \text{Nota Estudiantes (50)} = \text{Nota Final (100)}$.

**Estados automáticos según nota:**
- **$\ge 71$ puntos $\implies$ RATIFICADO** en la asignatura.
- **$\le 70$ puntos $\implies$ NO RATIFICADO** en la asignatura.

> [!IMPORTANT]
> **La ratificación es estrictamente por materia dictada.** Un docente que dicta tres materias puede resultar ratificado en dos y no ratificado en una, dependiendo de sus calificaciones independientes en cada asignatura.

### B. Override y Auditoría Administrativa
Usuarios evaluadores autorizados (rol `TALENTO_HUMANO`, `ADMINISTRADOR_SISTEMA` o Vicerrectores habilitados) tienen la potestad de cambiar manualmente el estado entre `RATIFICADO` y `NO RATIFICADO`.
- Cada modificación exige un **motivo obligatorio** (mínimo 5 caracteres).
- El sistema registra quién realizó el cambio, fecha, hora y justificación.
- En la interfaz y reportes, estas materias quedan señaladas con el distintivo **"Manual"**.

---

## 2. Paso a Paso: Creación del Usuario (Administrador)

### Opción A: Registrar un nuevo usuario con rol Talento Humano
1. Inicie sesión con una cuenta de **Administrador del Sistema**.
2. En la barra lateral, ingrese a **Usuarios y accesos** (`/usuarios`).
3. Presione el botón **"Registrar usuario"**.
4. Complete los datos:
   - **CI / Usuario:** Documento de identidad o identificador institucional (la clave inicial por defecto es el mismo CI).
   - **Nombre Completo:** Ej. *Lic. Brayan Cabeño*.
   - **Rol:** Seleccione en el menú desplegable la opción **"Talento Humano"**.
   - **Alcance Académico:** Puede dejarse con alcance institucional general o restringirse a sedes particulares.
5. Presione **"Guardar usuario"**.

### Opción B: Utilizar el usuario preconfigurado por migración
La migración institucional `V72` ya sembró el usuario inicial:
- **Usuario:** `brayan.cabeno`
- **Correo:** `brayan.cabeno@unitepc.edu.bo`
- **Rol:** `TALENTO_HUMANO`
- **Estado:** Activo con permisos de ratificación habilitados.

---

## 3. Paso a Paso: Operación del Evaluador de Talento Humano

### A. Acceso y Control de Menú
1. Inicie sesión con las credenciales del usuario con rol `TALENTO_HUMANO`.
2. El sistema lo redirigirá directamente al módulo de **Evaluación Docente** (`/evaluacion-docente`).
3. El menú lateral está restringido: solo tendrá visible y operable el módulo de Evaluación Docente.

### B. Reporte Consolidado "Ratificación por Materia"
1. En la parte superior de la pantalla, seleccione la pestaña **"Ratificación por Materia"**.
2. Filtre por la **Sede** y **Carrera** deseada.
3. Se desplegará la tabla con todas las materias dictadas por los docentes:
   - `Docente` y `CI`.
   - `Materia` y `Grupo`.
   - `Nota Director (50)`.
   - `Nota Estudiantes (50)`.
   - `Nota Total (100)`.
   - `Estado Oficial` (`RATIFICADO` en verde / `NO RATIFICADO` en rojo).
4. **Cambiar estado de ratificación:**
   - En la columna derecha, haga clic en el botón **"Cambiar"**.
   - Seleccione el nuevo estado (`RATIFICADO` o `NO_RATIFICADO`).
   - Ingrese el **Motivo de la modificación** académica/administrativa.
   - Guarde los cambios. La fila se actualizará inmediatamente con el sello **"Manual"**.
5. **Descargar Reportes Oficiales:**
   - Botón **"Exportar Excel"**: genera una planilla `.xlsx` con la nómina completa, notas discriminadas, porcentajes de participación y justificaciones manuales.
   - Botón **"Exportar PDF"**: genera el documento oficial institucional para firmas y archivo.

### C. Operación desde "Evaluación por Docentes" (Desglose por Asignatura)
1. Seleccione la pestaña **"Evaluación por Docentes"**.
2. Al expandir el bloque de cualquier docente para ver sus materias asignadas:
   - Cada tarjeta de asignatura muestra su badge (`RATIFICADO` o `NO RATIFICADO`).
   - Los usuarios autorizados disponen del botón **"Cambiar Ratificación"** para ajustar el estado directamente sin abandonar la vista del docente.

### D. Reporte de "Cumplimiento Institucional"
1. En la pestaña **"Cumplimiento Institucional"**, visualice los porcentajes de avance:
   - Cobertura de evaluación por directores de carrera.
   - Cobertura y porcentaje de participación estudiantil por carrera y sede.

---

## 4. Configuración para Vicerrectores y Personal Designado

Si se requiere que vicerrectores específicos (o personal como Lic. Camacho o Ing. Grinelda) cuenten con permisos para modificar ratificaciones:
1. Ingrese como **Administrador** a **Administración del Sistema** (`/administracion`).
2. En la sección de configuración de usuarios/vicerrectores, active la casilla o interruptor **"Modificar Ratificación Docente"** (`puedeModificarRatificacionDocente`).
3. Al guardar, el usuario heredará la capacidad de ratificar o desratificar materias con la misma auditoría obligatoria.

---

## 5. Cierre Institucional del Período de Evaluación
El Administrador del Sistema dispone en la cabecera del módulo del botón **"Cerrar Período de Evaluación"**.
- Al cerrar el período, se bloquea el registro de nuevas evaluaciones tanto para directores como para estudiantes en toda la universidad.
- Las consultas de reportes, descargas y ratificaciones permanecen 100% operativas para su análisis post-evaluación.
