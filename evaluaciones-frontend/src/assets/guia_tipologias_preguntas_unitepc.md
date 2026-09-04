# Guía Oficial de Tipologías de Preguntas para el Banco de Evaluaciones UNITEPC

Documento técnico y pedagógico de referencia para la elaboración, estructuración y validación del **Banco de Preguntas Institucional** en formato Excel (ormato_banco_preguntas_asig_EF.xlsx), conforme a los lineamientos psicométricos y normativos de la **Universidad Técnica Privada Cosmos (UNITEPC)** y el sistema **SEA / SISA (XpertiFlow)**.

---

## 1. Estructura General del Archivo Excel (ormato_banco_preguntas_asig_EF.xlsx)

Cada reactivo en la hoja **Banco** se estructura en las siguientes columnas. `imagen_base64` es opcional:

| Columna | Nombre de Campo | Descripción | Valores Permitidos / Reglas |
| :---: | :--- | :--- | :--- |
| **A** | 	ipo | Tipología pedagógica oficial del reactivo | Lista desplegable con los 8 nombres oficiales |
| **B** | grupo | Código identificador de agrupación | Requerido en Casos y Emparejamientos (ej. CASO-01, EMP-01) |
| **C** | enunciado | Texto de la pregunta, caso o instrucción | Texto claro sin opciones incrustadas |
| **D** | opcion_a | Inciso A / Proposición 1 / Opción V/F / Clave 1 | Texto de la opción o autocompletado automático |
| **E** | opcion_b | Inciso B / Proposición 2 / Opción V/F / Clave 2 | Texto de la opción o autocompletado automático |
| **F** | opcion_c | Inciso C / Proposición 3 / Clave 3 | Texto de la opción o autocompletado automático |
| **G** | opcion_d | Inciso D / Proposición 4 / Clave 4 | Texto de la opción o autocompletado automático |
| **H** | opcion_e | Inciso E / Clave 5 | Texto de la opción; queda vacía en las tipologías que la deshabilitan |
| **I** | espuesta_correcta | Clave o letra de la opción correcta | A, B, C, D, E (o vacía en encabezados) |
| **J** | dificultad | Nivel taxonómico del reactivo | 1 (Fácil), 2 (Medio), 3 (Difícil) |
| **K** | parcial | Tipo de evaluación programada | 1P, 2P, EF, 2T |
| **L** | observaciones | Diagnóstico automático de consistencia | No editar; se calcula automáticamente |
| **M** | imagen_base64 | Imagen opcional para mostrar debajo del enunciado en el examen virtual | Data URI `data:image/png;base64,...` o Base64 puro; PNG, JPEG, WEBP o GIF; máximo 512 KB. La herramienta puede agregar `#sea-size=GRANDE`, `#sea-size=MEDIANA`, `#sea-size=PEQUENA` o `#sea-size=MUY_PEQUENA` para conservar el tamaño visual sin otra columna |

### Imagen opcional en Base64

Agregue la columna `imagen_base64` en la hoja **Banco** para mostrar una imagen dentro de una pregunta. Se recomienda usar una data URI completa, por ejemplo:

`data:image/png;base64,iVBORw0KGgoAAAANSUhEUg...`

El tamaño puede conservarse en el mismo valor mediante uno de estos metadatos: `#sea-size=GRANDE`, `#sea-size=MEDIANA` (predeterminado), `#sea-size=PEQUENA` o `#sea-size=MUY_PEQUENA`.

También se acepta Base64 puro, que se interpreta como PNG. La imagen se valida y se muestra automáticamente debajo del enunciado en el examen virtual. Por el límite de una celda de Excel, la cadena no debe superar 32767 caracteres y la imagen decodificada no debe superar 512 KB. El previsualizador permite elegir Grande, Mediana (predeterminada), Pequeña o Muy pequeña y conserva esa elección en el fragmento de la data URI; no se agrega una columna de tamaño.

---

## 2. Las 6 Tipologías Pedagógicas Oficiales

