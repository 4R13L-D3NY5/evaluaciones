import cv2
import numpy as np

img_path = r"C:\Users\S1ST3M4S\.gemini\antigravity\brain\6a8c8d78-b7ff-4302-aac3-a31cab0b479b\.user_uploaded\media_1787676838106.png"
img = cv2.imread(img_path)
h, w = img.shape[:2]
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

print(f"Dimensiones de la imagen: {w}x{h}")

# Buscar contornos de líneas horizontales y rectángulos
_, thresh = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY_INV)
contours, hierarchy = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

rectangles = []
for cnt in contours:
    x, y, rw, rh = cv2.boundingRect(cnt)
    aspect = rw / float(rh) if rh > 0 else 0
    # Buscar el cuadro de la cartilla
    if 2.0 <= aspect <= 3.5 and rw > (w * 0.70) and rh > 100:
        rectangles.append((x, y, rw, rh, aspect))

print("Rectángulos encontrados:")
for r in rectangles:
    print(f"x={r[0]} ({r[0]/w*100:.1f}%), y={r[1]} ({r[1]/h*100:.1f}%), w={r[2]} ({r[2]/w*100:.1f}%), h={r[3]} ({r[3]/h*100:.1f}%), aspect={r[4]:.2f}")
