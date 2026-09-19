# Contexto y Protocolo de Generación de Exámenes y Bancos de Preguntas (SEA / SISA)

Este archivo define el contexto operativo, las reglas pedagógicas y la especificación técnica para que un agente de IA ingeste recursos didácticos (.pdf, .docx, .pptx) y genere un banco de preguntas en formato Excel (`.xlsx`) 100% compatible con el sistema **SEA / SISA**.

---

## 1. Parámetros de Invocación (Configura aquí tus variables)

Cuando desees generar un examen o banco de preguntas, completa o pasa estos parámetros al invocar el agente:

```yaml
configuracion_examen:
  # Datos Académicos
  asignatura: "Nombre de la Asignatura"
  carrera: "Carrera correspondiente"
  sede: "Sede académica"
  # Parcial: 1P (Primer Parcial) | 2P (Segundo Parcial) | EF (Examen Final) | 2I (Segunda Instancia)
  parcial: "EF" 
  
  # Directorio y Selección Granular de Recursos
  ruta_carpeta_recursos: "C:/ruta/a/la/carpeta/recursos"
  recursos_fuente:
    - archivo: "manual_patologia.pdf"
      paginas: "10-15, 24-30" # Rango o lista de páginas específicas
      temas_clave: ["Fiebre y respuesta inflamatoria", "Mediadores químicos"]
    - archivo: "diapositivas_unidad2.pptx"
      diapositivas: "5-28" # Rango de diapositivas
      temas_clave: ["Vía intrínseca y extrínseca de coagulación"]
    - archivo: "guia_estudio.docx"
      secciones: "Todas"
  
  # Perfil de Configuración y Dificultad
  perfil_seleccionado: "OFICIAL_SEA_60" # Opciones: OFICIAL_SEA_60, RAPIDO_30, CASOS_CLINICOS, PERSONALIZADO
  
  # Desglose de reactivos evaluables (Cuotas oficiales: 15 Fáciles / 30 Medias / 15 Difíciles = 60 Total)
  desglose_reactivos:
    - tipo: "Verdadero o Falso Simple"
      cantidad: 15
      dificultad: 1
    - tipo: "Respuesta A/B/Ambas/Ninguna"
      cantidad: 5
      dificultad: 2
    - tipo: "Selección de la mejor respuesta"
      cantidad: 15
      dificultad: 2
    - tipo: "Emparejamiento Ampliado"
      cantidad: 10 # 2 bloques madre (5 claves cada uno) con 5 preguntas de relación cada uno
      dificultad: 2
    - tipo: "Verdadero o Falso Complejas"
      cantidad: 5
      dificultad: 3
    - tipo: "Ítems agrupados por caso clínico o problema"
      cantidad: 10 # 2 casos clínicos madre con 5 subítems evaluables cada uno
      dificultad: 3
  
  total_preguntas_evaluables: 60
  total_filas_excel: 64 # 60 reactivos evaluables + 2 madres de emparejamiento + 2 madres de caso clínico
  
  # Archivo de salida esperado
  archivo_salida: "banco_preguntas_[asignatura]_[parcial].xlsx"
```

---

## 2. Fórmulas de Invocación (Copia y Pega)

Puedes invocar al agente utilizando cualquiera de estas dos modalidades:

### Opción 1: Invocación Detallada (Recomendada con desglose explícito)

> "Actúa según el archivo `examen.md` para generar el banco `.xlsx` oficial con los siguientes parámetros:
> - **Asignatura**: [Nombre de la Asignatura]
> - **Parcial**: [1P / 2P / EF / 2I] *(Primer Parcial, Segundo Parcial, Final o Segunda Instancia)*
> - **Carpeta de recursos**: `[Ruta/a/carpeta/recursos]`
> - **Fuentes específicas**: Extraer estrictamente de `ejemplo.pdf` (páginas 10-15) y `clase.pptx` (slides 5-20).
> - **Estructura y distribución de 60 reactivos (15 fáciles / 30 medios / 15 difíciles)**:
>   1. **15** Verdadero o Falso Simple (Dificultad 1 - Fácil).
>   2. **5** Respuesta A/B/Ambas/Ninguna (Dificultad 2 - Medio).
>   3. **15** Selección de la mejor respuesta (Dificultad 2 - Medio).
>   4. **10** Emparejamientos ampliados (Dificultad 2 - Medio), estructurados en 2 bloques madre de 5 opciones clave y 5 ítems de relación cada uno.
>   5. **5** Verdadero o Falso Complejas (Dificultad 3 - Difícil).
>   6. **10** Subítems de Caso Clínico (Dificultad 3 - Difícil), estructurados en 2 casos clínicos madre con 5 preguntas cada uno.
> Asegura que las 4 filas madre no lleven dificultad ni respuesta directa, que las fórmulas lleven delimitadores `$ ... $` y genera el archivo Excel final listo para carga."

