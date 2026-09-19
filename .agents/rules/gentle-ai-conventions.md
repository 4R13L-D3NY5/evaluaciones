# Convenciones Gentle AI™ en Sistema de Evaluaciones SEA / SISA

Este proyecto sigue las convenciones y el harness de desarrollo de **Gentle AI™** (v3.2.1) por Gentleman Programming.
Todo agente o desarrollador que opere en este repositorio debe respetar estas reglas fundamentales:

---

## 1. Work-Unit Commits (Commits por unidad de trabajo)

- **Unidad de comportamiento entregable**: Cada commit o tarea debe representar una unidad lógica, testeable y comprensible por sí misma (`feat(...)`, `fix(...)`, `refactor(...)`).
- **No commitear por tipo de archivo**: Queda prohibido hacer commits separados de "solo modelos", "solo servicios" o "solo tests". Los tests y la documentación técnica pertenecen al mismo commit que implementa o modifica la funcionalidad.
- **Presupuesto de revisión cognitiva**: Mantener los cambios en bloques manejables (presupuesto objetivo de ~400 líneas cambiadas de autoría por unidad de entrega/slice). Si una funcionalidad es más grande, se divide en slices o encadenamiento ordenado (chained/stacked PRs).
- **Mensajes de commit convencionales**:
  - `feat(modulo): descripción orientada al resultado`
  - `fix(modulo): causa resuelta y comportamiento corregido`
  - `docs(...)`, `test(...)`, `refactor(...)`, etc.

---

## 2. Metodología ODD & SDD (Organic & Spec-Driven Development)

Para cambios sustanciales o nuevas funcionalidades, seguir el ciclo de fases estructurado:
1. **Explore**: Análisis de contexto, dependencias y riesgos sin mutar código.
2. **Propose / Spec**: Especificar el alcance exacto, contratos y casos límite.
3. **Design**: Definir arquitectura, modelo de datos y diseño técnico antes de escribir código de negocio.
4. **Tasks**: Descomponer la implementación en unidades atómicas y ejecutables.
5. **Apply**: Implementar respetando TDD y arquitectura limpia (Hexagonal / DDD en Backend, Reactive / Signals en Frontend).
6. **Verify**: Comprobación rigurosa mediante tests automatizados y pruebas de integración antes de dar por cerrado el trabajo.
7. **Archive**: Consolidar evidencia y cerrar la unidad de trabajo.

---

## 3. Lossless Blocking Prompts (Prompts de bloqueo sin pérdida)

- Cuando se requiera decisión humana (cambios arquitectónicos, breaking changes, eliminación de datos o selección de alternativas de diseño):
  - **Presentar la totalidad de las opciones**, orden original y consecuencias sin resumir destructivamente ni omitir alternativas.
  - **No inferir ni seleccionar automáticamente** en nombre del usuario cuando se requiera consentimiento explícito.

---

## 4. Context Efficiency & Delegación Dinámica

- Proteger el contexto de trabajo principal de la saturación innecesaria.
- Si una tarea requiere investigación exhaustiva (lectura de 4+ archivos grandes) o generación masiva, delegar a subagentes acotados de investigación/escritura y sintetizar el resultado en el hilo principal.
- Mantener las respuestas claras, concisas, orientadas a la acción y respaldadas por evidencia verificable.

---

## 5. Integración con el Stack Institucional UNITEPC

- **Backend (Spring Boot 3.3.2 / Java 21)**: Respetar la separación en capas `api`, `application`, `domain`, `infrastructure`, `security`. Las modificaciones de base de datos siempre van acompañadas de una migración Flyway versionada en `db/migration/`.
- **Frontend (Angular 18 / Tailwind / PrimeNG)**: Componentes desacoplados, uso de standalone components y servicios fuertemente tipados.
- **Workers Python (Typst, OMR, Backups)**: Respetar el contrato de mensajes AMQP de RabbitMQ y el almacenamiento seguro en `storage/`.
- **Cifrado Vault**: Toda operación con bancos o preguntas sensibles debe respetar el envelope encryption DEK/KEK con Vault Transit.
