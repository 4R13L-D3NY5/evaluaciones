"""Generación de variantes de examen y cuadernillos individuales con Typst."""
import json
import logging
import os
import random
import re
import shutil
from typing import Any

import typst

from src import config
from src.db import barajar_opciones, parsear_opciones

logger = logging.getLogger(__name__)

TIPOLOGIAS_ORDEN = [
    "SELECCION_MEJOR_RESPUESTA",
    "VERDADERO_O_FALSO_SIMPLE",
    "RESPUESTA_PREMISAS_ABCD",
    "VERDADERO_O_FALSO_COMPLEJAS",
    "SUBITEM_CASO",
    "OPCION_EMPAREJAMIENTO",
    "EMPAREJAMIENTO_TRONCO",
]

INSTRUCCIONES_POR_TIPO = {
    "SELECCION_MEJOR_RESPUESTA": (
        "SELECCIÓN DE LA MEJOR RESPUESTA",
        "INSTRUCCIONES: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.",
    ),
    "VERDADERO_O_FALSO_SIMPLE": (
        "VERDADERO O FALSO SIMPLE",
        "INSTRUCCIONES: Marque la respuesta correcta.",
    ),
    "RESPUESTA_PREMISAS_ABCD": (
        "RESPUESTA A/B/AMBAS/NINGUNA",
        "INSTRUCCIONES: Las siguientes preguntas están compuestas por dos premisas.\nResponda con:\nA: Si solo la primera premisa es verdadera.\nB: Si solo la segunda premisa es verdadera.\nC: Si ambas premisas son verdaderas.\nD: Si ninguna premisa es verdadera.",
    ),
    "VERDADERO_O_FALSO_COMPLEJAS": (
        "VERDADERO O FALSO COMPLEJAS",
        "INSTRUCCIONES: Seleccione la opción correcta de acuerdo con la siguiente clave:\nA: 1, 2 y 3 son verdaderas.\nB: 1 y 3 son verdaderas.\nC: 2 y 4 son verdaderas.\nD: Solo 4 es verdadera.\nE: Todas son verdaderas.",
    ),
    "SUBITEM_CASO": (
        "ITEMS AGRUPADOS POR CASO CLINICO O PROBLEMA",
        "INSTRUCCIONES: El siguiente caso clínico o problema tendrá varias preguntas.\nSeleccione la respuesta correcta en cada una.",
    ),
    "OPCION_EMPAREJAMIENTO": (
        "EMPAREJAMIENTO AMPLIADO",
        "INSTRUCCIONES: De la lista de opciones, seleccione la respuesta correcta\npara cada enunciado.",
    ),
}


def _slugify(texto: str) -> str:
    t = texto.upper().replace(" ", "_")
    for char, repl in [("É", "E"), ("Í", "I"), ("Ó", "O"), ("Á", "A"), ("Ú", "U"), ("Ñ", "N")]:
        t = t.replace(char, repl)
    return re.sub(r"[^A-Z0-9_-]", "", t)


def _extraer_respuesta_correcta(opciones: list[tuple[str, str, bool]]) -> str:
    for letra, _, correcta in opciones:
        if correcta:
            return letra
    return "A"


def _barajar_opciones_pregunta(pregunta: dict[str, Any], semilla: int) -> dict[str, Any]:
    """Devuelve una copia de la pregunta con las opciones barajadas y reasignadas A-E."""
    opciones = parsear_opciones(pregunta.get("opciones_json", "[]"))
    if not opciones:
        return pregunta

    barajadas = barajar_opciones(opciones, semilla)
    p = pregunta.copy()
    p["opciones_json"] = json.dumps(
        [{"letra": letra, "texto": texto, "correcta": correcta} for letra, texto, correcta in barajadas],
        ensure_ascii=False,
    )
    return p


