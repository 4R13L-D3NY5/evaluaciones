# Secretos locales de Vault

Esta carpeta está excluida de Git. Cree el archivo `unseal-keys` en esta ubicación
con las llaves institucionales de Vault, una por línea, sin encabezados ni comillas.

Para una instalación con sello Shamir de 3/5 se deben colocar al menos tres
llaves distintas. No copie estas llaves en el repositorio, tickets, capturas,
logs ni conversaciones. En producción se recomienda reemplazar este mecanismo
por auto-unseal mediante un KMS/HSM externo.
El archivo `restic-password` es un secreto independiente para cifrar los
repositorios de respaldos. Créalo solo en el servidor o entorno local donde se
ejecuta Docker. Nunca lo versiones ni lo envíes por chat.

El worker lo lee como `/run/secrets/restic_password`. La misma contraseña debe
estar disponible para el repositorio local y el destino externo, pero no se
guarda en la base de datos.
