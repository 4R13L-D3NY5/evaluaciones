package com.xpertiflow.evaluaciones.application;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xpertiflow.evaluaciones.api.dto.virtual.*;
import com.xpertiflow.evaluaciones.api.dto.RestablecerRolRequestDto;
import com.xpertiflow.evaluaciones.domain.entity.*;
import com.xpertiflow.evaluaciones.domain.enums.EstadoFlujo;
import com.xpertiflow.evaluaciones.domain.enums.ModalidadExamen;
import com.xpertiflow.evaluaciones.domain.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExamenVirtualService {
    private final SalaExamenVirtualRepository salaRepository;
    private final IntentoExamenVirtualRepository intentoRepository;
    private final RespuestaExamenVirtualRepository respuestaRepository;
    private final EventoExamenVirtualRepository eventoRepository;
    private final RolExamenRepository rolRepository;
    private final ExamenVarianteRepository varianteRepository;
    private final MapeoEstudianteVarianteRepository mapeoRepository;
    private final RolExamenService rolExamenService;
    private final ConfiguracionEvaluacionesService configuracionEvaluacionesService;
    private final ObjectMapper objectMapper;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public SalaVirtualCreadaDto crearSala(SalaVirtualRequestDto request, String usuario) {
        RolExamen rol = rolRepository.findById(request.getRolExamenId())
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado"));
        if (rol.getModalidad() != ModalidadExamen.VIRTUAL) {
            throw new RuntimeException("La sala virtual solo puede crearse para un examen con modalidad VIRTUAL");
        }
        if (rol.getEstadoFlujo() != EstadoFlujo.VALIDADO && rol.getEstadoFlujo() != EstadoFlujo.GENERADO) {
            throw new RuntimeException("El examen virtual debe estar en estado VALIDADO antes de crear la sala");
        }
        if (varianteRepository.findByRolExamenId(request.getRolExamenId()).isEmpty()) {
            throw new RuntimeException("El examen no tiene variantes generadas");
        }
        List<MapeoEstudianteVariante> mapeos = mapeoRepository.findByRolExamenId(request.getRolExamenId());
        if (mapeos.isEmpty()) {
            throw new RuntimeException("El examen no tiene asignaciones oficiales de estudiantes");
        }
        if (!salaRepository.findByRolExamenIdOrderByCreadoEnDesc(request.getRolExamenId()).stream()
                .noneMatch(s -> Set.of("PREPARADA", "ABIERTA", "EN_CURSO", "PAUSADA").contains(s.getEstado()))) {
            throw new RuntimeException("El examen ya tiene una sala virtual activa");
        }

        LocalDateTime ahora = LocalDateTime.now();
        List<SalaVirtualCreadaDto.AccesoGeneradoDto> accesos = new ArrayList<>();
        SalaExamenVirtual sala = new SalaExamenVirtual();
        sala.setId("SALA-VIR-" + UUID.randomUUID());
        sala.setRolExamenId(request.getRolExamenId());
        sala.setCodigoSala(generarCodigoSala());
        sala.setEstado("PREPARADA");
        sala.setDuracionMinutos(Optional.ofNullable(request.getDuracionMinutos()).orElse(45));
        sala.setGraciaIngresoMinutos(Optional.ofNullable(request.getGraciaIngresoMinutos()).orElse(10));
        sala.setPermiteReconexion(Optional.ofNullable(request.getPermiteReconexion()).orElse(true));
        sala.setCreadoPor(usuario == null ? "Sistema" : usuario);
        String tokenGrupo = generarToken();
        sala.setTokenGrupoHash(hashToken(tokenGrupo));
        sala.setTokenGrupoEmitidoEn(ahora);
        salaRepository.save(sala);

        for (MapeoEstudianteVariante mapeo : mapeos) {
            String token = generarToken();
            IntentoExamenVirtual intento = new IntentoExamenVirtual();
            intento.setId("INT-VIR-" + UUID.randomUUID());
            intento.setSalaId(sala.getId());
            intento.setMapeoEstudianteVarianteId(mapeo.getId());
            intento.setCodigoEstudiante(mapeo.getCodigoEstudiante());
            intento.setNombreEstudiante(nombreCompleto(mapeo));
            intento.setVarianteId(mapeo.getVarianteId());
            intento.setEstado("PENDIENTE");
            intento.setTokenHash(hashToken(token));
            intento.setTokenEmitidoEn(ahora);
            intento.setTokenExpiraEn(ahora.plusDays(2));
            intentoRepository.save(intento);
            SalaVirtualCreadaDto.AccesoGeneradoDto acceso = new SalaVirtualCreadaDto.AccesoGeneradoDto();
            acceso.setCodigoEstudiante(mapeo.getCodigoEstudiante());
            acceso.setNombreEstudiante(nombreCompleto(mapeo));
            acceso.setToken(token);
            accesos.add(acceso);
        }
        registrarEvento(sala.getId(), null, "SALA_CREADA", usuario);
        SalaVirtualCreadaDto respuesta = new SalaVirtualCreadaDto();
        respuesta.setSala(construirSala(sala));
        respuesta.setAccesos(accesos);
        respuesta.setTokenGrupo(tokenGrupo);
        return respuesta;
    }

    /** Emite un token común para una sala. Se devuelve en texto plano solo en esta operación. */
    @Transactional
    public TokenGrupoResponseDto emitirTokenGrupo(String salaId, String usuario) {
        SalaExamenVirtual sala = obtenerSala(salaId);
        if (!Set.of("PREPARADA", "ABIERTA", "EN_CURSO", "PAUSADA").contains(sala.getEstado())) {
            throw new RuntimeException("Solo se puede generar un acceso grupal mientras la sala esté disponible");
        }
        String token = generarToken();
        boolean yaExistia = sala.getTokenGrupoHash() != null;
        sala.setTokenGrupoHash(hashToken(token));
        sala.setTokenGrupoEmitidoEn(LocalDateTime.now());
        salaRepository.save(sala);
        registrarEvento(sala.getId(), null, yaExistia ? "TOKEN_GRUPO_REGENERADO" : "TOKEN_GRUPO_EMITIDO", usuario);
        TokenGrupoResponseDto respuesta = new TokenGrupoResponseDto();
        respuesta.setCodigoSala(codigoSalaVisible(sala.getCodigoSala()));
        respuesta.setTokenGrupo(token);
        return respuesta;
    }

    @Transactional
    public SalaVirtualResponseDto abrirSala(String salaId, String usuario) {
        SalaExamenVirtual sala = obtenerSala(salaId);
        if (!"PREPARADA".equals(sala.getEstado())) {
            throw new RuntimeException("Solo se puede abrir una sala PREPARADA");
        }
        sala.setEstado("ABIERTA");
        sala.setPublicadaEn(LocalDateTime.now());
        salaRepository.save(sala);
        registrarEvento(salaId, null, "SALA_ABIERTA", usuario);
        return construirSala(sala);
    }

    @Transactional
    public SalaVirtualResponseDto iniciarSala(String salaId, String usuario) {
        SalaExamenVirtual sala = obtenerSala(salaId);
        if (!"ABIERTA".equals(sala.getEstado())) {
            throw new RuntimeException("Solo se puede iniciar una sala ABIERTA");
        }
        LocalDateTime ahora = LocalDateTime.now();
        int cuentaRegresiva = configuracionEvaluacionesService.obtener()
                .getCuentaRegresivaInicioVirtualSegundos();
        LocalDateTime inicioProgramado = ahora.plusSeconds(Math.max(0, cuentaRegresiva));
        sala.setEstado("EN_CURSO");
        sala.setIniciadaEn(inicioProgramado);
        sala.setTerminaEn(inicioProgramado.plusMinutes(sala.getDuracionMinutos()));
        sala.setIniciadoPor(usuario);
        salaRepository.save(sala);
        for (IntentoExamenVirtual intento : intentoRepository.findBySalaIdOrderByCodigoEstudianteAsc(salaId)) {
            if (Set.of("VALIDADO", "EN_ESPERA").contains(intento.getEstado())) {
                intento.setEstado("EN_ESPERA");
                intento.setInicioEn(null);
                intento.setUltimaActividadEn(ahora);
                intentoRepository.save(intento);
            }
        }
        registrarEvento(salaId, null, "SALA_INICIADA", usuario);
        return construirSala(sala);
    }

    @Transactional
    public SalaVirtualResponseDto cerrarSala(String salaId, String usuario) {
        SalaExamenVirtual sala = obtenerSala(salaId);
        if (!Set.of("EN_CURSO", "PAUSADA").contains(sala.getEstado())) {
            throw new RuntimeException("La sala no está abierta para cierre");
        }
        finalizarSala(sala, usuario, "SALA_CERRADA");
        return construirSala(sala);
    }

    /**
     * Reabre una sala durante una incidencia operativa sin borrar las respuestas
     * que los estudiantes ya hayan guardado.
     */
    @Transactional
    public SalaVirtualResponseDto restablecerSala(String salaId, String usuario, String motivo) {
        SalaExamenVirtual sala = obtenerSala(salaId);
        if (!Set.of("ABIERTA", "EN_CURSO", "PAUSADA", "CERRADA", "CALIFICADA").contains(sala.getEstado())) {
            throw new RuntimeException("La sala todavía no está disponible para restablecer");
        }
        if (motivo == null || motivo.isBlank()) {
            throw new RuntimeException("Indica el motivo del restablecimiento");
        }
        String motivoNormalizado = motivo.trim();

        for (IntentoExamenVirtual intento : intentoRepository.findBySalaIdOrderByCodigoEstudianteAsc(sala.getId())) {
            // El restablecimiento confirmado reabre el examen, pero nunca toca las
            // respuestas guardadas ni los intentos anulados.
            if (!"ANULADO".equals(intento.getEstado())) {
                intento.setEstado("EN_ESPERA");
                intento.setInicioEn(null);
                intento.setEnviadoEn(null);
                intento.setAciertos(null);
                intento.setNotaSobre30(null);
                intento.setNotaSobre100(null);
                intento.setTokenExpiraEn(LocalDateTime.now().plusDays(2));
                intento.setUltimaActividadEn(LocalDateTime.now());
                intentoRepository.save(intento);
            }
        }

        sala.setEstado("ABIERTA");
        sala.setIniciadaEn(null);
        sala.setTerminaEn(null);
        sala.setCerradaEn(null);
        sala.setCerradoPor(null);
        salaRepository.save(sala);

        RolExamen rol = rolRepository.findById(sala.getRolExamenId()).orElse(null);
        if (rol != null && Set.of(
                EstadoFlujo.GENERADO,
                EstadoFlujo.IMPRESO,
                EstadoFlujo.ENTREGADO,
                EstadoFlujo.DEVUELTO,
                EstadoFlujo.REVISADO,
                EstadoFlujo.SUBIDO,
                EstadoFlujo.RECIBIDO
        ).contains(rol.getEstadoFlujo())) {
            rolExamenService.restablecerAValidado(rol.getId(), RestablecerRolRequestDto.builder()
                    .motivo(motivoNormalizado)
                    .usuario(usuario == null ? "Sistema" : usuario)
                    .ipOrigen("127.0.0.1")
                    .build());
        }

        registrarEvento(sala.getId(), null, "SALA_RESTABLECIDA", usuario,
                "{\"motivo\":\"" + escaparJson(motivoNormalizado) + "\"}");
        return construirSala(sala);
    }

    /** Cierra salas vencidas aunque nadie pulse manualmente el botón de cierre. */
    @Scheduled(fixedDelay = 15000)
    @Transactional
    public void cerrarSalasVencidas() {
        LocalDateTime ahora = LocalDateTime.now();
        for (SalaExamenVirtual sala : salaRepository.findByEstadoAndTerminaEnBefore("EN_CURSO", ahora)) {
            finalizarSala(sala, "Sistema", "SALA_CERRADA_POR_TIEMPO");
        }
    }

    private void finalizarSala(SalaExamenVirtual sala, String usuario, String evento) {
        LocalDateTime cierre = sala.getTerminaEn() != null ? sala.getTerminaEn() : LocalDateTime.now();
        for (IntentoExamenVirtual intento : intentoRepository.findBySalaIdOrderByCodigoEstudianteAsc(sala.getId())) {
            if (!Set.of("CALIFICADO", "ENVIADO", "ANULADO").contains(intento.getEstado())) {
                calificar(intento);
                intento.setEstado("CALIFICADO");
                intento.setEnviadoEn(cierre);
                intentoRepository.save(intento);
            }
        }
        sala.setEstado("CERRADA");
        sala.setCerradaEn(LocalDateTime.now());
        sala.setCerradoPor(usuario == null ? "Sistema" : usuario);
        salaRepository.save(sala);
        registrarEvento(sala.getId(), null, evento, usuario);

        RolExamen rol = rolRepository.findById(sala.getRolExamenId()).orElse(null);
        if (rol != null && rol.getModalidad() == ModalidadExamen.VIRTUAL
                && rol.getEstadoFlujo() == EstadoFlujo.VALIDADO) {
            rolExamenService.transicionarEstado(rol.getId(), com.xpertiflow.evaluaciones.api.dto.TransicionEstadoRequestDto.builder()
                    .nuevoEstado(EstadoFlujo.REVISADO)
                    .usuario(usuario == null ? "Sistema" : usuario)
                    .ipOrigen("127.0.0.1")
                    .build());
        }
    }

    @Transactional(readOnly = true)
    public SalaVirtualResponseDto consultarSala(String salaId) {
        return construirSala(obtenerSala(salaId));
    }

    @Transactional(readOnly = true)
    public Optional<SalaVirtualResponseDto> consultarUltimaSalaPorRol(String rolExamenId) {
        rolRepository.findById(rolExamenId)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado"));
        return salaRepository.findByRolExamenIdOrderByCreadoEnDesc(rolExamenId)
                .stream()
                .findFirst()
                .map(this::construirSala);
    }

    @Transactional(readOnly = true)
    public List<ResultadoVirtualDto> consultarResultados(String rolExamenId) {
        rolRepository.findById(rolExamenId)
                .orElseThrow(() -> new RuntimeException("Rol de examen no encontrado"));
        SalaExamenVirtual sala = salaRepository.findByRolExamenIdOrderByCreadoEnDesc(rolExamenId).stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("El examen aún no tiene una sala virtual creada"));

        List<ResultadoVirtualDto> resultados = new ArrayList<>();
        for (IntentoExamenVirtual intento : intentoRepository.findBySalaIdOrderByCodigoEstudianteAsc(sala.getId())) {
            ResultadoVirtualDto resultado = new ResultadoVirtualDto();
            resultado.setIntentoId(intento.getId());
            resultado.setCodigoEstudiante(intento.getCodigoEstudiante());
            resultado.setNombreEstudiante(nombreEstudianteActual(intento));
            resultado.setEstado(intento.getEstado());
            resultado.setAciertos(intento.getAciertos());
            resultado.setNotaSobre30(intento.getNotaSobre30() == null ? null : intento.getNotaSobre30().toPlainString());
            resultado.setNotaSobre100(intento.getNotaSobre100() == null ? null : intento.getNotaSobre100().toPlainString());
            resultado.setEnviadoEn(texto(intento.getEnviadoEn()));
            varianteRepository.findById(intento.getVarianteId()).ifPresent(variante -> resultado.setLetraVariante(variante.getLetraVariante()));
            resultado.setRespuestas(respuestaRepository.findByIntentoIdOrderByNumeroPreguntaAsc(intento.getId()).stream()
                    .map(this::mapDetalleRespuesta)
                    .toList());
            resultados.add(resultado);
        }
        return resultados;
    }

    @Transactional
    public AccesoVirtualResponseDto validarAcceso(AccesoVirtualRequestDto request, String ip) {
        SalaExamenVirtual sala = buscarSalaPorCodigo(request.getCodigoSala())
                .orElseThrow(() -> new RuntimeException("Código de sala inválido"));
        if (!Set.of("ABIERTA", "EN_CURSO").contains(sala.getEstado())) {
            throw new RuntimeException("La sala no está habilitada para recibir estudiantes");
        }
        String tokenSesion = request.getToken().trim();
        String tokenHash = hashToken(tokenSesion);
        Optional<IntentoExamenVirtual> intentoPorPersona = intentoRepository.findBySalaIdAndTokenHash(sala.getId(), tokenHash);
        IntentoExamenVirtual intento;
        if (intentoPorPersona.isPresent()) {
            intento = intentoPorPersona.get();
        } else {
            if (sala.getTokenGrupoHash() == null || !sala.getTokenGrupoHash().equals(tokenHash)) {
                throw new RuntimeException("El código de sala o el token no son válidos");
            }
            if (request.getCodigoEstudiante() == null || request.getCodigoEstudiante().isBlank()) {
                throw new RuntimeException("Con el acceso grupal debes ingresar tu código de estudiante");
            }
            intento = intentoRepository.findBySalaIdAndCodigoEstudiante(sala.getId(), request.getCodigoEstudiante().trim())
                    .orElseThrow(() -> new RuntimeException("El código de estudiante no pertenece a esta sala"));
            tokenSesion = generarToken();
            intento.setTokenSesionHash(hashToken(tokenSesion));
            intento.setTokenSesionEmitidoEn(LocalDateTime.now());
        }
        if (intento.getTokenExpiraEn().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("El token de acceso ha vencido");
        }
        if (request.getCodigoEstudiante() != null && !request.getCodigoEstudiante().isBlank()
                && !request.getCodigoEstudiante().trim().equalsIgnoreCase(intento.getCodigoEstudiante())) {
            throw new RuntimeException("El código de estudiante no coincide con el token");
        }
        if (Set.of("ENVIADO", "CALIFICADO", "ANULADO").contains(intento.getEstado())) {
            throw new RuntimeException("Este intento ya fue finalizado");
        }
        LocalDateTime ahora = LocalDateTime.now();
        if (intento.getIngresoEn() == null) intento.setIngresoEn(ahora);
        intento.setUltimaActividadEn(ahora);
        sincronizarInicioIntento(sala, intento);
        intentoRepository.save(intento);
        registrarEvento(sala.getId(), intento.getId(), "ESTUDIANTE_INGRESA", ip);
        return construirAcceso(sala, intento, tokenSesion);
    }

    @Transactional
    public AccesoVirtualResponseDto consultarExamen(String token) {
        IntentoExamenVirtual intento = autenticarIntento(token);
        SalaExamenVirtual sala = obtenerSala(intento.getSalaId());
        verificarTiempo(sala, intento);
        sincronizarInicioIntento(sala, intento);
        intento.setUltimaActividadEn(LocalDateTime.now());
        intentoRepository.save(intento);
        return construirAcceso(sala, intento, token);
    }

    @Transactional
    public RespuestaGuardadaDto guardarRespuesta(String token, RespuestaVirtualRequestDto request) {
        IntentoExamenVirtual intento = autenticarIntento(token);
        SalaExamenVirtual sala = obtenerSala(intento.getSalaId());
        verificarTiempo(sala, intento);
        if (!"EN_CURSO".equals(intento.getEstado()) || !"EN_CURSO".equals(sala.getEstado())) {
            throw new RuntimeException("El intento no está en curso");
        }
        ExamenVariante variante = varianteRepository.findById(intento.getVarianteId())
                .orElseThrow(() -> new RuntimeException("Variante no encontrada"));
        JsonNode pregunta = buscarPregunta(variante, request.getNumeroPregunta(), request.getReactivoId());
        if (pregunta == null) throw new RuntimeException("La pregunta no pertenece a la variante asignada");
        String respuesta = request.getRespuesta().trim().toUpperCase(Locale.ROOT);
        if (respuesta.length() > 10) throw new RuntimeException("La respuesta no es válida");
        RespuestaExamenVirtual entity = respuestaRepository
                .findByIntentoIdAndNumeroPregunta(intento.getId(), request.getNumeroPregunta())
                .orElseGet(RespuestaExamenVirtual::new);
        entity.setIntentoId(intento.getId());
        entity.setNumeroPregunta(request.getNumeroPregunta());
        entity.setReactivoId(request.getReactivoId());
        entity.setRespuesta(respuesta);
        entity.setGuardadaEn(LocalDateTime.now());
        respuestaRepository.save(entity);
        intento.setUltimaActividadEn(LocalDateTime.now());
        intentoRepository.save(intento);
        return mapRespuesta(entity);
    }

    @Transactional
    public IntentoExamenVirtual enviar(String token) {
        IntentoExamenVirtual intento = autenticarIntento(token);
        SalaExamenVirtual sala = obtenerSala(intento.getSalaId());
        if (Set.of("ENVIADO", "CALIFICADO").contains(intento.getEstado())) return intento;
        if (!Set.of("EN_CURSO", "PAUSADA").contains(intento.getEstado())) {
            throw new RuntimeException("El intento aún no puede enviarse");
        }
        calificar(intento);
        intento.setEstado("CALIFICADO");
        intento.setEnviadoEn(LocalDateTime.now());
        intentoRepository.save(intento);
        registrarEvento(sala.getId(), intento.getId(), "INTENTO_ENVIADO", null);
        return intento;
    }

    private void verificarTiempo(SalaExamenVirtual sala, IntentoExamenVirtual intento) {
        if (sala.getTerminaEn() != null && LocalDateTime.now().isAfter(sala.getTerminaEn())
                && "EN_CURSO".equals(intento.getEstado())) {
            calificar(intento);
            intento.setEstado("CALIFICADO");
            intento.setEnviadoEn(sala.getTerminaEn());
            intentoRepository.save(intento);
            throw new RuntimeException("El tiempo del examen ha terminado");
        }
    }

    private void calificar(IntentoExamenVirtual intento) {
        ExamenVariante variante = varianteRepository.findById(intento.getVarianteId())
                .orElseThrow(() -> new RuntimeException("Variante no encontrada"));
        try {
            Map<String, String> patron = objectMapper.readValue(variante.getPatronClavesJson(), Map.class);
            Map<Integer, String> respuestas = new HashMap<>();
            for (RespuestaExamenVirtual r : respuestaRepository.findByIntentoIdOrderByNumeroPreguntaAsc(intento.getId())) {
                respuestas.put(r.getNumeroPregunta(), r.getRespuesta());
            }
            int aciertos = 0;
            for (Map.Entry<String, String> clave : patron.entrySet()) {
                if (clave.getValue().equalsIgnoreCase(respuestas.getOrDefault(Integer.valueOf(clave.getKey()), ""))) aciertos++;
            }
            int total = Math.max(patron.size(), 1);
            intento.setAciertos(aciertos);
            intento.setNotaSobre30(BigDecimal.valueOf(aciertos * 30.0 / total).setScale(2, RoundingMode.HALF_UP));
            intento.setNotaSobre100(BigDecimal.valueOf(aciertos * 100.0 / total).setScale(2, RoundingMode.HALF_UP));
        } catch (Exception ex) {
            throw new RuntimeException("No se pudo calificar la variante virtual", ex);
        }
    }

    private AccesoVirtualResponseDto construirAcceso(SalaExamenVirtual sala, IntentoExamenVirtual intento, String token) {
        ExamenVariante variante = varianteRepository.findById(intento.getVarianteId())
                .orElseThrow(() -> new RuntimeException("Variante asignada no encontrada"));
        AccesoVirtualResponseDto dto = new AccesoVirtualResponseDto();
        dto.setIntentoId(intento.getId()); dto.setTokenSesion(token);
        dto.setCodigoEstudiante(intento.getCodigoEstudiante()); dto.setNombreEstudiante(nombreEstudianteActual(intento));
        dto.setCodigoSala(codigoSalaVisible(sala.getCodigoSala())); dto.setEstadoSala(sala.getEstado()); dto.setEstadoIntento(intento.getEstado());
        RolExamen rol = rolRepository.findById(sala.getRolExamenId()).orElse(null);
        if (rol != null) {
            dto.setInstitucionNombre("UNIVERSIDAD TÉCNICA PRIVADA COSMOS");
            dto.setSedeNombre(rol.getSedeNombre());
            dto.setCarreraNombre(rol.getCarreraNombre());
            dto.setMateriaCodigo(rol.getMateriaCodigo());
            dto.setMateriaNombre(rol.getMateriaNombre());
            dto.setGrupo(rol.getGrupo());
            String docenteOficial = rolExamenService.resolverNombreDocenteOficial(rol);
            if (docenteOficial != null && !docenteOficial.isBlank()
                    && !docenteOficial.equalsIgnoreCase(rol.getDocenteNombre())) {
                rol.setDocenteNombre(docenteOficial);
                rolRepository.save(rol);
            }
            dto.setDocenteNombre(docenteOficial);
            dto.setTipoParcial(rol.getTipoParcial() == null ? null : rol.getTipoParcial().getValor());
            dto.setModalidad(rol.getModalidad() == null ? null : rol.getModalidad().getValor());
            dto.setFecha(rol.getFechaDisplay() != null ? rol.getFechaDisplay() : String.valueOf(rol.getFecha()));
            dto.setHorario(rol.getHorario());
            dto.setAula(rol.getAula());
        }
        dto.setIniciadaEn(texto(sala.getIniciadaEn())); dto.setTerminaEn(texto(sala.getTerminaEn()));
        dto.setCuentaRegresivaSegundos(cuentaRegresivaRestante(sala));
        dto.setTiempoRestanteSegundos(tiempoRestante(sala));
        dto.setPreguntas("EN_CURSO".equals(sala.getEstado()) && examenIniciado(sala) ? construirPreguntas(variante) : List.of());
        return dto;
    }

    private void sincronizarInicioIntento(SalaExamenVirtual sala, IntentoExamenVirtual intento) {
        if ("EN_CURSO".equals(sala.getEstado()) && examenIniciado(sala)) {
            intento.setEstado("EN_CURSO");
            intento.setInicioEn(sala.getIniciadaEn());
        } else if ("EN_CURSO".equals(sala.getEstado()) && !Set.of("ENVIADO", "CALIFICADO", "ANULADO").contains(intento.getEstado())) {
            intento.setEstado("EN_ESPERA");
            intento.setInicioEn(null);
        }
    }

    private boolean examenIniciado(SalaExamenVirtual sala) {
        return sala.getIniciadaEn() == null || !LocalDateTime.now().isBefore(sala.getIniciadaEn());
    }

    private long cuentaRegresivaRestante(SalaExamenVirtual sala) {
        if (!"EN_CURSO".equals(sala.getEstado()) || sala.getIniciadaEn() == null) return 0;
        return Math.max(0, java.time.Duration.between(LocalDateTime.now(), sala.getIniciadaEn()).getSeconds());
    }

    private long tiempoRestante(SalaExamenVirtual sala) {
        if (!"EN_CURSO".equals(sala.getEstado()) || sala.getTerminaEn() == null || !examenIniciado(sala)) return 0;
        return Math.max(0, java.time.Duration.between(LocalDateTime.now(), sala.getTerminaEn()).getSeconds());
    }

    private List<PreguntaVirtualDto> construirPreguntas(ExamenVariante variante) {
        if (variante.getContenidoVirtualJson() == null || variante.getContenidoVirtualJson().isBlank()) {
            throw new RuntimeException("Esta generación no tiene contenido virtual seguro; regenere las variantes del examen");
        }
        try {
            List<PreguntaVirtualDto> preguntas = new ArrayList<>();
            JsonNode root = objectMapper.readTree(variante.getContenidoVirtualJson());
            int numero = 1;
            for (JsonNode node : root) {
                PreguntaVirtualDto pregunta = new PreguntaVirtualDto();
                pregunta.setReactivoId(node.path("id").asInt());
                String tipoReactivo = node.path("tipoReactivo").asText(null);
                pregunta.setTipoReactivo(tipoReactivo);
                boolean esContexto = Set.of("EMPAREJAMIENTO_TRONCO", "CASO_CLINICO_TRONCO").contains(tipoReactivo);
                pregunta.setNumeroPregunta(esContexto ? 0 : numero++);
                pregunta.setGrupoContexto(node.path("grupoContexto").asText(null));
                pregunta.setEnunciado(node.path("enunciado").asText(""));
                List<OpcionVirtualDto> opciones = new ArrayList<>();
                for (JsonNode opcion : node.path("opciones")) {
                    opciones.add(new OpcionVirtualDto(opcion.path("letra").asText(), opcion.path("texto").asText()));
                }
                pregunta.setOpciones(opciones); preguntas.add(pregunta);
            }
            return preguntas;
        } catch (Exception ex) { throw new RuntimeException("Contenido virtual de variante inválido", ex); }
    }

    private JsonNode buscarPregunta(ExamenVariante variante, Integer numero, Integer reactivoId) {
        List<PreguntaVirtualDto> preguntas = construirPreguntas(variante);
        return preguntas.stream().anyMatch(p -> p.getNumeroPregunta().equals(numero) && p.getReactivoId().equals(reactivoId))
                ? objectMapper.createObjectNode() : null;
    }

    private IntentoExamenVirtual autenticarIntento(String token) {
        if (token == null || token.isBlank()) throw new RuntimeException("Falta el token de examen");
        String hash = hashToken(token);
        return intentoRepository.findByTokenHash(hash)
                .or(() -> intentoRepository.findByTokenSesionHash(hash))
                .orElseThrow(() -> new RuntimeException("Sesión de examen inválida"));
    }

    private SalaExamenVirtual obtenerSala(String id) {
        return salaRepository.findById(id)
                .or(() -> buscarSalaPorCodigo(id))
                .orElseThrow(() -> new RuntimeException("Sala virtual no encontrada"));
    }

    private SalaVirtualResponseDto construirSala(SalaExamenVirtual sala) {
        SalaVirtualResponseDto dto = new SalaVirtualResponseDto(); dto.setId(sala.getId()); dto.setRolExamenId(sala.getRolExamenId());
        dto.setCodigoSala(codigoSalaVisible(sala.getCodigoSala())); dto.setEstado(sala.getEstado()); dto.setDuracionMinutos(sala.getDuracionMinutos());
        dto.setGraciaIngresoMinutos(sala.getGraciaIngresoMinutos()); dto.setIniciadaEn(texto(sala.getIniciadaEn())); dto.setTerminaEn(texto(sala.getTerminaEn()));
        List<ParticipanteVirtualDto> participantes = new ArrayList<>();
        for (IntentoExamenVirtual intento : intentoRepository.findBySalaIdOrderByCodigoEstudianteAsc(sala.getId())) {
            ParticipanteVirtualDto p = new ParticipanteVirtualDto(); p.setIntentoId(intento.getId()); p.setCodigoEstudiante(intento.getCodigoEstudiante());
            p.setNombreEstudiante(nombreEstudianteActual(intento)); p.setEstado(intento.getEstado()); p.setIngresoEn(texto(intento.getIngresoEn())); p.setEnviadoEn(texto(intento.getEnviadoEn()));
            p.setAciertos(intento.getAciertos()); p.setNotaSobre100(intento.getNotaSobre100() == null ? null : intento.getNotaSobre100().toPlainString()); participantes.add(p);
        }
        dto.setParticipantes(participantes); return dto;
    }

    private RespuestaGuardadaDto mapRespuesta(RespuestaExamenVirtual entity) {
        RespuestaGuardadaDto dto = new RespuestaGuardadaDto(); dto.setIntentoId(entity.getIntentoId()); dto.setNumeroPregunta(entity.getNumeroPregunta());
        dto.setRespuesta(entity.getRespuesta()); dto.setGuardadaEn(texto(entity.getGuardadaEn())); return dto;
    }

    private RespuestaVirtualDetalleDto mapDetalleRespuesta(RespuestaExamenVirtual entity) {
        RespuestaVirtualDetalleDto dto = new RespuestaVirtualDetalleDto();
        dto.setNumeroPregunta(entity.getNumeroPregunta());
        dto.setReactivoId(entity.getReactivoId());
        dto.setRespuesta(entity.getRespuesta());
        dto.setGuardadaEn(texto(entity.getGuardadaEn()));
        return dto;
    }

    private void registrarEvento(String salaId, String intentoId, String tipo, String usuario) {
        registrarEvento(salaId, intentoId, tipo, usuario, null);
    }

    private void registrarEvento(String salaId, String intentoId, String tipo, String usuario, String detallesJson) {
        EventoExamenVirtual evento = new EventoExamenVirtual();
        evento.setSalaId(salaId);
        evento.setIntentoId(intentoId);
        evento.setTipoEvento(tipo);
        evento.setDetallesJson(detallesJson);
        evento.setUsuario(usuario);
        evento.setOcurridoEn(LocalDateTime.now());
        eventoRepository.save(evento);
    }

    private String escaparJson(String valor) {
        return valor.replace("\\", "\\\\").replace("\"", "\\\"")
                .replace("\r", "\\r").replace("\n", "\\n");
    }

    private Optional<SalaExamenVirtual> buscarSalaPorCodigo(String codigo) {
        if (codigo == null || codigo.isBlank()) return Optional.empty();
        String normalizado = codigo.trim().toUpperCase(Locale.ROOT);
        Optional<SalaExamenVirtual> sala = salaRepository.findByCodigoSala(normalizado);
        if (sala.isPresent() || !normalizado.startsWith("SALA-")) return sala;
        // Los códigos antiguos conservan su valor interno para no invalidar
        // accesos ya compartidos, pero también aceptan la presentación nueva.
        return salaRepository.findByCodigoSala("SEA-" + normalizado.substring("SALA-".length()));
    }

    private String codigoSalaVisible(String codigo) {
        if (codigo != null && codigo.toUpperCase(Locale.ROOT).startsWith("SEA-")) {
            return "SALA-" + codigo.substring("SEA-".length());
        }
        return codigo;
    }

    private String generarCodigoSala() { String codigo; do { codigo = "SALA-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT); } while (salaRepository.findByCodigoSala(codigo).isPresent()); return codigo; }
    private String generarToken() { byte[] bytes = new byte[32]; secureRandom.nextBytes(bytes); return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes); }
    private String hashToken(String token) { try { byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)); StringBuilder out = new StringBuilder(); for (byte b : digest) out.append(String.format("%02x", b)); return out.toString(); } catch (Exception ex) { throw new IllegalStateException(ex); } }
    private String nombreCompleto(MapeoEstudianteVariante m) { return String.join(" ", Arrays.asList(m.getNombres(), m.getApellidoPaterno(), m.getApellidoMaterno())).replaceAll("\\s+", " ").trim(); }
    private String nombreEstudianteActual(IntentoExamenVirtual intento) {
        if (intento.getMapeoEstudianteVarianteId() != null) {
            String nombre = mapeoRepository.findById(intento.getMapeoEstudianteVarianteId()).map(this::nombreCompleto).orElse("");
            if (!nombre.isBlank()) return nombre;
        }
        return intento.getNombreEstudiante();
    }
    private String texto(LocalDateTime value) { return value == null ? null : value.toString(); }
}