def _sanitize_math(math_text: str) -> str:
    """Envuelve palabras de texto dentro de modo matemático en comillas.

    Typst interpreta letras como variables. Palabras como FSPL deben ir
    entre comillas para mostrarse como texto. Se respetan funciones y
    constantes matemáticas comunes, así como variables de una sola letra.
    """
    funciones = {
        "log", "ln", "lg", "sin", "cos", "tan", "cot", "sec", "csc",
        "arcsin", "arccos", "arctan", "arcsinh", "arccosh", "arctanh",
        "sinh", "cosh", "tanh", "exp", "sqrt", "lim", "sum", "prod",
        "int", "pi", "alpha", "beta", "gamma", "delta", "epsilon",
        "theta", "lambda", "mu", "sigma", "omega", "phi", "psi",
    }

    def _repl(match: re.Match) -> str:
        word = match.group(0)
        if len(word) == 1 or word.lower() in funciones:
            return word
        return f'"{word}"'

    return re.sub(r"[A-Za-z]+", _repl, math_text)


def _typst_content(texto: str) -> str:
    """Convierte texto plano con fórmulas $...$ en contenido Typst.

    El texto plano se envuelve en #raw(..., block: false) para evitar que
    caracteres como #, _, * o @ se interpreten como comandos o marcado.
    Los bloques delimitados por $...$ se sanitizan para que palabras de
    texto se muestren correctamente en modo matemático.
    """
    if not texto:
        return '#raw("", block: false)'

    # re.split con grupo capturante devuelve alternando texto y fórmulas.
    segmentos = re.split(r'(\$[^$]*\$)', texto)
    partes: list[str] = []
    for idx, segmento in enumerate(segmentos):
        if not segmento:
            continue
        if idx % 2 == 1:
            # Segmento matemático: sanitizar palabras de texto.
            math_body = segmento[1:-1]
            partes.append(f"$ {_sanitize_math(math_body)} $")
        else:
            # Texto plano: escapar comillas dobles para el raw de Typst.
            escapado = segmento.replace("\\", "\\\\").replace('"', '\\"')
            partes.append(f'#raw("{escapado}", block: false)')

    if len(partes) == 1:
        return partes[0]
    return " + ".join(partes)


def _mayusculas(valor: Any) -> str:
    """Normaliza los textos institucionales para la cabecera oficial."""
    return str(valor or "").strip().upper()


def seleccionar_preguntas(reactivos: list[dict[str, Any]], seed: int) -> list[dict[str, Any]]:
    rng = random.Random(seed)

    faciles = [r for r in reactivos if r["nivel_dificultad"] == 1 or r["dificultad"] == "Fácil"]
    medias = [r for r in reactivos if r["nivel_dificultad"] == 2 or r["dificultad"] == "Medio"]
    dificiles = [r for r in reactivos if r["nivel_dificultad"] == 3 or r["dificultad"] == "Difícil"]

    def _tomar(lista: list, n: int) -> list:
        if len(lista) < n:
            logger.warning("No hay suficientes reactivos de la dificultad solicitada (%d < %d)", len(lista), n)
            return lista
        return rng.sample(lista, n)

    seleccionadas = (
        _tomar(faciles, config.CUOTA_FACILES)
        + _tomar(medias, config.CUOTA_MEDIAS)
        + _tomar(dificiles, config.CUOTA_DIFICILES)
    )

    # Ordenar por tipología para coherencia pedagógica.
    por_tipo = {tipo: [p for p in seleccionadas if p["tipo_reactivo"] == tipo] for tipo in TIPOLOGIAS_ORDEN}
    ordenadas = []
    for tipo in TIPOLOGIAS_ORDEN:
        ordenadas.extend(por_tipo[tipo])
    return ordenadas


def _nombre_completo(estudiante: dict[str, Any]) -> str:
    return " ".join(
        _mayusculas(estudiante.get(campo))
        for campo in ("nombres", "apellido_paterno", "apellido_materno")
        if _mayusculas(estudiante.get(campo))
    )


