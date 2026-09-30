package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.CartillaOmrResponseDto;
import com.xpertiflow.evaluaciones.api.dto.DatosCartillaOmrDto;
import com.xpertiflow.evaluaciones.api.dto.LoteCartillasOmrResponseDto;
import com.xpertiflow.evaluaciones.api.dto.PreparacionCartillasOmrResponseDto;
import com.xpertiflow.evaluaciones.api.dto.SincronizacionNominaResponseDto;
import com.xpertiflow.evaluaciones.config.AppProperties;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import com.xpertiflow.evaluaciones.domain.entity.CalificacionOmr;
import com.xpertiflow.evaluaciones.domain.entity.CartillaOmr;
import com.xpertiflow.evaluaciones.domain.entity.ExamenVariante;
import com.xpertiflow.evaluaciones.domain.entity.LoteCartillasOmr;
import com.xpertiflow.evaluaciones.domain.entity.MapeoEstudianteVariante;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.CalificacionOmrRepository;
import com.xpertiflow.evaluaciones.domain.repository.CartillaOmrRepository;
import com.xpertiflow.evaluaciones.domain.repository.ExamenVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.LoteCartillasOmrRepository;
import com.xpertiflow.evaluaciones.domain.repository.MapeoEstudianteVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import com.xpertiflow.evaluaciones.api.dto.gateway.StudentItemDto;
import com.xpertiflow.evaluaciones.application.generacion.ExamenIndividualTypstService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartillaOmrService {

    private static final String ACCION_IMPRESION_MARCAS = "IMPRESION_MARCAS_OMR";
    private static final String ACCION_IMPRESION_LISTA = "IMPRESION_LISTA_ESTUDIANTES";

    private static final Set<EstadoFlujo> ESTADOS_PERMITIDOS_MARCAS = Set.of(
            EstadoFlujo.PROGRAMADO,
            EstadoFlujo.VALIDADO,
            EstadoFlujo.GENERADO,
            EstadoFlujo.IMPRESO,
            EstadoFlujo.ENTREGADO,
            EstadoFlujo.DEVUELTO,
            EstadoFlujo.PENDIENTE_NOTAS,
            EstadoFlujo.CALIFICADO,
            EstadoFlujo.CONFIRMADO
    );

    private final RolExamenRepository rolExamenRepository;
    private final MapeoEstudianteVarianteRepository mapeoRepository;
    private final ExamenVarianteRepository varianteRepository;
    private final LoteCartillasOmrRepository loteRepository;
    private final CartillaOmrRepository cartillaRepository;
    private final CalificacionOmrRepository calificacionOmrRepository;
    private final AuditoriaEvaluacionRepository auditoriaRepository;
    private final CartillaOmrPdfService pdfService;
    private final AppProperties appProperties;
    private final UnitepcGatewayClient unitepcGatewayClient;
    private final RolExamenService rolExamenService;
    private final ExamenIndividualTypstService examenIndividualTypstService;

    @Transactional(readOnly = true)
    public Optional<LoteCartillasOmrResponseDto> obtenerUltimo(String rolExamenId) {
        return loteRepository.findFirstByRolExamenIdOrderByGeneradoEnDesc(rolExamenId).map(this::mapearLote);
    }

    @Transactional
    public PreparacionCartillasOmrResponseDto obtenerPreparacion(String rolExamenId) {
        RolExamen rol = rolExamenRepository.findById(rolExamenId)
                .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + rolExamenId));
        validarEstadoParaLista(rol);
        List<DatosEstudiante> estudiantes = obtenerEstudiantesParaMarcas(rolExamenId, rol);
        Optional<AuditoriaEvaluacion> impresion = auditoriaRepository
                .findFirstByRolExamenIdAndAccionOrderByFechaEventoDesc(rolExamenId, ACCION_IMPRESION_MARCAS);
        Optional<AuditoriaEvaluacion> impresionLista = auditoriaRepository
                .findFirstByRolExamenIdAndAccionOrderByFechaEventoDesc(rolExamenId, ACCION_IMPRESION_LISTA);

        Map<String, MapeoEstudianteVariante> mapeosPorCodigo = mapeoRepository.findByRolExamenId(rolExamenId).stream()
                .collect(Collectors.toMap(
                        m -> m.getCodigoEstudiante().trim(),
                        m -> m,
                        (existente, reemplazo) -> existente
                ));

        Map<String, String> pdfPorVariante = varianteRepository.findByRolExamenId(rolExamenId).stream()
                .filter(v -> v.getArchivoPdfPath() != null && !v.getArchivoPdfPath().isBlank())
                .collect(Collectors.toMap(
                        ExamenVariante::getLetraVariante,
                        ExamenVariante::getArchivoPdfPath,
                        (existente, reemplazo) -> existente
                ));

        Map<String, CalificacionOmr> califsPorEstudiante = calificacionOmrRepository
                .findByRolExamenIdOrderByCodigoEstudianteAsc(rolExamenId)
                .stream()
                .collect(Collectors.toMap(
                        c -> c.getCodigoEstudiante().trim(),
                        c -> c,
                        (existente, reemplazo) -> reemplazo
                ));

        String typOficialContenido = cargarContenidoTypstOficial(rolExamenId);

        List<DatosCartillaOmrDto> datos = java.util.stream.IntStream.range(0, estudiantes.size())
                .mapToObj(indice -> {
                    DatosEstudiante estudiante = estudiantes.get(indice);
                    CalificacionOmr calif = califsPorEstudiante.get(estudiante.codigo().trim());
                    String estadoCalif = calif != null ? calif.getEstadoCalificacion() : null;
                    String obs = null;
                    BigDecimal n60 = calif != null ? calif.getNotaSobre60() : null;
                    BigDecimal n100 = calif != null ? calif.getNotaSobre100() : null;
                    if (calif != null && "ANULADO".equalsIgnoreCase(calif.getEstadoCalificacion())) {
                        obs = "ANULADO · 0/60";
                    }

                    MapeoEstudianteVariante mapeo = mapeosPorCodigo.get(estudiante.codigo().trim());
                    String letraVariante = mapeo != null ? mapeo.getLetraVariante() : null;
                    String cuadernilloPdf = mapeo != null ? mapeo.getCuadernilloIndividualPdf() : null;

                    // Si apunta al documento unificado del lote completo, validar si este estudiante está en él
                    if (cuadernilloPdf != null && cuadernilloPdf.contains("_Examenes_Oficiales.pdf")) {
                        if (typOficialContenido == null || !typOficialContenido.contains(estudiante.codigo().trim())) {
                            cuadernilloPdf = null;
                        }
                    }

                    return new DatosCartillaOmrDto(indice + 1, rol.getMateriaCodigo(), rol.getGrupo(),
                            estudiante.codigo(), estudiante.nombreCompleto(), estadoCalif, obs, n60, n100,
                            letraVariante, cuadernilloPdf);
                }).toList();

        return new PreparacionCartillasOmrResponseDto(
                rol.getId(), rol.getCarreraNombre(), rol.getMateriaCodigo(), rol.getGrupo(),
                estudiantes.size(), impresion.isPresent() ? "IMPRESO" : "PENDIENTE",
                impresion.map(AuditoriaEvaluacion::getFechaEvento).orElse(null),
                impresion.map(AuditoriaEvaluacion::getUsuario).orElse(null), datos,
                impresionLista.isPresent() ? "IMPRESO" : "PENDIENTE",
                impresionLista.map(AuditoriaEvaluacion::getFechaEvento).orElse(null),
                impresionLista.map(AuditoriaEvaluacion::getUsuario).orElse(null));
    }

    @Transactional
    public SincronizacionNominaResponseDto sincronizarNomina(String rolExamenId, String usuario) {
        RolExamen rol = rolExamenRepository.findById(rolExamenId)
                .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + rolExamenId));

        String groupIdOficial = resolverGrupoOficialParaMarcas(rol);
        if (groupIdOficial == null || groupIdOficial.isBlank()) {
            throw new IllegalStateException("El rol de examen no tiene un grupo oficial para sincronizar la nómina.");
        }

        List<StudentItemDto> estudiantesGateway;
        try {
            estudiantesGateway = unitepcGatewayClient.getStudentsByGroup(groupIdOficial);
        } catch (RuntimeException exception) {
            throw new IllegalStateException("No se pudo consultar la nómina oficial del grupo desde UNITEPC Gateway.", exception);
        }
        if (estudiantesGateway == null) {
            estudiantesGateway = List.of();
        }

        List<MapeoEstudianteVariante> mapeosActuales = mapeoRepository.findByRolExamenId(rolExamenId);
        List<String> codigosNuevos = new java.util.ArrayList<>();

        if (!mapeosActuales.isEmpty()) {
            Set<String> codigosExistentes = mapeosActuales.stream()
                    .map(m -> m.getCodigoEstudiante().trim())
                    .collect(Collectors.toSet());

            List<StudentItemDto> estudiantesNuevos = estudiantesGateway.stream()
                    .filter(e -> e.getStudentCode() != null && !e.getStudentCode().isBlank())
                    .filter(e -> !codigosExistentes.contains(e.getStudentCode().trim()))
                    .sorted(Comparator.comparing(StudentItemDto::getStudentCode, OrdenEstudiantes.comparadorCodigo()))
                    .toList();

            if (!estudiantesNuevos.isEmpty()) {
                List<ExamenVariante> variantes = varianteRepository.findByRolExamenId(rolExamenId).stream()
                        .sorted(Comparator.comparing(ExamenVariante::getLetraVariante))
                        .toList();

                Map<String, Long> conteoPorLetra = mapeosActuales.stream()
                        .filter(m -> m.getLetraVariante() != null)
                        .collect(Collectors.groupingBy(MapeoEstudianteVariante::getLetraVariante, Collectors.counting()));

                for (StudentItemDto estudianteNuevo : estudiantesNuevos) {
                    String codigo = estudianteNuevo.getStudentCode().trim();
                    String nombre = estudianteNuevo.getFullName() != null ? estudianteNuevo.getFullName().trim() : codigo;
                    codigosNuevos.add(codigo);

                    ExamenVariante varianteAsignada = null;
                    if (!variantes.isEmpty()) {
                        varianteAsignada = variantes.stream()
                                .min(Comparator.comparingLong((ExamenVariante v) -> conteoPorLetra.getOrDefault(v.getLetraVariante(), 0L))
                                        .thenComparing(ExamenVariante::getLetraVariante))
                                .orElse(variantes.get(0));
                    }

                    String letra = varianteAsignada != null ? varianteAsignada.getLetraVariante() : "A";
                    String varianteId = varianteAsignada != null ? varianteAsignada.getId() : String.format("VAR-%s-%s", rolExamenId, letra);
                    String pdfPath = varianteAsignada != null ? varianteAsignada.getArchivoPdfPath() : null;

                    MapeoEstudianteVariante nuevoMapeo = new MapeoEstudianteVariante();
                    nuevoMapeo.setRolExamenId(rolExamenId);
                    nuevoMapeo.setVarianteId(varianteId);
                    nuevoMapeo.setCodigoEstudiante(codigo);
                    nuevoMapeo.setNombres(nombre);
                    nuevoMapeo.setApellidoPaterno("");
                    nuevoMapeo.setApellidoMaterno("");
                    nuevoMapeo.setLetraVariante(letra);
                    nuevoMapeo.setHashControlSeguridad("CTL-" + codigo + "-" + letra);
                    nuevoMapeo.setCuadernilloIndividualPdf(null);
                    nuevoMapeo.setEstadoAsistencia("PRESENTE");
                    mapeoRepository.save(nuevoMapeo);

                    conteoPorLetra.put(letra, conteoPorLetra.getOrDefault(letra, 0L) + 1);
                }

                int totalFinal = mapeosActuales.size() + estudiantesNuevos.size();
                rol.setEstudiantesInscritosCount(totalFinal);
                rolExamenRepository.save(rol);

                String listaCodigosJson = "[" + String.join(",", codigosNuevos.stream().map(c -> "\"" + c + "\"").toList()) + "]";
                registrarAuditoriaDetalles(rol, "SINCRONIZACION_NOMINA_TOMA_GRUPOS", usuario,
                        "{\"totalPrevio\":" + mapeosActuales.size() + ",\"totalNuevo\":" + totalFinal + ",\"nuevosEstudiantes\":" + listaCodigosJson + "}");
            }
        } else {
            int totalPrevio = rol.getEstudiantesInscritosCount();
            int totalNuevo = estudiantesGateway.size();
            if (totalPrevio != totalNuevo) {
                rol.setEstudiantesInscritosCount(totalNuevo);
                rolExamenRepository.save(rol);
                registrarAuditoriaDetalles(rol, "SINCRONIZACION_NOMINA_TOMA_GRUPOS", usuario,
                        "{\"totalPrevio\":" + totalPrevio + ",\"totalNuevo\":" + totalNuevo + "}");
            }
        }

        PreparacionCartillasOmrResponseDto preparacion = obtenerPreparacion(rolExamenId);
        String mensaje;
        if (codigosNuevos.isEmpty()) {
            mensaje = "La nómina oficial ya se encuentra sincronizada con el Gateway institucional.";
        } else {
            mensaje = String.format("Se sincronizaron %d nuevo(s) estudiante(s) inscrito(s) por toma de grupos tardía: %s",
                    codigosNuevos.size(), String.join(", ", codigosNuevos));
        }

        return new SincronizacionNominaResponseDto(
                rolExamenId,
                preparacion.totalCartillas(),
                codigosNuevos.size(),
                codigosNuevos,
                mensaje,
                preparacion
        );
    }

    @Transactional
    public byte[] generarPdfTemporal(String rolExamenId) {
        RolExamen rol = rolExamenRepository.findById(rolExamenId)
                .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + rolExamenId));
        validarEstadoParaMarcas(rol);
        List<CartillaOmr> cartillas = construirCartillas(rolExamenId, rol);
        try {
            return pdfService.generarBytes(rol, cartillas);
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo generar la sobreimpresión temporal de datos OMR", exception);
        }
    }

    @Transactional
    public byte[] generarListaPdfTemporal(String rolExamenId) {
        RolExamen rol = rolExamenRepository.findById(rolExamenId)
                .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + rolExamenId));
        validarEstadoParaLista(rol);
        List<CartillaOmr> cartillas = construirCartillas(rolExamenId, rol);
        try {
            return pdfService.generarListaBytes(rol, cartillas);
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo generar la lista de estudiantes", exception);
        }
    }

    @Transactional
    public PreparacionCartillasOmrResponseDto marcarImpresion(String rolExamenId, String usuario) {
        RolExamen rol = rolExamenRepository.findById(rolExamenId)
                .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + rolExamenId));
        validarEstadoParaMarcas(rol);
        List<DatosEstudiante> estudiantes = obtenerEstudiantesParaMarcas(rolExamenId, rol);
        registrarAuditoria(rol, ACCION_IMPRESION_MARCAS, usuario, estudiantes.size(), null);
        return obtenerPreparacion(rolExamenId);
    }

    @Transactional
    public PreparacionCartillasOmrResponseDto marcarListaImpresion(String rolExamenId, String usuario) {
        RolExamen rol = rolExamenRepository.findById(rolExamenId)
                .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + rolExamenId));
        validarEstadoParaLista(rol);
        List<DatosEstudiante> estudiantes = obtenerEstudiantesParaMarcas(rolExamenId, rol);
        registrarAuditoria(rol, ACCION_IMPRESION_LISTA, usuario, estudiantes.size(), null);
        return obtenerPreparacion(rolExamenId);
    }

    @Transactional
    public LoteCartillasOmrResponseDto generar(String rolExamenId, String usuario) {
        RolExamen rol = rolExamenRepository.findById(rolExamenId)
                .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + rolExamenId));
        validarEstadoParaMarcas(rol);
        List<DatosEstudiante> estudiantes = obtenerEstudiantesParaMarcas(rolExamenId, rol);

        String loteId = "CART-" + UUID.randomUUID();
        String sello = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String nombreArchivo = "CARTILLAS_" + seguro(rol.getMateriaCodigo()) + "_" + seguro(rol.getGrupo()) + "_" + sello + ".pdf";
        Path archivo = Path.of(appProperties.getStorage().getBasePath(), "generados", rolExamenId, "cartillas", nombreArchivo);

        LoteCartillasOmr lote = new LoteCartillasOmr();
        lote.setId(loteId);
        lote.setRolExamen(rol);
        lote.setEstado("GENERADO");
        lote.setTotalCartillas(estudiantes.size());
        lote.setArchivoPdfPath(archivo.toString());
        lote.setGeneradoEn(LocalDateTime.now());
        loteRepository.saveAndFlush(lote);

        List<CartillaOmr> cartillas = new java.util.ArrayList<>();
        for (int indice = 0; indice < estudiantes.size(); indice++) {
            DatosEstudiante estudiante = estudiantes.get(indice);
            CartillaOmr cartilla = new CartillaOmr();
            cartilla.setLote(lote);
            cartilla.setRolExamenId(rolExamenId);
            cartilla.setNumeroOrden(indice + 1);
            cartilla.setCodigoMateria(rol.getMateriaCodigo());
            cartilla.setGrupo(rol.getGrupo());
            cartilla.setCodigoEstudiante(estudiante.codigo());
            cartilla.setNombreCompleto(estudiante.nombreCompleto());
            cartilla.setEstado("GENERADA");
            cartillas.add(cartilla);
        }
        List<CartillaOmr> guardadas = cartillaRepository.saveAll(cartillas);
        try {
            pdfService.generar(archivo, rol, guardadas);
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo crear el PDF de cartillas OMR", exception);
        }

        registrarAuditoria(rol, "GENERACION_LOTE_CARTILLAS_OMR", usuario, estudiantes.size(), loteId);
        return mapearLote(lote);
    }

    /**
     * Las marcas solo necesitan los datos de identificación. Antes de que se
     * genere el examen todavía no existe el mapeo estudiante-variante, por lo
     * que se usa directamente la nómina oficial del grupo SEA.
     */
    private List<DatosEstudiante> obtenerEstudiantesParaMarcas(String rolExamenId, RolExamen rol) {
        List<DatosEstudiante> mapeados = mapeoRepository.findByRolExamenId(rolExamenId).stream()
                .sorted(Comparator.comparing(
                        MapeoEstudianteVariante::getCodigoEstudiante,
                        OrdenEstudiantes.comparadorCodigo()))
                .map(mapeo -> new DatosEstudiante(mapeo.getCodigoEstudiante(), nombreCompleto(mapeo)))
                .toList();
        if (!mapeados.isEmpty()) {
            return mapeados;
        }

        String groupIdOficial = resolverGrupoOficialParaMarcas(rol);
        if (groupIdOficial == null || groupIdOficial.isBlank()) {
            throw new IllegalStateException("El rol de examen no tiene un grupo oficial para consultar los estudiantes.");
        }

        List<StudentItemDto> estudiantes;
        try {
            estudiantes = unitepcGatewayClient.getStudentsByGroup(groupIdOficial);
        } catch (RuntimeException exception) {
            throw new IllegalStateException("No se pudo consultar la nómina oficial del grupo.", exception);
        }
        if (estudiantes == null || estudiantes.isEmpty()) {
            throw new IllegalStateException("El grupo no tiene estudiantes oficiales inscritos.");
        }

        return estudiantes.stream().map(estudiante -> {
            if (estudiante.getStudentCode() == null || estudiante.getStudentCode().isBlank()
                    || estudiante.getFullName() == null || estudiante.getFullName().isBlank()) {
                throw new IllegalStateException("La nómina oficial contiene un estudiante sin código o nombre completo.");
            }
            return new DatosEstudiante(estudiante.getStudentCode().trim(), estudiante.getFullName().trim());
        }).sorted(Comparator.comparing(
                DatosEstudiante::codigo,
                OrdenEstudiantes.comparadorCodigo())).toList();
    }

    private List<CartillaOmr> construirCartillas(String rolExamenId, RolExamen rol) {
        List<DatosEstudiante> estudiantes = obtenerEstudiantesParaMarcas(rolExamenId, rol);
        Map<String, CalificacionOmr> califsPorEstudiante = calificacionOmrRepository
                .findByRolExamenIdOrderByCodigoEstudianteAsc(rolExamenId)
                .stream()
                .collect(java.util.stream.Collectors.toMap(
                        c -> c.getCodigoEstudiante().trim(),
                        c -> c,
                        (existente, reemplazo) -> reemplazo
                ));
        List<CartillaOmr> cartillas = new java.util.ArrayList<>();
        for (int indice = 0; indice < estudiantes.size(); indice++) {
            DatosEstudiante estudiante = estudiantes.get(indice);
            CartillaOmr cartilla = new CartillaOmr();
            cartilla.setNumeroOrden(indice + 1);
            cartilla.setCodigoMateria(rol.getMateriaCodigo());
            cartilla.setGrupo(rol.getGrupo());
            cartilla.setCodigoEstudiante(estudiante.codigo());
            cartilla.setNombreCompleto(estudiante.nombreCompleto());
            CalificacionOmr calif = califsPorEstudiante.get(estudiante.codigo().trim());
            if (calif != null) {
                cartilla.setEstadoCalificacion(calif.getEstadoCalificacion());
                cartilla.setNotaSobre60(calif.getNotaSobre60());
                cartilla.setNotaSobre100(calif.getNotaSobre100());
                if ("ANULADO".equalsIgnoreCase(calif.getEstadoCalificacion())) {
                    cartilla.setObservacion("ANULADO · 0/60");
                }
            }
            cartillas.add(cartilla);
        }
        return cartillas;
    }

    /**
     * El rol puede conservar un groupId antiguo, especialmente cuando existen
     * varios grupos con el mismo código (por ejemplo, TA-01). Las marcas deben
     * usar la misma resolución oficial por asignatura, grupo y docente que la
     * generación del examen. Si el gateway no está disponible, se conserva el
     * groupId ya persistido para que el mensaje de error sea el de la consulta
     * oficial y no uno de selección local.
     */
    private String resolverGrupoOficialParaMarcas(RolExamen rol) {
        String groupIdPersistido = rol.getSeaGroupId();
        String groupIdOficial = null;
        try {
            groupIdOficial = rolExamenService.resolverGrupoOficial(rol);
        } catch (RuntimeException ignored) {
            // Se usa el identificador persistido como respaldo de conectividad.
        }

        if (groupIdOficial == null || groupIdOficial.isBlank()) {
            groupIdOficial = groupIdPersistido;
        }
        if (groupIdOficial != null && !groupIdOficial.equals(rol.getSeaGroupId())) {
            rol.setSeaGroupId(groupIdOficial);
            rolExamenRepository.save(rol);
        }
        return groupIdOficial;
    }

    @Transactional
    public LoteCartillasOmrResponseDto marcarImpreso(String rolExamenId, String loteId, String usuario) {
        LoteCartillasOmr lote = loteRepository.findById(loteId)
                .filter(encontrado -> encontrado.getRolExamen().getId().equals(rolExamenId))
                .orElseThrow(() -> new IllegalArgumentException("Lote de cartillas no encontrado."));
        validarEstadoParaMarcas(lote.getRolExamen());
        LocalDateTime fecha = LocalDateTime.now();
        lote.setEstado("IMPRESO");
        lote.setImpresoEn(fecha);
        lote.setUsuarioImpresion(usuarioValido(usuario));
        List<CartillaOmr> cartillas = cartillaRepository.findByLoteIdOrderByNumeroOrdenAsc(loteId);
        cartillas.forEach(cartilla -> {
            cartilla.setEstado("IMPRESA");
            cartilla.setImpresaEn(fecha);
        });
        cartillaRepository.saveAll(cartillas);
        loteRepository.save(lote);
        registrarAuditoria(lote.getRolExamen(), "CONFIRMACION_IMPRESION_CARTILLAS_OMR", usuario, cartillas.size(), loteId);
        return mapearLote(lote);
    }

    private LoteCartillasOmrResponseDto mapearLote(LoteCartillasOmr lote) {
        List<CartillaOmrResponseDto> cartillas = cartillaRepository.findByLoteIdOrderByNumeroOrdenAsc(lote.getId()).stream()
                .map(cartilla -> new CartillaOmrResponseDto(cartilla.getId(), cartilla.getNumeroOrden(),
                        cartilla.getCodigoMateria(), cartilla.getGrupo(), cartilla.getCodigoEstudiante(),
                        cartilla.getNombreCompleto(), cartilla.getEstado(), cartilla.getImpresaEn()))
                .toList();
        return new LoteCartillasOmrResponseDto(lote.getId(), lote.getRolExamen().getId(), lote.getEstado(),
                lote.getTotalCartillas(), lote.getArchivoPdfPath(), lote.getGeneradoEn(), lote.getImpresoEn(),
                lote.getUsuarioImpresion(), cartillas);
    }

    private void registrarAuditoria(RolExamen rol, String accion, String usuario, int total, String loteId) {
        auditoriaRepository.save(AuditoriaEvaluacion.builder()
                .rolExamen(rol)
                .etapaOrigen(rol.getEstadoFlujo().getValor())
                .etapaDestino(rol.getEstadoFlujo().getValor())
                .accion(accion)
                .usuario(usuarioValido(usuario))
                .ipOrigen("127.0.0.1")
                .detallesJson("{\"loteId\":\"" + loteId + "\",\"totalCartillas\":" + total + "}")
                .build());
    }

    private void registrarAuditoriaDetalles(RolExamen rol, String accion, String usuario, String detallesJson) {
        auditoriaRepository.save(AuditoriaEvaluacion.builder()
                .rolExamen(rol)
                .etapaOrigen(rol.getEstadoFlujo().getValor())
                .etapaDestino(rol.getEstadoFlujo().getValor())
                .accion(accion)
                .usuario(usuarioValido(usuario))
                .ipOrigen("127.0.0.1")
                .detallesJson(detallesJson)
                .build());
    }

    private String nombreCompleto(MapeoEstudianteVariante mapeo) {
        return java.util.stream.Stream.of(mapeo.getNombres(), mapeo.getApellidoPaterno(), mapeo.getApellidoMaterno())
                .filter(valor -> valor != null && !valor.isBlank())
                .collect(Collectors.joining(" "));
    }

    private String usuarioValido(String usuario) {
        return usuario == null || usuario.isBlank() ? "SISTEMA" : usuario.trim();
    }

    private void validarEstadoParaMarcas(RolExamen rol) {
        if (rol.getModalidad() != com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen.PRESENCIAL_CARTILLA) {
            throw new IllegalStateException("Los exámenes sin cartilla no requieren impresión de marcas OMR.");
        }
        if (!ESTADOS_PERMITIDOS_MARCAS.contains(rol.getEstadoFlujo())) {
            throw new IllegalStateException("Las marcas OMR solo pueden generarse antes de entregar el examen. "
                    + "Estado actual: " + rol.getEstadoFlujo().getValor());
        }
    }

    private void validarEstadoParaLista(RolExamen rol) {
        if (rol.getModalidad() == com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen.VIRTUAL) {
            throw new IllegalStateException("La lista de firmas solo corresponde a evaluaciones presenciales.");
        }
        if (!ESTADOS_PERMITIDOS_MARCAS.contains(rol.getEstadoFlujo())) {
            throw new IllegalStateException("La lista de firmas solo puede generarse antes de entregar el examen. "
                    + "Estado actual: " + rol.getEstadoFlujo().getValor());
        }
    }

    @Transactional
    public PreparacionCartillasOmrResponseDto generarExamenEstudiante(String rolExamenId, String codigoEstudiante, String variante, String usuario) {
        examenIndividualTypstService.generarCuadernilloEstudiante(rolExamenId, codigoEstudiante, variante, usuario);
        return obtenerPreparacion(rolExamenId);
    }

    @Transactional
    public PreparacionCartillasOmrResponseDto simularEstudianteRezagado(String rolExamenId, String usuario) {
        RolExamen rol = rolExamenRepository.findById(rolExamenId)
                .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + rolExamenId));

        List<MapeoEstudianteVariante> mapeosActuales = mapeoRepository.findByRolExamenId(rolExamenId);

        long countSimulados = mapeosActuales.stream()
                .filter(m -> m.getCodigoEstudiante() != null && m.getCodigoEstudiante().startsWith("999"))
                .count();
        String nuevoCodigo = String.format("999%04d", countSimulados + 1);
        String nuevoNombre = "QUINTANILLA PRUEBA CARLOS " + (countSimulados + 1);

        List<ExamenVariante> variantes = varianteRepository.findByRolExamenId(rolExamenId).stream()
                .sorted(Comparator.comparing(ExamenVariante::getLetraVariante))
                .toList();

        Map<String, Long> conteoPorLetra = mapeosActuales.stream()
                .filter(m -> m.getLetraVariante() != null)
                .collect(Collectors.groupingBy(MapeoEstudianteVariante::getLetraVariante, Collectors.counting()));

        ExamenVariante varianteAsignada = null;
        if (!variantes.isEmpty()) {
            varianteAsignada = variantes.stream()
                    .min(Comparator.comparingLong((ExamenVariante v) -> conteoPorLetra.getOrDefault(v.getLetraVariante(), 0L))
                            .thenComparing(ExamenVariante::getLetraVariante))
                    .orElse(variantes.get(0));
        }
        String letra = varianteAsignada != null ? varianteAsignada.getLetraVariante() : "A";
        String varianteId = varianteAsignada != null ? varianteAsignada.getId() : String.format("VAR-%s-%s", rolExamenId, letra);

        MapeoEstudianteVariante nuevoMapeo = new MapeoEstudianteVariante();
        nuevoMapeo.setRolExamenId(rolExamenId);
        nuevoMapeo.setVarianteId(varianteId);
        nuevoMapeo.setCodigoEstudiante(nuevoCodigo);
        nuevoMapeo.setNombres(nuevoNombre);
        nuevoMapeo.setApellidoPaterno("");
        nuevoMapeo.setApellidoMaterno("");
        nuevoMapeo.setLetraVariante(letra);
        nuevoMapeo.setHashControlSeguridad("CTL-" + nuevoCodigo + "-" + letra);
        nuevoMapeo.setCuadernilloIndividualPdf(null);
        nuevoMapeo.setEstadoAsistencia("PRESENTE");

        int totalFinal = mapeosActuales.size() + 1;
        mapeoRepository.save(nuevoMapeo);

        rol.setEstudiantesInscritosCount(totalFinal);
        rolExamenRepository.save(rol);

        registrarAuditoriaDetalles(rol, "SIMULACION_ESTUDIANTE_REZAGADO", usuario,
                "{\"codigoSimulado\":\"" + nuevoCodigo + "\",\"nombre\":\"" + nuevoNombre + "\",\"varianteAsignada\":\"" + letra + "\"}");

        return obtenerPreparacion(rolExamenId);
    }

    @Transactional(readOnly = true)
    public List<String> obtenerVariantesDisponibles(String rolExamenId) {
        List<ExamenVariante> variantes = varianteRepository.findByRolExamenId(rolExamenId);
        if (variantes.isEmpty()) {
            return List.of("A");
        }
        return variantes.stream()
                .map(ExamenVariante::getLetraVariante)
                .filter(Objects::nonNull)
                .sorted()
                .distinct()
                .toList();
    }

    private String cargarContenidoTypstOficial(String rolExamenId) {
        try {
            if (appProperties == null || appProperties.getStorage() == null || appProperties.getStorage().getBasePath() == null) {
                return null;
            }
            Path documentosDir = Path.of(appProperties.getStorage().getBasePath(), "generados", rolExamenId, "documentos");
            if (!Files.exists(documentosDir)) {
                return null;
            }
            try (Stream<Path> stream = Files.list(documentosDir)) {
                Path typ = stream.filter(p -> p.getFileName().toString().endsWith(".typ"))
                        .findFirst()
                        .orElse(null);
                if (typ != null && Files.exists(typ)) {
                    return Files.readString(typ, StandardCharsets.UTF_8);
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo leer contenido Typst para verificación en rol {}: {}", rolExamenId, e.getMessage());
        }
        return null;
    }

    private String seguro(String valor) {
        return valor == null ? "SIN_DATO" : valor.replaceAll("[^A-Za-z0-9_-]", "_");
    }

    private record DatosEstudiante(String codigo, String nombreCompleto) {
    }
}