`mermaid
mindmap
  root((Tipologías UNITEPC))
    1. V/F Simple
      Verdadero
      Falso
    2. V/F Complejas
      4 Proposiciones
      Claves A-E fijas
    3. Premisas A/B/Ambas/Ninguna
      Premisa I
      Premisa II
    4. Selección Mejor Respuesta
      5 Distractores A-E
      1 Clave Única
    5. Casos Clínicos / Problemas
      Enunciado Troncal (Grupo)
      Subítems Dependientes
    6. Emparejamiento Ampliado
      Matriz de Claves A-E
      Enunciados de Cotejo
`

---

## 3. Especificación Detallada y Ejemplos por Tipología

---

### Tipología 1: Verdadero o Falso Simple

* **Objetivo Pedagógico**: Evaluar el conocimiento factual, la discriminación de conceptos fundamentales o la veracidad de una afirmación directa.
* **Estructura en Excel**:
  * 	ipo: Verdadero o Falso Simple
  * grupo: *Debe dejarse vacío*
  * enunciado: Afirmación categórica y unívoca (sin ambigüedades).
  * opcion_a: Verdadero *(Autocompletado automático en Excel)*
  * opcion_b: Falso *(Autocompletado automático en Excel)*
  * opcion_c, opcion_d, opcion_e: *Deben dejarse vacíos*
  * espuesta_correcta: A (si es Verdadero) o B (si es Falso).
  * dificultad: 1 (Nivel Fácil).

#### 📌 Ejemplo 1.1 (Área Contabilidad / Auditoría Tributaria)
* **Enunciado**: *El principio contable de devengado establece que los ingresos y gastos deben reconocerse en el ejercicio en que se generan legalmente, con independencia del momento efectivo de su cobro o pago.*
* **Opciones**:
  * **A:** Verdadero
  * **B:** Falso
* **Respuesta Correcta**: A
* **Dificultad**: 1
* **Justificación**: El postulado de devengado es la base de la imputación temporal en la normativa contable y tributaria vigente (Ley 843 y D.S. 24051).

#### 📌 Ejemplo 1.2 (Área Ciencias de la Salud / Medicina)
* **Enunciado**: *El nodo sinoauricular actúa como el marcapasos fisiológico natural del corazón humano debido a su mayor frecuencia intrínseca de despolarización.*
* **Opciones**:
  * **A:** Verdadero
  * **B:** Falso
* **Respuesta Correcta**: A
* **Dificultad**: 1

#### 📌 Ejemplo 1.3 (Área Ingeniería / Redes)
* **Enunciado**: *En el modelo OSI, el protocolo IP opera en la capa de transporte para garantizar la entrega secuencial y libre de errores de los paquetes de datos.*
* **Opciones**:
  * **A:** Verdadero
  * **B:** Falso
* **Respuesta Correcta**: B *(Falso, opera en la capa de Red y no garantiza entrega confiable; esa es función de TCP en Transporte)*.
* **Dificultad**: 1

---

### Tipología 2: Verdadero o Falso Complejas

* **Objetivo Pedagógico**: Evaluar el análisis de múltiples condiciones, variables interrelacionadas o criterios donde varias afirmaciones pueden ser simultáneamente verdaderas o falsas.
* **Estructura en Excel**:
  * 	ipo: Verdadero o Falso Complejas
  * grupo: *Debe dejarse vacío*
  * enunciado: Instrucción contextual de evaluación (ej. *"Determine la veracidad de las siguientes proposiciones..."*).
  * opcion_a: 1. [Texto de la proposición 1]
  * opcion_b: 2. [Texto de la proposición 2]
  * opcion_c: 3. [Texto de la proposición 3]
  * opcion_d: 4. [Texto de la proposición 4]
  * opcion_e: *Deshabilitada / Vacía*. La letra E no se escribe aquí.
  * espuesta_correcta: Clave institucional de combinación (A, B, C, D o E):
    * **A:** 1, 2 y 3 son verdaderas
    * **B:** 1 y 3 son verdaderas
    * **C:** 2 y 4 son verdaderas
    * **D:** Solo 4 es verdadera
    * **E:** Todas son verdaderas
  * dificultad: 2 (Nivel Medio).

