package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.CartillaOmrResponseDto;
import com.xpertiflow.evaluaciones.api.dto.LoteCartillasOmrResponseDto;
import com.xpertiflow.evaluaciones.config.AppProperties;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import com.xpertiflow.evaluaciones.domain.entity.CartillaOmr;
import com.xpertiflow.evaluaciones.domain.entity.LoteCartillasOmr;
import com.xpertiflow.evaluaciones.domain.entity.MapeoEstudianteVariante;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.CartillaOmrRepository;
import com.xpertiflow.evaluaciones.domain.repository.LoteCartillasOmrRepository;
import com.xpertiflow.evaluaciones.domain.repository.MapeoEstudianteVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import com.xpertiflow.evaluaciones.api.dto.gateway.StudentItemDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartillaOmrService {

    private static final Set<EstadoFlujo> ESTADOS_PERMITIDOS_MARCAS = Set.of(
            EstadoFlujo.PROGRAMADO,
            EstadoFlujo.VALIDADO,
            EstadoFlujo.GENERADO,
            EstadoFlujo.IMPRESO
    );

    private final RolExamenRepository rolExamenRepository;
    private final MapeoEstudianteVarianteRepository mapeoRepository;
    private final LoteCartillasOmrRepository loteRepository;
    private final CartillaOmrRepository cartillaRepository;
    private final AuditoriaEvaluacionRepository auditoriaRepository;
    private final CartillaOmrPdfService pdfService;
    private final AppProperties appProperties;
    private final UnitepcGatewayClient unitepcGatewayClient;
    private final RolExamenService rolExamenService;

    @Transactional(readOnly = true)
    public Optional<LoteCartillasOmrResponseDto> obtenerUltimo(String rolExamenId) {
        return loteRepository.findFirstByRolExamenIdOrderByGeneradoEnDesc(rolExamenId).map(this::mapearLote);
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
                .sorted(Comparator.comparing(MapeoEstudianteVariante::getCodigoEstudiante))
                .map(mapeo -> new DatosEstudiante(mapeo.getCodigoEstudiante(), nombreCompleto(mapeo)))
                .toList();
        if (!mapeados.isEmpty()) {
            return mapeados;
        }

        String groupIdOficial = resolverGrupoOficialParaMarcas(rol);
        if (groupIdOficial == null || groupIdOficial.isBlank()) {
            throw new IllegalStateException("El rol no tiene un grupo oficial para consultar los estudiantes.");
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
        }).sorted(Comparator.comparing(DatosEstudiante::codigo)).toList();
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

    private String nombreCompleto(MapeoEstudianteVariante mapeo) {
        return String.join(" ", List.of(mapeo.getNombres(), mapeo.getApellidoPaterno(), mapeo.getApellidoMaterno()).stream()
                .filter(valor -> valor != null && !valor.isBlank()).toList());
    }

    private String usuarioValido(String usuario) {
        return usuario == null || usuario.isBlank() ? "ADMIN_EVALUACIONES" : usuario.trim();
    }

    private void validarEstadoParaMarcas(RolExamen rol) {
        if (!ESTADOS_PERMITIDOS_MARCAS.contains(rol.getEstadoFlujo())) {
            throw new IllegalStateException("Las marcas OMR solo pueden generarse antes de entregar el examen. "
                    + "Estado actual: " + rol.getEstadoFlujo().getValor());
        }
    }

    private String seguro(String valor) {
        return valor == null ? "SIN_DATO" : valor.replaceAll("[^A-Za-z0-9_-]", "_");
    }

    private record DatosEstudiante(String codigo, String nombreCompleto) {
    }
}
