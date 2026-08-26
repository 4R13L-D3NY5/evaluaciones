import os
import shutil
import random
import typst

# =============================================================================
# BANCO BASE DE 60 PREGUNTAS CLASIFICADAS POR DIFICULTAD
# =============================================================================
# 15 Fáciles (Nivel 1), 30 Medias (Nivel 2), 15 Difíciles (Nivel 3)

BANCO_FACILES_15 = [
    {
        "id": 1,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
        "dificultad": "Fácil",
        "enunciado": "En la auditoría tributaria para determinar la base imponible del IUE se debe considerar como gasto no deducible:",
        "opciones": [
            ("A", "Excluir los gastos personales de los socios sin respaldo de factura legal", True),
            ("B", "Deducir únicamente las compras vinculadas a la actividad gravada", False),
            ("C", "Depreciar conforme a la tabla oficial del D.S. 24051", False),
            ("D", "Registrar contablemente los sueldos del personal de planta", False),
            ("E", "Computar los aportes patronales devengados en el ejercicio", False)
        ]
    },
    {
        "id": 2,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
        "dificultad": "Fácil",
        "enunciado": "Según el Código Tributario Boliviano (Ley 2492), el término de prescripción de las facultades de fiscalización es de:",
        "opciones": [
            ("A", "2 años calendario continuos", False),
            ("B", "4 años improrrogables", False),
            ("C", "5 años para personas naturales únicamente", False),
            ("D", "20 años en materia de contravenciones aduaneras", False),
            ("E", "8 años para tributos de periodicidad anual y contravenciones", True)
        ]
    },
    {
        "id": 3,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
        "dificultad": "Fácil",
        "enunciado": "Para el cómputo del Crédito Fiscal IVA en compras de bienes y servicios, el documento fiscal debe:",
        "opciones": [
            ("A", "Ser emitido exclusivamente en moneda extranjera", False),
            ("B", "Ser cancelado únicamente en efectivo al momento de la entrega", False),
            ("C", "Contar con autorización del Ministerio de Economía", False),
            ("D", "Estar vinculado a la actividad gravada, a nombre y NIT del sujeto pasivo y respaldado", True),
            ("E", "Tener una antigüedad mayor a 180 días calendario", False)
        ]
    },
    {
        "id": 4,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
        "dificultad": "Fácil",
        "enunciado": "En una auditoría tributaria, la técnica de confirmación de saldos con terceros verifica principalmente:",
        "opciones": [
            ("A", "Estructura societaria y tenencia accionaria", False),
            ("B", "Existencia, integridad y exactitud de cuentas por cobrar y pagar comerciales", True),
            ("C", "Capacidad de pago futura y solvencia de la entidad", False),
            ("D", "Coeficiente de liquidez ácida del período", False),
            ("E", "Depreciación acumulada de activos intangibles", False)
        ]
    },
    {
        "id": 5,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
        "dificultad": "Fácil",
        "enunciado": "La alícuota general del Impuesto a las Transacciones (IT) según la Ley 843 es del:",
        "opciones": [
            ("A", "3% sobre los ingresos brutos devengados o percibidos", True),
            ("B", "13% sobre el valor neto de la factura", False),
            ("C", "25% sobre la utilidad neta imponible", False),
            ("D", "1.5% sobre transacciones comerciales al por mayor", False),
            ("E", "0.30% aplicable al débito y crédito bancario", False)
        ]
    },
    {
        "id": 6,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
        "dificultad": "Fácil",
        "enunciado": "La no emisión de factura en una venta de bienes o servicios constituye una contravención tributaria sancionada con:",
        "opciones": [
            ("A", "Clausura del establecimiento comercial de acuerdo a la reincidencia", True),
            ("B", "Pérdida automática de la personería jurídica", False),
            ("C", "Decomiso definitivo de la mercadería sin reclamo", False),
            ("D", "Prisión de 1 a 3 años para el representante legal", False),
            ("E", "Suspensión definitiva del Registro Tributario (NIT)", False)
        ]
    },
    {
        "id": 7,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
        "dificultad": "Fácil",
        "enunciado": "El plazo reglamentario para la presentación de descargos ante una Vista de Cargo emitida por el SIN es de:",
        "opciones": [
            ("A", "30 días calendario improrrogables computables a partir de su notificación", True),
            ("B", "10 días hábiles administrativos", False),
            ("C", "60 días calendario continuos", False),
            ("D", "15 días hábiles según Ley 2492", False),
            ("E", "5 días hábiles a partir de la publicación en prensa", False)
        ]
    },
    {
        "id": 8,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "dificultad": "Fácil",
        "enunciado": "El principio de devengado tributario reconoce ingresos y gastos cuando se generan legalmente, con independencia del cobro o pago.",
        "opciones": [("A", "Verdadero", True), ("B", "Falso", False)]
    },
    {
        "id": 9,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "dificultad": "Fácil",
        "enunciado": "Las donaciones a instituciones no lucrativas autorizadas son deducibles del IUE hasta el límite del 10% de la utilidad imponible.",
        "opciones": [("A", "Verdadero", True), ("B", "Falso", False)]
    },
    {
        "id": 10,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "dificultad": "Fácil",
        "enunciado": "Las multas pagadas por contravenciones tributarias al SIN son consideradas gastos deducibles en la liquidación del IUE.",
        "opciones": [("A", "Verdadero", False), ("B", "Falso", True)]
    },
    {
        "id": 11,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "dificultad": "Fácil",
        "enunciado": "El débito fiscal IVA se genera en la venta de bienes muebles en el momento de la entrega del bien o emisión de factura, lo que ocurra primero.",
        "opciones": [("A", "Verdadero", True), ("B", "Falso", False)]
    },
    {
        "id": 12,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "dificultad": "Fácil",
        "enunciado": "Los contribuyentes del Régimen Tributario Simplificado (RTS) están obligados a emitir facturas oficiales y llevar libros de compras.",
        "opciones": [("A", "Verdadero", False), ("B", "Falso", True)]
    },
    {
        "id": 13,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "dificultad": "Fácil",
        "enunciado": "La depreciación de inmuebles bajo el método de línea recta tiene un coeficiente anual del 2.5% según el D.S. 24051.",
        "opciones": [("A", "Verdadero", True), ("B", "Falso", False)]
    },
    {
        "id": 14,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "dificultad": "Fácil",
        "enunciado": "El Impuesto a las Grandes Fortunas (IGF) aplica a personas naturales con patrimonio superior a Bs 30 millones en territorio nacional y extranjero.",
        "opciones": [("A", "Verdadero", True), ("B", "Falso", False)]
    },
    {
        "id": 15,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "dificultad": "Fácil",
        "enunciado": "El crédito fiscal generado en compras de combustible (gasolina y diésel) es computable al 100% del valor total de la factura.",
        "opciones": [("A", "Verdadero", False), ("B", "Falso", True)]
    }
]

