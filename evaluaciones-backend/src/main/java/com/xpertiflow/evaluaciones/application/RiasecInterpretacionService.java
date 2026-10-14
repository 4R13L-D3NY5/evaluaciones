package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.testvocacional.CarreraSugeridaDto;
import com.xpertiflow.evaluaciones.api.dto.testvocacional.DimensionRiasecDto;
import com.xpertiflow.evaluaciones.api.dto.testvocacional.FacultadAfinidadDto;
import com.xpertiflow.evaluaciones.api.dto.testvocacional.InterpretacionVocacionalDto;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RiasecInterpretacionService {

    public record DefinicionDimension(
            String letra,
            String nombre,
            List<Integer> preguntas,
            String descripcion
    ) {}

    public record DefinicionFacultad(
            String nombre,
            String perfilHolland,
            List<String> letrasPrimarias,
            List<Integer> preguntasClave,
            String enfoque
    ) {}

    public record DefinicionCarrera(
            String facultad,
            String carrera,
            String codigoRiasec,
            List<Integer> preguntasClave,
            String itemsDescripcion,
            String perfilVocacional
    ) {}

    public static final Map<String, DefinicionDimension> DIMENSIONES = new LinkedHashMap<>();
    public static final List<DefinicionFacultad> FACULTADES = new ArrayList<>();
    public static final List<DefinicionCarrera> CARRERAS = new ArrayList<>();

    static {
        // 1. GUÍA DE ÍTEMS POR DIMENSIÓN RIASEC (42 PREGUNTAS)
        DIMENSIONES.put("R", new DefinicionDimension(
                "R", "Realista",
                List.of(1, 7, 14, 21, 22, 30, 32, 37),
                "Práctico, manual, herramientas, mecánica, animales, aire libre, ensamblaje."
        ));
        DIMENSIONES.put("I", new DefinicionDimension(
                "I", "Investigador",
                List.of(2, 11, 18, 26, 33, 39),
                "Científico, analítico, resolución de problemas, lógica, números y matemáticas."
        ));
        DIMENSIONES.put("A", new DefinicionDimension(
                "A", "Artístico",
                List.of(8, 17, 23, 27, 28, 31, 41),
                "Creativo, expresión estética, música, redacción, actuación, dibujo, cultura."
        ));
        DIMENSIONES.put("S", new DefinicionDimension(
                "S", "Social",
                List.of(4, 12, 13, 20, 34, 40),
                "Ayuda al prójimo, sanación/salud, enseñanza, trabajo comunitario y en equipo."
        ));
        DIMENSIONES.put("E", new DefinicionDimension(
                "E", "Emprendedor",
                List.of(5, 10, 16, 19, 29, 36, 42),
                "Liderazgo, persuasión, ventas, toma de riesgos, negocios y discursos."
        ));
        DIMENSIONES.put("C", new DefinicionDimension(
                "C", "Convencional",
                List.of(3, 6, 9, 15, 24, 25, 35, 38),
                "Organización, detalle, normas claras, registros, administración y oficina."
        ));

        // 2. ASOCIACIÓN ENTRE PERFILES RIASEC Y FACULTADES UNITEPC
        FACULTADES.add(new DefinicionFacultad(
                "Facultad de Ciencias de la Salud",
                "S + I (Social + Investigador)",
                List.of("S", "I"),
                List.of(11, 14, 18, 20, 24, 40),
                "Sanar, ayudar a la comunidad, investigación biomédica, bioquímica y cuidado asistencial."
        ));
        FACULTADES.add(new DefinicionFacultad(
                "Facultad de Ciencias de la Tecnología",
                "I + R (Investigador + Realista)",
                List.of("I", "R"),
                List.of(2, 7, 21, 22, 26, 33, 39),
                "Resolución de problemas técnicos, electrónica, diseño de software, física aplicada y sistemas."
        ));
        FACULTADES.add(new DefinicionFacultad(
                "Facultad de Ciencias Económicas, Financieras, Empresariales y Administrativas",
                "E + C (Emprendedor + Convencional)",
                List.of("E", "C"),
                List.of(5, 6, 10, 16, 29, 33, 35, 36, 38),
                "Gestión empresarial, ventas, liderazgo, auditoría, contabilidad estructurada y finanzas."
        ));
        FACULTADES.add(new DefinicionFacultad(
                "Facultad de Ciencias Sociales y Jurídicas",
                "A + S / E (Artístico + Social / Emprendedor)",
                List.of("A", "S", "E"),
                List.of(8, 10, 17, 23, 31, 34, 41, 42),
                "Expresión estética, comunicación humana, oratoria jurídica, defensa, creatividad y medios."
        ));

        // 3. MATRIZ DE CARRERAS UNITEPC VS CÓDIGO RIASEC (24 CARRERAS OFICIALES)
        // Ciencias de la Salud
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias de la Salud", "Medicina", "S - I - R",
                List.of(18, 20, 24, 40),
                "Ciencia, sanar a la gente, atención al detalle, ayudar",
                "Vocación asistencial con rigor científico, diagnóstico y tratamiento."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias de la Salud", "Odontología", "S - R - I",
                List.of(20, 22, 24, 40),
                "Sanar, montar/ensamblar, atención al detalle, ayudar",
                "Destreza manual fina combinada con salud bucal y atención médica."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias de la Salud", "Enfermería", "S - C",
                List.of(4, 13, 20, 40),
                "Trabajo en equipo, ayudar a resolver problemas, sanar, ayudar",
                "Cuidado humano directo, empatía, seguimiento de protocolos clínicos."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias de la Salud", "Medicina Veterinaria y Zootecnia", "R - I - S",
                List.of(14, 18, 20, 37),
                "Cuidar animales, ciencia, sanar, trabajo al aire libre",
                "Interés en bienestar animal, salud pública, zootecnia y entornos rurales/clínicos."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias de la Salud", "Fisioterapia y Kinesiología", "S - R",
                List.of(13, 20, 32, 40),
                "Ayudar a la gente, sanar, persona práctica, vocación de servicio",
                "Rehabilitación física, ergonomía corporal, trabajo corporal directo."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias de la Salud", "Bioquímica y Farmacia", "I - C",
                List.of(11, 18, 24, 26),
                "Hacer experimentos, ciencia, atención al detalle, analizar problemas",
                "Investigación de laboratorio, química biológica, análisis clínico y fármacos."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias de la Salud", "Fonoaudiología", "S - I",
                List.of(12, 13, 20, 40),
                "Enseñar/formar, ayudar con problemas, sanar, ayudar",
                "Terapia del lenguaje, audición, comunicación y rehabilitación vocal."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias de la Salud", "Nutrición y Dietética", "S - I - C",
                List.of(18, 20, 30, 40),
                "Ciencia, sanar, cocinar, ayudar a la gente",
                "Promoción de hábitos alimenticios, planes nutricionales y salud preventiva."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias de la Salud", "Tec. Superior Prótesis Dental", "R - A - C",
                List.of(7, 22, 24, 32),
                "Construir cosas, montar/ensamblar, atención al detalle, práctico",
                "Elaboración artesanal y mecánica de piezas dentales protésicas."
        ));

        // Ciencias de la Tecnología
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias de la Tecnología", "Ingeniería de Sistemas", "I - C - R",
                List.of(2, 21, 26, 33, 39),
                "Rompecabezas, entender cómo funciona, analizar, números/gráficos, matemáticas",
                "Desarrollo de software, arquitecturas de información, algoritmos y bases de datos."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias de la Tecnología", "Ingeniería Electrónica", "R - I",
                List.of(7, 21, 22, 39),
                "Construir cosas, cómo funciona, montar/ensamblar, matemáticas",
                "Circuitos, hardware, automatización, robótica y sistemas electrónicos."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias de la Tecnología", "Ingeniería Biomédica", "I - R - S",
                List.of(18, 20, 21, 22, 39),
                "Ciencia, sanar, cómo funciona, montar/ensamblar, matemáticas",
                "Puente entre ingeniería y medicina: equipos médicos, biotecnología e instrumentación."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias de la Tecnología", "Ingeniería de Sonido", "A - R - I",
                List.of(21, 22, 27),
                "Cómo funcionan las cosas, montar/ensamblar, tocar instrumentos o cantar",
                "Acústica, producción musical, ingeniería de audio, estudios de grabación."
        ));

        // Ciencias Económicas, Financieras, Empresariales y Administrativas
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias Económicas, Financieras, Empresariales y Administrativas", "Administración de Empresas", "E - C - S",
                List.of(5, 19, 29, 36),
                "Ambicioso/metas, asumir responsabilidades, propio negocio, liderar",
                "Gestión estratégica de organizaciones, recursos humanos y planeación."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias Económicas, Financieras, Empresariales y Administrativas", "Contaduría Pública", "C - I",
                List.of(6, 24, 33, 35, 38),
                "Organizar cosas, detalle, números/gráficos, registro de trabajo, oficina",
                "Auditoría, control fiscal, balances contables y normativas financieras."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias Económicas, Financieras, Empresariales y Administrativas", "Economía", "I - C - E",
                List.of(26, 33, 34, 39),
                "Analizar situaciones, números/gráficos, discusiones/debates, matemáticas",
                "Análisis macro/microeconómico, mercados financieros, proyecciones y políticas públicas."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias Económicas, Financieras, Empresariales y Administrativas", "Ingeniería Comercial", "E - C - I",
                List.of(10, 16, 29, 33, 36),
                "Influir/persuadir, vender cosas, negocio propio, números/gráficos, liderar",
                "Estrategia comercial, marketing cuantitativo, ventas corporativas y finanzas."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias Económicas, Financieras, Empresariales y Administrativas", "Contaduría Pública (Complementaria)", "C - I",
                List.of(6, 24, 33, 35, 38),
                "Organizar cosas, detalle, números/gráficos, registro, oficina",
                "Titulación complementaria para técnicos en contabilidad."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias Económicas, Financieras, Empresariales y Administrativas", "Administración de Empresas (Complementaria)", "E - C - S",
                List.of(5, 19, 29, 36),
                "Metas, responsabilidades, negocio propio, liderar",
                "Titulación complementaria para técnicos en gestión administrativa."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias Económicas, Financieras, Empresariales y Administrativas", "Ingeniería Comercial (Complementaria)", "E - C - I",
                List.of(10, 16, 29, 33, 36),
                "Influir/persuadir, vender cosas, negocio propio, números, liderar",
                "Titulación complementaria en ingeniería comercial."
        ));

        // Ciencias Sociales y Jurídicas
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias Sociales y Jurídicas", "Derecho", "E - S - I",
                List.of(10, 34, 42),
                "Influir/persuadir a la gente, discusiones de temas, dar discursos",
                "Litigios, asesoría legal, argumentación jurídica, leyes y justicia social."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias Sociales y Jurídicas", "Comunicación Social", "A - E - S",
                List.of(17, 23, 34, 42),
                "Escritura creativa, persona creativa, debate de temas, dar discursos",
                "Periodismo, creación de contenidos, relaciones públicas y medios de comunicación."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias Sociales y Jurídicas", "Artes y Escultura", "A - R",
                List.of(7, 8, 23, 41),
                "Construir cosas, leer sobre arte, persona creativa, dibujar",
                "Creación plástica, escultura, técnicas visuales y expresión artística visual."
        ));
        CARRERAS.add(new DefinicionCarrera(
                "Facultad de Ciencias Sociales y Jurídicas", "Cinematografía", "A - R - E",
                List.of(8, 17, 23, 31, 36),
                "Arte y música, escritura creativa, persona creativa, actuar, liderar",
                "Dirección audiovisual, producción cinematográfica, fotografía y guionismo."
        ));
    }

    public InterpretacionVocacionalDto interpretar(List<Integer> numerosMarcados) {
        Set<Integer> marcadosSet = new HashSet<>(numerosMarcados == null ? Collections.emptyList() : numerosMarcados);

        // 1. Puntajes por Dimensión RIASEC
        Map<String, DimensionRiasecDto> dimensionesDto = new LinkedHashMap<>();
        for (Map.Entry<String, DefinicionDimension> entry : DIMENSIONES.entrySet()) {
            String letra = entry.getKey();
            DefinicionDimension def = entry.getValue();

            List<Integer> marcadasDim = def.preguntas().stream()
                    .filter(marcadosSet::contains)
                    .sorted()
                    .toList();

            int aciertos = marcadasDim.size();
            int total = def.preguntas().size();
            double pct = total > 0 ? Math.round(((double) aciertos / total) * 1000.0) / 10.0 : 0.0;

            dimensionesDto.put(letra, DimensionRiasecDto.builder()
                    .letra(letra)
                    .nombre(def.nombre())
                    .aciertos(aciertos)
                    .totalPreguntas(total)
                    .porcentaje(pct)
                    .descripcion(def.descripcion())
                    .preguntasMarcadas(marcadasDim)
                    .build());
        }

        // 2. Determinar Código Holland (Top dimensiones)
        List<DimensionRiasecDto> ordenadas = new ArrayList<>(dimensionesDto.values());
        ordenadas.sort((d1, d2) -> {
            int cmp = Double.compare(d2.getPorcentaje(), d1.getPorcentaje());
            if (cmp != 0) return cmp;
            return Integer.compare(d2.getAciertos(), d1.getAciertos());
        });

        String codigoHolland;
        if (marcadosSet.isEmpty() || ordenadas.get(0).getAciertos() == 0) {
            codigoHolland = "Sin respuestas";
        } else {
            List<String> topLetras = ordenadas.stream()
                    .filter(d -> d.getAciertos() > 0)
                    .limit(3)
                    .map(DimensionRiasecDto::getLetra)
                    .toList();
            codigoHolland = String.join(" - ", topLetras);
        }

        // 3. Evaluar Afinidad por Facultades
        List<FacultadAfinidadDto> facultadesAfinidad = new ArrayList<>();
        for (DefinicionFacultad fac : FACULTADES) {
            List<Integer> coincidentes = fac.preguntasClave().stream()
                    .filter(marcadosSet::contains)
                    .sorted()
                    .toList();

            double pctPreguntasClave = fac.preguntasClave().isEmpty() ? 0.0 :
                    ((double) coincidentes.size() / fac.preguntasClave().size()) * 100.0;

            double sumPctDimensiones = 0.0;
            for (String letra : fac.letrasPrimarias()) {
                DimensionRiasecDto d = dimensionesDto.get(letra);
                if (d != null) sumPctDimensiones += d.getPorcentaje();
            }
            double pctDimensiones = fac.letrasPrimarias().isEmpty() ? 0.0 :
                    sumPctDimensiones / fac.letrasPrimarias().size();

            double afinidadFinal = Math.round((0.50 * pctPreguntasClave + 0.50 * pctDimensiones) * 10.0) / 10.0;

            facultadesAfinidad.add(FacultadAfinidadDto.builder()
                    .facultad(fac.nombre())
                    .perfilHolland(fac.perfilHolland())
                    .afinidadPorcentaje(afinidadFinal)
                    .enfoque(fac.enfoque())
                    .preguntasClave(fac.preguntasClave())
                    .preguntasCoincidentes(coincidentes)
                    .build());
        }

        facultadesAfinidad.sort(Comparator.comparingDouble(FacultadAfinidadDto::getAfinidadPorcentaje).reversed());
        String facultadSugerida = marcadosSet.isEmpty() ? "Pendiente" : facultadesAfinidad.get(0).getFacultad();

        // 4. Evaluar Afinidad por Carreras
        List<CarreraSugeridaDto> carrerasSugeridas = new ArrayList<>();
        for (DefinicionCarrera car : CARRERAS) {
            List<Integer> coincidentes = car.preguntasClave().stream()
                    .filter(marcadosSet::contains)
                    .sorted()
                    .toList();

            double pctPreguntasClave = car.preguntasClave().isEmpty() ? 0.0 :
                    ((double) coincidentes.size() / car.preguntasClave().size()) * 100.0;

            // Extraer letras de codigoRiasec (ej. "S - I - R" -> ["S", "I", "R"])
            List<String> letras = Arrays.stream(car.codigoRiasec().split("-"))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .toList();

            double sumaPonderada = 0.0;
            double sumaPesos = 0.0;
            int peso = 3;
            for (String l : letras) {
                DimensionRiasecDto d = dimensionesDto.get(l);
                if (d != null) {
                    sumaPonderada += d.getPorcentaje() * peso;
                    sumaPesos += peso;
                }
                peso = Math.max(1, peso - 1);
            }
            double pctDimensiones = sumaPesos > 0 ? (sumaPonderada / sumaPesos) : 0.0;

            double afinidadFinal = Math.round((0.55 * pctPreguntasClave + 0.45 * pctDimensiones) * 10.0) / 10.0;

            carrerasSugeridas.add(CarreraSugeridaDto.builder()
                    .carrera(car.carrera())
                    .facultad(car.facultad())
                    .codigoRiasec(car.codigoRiasec())
                    .afinidadPorcentaje(afinidadFinal)
                    .perfilVocacional(car.perfilVocacional())
                    .itemsDescripcion(car.itemsDescripcion())
                    .preguntasClave(car.preguntasClave())
                    .preguntasCoincidentes(coincidentes)
                    .build());
        }

        carrerasSugeridas.sort(Comparator.comparingDouble(CarreraSugeridaDto::getAfinidadPorcentaje).reversed());

        return InterpretacionVocacionalDto.builder()
                .codigoHolland(codigoHolland)
                .facultadSugerida(facultadSugerida)
                .dimensiones(dimensionesDto)
                .facultades(facultadesAfinidad)
                .carrerasRecomendadas(carrerasSugeridas)
                .build();
    }
}