#### 📌 Ejemplo 2.1 (Área Auditoría Tributaria)
* **Enunciado**: *Respecto a los requisitos de deducibilidad del Impuesto sobre las Utilidades de las Empresas (IUE) según la Ley 843 y el D.S. 24051, analice las siguientes afirmaciones:*
* **Proposiciones**:
  * **1.** El gasto debe estar respaldado documentalmente con facturas o documentos originales equivalentes.
  * **2.** Los gastos deben estar necesariamente vinculados a la actividad gravada y dirigidos a la obtención y conservación de la fuente.
  * **3.** Las transacciones mayores o iguales a Bs 50.000 deben contar obligatoriamente con documento fehaciente de bancarización.
  * **4.** Las donaciones a entidades del sector público son deducibles hasta el 50% de la utilidad neta imponible del ejercicio.
* **Clave de Respuesta**: A *(1, 2 y 3 son verdaderas; la proposición 4 es falsa puesto que el límite legal es del 10%)*.
* **Dificultad**: 2

#### 📌 Ejemplo 2.2 (Área Farmacología / Salud)
* **Enunciado**: *En relación con los fármacos inhibidores de la enzima convertidora de angiotensina (IECA) en el tratamiento de la hipertensión arterial:*
* **Proposiciones**:
  * **1.** Disminuyen los niveles plasmáticos de angiotensina II y aldosterona.
  * **2.** Están formalmente contraindicados durante el segundo y tercer trimestre del embarazo debido a su efecto teratógeno.
  * **3.** La tos seca persistente es un efecto adverso mediado por la acumulación de bradicinina.
  * **4.** Aumentan la excreción renal de potasio produciendo hipopotasemia severa.
* **Clave de Respuesta**: A *(1, 2 y 3 son verdaderas; la 4 es falsa ya que producen retención de potasio e hiperpotasemia)*.
* **Dificultad**: 2

---

### Tipología 3: Respuesta A / B / Ambas / Ninguna (Relación de Premisas)

* **Objetivo Pedagógico**: Evaluar la relación lógica de causa-efecto o la contrastación de dos postulados teóricos independientes.
* **Estructura en Excel**:
  * 	ipo: Respuesta A/B/Ambas/Ninguna
  * grupo: *Debe dejarse vacío*
  * enunciado: Debe redactarse obligatoriamente con las dos premisas numeradas en números romanos:
    `	ext
    I. [Texto de la primera premisa]
    II. [Texto de la segunda premisa]
    `
  * opcion_a: A. Si la primera es verdadera *(Autocompletado automático)*
  * opcion_b: B. Si la segunda es verdadera *(Autocompletado automático)*
  * opcion_c: C. Si ambas son verdaderas *(Autocompletado automático)*
  * opcion_d: D. Si ninguna es verdadera *(Autocompletado automático)*
  * opcion_e: *Deshabilitada / Vacía*
  * espuesta_correcta: A, B, C o D.
  * dificultad: 2 (Medio) o 3 (Difícil).

#### 📌 Ejemplo 3.1 (Área Auditoría y Derecho Tributario)
* **Enunciado**:
  `	ext
  I. El crédito fiscal IVA contenido en facturas emitidas a nombre del sujeto pasivo es computable únicamente cuando la compra corresponde al rubro de la actividad gravada.
  II. Las retenciones tributarias efectuadas a proveedores informales de servicios extinguen la obligación del contribuyente frente al SIN sin requerir declaración jurada mensual.
  `
* **Opciones**:
  * **A:** Si la primera es verdadera
  * **B:** Si la segunda es verdadera
  * **C:** Si ambas son verdaderas
  * **D:** Si ninguna es verdadera
* **Respuesta Correcta**: A *(La I es verdadera; la II es falsa puesto que toda retención debe ser declarada y empozada mediante los formularios 570 y 410)*.
* **Dificultad**: 2

#### 📌 Ejemplo 3.2 (Área Fisiología / Bioquímica)
* **Enunciado**:
  `	ext
  I. La insulina estimula la captación de glucosa en el tejido muscular esquelético y adiposo mediante la traslocación de transportadores GLUT-4 a la membrana celular.
  II. El glucagón hepático promueve la gluconeogénesis y la glucogenólisis durante los periodos de ayuno para mantener la euglucemia.
  `