BANCO_MEDIAS_30 = [
    {
        "id": 16,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
        "dificultad": "Medio",
        "enunciado": "El método de determinación de la base imponible sobre base presunta procede cuando:",
        "opciones": [
            ("A", "Se cuenta con estados financieros auditados con dictamen limpio", False),
            ("B", "El sujeto pasivo no presenta libros contables ni documentación fidedigna", True),
            ("C", "Las ventas superan los límites del régimen simplificado", False),
            ("D", "Se solicita una prórroga para el pago de la deuda", False),
            ("E", "El contribuyente presenta todos sus libros notariados", False)
        ]
    },
    {
        "id": 17,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
        "dificultad": "Medio",
        "enunciado": "Las compensaciones del IUE efectivamente pagado contra el IT operan:",
        "opciones": [
            ("A", "A partir del mes siguiente al pago del IUE hasta su total agotamiento o nuevo vencimiento", True),
            ("B", "De manera retroactiva a los períodos del año anterior", False),
            ("C", "Únicamente contra el débito fiscal IVA compras", False),
            ("D", "Hasta un máximo del 50% de las ventas brutas declaradas", False),
            ("E", "Exclusivamente en empresas del sector minero y petrolero", False)
        ]
    },
    {
        "id": 18,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
        "dificultad": "Medio",
        "enunciado": "La bancarización obligatoria establecida por el SIN es exigible para transacciones iguales o mayores a:",
        "opciones": [
            ("A", "Bs 10.000", False),
            ("B", "Bs 50.000", True),
            ("C", "Bs 100.000", False),
            ("D", "Bs 25.000", False),
            ("E", "Bs 5.000", False)
        ]
    },
    {
        "id": 19,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
        "dificultad": "Medio",
        "enunciado": "En el Régimen Complementario al IVA (RC-IVA) para dependientes, el Formulario 110 admite facturas de hasta:",
        "opciones": [
            ("A", "120 días anteriores a la fecha de presentación al empleador", True),
            ("B", "30 días anteriores a la fecha de presentación", False),
            ("C", "60 días calendario improrrogables", False),
            ("D", "180 días del año fiscal", False),
            ("E", "Exclusivamente del mes en curso", False)
        ]
    },
    {
        "id": 20,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
        "dificultad": "Medio",
        "enunciado": "El ajuste por inflación y tenencia de bienes (AITB) de los activos fijos según la NC 3 tiene efecto fiscal de:",
        "opciones": [
            ("A", "Ingreso o gasto gravable/deducible en la determinación del IUE", True),
            ("B", "No deducible en un 100% bajo ninguna circunstancia", False),
            ("C", "Exento de todo tributo de dominio nacional", False),
            ("D", "Compensable directamente contra el IVA compras", False),
            ("E", "Gravado exclusivamente por el Impuesto a las Grandes Fortunas", False)
        ]
    },
    {
        "id": 21,
        "tipo": "RESPUESTA_PREMISAS_ABCD",
        "dificultad": "Medio",
        "enunciado": "I. El crédito fiscal IVA respaldado por compras vinculadas a la actividad gravada es computable.\nII. Las retenciones tributarias no liberan al sujeto pasivo de su obligación formal.",
        "opciones": [
            ("A", "Si la primera premisa es verdadera", False),
            ("B", "Si la segunda premisa es verdadera", False),
            ("C", "Si ambas premisas son verdaderas", True),
            ("D", "Si ninguna de las premisas es verdadera", False)
        ]
    },
    {
        "id": 22,
        "tipo": "RESPUESTA_PREMISAS_ABCD",
        "dificultad": "Medio",
        "enunciado": "I. Los profesionales independientes liquidan el IUE mediante el Formulario 510 aplicando la alícuota del 25% sobre el 50% presunto.\nII. El IT pagado por profesionales independientes es acreditable al 100% contra el IVA débito.",
        "opciones": [
            ("A", "Si la primera premisa es verdadera", True),
            ("B", "Si la segunda premisa es verdadera", False),
            ("C", "Si ambas premisas son verdaderas", False),
            ("D", "Si ninguna de las premisas es verdadera", False)
        ]
    },
    {
        "id": 23,
        "tipo": "RESPUESTA_PREMISAS_ABCD",
        "dificultad": "Medio",
        "enunciado": "I. Los gastos de representación con respaldo de factura son 100% deducibles en el IUE sin ningún tope reglamentario.\nII. Los sueldos pagados a socios que no trabajan efectivamente en la empresa son deducibles.",
        "opciones": [
            ("A", "Si la primera premisa es verdadera", False),
            ("B", "Si la segunda premisa es verdadera", False),
            ("C", "Si ambas premisas son verdaderas", False),
            ("D", "Si ninguna de las premisas es verdadera", True)
        ]
    },
    {
        "id": 24,
        "tipo": "RESPUESTA_PREMISAS_ABCD",
        "dificultad": "Medio",
        "enunciado": "I. La prescripción tributaria se interrumpe con la notificación de la Resolución Determinativa.\nII. El pago parcial de la deuda tributaria suspende el cómputo de la prescripción.",
        "opciones": [
            ("A", "Si la primera premisa es verdadera", False),
            ("B", "Si la segunda premisa es verdadera", False),
            ("C", "Si ambas premisas son verdaderas", True),
            ("D", "Si ninguna de las premisas es verdadera", False)
        ]
    },
    {
        "id": 25,
        "tipo": "RESPUESTA_PREMISAS_ABCD",
        "dificultad": "Medio",
        "enunciado": "I. Las exportaciones definitivas de bienes están gravadas con tasa cero en el IVA.\nII. Los exportadores pueden solicitar la devolución del crédito fiscal mediante CEDEIMs.",
        "opciones": [
            ("A", "Si la primera premisa es verdadera", False),
            ("B", "Si la segunda premisa es verdadera", False),
            ("C", "Si ambas premisas son verdaderas", True),
            ("D", "Si ninguna de las premisas es verdadera", False)
        ]
    },
    {
        "id": 26,
        "tipo": "RESPUESTA_PREMISAS_ABCD",
        "dificultad": "Medio",
        "enunciado": "I. Las compras de servicios a personas naturales no inscritas generan retención del 12.5% por IUE y 3% por IT.\nII. Las retenciones por compra de bienes son del 5% por IUE y 3% por IT.",
        "opciones": [
            ("A", "Si la primera premisa es verdadera", False),
            ("B", "Si la segunda premisa es verdadera", False),
            ("C", "Si ambas premisas son verdaderas", True),
            ("D", "Si ninguna de las premisas es verdadera", False)
        ]
    },
    {
        "id": 27,
        "tipo": "RESPUESTA_PREMISAS_ABCD",
        "dificultad": "Medio",
        "enunciado": "I. El valor residual de los activos fijos totalmente depreciados se mantiene contablemente en Bs 1.\nII. La revalorización técnica de activos fijos genera crédito fiscal IVA automático.",
        "opciones": [
            ("A", "Si la primera premisa es verdadera", True),
            ("B", "Si la segunda premisa es verdadera", False),
            ("C", "Si ambas premisas son verdaderas", False),
            ("D", "Si ninguna de las premisas es verdadera", False)
        ]
    },
    {
        "id": 28,
        "tipo": "RESPUESTA_PREMISAS_ABCD",
        "dificultad": "Medio",
        "enunciado": "I. Las notas fiscales emitidas por el Sistema Electrónico no requieren impresión física para su validez.\nII. El código QR impreso en facturas contiene información fiscal validada por el SIN.",
        "opciones": [
            ("A", "Si la primera premisa es verdadera", False),
            ("B", "Si la segunda premisa es verdadera", False),
            ("C", "Si ambas premisas son verdaderas", True),
            ("D", "Si ninguna de las premisas es verdadera", False)
        ]
    },
    {
        "id": 29,
        "tipo": "RESPUESTA_PREMISAS_ABCD",
        "dificultad": "Medio",
        "enunciado": "I. La Vista de Cargo fija la liquidación previa de la deuda tributaria y abre el período probatorio.\nII. La Resolución Determinativa es el acto definitivo que pone fin al procedimiento de fiscalización.",
        "opciones": [
            ("A", "Si la primera premisa es verdadera", False),
            ("B", "Si la segunda premisa es verdadera", False),
            ("C", "Si ambas premisas son verdaderas", True),
            ("D", "Si ninguna de las premisas es verdadera", False)
        ]
    },
    {
        "id": 30,
        "tipo": "RESPUESTA_PREMISAS_ABCD",
        "dificultad": "Medio",
        "enunciado": "I. La alícuota del ICE es idéntica para bebidas alcohólicas y vehículos automotores.\nII. El ICE pagado en importaciones es computable como crédito fiscal IVA.",
        "opciones": [
            ("A", "Si la primera premisa es verdadera", False),
            ("B", "Si la segunda premisa es verdadera", False),
            ("C", "Si ambas premisas son verdaderas", False),
            ("D", "Si ninguna de las premisas es verdadera", True)
        ]
    },
    {
        "id": 31,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
        "dificultad": "Medio",
        "enunciado": "En una auditoría fiscal determine los reparos aplicables por incumplimiento a la normativa tributaria:\n1. Omisión de ingresos reales en estados financieros auditados.\n2. Gastos no deducibles por falta de documento de bancarización fehaciente.\n3. Crédito fiscal computado sin factura original o electrónica autorizada.\n4. Errores aritméticos en libros de compras y ventas IVA del período.",
        "opciones": [
            ("A", "1, 2 y 3 son correctas", True),
            ("B", "1 y 3 son correctas", False),
            ("C", "2 y 4 son correctas", False),
            ("D", "Solo 4 es correcta", False),
            ("E", "Todas son correctas", False)
        ]
    },
    {
        "id": 32,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
        "dificultad": "Medio",
        "enunciado": "Son condiciones formales para la deducción de sueldos y salarios en la liquidación del IUE:\n1. Planillas de sueldos debidamente visadas por el Ministerio de Trabajo.\n2. Pago de aportes patronales y laborales a las entidades de seguridad social.\n3. Contratos de trabajo registrados ante la autoridad competente.\n4. Comprobante de retención del RC-IVA debidamente declarado en Formulario 608.",
        "opciones": [
            ("A", "1, 2 y 3 son correctas", False),
            ("B", "1 y 3 son correctas", True),
            ("C", "2 y 4 son correctas", False),
            ("D", "Solo 4 es correcta", False),
            ("E", "Todas son correctas", False)
        ]
    },
    {
        "id": 33,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
        "dificultad": "Medio",
        "enunciado": "Constituyen hechos generadores del Impuesto a las Transacciones (IT):\n1. Venta de bienes muebles e inmuebles en territorio nacional.\n2. Prestación de servicios comerciales y profesionales de toda índole.\n3. Alquiler de bienes muebles e inmuebles.\n4. Transferencias a título gratuito de bienes y derechos.",
        "opciones": [
            ("A", "1, 2 y 3 son correctas", False),
            ("B", "1 y 3 son correctas", False),
            ("C", "2 y 4 son correctas", False),
            ("D", "Solo 4 es correcta", False),
            ("E", "Todas son correctas", True)
        ]
    },
    {
        "id": 34,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
        "dificultad": "Medio",
        "enunciado": "Respecto a los métodos de depreciación admitidos por el D.S. 24051 determine su validez:\n1. Método de línea recta según tabla oficial de vida útil.\n2. Método de unidades producidas con aprobación previa del SIN.\n3. Método de horas de trabajo para maquinaria pesada.\n4. Depreciación libre elegida discrecionalmente por la empresa.",
        "opciones": [
            ("A", "1, 2 y 3 son correctas", True),
            ("B", "1 y 3 son correctas", False),
            ("C", "2 y 4 son correctas", False),
            ("D", "Solo 4 es correcta", False),
            ("E", "Todas son correctas", False)
        ]
    },
    {
        "id": 35,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
        "dificultad": "Medio",
        "enunciado": "Son facultades específicas de la Administración Tributaria según la Ley 2492:\n1. Control, comprobación, verificación, fiscalización e investigación.\n2. Determinación de tributos sobre base cierta o presunta.\n3. Imposición de sanciones y ejecución de la deuda tributaria.\n4. Emisión de normas reglamentarias de carácter general.",
        "opciones": [
            ("A", "1, 2 y 3 son correctas", False),
            ("B", "1 y 3 son correctas", False),
            ("C", "2 y 4 son correctas", False),
            ("D", "Solo 4 es correcta", False),
            ("E", "Todas son correctas", True)
        ]
    },
    {
        "id": 36,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
        "dificultad": "Medio",
        "enunciado": "Constituyen causales de nulidad absoluta en los actos administrativos tributarios:\n1. Actos dictados por autoridad incompetente por razón de materia o territorio.\n2. Omisión de la fundamentación técnica y legal del reparo.\n3. Actos dictados prescindiendo total y absolutamente del procedimiento legalmente establecido.\n4. Errores mecanográficos en el domicilio fiscal del contribuyente.",
        "opciones": [
            ("A", "1, 2 y 3 son correctas", False),
            ("B", "1 y 3 son correctas", True),
            ("C", "2 y 4 son correctas", False),
            ("D", "Solo 4 es correcta", False),
            ("E", "Todas son correctas", False)
        ]
    },
    {
        "id": 37,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
        "dificultad": "Medio",
        "enunciado": "Son elementos que componen la Deuda Tributaria (DT) según el Artículo 47 del CTB:\n1. Tributo Omitido expresado en Unidades de Fomento de Vivienda (UFV).\n2. Intereses moratorios calculados con la tasa activa oficial.\n3. Multa por incumplimiento a deberes formales (IDF).\n4. Sanción por omisión de pago o defraudación tributaria.",
        "opciones": [
            ("A", "1, 2 y 3 son correctas", False),
            ("B", "1 y 3 son correctas", False),
            ("C", "2 y 4 son correctas", False),
            ("D", "Solo 4 es correcta", False),
            ("E", "Todas son correctas", True)
        ]
    },
    {
        "id": 38,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
        "dificultad": "Medio",
        "enunciado": "Tratamiento de las mermas y desmedros en la auditoría de inventarios para el IUE:\n1. Las mermas normales no requieren informe técnico de perito independiente.\n2. Los desmedros deben ser comunicados al SIN con 10 días de anticipación a su destrucción.\n3. Las pérdidas extraordinarias por caso fortuito son deducibles si existe denuncia policial.\n4. La destrucción de mercaderías requiere presencia obligatoria de Notario de Fe Pública.",
        "opciones": [
            ("A", "1, 2 y 3 son correctas", False),
            ("B", "1 y 3 son correctas", False),
            ("C", "2 y 4 son correctas", True),
            ("D", "Solo 4 es correcta", False),
            ("E", "Todas son correctas", False)
        ]
    },
    {
        "id": 39,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
        "dificultad": "Medio",
        "enunciado": "Requisitos para la deducibilidad de intereses por deudas financieras contraídas en el exterior:\n1. Que la deuda esté vinculada directamente a la obtención de rentas gravadas.\n2. Que la tasa de interés no supere la tasa LIBOR/SOFR más 3 puntos porcentuales.\n3. Que se efectúe la retención del IUE-BE por remesas al exterior.\n4. Que el acreedor sea una empresa filial del mismo grupo económico sin contrato.",
        "opciones": [
            ("A", "1, 2 y 3 son correctas", True),
            ("B", "1 y 3 son correctas", False),
            ("C", "2 y 4 son correctas", False),
            ("D", "Solo 4 es correcta", False),
            ("E", "Todas son correctas", False)
        ]
    },
    {
        "id": 40,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
        "dificultad": "Medio",
        "enunciado": "Son documentos soporte indispensables en el legajo de auditoría tributaria permanente:\n1. Testimonio de constitución social y poderes de representación legal.\n2. Número de Identificación Tributaria (NIT) y certificados de inscripción.\n3. Estados Financieros auditados y dictámenes tributarios de gestiones anteriores.\n4. Resoluciones Administrativas de exención o autorización de sistemas computarizados.",
        "opciones": [
            ("A", "1, 2 y 3 son correctas", False),
            ("B", "1 y 3 son correctas", False),
            ("C", "2 y 4 son correctas", False),
            ("D", "Solo 4 es correcta", False),
            ("E", "Todas son correctas", True)
        ]
    },
    {
        "id": 41,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
        "dificultad": "Medio",
        "enunciado": "La alícuota por remesas de utilidades a beneficiarios del exterior por servicios prestados desde el extranjero es del:",
        "opciones": [
            ("A", "25% sobre el 50% presunto (Tasa efectiva 12.5%)", True),
            ("B", "13% sobre el total remesado", False),
            ("C", "3% por concepto de retención IT", False),
            ("D", "25% sobre el 10% presunto (Tasa efectiva 2.5%)", False),
            ("E", "Exención total por tratados de doble tributación", False)
        ]
    },
    {
        "id": 42,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
        "dificultad": "Medio",
        "enunciado": "En auditoría fiscal, las previsiones para incobrables no admitidas por el D.S. 24051 generan:",
        "opciones": [
            ("A", "Un activo por impuesto diferido", True),
            ("B", "Un pasivo por impuesto diferido", False),
            ("C", "La nulidad de los estados financieros", False),
            ("D", "Un crédito fiscal trasladable al IT", False),
            ("E", "Una contingencia penal tributaria", False)
        ]
    },
    {
        "id": 43,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
        "dificultad": "Medio",
        "enunciado": "El recurso de alzada ante la Autoridad Regional de Impugnación Tributaria (ARIT) debe interponerse en el plazo perentorio de:",
        "opciones": [
            ("A", "20 días improrrogables computables a partir de la notificación legal", True),
            ("B", "15 días hábiles administrativos", False),
            ("C", "30 días calendario continuos", False),
            ("D", "45 días hábiles procesales", False),
            ("E", "60 días calendario según Ley 2492", False)
        ]
    },
    {
        "id": 44,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "dificultad": "Medio",
        "enunciado": "Las pérdidas tributarias acumuladas en el IUE pueden compensarse de manera indefinida sin límite temporal en empresas no productivas.",
        "opciones": [("A", "Verdadero", False), ("B", "Falso", True)]
    },
    {
        "id": 45,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "dificultad": "Medio",
        "enunciado": "La rectificatoria de una declaración jurada que incrementa el saldo a favor del contribuyente requiere aprobación previa mediante Resolución Administrativa del SIN.",
        "opciones": [("A", "Verdadero", True), ("B", "Falso", False)]
    }
]