def _cabecera_institucional(rol: dict[str, Any], estudiante: dict[str, Any] | None = None) -> str:
    tipo_parcial = _mayusculas(rol.get("tipo_parcial", "1er Parcial"))
    cabecera = f"""#table(
  columns: (25%, 75%),
  stroke: 0.5pt + black,
  fill: none,
  align: (center + horizon, center + horizon),
  inset: 4pt,
  [
    #image("logo_unitepc_clean.png", width: 80%)
  ],
  [
    #text(weight: "bold")[UNIVERSIDAD TECNICA PRIVADA COSMOS]\\
    #text(weight: "bold")[GESTION 2-2026]
    #v(-2pt)
    #line(length: 90%, stroke: 0.5pt + black)
    #v(-2.5pt)
    #text(weight: "bold")[EVALUACION TEORICA {tipo_parcial}]
  ]
)

"""
    if estudiante is not None:
        cabecera += _ficha_estudiante(rol, estudiante)
    cabecera += f"""
#v({config.LEADING})
#align(center)[
  #text(weight: "bold")[CUESTIONARIO DE PREGUNTAS ({config.TOTAL_PREGUNTAS})]
]

#v({config.LEADING})
#line(length: 100%, stroke: 0.75pt + black)
#v({config.LEADING})
"""
    return cabecera


def _ficha_estudiante(rol: dict[str, Any], estudiante: dict[str, Any]) -> str:
    """Ficha oficial de examen. Los datos provienen de SEA y no incluyen variante."""
    nombre = _typst_content(_nombre_completo(estudiante))
    codigo = _typst_content(str(estudiante.get("codigo_estudiante") or ""))
    carrera = _typst_content(_mayusculas(rol.get("carrera_nombre")))
    materia = _typst_content(_mayusculas(rol.get("materia_nombre")))
    grupo = _typst_content(_mayusculas(rol.get("grupo")))
    semestre = _typst_content(str(rol.get("semestre") or ""))
    docente = _typst_content(_mayusculas(rol.get("docente_nombre")))
    parcial = _typst_content(_mayusculas(rol.get("tipo_parcial")))
    fecha = _typst_content(_mayusculas(rol.get("fecha_display")))
    horario = _typst_content(_mayusculas(rol.get("horario")))
    return f'''
#v({config.LEADING})
#table(
  columns: (1fr, 1fr),
  stroke: 0.4pt + black,
  inset: 4pt,
  [NOMBRE: {nombre}], [CARRERA: {carrera}],
  [MATERIA: {materia}], [GRUPO: {grupo}    SEMESTRE: {semestre}],
  [DOCENTE: {docente}], [EXAMEN: {parcial}],
  [FECHA: {fecha}], [HORA: {horario}],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[{codigo}]],
)
#v({config.LEADING})
'''


def _seccion_typst(titulo: str, instruccion: str) -> str:
    """Renderiza una sección con las reglas visuales del formato oficial."""
    instrucciones = "\n".join(
        f'#text(weight: "regular")[{_typst_content(linea.strip())}]\\'
        for linea in instruccion.splitlines()
        if linea.strip()
    )
    return f'''
#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v({config.LEADING})
  #text(weight: "bold")[{_typst_content(_mayusculas(titulo))}]\\
  {instrucciones}
  #v({config.LEADING})
  #line(length: 100%, stroke: 0.5pt + black)
]
#v({config.LEADING})
'''


