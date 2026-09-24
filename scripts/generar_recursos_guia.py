"""
Generador de recursos gráficos e interfaces para la Guía Docente de Exámenes Sin Cartilla.
Genera capturas y mockups en alta resolución para su inclusión en el PDF Typst sin caracteres rotos.
"""
import os
from PIL import Image, ImageDraw, ImageFont

OUTPUT_DIR = os.path.abspath('docs/guia-docente-recursos')
os.makedirs(OUTPUT_DIR, exist_ok=True)

FONTS_DIR = r'C:\Windows\Fonts'
FONT_REGULAR = os.path.join(FONTS_DIR, 'segoeui.ttf')
FONT_BOLD = os.path.join(FONTS_DIR, 'segoeuib.ttf')

def get_font(size, bold=False):
    path = FONT_BOLD if bold else FONT_REGULAR
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

# -------------------------------------------------------------
# FIGURA 1: Notificación Topbar + Botón de Acceso
# -------------------------------------------------------------
def generar_figura_1():
    w, h = 1000, 360
    im = Image.new('RGB', (w, h), '#f8fafc')
    d = ImageDraw.Draw(im)

    # 1. Barra superior (Topbar)
    d.rectangle([(0, 0), (w, 60)], fill='#0f172a')
    d.text((25, 18), 'UNIVERSIDAD UNITEPC', fill='#38bdf8', font=get_font(17, bold=True))
    d.text((235, 20), '· Sistema de Evaluaciones', fill='#94a3b8', font=get_font(14))

    # Campana dibujada vectorialmente
    cx, cy = 875, 30
    # campana simple
    d.ellipse([(cx - 8, cy - 8), (cx + 8, cy + 4)], fill='#cbd5e1')
    d.rectangle([(cx - 9, cy - 2), (cx + 9, cy + 6)], fill='#cbd5e1')
    d.ellipse([(cx - 3, cy + 6), (cx + 3, cy + 10)], fill='#cbd5e1')
    # badge rojo
    d.ellipse([(cx + 4, cy - 14), (cx + 20, cy + 2)], fill='#ef4444')
    d.text((cx + 9, cy - 12), '1', fill='#ffffff', font=get_font(10, bold=True))
    d.text((910, 22), 'Prof. Ariel Camara', fill='#f1f5f9', font=get_font(13, bold=True))

    # Dropdown de notificación desplegado
    d.rounded_rectangle([(490, 70), (960, 148)], radius=12, fill='#ffffff', outline='#cbd5e1', width=1)
    d.rectangle([(505, 84), (510, 134)], fill='#f59e0b')
    d.text((525, 82), 'Notificación: Examen sin cartilla con notas pendientes', fill='#0f172a', font=get_font(13, bold=True))
    d.text((525, 104), 'SIS-413 Telecomunicaciones · Grupo TA-01 (1er Parcial)', fill='#475569', font=get_font(12))
    d.text((525, 124), 'Clic aquí para abrir directamente la planilla de calificaciones →', fill='#2563eb', font=get_font(11, bold=True))

    # 2. Tarjeta en Banco de Preguntas
    d.rounded_rectangle([(40, 165), (960, 335)], radius=14, fill='#ffffff', outline='#cbd5e1', width=2)
    # Badges
    d.rounded_rectangle([(65, 185), (280, 212)], radius=8, fill='#e0e7ff', outline='#c7d2fe', width=1)
    d.text((75, 190), 'MODALIDAD: SIN CARTILLA', fill='#3730a3', font=get_font(11, bold=True))
    d.rounded_rectangle([(290, 185), (420, 212)], radius=8, fill='#fef3c7', outline='#fde68a', width=1)
    d.text((300, 190), 'ESTADO: ENTREGADO', fill='#92400e', font=get_font(11, bold=True))

    d.text((65, 225), 'Registro de Calificaciones Oficiales', fill='#0f172a', font=get_font(17, bold=True))
    d.text((65, 252), 'El examen ya fue gestionado por Evaluaciones. Como docente titular, ya puedes registrar las notas sobre 60 puntos.', fill='#475569', font=get_font(12.5))
    d.text((65, 272), 'Al concluir, el examen pasará a Calificado y se generará la planilla oficial para firma y sello.', fill='#475569', font=get_font(12.5))

    # Botones
    d.rounded_rectangle([(630, 230), (845, 280)], radius=10, fill='#4f46e5')
    d.text((650, 242), 'Cargar y Calificar Notas', fill='#ffffff', font=get_font(13.5, bold=True))

    d.rounded_rectangle([(860, 230), (940, 280)], radius=10, fill='#f8fafc', outline='#cbd5e1', width=1)
    d.text((875, 242), 'Ver .doc', fill='#334155', font=get_font(12.5, bold=True))

    path = os.path.join(OUTPUT_DIR, 'figura_1_notificacion_acceso.png')
    im.save(path, dpi=(300, 300))
    print('Figura 1 generada:', path)

