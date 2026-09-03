# Secretos locales de Vault

Esta carpeta está excluida de Git. Cree el archivo `unseal-keys` en esta ubicación
con las llaves institucionales de Vault, una por línea, sin encabezados ni comillas.

Para una instalación con sello Shamir de 3/5 se deben colocar al menos tres
llaves distintas. No copie estas llaves en el repositorio, tickets, capturas,
logs ni conversaciones. En producción se recomienda reemplazar este mecanismo
por auto-unseal mediante un KMS/HSM externo.
