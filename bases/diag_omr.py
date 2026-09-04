import cv2
import numpy as np

img = cv2.imread(r"C:\laragon\www\evaluaciones\bases\cartilla_simulada_estudiante_1_7849102.png")
h, w = img.shape[:2]
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# Threshold binary
_, thresh = cv2.threshold(gray, 220, 255, cv2.THRESH_BINARY_INV)

contours, hierarchy = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)

print(f"Total contours: {len(contours)}, Image size: {w}x{h}")

for i, cnt in enumerate(contours):
    x, y, rw, rh = cv2.boundingRect(cnt)
    area = rw * rh
    ar = rw / float(rh) if rh > 0 else 0
    # Cartilla box is around 80-90% width, height around 200-400px, aspect ratio ~3.5 to 4.5
    if rw > w * 0.70 and rh > 100:
        print(f"Candidate #{i}: x={x}, y={y}, w={rw}, h={rh}, area={area}, ar={ar:.2f}, y_ratio={y/h:.3f}, h_ratio={rh/h:.3f}")