# -------------------------------------------------------------
# FIGURA 2: Modal con Calificaciones Llenas y Cálculo Automático
# -------------------------------------------------------------
def generar_figura_2():
    w, h = 1000, 520
    im = Image.new('RGB', (w, h), '#1e293b')
    d = ImageDraw.Draw(im)

    # Ventana modal
    mx1, my1, mx2, my2 = 50, 25, 950, 495
    d.rounded_rectangle([(mx1, my1), (mx2, my2)], radius=16, fill='#ffffff')

    # Cabecera oscura
    d.rounded_rectangle([(mx1, my1), (mx2, my1 + 75)], radius=16, fill='#0f172a')
    d.rectangle([(mx1, my1 + 45), (mx2, my1 + 75)], fill='#0f172a')
    d.text((mx1 + 25, my1 + 16), 'Planilla Oficial de Calificaciones · Examen Sin Cartilla', fill='#ffffff', font=get_font(17, bold=True))
    d.text((mx1 + 25, my1 + 42), 'SIS-413 — TELECOMUNICACIONES · Grupo TA-01 · 1er Parcial · Gestión II-2026', fill='#94a3b8', font=get_font(12.5))
    d.text((mx2 - 40, my1 + 20), 'X', fill='#94a3b8', font=get_font(18, bold=True))

    # Banner informativo
    d.rounded_rectangle([(mx1 + 25, my1 + 88), (mx2 - 25, my1 + 135)], radius=10, fill='#eff6ff', outline='#bfdbfe', width=1)
    d.text((mx1 + 35, my1 + 96), 'Registre la calificación sobre 60 puntos de cada estudiante oficial del grupo. El sistema calculará en tiempo real', fill='#1e3a8a', font=get_font(11.5))
    d.text((mx1 + 35, my1 + 114), 'su equivalencia sobre 100 puntos. Al guardar todas las notas, el examen pasará a Calificado.', fill='#1e3a8a', font=get_font(11.5, bold=True))

    # Tabla
    ty = my1 + 148
    d.rounded_rectangle([(mx1 + 25, ty), (mx2 - 25, ty + 32)], radius=6, fill='#f1f5f9', outline='#e2e8f0', width=1)
    d.text((mx1 + 45, ty + 8), 'N°', fill='#64748b', font=get_font(11.5, bold=True))
    d.text((mx1 + 95, ty + 8), 'CÓDIGO', fill='#64748b', font=get_font(11.5, bold=True))
    d.text((mx1 + 200, ty + 8), 'ESTUDIANTE (NÓMINA OFICIAL)', fill='#64748b', font=get_font(11.5, bold=True))
    d.text((mx1 + 610, ty + 8), 'NOTA / 60', fill='#4338ca', font=get_font(11.5, bold=True))
    d.text((mx1 + 750, ty + 8), 'EQUIV. / 100', fill='#047857', font=get_font(11.5, bold=True))

    estudiantes = [
        ('1', '1106857', 'MOYA MOYA MICHELLE', '52.00', '86.67'),
        ('2', '1107301', 'ESPINOZA ALVAREZ MAYKOL JOSUE', '45.00', '75.00'),
        ('3', '1107451', 'OLIVERA PACHECO ERICK ISRRAEL', '58.00', '96.67'),
        ('4', '1108180', 'BONIFAZ ARIAS JOSE ALFREDO', '36.00', '60.00'),
    ]

    row_y = ty + 38
    for num, cod, nom, n60, n100 in estudiantes:
        d.line([(mx1 + 25, row_y + 36), (mx2 - 25, row_y + 36)], fill='#f1f5f9', width=1)
        d.text((mx1 + 48, row_y + 8), num, fill='#64748b', font=get_font(12.5))
        d.text((mx1 + 95, row_y + 8), cod, fill='#0f172a', font=get_font(12.5, bold=True))
        d.text((mx1 + 200, row_y + 8), nom, fill='#0f172a', font=get_font(12.5))

        # Input sobre 60
        d.rounded_rectangle([(mx1 + 595, row_y + 2), (mx1 + 700, row_y + 32)], radius=6, fill='#ffffff', outline='#6366f1', width=2)
        d.text((mx1 + 625, row_y + 7), n60, fill='#1e1b4b', font=get_font(12.5, bold=True))

        # Badge calculada sobre 100
        d.rounded_rectangle([(mx1 + 740, row_y + 2), (mx1 + 845, row_y + 32)], radius=6, fill='#ecfdf5', outline='#a7f3d0', width=1)
        d.text((mx1 + 770, row_y + 7), n100, fill='#065f46', font=get_font(12.5, bold=True))

        row_y += 40

    # Pie
    fy = my2 - 60
    d.line([(mx1, fy), (mx2, fy)], fill='#e2e8f0', width=1)
    d.text((mx1 + 35, fy + 20), '4 de 4 notas completadas', fill='#0f172a', font=get_font(13.5, bold=True))
    d.rounded_rectangle([(mx1 + 220, fy + 16), (mx1 + 330, fy + 42)], radius=8, fill='#d1fae5')
    d.text((mx1 + 225, fy + 20), 'COMPLETAS 4/4', fill='#065f46', font=get_font(11, bold=True))

    d.rounded_rectangle([(mx2 - 340, fy + 10), (mx2 - 250, fy + 48)], radius=10, fill='#f1f5f9', outline='#cbd5e1', width=1)
    d.text((mx2 - 315, fy + 20), 'Cerrar', fill='#475569', font=get_font(13, bold=True))

    d.rounded_rectangle([(mx2 - 235, fy + 10), (mx2 - 25, fy + 48)], radius=10, fill='#059669')
    d.text((mx2 - 220, fy + 20), 'Guardar y Calificar Examen', fill='#ffffff', font=get_font(13, bold=True))

    path = os.path.join(OUTPUT_DIR, 'figura_2_modal_lleno.png')
    im.save(path, dpi=(300, 300))
    print('Figura 2 generada:', path)