BANCO_DIFICILES_15 = [
    {
        "id": 46,
        "tipo": "SUBITEM_CASO",
        "grupo": "CASO-TRIB1",
        "dificultad": "Difícil",
        "enunciado": "Calcule el reparo impositivo aplicable por IUE no deducible al detectarse facturas sin bancarización por Bs 150.000:",
        "opciones": [
            ("A", "Reparo IUE Bs 37.500 (25%) + Sanción formal 500 UFV", True),
            ("B", "Reparo IUE Bs 19.500 (13%) + Sanción formal 200 UFV", False),
            ("C", "Crédito Fiscal IVA a reintegrar de Bs 19.500 (13%)", False),
            ("D", "No procede reparo si la factura tiene código de autorización vigente", False),
            ("E", "Reparo total acumulado consolidado de Bs 75.000", False)
        ]
    },
    {
        "id": 47,
        "tipo": "SUBITEM_CASO",
        "grupo": "CASO-TRIB1",
        "dificultad": "Difícil",
        "enunciado": "Al no haber bancarizado las compras de Bs 150.000, ¿cuál es el Crédito Fiscal IVA indebidamente apropiado a reintegrar?",
        "opciones": [
            ("A", "Bs 37.500 calculados al 25%", False),
            ("B", "Bs 4.500 correspondiente al IT", False),
            ("C", "Bs 19.500 correspondiente al 13% del valor total facturado", True),
            ("D", "No se reintegra si el proveedor declaró la venta", False),
            ("E", "Bs 150.000 reintegrable en su totalidad", False)
        ]
    },
    {
        "id": 48,
        "tipo": "SUBITEM_CASO",
        "grupo": "CASO-TRIB1",
        "dificultad": "Difícil",
        "enunciado": "Determine la sanción por omisión de pago si la empresa no rectifica voluntariamente antes de la Vista de Cargo:",
        "opciones": [
            ("A", "100% del tributo omitido actualizado en UFV al día del pago", True),
            ("B", "20% del tributo si cancela en etapa preliminar", False),
            ("C", "40% del tributo según el Artículo 156 del CTB", False),
            ("D", "60% del tributo en caso de reincidencia", False),
            ("E", "Sanción fija de 5.000 UFV sin actualización", False)
        ]
    },
    {
        "id": 49,
        "tipo": "SUBITEM_CASO",
        "grupo": "CASO-TRIB1",
        "dificultad": "Difícil",
        "enunciado": "Calcule el interés moratorio generado si transcurrieron 500 días con una tasa de interés del 4% anual sobre el tributo omitido:",
        "opciones": [
            ("A", "Bs 5.200 calculados con interés simple", False),
            ("B", "Interés moratorio compuesto según fórmula oficial del Artículo 47 CTB", True),
            ("C", "Tasa fija mensual del 1.5%", False),
            ("D", "Exención de intereses por caso de fuerza mayor", False),
            ("E", "Interés bancario comercial del 12% anual", False)
        ]
    },
    {
        "id": 50,
        "tipo": "SUBITEM_CASO",
        "grupo": "CASO-TRIB1",
        "dificultad": "Difícil",
        "enunciado": "Determine la Deuda Tributaria consolidada total expresada en Unidades de Fomento de Vivienda (UFV):",
        "opciones": [
            ("A", "DT = Tributo Omitido (UFV) + Intereses (UFV) + Sanción Omisión Pago", True),
            ("B", "DT = Solo Tributo Omitido histórico en moneda nacional", False),
            ("C", "DT = Tributo Omitido x Cotización del Dólar Oficial", False),
            ("D", "DT = Intereses moratorios sin considerar la sanción pecuniaria", False),
            ("E", "DT = Monto de las facturas no bancarizadas de Bs 150.000", False)
        ]
    },
    {
        "id": 51,
        "tipo": "SUBITEM_CASO",
        "grupo": "CASO-TRIB2",
        "dificultad": "Difícil",
        "enunciado": "En una constructora con contrato de Bs 2.000.000 y 60% de avance físico certificado, ¿cuál es el ingreso gravado devengado en el IUE?",
        "opciones": [
            ("A", "Ingreso devengado de Bs 1.200.000 sujeto a facturación y cómputo de IUE", True),
            ("B", "Ingreso total diferido de Bs 2.000.000 al inicio de la obra", False),
            ("C", "Solo los anticipos financieros cobrados en efectivo", False),
            ("D", "Bs 800.000 correspondiente al saldo pendiente de ejecución", False),
            ("E", "Exención total hasta la entrega definitiva de la obra", False)
        ]
    },
    {
        "id": 52,
        "tipo": "SUBITEM_CASO",
        "grupo": "CASO-TRIB2",
        "dificultad": "Difícil",
        "enunciado": "Si los costos reales acumulados fueron de Bs 800.000, determine la Utilidad Bruta Imponible devengada en el ejercicio:",
        "opciones": [
            ("A", "Bs 1.200.000 sin deducir costos directos", False),
            ("B", "Utilidad Bruta Imponible de Bs 400.000 (Bs 1.200.000 - Bs 800.000)", True),
            ("C", "Pérdida tributaria de Bs 800.000", False),
            ("D", "Bs 600.000 aplicando margen presunto de utilidad", False),
            ("E", "Bs 200.000 descontando retenciones de garantía", False)
        ]
    },
    {
        "id": 53,
        "tipo": "SUBITEM_CASO",
        "grupo": "CASO-TRIB2",
        "dificultad": "Difícil",
        "enunciado": "Tratamiento tributario de la retención de garantía del 7% efectuada por el contratante en planillas de avance:",
        "opciones": [
            ("A", "Reduce directamente el Débito Fiscal IVA del mes", False),
            ("B", "Exime del pago del Impuesto a las Transacciones", False),
            ("C", "No reduce la base imponible del IVA ni del IT y se factura sobre el monto total", True),
            ("D", "Se deduce como gasto no deducible en el IUE", False),
            ("E", "Constituye un pago a cuenta del IUE anual", False)
        ]
    },
    {
        "id": 54,
        "tipo": "SUBITEM_CASO",
        "grupo": "CASO-TRIB2",
        "dificultad": "Difícil",
        "enunciado": "Cálculo del Impuesto a las Transacciones (IT) generado sobre la planilla certificada de Bs 1.200.000:",
        "opciones": [
            ("A", "Bs 36.000 (3% sobre el total de la planilla devengada)", True),
            ("B", "Bs 156.000 (13% por concepto de IVA e IT)", False),
            ("C", "Bs 12.000 descontando el anticipo", False),
            ("D", "Bs 300.000 aplicando alícuota del IUE", False),
            ("E", "Exento por tratarse de obra pública estatal", False)
        ]
    },
    {
        "id": 55,
        "tipo": "SUBITEM_CASO",
        "grupo": "CASO-TRIB2",
        "dificultad": "Difícil",
        "enunciado": "Efecto de la provisión por garantías de post-construcción en la liquidación del IUE:",
        "opciones": [
            ("A", "Deducción automática al 100% en el ejercicio de suscripción", False),
            ("B", "Crédito fiscal computable en el periodo siguiente", False),
            ("C", "Exención impositiva reglamentaria", False),
            ("D", "Constituye gasto no deducible hasta que se ejecute el desembolso efectivo", True),
            ("E", "Compensable contra el Impuesto a las Transacciones", False)
        ]
    },
    {
        "id": 56,
        "tipo": "OPCION_EMPAREJAMIENTO",
        "grupo": "EMP-TRIB1",
        "dificultad": "Difícil",
        "enunciado": "Procedimiento de fiscalización directa con libros contables y documentos de respaldo fidedignos.",
        "opciones": [("A", "Determinación sobre Base Presunta", False), ("B", "Crédito Fiscal IVA Trasladable", False), ("C", "Alícuota Adicional IUE Financiero", False), ("D", "Exención Tributaria Subjetiva", False), ("E", "Determinación sobre Base Cierta", True)]
    },
    {
        "id": 57,
        "tipo": "OPCION_EMPAREJAMIENTO",
        "grupo": "EMP-TRIB1",
        "dificultad": "Difícil",
        "enunciado": "Tratamiento fiscal del saldo a favor del contribuyente que se actualiza con la variación de la UFV.",
        "opciones": [("A", "Determinación sobre Base Presunta", False), ("B", "Crédito Fiscal IVA Trasladable", True), ("C", "Alícuota Adicional IUE Financiero", False), ("D", "Exención Tributaria Subjetiva", False), ("E", "Determinación sobre Base Cierta", False)]
    },
    {
        "id": 58,
        "tipo": "OPCION_EMPAREJAMIENTO",
        "grupo": "EMP-TRIB1",
        "dificultad": "Difícil",
        "enunciado": "Método de liquidación tributaria aplicable cuando el contribuyente oculta ventas y no tiene registros contables.",
        "opciones": [("A", "Determinación sobre Base Presunta", True), ("B", "Crédito Fiscal IVA Trasladable", False), ("C", "Alícuota Adicional IUE Financiero", False), ("D", "Exención Tributaria Subjetiva", False), ("E", "Determinación sobre Base Cierta", False)]
    },
    {
        "id": 59,
        "tipo": "OPCION_EMPAREJAMIENTO",
        "grupo": "EMP-TRIB1",
        "dificultad": "Difícil",
        "enunciado": "Beneficio tributario otorgado a fundaciones y asociaciones civiles sin fines de lucro debidamente registradas.",
        "opciones": [("A", "Determinación sobre Base Presunta", False), ("B", "Crédito Fiscal IVA Trasladable", False), ("C", "Alícuota Adicional IUE Financiero", False), ("D", "Exención Tributaria Subjetiva", True), ("E", "Determinación sobre Base Cierta", False)]
    },
    {
        "id": 60,
        "tipo": "OPCION_EMPAREJAMIENTO",
        "grupo": "EMP-TRIB1",
        "dificultad": "Difícil",
        "enunciado": "Sobretasa impositiva del 25% aplicada a entidades de intermediación financiera con rentabilidad superior al 6%.",
        "opciones": [("A", "Determinación sobre Base Presunta", False), ("B", "Crédito Fiscal IVA Trasladable", False), ("C", "Alícuota Adicional IUE Financiero", True), ("D", "Exención Tributaria Subjetiva", False), ("E", "Determinación sobre Base Cierta", False)]
    }
]

