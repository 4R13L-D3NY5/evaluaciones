"""Generación de variantes de examen y cuadernillos individuales con Typst."""
import base64
import hashlib
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

TIPOS_MACRO = {"EMPAREJAMIENTO_TRONCO", "CASO_CLINICO_TRONCO"}
TIPOS_HIJO_GRUPAL = {"OPCION_EMPAREJAMIENTO", "SUBITEM_CASO"}

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

CLAVE_VF_COMPLEJAS = [
    ("A", "1, 2 y 3 son verdaderas."),
    ("B", "1 y 3 son verdaderas."),
    ("C", "2 y 4 son verdaderas."),
    ("D", "Solo 4 es verdadera."),
    ("E", "Todas son verdaderas."),
]


def normalizar_configuracion_generacion(raw: dict[str, Any] | None, rol: dict[str, Any] | None = None) -> dict[str, Any]:
    """Convierte la configuración persistida en parámetros seguros para Typst."""
    raw = raw or {}
    tipo_parcial = str(raw.get("tipoParcial") or (rol or {}).get("tipo_parcial") or "1P").upper()
    if "FINAL" in tipo_parcial:
        clave_parcial = "FINAL"
    elif "2DA" in tipo_parcial or "INSTANCIA" in tipo_parcial:
        clave_parcial = "2DA_INSTANCIA"
    elif "2" in tipo_parcial:
        clave_parcial = "2P"
    else:
        clave_parcial = "1P"

    estructura = raw.get("estructuraPreguntas") or {}
    parcial = estructura.get(clave_parcial) or {}

    def entero(valor: Any, defecto: int, minimo: int, maximo: int) -> int:
        try:
            return min(maximo, max(minimo, int(valor)))
        except (TypeError, ValueError):
            return defecto

    facil = entero(parcial.get("facil"), config.CUOTA_FACILES, 0, 1000)
    medio = entero(parcial.get("medio"), config.CUOTA_MEDIAS, 0, 1000)
    dificil = entero(parcial.get("dificil"), config.CUOTA_DIFICILES, 0, 1000)
    total = entero(parcial.get("totalPreguntas"), facil + medio + dificil, 1, 1000)
    if facil + medio + dificil != total:
        total = facil + medio + dificil

    leading_texto = str(raw.get("espaciadoLeading") or "")
    factores = re.findall(r"\d+(?:\.\d+)?", leading_texto)
    leading = f"{factores[0]}em" if factores else config.LEADING
    separacion = f"{factores[1]}em" if len(factores) > 1 else config.SEPARACION_PREGUNTAS
    fuente = str(raw.get("tipoLetra") or config.TIPOGRAFIA).strip()
    # Times New Roman no está disponible dentro de la imagen Linux. Liberation
    # Serif es su sustituta métrica compatible y evita que falle la compilación.
    if fuente.lower() == "times new roman":
        fuente = "Liberation Serif"
    formato = str(raw.get("formatoHoja") or config.FORMATO_HOJA).strip()
    ancho = "21cm" if "A4" in formato.upper() else "21.59cm"
    alto = "29.7cm" if "A4" in formato.upper() else "33.02cm"
    return {
        "totalPreguntas": total,
        "cuotaFaciles": facil,
        "cuotaMedias": medio,
        "cuotaDificiles": dificil,
        "tipoLetra": fuente,
        "tamanoLetraPt": entero(raw.get("tamanoLetraPt"), config.TAMANO_FUENTE_PT, 8, 18),
        "leading": leading,
        "separacionPreguntas": separacion,
        "anchoPagina": ancho,
        "altoPagina": alto,
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
    # Alias frecuentes de la plantilla oficial. Se convierten a símbolos
    # Typst antes de envolver palabras de texto para que no aparezcan como
    # texto literal en el PDF final. Nunca se alteran cadenas entre comillas.
    math_text = _replace_math_outside_quotes(math_text, r"\\(?:times|cdot)\b", "times", re.IGNORECASE)
    math_text = _replace_math_outside_quotes(math_text, r"\\(?:rightarrow|to)\b", "arrow", re.IGNORECASE)
    math_text = _replace_math_outside_quotes(math_text, r"\\pm\b", "plus.minus")
    math_text = _replace_math_outside_quotes(math_text, r"\+\s*-", "plus.minus")
    math_text = _replace_math_outside_quotes(math_text, r"-\s*\+", "minus.plus")
    math_text = _replace_math_outside_quotes(math_text, r"=>|->", "arrow")

    funciones = {
        "log", "ln", "lg", "sin", "cos", "tan", "cot", "sec", "csc",
        "arcsin", "arccos", "arctan", "arcsinh", "arccosh", "arctanh",
        "sinh", "cosh", "tanh", "exp", "sqrt", "lim", "sum", "prod",
        "int", "pi", "alpha", "beta", "gamma", "delta", "epsilon",
        "theta", "lambda", "mu", "sigma", "omega", "phi", "psi",
        "times", "arrow", "plus", "minus",
    }

    def _repl(match: re.Match) -> str:
        word = match.group(0)
        if word.startswith('"') and word.endswith('"'):
            return word
        if len(word) == 1 or word.lower() in funciones:
            return word
        return f'"{word}"'

    # Las cadenas ya delimitadas por comillas son texto Typst válido. El
    # sanitizador anterior volvía a envolverlas y producía `""Reparo""`,
    # que Typst interpretaba como una variable no definida.
    return re.sub(r'"(?:\\.|[^"\\])*"|[A-Za-z]+', _repl, math_text)


def _replace_math_outside_quotes(text: str, pattern: str, replacement: str, flags: int = 0) -> str:
    """Aplica una sustitución dentro de una fórmula sin tocar textos citados."""
    segmentos = re.split(r'("(?:\\.|[^"\\])*")', text)
    return "".join(
        segmento if indice % 2 == 1 else re.sub(pattern, replacement, segmento, flags=flags)
        for indice, segmento in enumerate(segmentos)
    )


def _typst_content(texto: str) -> str:
    """Convierte texto plano con fórmulas $...$ en contenido Typst.

    El texto plano se envuelve en #raw(..., block: false) para evitar que
    caracteres como #, _, * o @ se interpreten como comandos o marcado.
    Los bloques delimitados por $...$ se sanitizan para que palabras de
    texto se muestren correctamente en modo matemático. Las fórmulas se
    colocan en una línea propia para que una ecuación larga no desborde el
    ancho de la hoja ni altere el formato del texto que la acompaña.
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
            if any(part.strip() for part in segmentos[:idx]):
                partes.append("#linebreak()")
            partes.append(f"$ {_sanitize_math(math_body)} $")
            if any(part.strip() for part in segmentos[idx + 1:]):
                partes.append("#linebreak()")
        else:
            # Texto plano: escapar comillas dobles para el raw de Typst.
            escapado = segmento.replace("\\", "\\\\").replace('"', '\\"')
            partes.append(f'#raw("{escapado}", block: false)')

    # En Typst el contenido se concatena por adyacencia. El signo `+` no es
    # un operador de concatenación en este contexto y terminaría apareciendo
    # impreso entre el texto y la fórmula.
    return "".join(partes)


_OPCION_PREFIX_RE = re.compile(r"^\s*(?:[A-Ea-e]|[1-5])\s*[\.\):\-]\s*")


def _limpiar_prefijo_opcion(texto: Any) -> str:
    """Elimina un inciso escrito manualmente antes de volver a enumerarlo."""
    return _OPCION_PREFIX_RE.sub("", str(texto or "").strip(), count=1).strip()


def _preparar_imagen_typst(imagen_base64: Any, image_dir: str | None, indice: int) -> str | None:
    """Guarda una imagen del banco junto al .typ para que Typst pueda incluirla."""
    if not imagen_base64 or not image_dir:
        return None

    entrada = str(imagen_base64).split("#", 1)[0].strip()
    mime = "image/png"
    payload = entrada
    if entrada.lower().startswith("data:"):
        cabecera, separador, payload = entrada.partition(",")
        if not separador or ";base64" not in cabecera.lower():
            return None
        mime = cabecera[5:].split(";", 1)[0].lower()

    extensiones = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/webp": "webp",
        "image/gif": "gif",
    }
    extension = extensiones.get(mime)
    if not extension:
        return None

    try:
        datos = base64.b64decode(re.sub(r"\s+", "", payload), validate=True)
    except (ValueError, TypeError):
        return None
    if not datos:
        return None

    # Typst no admite WebP ni GIF en todas las versiones del worker. Las
    # imágenes pegadas desde el portapapeles suelen llegar precisamente en
    # esos formatos, por lo que se normalizan a PNG antes de generar el PDF.
    if mime in {"image/webp", "image/gif"}:
        try:
            import cv2
            import numpy as np
        except ImportError:
            return None
        try:
            imagen = cv2.imdecode(np.frombuffer(datos, dtype=np.uint8), cv2.IMREAD_UNCHANGED)
            if imagen is None:
                return None
            codificada, datos_png = cv2.imencode(".png", imagen)
            if not codificada:
                return None
            datos = datos_png.tobytes()
            extension = "png"
        except (cv2.error, ValueError):
            return None

    os.makedirs(image_dir, exist_ok=True)
    huella = hashlib.sha1(entrada.encode("utf-8")).hexdigest()[:12]
    nombre = f"imagen_reactivo_{indice}_{huella}.{extension}"
    ruta = os.path.join(image_dir, nombre)
    if not os.path.exists(ruta):
        with open(ruta, "wb") as archivo:
            archivo.write(datos)
    return nombre


def _ancho_imagen_typst(imagen_base64: Any) -> str:
    """Convierte el metadato interno del selector a un ancho consistente."""
    tamano = re.search(r"#sea-size=(GRANDE|MEDIANA|PEQUENA|MUY_PEQUENA)$", str(imagen_base64 or ""), re.IGNORECASE)
    return {
        "GRANDE": "100%",
        "MEDIANA": "70%",
        "PEQUENA": "45%",
        "MUY_PEQUENA": "28%",
    }.get((tamano.group(1).upper() if tamano else "MEDIANA"), "70%")


def _alto_imagen_typst(imagen_base64: Any) -> str:
    """Limita la altura de imágenes para que no desplacen el cuestionario."""
    tamano = re.search(r"#sea-size=(GRANDE|MEDIANA|PEQUENA|MUY_PEQUENA)$", str(imagen_base64 or ""), re.IGNORECASE)
    return {
        "GRANDE": "8cm",
        "MEDIANA": "6.5cm",
        "PEQUENA": "5cm",
        "MUY_PEQUENA": "4cm",
    }.get((tamano.group(1).upper() if tamano else "MEDIANA"), "6.5cm")


def _mayusculas(valor: Any) -> str:
    """Normaliza los textos institucionales para la cabecera oficial."""
    return str(valor or "").strip().upper()


def _es_macro(pregunta: dict[str, Any]) -> bool:
    return pregunta.get("tipo_reactivo") in TIPOS_MACRO


def _clave_grupo(pregunta: dict[str, Any]) -> tuple[str, str] | None:
    """Identifica el macro y sus hijos sin mezclar grupos de otra tipología."""
    tipo = pregunta.get("tipo_reactivo")
    grupo = str(pregunta.get("grupo_contexto") or "").strip().upper()
    if not grupo:
        return None
    if tipo in {"EMPAREJAMIENTO_TRONCO", "OPCION_EMPAREJAMIENTO"}:
        return ("EMPAREJAMIENTO", grupo)
    if tipo in {"CASO_CLINICO_TRONCO", "SUBITEM_CASO"}:
        return ("CASO", grupo)
    return None


def _numero_orden(pregunta: dict[str, Any]) -> int:
    try:
        return int(pregunta.get("numero_orden") or 0)
    except (TypeError, ValueError):
        return 0


def seleccionar_preguntas(reactivos: list[dict[str, Any]], seed: int, generation_config: dict[str, Any] | None = None) -> list[dict[str, Any]]:
    rng = random.Random(seed)
    generation_config = generation_config or normalizar_configuracion_generacion(None)
    total_requerido = generation_config["totalPreguntas"]
    cuotas = (
        generation_config["cuotaFaciles"],
        generation_config["cuotaMedias"],
        generation_config["cuotaDificiles"],
    )

    # Los macros de caso/emparejamiento son contexto, no preguntas que el
    # estudiante pueda responder. Nunca deben consumir una cuota.
    respondibles = [r for r in reactivos if not _es_macro(r)]
    # Los bancos antiguos pueden no tener id de PostgreSQL dentro del
    # paquete cifrado. En ese caso se usa la posición del reactivo, que es
    # estable durante toda esta selección y evita perder preguntas simples.
    identidades = {
        id(pregunta): pregunta.get("id") or pregunta.get("numero_orden") or f"reactivo-pos-{indice}"
        for indice, pregunta in enumerate(respondibles, start=1)
    }

    # Un caso clínico o un emparejamiento es una unidad indivisible. La
    # selección anterior elegía reactivos sueltos y luego expandía el grupo,
    # por eso una configuración de 30 podía terminar en 38. Se resuelve ahora
    # como un problema de selección de unidades: el algoritmo busca primero
    # exactamente TOTAL_PREGUNTAS y, entre esas soluciones, la distribución de
    # dificultad más cercana a las cuotas institucionales.
    unidades_por_clave: dict[tuple[Any, ...], list[dict[str, Any]]] = {}
    for pregunta in respondibles:
        grupo = _clave_grupo(pregunta)
        clave: tuple[Any, ...] = ("grupo", *grupo) if grupo is not None else ("reactivo", identidades[id(pregunta)])
        unidades_por_clave.setdefault(clave, []).append(pregunta)

    unidades = list(unidades_por_clave.values())
    rng.shuffle(unidades)

    def _conteo_dificultad(unidad: list[dict[str, Any]]) -> tuple[int, int, int]:
        conteos = [0, 0, 0]
        for pregunta in unidad:
            nivel = pregunta.get("nivel_dificultad")
            if nivel not in (1, 2, 3):
                dificultad = str(pregunta.get("dificultad") or "").strip().lower()
                nivel = 1 if dificultad == "fácil" else 2 if dificultad == "medio" else 3 if dificultad == "difícil" else 0
            if nivel in (1, 2, 3):
                conteos[nivel - 1] += 1
        return tuple(conteos)

    # Estado: (total, fáciles, medias, difíciles) -> índices de unidades.
    estados: dict[tuple[int, int, int, int], tuple[int, ...]] = {(0, 0, 0, 0): ()}
    for indice, unidad in enumerate(unidades):
        faciles, medias, dificiles = _conteo_dificultad(unidad)
        tamano = len(unidad)
        siguientes = dict(estados)
        for (total, facil, medio, dificil), seleccion in estados.items():
            nuevo_total = total + tamano
            if nuevo_total > total_requerido:
                continue
            estado = (nuevo_total, facil + faciles, medio + medias, dificil + dificiles)
            siguientes.setdefault(estado, seleccion + (indice,))
        estados = siguientes

    candidatos = [
        (estado, seleccion)
        for estado, seleccion in estados.items()
        if estado[0] == total_requerido
    ]
    if not candidatos:
        logger.warning("No existe una combinación de bloques que complete exactamente %d preguntas", total_requerido)
        candidatos = [
            (estado, seleccion)
            for estado, seleccion in estados.items()
            if estado[0] == max(estado_candidato[0] for estado_candidato in estados)
        ]
    if not candidatos:
        raise ValueError("El banco no contiene una combinación válida de preguntas para generar la variante")

    _, indices_elegidos = min(
        candidatos,
        key=lambda item: sum(abs(item[0][indice + 1] - cuotas[indice]) for indice in range(3)),
    )
    seleccionadas_respondibles = [
        pregunta
        for indice in indices_elegidos
        for pregunta in unidades[indice]
    ]

    # Agregar cada macro que sea necesario y colocarlo inmediatamente antes
    # de sus hijos. Así el PDF y el examen web conservan el contexto del grupo
    # sin convertirlo en una pregunta adicional.
    macros_por_grupo = {
        clave: pregunta
        for pregunta in sorted(reactivos, key=_numero_orden)
        if _es_macro(pregunta) and (clave := _clave_grupo(pregunta)) is not None
    }
    hijos_por_grupo: dict[tuple[str, str], list[dict[str, Any]]] = {}
    for pregunta in seleccionadas_respondibles:
        clave = _clave_grupo(pregunta)
        if clave is not None:
            hijos_por_grupo.setdefault(clave, []).append(pregunta)

    por_tipo = {
        tipo: [p for p in seleccionadas_respondibles if p["tipo_reactivo"] == tipo]
        for tipo in TIPOLOGIAS_ORDEN
    }
    bloques: list[list[dict[str, Any]]] = []
    for tipo in TIPOLOGIAS_ORDEN:
        if tipo in TIPOS_MACRO:
            continue
        if tipo in TIPOS_HIJO_GRUPAL:
            grupos_tipo = [
                (clave, hijos)
                for clave, hijos in hijos_por_grupo.items()
                if hijos and ((tipo == "OPCION_EMPAREJAMIENTO" and clave[0] == "EMPAREJAMIENTO")
                              or (tipo == "SUBITEM_CASO" and clave[0] == "CASO"))
            ]
            grupos_tipo.sort(key=lambda item: min(_numero_orden(hijo) for hijo in item[1]))
            bloque_tipo: list[dict[str, Any]] = []
            for clave, hijos in grupos_tipo:
                macro = macros_por_grupo.get(clave)
                if macro is not None:
                    bloque_tipo.append(macro)
                hijos_ordenados = sorted(hijos, key=_numero_orden)
                if clave[0] == "EMPAREJAMIENTO":
                    rng.shuffle(hijos_ordenados)
                bloque_tipo.extend(hijos_ordenados)
            # Algunos bancos antiguos no traen grupo_contexto en los hijos;
            # siguen siendo preguntas válidas y no deben desaparecer.
            bloque_tipo.extend(
                pregunta for pregunta in por_tipo[tipo]
                if _clave_grupo(pregunta) is None
            )
            if bloque_tipo:
                bloques.append(bloque_tipo)
        else:
            bloque = sorted(por_tipo[tipo], key=_numero_orden)
            if bloque:
                bloques.append(bloque)

    # Conserva tipologías nuevas que no estén todavía en TIPOLOGIAS_ORDEN.
    tipos_conocidos = set(TIPOLOGIAS_ORDEN) | TIPOS_MACRO
    tipos_nuevos = {}
    for pregunta in seleccionadas_respondibles:
        tipo_nuevo = pregunta.get("tipo_reactivo")
        if tipo_nuevo not in tipos_conocidos:
            tipos_nuevos.setdefault(tipo_nuevo, []).append(pregunta)
    bloques.extend(sorted(tipos_nuevos.values(), key=lambda bloque: min(_numero_orden(p) for p in bloque)))

    # El orden de las secciones cambia por variante. Los casos clínicos
    # conservan sus subítems en orden; en emparejamiento, en cambio, los
    # enunciados hijos se barajan. La tarjeta de opciones de referencia
    # permanece sin cambios.
    rng.shuffle(bloques)
    return [pregunta for bloque in bloques for pregunta in bloque]


def _nombre_completo(estudiante: dict[str, Any]) -> str:
    return " ".join(
        _mayusculas(estudiante.get(campo))
        for campo in ("nombres", "apellido_paterno", "apellido_materno")
        if _mayusculas(estudiante.get(campo))
    )


def _cabecera_institucional(
    rol: dict[str, Any],
    estudiante: dict[str, Any] | None = None,
    total_preguntas: int | None = None,
    generation_config: dict[str, Any] | None = None,
) -> str:
    generation_config = generation_config or normalizar_configuracion_generacion(None, rol)
    tipo_parcial = _mayusculas(rol.get("tipo_parcial", "1er Parcial"))
    total_visible = total_preguntas if total_preguntas is not None else generation_config["totalPreguntas"]
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
        cabecera += _ficha_estudiante(rol, estudiante, generation_config)
    cabecera += f"""
#v({generation_config['leading']})
#align(center)[
  #text(weight: "bold")[CUESTIONARIO DE PREGUNTAS ({total_visible})]
]