### Opción 2: Invocación Compacta (Referenciando el perfil oficial)

> "Actúa según `examen.md` para la asignatura **[Nombre]**, parcial **[EF / 1P / 2P]**, leyendo los recursos en `[Ruta]` (específicamente `ejemplo.pdf` págs 10-15), aplicando el perfil **OFICIAL_SEA_60** con su desglose por defecto (15 fáciles, 30 medios, 15 difíciles) y generando el archivo `.xlsx` listo para importar."

---

## 3. Alternativas de Configuración (Perfiles Predefinidos)

Elige una de las siguientes alternativas según el objetivo de tu evaluación:

### Alternativa A: Perfil "Oficial SEA Estricto" (El estándar institucional de 60 reactivos)
*   **Total de reactivos evaluables**: 60 (mínimo exigido por el backend).
*   **Total de filas en Excel**: 64 (incluyendo 2 madres de caso y 2 madres de emparejamiento).
*   **Cuota de dificultad exacta**:
    *   $\ge 15$ Fáciles (`1`) — 25% (15 V/F simples)
    *   $\ge 30$ Medios (`2`) — 50% (15 Selección mejor respuesta + 5 A/B/Ambas/Ninguna + 10 Emparejamientos)
    *   $\ge 15$ Difíciles (`3`) — 25% (5 V/F complejas + 10 Casos clínicos)

### Alternativa B: Perfil "Evaluación Rápida / Quizz de Unidad"
*   **Total de reactivos**: 20 a 30 reactivos.
*   **Cuota de dificultad**: 30% Fácil (`1`), 50% Medio (`2`), 20% Difícil (`3`).
*   **Distribución tipológica**:
    *   80% **Selección de la mejor respuesta**.
    *   20% **Verdadero o Falso Simple**.
*   *Uso*: Pruebas cortas, repasos de aula, diagnósticos rápidos sin estructuras agrupadas.

### Alternativa C: Perfil "Razonamiento Clínico / Casos Prácticos"
*   **Total de reactivos**: 60 reactivos.
*   **Cuota de dificultad**: 15 Fáciles (`1`), 30 Medias (`2`), 15 Difíciles (`3`).
*   **Distribución tipológica**:
    *   $3$ a $4$ **Casos Clínicos Madre** con 4 a 5 subítems cada uno (total: 15-20 preguntas de caso).
    *   $2$ **Emparejamientos Ampliados** (total: 10 preguntas).
    *   $30$ a $35$ reactivos de **Selección de la mejor respuesta** basados en viñetas de aplicación práctica.
*   *Uso*: Medicina, Enfermería, Odontología, Derecho o Ingeniería orientada a resolución de problemas.

### Alternativa D: Perfil "Taxonomía de Bloom Cognitiva"
*   **Nivel 1 (Fácil / Dificultad 1)**: Recordar y Comprender (conceptos directos, definiciones normativas, valores de referencia, terminología).
*   **Nivel 2 (Medio / Dificultad 2)**: Aplicar y Analizar (interpretación de un caso o problema, cálculo, deducción a partir de premisas).
*   **Nivel 3 (Difícil / Dificultad 3)**: Evaluar y Sintetizar (diagnóstico diferencial, elección de conducta terapéutica o estrategia óptima entre alternativas viables).

---

## 3. Especificación Técnica Oficial de Columnas (Hoja `Banco`)

El archivo Excel resultante debe contener una hoja llamada exactamente **`Banco`** con las siguientes columnas en la Fila 1:

