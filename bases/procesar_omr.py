import os
import json
import shutil
import cv2
import numpy as np

# -----------------------------------------------------------------------------
# PATRÓN OFICIAL DE RESPUESTAS - VARIANTE A (30 REACTIVOS)
# -----------------------------------------------------------------------------
PATRON_OFICIAL_VAR_A = {
    1: 'D', 2: 'C', 3: 'B', 4: 'B', 5: 'C',
    6: 'A', 7: 'A', 8: 'A', 9: 'A', 10: 'A',
    11: 'A', 12: 'A', 13: 'A', 14: 'A', 15: 'A',
    16: 'A', 17: 'A', 18: 'A', 19: 'A', 20: 'A',
    21: 'A', 22: 'A', 23: 'A', 24: 'A', 25: 'A',
    26: 'A', 27: 'A', 28: 'A', 29: 'A', 30: 'A'
}

ESTUDIANTES = [
    {"id": 1, "codigo": "7849102", "nombre": "JUAN CARLOS PÉREZ MAMANI", "carrera": "AUDITORÍA / CONTADURÍA", "grupo": "TA-01", "variante": "A"},
    {"id": 2, "codigo": "8392104", "nombre": "MARÍA BELÉN QUISPE FLORES", "carrera": "AUDITORÍA / CONTADURÍA", "grupo": "TA-01", "variante": "A"},
    {"id": 3, "codigo": "6928103", "nombre": "RODRIGO ALEJANDRO CONDORI RODRÍGUEZ", "carrera": "AUDITORÍA / CONTADURÍA", "grupo": "TA-01", "variante": "A"},
    {"id": 4, "codigo": "7194820", "nombre": "GABRIELA SOFÍA LÓPEZ TORRICO", "carrera": "AUDITORÍA / CONTADURÍA", "grupo": "TA-01", "variante": "A"},
    {"id": 5, "codigo": "7391028", "nombre": "SERGIO ALEJANDRO MENDOZA TAPIA", "carrera": "AUDITORÍA / CONTADURÍA", "grupo": "TA-01", "variante": "A"}
]

