#set text(
  font: "Libertinus Serif",
  size: 11pt,
  lang: "es"
)

#show raw: set text(font: "Libertinus Serif")

#set par(leading: 0.8em, spacing: 0.8em)
#set page(
  width: 21.59cm,
  height: 33.02cm,
  margin: 2cm,
  header: none,
  footer: context {
    grid(
      columns: (1fr, auto),
      align: (left, right),
      [
        #raw("TRUJILLO LLANOS BENJAMIN FREDDY", block: false)\
        #text(size: 15pt, weight: "bold")[1109862]
      ],
      [PÁG. #counter(page).display()]
    )
  }
)

#counter(page).update(1)
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
    #text(weight: "bold")[UNIVERSIDAD TECNICA PRIVADA COSMOS]\
    #text(weight: "bold")[GESTION 2-2026]
    #v(-2pt)
    #line(length: 90%, stroke: 0.5pt + black)
    #v(-2.5pt)
    #text(weight: "bold")[EVALUACION TEORICA 1ER PARCIAL]
  ]
)


#v(0.8em)
#table(
  columns: (1fr, 1fr),
  stroke: 0.4pt + black,
  inset: 4pt,
  [NOMBRE: #raw("TRUJILLO LLANOS BENJAMIN FREDDY", block: false)], [CARRERA: #raw("LICENCIATURA EN INGENIERÍA DE SISTEMAS", block: false)],
  [MATERIA: #raw("ÁLGEBRA LINEAL", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("2", block: false)],
  [DOCENTE: #raw("XIMENA WENDY CALIZAYA PEREZ", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("03/09/2026", block: false)], [HORA: #raw("08:15 - 09:45", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1109862", block: false)]],
)
#v(0.8em)

#v(0.8em)
#align(center)[
  #text(weight: "bold")[CUESTIONARIO DE PREGUNTAS (30)]
]

#v(0.8em)
#line(length: 100%, stroke: 0.75pt + black)
#v(0.8em)

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("VERDADERO O FALSO SIMPLE", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Marque la respuesta correcta.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("El comando sudo apt-get update se utiliza para re-sincronizar los índices de paquetes desde las fuentes listadas en /etc/apt/sources.list.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("El comando sudo apt-get upgrade instala nuevas versiones pero, bajo algunas circunstancias, elimina paquetes y dependencias antiguas del sistema.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("El comando sudo apt-get install instala el paquete solicitado junto con todas las dependencias necesarias para que pueda ejecutarse de manera correcta.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[4. #raw("___", block: false)]] #h(0.25em)#raw("La variable de entorno de Linux llamada HOME almacena y direcciona al directorio home del usuario local.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("Para la creación de nuevos grupos en la administración del sistema operativo Linux, se utiliza el comando groupadd.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("En el esquema de formato numérico octal para otorgar permisos en Linux, el valor 4 representa el permiso de lectura (r).", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("Un enlace físico (Hard Link) guarda toda la información en un solo Inodo, de manera que cada archivo enlazado contiene siempre lo mismo.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("En la administración de usuarios y grupos, el comando groupdel se emplea específicamente para agregar un usuario a un grupo secundario.", block: false)\
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("EMPAREJAMIENTO AMPLIADO", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: De la lista de opciones, seleccione la respuesta correcta", block: false)]\
#text(weight: "regular")[#raw("para cada enunciado.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#rect(width: 100%, stroke: 0.5pt + black, fill: rgb("#f8fafc"), inset: 3.5pt)[
  #text(weight: "regular")[#raw("Determine la relación correcta entre los comandos fundamentales de administración de usuarios y la asignación de permisos a nivel de archivos dentro de la jerarquía de Linux.", block: false)]\
  #text(weight: "regular")[#raw("A) Enlace Físico", block: false)]\
  #text(weight: "regular")[#raw("B) Enlace Simbólico", block: false)]\
  #text(weight: "regular")[#raw("C) chmod", block: false)]\
  #text(weight: "regular")[#raw("D) usermod", block: false)]\
  #text(weight: "regular")[#raw("E) chown", block: false)]
]
#v(1em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("Mandato de administración utilizado para modificar las propiedades, detalles y roles de un usuario que ya existe en el sistema, como por ejemplo añadirlo a un grupo secundario.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("Orden empleada en la consola para alterar estructuralmente quién es reconocido como el propietario oficial de un determinado fichero o un directorio.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("Herramienta diseñada para cambiar los privilegios de un archivo sobre su lectura (4), escritura (2) y ejecución (1) haciendo uso de una nomenclatura en formato numérico octal.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("Estructura lógica conectada donde los archivos resguardan su información convergiendo en un solo y mismo Inodo, compartiendo la data internamente con su par enlazado de forma idéntica.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("Mecanismo de referencia virtual donde un archivo hace alusión al contenido de otro apoyándose exclusivamente en el nombre o ruta del fichero original (Soft Link).", block: false)\
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("SELECCIÓN DE LA MEJOR RESPUESTA", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué comando se debe ejecutar siempre a modo de pre-requisito antes de un upgrade o dist-upgrade para actualizar las fuentes de repositorios?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("sudo apt-get autoremove", block: false)]\
    #text(weight: "regular")[B) #raw("sudo apt-get purge", block: false)]\
    #text(weight: "regular")[C) #raw("export update=source", block: false)]\
    #text(weight: "regular")[D) #raw("sudo apt-get update", block: false)]\
    #text(weight: "regular")[E) #raw("sudo apt-get install", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué ocurre exactamente con los archivos de configuración cuando se desinstala un paquete utilizando el comando apt-get purge?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Se mantienen intactos en su directorio original para futuras instalaciones", block: false)]\
    #text(weight: "regular")[B) #raw("Se migran al directorio home del superusuario root para respaldo", block: false)]\
    #text(weight: "regular")[C) #raw("Se encriptan y se bloquea su acceso al usuario propietario", block: false)]\
    #text(weight: "regular")[D) #raw("Se envían a la papelera de reciclaje temporal de la terminal", block: false)]\
    #text(weight: "regular")[E) #raw("Se eliminan por completo de manera adicional al paquete de software desinstalado", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("¿Para qué sirve específicamente el comando sudo apt-get autoremove en la gestión del software de Linux?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Para actualizar las variables de entorno del sistema automáticamente", block: false)]\
    #text(weight: "regular")[B) #raw("Para remover paquetes instalados como dependencias de otros paquetes que ya no son necesarios", block: false)]\
    #text(weight: "regular")[C) #raw("Para formatear completamente el disco duro del servidor", block: false)]\
    #text(weight: "regular")[D) #raw("Para eliminar cuentas de usuarios que no se han logueado en meses", block: false)]\
    #text(weight: "regular")[E) #raw("Para desinstalar el entorno gráfico y dejar el sistema solo en modo texto", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es la sintaxis o comando correcto para visualizar en pantalla el contenido que almacena una variable de entorno como HOME?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("display <HOME>", block: false)]\
    #text(weight: "regular")[B) #raw("show [HOME]", block: false)]\
    #text(weight: "regular")[C) #raw("echo '{HOME}", block: false)]\
    #text(weight: "regular")[D) #raw("read (HOME)", block: false)]\
    #text(weight: "regular")[E) #raw("print {HOME}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué instrucción permite definir, instanciar y asignar un valor a una nueva variable de entorno en la línea de comandos?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("assign (VAR) as valor", block: false)]\
    #text(weight: "regular")[B) #raw("alias {VAR}=valor", block: false)]\
    #text(weight: "regular")[C) #raw("create {VAR}=valor", block: false)]\
    #text(weight: "regular")[D) #raw("set [VAR] to valor", block: false)]\
    #text(weight: "regular")[E) #raw("export {VAR}=valor", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál de los siguientes comandos presenta la sintaxis válida para crear un nuevo usuario y añadirlo a un grupo inicial de forma simultánea?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("createuser --group {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[B) #raw("makeuser {usuario} en {grupo}", block: false)]\
    #text(weight: "regular")[C) #raw("adduser -g {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[D) #raw("addgroup {grupo} to {usuario}", block: false)]\
    #text(weight: "regular")[E) #raw("newuser -grp {grupo} {usuario}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("Si se aplica la regla de permisos chmod 755 sobre un directorio, ¿qué privilegios ostenta el bloque asignado al Propietario (Owner) que corresponde al número 7?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Lectura exclusiva, previniendo alteraciones accidentales", block: false)]\
    #text(weight: "regular")[B) #raw("Permiso absoluto de solo escritura ciega", block: false)]\
    #text(weight: "regular")[C) #raw("Solo lectura y ejecución, prohibida la escritura", block: false)]\
    #text(weight: "regular")[D) #raw("Lectura y escritura, careciendo del permiso de ejecución", block: false)]\
    #text(weight: "regular")[E) #raw("Control total, agrupando lectura, escritura y ejecución (rwx)", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es la estructura gramatical o sintaxis básica a utilizar en la terminal para modificar los niveles de acceso de un documento empleando el sistema octal?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("access {permisos} a {fichero}", block: false)]\
    #text(weight: "regular")[B) #raw("attrib {fichero} {permisos}", block: false)]\
    #text(weight: "regular")[C) #raw("chown {octal} {fichero}", block: false)]\
    #text(weight: "regular")[D) #raw("chmod {permisos} {fichero}", block: false)]\
    #text(weight: "regular")[E) #raw("permissions {fichero} {octal}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es el formato correcto para crear un enlace simbólico (Soft Link) desde la terminal de comandos hacia un archivo ya existente?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("link {fichero} > soft-link.txt", block: false)]\
    #text(weight: "regular")[B) #raw("shortcut {fichero} to soft-link.txt", block: false)]\
    #text(weight: "regular")[C) #raw("ln -s {fichero} soft-link.txt", block: false)]\
    #text(weight: "regular")[D) #raw("bind -soft {fichero} soft-link.txt", block: false)]\
    #text(weight: "regular")[E) #raw("create-link {fichero} soft-link.txt", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es la instrucción adecuada para desplegar la instalación simultánea de varias herramientas de software como por ejemplo tres paquetes en una sola línea?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("sudo get-apt {paquete1} & {paquete2} & {paquete3}", block: false)]\
    #text(weight: "regular")[B) #raw("sudo apt-get add {paquete1} + {paquete2} + {paquete3}", block: false)]\
    #text(weight: "regular")[C) #raw("sudo apt-get install {paquete1} {paquete2} {paquete3}", block: false)]\
    #text(weight: "regular")[D) #raw("apt-get fetch {paquete1} {paquete2} {paquete3}", block: false)]\
    #text(weight: "regular")[E) #raw("sudo apt installall {paquete1,paquete2,paquete3}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("Cuando escribes un comando como ls en la terminal sin su ruta completa, el sistema lo encuentra gracias a una variable de entorno. ¿Cuál es esa variable?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("PATH", block: false)]\
    #text(weight: "regular")[B) #raw("ALIAS_LIST", block: false)]\
    #text(weight: "regular")[C) #raw("BIN_PATH", block: false)]\
    #text(weight: "regular")[D) #raw("DIRECTORIES", block: false)]\
    #text(weight: "regular")[E) #raw("EXEC_ROUTES", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué variable de entorno es la encargada de apuntar hacia el archivo o directorio donde se reciben y alojan los mensajes de correo electrónico locales del usuario?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("POSTBOX", block: false)]\
    #text(weight: "regular")[B) #raw("SMTP_PATH", block: false)]\
    #text(weight: "regular")[C) #raw("MESSAGES", block: false)]\
    #text(weight: "regular")[D) #raw("MAIL", block: false)]\
    #text(weight: "regular")[E) #raw("INBOX", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("En el contexto de los vínculos de ficheros en Linux, ¿qué condición estructural caracteriza y define primariamente al comportamiento de un Hard Link?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Solo puede crearse si ambos archivos están alojados en dispositivos de red diferentes", block: false)]\
    #text(weight: "regular")[B) #raw("Guarda la información en un solo Inodo, por lo que contiene siempre los mismos datos que el original", block: false)]\
    #text(weight: "regular")[C) #raw("Consume el doble de Inodos en la tabla de asignación de archivos de la partición", block: false)]\
    #text(weight: "regular")[D) #raw("Es un simple acceso directo que se rompe si el archivo principal cambia de directorio", block: false)]\
    #text(weight: "regular")[E) #raw("Genera un ejecutable paralelo que sirve de emulador del programa original", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("Al verificar los privilegios de un archivo plano se observa la secuencia -rw-r--r--. ¿Qué lectura correcta se extrae sobre las facultades concedidas al propietario?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Puede modificar el archivo, pero tiene prohibido leer su contenido", block: false)]\
    #text(weight: "regular")[B) #raw("Puede tanto leer como escribir el fichero, pero carece de la potestad de ejecutarlo", block: false)]\
    #text(weight: "regular")[C) #raw("Posee control absoluto sobre lectura, modificación y ejecución del fichero", block: false)]\
    #text(weight: "regular")[D) #raw("No goza de ningún permiso, todos sus accesos han sido denegados por seguridad", block: false)]\
    #text(weight: "regular")[E) #raw("Ostenta únicamente privilegios de ejecución del archivo en segundo plano", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("¿En qué directorio o archivo del núcleo del sistema se albergan los enlaces fuente desde los cuales la herramienta apt-get actualiza los índices de repositorios locales?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("/var/log/apt/history.log", block: false)]\
    #text(weight: "regular")[B) #raw("/boot/grub/sources.conf", block: false)]\
    #text(weight: "regular")[C) #raw("/home/root/repositories.txt", block: false)]\
    #text(weight: "regular")[D) #raw("/etc/apt/sources.list", block: false)]\
    #text(weight: "regular")[E) #raw("/usr/bin/apt-get.exe", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Para eliminar un grupo de usuarios de la organización operativa de Linux sin afectar directamente a las cuentas, ¿qué sintaxis es la aplicable en la terminal?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("dropgroup {grupo}", block: false)]\
    #text(weight: "regular")[B) #raw("groupremove {grupo}", block: false)]\
    #text(weight: "regular")[C) #raw("delgroup {grupo}", block: false)]\
    #text(weight: "regular")[D) #raw("erasegrp {grupo}", block: false)]\
    #text(weight: "regular")[E) #raw("groupdel {grupo}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("Dentro del mapa de variables declaradas activas por el sistema en una sesión regular de Linux, ¿qué define el contenido albergado bajo la variable USER?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("El identificador de red MAC del equipo que está operando remotamente", block: false)]\
    #text(weight: "regular")[B) #raw("La dirección física del directorio home del usuario principal (root)", block: false)]\
    #text(weight: "regular")[C) #raw("El registro de todas las contraseñas encriptadas del sistema de archivos", block: false)]\
    #text(weight: "regular")[D) #raw("El listado histórico de comandos invocados previamente en la consola", block: false)]\
    #text(weight: "regular")[E) #raw("El nombre de la cuenta de usuario que se encuentra actualmente en uso", block: false)]\
  ]
]

#pagebreak(to: "odd")
#set page(
  width: 21.59cm,
  height: 33.02cm,
  margin: 2cm,
  header: none,
  footer: context {
    grid(
      columns: (1fr, auto),
      align: (left, right),
      [
        #raw("MENDOZA RAMIREZ MANUEL", block: false)\
        #text(size: 15pt, weight: "bold")[1111491]
      ],
      [PÁG. #counter(page).display()]
    )
  }
)

#counter(page).update(1)
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
    #text(weight: "bold")[UNIVERSIDAD TECNICA PRIVADA COSMOS]\
    #text(weight: "bold")[GESTION 2-2026]
    #v(-2pt)
    #line(length: 90%, stroke: 0.5pt + black)
    #v(-2.5pt)
    #text(weight: "bold")[EVALUACION TEORICA 1ER PARCIAL]
  ]
)


#v(0.8em)
#table(
  columns: (1fr, 1fr),
  stroke: 0.4pt + black,
  inset: 4pt,
  [NOMBRE: #raw("MENDOZA RAMIREZ MANUEL", block: false)], [CARRERA: #raw("LICENCIATURA EN INGENIERÍA DE SISTEMAS", block: false)],
  [MATERIA: #raw("ÁLGEBRA LINEAL", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("2", block: false)],
  [DOCENTE: #raw("XIMENA WENDY CALIZAYA PEREZ", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("03/09/2026", block: false)], [HORA: #raw("08:15 - 09:45", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1111491", block: false)]],
)
#v(0.8em)

#v(0.8em)
#align(center)[
  #text(weight: "bold")[CUESTIONARIO DE PREGUNTAS (30)]
]

#v(0.8em)
#line(length: 100%, stroke: 0.75pt + black)
#v(0.8em)

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("VERDADERO O FALSO SIMPLE", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Marque la respuesta correcta.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("El comando sudo apt-get upgrade instala nuevas versiones pero, bajo algunas circunstancias, elimina paquetes y dependencias antiguas del sistema.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("El comando sudo apt-get remove desinstala el paquete solicitado, pero mantiene intactos los archivos de configuración por si se reinstala en el futuro.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("La variable de entorno de Linux llamada HOME almacena y direcciona al directorio home del usuario local.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[4. #raw("___", block: false)]] #h(0.25em)#raw("El comando alias permite crear atajos para comandos o grupos de comandos, facilitando el trabajo en la shell.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("En Linux, la variable de entorno PATH contiene el nombre del intérprete de comandos o shell actualmente en uso.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("En el esquema de formato numérico octal para otorgar permisos en Linux, el valor 4 representa el permiso de lectura (r).", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("El comando chown se utiliza en el sistema para modificar y asignar un nuevo propietario a un fichero o directorio.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("Un enlace simbólico (Soft Link) realiza la referencia al archivo enlazado basándose únicamente en el nombre del fichero original.", block: false)\
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("SELECCIÓN DE LA MEJOR RESPUESTA", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué comando se debe ejecutar siempre a modo de pre-requisito antes de un upgrade o dist-upgrade para actualizar las fuentes de repositorios?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("export update=source", block: false)]\
    #text(weight: "regular")[B) #raw("sudo apt-get autoremove", block: false)]\
    #text(weight: "regular")[C) #raw("sudo apt-get install", block: false)]\
    #text(weight: "regular")[D) #raw("sudo apt-get update", block: false)]\
    #text(weight: "regular")[E) #raw("sudo apt-get purge", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es la principal característica del comando apt-get dist-upgrade frente al comando upgrade tradicional?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Comprime y guarda un respaldo de los paquetes obsoletos antes de reemplazarlos", block: false)]\
    #text(weight: "regular")[B) #raw("Controla inteligentemente cambios en dependencias, resolviendo conflictos y eliminando versiones si es necesario", block: false)]\
    #text(weight: "regular")[C) #raw("Solo actualiza programas visuales del entorno de escritorio de Linux", block: false)]\
    #text(weight: "regular")[D) #raw("Desactiva temporalmente las políticas de seguridad para compilar código fuente", block: false)]\
    #text(weight: "regular")[E) #raw("Elimina por completo los repositorios alojados en el archivo sources.list", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué ocurre exactamente con los archivos de configuración cuando se desinstala un paquete utilizando el comando apt-get purge?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Se migran al directorio home del superusuario root para respaldo", block: false)]\
    #text(weight: "regular")[B) #raw("Se eliminan por completo de manera adicional al paquete de software desinstalado", block: false)]\
    #text(weight: "regular")[C) #raw("Se encriptan y se bloquea su acceso al usuario propietario", block: false)]\
    #text(weight: "regular")[D) #raw("Se envían a la papelera de reciclaje temporal de la terminal", block: false)]\
    #text(weight: "regular")[E) #raw("Se mantienen intactos en su directorio original para futuras instalaciones", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("¿Para qué sirve específicamente el comando sudo apt-get autoremove en la gestión del software de Linux?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Para desinstalar el entorno gráfico y dejar el sistema solo en modo texto", block: false)]\
    #text(weight: "regular")[B) #raw("Para remover paquetes instalados como dependencias de otros paquetes que ya no son necesarios", block: false)]\
    #text(weight: "regular")[C) #raw("Para eliminar cuentas de usuarios que no se han logueado en meses", block: false)]\
    #text(weight: "regular")[D) #raw("Para actualizar las variables de entorno del sistema automáticamente", block: false)]\
    #text(weight: "regular")[E) #raw("Para formatear completamente el disco duro del servidor", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué variable de entorno debes consultar para conocer el idioma local configurado y utilizado en el entorno Linux?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("TEXT", block: false)]\
    #text(weight: "regular")[B) #raw("LANG", block: false)]\
    #text(weight: "regular")[C) #raw("LOCALE", block: false)]\
    #text(weight: "regular")[D) #raw("REGION", block: false)]\
    #text(weight: "regular")[E) #raw("DIALECT", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es la estructura gramatical o sintaxis básica a utilizar en la terminal para modificar los niveles de acceso de un documento empleando el sistema octal?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("attrib {fichero} {permisos}", block: false)]\
    #text(weight: "regular")[B) #raw("permissions {fichero} {octal}", block: false)]\
    #text(weight: "regular")[C) #raw("chown {octal} {fichero}", block: false)]\
    #text(weight: "regular")[D) #raw("chmod {permisos} {fichero}", block: false)]\
    #text(weight: "regular")[E) #raw("access {permisos} a {fichero}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es el formato correcto para crear un enlace simbólico (Soft Link) desde la terminal de comandos hacia un archivo ya existente?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("ln -s {fichero} soft-link.txt", block: false)]\
    #text(weight: "regular")[B) #raw("create-link {fichero} soft-link.txt", block: false)]\
    #text(weight: "regular")[C) #raw("bind -soft {fichero} soft-link.txt", block: false)]\
    #text(weight: "regular")[D) #raw("shortcut {fichero} to soft-link.txt", block: false)]\
    #text(weight: "regular")[E) #raw("link {fichero} > soft-link.txt", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("¿Cómo se denomina al bloque lógico interno del sistema Linux que contiene la metadata de un archivo y que es compartido idénticamente cuando se crean enlaces físicos (Hard Links)?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Clúster de Datos", block: false)]\
    #text(weight: "regular")[B) #raw("Puntero Simbólico", block: false)]\
    #text(weight: "regular")[C) #raw("Sector de Arranque", block: false)]\
    #text(weight: "regular")[D) #raw("Inodo", block: false)]\
    #text(weight: "regular")[E) #raw("Directorio Raíz", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es la instrucción adecuada para desplegar la instalación simultánea de varias herramientas de software como por ejemplo tres paquetes en una sola línea?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("sudo apt installall {paquete1,paquete2,paquete3}", block: false)]\
    #text(weight: "regular")[B) #raw("sudo get-apt {paquete1} & {paquete2} & {paquete3}", block: false)]\
    #text(weight: "regular")[C) #raw("sudo apt-get add {paquete1} + {paquete2} + {paquete3}", block: false)]\
    #text(weight: "regular")[D) #raw("apt-get fetch {paquete1} {paquete2} {paquete3}", block: false)]\
    #text(weight: "regular")[E) #raw("sudo apt-get install {paquete1} {paquete2} {paquete3}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("Teniendo en cuenta la preservación de dependencias, ¿cuál de los siguientes mandatos se especializa en instalar las versiones más recientes de los programas locales sin eliminar ni un solo paquete del disco?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("sudo apt-get upgrade", block: false)]\
    #text(weight: "regular")[B) #raw("sudo apt-get dist-upgrade", block: false)]\
    #text(weight: "regular")[C) #raw("sudo apt-get soft-upgrade", block: false)]\
    #text(weight: "regular")[D) #raw("sudo apt-get install --new", block: false)]\
    #text(weight: "regular")[E) #raw("sudo apt-get update-all", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("Cuando escribes un comando como ls en la terminal sin su ruta completa, el sistema lo encuentra gracias a una variable de entorno. ¿Cuál es esa variable?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("EXEC_ROUTES", block: false)]\
    #text(weight: "regular")[B) #raw("PATH", block: false)]\
    #text(weight: "regular")[C) #raw("BIN_PATH", block: false)]\
    #text(weight: "regular")[D) #raw("DIRECTORIES", block: false)]\
    #text(weight: "regular")[E) #raw("ALIAS_LIST", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("Un administrador decide crear un atajo rápido para listar directorios ocultos usando el texto \"comando\". ¿Cuál es la forma correcta de definirlo?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("set alias comando to 'ls -lah'", block: false)]\
    #text(weight: "regular")[B) #raw("create_alias comando 'ls -lah'", block: false)]\
    #text(weight: "regular")[C) #raw("shortcut comando = ls -lah", block: false)]\
    #text(weight: "regular")[D) #raw("bind comando -> 'ls -lah'", block: false)]\
    #text(weight: "regular")[E) #raw("alias comando = 'ls -lah'", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("Una cuenta de usuario que fue creada temporalmente ya no será requerida en el servidor. ¿Qué comando invoca el administrador para suprimirla de los registros?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("removeuser {usuario}", block: false)]\
    #text(weight: "regular")[B) #raw("killuser {usuario}", block: false)]\
    #text(weight: "regular")[C) #raw("delete-user {usuario}", block: false)]\
    #text(weight: "regular")[D) #raw("userdel {usuario}", block: false)]\
    #text(weight: "regular")[E) #raw("eraseuser {usuario}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué variable de entorno es la encargada de apuntar hacia el archivo o directorio donde se reciben y alojan los mensajes de correo electrónico locales del usuario?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("SMTP_PATH", block: false)]\
    #text(weight: "regular")[B) #raw("POSTBOX", block: false)]\
    #text(weight: "regular")[C) #raw("INBOX", block: false)]\
    #text(weight: "regular")[D) #raw("MESSAGES", block: false)]\
    #text(weight: "regular")[E) #raw("MAIL", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("El comando chown permite reestructurar el nivel de pertenencia de un elemento en el disco. ¿Cuál es su cometido técnico fundamental?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Alterar la extensión y el tipo de codificación de un fichero del sistema", block: false)]\
    #text(weight: "regular")[B) #raw("Asignar y modificar quién es el propietario legítimo de un fichero o directorio", block: false)]\
    #text(weight: "regular")[C) #raw("Encriptar la información del archivo previniendo el acceso del root", block: false)]\
    #text(weight: "regular")[D) #raw("Modificar la ubicación geográfica donde se guarda un archivo", block: false)]\
    #text(weight: "regular")[E) #raw("Cambiar los permisos de ejecución de un programa en texto plano", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("En el contexto de los vínculos de ficheros en Linux, ¿qué condición estructural caracteriza y define primariamente al comportamiento de un Hard Link?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Solo puede crearse si ambos archivos están alojados en dispositivos de red diferentes", block: false)]\
    #text(weight: "regular")[B) #raw("Consume el doble de Inodos en la tabla de asignación de archivos de la partición", block: false)]\
    #text(weight: "regular")[C) #raw("Genera un ejecutable paralelo que sirve de emulador del programa original", block: false)]\
    #text(weight: "regular")[D) #raw("Es un simple acceso directo que se rompe si el archivo principal cambia de directorio", block: false)]\
    #text(weight: "regular")[E) #raw("Guarda la información en un solo Inodo, por lo que contiene siempre los mismos datos que el original", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("Para eliminar un grupo de usuarios de la organización operativa de Linux sin afectar directamente a las cuentas, ¿qué sintaxis es la aplicable en la terminal?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("erasegrp {grupo}", block: false)]\
    #text(weight: "regular")[B) #raw("dropgroup {grupo}", block: false)]\
    #text(weight: "regular")[C) #raw("groupdel {grupo}", block: false)]\
    #text(weight: "regular")[D) #raw("groupremove {grupo}", block: false)]\
    #text(weight: "regular")[E) #raw("delgroup {grupo}", block: false)]\
  ]
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("EMPAREJAMIENTO AMPLIADO", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: De la lista de opciones, seleccione la respuesta correcta", block: false)]\
#text(weight: "regular")[#raw("para cada enunciado.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#rect(width: 100%, stroke: 0.5pt + black, fill: rgb("#f8fafc"), inset: 3.5pt)[
  #text(weight: "regular")[#raw("Determine la relación correcta entre los comandos fundamentales de administración de usuarios y la asignación de permisos a nivel de archivos dentro de la jerarquía de Linux.", block: false)]\
  #text(weight: "regular")[#raw("A) usermod", block: false)]\
  #text(weight: "regular")[#raw("B) Enlace Simbólico", block: false)]\
  #text(weight: "regular")[#raw("C) chmod", block: false)]\
  #text(weight: "regular")[#raw("D) Enlace Físico", block: false)]\
  #text(weight: "regular")[#raw("E) chown", block: false)]
]
#v(1em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("Mandato de administración utilizado para modificar las propiedades, detalles y roles de un usuario que ya existe en el sistema, como por ejemplo añadirlo a un grupo secundario.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("Orden empleada en la consola para alterar estructuralmente quién es reconocido como el propietario oficial de un determinado fichero o un directorio.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("Herramienta diseñada para cambiar los privilegios de un archivo sobre su lectura (4), escritura (2) y ejecución (1) haciendo uso de una nomenclatura en formato numérico octal.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Estructura lógica conectada donde los archivos resguardan su información convergiendo en un solo y mismo Inodo, compartiendo la data internamente con su par enlazado de forma idéntica.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("Mecanismo de referencia virtual donde un archivo hace alusión al contenido de otro apoyándose exclusivamente en el nombre o ruta del fichero original (Soft Link).", block: false)\
]

#pagebreak(to: "odd")
#set page(
  width: 21.59cm,
  height: 33.02cm,
  margin: 2cm,
  header: none,
  footer: context {
    grid(
      columns: (1fr, auto),
      align: (left, right),
      [
        #raw("RIVERA PEREDO NEILS ALEJANDRO", block: false)\
        #text(size: 15pt, weight: "bold")[1111884]
      ],
      [PÁG. #counter(page).display()]
    )
  }
)

#counter(page).update(1)
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
    #text(weight: "bold")[UNIVERSIDAD TECNICA PRIVADA COSMOS]\
    #text(weight: "bold")[GESTION 2-2026]
    #v(-2pt)
    #line(length: 90%, stroke: 0.5pt + black)
    #v(-2.5pt)
    #text(weight: "bold")[EVALUACION TEORICA 1ER PARCIAL]
  ]
)


#v(0.8em)
#table(
  columns: (1fr, 1fr),
  stroke: 0.4pt + black,
  inset: 4pt,
  [NOMBRE: #raw("RIVERA PEREDO NEILS ALEJANDRO", block: false)], [CARRERA: #raw("LICENCIATURA EN INGENIERÍA DE SISTEMAS", block: false)],
  [MATERIA: #raw("ÁLGEBRA LINEAL", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("2", block: false)],
  [DOCENTE: #raw("XIMENA WENDY CALIZAYA PEREZ", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("03/09/2026", block: false)], [HORA: #raw("08:15 - 09:45", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1111884", block: false)]],
)
#v(0.8em)

#v(0.8em)
#align(center)[
  #text(weight: "bold")[CUESTIONARIO DE PREGUNTAS (30)]
]

#v(0.8em)
#line(length: 100%, stroke: 0.75pt + black)
#v(0.8em)

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("VERDADERO O FALSO SIMPLE", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Marque la respuesta correcta.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("El comando sudo apt-get upgrade instala nuevas versiones pero, bajo algunas circunstancias, elimina paquetes y dependencias antiguas del sistema.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("El comando sudo apt-get install instala el paquete solicitado junto con todas las dependencias necesarias para que pueda ejecutarse de manera correcta.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("El comando sudo apt-get remove desinstala el paquete solicitado, pero mantiene intactos los archivos de configuración por si se reinstala en el futuro.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[4. #raw("___", block: false)]] #h(0.25em)#raw("La variable de entorno de Linux llamada HOME almacena y direcciona al directorio home del usuario local.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("En Linux, la variable de entorno PATH contiene el nombre del intérprete de comandos o shell actualmente en uso.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("El comando useradd se utiliza en la administración básica del sistema operativo para eliminar cuentas de usuario.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("El comando userdel sirve de forma exclusiva para modificar los privilegios y los detalles de un usuario previamente creado.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("En el esquema de formato numérico octal para otorgar permisos en Linux, el valor 4 representa el permiso de lectura (r).", block: false)\
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("SELECCIÓN DE LA MEJOR RESPUESTA", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("¿Para qué sirve específicamente el comando sudo apt-get autoremove en la gestión del software de Linux?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Para formatear completamente el disco duro del servidor", block: false)]\
    #text(weight: "regular")[B) #raw("Para remover paquetes instalados como dependencias de otros paquetes que ya no son necesarios", block: false)]\
    #text(weight: "regular")[C) #raw("Para actualizar las variables de entorno del sistema automáticamente", block: false)]\
    #text(weight: "regular")[D) #raw("Para eliminar cuentas de usuarios que no se han logueado en meses", block: false)]\
    #text(weight: "regular")[E) #raw("Para desinstalar el entorno gráfico y dejar el sistema solo en modo texto", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué instrucción permite definir, instanciar y asignar un valor a una nueva variable de entorno en la línea de comandos?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("assign (VAR) as valor", block: false)]\
    #text(weight: "regular")[B) #raw("export {VAR}=valor", block: false)]\
    #text(weight: "regular")[C) #raw("alias {VAR}=valor", block: false)]\
    #text(weight: "regular")[D) #raw("set [VAR] to valor", block: false)]\
    #text(weight: "regular")[E) #raw("create {VAR}=valor", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué variable de entorno debes consultar para conocer el idioma local configurado y utilizado en el entorno Linux?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("TEXT", block: false)]\
    #text(weight: "regular")[B) #raw("LANG", block: false)]\
    #text(weight: "regular")[C) #raw("LOCALE", block: false)]\
    #text(weight: "regular")[D) #raw("DIALECT", block: false)]\
    #text(weight: "regular")[E) #raw("REGION", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál de los siguientes comandos presenta la sintaxis válida para crear un nuevo usuario y añadirlo a un grupo inicial de forma simultánea?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("adduser -g {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[B) #raw("makeuser {usuario} en {grupo}", block: false)]\
    #text(weight: "regular")[C) #raw("createuser --group {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[D) #raw("addgroup {grupo} to {usuario}", block: false)]\
    #text(weight: "regular")[E) #raw("newuser -grp {grupo} {usuario}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué comando de administración es el indicado para editar los detalles de un usuario existente, como por ejemplo asignarle un nuevo grupo secundario?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("changeusr {usuario} {grupo}", block: false)]\
    #text(weight: "regular")[B) #raw("chown -g {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[C) #raw("usermod -G {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[D) #raw("useredit --assign {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[E) #raw("modifyuser -grp {grupo} {usuario}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("Para que un usuario estándar pueda invocar e instalar herramientas con privilegios de superusuario, ¿qué palabra clave o grupo se le debe anexar en su creación?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("godmode", block: false)]\
    #text(weight: "regular")[B) #raw("master", block: false)]\
    #text(weight: "regular")[C) #raw("sudo", block: false)]\
    #text(weight: "regular")[D) #raw("root", block: false)]\
    #text(weight: "regular")[E) #raw("admin", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("Basándose en el esquema numérico octal para la gestión de ficheros, ¿qué valor representa estrictamente al permiso de escritura (w)?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("1", block: false)]\
    #text(weight: "regular")[B) #raw("2", block: false)]\
    #text(weight: "regular")[C) #raw("7", block: false)]\
    #text(weight: "regular")[D) #raw("5", block: false)]\
    #text(weight: "regular")[E) #raw("4", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué capacidad de acción le otorga a un usuario el valor octal 1 asignado sobre un archivo del sistema Linux?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Derecho para modificar el contenido (w)", block: false)]\
    #text(weight: "regular")[B) #raw("Control total absoluto (rwx)", block: false)]\
    #text(weight: "regular")[C) #raw("Permiso exclusivo de lectura (r)", block: false)]\
    #text(weight: "regular")[D) #raw("Permiso exclusivo de ejecución (x)", block: false)]\
    #text(weight: "regular")[E) #raw("Autorización para borrar el fichero", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("Si se aplica la regla de permisos chmod 755 sobre un directorio, ¿qué privilegios ostenta el bloque asignado al Propietario (Owner) que corresponde al número 7?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Control total, agrupando lectura, escritura y ejecución (rwx)", block: false)]\
    #text(weight: "regular")[B) #raw("Lectura exclusiva, previniendo alteraciones accidentales", block: false)]\
    #text(weight: "regular")[C) #raw("Permiso absoluto de solo escritura ciega", block: false)]\
    #text(weight: "regular")[D) #raw("Lectura y escritura, careciendo del permiso de ejecución", block: false)]\
    #text(weight: "regular")[E) #raw("Solo lectura y ejecución, prohibida la escritura", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("Al aplicar la máscara chmod 755 a un script, ¿qué permisos están recibiendo los bloques correspondientes al Grupo (Group) y Otros (Other), representados por el número 5?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Acceso completamente denegado (---)", block: false)]\
    #text(weight: "regular")[B) #raw("Lectura y ejecución (r-x)", block: false)]\
    #text(weight: "regular")[C) #raw("Solamente ejecución (--x)", block: false)]\
    #text(weight: "regular")[D) #raw("Solamente escritura (-w-)", block: false)]\
    #text(weight: "regular")[E) #raw("Lectura y escritura (rw-)", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es el formato correcto para crear un enlace simbólico (Soft Link) desde la terminal de comandos hacia un archivo ya existente?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("ln -s {fichero} soft-link.txt", block: false)]\
    #text(weight: "regular")[B) #raw("create-link {fichero} soft-link.txt", block: false)]\
    #text(weight: "regular")[C) #raw("shortcut {fichero} to soft-link.txt", block: false)]\
    #text(weight: "regular")[D) #raw("bind -soft {fichero} soft-link.txt", block: false)]\
    #text(weight: "regular")[E) #raw("link {fichero} > soft-link.txt", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("Teniendo en cuenta la preservación de dependencias, ¿cuál de los siguientes mandatos se especializa en instalar las versiones más recientes de los programas locales sin eliminar ni un solo paquete del disco?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("sudo apt-get update-all", block: false)]\
    #text(weight: "regular")[B) #raw("sudo apt-get upgrade", block: false)]\
    #text(weight: "regular")[C) #raw("sudo apt-get install --new", block: false)]\
    #text(weight: "regular")[D) #raw("sudo apt-get soft-upgrade", block: false)]\
    #text(weight: "regular")[E) #raw("sudo apt-get dist-upgrade", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("Cuando escribes un comando como ls en la terminal sin su ruta completa, el sistema lo encuentra gracias a una variable de entorno. ¿Cuál es esa variable?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("PATH", block: false)]\
    #text(weight: "regular")[B) #raw("ALIAS_LIST", block: false)]\
    #text(weight: "regular")[C) #raw("EXEC_ROUTES", block: false)]\
    #text(weight: "regular")[D) #raw("DIRECTORIES", block: false)]\
    #text(weight: "regular")[E) #raw("BIN_PATH", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("Una cuenta de usuario que fue creada temporalmente ya no será requerida en el servidor. ¿Qué comando invoca el administrador para suprimirla de los registros?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("killuser {usuario}", block: false)]\
    #text(weight: "regular")[B) #raw("eraseuser {usuario}", block: false)]\
    #text(weight: "regular")[C) #raw("removeuser {usuario}", block: false)]\
    #text(weight: "regular")[D) #raw("delete-user {usuario}", block: false)]\
    #text(weight: "regular")[E) #raw("userdel {usuario}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué variable de entorno es la encargada de apuntar hacia el archivo o directorio donde se reciben y alojan los mensajes de correo electrónico locales del usuario?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("MESSAGES", block: false)]\
    #text(weight: "regular")[B) #raw("SMTP_PATH", block: false)]\
    #text(weight: "regular")[C) #raw("POSTBOX", block: false)]\
    #text(weight: "regular")[D) #raw("MAIL", block: false)]\
    #text(weight: "regular")[E) #raw("INBOX", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("En el contexto de los vínculos de ficheros en Linux, ¿qué condición estructural caracteriza y define primariamente al comportamiento de un Hard Link?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Consume el doble de Inodos en la tabla de asignación de archivos de la partición", block: false)]\
    #text(weight: "regular")[B) #raw("Solo puede crearse si ambos archivos están alojados en dispositivos de red diferentes", block: false)]\
    #text(weight: "regular")[C) #raw("Es un simple acceso directo que se rompe si el archivo principal cambia de directorio", block: false)]\
    #text(weight: "regular")[D) #raw("Guarda la información en un solo Inodo, por lo que contiene siempre los mismos datos que el original", block: false)]\
    #text(weight: "regular")[E) #raw("Genera un ejecutable paralelo que sirve de emulador del programa original", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("¿En qué directorio o archivo del núcleo del sistema se albergan los enlaces fuente desde los cuales la herramienta apt-get actualiza los índices de repositorios locales?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("/boot/grub/sources.conf", block: false)]\
    #text(weight: "regular")[B) #raw("/var/log/apt/history.log", block: false)]\
    #text(weight: "regular")[C) #raw("/etc/apt/sources.list", block: false)]\
    #text(weight: "regular")[D) #raw("/home/root/repositories.txt", block: false)]\
    #text(weight: "regular")[E) #raw("/usr/bin/apt-get.exe", block: false)]\
  ]
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("EMPAREJAMIENTO AMPLIADO", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: De la lista de opciones, seleccione la respuesta correcta", block: false)]\
#text(weight: "regular")[#raw("para cada enunciado.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#rect(width: 100%, stroke: 0.5pt + black, fill: rgb("#f8fafc"), inset: 3.5pt)[
  #text(weight: "regular")[#raw("Relacione las siguientes herramientas y parámetros del gestor de paquetes APT (Advanced Packaging Tool) con la función exacta que desempeñan durante el mantenimiento de un sistema Linux.", block: false)]\
  #text(weight: "regular")[#raw("A) apt-get upgrade", block: false)]\
  #text(weight: "regular")[#raw("B) apt-get purge", block: false)]\
  #text(weight: "regular")[#raw("C) apt-get autoremove", block: false)]\
  #text(weight: "regular")[#raw("D) apt-get dist-upgrade", block: false)]\
  #text(weight: "regular")[#raw("E) apt-get update", block: false)]
]
#v(1em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("Herramienta encargada de re-sincronizar los índices de paquetes leyendo rigurosamente las fuentes especificadas en el archivo sources.list para conocer qué versiones están disponibles.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("Comando de instalación que adicionalmente a actualizar, controla de manera inteligente los cambios en las dependencias, capaz de resolver conflictos eliminando versiones obsoletas de ser imperativo.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("Instrucción extrema de desinstalación que suprime el paquete de software solicitado y simultáneamente elimina todos los archivos de configuración asociados al mismo.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Utilidad de limpieza automática empleada para remover del disco todos aquellos paquetes que fueron instalados previamente para soportar una dependencia pero que ya no son requeridos por ningún software.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("Proceso de actualización pasivo que instala las versiones nuevas de los paquetes actualmente presentes en el sistema, asegurando estrictamente que bajo ninguna circunstancia se eliminen dependencias previas.", block: false)\
]

#pagebreak(to: "odd")
#set page(
  width: 21.59cm,
  height: 33.02cm,
  margin: 2cm,
  header: none,
  footer: context {
    grid(
      columns: (1fr, auto),
      align: (left, right),
      [
        #raw("PANIAGUA MUÑOZ CARLOS ALBERTO", block: false)\
        #text(size: 15pt, weight: "bold")[1112245]
      ],
      [PÁG. #counter(page).display()]
    )
  }
)

#counter(page).update(1)
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
    #text(weight: "bold")[UNIVERSIDAD TECNICA PRIVADA COSMOS]\
    #text(weight: "bold")[GESTION 2-2026]
    #v(-2pt)
    #line(length: 90%, stroke: 0.5pt + black)
    #v(-2.5pt)
    #text(weight: "bold")[EVALUACION TEORICA 1ER PARCIAL]
  ]
)


#v(0.8em)
#table(
  columns: (1fr, 1fr),
  stroke: 0.4pt + black,
  inset: 4pt,
  [NOMBRE: #raw("PANIAGUA MUÑOZ CARLOS ALBERTO", block: false)], [CARRERA: #raw("LICENCIATURA EN INGENIERÍA DE SISTEMAS", block: false)],
  [MATERIA: #raw("ÁLGEBRA LINEAL", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("2", block: false)],
  [DOCENTE: #raw("XIMENA WENDY CALIZAYA PEREZ", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("03/09/2026", block: false)], [HORA: #raw("08:15 - 09:45", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1112245", block: false)]],
)
#v(0.8em)

#v(0.8em)
#align(center)[
  #text(weight: "bold")[CUESTIONARIO DE PREGUNTAS (30)]
]

#v(0.8em)
#line(length: 100%, stroke: 0.75pt + black)
#v(0.8em)

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("VERDADERO O FALSO SIMPLE", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Marque la respuesta correcta.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("El comando sudo apt-get upgrade instala nuevas versiones pero, bajo algunas circunstancias, elimina paquetes y dependencias antiguas del sistema.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("La variable de entorno de Linux llamada HOME almacena y direcciona al directorio home del usuario local.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("El comando alias permite crear atajos para comandos o grupos de comandos, facilitando el trabajo en la shell.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[4. #raw("___", block: false)]] #h(0.25em)#raw("En Linux, la variable de entorno PATH contiene el nombre del intérprete de comandos o shell actualmente en uso.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("Para la creación de nuevos grupos en la administración del sistema operativo Linux, se utiliza el comando groupadd.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("El comando chown se utiliza en el sistema para modificar y asignar un nuevo propietario a un fichero o directorio.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("Un enlace físico (Hard Link) guarda toda la información en un solo Inodo, de manera que cada archivo enlazado contiene siempre lo mismo.", block: false)\
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("EMPAREJAMIENTO AMPLIADO", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: De la lista de opciones, seleccione la respuesta correcta", block: false)]\
#text(weight: "regular")[#raw("para cada enunciado.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#rect(width: 100%, stroke: 0.5pt + black, fill: rgb("#f8fafc"), inset: 3.5pt)[
  #text(weight: "regular")[#raw("Relacione las siguientes herramientas y parámetros del gestor de paquetes APT (Advanced Packaging Tool) con la función exacta que desempeñan durante el mantenimiento de un sistema Linux.", block: false)]\
  #text(weight: "regular")[#raw("A) apt-get purge", block: false)]\
  #text(weight: "regular")[#raw("B) apt-get dist-upgrade", block: false)]\
  #text(weight: "regular")[#raw("C) apt-get upgrade", block: false)]\
  #text(weight: "regular")[#raw("D) apt-get update", block: false)]\
  #text(weight: "regular")[#raw("E) apt-get autoremove", block: false)]
]
#v(1em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("Herramienta encargada de re-sincronizar los índices de paquetes leyendo rigurosamente las fuentes especificadas en el archivo sources.list para conocer qué versiones están disponibles.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("Comando de instalación que adicionalmente a actualizar, controla de manera inteligente los cambios en las dependencias, capaz de resolver conflictos eliminando versiones obsoletas de ser imperativo.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("Instrucción extrema de desinstalación que suprime el paquete de software solicitado y simultáneamente elimina todos los archivos de configuración asociados al mismo.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("Utilidad de limpieza automática empleada para remover del disco todos aquellos paquetes que fueron instalados previamente para soportar una dependencia pero que ya no son requeridos por ningún software.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("Proceso de actualización pasivo que instala las versiones nuevas de los paquetes actualmente presentes en el sistema, asegurando estrictamente que bajo ninguna circunstancia se eliminen dependencias previas.", block: false)\
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("SELECCIÓN DE LA MEJOR RESPUESTA", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué comando se debe ejecutar siempre a modo de pre-requisito antes de un upgrade o dist-upgrade para actualizar las fuentes de repositorios?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("sudo apt-get install", block: false)]\
    #text(weight: "regular")[B) #raw("sudo apt-get purge", block: false)]\
    #text(weight: "regular")[C) #raw("export update=source", block: false)]\
    #text(weight: "regular")[D) #raw("sudo apt-get update", block: false)]\
    #text(weight: "regular")[E) #raw("sudo apt-get autoremove", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es la principal característica del comando apt-get dist-upgrade frente al comando upgrade tradicional?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Elimina por completo los repositorios alojados en el archivo sources.list", block: false)]\
    #text(weight: "regular")[B) #raw("Controla inteligentemente cambios en dependencias, resolviendo conflictos y eliminando versiones si es necesario", block: false)]\
    #text(weight: "regular")[C) #raw("Solo actualiza programas visuales del entorno de escritorio de Linux", block: false)]\
    #text(weight: "regular")[D) #raw("Desactiva temporalmente las políticas de seguridad para compilar código fuente", block: false)]\
    #text(weight: "regular")[E) #raw("Comprime y guarda un respaldo de los paquetes obsoletos antes de reemplazarlos", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("Dentro del conjunto de variables de entorno típicas, ¿qué información almacena específicamente la variable SHLVL?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("La dirección IP y máscara de red del host local", block: false)]\
    #text(weight: "regular")[B) #raw("Registra los niveles de shell anidado dentro de la sesión", block: false)]\
    #text(weight: "regular")[C) #raw("El nombre y versión del sistema operativo en ejecución", block: false)]\
    #text(weight: "regular")[D) #raw("El tamaño máximo permitido para un archivo en el disco duro", block: false)]\
    #text(weight: "regular")[E) #raw("La lista de usuarios conectados remotamente al servidor", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál de los siguientes comandos presenta la sintaxis válida para crear un nuevo usuario y añadirlo a un grupo inicial de forma simultánea?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("addgroup {grupo} to {usuario}", block: false)]\
    #text(weight: "regular")[B) #raw("makeuser {usuario} en {grupo}", block: false)]\
    #text(weight: "regular")[C) #raw("adduser -g {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[D) #raw("createuser --group {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[E) #raw("newuser -grp {grupo} {usuario}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("Para que un usuario estándar pueda invocar e instalar herramientas con privilegios de superusuario, ¿qué palabra clave o grupo se le debe anexar en su creación?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("admin", block: false)]\
    #text(weight: "regular")[B) #raw("root", block: false)]\
    #text(weight: "regular")[C) #raw("godmode", block: false)]\
    #text(weight: "regular")[D) #raw("master", block: false)]\
    #text(weight: "regular")[E) #raw("sudo", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("Basándose en el esquema numérico octal para la gestión de ficheros, ¿qué valor representa estrictamente al permiso de escritura (w)?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("2", block: false)]\
    #text(weight: "regular")[B) #raw("1", block: false)]\
    #text(weight: "regular")[C) #raw("4", block: false)]\
    #text(weight: "regular")[D) #raw("5", block: false)]\
    #text(weight: "regular")[E) #raw("7", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué capacidad de acción le otorga a un usuario el valor octal 1 asignado sobre un archivo del sistema Linux?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Autorización para borrar el fichero", block: false)]\
    #text(weight: "regular")[B) #raw("Permiso exclusivo de ejecución (x)", block: false)]\
    #text(weight: "regular")[C) #raw("Permiso exclusivo de lectura (r)", block: false)]\
    #text(weight: "regular")[D) #raw("Derecho para modificar el contenido (w)", block: false)]\
    #text(weight: "regular")[E) #raw("Control total absoluto (rwx)", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("Si se aplica la regla de permisos chmod 755 sobre un directorio, ¿qué privilegios ostenta el bloque asignado al Propietario (Owner) que corresponde al número 7?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Permiso absoluto de solo escritura ciega", block: false)]\
    #text(weight: "regular")[B) #raw("Control total, agrupando lectura, escritura y ejecución (rwx)", block: false)]\
    #text(weight: "regular")[C) #raw("Lectura exclusiva, previniendo alteraciones accidentales", block: false)]\
    #text(weight: "regular")[D) #raw("Solo lectura y ejecución, prohibida la escritura", block: false)]\
    #text(weight: "regular")[E) #raw("Lectura y escritura, careciendo del permiso de ejecución", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("Al aplicar la máscara chmod 755 a un script, ¿qué permisos están recibiendo los bloques correspondientes al Grupo (Group) y Otros (Other), representados por el número 5?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Lectura y ejecución (r-x)", block: false)]\
    #text(weight: "regular")[B) #raw("Solamente escritura (-w-)", block: false)]\
    #text(weight: "regular")[C) #raw("Solamente ejecución (--x)", block: false)]\
    #text(weight: "regular")[D) #raw("Lectura y escritura (rw-)", block: false)]\
    #text(weight: "regular")[E) #raw("Acceso completamente denegado (---)", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es la estructura gramatical o sintaxis básica a utilizar en la terminal para modificar los niveles de acceso de un documento empleando el sistema octal?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("attrib {fichero} {permisos}", block: false)]\
    #text(weight: "regular")[B) #raw("chown {octal} {fichero}", block: false)]\
    #text(weight: "regular")[C) #raw("chmod {permisos} {fichero}", block: false)]\
    #text(weight: "regular")[D) #raw("access {permisos} a {fichero}", block: false)]\
    #text(weight: "regular")[E) #raw("permissions {fichero} {octal}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es el formato correcto para crear un enlace simbólico (Soft Link) desde la terminal de comandos hacia un archivo ya existente?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("create-link {fichero} soft-link.txt", block: false)]\
    #text(weight: "regular")[B) #raw("link {fichero} > soft-link.txt", block: false)]\
    #text(weight: "regular")[C) #raw("ln -s {fichero} soft-link.txt", block: false)]\
    #text(weight: "regular")[D) #raw("shortcut {fichero} to soft-link.txt", block: false)]\
    #text(weight: "regular")[E) #raw("bind -soft {fichero} soft-link.txt", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("Teniendo en cuenta la preservación de dependencias, ¿cuál de los siguientes mandatos se especializa en instalar las versiones más recientes de los programas locales sin eliminar ni un solo paquete del disco?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("sudo apt-get upgrade", block: false)]\
    #text(weight: "regular")[B) #raw("sudo apt-get dist-upgrade", block: false)]\
    #text(weight: "regular")[C) #raw("sudo apt-get soft-upgrade", block: false)]\
    #text(weight: "regular")[D) #raw("sudo apt-get update-all", block: false)]\
    #text(weight: "regular")[E) #raw("sudo apt-get install --new", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("Un administrador decide crear un atajo rápido para listar directorios ocultos usando el texto \"comando\". ¿Cuál es la forma correcta de definirlo?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("set alias comando to 'ls -lah'", block: false)]\
    #text(weight: "regular")[B) #raw("create_alias comando 'ls -lah'", block: false)]\
    #text(weight: "regular")[C) #raw("alias comando = 'ls -lah'", block: false)]\
    #text(weight: "regular")[D) #raw("shortcut comando = ls -lah", block: false)]\
    #text(weight: "regular")[E) #raw("bind comando -> 'ls -lah'", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("Una cuenta de usuario que fue creada temporalmente ya no será requerida en el servidor. ¿Qué comando invoca el administrador para suprimirla de los registros?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("userdel {usuario}", block: false)]\
    #text(weight: "regular")[B) #raw("eraseuser {usuario}", block: false)]\
    #text(weight: "regular")[C) #raw("removeuser {usuario}", block: false)]\
    #text(weight: "regular")[D) #raw("killuser {usuario}", block: false)]\
    #text(weight: "regular")[E) #raw("delete-user {usuario}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué variable de entorno es la encargada de apuntar hacia el archivo o directorio donde se reciben y alojan los mensajes de correo electrónico locales del usuario?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("INBOX", block: false)]\
    #text(weight: "regular")[B) #raw("MESSAGES", block: false)]\
    #text(weight: "regular")[C) #raw("POSTBOX", block: false)]\
    #text(weight: "regular")[D) #raw("SMTP_PATH", block: false)]\
    #text(weight: "regular")[E) #raw("MAIL", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("En el contexto de los vínculos de ficheros en Linux, ¿qué condición estructural caracteriza y define primariamente al comportamiento de un Hard Link?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Genera un ejecutable paralelo que sirve de emulador del programa original", block: false)]\
    #text(weight: "regular")[B) #raw("Consume el doble de Inodos en la tabla de asignación de archivos de la partición", block: false)]\
    #text(weight: "regular")[C) #raw("Es un simple acceso directo que se rompe si el archivo principal cambia de directorio", block: false)]\
    #text(weight: "regular")[D) #raw("Guarda la información en un solo Inodo, por lo que contiene siempre los mismos datos que el original", block: false)]\
    #text(weight: "regular")[E) #raw("Solo puede crearse si ambos archivos están alojados en dispositivos de red diferentes", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Al verificar los privilegios de un archivo plano se observa la secuencia -rw-r--r--. ¿Qué lectura correcta se extrae sobre las facultades concedidas al propietario?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("No goza de ningún permiso, todos sus accesos han sido denegados por seguridad", block: false)]\
    #text(weight: "regular")[B) #raw("Puede modificar el archivo, pero tiene prohibido leer su contenido", block: false)]\
    #text(weight: "regular")[C) #raw("Puede tanto leer como escribir el fichero, pero carece de la potestad de ejecutarlo", block: false)]\
    #text(weight: "regular")[D) #raw("Ostenta únicamente privilegios de ejecución del archivo en segundo plano", block: false)]\
    #text(weight: "regular")[E) #raw("Posee control absoluto sobre lectura, modificación y ejecución del fichero", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("Para eliminar un grupo de usuarios de la organización operativa de Linux sin afectar directamente a las cuentas, ¿qué sintaxis es la aplicable en la terminal?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("groupdel {grupo}", block: false)]\
    #text(weight: "regular")[B) #raw("dropgroup {grupo}", block: false)]\
    #text(weight: "regular")[C) #raw("delgroup {grupo}", block: false)]\
    #text(weight: "regular")[D) #raw("groupremove {grupo}", block: false)]\
    #text(weight: "regular")[E) #raw("erasegrp {grupo}", block: false)]\
  ]
]

#pagebreak(to: "odd")
#set page(
  width: 21.59cm,
  height: 33.02cm,
  margin: 2cm,
  header: none,
  footer: context {
    grid(
      columns: (1fr, auto),
      align: (left, right),
      [
        #raw("OQUENDO CORIA VALERIA YHISSEL", block: false)\
        #text(size: 15pt, weight: "bold")[1112461]
      ],
      [PÁG. #counter(page).display()]
    )
  }
)

#counter(page).update(1)
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
    #text(weight: "bold")[UNIVERSIDAD TECNICA PRIVADA COSMOS]\
    #text(weight: "bold")[GESTION 2-2026]
    #v(-2pt)
    #line(length: 90%, stroke: 0.5pt + black)
    #v(-2.5pt)
    #text(weight: "bold")[EVALUACION TEORICA 1ER PARCIAL]
  ]
)


#v(0.8em)
#table(
  columns: (1fr, 1fr),
  stroke: 0.4pt + black,
  inset: 4pt,
  [NOMBRE: #raw("OQUENDO CORIA VALERIA YHISSEL", block: false)], [CARRERA: #raw("LICENCIATURA EN INGENIERÍA DE SISTEMAS", block: false)],
  [MATERIA: #raw("ÁLGEBRA LINEAL", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("2", block: false)],
  [DOCENTE: #raw("XIMENA WENDY CALIZAYA PEREZ", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("03/09/2026", block: false)], [HORA: #raw("08:15 - 09:45", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1112461", block: false)]],
)
#v(0.8em)

#v(0.8em)
#align(center)[
  #text(weight: "bold")[CUESTIONARIO DE PREGUNTAS (30)]
]

#v(0.8em)
#line(length: 100%, stroke: 0.75pt + black)
#v(0.8em)

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("VERDADERO O FALSO SIMPLE", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Marque la respuesta correcta.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("El comando sudo apt-get update se utiliza para re-sincronizar los índices de paquetes desde las fuentes listadas en /etc/apt/sources.list.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("El comando sudo apt-get upgrade instala nuevas versiones pero, bajo algunas circunstancias, elimina paquetes y dependencias antiguas del sistema.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("El comando sudo apt-get remove desinstala el paquete solicitado, pero mantiene intactos los archivos de configuración por si se reinstala en el futuro.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[4. #raw("___", block: false)]] #h(0.25em)#raw("El comando alias permite crear atajos para comandos o grupos de comandos, facilitando el trabajo en la shell.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("El comando userdel sirve de forma exclusiva para modificar los privilegios y los detalles de un usuario previamente creado.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("En el esquema de formato numérico octal para otorgar permisos en Linux, el valor 4 representa el permiso de lectura (r).", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("El comando chown se utiliza en el sistema para modificar y asignar un nuevo propietario a un fichero o directorio.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("Un enlace físico (Hard Link) guarda toda la información en un solo Inodo, de manera que cada archivo enlazado contiene siempre lo mismo.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("En la administración de usuarios y grupos, el comando groupdel se emplea específicamente para agregar un usuario a un grupo secundario.", block: false)\
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("EMPAREJAMIENTO AMPLIADO", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: De la lista de opciones, seleccione la respuesta correcta", block: false)]\
#text(weight: "regular")[#raw("para cada enunciado.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#rect(width: 100%, stroke: 0.5pt + black, fill: rgb("#f8fafc"), inset: 3.5pt)[
  #text(weight: "regular")[#raw("Empareje cada variable de entorno de Linux, o comando relacionado con su gestión, con la definición técnica que representa su funcionamiento dentro de la consola del sistema operativo.", block: false)]\
  #text(weight: "regular")[#raw("A) export", block: false)]\
  #text(weight: "regular")[#raw("B) alias", block: false)]\
  #text(weight: "regular")[#raw("C) LANG", block: false)]\
  #text(weight: "regular")[#raw("D) HOME", block: false)]\
  #text(weight: "regular")[#raw("E) PATH", block: false)]
]
#v(1em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("Variable de entorno global que contiene las rutas de los directorios donde la shell buscará los programas ejecutables al momento en que el usuario digita un mandato sin ruta absoluta.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("Parámetro nativo que almacena y señala invariablemente hacia el directorio personal (home) asociado a la cuenta del usuario local que ha iniciado la sesión.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("Entorno de variable destinado de forma exclusiva a albergar los metadatos referentes a la codificación de caracteres y el idioma local utilizado por el sistema operativo.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("Instrucción propia de la línea de comandos utilizada para instanciar, crear y heredar una nueva variable al entorno general asignándole un valor determinado.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("Funcionalidad estructural de la shell empleada para crear un atajo verbal directo a un comando largo o a una concatenación compleja de instrucciones para facilitar el flujo de trabajo.", block: false)\
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("SELECCIÓN DE LA MEJOR RESPUESTA", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué ocurre exactamente con los archivos de configuración cuando se desinstala un paquete utilizando el comando apt-get purge?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Se mantienen intactos en su directorio original para futuras instalaciones", block: false)]\
    #text(weight: "regular")[B) #raw("Se migran al directorio home del superusuario root para respaldo", block: false)]\
    #text(weight: "regular")[C) #raw("Se envían a la papelera de reciclaje temporal de la terminal", block: false)]\
    #text(weight: "regular")[D) #raw("Se eliminan por completo de manera adicional al paquete de software desinstalado", block: false)]\
    #text(weight: "regular")[E) #raw("Se encriptan y se bloquea su acceso al usuario propietario", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("¿Para qué sirve específicamente el comando sudo apt-get autoremove en la gestión del software de Linux?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Para remover paquetes instalados como dependencias de otros paquetes que ya no son necesarios", block: false)]\
    #text(weight: "regular")[B) #raw("Para formatear completamente el disco duro del servidor", block: false)]\
    #text(weight: "regular")[C) #raw("Para desinstalar el entorno gráfico y dejar el sistema solo en modo texto", block: false)]\
    #text(weight: "regular")[D) #raw("Para actualizar las variables de entorno del sistema automáticamente", block: false)]\
    #text(weight: "regular")[E) #raw("Para eliminar cuentas de usuarios que no se han logueado en meses", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es la sintaxis o comando correcto para visualizar en pantalla el contenido que almacena una variable de entorno como HOME?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("display <HOME>", block: false)]\
    #text(weight: "regular")[B) #raw("echo '{HOME}", block: false)]\
    #text(weight: "regular")[C) #raw("print {HOME}", block: false)]\
    #text(weight: "regular")[D) #raw("read (HOME)", block: false)]\
    #text(weight: "regular")[E) #raw("show [HOME]", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("Dentro del conjunto de variables de entorno típicas, ¿qué información almacena específicamente la variable SHLVL?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Registra los niveles de shell anidado dentro de la sesión", block: false)]\
    #text(weight: "regular")[B) #raw("El nombre y versión del sistema operativo en ejecución", block: false)]\
    #text(weight: "regular")[C) #raw("La lista de usuarios conectados remotamente al servidor", block: false)]\
    #text(weight: "regular")[D) #raw("El tamaño máximo permitido para un archivo en el disco duro", block: false)]\
    #text(weight: "regular")[E) #raw("La dirección IP y máscara de red del host local", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué variable de entorno debes consultar para conocer el idioma local configurado y utilizado en el entorno Linux?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("DIALECT", block: false)]\
    #text(weight: "regular")[B) #raw("LANG", block: false)]\
    #text(weight: "regular")[C) #raw("TEXT", block: false)]\
    #text(weight: "regular")[D) #raw("REGION", block: false)]\
    #text(weight: "regular")[E) #raw("LOCALE", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál de los siguientes comandos presenta la sintaxis válida para crear un nuevo usuario y añadirlo a un grupo inicial de forma simultánea?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("createuser --group {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[B) #raw("addgroup {grupo} to {usuario}", block: false)]\
    #text(weight: "regular")[C) #raw("adduser -g {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[D) #raw("makeuser {usuario} en {grupo}", block: false)]\
    #text(weight: "regular")[E) #raw("newuser -grp {grupo} {usuario}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué comando de administración es el indicado para editar los detalles de un usuario existente, como por ejemplo asignarle un nuevo grupo secundario?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("modifyuser -grp {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[B) #raw("useredit --assign {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[C) #raw("changeusr {usuario} {grupo}", block: false)]\
    #text(weight: "regular")[D) #raw("chown -g {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[E) #raw("usermod -G {grupo} {usuario}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("Para que un usuario estándar pueda invocar e instalar herramientas con privilegios de superusuario, ¿qué palabra clave o grupo se le debe anexar en su creación?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("godmode", block: false)]\
    #text(weight: "regular")[B) #raw("admin", block: false)]\
    #text(weight: "regular")[C) #raw("root", block: false)]\
    #text(weight: "regular")[D) #raw("sudo", block: false)]\
    #text(weight: "regular")[E) #raw("master", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("Si se aplica la regla de permisos chmod 755 sobre un directorio, ¿qué privilegios ostenta el bloque asignado al Propietario (Owner) que corresponde al número 7?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Lectura y escritura, careciendo del permiso de ejecución", block: false)]\
    #text(weight: "regular")[B) #raw("Lectura exclusiva, previniendo alteraciones accidentales", block: false)]\
    #text(weight: "regular")[C) #raw("Permiso absoluto de solo escritura ciega", block: false)]\
    #text(weight: "regular")[D) #raw("Control total, agrupando lectura, escritura y ejecución (rwx)", block: false)]\
    #text(weight: "regular")[E) #raw("Solo lectura y ejecución, prohibida la escritura", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("Al aplicar la máscara chmod 755 a un script, ¿qué permisos están recibiendo los bloques correspondientes al Grupo (Group) y Otros (Other), representados por el número 5?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Lectura y escritura (rw-)", block: false)]\
    #text(weight: "regular")[B) #raw("Lectura y ejecución (r-x)", block: false)]\
    #text(weight: "regular")[C) #raw("Solamente escritura (-w-)", block: false)]\
    #text(weight: "regular")[D) #raw("Acceso completamente denegado (---)", block: false)]\
    #text(weight: "regular")[E) #raw("Solamente ejecución (--x)", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es la estructura gramatical o sintaxis básica a utilizar en la terminal para modificar los niveles de acceso de un documento empleando el sistema octal?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("chmod {permisos} {fichero}", block: false)]\
    #text(weight: "regular")[B) #raw("access {permisos} a {fichero}", block: false)]\
    #text(weight: "regular")[C) #raw("chown {octal} {fichero}", block: false)]\
    #text(weight: "regular")[D) #raw("attrib {fichero} {permisos}", block: false)]\
    #text(weight: "regular")[E) #raw("permissions {fichero} {octal}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es la instrucción adecuada para desplegar la instalación simultánea de varias herramientas de software como por ejemplo tres paquetes en una sola línea?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("sudo apt-get install {paquete1} {paquete2} {paquete3}", block: false)]\
    #text(weight: "regular")[B) #raw("apt-get fetch {paquete1} {paquete2} {paquete3}", block: false)]\
    #text(weight: "regular")[C) #raw("sudo get-apt {paquete1} & {paquete2} & {paquete3}", block: false)]\
    #text(weight: "regular")[D) #raw("sudo apt installall {paquete1,paquete2,paquete3}", block: false)]\
    #text(weight: "regular")[E) #raw("sudo apt-get add {paquete1} + {paquete2} + {paquete3}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("Teniendo en cuenta la preservación de dependencias, ¿cuál de los siguientes mandatos se especializa en instalar las versiones más recientes de los programas locales sin eliminar ni un solo paquete del disco?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("sudo apt-get soft-upgrade", block: false)]\
    #text(weight: "regular")[B) #raw("sudo apt-get update-all", block: false)]\
    #text(weight: "regular")[C) #raw("sudo apt-get install --new", block: false)]\
    #text(weight: "regular")[D) #raw("sudo apt-get upgrade", block: false)]\
    #text(weight: "regular")[E) #raw("sudo apt-get dist-upgrade", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("¿En qué directorio o archivo del núcleo del sistema se albergan los enlaces fuente desde los cuales la herramienta apt-get actualiza los índices de repositorios locales?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("/home/root/repositories.txt", block: false)]\
    #text(weight: "regular")[B) #raw("/usr/bin/apt-get.exe", block: false)]\
    #text(weight: "regular")[C) #raw("/etc/apt/sources.list", block: false)]\
    #text(weight: "regular")[D) #raw("/var/log/apt/history.log", block: false)]\
    #text(weight: "regular")[E) #raw("/boot/grub/sources.conf", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Para eliminar un grupo de usuarios de la organización operativa de Linux sin afectar directamente a las cuentas, ¿qué sintaxis es la aplicable en la terminal?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("groupremove {grupo}", block: false)]\
    #text(weight: "regular")[B) #raw("groupdel {grupo}", block: false)]\
    #text(weight: "regular")[C) #raw("delgroup {grupo}", block: false)]\
    #text(weight: "regular")[D) #raw("erasegrp {grupo}", block: false)]\
    #text(weight: "regular")[E) #raw("dropgroup {grupo}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("Dentro del mapa de variables declaradas activas por el sistema en una sesión regular de Linux, ¿qué define el contenido albergado bajo la variable USER?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("El registro de todas las contraseñas encriptadas del sistema de archivos", block: false)]\
    #text(weight: "regular")[B) #raw("El listado histórico de comandos invocados previamente en la consola", block: false)]\
    #text(weight: "regular")[C) #raw("La dirección física del directorio home del usuario principal (root)", block: false)]\
    #text(weight: "regular")[D) #raw("El nombre de la cuenta de usuario que se encuentra actualmente en uso", block: false)]\
    #text(weight: "regular")[E) #raw("El identificador de red MAC del equipo que está operando remotamente", block: false)]\
  ]
]

#pagebreak(to: "odd")
#set page(
  width: 21.59cm,
  height: 33.02cm,
  margin: 2cm,
  header: none,
  footer: context {
    grid(
      columns: (1fr, auto),
      align: (left, right),
      [
        #raw("SILES AGREDA MICAELA", block: false)\
        #text(size: 15pt, weight: "bold")[1112651]
      ],
      [PÁG. #counter(page).display()]
    )
  }
)

#counter(page).update(1)
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
    #text(weight: "bold")[UNIVERSIDAD TECNICA PRIVADA COSMOS]\
    #text(weight: "bold")[GESTION 2-2026]
    #v(-2pt)
    #line(length: 90%, stroke: 0.5pt + black)
    #v(-2.5pt)
    #text(weight: "bold")[EVALUACION TEORICA 1ER PARCIAL]
  ]
)


#v(0.8em)
#table(
  columns: (1fr, 1fr),
  stroke: 0.4pt + black,
  inset: 4pt,
  [NOMBRE: #raw("SILES AGREDA MICAELA", block: false)], [CARRERA: #raw("LICENCIATURA EN INGENIERÍA DE SISTEMAS", block: false)],
  [MATERIA: #raw("ÁLGEBRA LINEAL", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("2", block: false)],
  [DOCENTE: #raw("XIMENA WENDY CALIZAYA PEREZ", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("03/09/2026", block: false)], [HORA: #raw("08:15 - 09:45", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1112651", block: false)]],
)
#v(0.8em)

#v(0.8em)
#align(center)[
  #text(weight: "bold")[CUESTIONARIO DE PREGUNTAS (30)]
]

#v(0.8em)
#line(length: 100%, stroke: 0.75pt + black)
#v(0.8em)

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("SELECCIÓN DE LA MEJOR RESPUESTA", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es la principal característica del comando apt-get dist-upgrade frente al comando upgrade tradicional?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Desactiva temporalmente las políticas de seguridad para compilar código fuente", block: false)]\
    #text(weight: "regular")[B) #raw("Elimina por completo los repositorios alojados en el archivo sources.list", block: false)]\
    #text(weight: "regular")[C) #raw("Controla inteligentemente cambios en dependencias, resolviendo conflictos y eliminando versiones si es necesario", block: false)]\
    #text(weight: "regular")[D) #raw("Comprime y guarda un respaldo de los paquetes obsoletos antes de reemplazarlos", block: false)]\
    #text(weight: "regular")[E) #raw("Solo actualiza programas visuales del entorno de escritorio de Linux", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es la sintaxis o comando correcto para visualizar en pantalla el contenido que almacena una variable de entorno como HOME?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("display <HOME>", block: false)]\
    #text(weight: "regular")[B) #raw("show [HOME]", block: false)]\
    #text(weight: "regular")[C) #raw("read (HOME)", block: false)]\
    #text(weight: "regular")[D) #raw("echo '{HOME}", block: false)]\
    #text(weight: "regular")[E) #raw("print {HOME}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué instrucción permite definir, instanciar y asignar un valor a una nueva variable de entorno en la línea de comandos?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("export {VAR}=valor", block: false)]\
    #text(weight: "regular")[B) #raw("set [VAR] to valor", block: false)]\
    #text(weight: "regular")[C) #raw("alias {VAR}=valor", block: false)]\
    #text(weight: "regular")[D) #raw("create {VAR}=valor", block: false)]\
    #text(weight: "regular")[E) #raw("assign (VAR) as valor", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[4. #raw("___", block: false)]] #h(0.25em)#raw("Dentro del conjunto de variables de entorno típicas, ¿qué información almacena específicamente la variable SHLVL?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("El nombre y versión del sistema operativo en ejecución", block: false)]\
    #text(weight: "regular")[B) #raw("La dirección IP y máscara de red del host local", block: false)]\
    #text(weight: "regular")[C) #raw("La lista de usuarios conectados remotamente al servidor", block: false)]\
    #text(weight: "regular")[D) #raw("El tamaño máximo permitido para un archivo en el disco duro", block: false)]\
    #text(weight: "regular")[E) #raw("Registra los niveles de shell anidado dentro de la sesión", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué variable de entorno debes consultar para conocer el idioma local configurado y utilizado en el entorno Linux?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("TEXT", block: false)]\
    #text(weight: "regular")[B) #raw("REGION", block: false)]\
    #text(weight: "regular")[C) #raw("DIALECT", block: false)]\
    #text(weight: "regular")[D) #raw("LOCALE", block: false)]\
    #text(weight: "regular")[E) #raw("LANG", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué comando de administración es el indicado para editar los detalles de un usuario existente, como por ejemplo asignarle un nuevo grupo secundario?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("useredit --assign {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[B) #raw("usermod -G {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[C) #raw("chown -g {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[D) #raw("modifyuser -grp {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[E) #raw("changeusr {usuario} {grupo}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("Para que un usuario estándar pueda invocar e instalar herramientas con privilegios de superusuario, ¿qué palabra clave o grupo se le debe anexar en su creación?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("root", block: false)]\
    #text(weight: "regular")[B) #raw("admin", block: false)]\
    #text(weight: "regular")[C) #raw("sudo", block: false)]\
    #text(weight: "regular")[D) #raw("godmode", block: false)]\
    #text(weight: "regular")[E) #raw("master", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("Basándose en el esquema numérico octal para la gestión de ficheros, ¿qué valor representa estrictamente al permiso de escritura (w)?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("2", block: false)]\
    #text(weight: "regular")[B) #raw("7", block: false)]\
    #text(weight: "regular")[C) #raw("4", block: false)]\
    #text(weight: "regular")[D) #raw("5", block: false)]\
    #text(weight: "regular")[E) #raw("1", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("Si se aplica la regla de permisos chmod 755 sobre un directorio, ¿qué privilegios ostenta el bloque asignado al Propietario (Owner) que corresponde al número 7?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Permiso absoluto de solo escritura ciega", block: false)]\
    #text(weight: "regular")[B) #raw("Lectura exclusiva, previniendo alteraciones accidentales", block: false)]\
    #text(weight: "regular")[C) #raw("Control total, agrupando lectura, escritura y ejecución (rwx)", block: false)]\
    #text(weight: "regular")[D) #raw("Solo lectura y ejecución, prohibida la escritura", block: false)]\
    #text(weight: "regular")[E) #raw("Lectura y escritura, careciendo del permiso de ejecución", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("Al aplicar la máscara chmod 755 a un script, ¿qué permisos están recibiendo los bloques correspondientes al Grupo (Group) y Otros (Other), representados por el número 5?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Acceso completamente denegado (---)", block: false)]\
    #text(weight: "regular")[B) #raw("Solamente ejecución (--x)", block: false)]\
    #text(weight: "regular")[C) #raw("Lectura y ejecución (r-x)", block: false)]\
    #text(weight: "regular")[D) #raw("Lectura y escritura (rw-)", block: false)]\
    #text(weight: "regular")[E) #raw("Solamente escritura (-w-)", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es la estructura gramatical o sintaxis básica a utilizar en la terminal para modificar los niveles de acceso de un documento empleando el sistema octal?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("chown {octal} {fichero}", block: false)]\
    #text(weight: "regular")[B) #raw("chmod {permisos} {fichero}", block: false)]\
    #text(weight: "regular")[C) #raw("attrib {fichero} {permisos}", block: false)]\
    #text(weight: "regular")[D) #raw("access {permisos} a {fichero}", block: false)]\
    #text(weight: "regular")[E) #raw("permissions {fichero} {octal}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("Teniendo en cuenta la preservación de dependencias, ¿cuál de los siguientes mandatos se especializa en instalar las versiones más recientes de los programas locales sin eliminar ni un solo paquete del disco?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("sudo apt-get update-all", block: false)]\
    #text(weight: "regular")[B) #raw("sudo apt-get soft-upgrade", block: false)]\
    #text(weight: "regular")[C) #raw("sudo apt-get upgrade", block: false)]\
    #text(weight: "regular")[D) #raw("sudo apt-get install --new", block: false)]\
    #text(weight: "regular")[E) #raw("sudo apt-get dist-upgrade", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("Un administrador decide crear un atajo rápido para listar directorios ocultos usando el texto \"comando\". ¿Cuál es la forma correcta de definirlo?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("create_alias comando 'ls -lah'", block: false)]\
    #text(weight: "regular")[B) #raw("shortcut comando = ls -lah", block: false)]\
    #text(weight: "regular")[C) #raw("bind comando -> 'ls -lah'", block: false)]\
    #text(weight: "regular")[D) #raw("alias comando = 'ls -lah'", block: false)]\
    #text(weight: "regular")[E) #raw("set alias comando to 'ls -lah'", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("Una cuenta de usuario que fue creada temporalmente ya no será requerida en el servidor. ¿Qué comando invoca el administrador para suprimirla de los registros?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("killuser {usuario}", block: false)]\
    #text(weight: "regular")[B) #raw("eraseuser {usuario}", block: false)]\
    #text(weight: "regular")[C) #raw("removeuser {usuario}", block: false)]\
    #text(weight: "regular")[D) #raw("delete-user {usuario}", block: false)]\
    #text(weight: "regular")[E) #raw("userdel {usuario}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("¿En qué directorio o archivo del núcleo del sistema se albergan los enlaces fuente desde los cuales la herramienta apt-get actualiza los índices de repositorios locales?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("/var/log/apt/history.log", block: false)]\
    #text(weight: "regular")[B) #raw("/home/root/repositories.txt", block: false)]\
    #text(weight: "regular")[C) #raw("/etc/apt/sources.list", block: false)]\
    #text(weight: "regular")[D) #raw("/boot/grub/sources.conf", block: false)]\
    #text(weight: "regular")[E) #raw("/usr/bin/apt-get.exe", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("Dentro del mapa de variables declaradas activas por el sistema en una sesión regular de Linux, ¿qué define el contenido albergado bajo la variable USER?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("El identificador de red MAC del equipo que está operando remotamente", block: false)]\
    #text(weight: "regular")[B) #raw("La dirección física del directorio home del usuario principal (root)", block: false)]\
    #text(weight: "regular")[C) #raw("El nombre de la cuenta de usuario que se encuentra actualmente en uso", block: false)]\
    #text(weight: "regular")[D) #raw("El listado histórico de comandos invocados previamente en la consola", block: false)]\
    #text(weight: "regular")[E) #raw("El registro de todas las contraseñas encriptadas del sistema de archivos", block: false)]\
  ]
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("VERDADERO O FALSO SIMPLE", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Marque la respuesta correcta.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("El comando sudo apt-get update se utiliza para re-sincronizar los índices de paquetes desde las fuentes listadas en /etc/apt/sources.list.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("El comando sudo apt-get upgrade instala nuevas versiones pero, bajo algunas circunstancias, elimina paquetes y dependencias antiguas del sistema.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("La variable de entorno de Linux llamada HOME almacena y direcciona al directorio home del usuario local.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("En Linux, la variable de entorno PATH contiene el nombre del intérprete de comandos o shell actualmente en uso.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("El comando useradd se utiliza en la administración básica del sistema operativo para eliminar cuentas de usuario.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("En el esquema de formato numérico octal para otorgar permisos en Linux, el valor 4 representa el permiso de lectura (r).", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("El comando chown se utiliza en el sistema para modificar y asignar un nuevo propietario a un fichero o directorio.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("Un enlace simbólico (Soft Link) realiza la referencia al archivo enlazado basándose únicamente en el nombre del fichero original.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("En la administración de usuarios y grupos, el comando groupdel se emplea específicamente para agregar un usuario a un grupo secundario.", block: false)\
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("EMPAREJAMIENTO AMPLIADO", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: De la lista de opciones, seleccione la respuesta correcta", block: false)]\
#text(weight: "regular")[#raw("para cada enunciado.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#rect(width: 100%, stroke: 0.5pt + black, fill: rgb("#f8fafc"), inset: 3.5pt)[
  #text(weight: "regular")[#raw("Determine la relación correcta entre los comandos fundamentales de administración de usuarios y la asignación de permisos a nivel de archivos dentro de la jerarquía de Linux.", block: false)]\
  #text(weight: "regular")[#raw("A) Enlace Físico", block: false)]\
  #text(weight: "regular")[#raw("B) Enlace Simbólico", block: false)]\
  #text(weight: "regular")[#raw("C) chown", block: false)]\
  #text(weight: "regular")[#raw("D) chmod", block: false)]\
  #text(weight: "regular")[#raw("E) usermod", block: false)]
]
#v(1em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("Mandato de administración utilizado para modificar las propiedades, detalles y roles de un usuario que ya existe en el sistema, como por ejemplo añadirlo a un grupo secundario.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("Orden empleada en la consola para alterar estructuralmente quién es reconocido como el propietario oficial de un determinado fichero o un directorio.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("Herramienta diseñada para cambiar los privilegios de un archivo sobre su lectura (4), escritura (2) y ejecución (1) haciendo uso de una nomenclatura en formato numérico octal.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Estructura lógica conectada donde los archivos resguardan su información convergiendo en un solo y mismo Inodo, compartiendo la data internamente con su par enlazado de forma idéntica.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("Mecanismo de referencia virtual donde un archivo hace alusión al contenido de otro apoyándose exclusivamente en el nombre o ruta del fichero original (Soft Link).", block: false)\
]

#pagebreak(to: "odd")
#set page(
  width: 21.59cm,
  height: 33.02cm,
  margin: 2cm,
  header: none,
  footer: context {
    grid(
      columns: (1fr, auto),
      align: (left, right),
      [
        #raw("ORTUÑO GUTIERREZ ALEXANDER MAURICIO", block: false)\
        #text(size: 15pt, weight: "bold")[1112745]
      ],
      [PÁG. #counter(page).display()]
    )
  }
)

#counter(page).update(1)
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
    #text(weight: "bold")[UNIVERSIDAD TECNICA PRIVADA COSMOS]\
    #text(weight: "bold")[GESTION 2-2026]
    #v(-2pt)
    #line(length: 90%, stroke: 0.5pt + black)
    #v(-2.5pt)
    #text(weight: "bold")[EVALUACION TEORICA 1ER PARCIAL]
  ]
)


#v(0.8em)
#table(
  columns: (1fr, 1fr),
  stroke: 0.4pt + black,
  inset: 4pt,
  [NOMBRE: #raw("ORTUÑO GUTIERREZ ALEXANDER MAURICIO", block: false)], [CARRERA: #raw("LICENCIATURA EN INGENIERÍA DE SISTEMAS", block: false)],
  [MATERIA: #raw("ÁLGEBRA LINEAL", block: false)], [GRUPO: #raw("TA-01", block: false)    SEMESTRE: #raw("2", block: false)],
  [DOCENTE: #raw("XIMENA WENDY CALIZAYA PEREZ", block: false)], [EXAMEN: #raw("1ER PARCIAL", block: false)],
  [FECHA: #raw("03/09/2026", block: false)], [HORA: #raw("08:15 - 09:45", block: false)],
  [FIRMA DEL ESTUDIANTE: #h(1em)........................................],
  [CODIGO: #text(size: 15pt)[#raw("1112745", block: false)]],
)
#v(0.8em)

#v(0.8em)
#align(center)[
  #text(weight: "bold")[CUESTIONARIO DE PREGUNTAS (30)]
]

#v(0.8em)
#line(length: 100%, stroke: 0.75pt + black)
#v(0.8em)

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("VERDADERO O FALSO SIMPLE", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Marque la respuesta correcta.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[1. #raw("___", block: false)]] #h(0.25em)#raw("El comando sudo apt-get update se utiliza para re-sincronizar los índices de paquetes desde las fuentes listadas en /etc/apt/sources.list.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[2. #raw("___", block: false)]] #h(0.25em)#raw("El comando sudo apt-get upgrade instala nuevas versiones pero, bajo algunas circunstancias, elimina paquetes y dependencias antiguas del sistema.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[3. #raw("___", block: false)]] #h(0.25em)#raw("El comando sudo apt-get install instala el paquete solicitado junto con todas las dependencias necesarias para que pueda ejecutarse de manera correcta.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[4. #raw("___", block: false)]] #h(0.25em)#raw("El comando alias permite crear atajos para comandos o grupos de comandos, facilitando el trabajo en la shell.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[5. #raw("___", block: false)]] #h(0.25em)#raw("El comando useradd se utiliza en la administración básica del sistema operativo para eliminar cuentas de usuario.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[6. #raw("___", block: false)]] #h(0.25em)#raw("El comando userdel sirve de forma exclusiva para modificar los privilegios y los detalles de un usuario previamente creado.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[7. #raw("___", block: false)]] #h(0.25em)#raw("En el esquema de formato numérico octal para otorgar permisos en Linux, el valor 4 representa el permiso de lectura (r).", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[8. #raw("___", block: false)]] #h(0.25em)#raw("Un enlace simbólico (Soft Link) realiza la referencia al archivo enlazado basándose únicamente en el nombre del fichero original.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[9. #raw("___", block: false)]] #h(0.25em)#raw("En la administración de usuarios y grupos, el comando groupdel se emplea específicamente para agregar un usuario a un grupo secundario.", block: false)\
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("SELECCIÓN DE LA MEJOR RESPUESTA", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[10. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es la principal característica del comando apt-get dist-upgrade frente al comando upgrade tradicional?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Solo actualiza programas visuales del entorno de escritorio de Linux", block: false)]\
    #text(weight: "regular")[B) #raw("Controla inteligentemente cambios en dependencias, resolviendo conflictos y eliminando versiones si es necesario", block: false)]\
    #text(weight: "regular")[C) #raw("Comprime y guarda un respaldo de los paquetes obsoletos antes de reemplazarlos", block: false)]\
    #text(weight: "regular")[D) #raw("Elimina por completo los repositorios alojados en el archivo sources.list", block: false)]\
    #text(weight: "regular")[E) #raw("Desactiva temporalmente las políticas de seguridad para compilar código fuente", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[11. #raw("___", block: false)]] #h(0.25em)#raw("¿Para qué sirve específicamente el comando sudo apt-get autoremove en la gestión del software de Linux?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Para actualizar las variables de entorno del sistema automáticamente", block: false)]\
    #text(weight: "regular")[B) #raw("Para formatear completamente el disco duro del servidor", block: false)]\
    #text(weight: "regular")[C) #raw("Para eliminar cuentas de usuarios que no se han logueado en meses", block: false)]\
    #text(weight: "regular")[D) #raw("Para desinstalar el entorno gráfico y dejar el sistema solo en modo texto", block: false)]\
    #text(weight: "regular")[E) #raw("Para remover paquetes instalados como dependencias de otros paquetes que ya no son necesarios", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[12. #raw("___", block: false)]] #h(0.25em)#raw("Dentro del conjunto de variables de entorno típicas, ¿qué información almacena específicamente la variable SHLVL?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("El tamaño máximo permitido para un archivo en el disco duro", block: false)]\
    #text(weight: "regular")[B) #raw("El nombre y versión del sistema operativo en ejecución", block: false)]\
    #text(weight: "regular")[C) #raw("La lista de usuarios conectados remotamente al servidor", block: false)]\
    #text(weight: "regular")[D) #raw("Registra los niveles de shell anidado dentro de la sesión", block: false)]\
    #text(weight: "regular")[E) #raw("La dirección IP y máscara de red del host local", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[13. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué comando de administración es el indicado para editar los detalles de un usuario existente, como por ejemplo asignarle un nuevo grupo secundario?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("chown -g {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[B) #raw("usermod -G {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[C) #raw("useredit --assign {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[D) #raw("modifyuser -grp {grupo} {usuario}", block: false)]\
    #text(weight: "regular")[E) #raw("changeusr {usuario} {grupo}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[14. #raw("___", block: false)]] #h(0.25em)#raw("Para que un usuario estándar pueda invocar e instalar herramientas con privilegios de superusuario, ¿qué palabra clave o grupo se le debe anexar en su creación?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("root", block: false)]\
    #text(weight: "regular")[B) #raw("admin", block: false)]\
    #text(weight: "regular")[C) #raw("master", block: false)]\
    #text(weight: "regular")[D) #raw("sudo", block: false)]\
    #text(weight: "regular")[E) #raw("godmode", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[15. #raw("___", block: false)]] #h(0.25em)#raw("Basándose en el esquema numérico octal para la gestión de ficheros, ¿qué valor representa estrictamente al permiso de escritura (w)?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("2", block: false)]\
    #text(weight: "regular")[B) #raw("7", block: false)]\
    #text(weight: "regular")[C) #raw("1", block: false)]\
    #text(weight: "regular")[D) #raw("5", block: false)]\
    #text(weight: "regular")[E) #raw("4", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[16. #raw("___", block: false)]] #h(0.25em)#raw("Si se aplica la regla de permisos chmod 755 sobre un directorio, ¿qué privilegios ostenta el bloque asignado al Propietario (Owner) que corresponde al número 7?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Solo lectura y ejecución, prohibida la escritura", block: false)]\
    #text(weight: "regular")[B) #raw("Lectura exclusiva, previniendo alteraciones accidentales", block: false)]\
    #text(weight: "regular")[C) #raw("Permiso absoluto de solo escritura ciega", block: false)]\
    #text(weight: "regular")[D) #raw("Control total, agrupando lectura, escritura y ejecución (rwx)", block: false)]\
    #text(weight: "regular")[E) #raw("Lectura y escritura, careciendo del permiso de ejecución", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[17. #raw("___", block: false)]] #h(0.25em)#raw("¿Cuál es la estructura gramatical o sintaxis básica a utilizar en la terminal para modificar los niveles de acceso de un documento empleando el sistema octal?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("attrib {fichero} {permisos}", block: false)]\
    #text(weight: "regular")[B) #raw("permissions {fichero} {octal}", block: false)]\
    #text(weight: "regular")[C) #raw("chmod {permisos} {fichero}", block: false)]\
    #text(weight: "regular")[D) #raw("chown {octal} {fichero}", block: false)]\
    #text(weight: "regular")[E) #raw("access {permisos} a {fichero}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[18. #raw("___", block: false)]] #h(0.25em)#raw("¿Cómo se denomina al bloque lógico interno del sistema Linux que contiene la metadata de un archivo y que es compartido idénticamente cuando se crean enlaces físicos (Hard Links)?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Puntero Simbólico", block: false)]\
    #text(weight: "regular")[B) #raw("Sector de Arranque", block: false)]\
    #text(weight: "regular")[C) #raw("Inodo", block: false)]\
    #text(weight: "regular")[D) #raw("Clúster de Datos", block: false)]\
    #text(weight: "regular")[E) #raw("Directorio Raíz", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[19. #raw("___", block: false)]] #h(0.25em)#raw("Un administrador decide crear un atajo rápido para listar directorios ocultos usando el texto \"comando\". ¿Cuál es la forma correcta de definirlo?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("create_alias comando 'ls -lah'", block: false)]\
    #text(weight: "regular")[B) #raw("shortcut comando = ls -lah", block: false)]\
    #text(weight: "regular")[C) #raw("alias comando = 'ls -lah'", block: false)]\
    #text(weight: "regular")[D) #raw("set alias comando to 'ls -lah'", block: false)]\
    #text(weight: "regular")[E) #raw("bind comando -> 'ls -lah'", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[20. #raw("___", block: false)]] #h(0.25em)#raw("Una cuenta de usuario que fue creada temporalmente ya no será requerida en el servidor. ¿Qué comando invoca el administrador para suprimirla de los registros?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("eraseuser {usuario}", block: false)]\
    #text(weight: "regular")[B) #raw("removeuser {usuario}", block: false)]\
    #text(weight: "regular")[C) #raw("delete-user {usuario}", block: false)]\
    #text(weight: "regular")[D) #raw("killuser {usuario}", block: false)]\
    #text(weight: "regular")[E) #raw("userdel {usuario}", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[21. #raw("___", block: false)]] #h(0.25em)#raw("¿Qué variable de entorno es la encargada de apuntar hacia el archivo o directorio donde se reciben y alojan los mensajes de correo electrónico locales del usuario?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("POSTBOX", block: false)]\
    #text(weight: "regular")[B) #raw("MESSAGES", block: false)]\
    #text(weight: "regular")[C) #raw("INBOX", block: false)]\
    #text(weight: "regular")[D) #raw("MAIL", block: false)]\
    #text(weight: "regular")[E) #raw("SMTP_PATH", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[22. #raw("___", block: false)]] #h(0.25em)#raw("El comando chown permite reestructurar el nivel de pertenencia de un elemento en el disco. ¿Cuál es su cometido técnico fundamental?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Modificar la ubicación geográfica donde se guarda un archivo", block: false)]\
    #text(weight: "regular")[B) #raw("Alterar la extensión y el tipo de codificación de un fichero del sistema", block: false)]\
    #text(weight: "regular")[C) #raw("Cambiar los permisos de ejecución de un programa en texto plano", block: false)]\
    #text(weight: "regular")[D) #raw("Asignar y modificar quién es el propietario legítimo de un fichero o directorio", block: false)]\
    #text(weight: "regular")[E) #raw("Encriptar la información del archivo previniendo el acceso del root", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[23. #raw("___", block: false)]] #h(0.25em)#raw("En el contexto de los vínculos de ficheros en Linux, ¿qué condición estructural caracteriza y define primariamente al comportamiento de un Hard Link?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("Es un simple acceso directo que se rompe si el archivo principal cambia de directorio", block: false)]\
    #text(weight: "regular")[B) #raw("Guarda la información en un solo Inodo, por lo que contiene siempre los mismos datos que el original", block: false)]\
    #text(weight: "regular")[C) #raw("Solo puede crearse si ambos archivos están alojados en dispositivos de red diferentes", block: false)]\
    #text(weight: "regular")[D) #raw("Genera un ejecutable paralelo que sirve de emulador del programa original", block: false)]\
    #text(weight: "regular")[E) #raw("Consume el doble de Inodos en la tabla de asignación de archivos de la partición", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[24. #raw("___", block: false)]] #h(0.25em)#raw("¿En qué directorio o archivo del núcleo del sistema se albergan los enlaces fuente desde los cuales la herramienta apt-get actualiza los índices de repositorios locales?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("/etc/apt/sources.list", block: false)]\
    #text(weight: "regular")[B) #raw("/home/root/repositories.txt", block: false)]\
    #text(weight: "regular")[C) #raw("/var/log/apt/history.log", block: false)]\
    #text(weight: "regular")[D) #raw("/usr/bin/apt-get.exe", block: false)]\
    #text(weight: "regular")[E) #raw("/boot/grub/sources.conf", block: false)]\
  ]
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[25. #raw("___", block: false)]] #h(0.25em)#raw("Dentro del mapa de variables declaradas activas por el sistema en una sesión regular de Linux, ¿qué define el contenido albergado bajo la variable USER?", block: false)\
  #v(0.15em)
  #block(inset: (left: 1em))[
    #text(weight: "regular")[A) #raw("El listado histórico de comandos invocados previamente en la consola", block: false)]\
    #text(weight: "regular")[B) #raw("El identificador de red MAC del equipo que está operando remotamente", block: false)]\
    #text(weight: "regular")[C) #raw("La dirección física del directorio home del usuario principal (root)", block: false)]\
    #text(weight: "regular")[D) #raw("El nombre de la cuenta de usuario que se encuentra actualmente en uso", block: false)]\
    #text(weight: "regular")[E) #raw("El registro de todas las contraseñas encriptadas del sistema de archivos", block: false)]\
  ]
]

#block(breakable: false)[
  #line(length: 100%, stroke: 1.5pt + black)
  #v(0.8em)
  #text(weight: "bold")[#raw("EMPAREJAMIENTO AMPLIADO", block: false)]\
  #text(weight: "regular")[#raw("INSTRUCCIONES: De la lista de opciones, seleccione la respuesta correcta", block: false)]\
#text(weight: "regular")[#raw("para cada enunciado.", block: false)]\
  #v(0.8em)
  #line(length: 100%, stroke: 0.5pt + black)
]
#v(0.8em)

#rect(width: 100%, stroke: 0.5pt + black, fill: rgb("#f8fafc"), inset: 3.5pt)[
  #text(weight: "regular")[#raw("Relacione las siguientes herramientas y parámetros del gestor de paquetes APT (Advanced Packaging Tool) con la función exacta que desempeñan durante el mantenimiento de un sistema Linux.", block: false)]\
  #text(weight: "regular")[#raw("A) apt-get purge", block: false)]\
  #text(weight: "regular")[#raw("B) apt-get dist-upgrade", block: false)]\
  #text(weight: "regular")[#raw("C) apt-get update", block: false)]\
  #text(weight: "regular")[#raw("D) apt-get upgrade", block: false)]\
  #text(weight: "regular")[#raw("E) apt-get autoremove", block: false)]
]
#v(1em)

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[26. #raw("___", block: false)]] #h(0.25em)#raw("Herramienta encargada de re-sincronizar los índices de paquetes leyendo rigurosamente las fuentes especificadas en el archivo sources.list para conocer qué versiones están disponibles.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[27. #raw("___", block: false)]] #h(0.25em)#raw("Comando de instalación que adicionalmente a actualizar, controla de manera inteligente los cambios en las dependencias, capaz de resolver conflictos eliminando versiones obsoletas de ser imperativo.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[28. #raw("___", block: false)]] #h(0.25em)#raw("Instrucción extrema de desinstalación que suprime el paquete de software solicitado y simultáneamente elimina todos los archivos de configuración asociados al mismo.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[29. #raw("___", block: false)]] #h(0.25em)#raw("Utilidad de limpieza automática empleada para remover del disco todos aquellos paquetes que fueron instalados previamente para soportar una dependencia pero que ya no son requeridos por ningún software.", block: false)\
]

#block(breakable: false, spacing: 1.2em)[
  #box[#text(weight: "bold")[30. #raw("___", block: false)]] #h(0.25em)#raw("Proceso de actualización pasivo que instala las versiones nuevas de los paquetes actualmente presentes en el sistema, asegurando estrictamente que bajo ninguna circunstancia se eliminen dependencias previas.", block: false)\
]