| Columna | Nombre oficial | Obligatorio | Descripción / Reglas de Validación |
| :--- | :--- | :--- | :--- |
| **A** | `tipo` | Sí | Nombre oficial de la tipología (ver tabla en sección 4). |
| **B** | `grupo` | Condicional | Obligatorio para casos clínicos y emparejamientos (ej. `CASO-01`, `EMP-01`). Vacío para preguntas sueltas. |
| **C** | `enunciado` | Sí | Texto de la pregunta o caso. Máx 10.000 caracteres. Delimitar fórmulas matemáticas con `$ ... $`. |
| **D** | `opcion_a` | Condicional | Inciso A. En V/F simple: `"Verdadero"`. En V/F complejas: Inciso `1. ...`. |
| **E** | `opcion_b` | Condicional | Inciso B. En V/F simple: `"Falso"`. En V/F complejas: Inciso `2. ...`. |
| **F** | `opcion_c` | Condicional | Inciso C. En V/F complejas: Inciso `3. ...`. Vacío si no aplica. |
| **G** | `opcion_d` | Condicional | Inciso D. En V/F complejas: Inciso `4. ...`. Vacío si no aplica. |
| **H** | `opcion_e` | Condicional | Inciso E. Deshabilitado / vacío en V/F simple, V/F complejas y premisas A/B/Ambas/Ninguna. |
| **I** | `respuesta_correcta` | Condicional | Letra única: `A`, `B`, `C`, `D` o `E`. Vacía en filas madre. |
| **J** | `dificultad` | Condicional | `1` (Fácil), `2` (Medio), `3` (Difícil). Vacía en filas madre. |
| **K** | `parcial` | Opcional | `1P`, `2P`, `EF` o `2I`. Debe ser idéntico en todo el banco. |
| **L** | `observaciones` | Opcional | Justificación docente, referencia del libro/página (ej: *Pág 12 PDF*), o validación. |

---

## 4. Tipologías Oficiales Aceptadas por el Validador SEA

| Tipología Oficial (Columna `tipo`) | Opciones requeridas | `respuesta_correcta` | `dificultad` | `grupo` |
| :--- | :--- | :--- | :--- | :--- |
| `Selección de la mejor respuesta` | A, B, C, D, E completas y distintas | `A`, `B`, `C`, `D` o `E` | `1`, `2` o `3` | Vacío |
| `Verdadero o Falso Simple` | A=`"Verdadero"`, B=`"Falso"`, C-E vacías | `A` o `B` | `1`, `2` o `3` | Vacío |
| `Verdadero o Falso Complejas` | A a D llevan los incisos `1.`, `2.`, `3.`, `4.`; E vacía | `A`, `B`, `C`, `D` o `E` | `1`, `2` o `3` | Vacío |
| `Respuesta A/B/Ambas/Ninguna` | A a D predeterminadas (I y II en enunciado); E vacía | `A`, `B`, `C` o `D` | `1`, `2` o `3` | Vacío |
| `Ítems agrupados por caso clínico o problema` | Sin opciones (A-E vacías) | **Vacía** | **Vacía** | Obligatorio (ej: `CASO-1`) |
| `Subítem de caso o problema` | A, B, C, D, E completas | `A`, `B`, `C`, `D` o `E` | `1`, `2` o `3` | Mismo código del caso madre |
| `Emparejamiento Ampliado` | A a E llevan las 2 a 5 opciones clave maestras | **Vacía** | **Vacía** | Obligatorio (ej: `EMP-1`) |
| `Opción de Emparejamiento Ampliado` | Sin opciones (A-E vacías; el enunciado es la premisa a emparejar) | Letra de la clave: `A`-`E` | `1`, `2` o `3` | Mismo código del emparejamiento madre |

> [!IMPORTANT]
> **Reglas de Bloques Agrupados (Casos y Emparejamientos)**:
> 1. Toda fila madre (`Ítems agrupados por caso clínico o problema` o `Emparejamiento Ampliado`) debe preceder inmediatamente a sus subítems (entre 2 y 10 subítems).
> 2. No pueden haber filas intermedias ajenas al grupo entre la madre y sus hijas.
> 3. Las filas madre **NO** llevan `dificultad` ni `respuesta_correcta`. Sus subítems **SÍ** las llevan.

---

## 5. Reglas de Calidad Pedagógica y Psicométrica

