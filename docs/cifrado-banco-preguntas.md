# Cifrado del banco de preguntas

## Alcance implementado

El banco se guarda como un paquete JSON cifrado con AES-256-GCM. Cada banco y
cada variante reciben una DEK aleatoria distinta. La DEK se envuelve mediante
Vault Transit; PostgreSQL conserva solamente el ciphertext, nonce, referencia y
versión de la KEK, algoritmo, hash de integridad y metadatos operativos.

Los reactivos persistidos en `sea_reactivos` conservan únicamente metadatos no
sensibles después de la carga o migración. Las preguntas, opciones, imágenes,
respuestas correctas, orden de variantes y claves OMR se recuperan solamente
durante el proceso autorizado que los necesita.

La integración está abstraída por `KeyManagementProvider`. El adaptador actual
es `VaultTransitKeyManagementProvider`; por ello la conexión futura a un KMS
externo no cambia el flujo funcional ni el modelo de datos.

## Puesta en marcha provisional

El servicio Vault del `docker-compose.yml` usa almacenamiento persistente en el
volumen `vaultdata`. No usa el modo desarrollo en memoria. La primera
inicialización debe realizarla el custodio autorizado, fuera de la aplicación.

1. Definir fuera del repositorio las variables `VAULT_BACKEND_TOKEN`,
   `VAULT_WORKER_TOKEN`, `VAULT_OMR_TOKEN` y las credenciales habituales del
   entorno. No copiar tokens reales a `.env.example` ni a la base de datos.
2. Iniciar únicamente Vault:

   ```text
   docker compose up -d vault
   ```

3. Inicializar Vault y conservar las claves de desbloqueo fuera del servidor,
   bajo custodia institucional. El comando imprime material sensible y no debe
   registrarse en tickets, logs ni repositorios:

   ```text
   docker compose exec vault vault operator init -key-shares=5 -key-threshold=3
   ```

4. Desbloquear Vault con el umbral institucional de claves. Luego habilitar
   Transit y crear la KEK no exportable:

   ```text
   docker compose exec vault vault secrets enable transit
   docker compose exec vault vault write -f transit/keys/sea-banco-kek \
     type=aes256-gcm96 exportable=false allow_plaintext_backup=false deletion_allowed=false
   ```

5. Aplicar las políticas incluidas y crear tres tokens técnicos. El token
   administrativo inicial no debe quedar configurado en backend ni workers:

   ```text
   docker compose exec vault vault policy write sea-backend /vault/policies/backend.hcl
   docker compose exec vault vault policy write sea-worker /vault/policies/worker.hcl
   docker compose exec vault vault policy write sea-omr /vault/policies/omr.hcl
   docker compose exec vault vault token create -policy=sea-backend
   docker compose exec vault vault token create -policy=sea-worker
   docker compose exec vault vault token create -policy=sea-omr
   ```

   Los tokens resultantes se inyectan como `VAULT_BACKEND_TOKEN`,
   `VAULT_WORKER_TOKEN` y `VAULT_OMR_TOKEN` desde el entorno de ejecución.

6. Revocar el token administrativo inicial cuando se confirme que las tres
   identidades técnicas funcionan. Mantener Vault accesible solo por la red
   interna; el puerto publicado está limitado a `127.0.0.1`.

> La configuración provisional usa HTTP solamente dentro de la red Docker para
> facilitar el arranque urgente. Antes de exponer el servidor fuera de esa red,
> se debe habilitar TLS en el listener y montar certificados gestionados por la
> institución. No publicar el puerto 8200 directamente a Internet.

## Migración de información existente

1. Confirmar que Vault esté inicializado, desbloqueado y que el backend pueda
   usar la política `sea-backend`.
2. Arrancar temporalmente el backend con `KMS_MIGRATION_ENABLED=true`.
3. El runner cifra bancos y variantes históricas y limpia los campos legibles
   de reactivos y variantes.
4. Revisar métricas y registros: solo deben aparecer cantidades e identificadores,
   nunca enunciados, opciones o claves.
5. Detener el backend, volver `KMS_MIGRATION_ENABLED=false` y reiniciarlo.
6. Invalidar respaldos y archivos temporales anteriores que contengan preguntas
   en texto plano. Generar respaldos nuevos cifrados y controlar su acceso.

La migración no destruye automáticamente respaldos antiguos porque su eliminación
debe autorizarse y verificarse según la política de conservación institucional.

## Rotación y recuperación

La KEK puede rotarse sin descifrar todas las preguntas: se reenvuelven las DEK
con la nueva versión de Transit. El ciphertext no se modifica. La destrucción
de la KEK o la pérdida del material de desbloqueo puede volver irrecuperables
los bancos; por eso las claves de desbloqueo requieren custodia y respaldo
independientes.

La ejecución controlada se activa temporalmente con `KMS_ROTATION_ENABLED=true`.
El backend reenvuelve bancos y variantes durante ese arranque, registra solo
cantidades y luego debe volver a `false`. La operación requiere que Vault esté
desbloqueado y que el token del backend tenga permiso `transit/rewrap`.

Si Vault está caído, carga, generación, OMR y examen virtual deben fallar de
forma segura. No existe una KEK de respaldo en la aplicación, la base de datos,
RabbitMQ, logs ni archivos `.env`.

## Criterios de aceptación

- En PostgreSQL no quedan preguntas ni respuestas correctas de bancos migrados.
- Los administradores funcionales y DBA solo observan metadatos y ciphertext.
- El worker de generación descifra en memoria y no envía preguntas por RabbitMQ.
- El worker OMR descifra únicamente el paquete protegido de la variante.
- El examen virtual entrega solo las preguntas autorizadas a la sesión del
  estudiante.
- Un cambio en ciphertext, nonce, contexto o DEK envuelta es rechazado por la
  autenticación de AES-GCM.
- Los logs y errores no imprimen contenido sensible.

## Documentos de exámenes sin cartilla

Los archivos `.doc` y `.docx` cargados para exámenes presenciales sin cartilla
se protegen con el mismo esquema envelope, pero con una DEK nueva por documento.
El archivo físico se guarda como ciphertext binario con extensión `.enc`; la
base de datos conserva únicamente la ruta interna, metadatos, nonce, DEK
envuelta, referencia y versión de la KEK, algoritmo y huella SHA-256.

La descarga descifra el archivo únicamente en memoria, valida la autenticación
AES-GCM y comprueba la huella antes de devolverlo al usuario autorizado. Si el
registro corresponde a un documento histórico no migrado, la descarga se
rechaza para no exponer el archivo legible.

Para migrar documentos existentes, activar temporalmente
`KMS_MIGRATION_ENABLED=true` con Vault desbloqueado y el token técnico del
backend disponible. El runner cifra el documento, actualiza sus metadatos y
elimina el archivo legible anterior. Después de confirmar la migración, volver
`KMS_MIGRATION_ENABLED=false`.

La rotación de la KEK también reenvuelve las DEK de estos documentos sin
descifrar ni modificar su ciphertext.