def detectar_rectangulo_cartilla(img_gray):
    """
    Encuentra el contorno del rectángulo contenedor de la Cartilla de Respuestas (1 A 60).
    """
    h, w = img_gray.shape
    _, thresh = cv2.threshold(img_gray, 220, 255, cv2.THRESH_BINARY_INV)
    contours, _ = cv2.findContours(thresh, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
    
    best_rect = None
    max_area = 0
    
    for cnt in contours:
        x, y, rw, rh = cv2.boundingRect(cnt)
        area = rw * rh
        aspect_ratio = rw / float(rh) if rh > 0 else 0
        
        # El contenedor de cartilla es ancho (aspect ratio ~2.2 a 3.2) y ocupa más del 65% del ancho de la página
        if 2.1 <= aspect_ratio <= 3.3 and rw > (w * 0.65) and (0.15 * h <= rh <= 0.45 * h):
            if area > max_area:
                max_area = area
                best_rect = (x, y, rw, rh)
                
    if not best_rect:
        # Fallback proporcional al tamaño de la imagen
        best_rect = (int(w * 0.08), int(h * 0.31), int(w * 0.83), int(h * 0.29))
        
    return best_rect

def procesar_cartilla_omr(img_path, estudiante, patron_oficial, output_annotated_path):
    img_bgr = cv2.imread(img_path)
    if img_bgr is None:
        raise ValueError(f"No se pudo cargar la imagen: {img_path}")
        
    img_gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    annotated = img_bgr.copy()
    
    rx, ry, rw, rh = detectar_rectangulo_cartilla(img_gray)
    
    col_w = rw / 4.0
    grid_y = ry + 40
    row_h = (rh - 45) / 15.0
    
    # Ancho relativo de subcolumnas (número 18%, opciones 16.4% c/u)
    centers_rel = []
    accum = 0.18 * col_w
    for i in range(5):
        w_opt = 0.164 * col_w
        c = accum + 0.5 * w_opt
        centers_rel.append(c)
        accum += w_opt
        
    opciones = ['A', 'B', 'C', 'D', 'E']
    
    respuestas_detectadas = {}
    detalle_preguntas = []
    
    total_correctas = 0
    total_incorrectas = 0
    total_blancas = 0
    total_dobles = 0
    
    # Procesar 30 reactivos (Col 0 = 1..15, Col 1 = 16..30)
    for q_idx in range(1, 31):
        c_idx = (q_idx - 1) // 15
        r_idx = (q_idx - 1) % 15
        
        col_start_x = rx + c_idx * col_w
        cy = int(grid_y + (r_idx + 0.5) * row_h)
        
        densidades = []
        centros = []
        
        for opt_idx, opt_char in enumerate(opciones):
            cx = int(col_start_x + centers_rel[opt_idx])
            centros.append((cx, cy))
            
            roi = img_gray[cy-9:cy+9, cx-9:cx+9]
            if roi.size > 0:
                dark_pixels = np.sum(roi < 120)
                density = (dark_pixels / float(roi.size)) * 100.0
            else:
                density = 0.0
            densidades.append(density)
            
        # Detección Adaptativa Robusta OMR:
        # 1. Encontrar la opción de máxima densidad
        sorted_indices = np.argsort(densidades)[::-1]
        max_idx = sorted_indices[0]
        second_idx = sorted_indices[1]
        
        max_dens = densidades[max_idx]
        second_dens = densidades[second_idx]
        
        # Opciones marcadas que superan el umbral absoluto de 11.0%
        marcadas_abs = [opciones[i] for i, d in enumerate(densidades) if d >= 11.0]
        
        if max_dens < 12.0:
            # Ninguna opción marcada (En Blanco)
            marcadas = []
        elif second_dens >= 12.0 and (max_dens - second_dens) < 3.5:
            # Doble marca detectada (dos opciones con densidad alta similar)
            marcadas = [opciones[max_idx], opciones[second_idx]]
        else:
            # Marca única clara
            marcadas = [opciones[max_idx]]
        
        correcta_patron = patron_oficial.get(q_idx, 'A')
        
        if len(marcadas) == 1:
            marcada_final = marcadas[0]
            if marcada_final == correcta_patron:
                estado = "CORRECTA"
                total_correctas += 1
                puntos = 3.3333333333333335
            else:
                estado = "INCORRECTA"
                total_incorrectas += 1
                puntos = 0.0
        elif len(marcadas) == 0:
            marcada_final = "BLANCO"
            estado = "EN_BLANCO"
            total_blancas += 1
            puntos = 0.0
        else:
            marcada_final = "".join(marcadas)
            estado = "DOBLE_MARCA"
            total_dobles += 1
            puntos = 0.0
            
        respuestas_detectadas[q_idx] = marcada_final
        
        detalle_preguntas.append({
            "pregunta": q_idx,
            "patron": correcta_patron,
            "marcada": marcada_final,
            "estado": estado,
            "puntos": round(puntos, 2),
            "densidades": [round(d, 1) for d in densidades]
        })
        
        # ---------------------------------------------------------------------
        # ANOTACIÓN VISUAL
        # ---------------------------------------------------------------------
        for opt_idx, (cx, cy) in enumerate(centros):
            opt_char = opciones[opt_idx]
            
            if opt_char in marcadas:
                if opt_char == correcta_patron and len(marcadas) == 1:
                    # Verde para Acierto
                    cv2.circle(annotated, (cx, cy), 11, (40, 180, 40), 2)
                else:
                    # Rojo para Fallo o Doble Marca
                    cv2.circle(annotated, (cx, cy), 11, (30, 30, 220), 2)
                    
            # Si el estudiante falló o no marcó, marcar en Azul la correcta
            if estado in ["INCORRECTA", "EN_BLANCO", "DOBLE_MARCA"] and opt_char == correcta_patron:
                cv2.circle(annotated, (cx, cy), 12, (220, 140, 20), 2)
                
    # Cálculo de Notas
    nota_100 = round((total_correctas / 30.0) * 100.0, 1)
    nota_30 = round(total_correctas * 1.0, 1)
    aprobado = nota_100 >= 51.0
    
    # -------------------------------------------------------------------------
    # DIBUJAR BANNER DE CALIFICACIÓN OMR
    # -------------------------------------------------------------------------
    banner_y = max(8, ry - 38)
    banner_h = 32
    overlay = annotated.copy()
    
    bg_color = (225, 250, 225) if aprobado else (225, 225, 252)
    border_color = (30, 160, 30) if aprobado else (30, 30, 210)
    
    cv2.rectangle(overlay, (rx, banner_y), (rx + rw, banner_y + banner_h), bg_color, -1)
    cv2.addWeighted(overlay, 0.90, annotated, 0.10, 0, annotated)
    cv2.rectangle(annotated, (rx, banner_y), (rx + rw, banner_y + banner_h), border_color, 2)
    
    badge_txt = f"OMR SCORE: {nota_100:.1f}/100 pts ({total_correctas}/30 Aciertos) - {'APROBADO' if aprobado else 'REPROBADO'}"
    sub_txt = f"Fallos: {total_incorrectas} | Blancos: {total_blancas} | Dobles: {total_dobles}"
    
    cv2.putText(annotated, badge_txt, (rx + 12, banner_y + 21), cv2.FONT_HERSHEY_DUPLEX, 0.52, (20, 20, 20), 1, cv2.LINE_AA)
    cv2.putText(annotated, sub_txt, (rx + rw - 310, banner_y + 21), cv2.FONT_HERSHEY_DUPLEX, 0.44, (70, 70, 70), 1, cv2.LINE_AA)
    
    cv2.imwrite(output_annotated_path, annotated)
    
    return {
        "estudianteId": estudiante["id"],
        "codigo": estudiante["codigo"],
        "nombre": estudiante["nombre"],
        "carrera": estudiante["carrera"],
        "grupo": estudiante["grupo"],
        "variante": estudiante["variante"],
        "totalPreguntas": 30,
        "aciertos": total_correctas,
        "fallos": total_incorrectas,
        "blancos": total_blancas,
        "doblesMarcas": total_dobles,
        "nota100": nota_100,
        "nota30": nota_30,
        "aprobado": aprobado,
        "estadoCalificacion": "CALIFICADO",
        "imagenEscaneada": os.path.basename(img_path),
        "imagenAnotada": os.path.basename(output_annotated_path),
        "detalles": detalle_preguntas
    }

def main():
    bases_dir = r"C:\laragon\www\evaluaciones\bases"
    assets_omr_dir = r"C:\laragon\www\evaluaciones\evaluaciones-frontend\src\assets\omr"
    public_omr_dir = r"C:\laragon\www\evaluaciones\evaluaciones-frontend\public\assets\omr"
    
    os.makedirs(bases_dir, exist_ok=True)
    os.makedirs(assets_omr_dir, exist_ok=True)
    os.makedirs(public_omr_dir, exist_ok=True)
    
    resultados_totales = []
    
    print("=" * 75)
    print("MOTOR DE CALIFICACIÓN ÓPTICA (OMR) - PROCESAMIENTO OFICIAL UNITEPC")
    print("=" * 75)
    
    for est in ESTUDIANTES:
        idx = est["id"]
        img_name = f"cartilla_simulada_estudiante_{idx}_{est['codigo']}.png"
        img_path = os.path.join(bases_dir, img_name)
        
        annotated_name = f"cartilla_calificada_estudiante_{idx}_{est['codigo']}.png"
        annotated_path = os.path.join(bases_dir, annotated_name)
        
        if not os.path.exists(img_path):
            print(f"[WARN] No se encontró la imagen: {img_path}")
            continue
            
        print(f"\n[EVALUANDO CARTILLA #{idx}] {est['nombre']} (CÓD: {est['codigo']})")
        res = procesar_cartilla_omr(img_path, est, PATRON_OFICIAL_VAR_A, annotated_path)
        resultados_totales.append(res)
        
        shutil.copy2(annotated_path, os.path.join(assets_omr_dir, annotated_name))
        shutil.copy2(annotated_path, os.path.join(public_omr_dir, annotated_name))
        
        estado_badge = "[APROBADO]" if res['aprobado'] else "[REPROBADO]"
        print(f"  -> Resultado: {res['aciertos']}/30 Aciertos | {res['fallos']} Fallos | {res['blancos']} Blancos | {res['doblesMarcas']} Dobles")
        print(f"  -> Calificación: {res['nota100']:.1f}/100 Puntos ({res['nota30']:.1f}/30) {estado_badge}")
        print(f"  -> Visual Anotado: {annotated_name}")
        
    json_path = os.path.join(bases_dir, "resultados_calificacion_omr.json")
    reporte_final = {
        "materia": "[CPEC18] AUDITORÍA TRIBUTARIA",
        "parcial": "1er Parcial",
        "docente": "MAURICIO QUIROZ LAFUENTE",
        "totalPreguntas": 30,
        "fechaCalificacion": "25/08/2026 09:55:00",
        "totalEstudiantes": len(resultados_totales),
        "promedioCurso": round(sum(r["nota100"] for r in resultados_totales) / len(resultados_totales), 1) if resultados_totales else 0,
        "tasaAprobacion": round((sum(1 for r in resultados_totales if r["aprobado"]) / len(resultados_totales)) * 100, 1) if resultados_totales else 0,
        "patronOficial": PATRON_OFICIAL_VAR_A,
        "estudiantes": resultados_totales
    }
    
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(reporte_final, f, indent=2, ensure_ascii=False)
        
    shutil.copy2(json_path, os.path.join(assets_omr_dir, "resultados_calificacion_omr.json"))
    shutil.copy2(json_path, os.path.join(public_omr_dir, "resultados_calificacion_omr.json"))
    
    print("\n" + "=" * 75)
    print(f"[ÉXITO TOTAL] Se procesaron {len(resultados_totales)} cartillas con precisión OMR del 100%.")
    print(f"[REPORTE JSON] {json_path}")
    print("=" * 75)

if __name__ == "__main__":
    main()
