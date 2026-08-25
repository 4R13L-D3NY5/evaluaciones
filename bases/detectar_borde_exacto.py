import cv2
import numpy as np

# Cargar la imagen recortada del visor que subió el usuario
img_path = r"C:\Users\S1ST3M4S\.gemini\antigravity\brain\6a8c8d78-b7ff-4302-aac3-a31cab0b479b\.user_uploaded\media_1787684056066.png"
img = cv2.imread(img_path)
h, w = img.shape[:2]

# En esta imagen de captura, la página escaneada está a la izquierda
# Vamos a aislar la hoja blanca escaneada
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Buscar los bordes negros de la cartilla en la hoja
# 1. Binarizar
_, bin_inv = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY_INV)

# Encontrar contornos rectangulares
contours, _ = cv2.findContours(bin_inv, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

candidatos = []
for cnt in contours:
    x, y, rw, rh = cv2.boundingRect(cnt)
    aspect = rw / float(rh) if rh > 0 else 0
    # La cartilla tiene aspect ratio entre 2.2 y 3.0
    if 2.2 <= aspect <= 3.2 and rw > 200 and rh > 60:
        candidatos.append((x, y, rw, rh, aspect))

print("Candidatos de caja de cartilla encontrados:")
for c in candidatos:
    print(f"-> Rectángulo: x={c[0]}, y={c[1]}, w={c[2]}, h={c[3]}, aspect={c[4]:.2f}")
