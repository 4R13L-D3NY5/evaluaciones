"""Configuración del worker Typst leída desde variables de entorno."""
import os

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "localhost")
RABBITMQ_PORT = int(os.getenv("RABBITMQ_PORT", "5672"))
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "guest")
RABBITMQ_PASS = os.getenv("RABBITMQ_PASS", "guest")
RABBITMQ_QUEUE_IN = os.getenv("RABBITMQ_QUEUE_IN", "evaluaciones.generacion.typst")
RABBITMQ_QUEUE_OUT = os.getenv("RABBITMQ_QUEUE_OUT", "evaluaciones.generacion.resultado")
RABBITMQ_VHOST = os.getenv("RABBITMQ_VHOST", "/")

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "sea_evaluaciones")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")

LOGO_PATH = os.getenv("LOGO_PATH", "/app/bases/logo_unitepc_clean.png")
TYPST_BIN = os.getenv("TYPST_BIN", "")

VAULT_ADDR = os.getenv("VAULT_ADDR", "http://localhost:8200").rstrip("/")
VAULT_TOKEN_FILE = os.getenv("VAULT_TOKEN_FILE", "")
VAULT_TOKEN = os.getenv("VAULT_TOKEN", "")
VAULT_TRANSIT_KEY_NAME = os.getenv("VAULT_TRANSIT_KEY_NAME", "sea-banco-kek")
VAULT_TIMEOUT_SECONDS = int(os.getenv("VAULT_TIMEOUT_SECONDS", "10"))
MAINTENANCE_MARKER = os.getenv("MAINTENANCE_MARKER", "/app/storage/.sea-maintenance")

# Semillas fijas para reproducibilidad de variantes en el MVP.
SEED_POR_VARIANTE = {"A": 100, "B": 153, "C": 206, "D": 259, "E": 312}
# Cantidad institucional por defecto de estudiantes que comparte una variante.
RATIO_ESTUDIANTES_POR_VARIANTE = 5

# Cuotas del algoritmo 7F/16M/7D.
CUOTA_FACILES = 7
CUOTA_MEDIAS = 16
CUOTA_DIFICILES = 7
TOTAL_PREGUNTAS = CUOTA_FACILES + CUOTA_MEDIAS + CUOTA_DIFICILES

# Configuración oficial de diagramación vigente para el primer ciclo. Esta
# familia está incluida en la imagen del worker para que la generación sea
# reproducible tanto en local como en el servidor.
FORMATO_HOJA = "Oficio (Folio UNITEPC)"
TIPOGRAFIA = os.getenv("TYPST_FONT", "Libertinus Serif")
TAMANO_FUENTE_PT = 11
LEADING = "0.8em"
SEPARACION_PREGUNTAS = "1.2em"
INDENTACION_INCISOS = "1em"