def _cuestionario_typst(preguntas: list[dict[str, Any]]) -> str:
    """Construye el cuestionario sin datos de estudiante ni etiquetas de variante."""
    typ_code = ""
    current_section = None
    for idx, p in enumerate(preguntas):
        num = idx + 1
        tipo = p.get("tipo_reactivo", "")

        seccion_tipo = "OPCION_EMPAREJAMIENTO" if tipo in {"EMPAREJAMIENTO_TRONCO", "OPCION_EMPAREJAMIENTO"} else tipo
        if seccion_tipo in INSTRUCCIONES_POR_TIPO and current_section != seccion_tipo:
            current_section = seccion_tipo
            titulo, instruccion = INSTRUCCIONES_POR_TIPO[seccion_tipo]
            typ_code += _seccion_typst(titulo, instruccion)
            if seccion_tipo == "SUBITEM_CASO":
                typ_code += '''
#rect(width: 100%, stroke: 0.5pt + black, fill: rgb("#f8fafc"), inset: 3.5pt)[
  [#text(weight: "bold")[CASO CLINICO O PROBLEMA:]  Resuelva el caso planteado y responda cada pregunta del grupo.]\
]
#v(1em)
'''
            elif seccion_tipo == "OPCION_EMPAREJAMIENTO" and tipo == "OPCION_EMPAREJAMIENTO":
                typ_code += '''
#rect(width: 100%, stroke: 0.5pt + black, fill: rgb("#f8fafc"), inset: 3.5pt)[
  [#text(weight: "bold")[RELACIONE EL CONCEPTO CON SU DEFINICION CORRECTA:]]\\
  [A) ...]\\
  [B) ...]\\
  [C) ...]\\
  [D) ...]\\
  [E) ...]
]
#v(1em)
'''

        if tipo == "EMPAREJAMIENTO_TRONCO":
            opciones_referencia = parsear_opciones(p.get("opciones_json", "[]"))
            lineas_tarjeta = [str(p.get("enunciado") or "RELACIONE EL CONCEPTO CON SU DEFINICION CORRECTA:")]
            lineas_tarjeta.extend(f"{letra}) {texto}" for letra, texto, _ in opciones_referencia)
            contenido_tarjeta = "\\\\\n  ".join(
                f'[#text(weight: "regular")[{_typst_content(linea)}]]' for linea in lineas_tarjeta
            )
            typ_code += f'''\n#rect(width: 100%, stroke: 0.5pt + black, fill: rgb("#f8fafc"), inset: 3.5pt)[
  {contenido_tarjeta}
]
#v(1em)
'''
            continue

        opciones = [] if tipo == "VERDADERO_O_FALSO_SIMPLE" else parsear_opciones(p.get("opciones_json", "[]"))
        enunciado = _typst_content(str(p.get("enunciado", "")))
        typ_code += f'''
#block(breakable: false, spacing: {config.SEPARACION_PREGUNTAS})[
  #box[#text(weight: "bold")[{num}. #raw("___", block: false)]] #h(0.25em){enunciado}\\
'''
        if opciones:
            typ_code += f'''  #v(0.15em)
  #block(inset: (left: {config.INDENTACION_INCISOS}))[
'''
            for letra, texto, _ in opciones:
                texto_typst = _typst_content(str(texto))
                typ_code += f'    #text(weight: "regular")[{letra}) {texto_typst}]\\\n'
            typ_code += "  ]\n"
        typ_code += "]\n"

    return typ_code


def _pagina_con_pie(estudiante: dict[str, Any]) -> str:
    """Configura una página oficial con identidad y numeración del estudiante."""
    nombre = _typst_content(_nombre_completo(estudiante))
    codigo_est = str(estudiante["codigo_estudiante"])
    return f'''#set page(
  width: 21.59cm,
  height: 33.02cm,
  margin: 2cm,
  header: none,
  footer: context {{
    grid(
      columns: (1fr, auto),
      align: (left, right),
      [
        {nombre}\\
        #text(size: 15pt, weight: "bold")[{codigo_est}]
      ],
      [PÁG. #counter(page).display()]
    )
  }}
)

#counter(page).update(1)
'''


def _generar_typst(
    estudiante: dict[str, Any],
    variante_letra: str,
    preguntas: list[dict[str, Any]],
    rol: dict[str, Any],
) -> str:
    """Genera un documento individual compatible para pruebas y compatibilidad."""
    return f'''#set text(
  font: "{config.TIPOGRAFIA}",
  size: {config.TAMANO_FUENTE_PT}pt,
  lang: "es"
)

#show raw: set text(font: "{config.TIPOGRAFIA}")

#set par(leading: {config.LEADING}, spacing: {config.LEADING})
{_pagina_con_pie(estudiante)}
{_cabecera_institucional(rol, estudiante)}
{_cuestionario_typst(preguntas)}
'''