* **Respuesta Correcta**: C *(Ambas son verdaderas)*.
* **Dificultad**: 2

---

### Tipología 4: Selección de la Mejor Respuesta

* **Objetivo Pedagógico**: Evaluar la capacidad de juicio crítico y discernimiento entre 5 opciones plausibles, donde una de ellas representa la respuesta óptima, completa o canónica.
* **Estructura en Excel**:
  * 	ipo: Selección de la mejor respuesta
  * grupo: *Debe dejarse vacío*
  * enunciado: Pregunta clara, directa o caso breve con interrogante específica.
  * opcion_a a opcion_e: Las 5 alternativas de respuesta bien formuladas (sin incisos como "todas las anteriores" o "ninguna de las anteriores" para mantener la calidad psicométrica).
  * espuesta_correcta: A, B, C, D o E.
  * dificultad: 1, 2 o 3.

#### 📌 Ejemplo 4.1 (Área Auditoría Tributaria)
* **Enunciado**: *¿Cuál es el efecto jurídico del vencimiento del término probatorio en un proceso de fiscalización sin que la Administración Tributaria haya emitido la correspondiente Resolución Determinativa dentro del plazo de sesenta (60) días computables?*
* **Opciones**:
  * **A:** No opera la caducidad ni la prescripción, pero se suspende el cómputo de intereses moratorios a favor del contribuyente hasta la notificación del acto definitivo.
  * **B:** Opera la caducidad automática de pleno derecho y la nulidad absoluta de todo lo actuado en la fiscalización.
  * **C:** Se convalida la declaración jurada original presentada por el contribuyente quedando extinguida la deuda tributaria.
  * **D:** La Administración Tributaria queda inhabilitada permanentemente para fiscalizar el periodo revisado.
  * **E:** El proceso pasa de oficio a la Autoridad Regional de Impugnación Tributaria (ARIT) para dictamen pericial.
* **Respuesta Correcta**: A
* **Dificultad**: 3

#### 📌 Ejemplo 4.2 (Área Ingeniería de Software)
* **Enunciado**: *En una arquitectura de microservicios orientada a eventos, ¿cuál es el patrón de diseño idóneo para garantizar la consistencia eventual entre bases de datos independientes sin emplear transacciones distribuidas bloqueantes (2PC)?*
* **Opciones**:
  * **A:** Patrón Saga (Orquestación / Coreografía)
  * **B:** Patrón Singleton Concurrente
  * **C:** Patrón Strangler Fig
  * **D:** Patrón Circuit Breaker
  * **E:** Patrón Bulkhead
* **Respuesta Correcta**: A
* **Dificultad**: 2

---

### Tipología 5: Ítems Agrupados por Caso Clínico o Problema

* **Objetivo Pedagógico**: Evaluar la resolución de problemas contextualizados, toma de decisiones diagnósticas, cálculos numéricos o análisis de casos reales mediante un tronco común y preguntas dependientes.
* **Estructura en Excel (2 Tipos de Fila)**:
  1. **Fila Madre (Tronco del Caso)**:
     * 	ipo: Ítems agrupados por caso clínico o problema
     * grupo: Identificador alfanumérico único (ej. CASO-TRIB1 o CASO-CLI01).
     * enunciado: Narrativa completa del caso clínico, situación empresarial o problema técnico.
     * opcion_a a opcion_e: *Vacías*
     * espuesta_correcta: *Vacía*
     * dificultad: *Vacía*
  2. **Filas Hijas (Subítems de Caso)**:
     * 	ipo: Subítem de caso o problema
     * grupo: Mismo código del caso madre (ej. CASO-TRIB1).
     * enunciado: Pregunta específica derivada del caso.
     * opcion_a a opcion_e: 5 opciones completas.
     * espuesta_correcta: A, B, C, D o E.
     * dificultad: 2 o 3.

#### 📌 Ejemplo 5 (Caso Práctico Tributario con 2 Subítems)