Al extraer el texto de las páginas indicadas y redactar las preguntas:

1.  **Fidelidad a las Fuentes**: Todas las preguntas deben fundamentarse estrictamente en los fragmentos leídos (ej: páginas 10 a 15 de `ejemplo.pdf`). No inventar datos externos ni contradecir la bibliografía provista.
2.  **Distractores Homogéneos y Plausibles**:
    *   Las 4 opciones incorrectas deben representar errores de razonamiento o confusiones conceptuales verosímiles.
    *   Todas las opciones deben tener una longitud gramatical y complejidad similar. Evitar que la opción correcta sea el triple de larga.
3.  **Prohibiciones Expresas**:
    *   **NO** usar *"Todas las anteriores"* ni *"Ninguna de las anteriores"*.
    *   **NO** usar dobles negaciones (ej: *"¿Cuál de las siguientes NO es INCORRECTA?"*).
    *   **NO** dejar opciones con texto idéntico o repetido.
4.  **Sintaxis Matemática / Símbolos**:
    *   Delimitar toda expresión matemática con `$ ... $`.
    *   Solo usar comandos admitidos por la plantilla Typst: `\times`, `\cdot`, `\rightarrow`, `\to`, `\pm`, `\equiv`.

---

## 6. Pipeline de Ejecución (Paso a Paso para el Agente)

Cuando se invoque este archivo de contexto:

```
[1. LECTURA DE FUENTES]
  └── Ingestar los archivos (.pdf, .docx, .pptx) de la carpeta según los rangos de páginas/slides indicados.
  
[2. SÍNTESIS CONCEPTUAL]
  └── Extraer conceptos primarios, mecanismos, casos y hechos evaluables.
  
[3. REDACCIÓN Y CATEGORIZACIÓN]
  └── Redactar las preguntas según el perfil elegido respetando las cuotas exactas de dificultad (15/30/15).
  
[4. CONTROL DE CALIDAD PREVIO (DRY-RUN)]
  └── Verificar:
      - 60 filas de reactivos (o total configurado).
      - Mínimos de dificultad cumplidos (>=15 fáciles, >=30 medios, >=15 difíciles).
      - Enunciados de casos con dificultad vacía.
      - Respuestas correctas apuntando a opciones válidas.
      
[5. GENERACIÓN DEL EXCEL OFICIAL (.xlsx)]
  └── Ejecutar el script generador headless (Python) para volcar la estructura en la hoja "Banco" del .xlsx final.
```

---

## 7. Script Headless de Generación Excel (Python)

Script de soporte listo para que el agente vuelque los datos generados directamente en el `.xlsx`:

```python
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment

def crear_banco_excel(ruta_salida, parcial, lista_preguntas):
    """
    Genera el archivo .xlsx oficial con la hoja 'Banco' requerida por SEA/SISA.
    lista_preguntas es una lista de diccionarios con las llaves oficiales:
    tipo, grupo, enunciado, opcion_a, opcion_b, opcion_c, opcion_d, opcion_e,
    respuesta_correcta, dificultad, observaciones
    """
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = "Banco"
    
    headers = [
        "tipo", "grupo", "enunciado", 
        "opcion_a", "opcion_b", "opcion_c", "opcion_d", "opcion_e", 
        "respuesta_correcta", "dificultad", "parcial", "observaciones"
    ]
    
    ws.append(headers)
    for col_num in range(1, len(headers) + 1):
        cell = ws.cell(row=1, column=col_num)
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill(start_color="1F497D", end_color="1F497D", fill_type="solid")
        cell.alignment = Alignment(horizontal="center", vertical="center")
    
    for p in lista_preguntas:
        ws.append([
            p.get("tipo", "Selección de la mejor respuesta"),
            p.get("grupo", ""),
            p.get("enunciado", ""),
            p.get("opcion_a", ""),
            p.get("opcion_b", ""),
            p.get("opcion_c", ""),
            p.get("opcion_d", ""),
            p.get("opcion_e", ""),
            p.get("respuesta_correcta", ""),
            p.get("dificultad", ""),
            parcial,
            p.get("observaciones", "")
        ])
    
    wb.save(ruta_salida)
    print(f"Banco generado exitosamente en: {ruta_salida}")
```