# Estudiantes Oficiales
ESTUDIANTES = [
    {"codigo": "7849102", "nombres": "JUAN CARLOS", "apellido1": "PEREZ", "apellido2": "MAMANI"},
    {"codigo": "8392104", "nombres": "MARIA BELEN", "apellido1": "QUISPE", "apellido2": "FLORES"},
    {"codigo": "6928103", "nombres": "RODRIGO ALEJANDRO", "apellido1": "CONDORI", "apellido2": "RODRIGUEZ"},
    {"codigo": "7194820", "nombres": "GABRIELA SOFIA", "apellido1": "LOPEZ", "apellido2": "TORRICO"},
    {"codigo": "7391028", "nombres": "SERGIO ALEJANDRO", "apellido1": "MENDOZA", "apellido2": "TAPIA"},
    {"codigo": "7482910", "nombres": "FERNANDO JAVIER", "apellido1": "VILLARROEL", "apellido2": "CLAROS"},
    {"codigo": "7928104", "nombres": "MARCELO ANDRES", "apellido1": "SUAREZ", "apellido2": "MEDINA"},
    {"codigo": "8102938", "nombres": "PAOLA ANDREA", "apellido1": "MORALES", "apellido2": "VARGAS"},
    {"codigo": "8291047", "nombres": "LAURA BEATRIZ", "apellido1": "ZURITA", "apellido2": "ORTUNO"},
    {"codigo": "8401928", "nombres": "VALERIA NICOLE", "apellido1": "ARISPE", "apellido2": "BUSTAMANTE"},
    {"codigo": "6549812", "nombres": "CARLOS EDUARDO", "apellido1": "ROCHA", "apellido2": "GUZMAN"},
    {"codigo": "6839201", "nombres": "DANIELA ALEJANDRA", "apellido1": "CASTRO", "apellido2": "SOLIZ"}
]