##### Fila Madre (Tronco):
* **Tipo**: Ítems agrupados por caso clínico o problema
* **Grupo**: CASO-TRIB1
* **Enunciado**:
  > *Caso Práctico: Durante la auditoría tributaria externa a la empresa industrial "Manufacturas del Valle S.A." (sujeto pasivo del Régimen General) correspondiente a la gestión 2025, el equipo auditor identificó los siguientes hallazgos:*
  > *1. Facturas de compra de materia prima por un importe total de Bs 200.000 pagadas en efectivo mediante caja chica sin documento de bancarización.*
  > *2. Venta de subproductos por Bs 80.000 registrada contablemente como "Ingresos no gravados" y no facturada.*
  > *3. Depreciación de maquinaria industrial calculada por el método de unidades de producción sin autorización previa de la Administración Tributaria.*

##### Fila Hija 1 (Subítem 1):
* **Tipo**: Subítem de caso o problema
* **Grupo**: CASO-TRIB1
* **Enunciado**: *Respecto a las facturas de compras por Bs 200.000 pagadas en efectivo sin respaldo de bancarización, ¿cuál es el reparo tributario aplicable en la determinación del IUE (25%) y del Crédito Fiscal IVA (13%)?*
* **Opciones**:
  * **A:** Pérdida del crédito fiscal IVA (Bs 26.000) e impugnación del gasto como no deducible para el IUE (Reparo IUE Bs 50.000).
  * **B:** Solo procede la sanción por deberes formales de 500 UFV, manteniéndose el cómputo del crédito fiscal.
  * **C:** El gasto es deducible para el IUE pero se descuenta el 50% del IVA crédito fiscal.
  * **D:** Se admite el crédito fiscal si se presenta el recibo de caja de egreso firmado por el proveedor.
  * **E:** La falta de bancarización únicamente afecta transacciones superiores a Bs 500.000.
* **Respuesta Correcta**: A
* **Dificultad**: 3

##### Fila Hija 2 (Subítem 2):
* **Tipo**: Subítem de caso o problema
* **Grupo**: CASO-TRIB1
* **Enunciado**: *Sobre la venta de subproductos omitida de facturación por Bs 80.000, ¿cuál es la tipificación de la conducta según el Código Tributario Boliviano (Ley 2492)?*
* **Opciones**:
  * **A:** Omisión de pago culposa con clausura preventiva del establecimiento de 6 a 48 días.
  * **B:** Delito tributario de Defraudación con pena privativa de libertad automática.
  * **C:** Contravención de no emisión de factura con sanción directa de clausura o convertibilidad a multa.
  * **D:** Error aritmético subsanable mediante nota de débito/crédito.
  * **E:** Exención de oficio por tratarse de subproductos residuales.
* **Respuesta Correcta**: C
* **Dificultad**: 2

---

### Tipología 6: Emparejamiento Ampliado

* **Objetivo Pedagógico**: Evaluar la asociación, clasificación y correspondencia entre un conjunto de definiciones/categorías y múltiples enunciados o términos específicos.
* **Estructura en Excel (2 Tipos de Fila)**:
  1. **Fila Madre (Encabezado de Emparejamiento)**:
     * 	ipo: Emparejamiento Ampliado
     * grupo: Identificador único (ej. EMP-TRIB1).
     * enunciado: Instrucción de emparejamiento (ej. *"De la siguiente lista de opciones, seleccione la respuesta correspondiente para cada enunciado..."*).
     * opcion_a a opcion_e: De 2 a 5 opciones maestras / conceptos de referencia.
     * espuesta_correcta: *Vacía*
     * dificultad: *Vacía*
  2. **Filas Hijas (Opciones a Emparejar)**:
     * 	ipo: Opción de Emparejamiento Ampliado
     * grupo: Mismo código del emparejamiento madre (ej. EMP-TRIB1).
     * enunciado: Concepto, premisa o definición que debe ser asociada con una de las letras del encabezado.
     * opcion_a a opcion_e: *Vacías*
     * espuesta_correcta: Letra asignada (A, B, C, D o E).
     * dificultad: 1 o 2.

#### 📌 Ejemplo 6 (Emparejamiento de Tipos de Auditoría Tributaria)