# -------------------------------------------------------------
# FIGURA 3: Tarjeta en Estado CALIFICADO
# -------------------------------------------------------------
def generar_figura_3():
    w, h = 1000, 200
    im = Image.new('RGB', (w, h), '#f8fafc')
    d = ImageDraw.Draw(im)

    d.rounded_rectangle([(30, 20), (970, 180)], radius=16, fill='#ecfdf5', outline='#6ee7b7', width=2)
    # Icono de check
    d.rounded_rectangle([(55, 45), (105, 95)], radius=12, fill='#059669')
    d.text((70, 52), 'OK', fill='#ffffff', font=get_font(18, bold=True))

    # Badges
    d.rounded_rectangle([(125, 40), (240, 65)], radius=8, fill='#d1fae5', outline='#a7f3d0', width=1)
    d.text((135, 45), 'ETAPA: CALIFICADO', fill='#065f46', font=get_font(11, bold=True))
    d.rounded_rectangle([(250, 40), (445, 65)], radius=8, fill='#fef3c7', outline='#fde68a', width=1)
    d.text((260, 45), 'PENDIENTE DE RESPALDO FÍSICO', fill='#92400e', font=get_font(11, bold=True))

    d.text((125, 75), 'Evaluación Calificada — Trámite Institucional', fill='#064e3b', font=get_font(16.5, bold=True))
    d.text((125, 103), 'Las notas fueron consolidadas en el sistema oficial. Imprime la planilla oficial de calificaciones,', fill='#047857', font=get_font(12.5))
    d.text((125, 123), 'fírmala y séllala, y preséntala al Departamento de Evaluaciones junto con los exámenes de aula para su confirmación.', fill='#047857', font=get_font(12.5))

    # Botones
    d.rounded_rectangle([(650, 70), (840, 120)], radius=10, fill='#059669')
    d.text((665, 82), 'Imprimir Planilla Oficial', fill='#ffffff', font=get_font(13, bold=True))

    d.rounded_rectangle([(855, 70), (945, 120)], radius=10, fill='#ffffff', outline='#cbd5e1', width=1)
    d.text((875, 82), 'Ver Notas', fill='#334155', font=get_font(13, bold=True))

    path = os.path.join(OUTPUT_DIR, 'figura_3_etapa_calificado.png')
    im.save(path, dpi=(300, 300))
    print('Figura 3 generada:', path)

