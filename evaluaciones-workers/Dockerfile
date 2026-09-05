FROM python:3.10-slim

WORKDIR /app

# Instalar Typst CLI (el binario es requerido por el paquete Python en algunos entornos).
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://github.com/typst/typst/releases/download/v0.15.0/typst-x86_64-unknown-linux-gnu.tar.gz \
    | tar -xz -C /usr/local/bin --strip-components=1 \
    && chmod +x /usr/local/bin/typst

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONPATH=/app
ENV TYPST_BIN=/usr/local/bin/typst
ENV LOGO_PATH=/app/bases/logo_unitepc_clean.png

CMD ["python", "main.py"]