##### Fila Madre (Lista de Opciones):
* **Tipo**: Emparejamiento Ampliado
* **Grupo**: EMP-TRIB1
* **Enunciado**: *De la siguiente lista de tipos de fiscalización y verificación tributaria, seleccione la opción que corresponda a cada una de las definiciones operativas presentadas:*
* **Opciones Maestras**:
  * **A:** Verificación Externa Focalizada
  * **B:** Fiscalización Integral y Total
  * **C:** Verificación de Deberes Formales (Operativo Coercitivo)
  * **D:** Control de Facturación en Punto Fijo
  * **E:** Fiscalización de Precios de Transferencia

##### Filas Hijas (Enunciados a Emparejar):

* **Fila Hija 1**:
  * **Tipo**: Opción de Emparejamiento Ampliado
  * **Grupo**: EMP-TRIB1
  * **Enunciado**: *Intervención presencial directa de funcionarios del SIN en el local del contribuyente durante jornadas continuas para registrar la emisión efectiva de facturas por cada venta.*
  * **Respuesta Correcta**: D
  * **Dificultad**: 1

* **Fila Hija 2**:
  * **Tipo**: Opción de Emparejamiento Ampliado
  * **Grupo**: EMP-TRIB1
  * **Enunciado**: *Proceso exhaustivo de auditoría con orden formal que abarca todos los impuestos aplicables, libros, registros contables y documentación de respaldo de una o más gestiones fiscales completas.*
  * **Respuesta Correcta**: B
  * **Dificultad**: 2

* **Fila Hija 3**:
  * **Tipo**: Opción de Emparejamiento Ampliado
  * **Grupo**: EMP-TRIB1
  * **Enunciado**: *Revisión puntual y específica de una transacción, un crédito fiscal particular o un proveedor determinado mediante requerimiento de información documental.*
  * **Respuesta Correcta**: A
  * **Dificultad**: 1

---

## 4. Cuotas Institucionales de Dificultad y Exámenes

De acuerdo con el reglamento de evaluaciones UNITEPC, cada banco debe cumplir estrictamente con la siguiente distribución porcentual:

| Parcial / Evaluación | Fáciles (Nivel 1) | Medias (Nivel 2) | Difíciles (Nivel 3) | Total Reactivos |
| :--- | :---: | :---: | :---: | :---: |
| **1er Parcial** | 15 (25%) | 30 (50%) | 15 (25%) | **60 preguntas** |
| **2do Parcial** | 15 (25%) | 30 (50%) | 15 (25%) | **60 preguntas** |
| **Examen Final** | 30 (25%) | 60 (50%) | 30 (25%) | **120 preguntas** |
| **2da Instancia** | 10 (20%) | 25 (50%) | 15 (30%) | **50 preguntas** |

---

## 5. Resumen de Buenas Prácticas y Errores Frecuentes

### ✅ Buenas Prácticas
1. **Utilizar la Plantilla Oficial (ormato_banco_preguntas_asig_EF.xlsx)**: Aprovechar las fórmulas de autocompletado y listas desplegables.
2. **Revisar la Columna observaciones**: Debe mostrar **OK** en cada fila antes de subir el archivo a la plataforma.
3. **Agrupadores Claros**: Usar nombres consistentes y sin espacios para los grupos de casos (CASO-01) y emparejamientos (EMP-01).
4. **Fórmulas Matemáticas**: Escribirlas entre signos $ en sintaxis Typst (ej. $ FSPL = 20 log(d) + 92.45 $ o $ "IUE" = 150.000 times 25% $).

### ❌ Errores que Invalidan el Banco
* Dejar celdas vacías en opciones de Selección Múltiple (se requieren las 5 opciones A-E).
* Escribir claves distintas a A o B en Verdadero/Falso.
* No indicar el código de grupo en un subítem de caso o en una opción de emparejamiento.
* Asignar dificultad o respuesta a la fila madre de un caso clínico o emparejamiento (deben ir vacías).
* No alcanzar las cuotas de 15 fáciles, 30 medias y 15 difíciles requeridas para el parcial.