# =============================================================================
# ALGORITMO DE GENERACIÓN DE EXAMEN (30 PREGUNTAS: 7 FÁCILES + 16 MEDIAS + 7 DIFÍCILES)
# =============================================================================
def generar_preguntas_30_variante(seed=100):
    rng = random.Random(seed)
    
    # 1. Seleccionar cuotas exactas
    faciles_sel = rng.sample(BANCO_FACILES_15, 7)
    medias_sel = rng.sample(BANCO_MEDIAS_30, 16)
    dificiles_sel = rng.sample(BANCO_DIFICILES_15, 7)
    
    # Total 30
    preguntas_total = faciles_sel + medias_sel + dificiles_sel
    
    # Agrupar ordenadamente por tipología para conservar coherencia pedagógica
    orden_tipos = [
        "SELECCION_MEJOR_RESPUESTA",
        "VERDADERO_O_FALSO_SIMPLE",
        "RESPUESTA_PREMISAS_ABCD",
        "VERDADERO_O_FALSO_COMPLEJAS",
        "SUBITEM_CASO",
        "OPCION_EMPAREJAMIENTO"
    ]
    
    preguntas_ordenadas = []
    for tipo in orden_tipos:
        grupo = [p for p in preguntas_total if p.get("tipo") == tipo]
        preguntas_ordenadas.extend(grupo)
        
    return preguntas_ordenadas