# -------------------------------------------------------------
# FIGURA 4: Maqueta de Planilla Oficial Impresa con Firmas
# -------------------------------------------------------------
def generar_figura_4():
    w, h = 900, 520
    im = Image.new('RGB', (w, h), '#ffffff')
    d = ImageDraw.Draw(im)

    d.rectangle([(15, 15), (885, 505)], fill='#ffffff', outline='#94a3b8', width=1)
    d.rectangle([(20, 20), (880, 500)], fill='#ffffff', outline='#cbd5e1', width=1)

    # Cabecera institucional
    d.text((45, 40), 'UNIVERSIDAD PRIVADA UNITEPC', fill='#1e293b', font=get_font(15, bold=True))
    d.text((45, 62), 'DEPARTAMENTO DE EVALUACIONES', fill='#475569', font=get_font(10.5, bold=True))
    d.text((45, 78), 'ACTA OFICIAL DE CALIFICACIONES · MODALIDAD PRESENCIAL SIN CARTILLA', fill='#0f172a', font=get_font(12.5, bold=True))

    d.rounded_rectangle([(680, 38), (855, 88)], radius=6, fill='#f8fafc', outline='#cbd5e1', width=1)
    d.text((695, 46), 'GESTIÓN: II-2026', fill='#0f172a', font=get_font(10.5, bold=True))
    d.text((695, 64), 'PARCIAL: 1er Parcial', fill='#0f172a', font=get_font(10.5, bold=True))

    d.line([(45, 98), (855, 98)], fill='#0f172a', width=2)

    # Metadatos
    d.text((45, 108), 'CARRERA: Ing. de Sistemas', fill='#1e293b', font=get_font(10.5, bold=True))
    d.text((320, 108), 'MATERIA: [SIS-413] Telecomunicaciones', fill='#1e293b', font=get_font(10.5, bold=True))
    d.text((660, 108), 'GRUPO: TA-01', fill='#1e293b', font=get_font(10.5, bold=True))

    d.text((45, 126), 'DOCENTE TITULAR: Lic./Ing. Ariel Camara Arze', fill='#1e293b', font=get_font(10.5))
    d.text((440, 126), 'FECHA DE APLICACIÓN: 23/09/2026', fill='#1e293b', font=get_font(10.5))
    d.text((680, 126), 'SEDE: Cochabamba', fill='#1e293b', font=get_font(10.5))

    # Tabla
    ty = 150
    d.rectangle([(45, ty), (855, ty + 22)], fill='#e2e8f0', outline='#94a3b8', width=1)
    d.text((55, ty + 4), 'N°', fill='#0f172a', font=get_font(9.5, bold=True))
    d.text((95, ty + 4), 'CÓDIGO', fill='#0f172a', font=get_font(9.5, bold=True))
    d.text((190, ty + 4), 'APELLIDOS Y NOMBRES', fill='#0f172a', font=get_font(9.5, bold=True))
    d.text((540, ty + 4), 'NOTA / 60', fill='#0f172a', font=get_font(9.5, bold=True))
    d.text((640, ty + 4), 'NOTA / 100', fill='#0f172a', font=get_font(9.5, bold=True))
    d.text((750, ty + 4), 'ESTADO', fill='#0f172a', font=get_font(9.5, bold=True))

    estudiantes = [
        ('1', '1106857', 'MOYA MOYA MICHELLE', '52.00', '86.67', 'APROBADO'),
        ('2', '1107301', 'ESPINOZA ALVAREZ MAYKOL JOSUE', '45.00', '75.00', 'APROBADO'),
        ('3', '1107451', 'OLIVERA PACHECO ERICK ISRRAEL', '58.00', '96.67', 'APROBADO'),
        ('4', '1108180', 'BONIFAZ ARIAS JOSE ALFREDO', '36.00', '60.00', 'APROBADO'),
    ]

    ry = ty + 22
    for num, cod, nom, n60, n100, est in estudiantes:
        d.rectangle([(45, ry), (855, ry + 22)], fill='#ffffff', outline='#cbd5e1', width=1)
        d.text((57, ry + 4), num, fill='#0f172a', font=get_font(9.5))
        d.text((95, ry + 4), cod, fill='#0f172a', font=get_font(9.5, bold=True))
        d.text((190, ry + 4), nom, fill='#0f172a', font=get_font(9.5))
        d.text((560, ry + 4), n60, fill='#0f172a', font=get_font(9.5))
        d.text((660, ry + 4), n100, fill='#0f172a', font=get_font(9.5, bold=True))
        d.text((755, ry + 4), est, fill='#047857', font=get_font(9.5, bold=True))
        ry += 22

    ry += 12
    d.rounded_rectangle([(45, ry), (855, ry + 38)], radius=6, fill='#f8fafc', outline='#cbd5e1', width=1)
    d.text((65, ry + 12), 'ESTADÍSTICAS DEL GRUPO:', fill='#0f172a', font=get_font(10.5, bold=True))
    d.text((245, ry + 12), 'Evaluados: 4', fill='#334155', font=get_font(10.5))
    d.text((385, ry + 12), 'Aprobados: 4 (100%)', fill='#047857', font=get_font(10.5, bold=True))
    d.text((565, ry + 12), 'Reprobados: 0', fill='#b91c1c', font=get_font(10.5))
    d.text((680, ry + 12), 'Promedio: 79.58 / 100', fill='#1d4ed8', font=get_font(10.5, bold=True))

    # Firmas
    fy = 385
    d.rounded_rectangle([(80, fy), (420, fy + 95)], radius=8, fill='#ffffff', outline='#94a3b8', width=1)
    d.line([(110, fy + 58), (390, fy + 58)], fill='#64748b', width=1)
    d.text((140, fy + 65), 'DOCENTE TITULAR DE ASIGNATURA', fill='#0f172a', font=get_font(10, bold=True))
    d.text((170, fy + 78), 'FIRMA Y SELLO OFICIAL', fill='#64748b', font=get_font(9.5))

    d.rounded_rectangle([(480, fy), (820, fy + 95)], radius=8, fill='#ffffff', outline='#94a3b8', width=1)
    d.line([(510, fy + 58), (790, fy + 58)], fill='#64748b', width=1)
    d.text((495, fy + 65), 'RECEPCIÓN DEPARTAMENTO DE EVALUACIONES', fill='#0f172a', font=get_font(9.5, bold=True))
    d.text((560, fy + 78), 'FIRMA, FECHA Y SELLO', fill='#64748b', font=get_font(9.5))

    path = os.path.join(OUTPUT_DIR, 'figura_4_planilla_oficial_preview.png')
    im.save(path, dpi=(300, 300))
    print('Figura 4 generada:', path)

