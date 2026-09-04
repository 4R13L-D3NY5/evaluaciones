import cv2
import numpy as np

img = cv2.imread(r"C:\laragon\www\evaluaciones\bases\cartilla_simulada_estudiante_4_7194820.png")
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

rx, ry, rw, rh = 84, 374, 1056, 410
col_w = rw / 4.0
grid_y = ry + 40
row_h = (rh - 45) / 15.0

sub_col_widths = [0.18, 0.164, 0.164, 0.164, 0.164, 0.164]
centers_rel = []
accum = 0.18 * col_w
for i in range(5):
    w_opt = 0.164 * col_w
    c = accum + 0.5 * w_opt
    centers_rel.append(c)
    accum += w_opt

for q in [14, 29]:
    c_idx = (q - 1) // 15
    r_idx = (q - 1) % 15
    col_start_x = rx + c_idx * col_w
    cy = int(grid_y + (r_idx + 0.5) * row_h)
    line_dens = []
    for opt_idx, opt in enumerate(['A', 'B', 'C', 'D', 'E']):
        cx = int(col_start_x + centers_rel[opt_idx])
        roi = gray[cy-9:cy+9, cx-9:cx+9]
        dark = np.sum(roi < 120)
        pct = (dark / roi.size) * 100
        line_dens.append(f"{opt}:{pct:.1f}%")
    print(f"Student 4 - Q{q:2d}: " + " | ".join(line_dens))