# =============================================================================
# GENERADOR DE CÓDIGO TYPST CON CARTILLA OMR CONSERVANDO MATRIZ EXACTA
# =============================================================================
def generar_typst_examen_30(estudiante, variante_letra, seed=100, materia_info=None):
    if materia_info is None:
        materia_info = {
            "codigo": "CPEC18",
            "materia": "AUDITORÍA TRIBUTARIA",
            "carrera": "AUDITORÍA / CONTADURÍA",
            "docente": "MAURICIO QUIROZ LAFUENTE",
            "grupo": "TA-01",
            "semestre": 3,
            "hora": "08:15:00 - 09:45:00"
        }

    nombre_completo = f"{estudiante['nombres']} {estudiante['apellido1']} {estudiante['apellido2']}".upper()
    codigo_est = estudiante['codigo']
    
    # 30 preguntas seleccionadas por el algoritmo
    preguntas30 = generar_preguntas_30_variante(seed)
    
    # Grid de 4 columnas de 15 preguntas = 60 casillas en Cartilla OMR (Matriz EXACTA)
    grid_cols = []
    for c in range(4):
        start_q = c * 15 + 1
        end_q = start_q + 15
        table_rows = []
        for num in range(start_q, end_q):
            row_items = f"""        [#text(size: 7.0pt, weight: "bold")[{num}.]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[A]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[B]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[C]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[D]]]],
        [#circle(radius: 3.4pt, stroke: 0.4pt + black)[#align(center + horizon)[#text(size: 5.0pt, weight: "bold")[E]]]]"""
            table_rows.append(row_items)
            
        rows_str = ",\n".join(table_rows)
        grid_cols.append(f"""    [
      #table(
        columns: (22%, 15.6%, 15.6%, 15.6%, 15.6%, 15.6%),
        stroke: none,
        inset: (x: 0pt, y: 2.8pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
{rows_str}
      )
    ]""")
    
    grid_cartilla_str = ",\n".join(grid_cols)

    typ_code = f"""#set page(
  paper: "us-letter",
  margin: (x: 1.5cm, top: 0.85cm, bottom: 0.85cm),
  header: context {{
    let p = counter(page).get().first()
    if p > 1 {{
      grid(
        columns: (1fr, auto),
        align: (left, right),
        [#text(size: 8pt, fill: luma(90))[{nombre_completo} · #text(font: "Courier", weight: "bold")[{codigo_est}]]],
        [#text(size: 8pt, fill: luma(90))[Pág. #p]]
      )
      v(-4pt)
      line(length: 100%, stroke: 0.4pt + luma(150))
    }}
  }},
  footer: none
)

#set text(
  font: "Liberation Sans",
  size: 8.5pt,
  lang: "es"
)

#show par: set block(spacing: 0.45em)

// ========================================================
// PÁGINA 1: CABECERA INSTITUCIONAL + DATOS + CARTILLA OMR HORIZONTAL
// ========================================================

// 1. Encabezado Institucional Oficial
#table(
  columns: (25%, 75%),
  stroke: 0.5pt + black,
  fill: none,
  align: (center + horizon, center + horizon),
  inset: 4pt,
  [
    #image("logo_unitepc_clean.png", width: 80%)
  ],
  [
    #text(weight: "bold", size: 10pt)[UNIVERSIDAD TECNICA PRIVADA COSMOS]\\
    #text(weight: "bold", size: 9pt)[GESTION 2-2026]
    #v(-2pt)
    #line(length: 90%, stroke: 0.5pt + black)
    #v(-2.5pt)
    #text(weight: "bold")[EVALUACION TEORICA 1ER PARCIAL]
  ]
)

#v(-5pt)

// 2. Ficha de Datos del Estudiante
#table(
  columns: (58%, 42%),
  stroke: 0.5pt + black,
  fill: none,
  inset: (x: 5pt, y: 2.2pt),
  [*NOMBRE:* {nombre_completo}],
  [*CARRERA:* {materia_info['carrera']}],
  [*MATERIA:* [{materia_info['codigo']}] {materia_info['materia']}],
  [*GRUPO:* {materia_info['grupo']} #h(10pt) *SEMESTRE:* {materia_info['semestre']}],
  [*DOCENTE:* {materia_info['docente']}],
  [*EXAMEN:* 1er Parcial · VARIANTE {variante_letra}],
  [*FECHA:* 22/08/2026],
  [*HORA:* {materia_info['hora']}],
  [
    *FIRMA DEL ESTUDIANTE:* \\
    #v(10pt)
    #line(length: 100%, stroke: (dash: "dotted", thickness: 0.85pt))
  ],
  [
    *CODIGO:* \\
    #v(-2pt)
    #align(center)[#text(size: 18pt, weight: "bold")[{codigo_est}]]
  ]
)

#v(1.5pt)
#text(size: 9pt)[*INSTRUCCION DE COMPLETADO DE CARTILLA:* Debe rellenar con cuidado la opción que considere correcta en la Cartilla con lapicero de color AZUL o NEGRO.]
#v(1.5pt)

// 3. CARTILLA DE RESPUESTAS (1 A 60) - MATRIZ OMR EXACTA
#rect(width: 100%, stroke: 0.85pt + black, fill: none, inset: (x: 4pt, y: 2.5pt), radius: 2pt)[
  #align(center)[
    #text(weight: "bold", size: 9pt)[CARTILLA DE RESPUESTAS (1 A 60) --- VARIANTE {variante_letra}]
  ]
  #v(-3pt)
  #grid(
    columns: (25%, 25%, 25%, 25%),
    column-gutter: 3pt,
{grid_cartilla_str}
  )
]

#pagebreak()

// ========================================================
// PÁGINA 2 EN ADELANTE: CUESTIONARIO OFICIAL (30 REACTIVOS: 7F + 16M + 7D)
// ========================================================

#align(center)[
  #text(size: 11pt, weight: "bold")[CUESTIONARIO DE PREGUNTAS (30 REACTIVOS)]\\
  #text(size: 9pt, weight: "bold", fill: luma(60))[[{materia_info['codigo']}] {materia_info['materia']} · EVALUACIÓN TEÓRICA 1ER PARCIAL · VARIANTE {variante_letra}]
]

#v(-3pt)
#line(length: 100%, stroke: 0.75pt + black)
#v(3pt)
"""

    current_section = None
    for idx, p in enumerate(preguntas30):
        num = idx + 1
        tipo = p.get("tipo", "")
        
        # Insertar encabezado de sección cuando cambia de tipo
        if tipo == "SELECCION_MEJOR_RESPUESTA" and current_section != "SELECCION_MEJOR_RESPUESTA":
            current_section = "SELECCION_MEJOR_RESPUESTA"
            typ_code += """
#text(weight: "bold", size: 9.5pt)[SELECCIÓN DE LA MEJOR RESPUESTA]\\
#text(size: 8pt, style: "italic")[Instrucciones: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.]
#v(1.5pt)
"""
        elif tipo == "VERDADERO_O_FALSO_SIMPLE" and current_section != "VERDADERO_O_FALSO_SIMPLE":
            current_section = "VERDADERO_O_FALSO_SIMPLE"
            typ_code += """
#v(4pt)
#text(weight: "bold", size: 9.5pt)[FALSO O VERDADERO]\\
#text(size: 8pt, style: "italic")[Instrucciones: Determine si cada afirmación es verdadera (A) o falsa (B).]
#v(1.5pt)
"""
        elif tipo == "RESPUESTA_PREMISAS_ABCD" and current_section != "RESPUESTA_PREMISAS_ABCD":
            current_section = "RESPUESTA_PREMISAS_ABCD"
            typ_code += """
#v(4pt)
#text(weight: "bold", size: 9.5pt)[PREMISAS A / B / AMBAS / NINGUNA]\\
#text(size: 8pt, style: "italic")[Instrucciones: Analice las dos premisas planteadas y elija la opción correcta.]
#v(1.5pt)
"""
        elif tipo == "VERDADERO_O_FALSO_COMPLEJAS" and current_section != "VERDADERO_O_FALSO_COMPLEJAS":
            current_section = "VERDADERO_O_FALSO_COMPLEJAS"
            typ_code += """
#v(4pt)
#text(weight: "bold", size: 9.5pt)[PREGUNTAS CON CLAVE DE RESPUESTA]\\
#text(size: 8pt, style: "italic")[Instrucciones: Marque: A si 1, 2 y 3 son correctas; B si 1 y 3; C si 2 y 4; D si solo 4; E si todas son correctas.]
#v(1.5pt)
"""
        elif tipo == "SUBITEM_CASO" and current_section != "SUBITEM_CASO":
            current_section = "SUBITEM_CASO"
            typ_code += """
#v(4pt)
#text(weight: "bold", size: 9.5pt)[CASOS PRÁCTICOS Y PROBLEMAS APLICADOS]\\
#rect(width: 100%, stroke: 0.5pt + luma(100), fill: rgb("#f8fafc"), inset: 3.5pt)[
  #text(size: 8.5pt)[*CASO PRÁCTICO (Auditoría Tributaria / Casos Técnicos):* En la fiscalización a 'Comercial Andina S.R.L.', se detectaron compras no bancarizadas por Bs 150.000 y retenciones de servicios no declaradas.]
]
#v(1.5pt)
"""
        elif tipo == "OPCION_EMPAREJAMIENTO" and current_section != "OPCION_EMPAREJAMIENTO":
            current_section = "OPCION_EMPAREJAMIENTO"
            typ_code += """
#v(4pt)
#text(weight: "bold", size: 9.5pt)[EMPAREJAMIENTO DE CONCEPTOS]\\
#rect(width: 100%, stroke: 0.5pt + luma(100), fill: rgb("#f8fafc"), inset: 3.5pt)[
  #text(size: 8pt)[*OPCIONES DE REFERENCIA:*\\
  *A)* Determinación sobre Base Presunta #h(0.3cm) *B)* Crédito Fiscal IVA Trasladable #h(0.3cm) *C)* Alícuota Adicional IUE Financiero\\
  *D)* Exención Tributaria Subjetiva #h(0.3cm) *E)* Determinación sobre Base Cierta]
  #v(1pt)
  #text(size: 7.5pt, style: "italic")[Relacione cada uno de los siguientes enunciados con la opción correspondiente:]
]
#v(1.5pt)
"""

        enun_fmt = p['enunciado'].replace('\n', '\\\n')
        typ_code += f"""
#block(spacing: 3.5pt)[
  *{num}.* {enun_fmt}
"""
        for op in p['opciones']:
            typ_code += f"  #h(10pt) *{op[0]})* {op[1]}\\\n"
        typ_code += "]\n"

    return typ_code

