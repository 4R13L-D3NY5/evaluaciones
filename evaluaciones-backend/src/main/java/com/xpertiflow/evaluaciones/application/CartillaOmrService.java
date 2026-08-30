package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.CartillaOmrResponseDto;
import com.xpertiflow.evaluaciones.api.dto.LoteCartillasOmrResponseDto;
import com.xpertiflow.evaluaciones.config.AppProperties;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaEvaluacion;
import com.xpertiflow.evaluaciones.domain.entity.CartillaOmr;
import com.xpertiflow.evaluaciones.domain.entity.LoteCartillasOmr;
import com.xpertiflow.evaluaciones.domain.entity.MapeoEstudianteVariante;
import com.xpertiflow.evaluaciones.domain.entity.RolExamen;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaEvaluacionRepository;
import com.xpertiflow.evaluaciones.domain.repository.CartillaOmrRepository;
import com.xpertiflow.evaluaciones.domain.repository.LoteCartillasOmrRepository;
import com.xpertiflow.evaluaciones.domain.repository.MapeoEstudianteVarianteRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolExamenRepository;
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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CartillaOmrService {

    private final RolExamenRepository rolExamenRepository;
    private final MapeoEstudianteVarianteRepository mapeoRepository;
    private final LoteCartillasOmrRepository loteRepository;
    private final CartillaOmrRepository cartillaRepository;
    private final AuditoriaEvaluacionRepository auditoriaRepository;
    private final CartillaOmrPdfService pdfService;
    private final AppProperties appProperties;

    @Transactional(readOnly = true)
    public Optional<LoteCartillasOmrResponseDto> obtenerUltimo(String rolExamenId) {
        return loteRepository.findFirstByRolExamenIdOrderByGeneradoEnDesc(rolExamenId).map(this::mapearLote);
    }

    @Transactional
    public LoteCartillasOmrResponseDto generar(String rolExamenId, String usuario) {
        RolExamen rol = rolExamenRepository.findById(rolExamenId)
                .orElseThrow(() -> new IllegalArgumentException("Rol de examen no encontrado: " + rolExamenId));
        List<MapeoEstudianteVariante> mapeos = mapeoRepository.findByRolExamenId(rolExamenId).stream()
                .sorted(Comparator.comparing(MapeoEstudianteVariante::getCodigoEstudiante))
                .toList();
        if (mapeos.isEmpty()) {
            throw new IllegalStateException("Primero genere el examen para crear el mapeo oficial de estudiantes.");
        }

        String loteId = "CART-" + UUID.randomUUID();
        String sello = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String nombreArchivo = "CARTILLAS_" + seguro(rol.getMateriaCodigo()) + "_" + seguro(rol.getGrupo()) + "_" + sello + ".pdf";
        Path archivo = Path.of(appProperties.getStorage().getBasePath(), "generados", rolExamenId, "cartillas", nombreArchivo);

        LoteCartillasOmr lote = new LoteCartillasOmr();
        lote.setId(loteId);
        lote.setRolExamen(rol);
        lote.setEstado("GENERADO");
        lote.setTotalCartillas(mapeos.size());
        lote.setArchivoPdfPath(archivo.toString());
        lote.setGeneradoEn(LocalDateTime.now());
        loteRepository.saveAndFlush(lote);

        List<CartillaOmr> cartillas = new java.util.ArrayList<>();
        for (int indice = 0; indice < mapeos.size(); indice++) {
            MapeoEstudianteVariante mapeo = mapeos.get(indice);
            CartillaOmr cartilla = new CartillaOmr();
            cartilla.setLote(lote);
            cartilla.setRolExamenId(rolExamenId);
            cartilla.setNumeroOrden(indice + 1);
            cartilla.setCodigoMateria(rol.getMateriaCodigo());
            cartilla.setGrupo(rol.getGrupo());
            cartilla.setCodigoEstudiante(mapeo.getCodigoEstudiante());
            cartilla.setNombreCompleto(nombreCompleto(mapeo));
            cartilla.setEstado("GENERADA");
            cartillas.add(cartilla);
        }
        List<CartillaOmr> guardadas = cartillaRepository.saveAll(cartillas);
        try {
            pdfService.generar(archivo, rol, guardadas);
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo crear el PDF de cartillas OMR", exception);
        }

        registrarAuditoria(rol, "GENERACION_LOTE_CARTILLAS_OMR", usuario, mapeos.size(), loteId);
        return mapearLote(lote);
    }

    @Transactional
    public LoteCartillasOmrResponseDto marcarImpreso(String rolExamenId, String loteId, String usuario) {
        LoteCartillasOmr lote = loteRepository.findById(loteId)
                .filter(encontrado -> encontrado.getRolExamen().getId().equals(rolExamenId))
                .orElseThrow(() -> new IllegalArgumentException("Lote de cartillas no encontrado."));
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

    private String seguro(String valor) {
        return valor == null ? "SIN_DATO" : valor.replaceAll("[^A-Za-z0-9_-]", "_");
    }
}
