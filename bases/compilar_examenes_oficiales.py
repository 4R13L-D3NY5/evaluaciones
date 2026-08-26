import os
import shutil
import typst

# Lista de 60 preguntas oficiales con las 6 tipologías completas para [CPEC18] AUDITORÍA TRIBUTARIA
PREGUNTAS_BASE_60 = [
    # 1. SELECCIÓN DE LA MEJOR RESPUESTA (1..15)
    {
        "id": 1,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
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
        "id": 6,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
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
        "id": 7,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
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
        "id": 8,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
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
        "id": 9,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
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
        "id": 10,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
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
        "id": 11,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
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
        "id": 12,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
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
        "id": 13,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
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
        "id": 14,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
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
        "id": 15,
        "tipo": "SELECCION_MEJOR_RESPUESTA",
        "enunciado": "El recurso de alzada ante la Autoridad Regional de Impugnación Tributaria (ARIT) debe interponerse en el plazo perentorio de:",
        "opciones": [
            ("A", "20 días improrrogables computables a partir de la notificación legal", True),
            ("B", "15 días hábiles administrativos", False),
            ("C", "30 días calendario continuos", False),
            ("D", "45 días hábiles procesales", False),
            ("E", "60 días calendario según Ley 2492", False)
        ]
    },

    # 2. FALSO O VERDADERO SIMPLE (16..25)
    {
        "id": 16,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "enunciado": "El principio de devengado tributario reconoce ingresos y gastos cuando se generan legalmente, con independencia del cobro o pago.",
        "opciones": [("A", "Verdadero", True), ("B", "Falso", False)]
    },
    {
        "id": 17,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "enunciado": "Las donaciones a instituciones no lucrativas autorizadas son deducibles del IUE hasta el límite del 10% de la utilidad imponible.",
        "opciones": [("A", "Verdadero", True), ("B", "Falso", False)]
    },
    {
        "id": 18,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "enunciado": "Las multas pagadas por contravenciones tributarias al SIN son consideradas gastos deducibles en la liquidación del IUE.",
        "opciones": [("A", "Verdadero", False), ("B", "Falso", True)]
    },
    {
        "id": 19,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "enunciado": "El débito fiscal IVA se genera en la venta de bienes muebles en el momento de la entrega del bien o emisión de factura, lo que ocurra primero.",
        "opciones": [("A", "Verdadero", True), ("B", "Falso", False)]
    },
    {
        "id": 20,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "enunciado": "Los contribuyentes del Régimen Tributario Simplificado (RTS) están obligados a emitir facturas oficiales y llevar libros de compras.",
        "opciones": [("A", "Verdadero", False), ("B", "Falso", True)]
    },
    {
        "id": 21,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "enunciado": "La depreciación de inmuebles bajo el método de línea recta tiene un coeficiente anual del 2.5% según el D.S. 24051.",
        "opciones": [("A", "Verdadero", True), ("B", "Falso", False)]
    },
    {
        "id": 22,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "enunciado": "El Impuesto a las Grandes Fortunas (IGF) aplica a personas naturales con patrimonio superior a Bs 30 millones en territorio nacional y extranjero.",
        "opciones": [("A", "Verdadero", True), ("B", "Falso", False)]
    },
    {
        "id": 23,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "enunciado": "Las pérdidas tributarias acumuladas en el IUE pueden compensarse de manera indefinida sin límite temporal en empresas no productivas.",
        "opciones": [("A", "Verdadero", False), ("B", "Falso", True)]
    },
    {
        "id": 24,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "enunciado": "La rectificatoria de una declaración jurada que incrementa el saldo a favor del contribuyente requiere aprobación previa mediante Resolución Administrativa del SIN.",
        "opciones": [("A", "Verdadero", True), ("B", "Falso", False)]
    },
    {
        "id": 25,
        "tipo": "VERDADERO_O_FALSO_SIMPLE",
        "enunciado": "El crédito fiscal generado en compras de combustible (gasolina y diésel) es computable al 100% del valor total de la factura.",
        "opciones": [("A", "Verdadero", False), ("B", "Falso", True)]
    },

    # 3. PREMISAS A / B / AMBAS / NINGUNA (26..35)
    {
        "id": 26,
        "tipo": "RESPUESTA_PREMISAS_ABCD",
        "enunciado": "I. El crédito fiscal IVA respaldado por compras vinculadas a la actividad gravada es computable.\nII. Las retenciones tributarias no liberan al sujeto pasivo de su obligación formal.",
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
        "enunciado": "I. Los profesionales independientes liquidan el IUE mediante el Formulario 510 aplicando la alícuota del 25% sobre el 50% presunto.\nII. El IT pagado por profesionales independientes es acreditable al 100% contra el IVA débito.",
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
        "enunciado": "I. Los gastos de representación con respaldo de factura son 100% deducibles en el IUE sin ningún tope reglamentario.\nII. Los sueldos pagados a socios que no trabajan efectivamente en la empresa son deducibles.",
        "opciones": [
            ("A", "Si la primera premisa es verdadera", False),
            ("B", "Si la segunda premisa es verdadera", False),
            ("C", "Si ambas premisas son verdaderas", False),
            ("D", "Si ninguna de las premisas es verdadera", True)
        ]
    },
    {
        "id": 29,
        "tipo": "RESPUESTA_PREMISAS_ABCD",
        "enunciado": "I. La prescripción tributaria se interrumpe con la notificación de la Resolución Determinativa.\nII. El pago parcial de la deuda tributaria suspende el cómputo de la prescripción.",
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
        "enunciado": "I. Las exportaciones definitivas de bienes están gravadas con tasa cero en el IVA.\nII. Los exportadores pueden solicitar la devolución del crédito fiscal mediante CEDEIMs.",
        "opciones": [
            ("A", "Si la primera premisa es verdadera", False),
            ("B", "Si la segunda premisa es verdadera", False),
            ("C", "Si ambas premisas son verdaderas", True),
            ("D", "Si ninguna de las premisas es verdadera", False)
        ]
    },
    {
        "id": 31,
        "tipo": "RESPUESTA_PREMISAS_ABCD",
        "enunciado": "I. Las compras de servicios a personas naturales no inscritas generan retención del 12.5% por IUE y 3% por IT.\nII. Las retenciones por compra de bienes son del 5% por IUE y 3% por IT.",
        "opciones": [
            ("A", "Si la primera premisa es verdadera", False),
            ("B", "Si la segunda premisa es verdadera", False),
            ("C", "Si ambas premisas son verdaderas", True),
            ("D", "Si ninguna de las premisas es verdadera", False)
        ]
    },
    {
        "id": 32,
        "tipo": "RESPUESTA_PREMISAS_ABCD",
        "enunciado": "I. El valor residual de los activos fijos totalmente depreciados se mantiene contablemente en Bs 1.\nII. La revalorización técnica de activos fijos genera crédito fiscal IVA automático.",
        "opciones": [
            ("A", "Si la primera premisa es verdadera", True),
            ("B", "Si la segunda premisa es verdadera", False),
            ("C", "Si ambas premisas son verdaderas", False),
            ("D", "Si ninguna de las premisas es verdadera", False)
        ]
    },
    {
        "id": 33,
        "tipo": "RESPUESTA_PREMISAS_ABCD",
        "enunciado": "I. Las notas fiscales emitidas por el Sistema Electrónico no requieren impresión física para su validez.\nII. El código QR impreso en facturas contiene información fiscal validada por el SIN.",
        "opciones": [
            ("A", "Si la primera premisa es verdadera", False),
            ("B", "Si la segunda premisa es verdadera", False),
            ("C", "Si ambas premisas son verdaderas", True),
            ("D", "Si ninguna de las premisas es verdadera", False)
        ]
    },
    {
        "id": 34,
        "tipo": "RESPUESTA_PREMISAS_ABCD",
        "enunciado": "I. La Vista de Cargo fija la liquidación previa de la deuda tributaria y abre el período probatorio.\nII. La Resolución Determinativa es el acto definitivo que pone fin al procedimiento de fiscalización.",
        "opciones": [
            ("A", "Si la primera premisa es verdadera", False),
            ("B", "Si la segunda premisa es verdadera", False),
            ("C", "Si ambas premisas son verdaderas", True),
            ("D", "Si ninguna de las premisas es verdadera", False)
        ]
    },
    {
        "id": 35,
        "tipo": "RESPUESTA_PREMISAS_ABCD",
        "enunciado": "I. La alícuota del ICE es idéntica para bebidas alcohólicas y vehículos automotores.\nII. El ICE pagado en importaciones es computable como crédito fiscal IVA.",
        "opciones": [
            ("A", "Si la primera premisa es verdadera", False),
            ("B", "Si la segunda premisa es verdadera", False),
            ("C", "Si ambas premisas son verdaderas", False),
            ("D", "Si ninguna de las premisas es verdadera", True)
        ]
    },

    # 4. PREGUNTAS CON CLAVE DE RESPUESTA / F-V COMPLEJAS (36..45)
    {
        "id": 36,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
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
        "id": 37,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
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
        "id": 38,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
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
        "id": 39,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
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
        "id": 40,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
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
        "id": 41,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
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
        "id": 42,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
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
        "id": 43,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
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
        "id": 44,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
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
        "id": 45,
        "tipo": "VERDADERO_O_FALSO_COMPLEJAS",
        "enunciado": "Son documentos soporte indispensables en el legajo de auditoría tributaria permanente:\n1. Testimonio de constitución social y poderes de representación legal.\n2. Número de Identificación Tributaria (NIT) y certificados de inscripción.\n3. Estados Financieros auditados y dictámenes tributarios de gestiones anteriores.\n4. Resoluciones Administrativas de exención o autorización de sistemas computarizados.",
        "opciones": [
            ("A", "1, 2 y 3 son correctas", False),
            ("B", "1 y 3 son correctas", False),
            ("C", "2 y 4 son correctas", False),
            ("D", "Solo 4 es correcta", False),
            ("E", "Todas son correctas", True)
        ]
    },

    # 5. CASOS PRÁCTICOS Y PROBLEMAS FINANCIEROS (46..55)
    # CASO 1: COMERCIAL ANDINA S.R.L. (46..50)
    {
        "id": 46,
        "tipo": "SUBITEM_CASO",
        "grupo": "CASO-TRIB1",
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
        "enunciado": "Determine la Deuda Tributaria consolidada total expresada en Unidades de Fomento de Vivienda (UFV):",
        "opciones": [
            ("A", "DT = Tributo Omitido (UFV) + Intereses (UFV) + Sanción Omisión Pago", True),
            ("B", "DT = Solo Tributo Omitido histórico en moneda nacional", False),
            ("C", "DT = Tributo Omitido x Cotización del Dólar Oficial", False),
            ("D", "DT = Intereses moratorios sin considerar la sanción pecuniaria", False),
            ("E", "DT = Monto de las facturas no bancarizadas de Bs 150.000", False)
        ]
    },

    # CASO 2: CONSTRUCTORA DEL VALLE S.A. (51..55)
    {
        "id": 51,
        "tipo": "SUBITEM_CASO",
        "grupo": "CASO-TRIB2",
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
        "enunciado": "Efecto de la provisión por garantías de post-construcción en la liquidación del IUE:",
        "opciones": [
            ("A", "Deducción automática al 100% en el ejercicio de suscripción", False),
            ("B", "Crédito fiscal computable en el periodo siguiente", False),
            ("C", "Exención impositiva reglamentaria", False),
            ("D", "Constituye gasto no deducible hasta que se ejecute el desembolso efectivo", True),
            ("E", "Compensable contra el Impuesto a las Transacciones", False)
        ]
    },

    # 6. EMPAREJAMIENTO DE CONCEPTOS (56..60)
    {
        "id": 56,
        "tipo": "OPCION_EMPAREJAMIENTO",
        "grupo": "EMP-TRIB1",
        "enunciado": "Procedimiento de fiscalización directa con libros contables y documentos de respaldo fidedignos.",
        "opciones": [("A", "Determinación sobre Base Presunta", False), ("B", "Crédito Fiscal IVA Trasladable", False), ("C", "Alícuota Adicional IUE Financiero", False), ("D", "Exención Tributaria Subjetiva", False), ("E", "Determinación sobre Base Cierta", True)]
    },
    {
        "id": 57,
        "tipo": "OPCION_EMPAREJAMIENTO",
        "grupo": "EMP-TRIB1",
        "enunciado": "Tratamiento fiscal del saldo a favor del contribuyente que se actualiza con la variación de la UFV.",
        "opciones": [("A", "Determinación sobre Base Presunta", False), ("B", "Crédito Fiscal IVA Trasladable", True), ("C", "Alícuota Adicional IUE Financiero", False), ("D", "Exención Tributaria Subjetiva", False), ("E", "Determinación sobre Base Cierta", False)]
    },
    {
        "id": 58,
        "tipo": "OPCION_EMPAREJAMIENTO",
        "grupo": "EMP-TRIB1",
        "enunciado": "Método de liquidación tributaria aplicable cuando el contribuyente oculta ventas y no tiene registros contables.",
        "opciones": [("A", "Determinación sobre Base Presunta", True), ("B", "Crédito Fiscal IVA Trasladable", False), ("C", "Alícuota Adicional IUE Financiero", False), ("D", "Exención Tributaria Subjetiva", False), ("E", "Determinación sobre Base Cierta", False)]
    },
    {
        "id": 59,
        "tipo": "OPCION_EMPAREJAMIENTO",
        "grupo": "EMP-TRIB1",
        "enunciado": "Beneficio tributario otorgado a fundaciones y asociaciones civiles sin fines de lucro debidamente registradas.",
        "opciones": [("A", "Determinación sobre Base Presunta", False), ("B", "Crédito Fiscal IVA Trasladable", False), ("C", "Alícuota Adicional IUE Financiero", False), ("D", "Exención Tributaria Subjetiva", True), ("E", "Determinación sobre Base Cierta", False)]
    },
    {
        "id": 60,
        "tipo": "OPCION_EMPAREJAMIENTO",
        "grupo": "EMP-TRIB1",
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

def generar_typst_examen(estudiante, variante_letra, seed=100):
    nombre_completo = f"{estudiante['nombres']} {estudiante['apellido1']} {estudiante['apellido2']}".upper()
    codigo_est = estudiante['codigo']
    
    # 60 preguntas ordenadas
    preguntas = PREGUNTAS_BASE_60
    
    typ_content = f'''#set page(
  paper: "us-letter",
  margin: (top: 1.2cm, bottom: 1.2cm, left: 1.2cm, right: 1.2cm),
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
#set text(font: "Times New Roman", size: 10pt, lang: "es")
#set par(leading: 0.55em, justify: true)

// ========================================================
// PÁGINA 1: CABECERA OFICIAL + TABLA ESTUDIANTE + CARTILLA OMR HORIZONTAL (1 A 60)
// ========================================================

// 1. Cabecera Oficial UNITEPC
#table(
  columns: (22%, 78%),
  stroke: 0.75pt + black,
  inset: 4pt,
  align: (center + horizon, center + horizon),
  [
    #image("logo_unitepc_clean.png", width: 85%)
  ],
  [
    #text(weight: "bold", size: 10.5pt)[UNIVERSIDAD TÉCNICA PRIVADA COSMOS]\\
    #text(weight: "bold", size: 9pt)[GESTIÓN 2-2026]\\
    #v(-3pt)
    #line(length: 100%, stroke: 0.5pt + black)
    #v(-2pt)
    #text(weight: "bold", size: 9.5pt)[EVALUACIÓN TEÓRICA 1ER PARCIAL]
  ]
)

#v(-3pt)

// 2. Ficha de Datos del Estudiante
#table(
  columns: (60%, 40%),
  stroke: 0.5pt + black,
  inset: (x: 4pt, y: 3pt),
  [*NOMBRE:* {nombre_completo}],
  [*CARRERA:* AUDITORÍA / CONTADURÍA],
  [*MATERIA:* [CPEC18] AUDITORÍA TRIBUTARIA],
  [*GRUPO:* TA-01 #h(1cm) *SEMESTRE:* 3],
  [*DOCENTE:* MAURICIO QUIROZ LAFUENTE],
  [*EXAMEN:* 1er Parcial · VARIANTE {variante_letra}],
  [*FECHA:* 22/08/2026],
  [*HORA:* 08:15:00 - 09:45:00],
  [
    #grid(
      columns: (auto, 1fr),
      column-gutter: 4pt,
      align: (bottom + left, bottom),
      [*FIRMA DEL ESTUDIANTE:*],
      [#box(width: 1fr, baseline: 3.5pt, line(length: 100%, stroke: (dash: "dotted", thickness: 0.75pt)))]
    )
  ],
  [
    #align(center)[
      #text(size: 8pt)[*CÓDIGO:*]\\
      #v(-2pt)
      #text(size: 13pt, font: "Courier", weight: "bold")[{codigo_est}]
    ]
  ]
)

#v(2pt)
#text(size: 8.5pt)[*INSTRUCCIÓN DE COMPLETADO DE CARTILLA:* Rellene con cuidado la opción correcta con bolígrafo AZUL o NEGRO. Ejemplos: [• Correcto] [X Incorrecto] [- Incorrecto] [O Incorrecto]]
#v(2pt)

// 3. CARTILLA HORIZONTAL DE RESPUESTAS (1 A 60) - 4 COLUMNAS DE 15 FILAS
#rect(width: 100%, stroke: 0.85pt + black, fill: rgb("#fafafa"), inset: (x: 5pt, y: 4pt), radius: 2pt)[
  // Marcadores de timing negros en las 4 esquinas
  #place(top + left, dx: -2pt, dy: -2pt)[#rect(width: 8pt, height: 8pt, fill: black)]
  #place(top + right, dx: 2pt, dy: -2pt)[#rect(width: 8pt, height: 8pt, fill: black)]
  #place(bottom + left, dx: -2pt, dy: 2pt)[#rect(width: 8pt, height: 8pt, fill: black)]
  #place(bottom + right, dx: 2pt, dy: 2pt)[#rect(width: 8pt, height: 8pt, fill: black)]

  #align(center)[
    #text(weight: "bold", size: 9pt)[CARTILLA DE RESPUESTAS (1 A 60) --- VARIANTE {variante_letra}]
  ]
  #v(-2pt)
  #grid(
    columns: (25%, 25%, 25%, 25%),
    column-gutter: 6pt,
    [
      #table(
        columns: (18%, 16.4%, 16.4%, 16.4%, 16.4%, 16.4%),
        stroke: none,
        inset: (x: 0.2pt, y: 2.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        ..range(1, 16).map(n => (
          [#text(size: 7.5pt, weight: "bold")[#n.]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        )).flatten()
      )
    ],
    [
      #table(
        columns: (18%, 16.4%, 16.4%, 16.4%, 16.4%, 16.4%),
        stroke: none,
        inset: (x: 0.2pt, y: 2.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        ..range(16, 31).map(n => (
          [#text(size: 7.5pt, weight: "bold")[#n.]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        )).flatten()
      )
    ],
    [
      #table(
        columns: (18%, 16.4%, 16.4%, 16.4%, 16.4%, 16.4%),
        stroke: none,
        inset: (x: 0.2pt, y: 2.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        ..range(31, 46).map(n => (
          [#text(size: 7.5pt, weight: "bold")[#n.]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        )).flatten()
      )
    ],
    [
      #table(
        columns: (18%, 16.4%, 16.4%, 16.4%, 16.4%, 16.4%),
        stroke: none,
        inset: (x: 0.2pt, y: 2.2pt),
        align: (center + horizon, center + horizon, center + horizon, center + horizon, center + horizon, center + horizon),
        ..range(46, 61).map(n => (
          [#text(size: 7.5pt, weight: "bold")[#n.]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[A]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[B]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[C]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[D]]]],
          [#circle(radius: 3.8pt, stroke: 0.45pt + black)[#align(center + horizon)[#text(size: 5.5pt, weight: "bold")[E]]]],
        )).flatten()
      )
    ]
  )
]

#pagebreak()

// ========================================================
// PÁGINA 2 EN ADELANTE: CUESTIONARIO OFICIAL DE PREGUNTAS (60 REACTIVOS)
// ========================================================

#align(center)[
  #text(size: 11pt, weight: "bold")[CUESTIONARIO DE PREGUNTAS (60 REACTIVOS)]\\
  #text(size: 9pt, weight: "bold", fill: luma(60))[[CPEC18] AUDITORÍA TRIBUTARIA · EVALUACIÓN TEÓRICA 1ER PARCIAL · VARIANTE {variante_letra}]
]

#v(-3pt)
#line(length: 100%, stroke: 0.75pt + black)
#v(3pt)
'''

    # Secciones y Preguntas
    for idx, p in enumerate(preguntas):
        num = idx + 1
        
        # Cabeceras de Sección
        if num == 1:
            typ_content += '''
#text(weight: "bold", size: 10pt)[SELECCIÓN DE LA MEJOR RESPUESTA (Preguntas 1 a 15)]\\
#text(size: 8.5pt, style: "italic")[*Instrucciones:* Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.]
#v(2pt)
'''
        elif num == 16:
            typ_content += '''
#v(6pt)
#text(weight: "bold", size: 10pt)[FALSO O VERDADERO (Preguntas 16 a 25)]\\
#text(size: 8.5pt, style: "italic")[*Instrucciones:* Determine si cada afirmación es verdadera (A) o falsa (B).]
#v(2pt)
'''
        elif num == 26:
            typ_content += '''
#v(6pt)
#text(weight: "bold", size: 10pt)[PREMISAS A / B / AMBAS / NINGUNA (Preguntas 26 a 35)]\\
#text(size: 8.5pt, style: "italic")[*Instrucciones:* Analice las dos premisas planteadas y elija la opción correcta.]
#v(2pt)
'''
        elif num == 36:
            typ_content += '''
#v(6pt)
#text(weight: "bold", size: 10pt)[PREGUNTAS CON CLAVE DE RESPUESTA (Preguntas 36 a 45)]\\
#text(size: 8.5pt, style: "italic")[*Instrucciones:* Marque: A si 1, 2 y 3 son correctas; B si 1 y 3; C si 2 y 4; D si solo 4; E si todas son correctas.]
#v(2pt)
'''
        elif num == 46:
            typ_content += '''
#v(6pt)
#text(weight: "bold", size: 10pt)[CASOS PRÁCTICOS Y PROBLEMAS APLICADOS (Preguntas 46 a 55)]\\
#rect(width: 100%, stroke: 0.5pt + luma(100), fill: rgb("#f8fafc"), inset: 4pt)[
  #text(size: 9pt)[*CASO PRÁCTICO N° 1 (Comercial Andina S.R.L.):* En la fiscalización integral se detectaron compras no bancarizadas por Bs 150.000 y retenciones de servicios no declaradas.]
]
#v(2pt)
'''
        elif num == 51:
            typ_content += '''
#v(6pt)
#rect(width: 100%, stroke: 0.5pt + luma(100), fill: rgb("#f8fafc"), inset: 4pt)[
  #text(size: 9pt)[*CASO PRÁCTICO N° 2 (Constructora del Valle S.A.):* Contrato de obra pública de Bs 2.000.000 con 60% de avance físico certificado y retención del 7% de garantía.]
]
#v(2pt)
'''
        elif num == 56:
            typ_content += '''
#v(6pt)
#text(weight: "bold", size: 10pt)[EMPAREJAMIENTO DE CONCEPTOS (Preguntas 56 a 60)]\\
#rect(width: 100%, stroke: 0.5pt + luma(100), fill: rgb("#f8fafc"), inset: 4pt)[
  #text(size: 8.5pt)[*OPCIONES DE REFERENCIA:*\\
  *A)* Determinación sobre Base Presunta #h(0.5cm) *B)* Crédito Fiscal IVA Trasladable\\
  *C)* Alícuota Adicional IUE Financiero #h(0.5cm) *D)* Exención Tributaria Subjetiva\\
  *E)* Determinación sobre Base Cierta]
  #v(1pt)
  #text(size: 8pt, style: "italic")[Relacione cada uno de los siguientes enunciados con la opción correspondiente:]
]
#v(2pt)
'''

        # Renderizado de Reactivo
        enun_formateado = p['enunciado'].replace('\n', '\\\n')
        typ_content += f'''
#block(spacing: 4.5pt)[
  *{num}.* {enun_formateado}
'''
        if p.get('formula'):
            typ_content += f"  {p['formula']}\n"

        for op in p['opciones']:
            typ_content += f"  #h(12pt) *{op[0]})* {op[1]}\\\n"
        
        typ_content += "]\n"

    return typ_content

def main():
    bases_dir = r"C:\laragon\www\evaluaciones\bases"
    assets_dir = r"C:\laragon\www\evaluaciones\evaluaciones-frontend\src\assets\examenes"
    dist_dir = r"C:\laragon\www\evaluaciones\evaluaciones-frontend\dist\sea-evaluaciones-ui\browser\assets\examenes"

    os.makedirs(assets_dir, exist_ok=True)
    if os.path.exists(r"C:\laragon\www\evaluaciones\evaluaciones-frontend\dist\sea-evaluaciones-ui"):
        os.makedirs(dist_dir, exist_ok=True)

    print("--- COMPILANDO EXÁMENES OFICIALES EN FORMATO CAPTURA 2 Y 3 (60 PREGUNTAS) ---")

    # 1. Compilar Variantes A, B, C
    variantes = [("VarA", "A", 100), ("VarB", "B", 153), ("VarC", "C", 206)]
    for var_slug, letra, seed in variantes:
        est_default = ESTUDIANTES[0]
        typ_text = generar_typst_examen(est_default, letra, seed)
        
        typ_file = os.path.join(bases_dir, f"CPEC18_Cochabamba_TA-01_1erParcial_{var_slug}_20260822_Examen.typ")
        pdf_file = os.path.join(bases_dir, f"CPEC18_Cochabamba_TA-01_1erParcial_{var_slug}_20260822_Examen.pdf")
        
        with open(typ_file, "w", encoding="utf-8") as f:
            f.write(typ_text)
        
        print(f"Compilando {var_slug}...")
        typst.compile(typ_file, output=pdf_file)
        
        # Copiar a assets
        shutil.copy2(pdf_file, os.path.join(assets_dir, os.path.basename(pdf_file)))
        if os.path.exists(dist_dir):
            shutil.copy2(pdf_file, os.path.join(dist_dir, os.path.basename(pdf_file)))

    # 2. Compilar Master / Cuadernillo Consolidado
    master_typ = os.path.join(bases_dir, "CPEC18_Cochabamba_TA-01_1erParcial_20260822_Examen.typ")
    master_pdf = os.path.join(bases_dir, "CPEC18_Cochabamba_TA-01_1erParcial_20260822_Examen.pdf")
    with open(master_typ, "w", encoding="utf-8") as f:
        f.write(generar_typst_examen(ESTUDIANTES[0], "A", 100))
    typst.compile(master_typ, output=master_pdf)
    shutil.copy2(master_pdf, os.path.join(assets_dir, os.path.basename(master_pdf)))
    if os.path.exists(dist_dir):
        shutil.copy2(master_pdf, os.path.join(dist_dir, os.path.basename(master_pdf)))

    # 3. Compilar los 12 Cuadernillos de Estudiantes Individuales
    for i, est in enumerate(ESTUDIANTES):
        letra_var = ["A", "B", "C"][i % 3]
        nom_slug = f"{est['nombres']}_{est['apellido1']}_{est['apellido2']}".upper().replace(" ", "_")
        for char, repl in [("É", "E"), ("Í", "I"), ("Ó", "O"), ("Á", "A"), ("Ú", "U"), ("Ñ", "N")]:
            nom_slug = nom_slug.replace(char, repl)
        
        est_typ = os.path.join(bases_dir, f"CPEC18_{est['codigo']}_{nom_slug}_Examen.typ")
        est_pdf = os.path.join(bases_dir, f"CPEC18_{est['codigo']}_{nom_slug}_Examen.pdf")
        
        with open(est_typ, "w", encoding="utf-8") as f:
            f.write(generar_typst_examen(est, letra_var, (i + 1) * 73))
        
        typst.compile(est_typ, output=est_pdf)
        shutil.copy2(est_pdf, os.path.join(assets_dir, os.path.basename(est_pdf)))
        if os.path.exists(dist_dir):
            shutil.copy2(est_pdf, os.path.join(dist_dir, os.path.basename(est_pdf)))
        print(f"  [OK] Estudiante {est['codigo']} ({letra_var}) -> {os.path.basename(est_pdf)}")

    print("¡TODOS LOS EXÁMENES COMPILADOS EXITOSAMENTE CON 60 PREGUNTAS Y FORMATO OFICIAL!")

if __name__ == "__main__":
    main()