def main():
    bases_dir = r"C:\laragon\www\evaluaciones\bases"
    assets_dir = r"C:\laragon\www\evaluaciones\evaluaciones-frontend\src\assets\examenes"
    dist_dir = r"C:\laragon\www\evaluaciones\evaluaciones-frontend\dist\sea-evaluaciones-ui\browser\assets\examenes"
    public_dir = r"C:\laragon\www\evaluaciones\evaluaciones-frontend\public\assets\examenes"

    for d in [bases_dir, assets_dir, dist_dir, public_dir]:
        os.makedirs(d, exist_ok=True)

    print("--- COMPILANDO EXÁMENES OFICIALES (30 REACTIVOS: 7F + 16M + 7D) CON MATRIZ OMR EXACTA ---")

    materias = [
        {
            "codigo": "CPEC18",
            "cod_clean": "CPEC18",
            "materia": "AUDITORÍA TRIBUTARIA",
            "carrera": "AUDITORÍA / CONTADURÍA",
            "docente": "MAURICIO QUIROZ LAFUENTE",
            "grupo": "TA-01",
            "semestre": 3,
            "hora": "08:15:00 - 09:45:00"
        },
        {
            "codigo": "SIS-125",
            "cod_clean": "SIS125",
            "materia": "INGLÉS TÉCNICO II",
            "carrera": "INGENIERÍA DE SISTEMAS",
            "docente": "LIC. PATRICIA VARGAS",
            "grupo": "TA-01",
            "semestre": 2,
            "hora": "10:00:00 - 11:30:00"
        },
        {
            "codigo": "SIS-211",
            "cod_clean": "SIS211",
            "materia": "INGLÉS TÉCNICO II",
            "carrera": "INGENIERÍA DE SISTEMAS",
            "docente": "LIC. PATRICIA VARGAS",
            "grupo": "TA-01",
            "semestre": 2,
            "hora": "10:00:00 - 11:30:00"
        },
        {
            "codigo": "SIS-413",
            "cod_clean": "SIS413",
            "materia": "TELECOMUNICACIONES",
            "carrera": "INGENIERÍA DE SISTEMAS",
            "docente": "ING. JORGE CLAROS",
            "grupo": "TA-01",
            "semestre": 4,
            "hora": "11:45:00 - 13:15:00"
        }
    ]

    for mat in materias:
        cod = mat["cod_clean"]
        print(f"\n>> Procesando Asignatura [{mat['codigo']}] {mat['materia']}...")
        
        # 1. Variantes A, B, C
        variantes = [("VarA", "A", 100), ("VarB", "B", 153), ("VarC", "C", 206)]
        for var_slug, letra, seed in variantes:
            est_default = ESTUDIANTES[0]
            typ_text = generar_typst_examen_30(est_default, letra, seed, mat)
            
            typ_file = os.path.join(bases_dir, f"{cod}_Cochabamba_TA-01_1erParcial_{var_slug}_20260822_Examen.typ")
            pdf_file = os.path.join(bases_dir, f"{cod}_Cochabamba_TA-01_1erParcial_{var_slug}_20260822_Examen.pdf")
            
            with open(typ_file, "w", encoding="utf-8") as f:
                f.write(typ_text)
            
            typst.compile(typ_file, output=pdf_file)
            
            for dest in [assets_dir, dist_dir, public_dir]:
                if os.path.exists(dest):
                    shutil.copy2(pdf_file, os.path.join(dest, os.path.basename(pdf_file)))
            print(f"  [OK PDF] {os.path.basename(pdf_file)}")

        # 2. Master Consolidado
        master_typ = os.path.join(bases_dir, f"{cod}_Cochabamba_TA-01_1erParcial_20260822_Examen.typ")
        master_pdf = os.path.join(bases_dir, f"{cod}_Cochabamba_TA-01_1erParcial_20260822_Examen.pdf")
        with open(master_typ, "w", encoding="utf-8") as f:
            f.write(generar_typst_examen_30(ESTUDIANTES[0], "A", 100, mat))
        typst.compile(master_typ, output=master_pdf)
        for dest in [assets_dir, dist_dir, public_dir]:
            if os.path.exists(dest):
                shutil.copy2(master_pdf, os.path.join(dest, os.path.basename(master_pdf)))

        # 3. Cuadernillos de los 3 Estudiantes
        for i in range(3):
            est = ESTUDIANTES[i]
            letra_var = ["A", "B", "C"][i % 3]
            nom_slug = f"{est['nombres']}_{est['apellido1']}_{est['apellido2']}".upper().replace(" ", "_")
            for char, repl in [("É", "E"), ("Í", "I"), ("Ó", "O"), ("Á", "A"), ("Ú", "U"), ("Ñ", "N")]:
                nom_slug = nom_slug.replace(char, repl)
            
            est_typ = os.path.join(bases_dir, f"{cod}_{est['codigo']}_{nom_slug}_Examen.typ")
            est_pdf = os.path.join(bases_dir, f"{cod}_{est['codigo']}_{nom_slug}_Examen.pdf")
            
            with open(est_typ, "w", encoding="utf-8") as f:
                f.write(generar_typst_examen_30(est, letra_var, (i + 1) * 73, mat))
            
            typst.compile(est_typ, output=est_pdf)
            for dest in [assets_dir, dist_dir, public_dir]:
                if os.path.exists(dest):
                    shutil.copy2(est_pdf, os.path.join(dest, os.path.basename(est_pdf)))
            print(f"  [OK EST] {est['codigo']} ({letra_var}) -> {os.path.basename(est_pdf)}")

    print("\n¡TODOS LOS EXÁMENES COMPILADOS EXITOSAMENTE PARA TODAS LAS MATERIAS!")

if __name__ == "__main__":
    main()