# -------------------------------------------------------------
# FIGURA 5: Tarjeta en Estado CONFIRMADO
# -------------------------------------------------------------
def generar_figura_5():
    w, h = 1000, 180
    im = Image.new('RGB', (w, h), '#f8fafc')
    d = ImageDraw.Draw(im)

    d.rounded_rectangle([(30, 20), (970, 160)], radius=16, fill='#f0fdfa', outline='#5eead4', width=2)
    # Icono verificado
    d.rounded_rectangle([(55, 40), (105, 90)], radius=12, fill='#0f766e')
    d.text((68, 48), 'OK', fill='#ffffff', font=get_font(18, bold=True))

    # Badge
    d.rounded_rectangle([(125, 35), (280, 60)], radius=8, fill='#ccfbf1', outline='#99f6e4', width=1)
    d.text((135, 40), 'ETAPA: CONFIRMADO', fill='#115e59', font=get_font(11, bold=True))

    d.text((125, 70), 'Evaluación y Respaldo Físico Confirmados', fill='#134e4a', font=get_font(16.5, bold=True))
    d.text((125, 98), 'El Departamento de Evaluaciones recepcionó y validó la planilla oficial con tu firma y sello.', fill='#0f766e', font=get_font(12.5))
    d.text((125, 118), 'El registro de calificaciones de este examen se encuentra formalmente cerrado y archivado en acta oficial.', fill='#0f766e', font=get_font(12.5))

    # Botones
    d.rounded_rectangle([(670, 60), (840, 110)], radius=10, fill='#ffffff', outline='#0f766e', width=1)
    d.text((685, 72), 'Reimprimir Planilla', fill='#0f766e', font=get_font(13, bold=True))

    d.rounded_rectangle([(855, 60), (945, 110)], radius=10, fill='#ffffff', outline='#cbd5e1', width=1)
    d.text((875, 72), 'Ver Notas', fill='#334155', font=get_font(13, bold=True))

    path = os.path.join(OUTPUT_DIR, 'figura_5_etapa_confirmado.png')
    im.save(path, dpi=(300, 300))
    print('Figura 5 generada:', path)

if __name__ == '__main__':
    generar_figura_1()
    generar_figura_2()
    generar_figura_3()
    generar_figura_4()
    generar_figura_5()
    print('Todos los recursos gráficos fueron generados con éxito.')
