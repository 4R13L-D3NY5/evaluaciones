import fitz # PyMuPDF
import os

pdf_path = r"C:\laragon\www\evaluaciones\bases\CPEC18_Cochabamba_TA-01_1erParcial_20260822_Master_Impresion.pdf"
doc = fitz.open(pdf_path)
print(f"Total de páginas en el master: {len(doc)}")

# Renderizar página 1 a imagen PNG
page = doc.load_page(0)
pix = page.get_pixmap(dpi=200)
out_png = r"C:\laragon\www\evaluaciones\bases\hoja1_omr_preview.png"
pix.save(out_png)
print(f"Página 1 guardada en: {out_png}")