#v({generation_config['leading']})
#line(length: 100%, stroke: 0.75pt + black)
#v({generation_config['leading']})
"""
    return cabecera


def _ficha_estudiante(rol: dict[str, Any], estudiante: dict[str, Any], generation_config: dict[str, Any] | None = None) -> str:
    """Ficha oficial de examen. Los datos provienen de SEA y no incluyen variante."""
    generation_config = generation_config or normalizar_configuracion_generacion(None, rol)
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
#v({generation_config['leading']})
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
#v({generation_config['leading']})
'''


def _seccion_typst(titulo: str, instruccion: str, generation_config: dict[str, Any] | None = None) -> str:
    """Renderiza una sección con las reglas visuales del formato oficial."""
    generation_config = generation_config or normalizar_configuracion_generacion(None)
    instrucciones = "\n".join(
        f'#text(weight: "regular")[{_typst_content(linea.strip())}]\\'
        for linea in instruccion.splitlines()
        if linea.strip()
    )
    return f'''
#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v({generation_config['leading']})
  #text(weight: "bold")[{_typst_content(_mayusculas(titulo))}]\\
  {instrucciones}
  #v({generation_config['leading']})
  #line(length: 100%, stroke: 0.5pt + black)
]
#v({generation_config['leading']})
'''


def _cuestionario_typst(preguntas: list[dict[str, Any]], image_dir: str | None = None, generation_config: dict[str, Any] | None = None) -> str:
    """Construye el cuestionario sin datos de estudiante ni etiquetas de variante."""
    generation_config = generation_config or normalizar_configuracion_generacion(None)
    typ_code = ""
    current_section = None
    numero_pregunta = 0
    for indice, p in enumerate(preguntas):
        tipo = p.get("tipo_reactivo", "")
        imagen_path = _preparar_imagen_typst(p.get("imagen_base64"), image_dir, indice)
        imagen_code = (
            f'#block(width: 100%, breakable: false)[#align(center)[#image("{imagen_path}", width: {_ancho_imagen_typst(p.get("imagen_base64"))}, height: {_alto_imagen_typst(p.get("imagen_base64"))}, fit: "contain")]]\\\n'
            if imagen_path else ""
        )

        seccion_tipo = (
            "OPCION_EMPAREJAMIENTO"
            if tipo in {"EMPAREJAMIENTO_TRONCO", "OPCION_EMPAREJAMIENTO"}
            else "SUBITEM_CASO"
            if tipo in {"CASO_CLINICO_TRONCO", "SUBITEM_CASO"}
            else tipo
        )
        if seccion_tipo in INSTRUCCIONES_POR_TIPO and current_section != seccion_tipo:
            current_section = seccion_tipo
            titulo, instruccion = INSTRUCCIONES_POR_TIPO[seccion_tipo]
            typ_code += _seccion_typst(titulo, instruccion, generation_config)
            if seccion_tipo == "OPCION_EMPAREJAMIENTO" and tipo == "OPCION_EMPAREJAMIENTO":
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
            if not opciones_referencia:
                opciones_referencia = [
                    (letra, str(p.get(f"opcion_{letra.lower()}") or ""), False)
                    for letra in "ABCDE"
                    if str(p.get(f"opcion_{letra.lower()}") or "").strip()
                ]
            lineas_tarjeta = [str(p.get("enunciado") or "RELACIONE EL CONCEPTO CON SU DEFINICION CORRECTA:")]
            lineas_tarjeta.extend(
                f"{letra}) {_limpiar_prefijo_opcion(texto)}" for letra, texto, _ in opciones_referencia
            )
            contenido_tarjeta = "\\\n  ".join(
                f'#text(weight: "regular")[{_typst_content(linea)}]' for linea in lineas_tarjeta
            )
            typ_code += f'''\n#rect(width: 100%, stroke: 0.5pt + black, fill: rgb("#f8fafc"), inset: 3.5pt)[
  {contenido_tarjeta}
]
#v(1em)
'''
            if imagen_code:
                typ_code += imagen_code
            continue

        if tipo == "CASO_CLINICO_TRONCO":
            typ_code += f'''
#rect(width: 100%, stroke: 0.5pt + black, fill: rgb("#f8fafc"), inset: 3.5pt)[
  [#text(weight: "bold")[CASO CLINICO O PROBLEMA:]]\\
  [{_typst_content(str(p.get("enunciado") or "Resuelva el caso planteado y responda cada pregunta del grupo."))}]
]
#v(1em)
'''
            if imagen_code:
                typ_code += imagen_code
            continue

        # El número visible corresponde únicamente a preguntas respondibles;
        # el macro ya fue mostrado como contexto de la sección.
        numero_pregunta += 1
        num = numero_pregunta

        enunciado = _typst_content(str(p.get("enunciado", "")))
        if tipo == "VERDADERO_O_FALSO_COMPLEJAS":
            afirmaciones = parsear_opciones(p.get("opciones_json", "[]"))[:4]
            typ_code += f'\n#block(breakable: false, spacing: {generation_config["separacionPreguntas"]})[\n'
            typ_code += f'  #box[#text(weight: "bold")[{num}. #raw("___", block: false)]] #h(0.25em){enunciado}\\\\\n'
            typ_code += imagen_code
            typ_code += '  #v(0.15em)\n'
            typ_code += f'  #block(inset: (left: {config.INDENTACION_INCISOS}))[\n'
            for indice_afirmacion, (_, texto, _) in enumerate(afirmaciones, start=1):
                typ_code += f'    #text(weight: "regular")[{indice_afirmacion}) {_typst_content(_limpiar_prefijo_opcion(texto))}]\\\\\n'
            typ_code += '  ]\\\\\n'
            typ_code += '  #v(0.4em)\n'
            typ_code += f'  #block(inset: (left: {config.INDENTACION_INCISOS}))[\n'
            for letra, texto in CLAVE_VF_COMPLEJAS:
                typ_code += f'    #text(weight: "regular")[{letra}) {_typst_content(texto)}]\\\\\n'
            typ_code += '  ]\n]\n'
            continue

        # Las filas hijas de emparejamiento no llevan incisos propios: la
        # respuesta es la clave A-E de relación y se registra internamente.
        opciones = [] if tipo in {"VERDADERO_O_FALSO_SIMPLE", "OPCION_EMPAREJAMIENTO"} else parsear_opciones(
            p.get("opciones_json", "[]")
        )
        typ_code += f'''
#block(breakable: false, spacing: {generation_config['separacionPreguntas']})[
  #box[#text(weight: "bold")[{num}. #raw("___", block: false)]] #h(0.25em){enunciado}\\
{imagen_code}'''
        if opciones:
            typ_code += f'''  #v(0.15em)
  #block(inset: (left: {config.INDENTACION_INCISOS}))[
'''
            for letra, texto, _ in opciones:
                texto_typst = _typst_content(_limpiar_prefijo_opcion(texto))
                typ_code += f'    #text(weight: "regular")[{letra}) {texto_typst}]\\\n'
            typ_code += "  ]\n"
        typ_code += "]\n"

    return typ_code


def _pagina_con_pie(estudiante: dict[str, Any], generation_config: dict[str, Any] | None = None) -> str:
    """Configura una página oficial con identidad y numeración del estudiante."""
    generation_config = generation_config or normalizar_configuracion_generacion(None)
    nombre = _typst_content(_nombre_completo(estudiante))
    codigo_est = str(estudiante["codigo_estudiante"])
    return f'''#set page(
  width: {generation_config['anchoPagina']},
  height: {generation_config['altoPagina']},
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
    image_dir: str | None = None,
    total_preguntas: int | None = None,
    generation_config: dict[str, Any] | None = None,
) -> str:
    """Genera un documento individual compatible para pruebas y compatibilidad."""
    generation_config = generation_config or normalizar_configuracion_generacion(None, rol)
    return f'''#set text(
  font: "{generation_config['tipoLetra']}",
  size: {generation_config['tamanoLetraPt']}pt,
  lang: "es"
)

#show raw: set text(font: "{generation_config['tipoLetra']}")

#set par(leading: {generation_config['leading']}, spacing: {generation_config['leading']})
{_pagina_con_pie(estudiante, generation_config)}
{_cabecera_institucional(rol, estudiante, total_preguntas, generation_config)}
{_cuestionario_typst(preguntas, image_dir, generation_config)}
'''


def _generar_typst_unificado(
    estudiantes_con_variantes: list[tuple[dict[str, Any], str]],
    preguntas_por_variante: dict[str, list[dict[str, Any]]],
    rol: dict[str, Any],
    image_dir: str | None = None,
    generation_config: dict[str, Any] | None = None,
) -> str:
    """Genera un único PDF: un examen por estudiante, iniciado en página impar."""
    generation_config = generation_config or normalizar_configuracion_generacion(None, rol)
    typ_code = f'''#set text(
  font: "{generation_config['tipoLetra']}",
  size: {generation_config['tamanoLetraPt']}pt,
  lang: "es"
)

#show raw: set text(font: "{generation_config['tipoLetra']}")

#set par(leading: {generation_config['leading']}, spacing: {generation_config['leading']})
'''

    for idx, (estudiante, letra) in enumerate(estudiantes_con_variantes):
        if idx > 0:
            typ_code += '\n#pagebreak(to: "odd")\n'
        typ_code += _pagina_con_pie(estudiante, generation_config)
        typ_code += _cabecera_institucional(rol, estudiante, None, generation_config)
        typ_code += _cuestionario_typst(preguntas_por_variante[letra], image_dir, generation_config)

    return typ_code


def _compilar_typst(typ_path: str, pdf_path: str) -> None:
    os.makedirs(os.path.dirname(pdf_path), exist_ok=True)
    if config.TYPST_BIN:
        import subprocess
        resultado = subprocess.run(
            [config.TYPST_BIN, "compile", typ_path, pdf_path],
            check=False,
            capture_output=True,
            text=True,
        )
        if resultado.returncode != 0:
            detalle = (resultado.stderr or resultado.stdout or "Typst no devolvió detalles").strip()
            raise RuntimeError(f"Typst no pudo compilar el documento: {detalle}")
    else:
        typst.compile(typ_path, output=pdf_path)


def generar_variante(
    letra: str,
    reactivos: list[dict[str, Any]],
    rol: dict[str, Any],
    output_base: str,
    generar_pdf: bool = True,
    modo_previsualizacion: bool = False,
    configuracion: dict[str, Any] | None = None,
) -> dict[str, Any]:
    generation_config = normalizar_configuracion_generacion(configuracion, rol)
    if letra in config.SEED_POR_VARIANTE:
        seed = config.SEED_POR_VARIANTE[letra]
    else:
        # Mantiene una semilla estable también para AA, AB, etc.
        valor = 0
        for caracter in letra:
            valor = valor * 26 + (ord(caracter) - ord("A") + 1)
        seed = 100 + valor * 53
    # La generación oficial aplica la selección institucional de 30 reactivos
    # y distribuye las tipologías entre variantes. La previsualización tiene
    # otro objetivo: permitir que el docente revise el banco completo, por lo
    # que debe conservar exactamente la lista recibida y su orden original.
    preguntas = list(reactivos) if modo_previsualizacion else seleccionar_preguntas(reactivos, seed, generation_config)

    total_respondibles = sum(1 for pregunta in preguntas if not _es_macro(pregunta))
    if modo_previsualizacion and total_respondibles == 0:
        raise ValueError("La previsualización requiere al menos una pregunta respondible")
    if not modo_previsualizacion and total_respondibles != generation_config["totalPreguntas"]:
        raise ValueError(
            f"La variante {letra} requiere exactamente {generation_config['totalPreguntas']} preguntas respondibles, "
            f"pero se seleccionaron {total_respondibles}"
        )

    # Las opciones también deben conservar el orden del banco durante la
    # revisión. Solo se barajan para la generación oficial de variantes.
    if not modo_previsualizacion:
        preguntas = [_barajar_opciones_pregunta(p, seed + idx) for idx, p in enumerate(preguntas)]

    # Contrato seguro para el examen web: conserva exactamente el orden y los
    # incisos que se imprimen, pero elimina cualquier marca de respuesta correcta.
    contenido_virtual = []
    for p in preguntas:
        opciones = [
            {"letra": letra, "texto": _limpiar_prefijo_opcion(texto)}
            for letra, texto, _ in parsear_opciones(p.get("opciones_json", "[]"))
        ]
        contenido_virtual.append({
            "id": p["id"],
            "numeroOrden": p.get("numero_orden"),
            "tipoReactivo": p.get("tipo_reactivo"),
            "grupoContexto": p.get("grupo_contexto"),
            "enunciado": p.get("enunciado", ""),
            "imagenBase64": p.get("imagen_base64"),
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

        typ_code = _generar_typst(
            estudiante_default,
            letra,
            preguntas,
            rol,
            work_dir,
            total_preguntas=total_respondibles if modo_previsualizacion else None,
            generation_config=generation_config,
        )
        with open(typ_path, "w", encoding="utf-8") as f:
            f.write(typ_code)

        _compilar_typst(typ_path, pdf_path)

    patron = {}
    orden_ids = []
    numero_pregunta = 0
    for p in preguntas:
        if _es_macro(p):
            continue
        numero_pregunta += 1
        opciones = parsear_opciones(p.get("opciones_json", "[]"))
        patron[str(numero_pregunta)] = _extraer_respuesta_correcta(opciones)
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
    generation_config: dict[str, Any] | None = None,
) -> dict[str, str]:
    """Compila el documento oficial único con todos los estudiantes del rol."""
    generation_config = generation_config or normalizar_configuracion_generacion(None, rol)
    work_dir = os.path.join(output_base, rol["id"], "documentos")
    os.makedirs(work_dir, exist_ok=True)

    logo_dest = os.path.join(work_dir, "logo_unitepc_clean.png")
    if os.path.exists(config.LOGO_PATH) and not os.path.exists(logo_dest):
        shutil.copy2(config.LOGO_PATH, logo_dest)

    slug_rol = _slugify(f"{rol['materia_codigo']}_{rol['sede_codigo']}_{rol['grupo']}_{rol['tipo_parcial']}")
    base_name = f"{slug_rol}_Examenes_Oficiales"
    typ_path = os.path.join(work_dir, f"{base_name}.typ")
    pdf_path = os.path.join(work_dir, f"{base_name}.pdf")

    typ_code = _generar_typst_unificado(
        estudiantes_con_variantes, preguntas_por_variante, rol, work_dir, generation_config
    )
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

    typ_code = _generar_typst(estudiante, letra, preguntas, rol, work_dir)
    with open(typ_path, "w", encoding="utf-8") as f:
        f.write(typ_code)

    _compilar_typst(typ_path, pdf_path)

    return {
        "codigoEstudiante": estudiante["codigo_estudiante"],
        "letraVariante": letra,
        "hashControl": estudiante.get("hash_control_seguridad") or f"CTL-{estudiante['codigo_estudiante']}-{letra}",
        "cuadernilloPdfPath": pdf_path,
    }