def _generar_typst_unificado(
    estudiantes_con_variantes: list[tuple[dict[str, Any], str]],
    preguntas_por_variante: dict[str, list[dict[str, Any]]],
    rol: dict[str, Any],
) -> str:
    """Genera un único PDF: un examen por estudiante, iniciado en página impar."""
    typ_code = f'''#set text(
  font: "{config.TIPOGRAFIA}",
  size: {config.TAMANO_FUENTE_PT}pt,
  lang: "es"
)

#show raw: set text(font: "{config.TIPOGRAFIA}")

#set par(leading: {config.LEADING}, spacing: {config.LEADING})
'''

    for idx, (estudiante, letra) in enumerate(estudiantes_con_variantes):
        if idx > 0:
            typ_code += '\n#pagebreak(to: "odd")\n'
        typ_code += _pagina_con_pie(estudiante)
        typ_code += _cabecera_institucional(rol, estudiante)
        typ_code += _cuestionario_typst(preguntas_por_variante[letra])

    return typ_code


def _compilar_typst(typ_path: str, pdf_path: str) -> None:
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
    if config.TYPST_BIN:
        import subprocess
        subprocess.run([config.TYPST_BIN, "compile", typ_path, pdf_path], check=True, capture_output=True)
    else:
        typst.compile(typ_path, output=pdf_path)


def generar_variante(
    letra: str,
    reactivos: list[dict[str, Any]],
    rol: dict[str, Any],
    output_base: str,
    generar_pdf: bool = True,
) -> dict[str, Any]:
    seed = config.SEED_POR_VARIANTE.get(letra, 100 + ord(letra))
    preguntas = seleccionar_preguntas(reactivos, seed)

    if len(preguntas) < config.TOTAL_PREGUNTAS:
        raise ValueError(
            f"No se pudieron seleccionar {config.TOTAL_PREGUNTAS} preguntas para la variante {letra}"
        )

    # Barajar opciones de cada pregunta de forma determinística.
    preguntas = [_barajar_opciones_pregunta(p, seed + idx) for idx, p in enumerate(preguntas)]

    # Contrato seguro para el examen web: conserva exactamente el orden y los
    # incisos que se imprimen, pero elimina cualquier marca de respuesta correcta.
    contenido_virtual = []
    for p in preguntas:
        opciones = [
            {"letra": letra, "texto": texto}
            for letra, texto, _ in parsear_opciones(p.get("opciones_json", "[]"))
        ]
        contenido_virtual.append({
            "id": p["id"],
            "numeroOrden": p.get("numero_orden"),
            "tipoReactivo": p.get("tipo_reactivo"),
            "grupoContexto": p.get("grupo_contexto"),
            "enunciado": p.get("enunciado", ""),
            "opciones": opciones,
        })

    estudiante_default = {
        "codigo_estudiante": "",
        "nombres": "",
        "apellido_paterno": "",
        "apellido_materno": "",
    }

    slug_rol = _slugify(f"{rol['materia_codigo']}_{rol['sede_codigo']}_{rol['grupo']}_{rol['tipo_parcial']}")
    base_name = f"{slug_rol}_Var{letra}_{rol.get('fecha_display', '20260822').replace('/', '')}_Examen"

    typ_path = None
    pdf_path = None
    if generar_pdf:
        work_dir = os.path.join(output_base, rol["id"], "variantes")
        os.makedirs(work_dir, exist_ok=True)

        # Copiar logo al directorio de trabajo para que Typst lo encuentre.
        logo_dest = os.path.join(work_dir, "logo_unitepc_clean.png")
        if os.path.exists(config.LOGO_PATH) and not os.path.exists(logo_dest):
            shutil.copy2(config.LOGO_PATH, logo_dest)

        typ_path = os.path.join(work_dir, f"{base_name}.typ")
        pdf_path = os.path.join(work_dir, f"{base_name}.pdf")

        typ_code = _generar_typst(estudiante_default, letra, preguntas, rol)
        with open(typ_path, "w", encoding="utf-8") as f:
            f.write(typ_code)

        _compilar_typst(typ_path, pdf_path)

    patron = {}
    orden_ids = []
    for idx, p in enumerate(preguntas):
        opciones = parsear_opciones(p.get("opciones_json", "[]"))
        patron[str(idx + 1)] = _extraer_respuesta_correcta(opciones)
        orden_ids.append(p["id"])

    return {
        "letra": letra,
        "semilla": seed,
        "patronClavesJson": json.dumps(patron, ensure_ascii=False),
        "ordenReactivosIdsJson": json.dumps(orden_ids, ensure_ascii=False),
        "contenidoVirtualJson": json.dumps(contenido_virtual, ensure_ascii=False),
        "archivoPdfPath": pdf_path,
        "archivoTypstPath": typ_path,
        "_preguntas": preguntas,
    }


def generar_documento_unificado(
    estudiantes_con_variantes: list[tuple[dict[str, Any], str]],
    variantes: list[dict[str, Any]],
    preguntas_por_variante: dict[str, list[dict[str, Any]]],
    rol: dict[str, Any],
    output_base: str,
) -> dict[str, str]:
    """Compila el documento oficial único con todos los estudiantes del rol."""
    work_dir = os.path.join(output_base, rol["id"], "documentos")
    os.makedirs(work_dir, exist_ok=True)

    logo_dest = os.path.join(work_dir, "logo_unitepc_clean.png")
    if os.path.exists(config.LOGO_PATH) and not os.path.exists(logo_dest):
        shutil.copy2(config.LOGO_PATH, logo_dest)

    slug_rol = _slugify(f"{rol['materia_codigo']}_{rol['sede_codigo']}_{rol['grupo']}_{rol['tipo_parcial']}")
    base_name = f"{slug_rol}_Examenes_Oficiales"
    typ_path = os.path.join(work_dir, f"{base_name}.typ")
    pdf_path = os.path.join(work_dir, f"{base_name}.pdf")

    typ_code = _generar_typst_unificado(estudiantes_con_variantes, preguntas_por_variante, rol)
    with open(typ_path, "w", encoding="utf-8") as f:
        f.write(typ_code)
    _compilar_typst(typ_path, pdf_path)

    # El documento consolidado es el único PDF operativo. Se replica la ruta
    # en los metadatos de variante para que el contrato existente y el endpoint
    # de documentos sigan funcionando sin crear PDFs duplicados.
    for variante in variantes:
        variante["archivoPdfPath"] = pdf_path
        variante["archivoTypstPath"] = typ_path

    return {"archivoPdfPath": pdf_path, "archivoTypstPath": typ_path}


def generar_cuadernillo(
    estudiante: dict[str, Any],
    letra: str,
    preguntas: list[dict[str, Any]],
    rol: dict[str, Any],
    output_base: str,
) -> dict[str, Any]:
    slug_rol = _slugify(f"{rol['materia_codigo']}_{rol['sede_codigo']}_{rol['grupo']}_{rol['tipo_parcial']}")
    nom_slug = _slugify(f"{estudiante['nombres']}_{estudiante['apellido_paterno']}_{estudiante['apellido_materno']}")
    base_name = f"{slug_rol}_{estudiante['codigo_estudiante']}_{nom_slug}_Examen"

    work_dir = os.path.join(output_base, rol["id"], "cuadernillos")
    os.makedirs(work_dir, exist_ok=True)

    logo_dest = os.path.join(work_dir, "logo_unitepc_clean.png")
    if os.path.exists(config.LOGO_PATH) and not os.path.exists(logo_dest):
        shutil.copy2(config.LOGO_PATH, logo_dest)

    typ_path = os.path.join(work_dir, f"{base_name}.typ")
    pdf_path = os.path.join(work_dir, f"{base_name}.pdf")

    typ_code = _generar_typst(estudiante, letra, preguntas, rol)
    with open(typ_path, "w", encoding="utf-8") as f:
        f.write(typ_code)

    _compilar_typst(typ_path, pdf_path)

    return {
        "codigoEstudiante": estudiante["codigo_estudiante"],
        "letraVariante": letra,
        "hashControl": estudiante.get("hash_control_seguridad") or f"CTL-{estudiante['codigo_estudiante']}-{letra}",
        "cuadernilloPdfPath": pdf_path,
    }
