package com.xpertiflow.evaluaciones.application;

import com.xpertiflow.evaluaciones.api.dto.auth.AlcanceAcademicoDto;
import com.xpertiflow.evaluaciones.api.dto.auth.AnalisisDocentesSeaResponseDto;
import com.xpertiflow.evaluaciones.api.dto.auth.CredencialTemporalDto;
import com.xpertiflow.evaluaciones.api.dto.auth.DocenteSeaAnalisisDto;
import com.xpertiflow.evaluaciones.api.dto.auth.ErrorImportacionUsuarioDto;
import com.xpertiflow.evaluaciones.api.dto.auth.ImportacionUsuariosResponseDto;
import com.xpertiflow.evaluaciones.api.dto.auth.RolSistemaResponseDto;
import com.xpertiflow.evaluaciones.api.dto.auth.SincronizacionDocentesSeaRequestDto;
import com.xpertiflow.evaluaciones.api.dto.auth.SincronizacionDocentesSeaResponseDto;
import com.xpertiflow.evaluaciones.api.dto.auth.UsuarioSistemaRequestDto;
import com.xpertiflow.evaluaciones.api.dto.auth.UsuarioSistemaResponseDto;
import com.xpertiflow.evaluaciones.api.dto.gateway.GroupItemDto;
import com.xpertiflow.evaluaciones.domain.entity.AlcanceCarrera;
import com.xpertiflow.evaluaciones.domain.entity.AlcanceSede;
import com.xpertiflow.evaluaciones.domain.entity.AuditoriaUsuario;
import com.xpertiflow.evaluaciones.domain.entity.RolSistema;
import com.xpertiflow.evaluaciones.domain.entity.UsuarioSistema;
import com.xpertiflow.evaluaciones.domain.repository.AuditoriaUsuarioRepository;
import com.xpertiflow.evaluaciones.domain.repository.RolSistemaRepository;
import com.xpertiflow.evaluaciones.domain.repository.UsuarioSistemaRepository;
import com.xpertiflow.evaluaciones.infrastructure.gateway.UnitepcGatewayClient;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class UsuariosSistemaService {

    private static final Pattern CODIGO_EN_CABECERA = Pattern.compile("(?:\\[|:|_|-)\\s*([A-Za-z0-9.]+)");
    private static final Set<String> MARCAS_ACTIVAS = Set.of("X", "SI", "S", "1", "TRUE", "VERDADERO", "✓", "✔", "☑");

    private final UsuarioSistemaRepository usuarioRepository;
    private final RolSistemaRepository rolRepository;
    private final AuditoriaUsuarioRepository auditoriaRepository;
    private final PasswordEncoder passwordEncoder;
    private final UnitepcGatewayClient unitepcGatewayClient;

    @Transactional(readOnly = true)
    public List<UsuarioSistemaResponseDto> listar() {
        return usuarioRepository.findAllByOrderByNombreCompletoAsc().stream()
                .map(this::mapearUsuario)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RolSistemaResponseDto> listarRoles() {
        return rolRepository.findByActivoTrueOrderByNombreAsc().stream()
                .map(rol -> new RolSistemaResponseDto(rol.getCodigo(), rol.getNombre(), rol.getDescripcion()))
                .toList();
    }

    @Transactional(readOnly = true)
    public AnalisisDocentesSeaResponseDto analizarDocentesSea(String gestion) {
        String term = gestion == null || gestion.isBlank() ? "2-2026" : gestion.trim();
        Map<String, DocenteSeaAcumulado> docentesSea = agruparDocentesSea(term);
        Map<String, UsuarioSistema> usuariosLocales = usuariosPorCi();
        List<DocenteSeaAnalisisDto> docentes = new ArrayList<>();
        int conAcceso = 0;
        int nuevos = 0;
        int sinAcceso = 0;
        int cuentasConRolDiferente = 0;

        for (Map.Entry<String, DocenteSeaAcumulado> entry : docentesSea.entrySet()) {
            String ci = entry.getKey();
            DocenteSeaAcumulado sea = entry.getValue();
            UsuarioSistema usuario = usuariosLocales.get(ci);
            boolean tieneCuenta = usuario != null;
            boolean cuentaActiva = usuario != null && usuario.isActivo();
            boolean esCuentaDocente = usuario != null && "DOCENTE".equalsIgnoreCase(usuario.getRolCodigo());
            String estado;
            if (cuentaActiva && esCuentaDocente) {
                estado = "CON_ACCESO";
                conAcceso++;
            } else if (!tieneCuenta) {
                estado = "NUEVO";
                nuevos++;
                sinAcceso++;
            } else if (!esCuentaDocente) {
                estado = "ROL_DIFERENTE";
                cuentasConRolDiferente++;
                sinAcceso++;
            } else {
                estado = "SIN_ACCESO";
                sinAcceso++;
            }
            docentes.add(new DocenteSeaAnalisisDto(
                    ci,
                    sea.nombre,
                    sea.grupos,
                    true,
                    tieneCuenta,
                    cuentaActiva,
                    usuario == null ? null : usuario.getId(),
                    usuario == null ? null : usuario.getRolCodigo(),
                    usuario == null ? null : usuario.getProveedorIdentidad(),
                    estado));
        }

        int yaNoEstan = 0;
        for (UsuarioSistema usuario : usuarioRepository.findAllByOrderByNombreCompletoAsc()) {
            if (!"DOCENTE".equalsIgnoreCase(usuario.getRolCodigo())) continue;
            String ci = ciParaComparacion(usuario);
            if (ci.isBlank() || docentesSea.containsKey(ci)) continue;
            yaNoEstan++;
            docentes.add(new DocenteSeaAnalisisDto(
                    ci,
                    usuario.getNombreCompleto(),
                    0,
                    false,
                    true,
                    usuario.isActivo(),
                    usuario.getId(),
                    usuario.getRolCodigo(),
                    usuario.getProveedorIdentidad(),
                    "YA_NO_ESTA"));
        }

        return new AnalisisDocentesSeaResponseDto(
                term,
                java.time.LocalDateTime.now(),
                docentesSea.size(),
                conAcceso,
                nuevos,
                sinAcceso,
                yaNoEstan,
                cuentasConRolDiferente,
                0,
                docentes);
    }

    @Transactional
    public SincronizacionDocentesSeaResponseDto sincronizarDocentesSea(
            String gestion,
            SincronizacionDocentesSeaRequestDto request,
            String actor) {
        String term = gestion == null || gestion.isBlank() ? "2-2026" : gestion.trim();
        Map<String, DocenteSeaAcumulado> docentesSea = agruparDocentesSea(term);
        Set<String> seleccionados = request == null || request.getCis() == null
                ? new LinkedHashSet<>()
                : request.getCis().stream().map(this::ciComparacion).filter(ci -> !ci.isBlank()).collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
        if (seleccionados.isEmpty()) seleccionados.addAll(docentesSea.keySet());

        List<CredencialTemporalDto> credenciales = new ArrayList<>();
        List<ErrorImportacionUsuarioDto> errores = new ArrayList<>();
        List<UsuarioSistema> usuariosParaGuardar = new ArrayList<>();
        List<AuditoriaPendiente> auditoriasPendientes = new ArrayList<>();
        Map<String, UsuarioSistema> usuariosLocales = usuariosPorCi();
        int creados = 0;
        int actualizados = 0;
        int reactivados = 0;

        for (String ci : seleccionados) {
            DocenteSeaAcumulado sea = docentesSea.get(ci);
            if (sea == null) {
                errores.add(new ErrorImportacionUsuarioDto(0, ci, "El docente ya no está presente en SEA para la gestión " + term));
                continue;
            }
            UsuarioSistema usuario = usuariosLocales.get(ci);
            if (usuario != null && !"DOCENTE".equalsIgnoreCase(usuario.getRolCodigo())) {
                errores.add(new ErrorImportacionUsuarioDto(0, ci, "Ya existe una cuenta con otro rol: " + usuario.getRolCodigo()));
                continue;
            }
            boolean nuevo = usuario == null;
            if (nuevo) {
                usuario = new UsuarioSistema();
                usuario.setCi(ci);
                usuario.setUsuario(ci);
                usuario.setContrasenaHash(passwordEncoder.encode(ci));
                usuario.setDebeCambiarContrasena(true);
                usuario.setCreadoEn(java.time.LocalDateTime.now());
                creados++;
                credenciales.add(new CredencialTemporalDto(0, ci, sea.nombre, "DOCENTE", ci, ci, "CREADO_DESDE_SEA"));
            } else {
                actualizados++;
                if (!usuario.isActivo()) reactivados++;
            }
            usuario.setNombreCompleto(sea.nombre);
            usuario.setRolCodigo("DOCENTE");
            usuario.setActivo(true);
            usuario.setProveedorIdentidad("SEA");
            usuario.setIdentidadExterna(ci);
            usuario.setActualizadoEn(java.time.LocalDateTime.now());
            usuariosParaGuardar.add(usuario);
            usuariosLocales.put(ci, usuario);
            auditoriasPendientes.add(new AuditoriaPendiente(
                    usuario,
                    nuevo ? "DOCENTE_SINCRONIZADO_SEA" : "DOCENTE_ACTUALIZADO_SEA",
                    actor,
                    "Gestión " + term + " · " + sea.grupos + " grupo(s) SEA"));
        }

        int desactivados = 0;
        if (request != null && request.isDesactivarAusentes()) {
            for (UsuarioSistema usuario : usuarioRepository.findAllByOrderByNombreCompletoAsc()) {
                if (!"DOCENTE".equalsIgnoreCase(usuario.getRolCodigo()) || !usuario.isActivo()) continue;
                String ci = ciParaComparacion(usuario);
                if (ci.isBlank() || docentesSea.containsKey(ci)) continue;
                usuario.setActivo(false);
                usuario.setActualizadoEn(java.time.LocalDateTime.now());
                usuariosParaGuardar.add(usuario);
                auditoriasPendientes.add(new AuditoriaPendiente(
                        usuario,
                        "DOCENTE_DESACTIVADO_AUSENTE_SEA",
                        actor,
                        "No encontrado en SEA para la gestión " + term));
                desactivados++;
            }
        }

        if (!usuariosParaGuardar.isEmpty()) {
            usuarioRepository.saveAllAndFlush(usuariosParaGuardar);
        }
        if (!auditoriasPendientes.isEmpty()) {
            auditoriaRepository.saveAll(auditoriasPendientes.stream()
                    .map(this::mapearAuditoria)
                    .toList());
        }

        return new SincronizacionDocentesSeaResponseDto(
                seleccionados.size(), creados, actualizados, reactivados, desactivados, credenciales, errores);
    }

    private Map<String, DocenteSeaAcumulado> agruparDocentesSea(String term) {
        Map<String, DocenteSeaAcumulado> resultado = new LinkedHashMap<>();
        for (GroupItemDto grupo : unitepcGatewayClient.getGroups(term, null, null, null)) {
            String ci = ciComparacion(grupo.getTeacherIdentityNumber());
            if (ci.isBlank()) continue;
            String nombre = grupo.getTeacherName() == null || grupo.getTeacherName().isBlank()
                    ? "Docente " + ci
                    : grupo.getTeacherName().trim();
            DocenteSeaAcumulado acumulado = resultado.computeIfAbsent(ci, clave -> new DocenteSeaAcumulado(nombre));
            acumulado.grupos++;
            if (acumulado.nombre.startsWith("Docente ") && !nombre.startsWith("Docente ")) acumulado.nombre = nombre;
        }
        return resultado;
    }

    private Map<String, UsuarioSistema> usuariosPorCi() {
        Map<String, UsuarioSistema> resultado = new LinkedHashMap<>();
        for (UsuarioSistema usuario : usuarioRepository.findAllByOrderByNombreCompletoAsc()) {
            String ci = ciParaComparacion(usuario);
            if (!ci.isBlank()) resultado.put(ci, usuario);
        }
        return resultado;
    }

    private String ciParaComparacion(UsuarioSistema usuario) {
        return ciComparacion(usuario.getCi() == null || usuario.getCi().isBlank() ? usuario.getUsuario() : usuario.getCi());
    }

    private String ciComparacion(String valor) {
        return valor == null ? "" : valor.trim().toUpperCase(Locale.ROOT);
    }

    private static final class DocenteSeaAcumulado {
        private String nombre;
        private int grupos;

        private DocenteSeaAcumulado(String nombre) {
            this.nombre = nombre;
        }
    }

    private static final class AuditoriaPendiente {
        private final UsuarioSistema usuario;
        private final String accion;
        private final String actor;
        private final String detalle;

        private AuditoriaPendiente(UsuarioSistema usuario, String accion, String actor, String detalle) {
            this.usuario = usuario;
            this.accion = accion;
            this.actor = actor;
            this.detalle = detalle;
        }
    }

    private AuditoriaUsuario mapearAuditoria(AuditoriaPendiente pendiente) {
        AuditoriaUsuario auditoria = new AuditoriaUsuario();
        auditoria.setUsuarioObjetivoId(pendiente.usuario.getId());
        auditoria.setUsuarioObjetivoCi(pendiente.usuario.getCi());
        auditoria.setAccion(pendiente.accion);
        auditoria.setRealizadoPor(pendiente.actor == null || pendiente.actor.isBlank() ? "SISTEMA" : pendiente.actor);
        auditoria.setDetalle(pendiente.detalle);
        auditoria.setFechaEvento(java.time.LocalDateTime.now());
        return auditoria;
    }

    @Transactional
    public UsuarioSistemaResponseDto crear(UsuarioSistemaRequestDto request, String actor, String rolActor) {
        validarRolAsignable(request.getRolCodigo(), rolActor);
        String ci = normalizarCi(request.getCi());
        if (usuarioRepository.existsByCi(ci)) {
            throw new IllegalArgumentException("Ya existe un usuario registrado con el CI " + ci);
        }

        UsuarioSistema usuario = new UsuarioSistema();
        usuario.setCi(ci);
        usuario.setUsuario(ci);
        usuario.setContrasenaHash(passwordEncoder.encode(ci));
        usuario.setNombreCompleto(nombreRequerido(request.getNombreCompleto()));
        usuario.setRolCodigo(request.getRolCodigo().trim().toUpperCase(Locale.ROOT));
        usuario.setActivo(request.isActivo());
        usuario.setDebeCambiarContrasena(true);
        usuario.setProveedorIdentidad("INTERNO");
        usuario.setCreadoEn(java.time.LocalDateTime.now());
        usuario.setActualizadoEn(java.time.LocalDateTime.now());
        completarAlcances(usuario, request);
        UsuarioSistema guardado = usuarioRepository.save(usuario);
        registrarAuditoria(guardado, "USUARIO_CREADO", actor, "Rol " + guardado.getRolCodigo());
        return mapearUsuario(guardado);
    }

    @Transactional
    public UsuarioSistemaResponseDto actualizar(Long id, UsuarioSistemaRequestDto request, String actor, String rolActor) {
        validarRolAsignable(request.getRolCodigo(), rolActor);
        UsuarioSistema usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + id));
        String ci = normalizarCi(request.getCi());
        usuarioRepository.findByCi(ci).filter(otro -> !Objects.equals(otro.getId(), id))
                .ifPresent(otro -> { throw new IllegalArgumentException("Ya existe otro usuario con el CI " + ci); });

        usuario.setCi(ci);
        usuario.setUsuario(ci);
        usuario.setNombreCompleto(nombreRequerido(request.getNombreCompleto()));
        usuario.setRolCodigo(request.getRolCodigo().trim().toUpperCase(Locale.ROOT));
        usuario.setActivo(request.isActivo());
        completarAlcances(usuario, request);
        usuario.setActualizadoEn(java.time.LocalDateTime.now());
        UsuarioSistema guardado = usuarioRepository.save(usuario);
        registrarAuditoria(guardado, "USUARIO_ACTUALIZADO", actor, "Rol " + guardado.getRolCodigo());
        return mapearUsuario(guardado);
    }

    @Transactional
    public CredencialTemporalDto restablecerContrasena(Long id, String actor) {
        UsuarioSistema usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado: " + id));
        String ci = normalizarCi(usuario.getCi() == null ? usuario.getUsuario() : usuario.getCi());
        usuario.setContrasenaHash(passwordEncoder.encode(ci));
        usuario.setDebeCambiarContrasena(true);
        usuario.setActualizadoEn(java.time.LocalDateTime.now());
        usuarioRepository.save(usuario);
        registrarAuditoria(usuario, "CONTRASENA_RESTABLECIDA", actor, "La clave temporal vuelve a ser el CI");
        return new CredencialTemporalDto(0, ci, usuario.getNombreCompleto(), usuario.getRolCodigo(), ci, ci, "RESTABLECIDA");
    }

    @Transactional
    public ImportacionUsuariosResponseDto importar(MultipartFile archivo, String actor, String rolActor) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("Selecciona un archivo Excel con usuarios");
        }

        List<CredencialTemporalDto> credenciales = new ArrayList<>();
        List<ErrorImportacionUsuarioDto> errores = new ArrayList<>();
        int total = 0;
        int creados = 0;
        int actualizados = 0;

        try (InputStream input = archivo.getInputStream(); Workbook workbook = WorkbookFactory.create(input)) {
            Sheet sheet = workbook.getSheetAt(0);
            Row encabezado = encontrarEncabezado(sheet);
            if (encabezado == null) {
                throw new IllegalArgumentException("El Excel no contiene una fila de encabezados válida");
            }
            Map<String, Integer> columnas = leerColumnas(encabezado);
            Integer ciColumna = buscarColumna(columnas, "CI", "C.I.", "CODIGO", "CODIGO ESTUDIANTE", "IDENTIDAD");
            Integer nombreColumna = buscarColumna(columnas, "NOMBRE", "NOMBRE COMPLETO", "NOMBRE_EST", "NOMBRE DEL USUARIO");
            Integer rolColumna = buscarColumna(columnas, "ROL", "ROL CODIGO", "ROL_CODIGO", "PERFIL");
            if (ciColumna == null || nombreColumna == null || rolColumna == null) {
                throw new IllegalArgumentException("El Excel debe tener las columnas CI, NOMBRE_COMPLETO y ROL");
            }

            DataFormatter formatter = new DataFormatter();
            List<ColumnaAlcance> sedes = encontrarColumnasAlcance(columnas, true);
            List<ColumnaAlcance> carreras = encontrarColumnasAlcance(columnas, false);
            Integer sedesLista = buscarColumna(columnas, "SEDES", "SEDE CODIGOS", "SEDES CODIGOS");
            Integer carrerasLista = buscarColumna(columnas, "CARRERAS", "CARRERA CODIGOS", "CARRERAS CODIGOS");

            for (int index = encabezado.getRowNum() + 1; index <= sheet.getLastRowNum(); index++) {
                Row row = sheet.getRow(index);
                if (filaVacia(row, formatter)) continue;
                total++;
                int fila = index + 1;
                String ci = valor(row, ciColumna, formatter).trim();
                String nombre = valor(row, nombreColumna, formatter);
                String rol = valor(row, rolColumna, formatter).trim().toUpperCase(Locale.ROOT);
                try {
                    if (ci.isBlank() || nombre.trim().isBlank() || rol.isBlank()) {
                        throw new IllegalArgumentException("CI, NOMBRE_COMPLETO y ROL son obligatorios");
                    }
                    validarRolAsignable(rol, rolActor);
                    UsuarioSistemaRequestDto request = new UsuarioSistemaRequestDto();
                    request.setCi(ci);
                    request.setNombreCompleto(nombre);
                    request.setRolCodigo(rol);
                    request.setActivo(true);
                    request.setSedes(resolverAlcances(row, sedes, sedesLista, formatter));
                    request.setCarreras(resolverAlcances(row, carreras, carrerasLista, formatter));

                    UsuarioSistema existente = usuarioRepository.findByCi(normalizarCi(ci)).orElse(null);
                    UsuarioSistema guardado;
                    if (existente == null) {
                        guardado = crearDesdeRequest(request);
                        creados++;
                        credenciales.add(new CredencialTemporalDto(fila, normalizarCi(ci), nombre, rol, normalizarCi(ci), normalizarCi(ci), "CREADO"));
                    } else {
                        actualizarDesdeRequest(existente, request);
                        guardado = usuarioRepository.save(existente);
                        actualizados++;
                        credenciales.add(new CredencialTemporalDto(fila, normalizarCi(ci), nombre, rol, normalizarCi(ci), "CONSERVADA", "ACTUALIZADO"));
                    }
                    registrarAuditoria(guardado, existente == null ? "USUARIO_IMPORTADO" : "USUARIO_ACTUALIZADO_IMPORTACION", actor, "Fila " + fila);
                } catch (RuntimeException exception) {
                    errores.add(new ErrorImportacionUsuarioDto(fila, ci, exception.getMessage()));
                }
            }
        } catch (IOException exception) {
            throw new IllegalArgumentException("No se pudo leer el archivo Excel: " + exception.getMessage(), exception);
        }

        return new ImportacionUsuariosResponseDto(total, creados, actualizados, credenciales, errores);
    }

    public byte[] generarPlantilla() {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            Sheet usuarios = workbook.createSheet("USUARIOS");
            Row encabezado = usuarios.createRow(0);
            String[] columnas = {"CI", "NOMBRE_COMPLETO", "ROL", "SEDE [CBA]", "SEDE [LPZ]", "CARRERA [SIS]", "CARRERA [MED]"};
            for (int i = 0; i < columnas.length; i++) encabezado.createCell(i).setCellValue(columnas[i]);
            Row ejemplo = usuarios.createRow(1);
            ejemplo.createCell(0).setCellValue("1234567");
            ejemplo.createCell(1).setCellValue("APELLIDO1 APELLIDO2 NOMBRES");
            ejemplo.createCell(2).setCellValue("DOCENTE");
            ejemplo.createCell(3).setCellValue("X");
            ejemplo.createCell(5).setCellValue("X");

            Sheet instrucciones = workbook.createSheet("INSTRUCCIONES");
            String[] textos = {
                    "CI: obligatorio; será el usuario y la contraseña temporal.",
                    "NOMBRE_COMPLETO: conservar exactamente el orden recibido desde SEA.",
                    "ROL: usar ADMINISTRADOR_SISTEMA, RESPONSABLE_EVALUACIONES, PERSONAL_EVALUACIONES, DIRECTOR_CARRERA, DOCENTE o VICERRECTOR.",
                    "Marcar con X las columnas SEDE [...] y CARRERA [...] que correspondan. Se pueden marcar varias.",
                    "Los códigos entre corchetes deben ser los códigos oficiales entregados por SEA.",
                    "Todos los usuarios nuevos deberán cambiar la contraseña en el primer ingreso."
            };
            for (int i = 0; i < textos.length; i++) instrucciones.createRow(i).createCell(0).setCellValue(textos[i]);
            for (int i = 0; i < columnas.length; i++) usuarios.autoSizeColumn(i);
            workbook.write(output);
            return output.toByteArray();
        } catch (IOException exception) {
            throw new IllegalStateException("No se pudo generar la plantilla", exception);
        }
    }

    private UsuarioSistema crearDesdeRequest(UsuarioSistemaRequestDto request) {
        UsuarioSistema usuario = new UsuarioSistema();
        usuario.setCi(normalizarCi(request.getCi()));
        usuario.setUsuario(normalizarCi(request.getCi()));
        usuario.setContrasenaHash(passwordEncoder.encode(normalizarCi(request.getCi())));
        usuario.setNombreCompleto(nombreRequerido(request.getNombreCompleto()));
        usuario.setRolCodigo(request.getRolCodigo().trim().toUpperCase(Locale.ROOT));
        usuario.setActivo(request.isActivo());
        usuario.setDebeCambiarContrasena(true);
        usuario.setProveedorIdentidad("INTERNO");
        usuario.setCreadoEn(java.time.LocalDateTime.now());
        usuario.setActualizadoEn(java.time.LocalDateTime.now());
        completarAlcances(usuario, request);
        return usuarioRepository.save(usuario);
    }

    private void actualizarDesdeRequest(UsuarioSistema usuario, UsuarioSistemaRequestDto request) {
        usuario.setCi(normalizarCi(request.getCi()));
        usuario.setUsuario(normalizarCi(request.getCi()));
        usuario.setNombreCompleto(nombreRequerido(request.getNombreCompleto()));
        usuario.setRolCodigo(request.getRolCodigo().trim().toUpperCase(Locale.ROOT));
        usuario.setActivo(request.isActivo());
        completarAlcances(usuario, request);
        usuario.setActualizadoEn(java.time.LocalDateTime.now());
    }

    private void completarAlcances(UsuarioSistema usuario, UsuarioSistemaRequestDto request) {
        usuario.getSedes().clear();
        usuario.getCarreras().clear();
        if (request.getSedes() != null) {
            request.getSedes().stream().filter(Objects::nonNull).filter(item -> item.codigo() != null && !item.codigo().isBlank())
                    .forEach(item -> usuario.getSedes().add(new AlcanceSede(item.codigo().trim(), item.nombre().trim())));
        }
        if (request.getCarreras() != null) {
            request.getCarreras().stream().filter(Objects::nonNull).filter(item -> item.codigo() != null && !item.codigo().isBlank())
                    .forEach(item -> usuario.getCarreras().add(new AlcanceCarrera(item.codigo().trim(), item.nombre().trim())));
        }
        usuario.setSedesAsignadas(usuario.getSedes().stream().map(AlcanceSede::getCodigo).sorted().reduce((a, b) -> a + "," + b).orElse(""));
    }

    private UsuarioSistemaResponseDto mapearUsuario(UsuarioSistema usuario) {
        RolSistema rol = rolRepository.findById(usuario.getRolCodigo()).orElse(null);
        List<AlcanceAcademicoDto> sedes = usuario.getSedes().stream().sorted(Comparator.comparing(AlcanceSede::getCodigo))
                .map(item -> new AlcanceAcademicoDto(item.getCodigo(), item.getNombre())).toList();
        List<AlcanceAcademicoDto> carreras = usuario.getCarreras().stream().sorted(Comparator.comparing(AlcanceCarrera::getCodigo))
                .map(item -> new AlcanceAcademicoDto(item.getCodigo(), item.getNombre())).toList();
        return new UsuarioSistemaResponseDto(usuario.getId(), usuario.getCi(), usuario.getUsuario(), usuario.getNombreCompleto(),
                usuario.getRolCodigo(), rol == null ? usuario.getRolCodigo() : rol.getNombre(), usuario.isActivo(),
                usuario.isDebeCambiarContrasena(), usuario.getProveedorIdentidad(), sedes, carreras,
                usuario.getUltimoIngreso(), usuario.getCreadoEn());
    }

    private void validarRolAsignable(String codigo, String rolActor) {
        if (codigo == null || codigo.isBlank() || rolRepository.findById(codigo.trim().toUpperCase(Locale.ROOT)).filter(RolSistema::isActivo).isEmpty()) {
            throw new IllegalArgumentException("El rol indicado no existe o está inactivo");
        }
        if (!"ADMINISTRADOR_SISTEMA".equals(rolActor) && "ADMINISTRADOR_SISTEMA".equals(codigo.trim().toUpperCase(Locale.ROOT))) {
            throw new IllegalArgumentException("Solo el administrador puede asignar el rol Administrador del sistema");
        }
    }

    private void registrarAuditoria(UsuarioSistema usuario, String accion, String actor, String detalle) {
        AuditoriaUsuario auditoria = new AuditoriaUsuario();
        auditoria.setUsuarioObjetivoId(usuario.getId());
        auditoria.setUsuarioObjetivoCi(usuario.getCi());
        auditoria.setAccion(accion);
        auditoria.setRealizadoPor(actor == null || actor.isBlank() ? "SISTEMA" : actor);
        auditoria.setDetalle(detalle);
        auditoria.setFechaEvento(java.time.LocalDateTime.now());
        auditoriaRepository.save(auditoria);
    }

    private Row encontrarEncabezado(Sheet sheet) {
        DataFormatter formatter = new DataFormatter();
        for (Row row : sheet) {
            if (leerColumnas(row).containsKey("CI") || leerColumnas(row).containsKey("CODIGO")) return row;
        }
        return null;
    }

    private Map<String, Integer> leerColumnas(Row row) {
        Map<String, Integer> columnas = new LinkedHashMap<>();
        if (row == null) return columnas;
        DataFormatter formatter = new DataFormatter();
        for (Cell cell : row) {
            String nombre = normalizarCabecera(formatter.formatCellValue(cell));
            if (!nombre.isBlank()) columnas.putIfAbsent(nombre, cell.getColumnIndex());
        }
        return columnas;
    }

    private Integer buscarColumna(Map<String, Integer> columnas, String... nombres) {
        for (String nombre : nombres) {
            Integer indice = columnas.get(normalizarCabecera(nombre));
            if (indice != null) return indice;
        }
        return null;
    }

    private List<ColumnaAlcance> encontrarColumnasAlcance(Map<String, Integer> columnas, boolean sede) {
        String prefijo = sede ? "SEDE" : "CARRERA";
        List<ColumnaAlcance> resultado = new ArrayList<>();
        columnas.forEach((cabecera, indice) -> {
            if (!cabecera.startsWith(prefijo + " ") && !cabecera.startsWith(prefijo + "_") && !cabecera.startsWith(prefijo + ":") && !cabecera.startsWith(prefijo + "-")) return;
            Matcher matcher = CODIGO_EN_CABECERA.matcher(cabecera);
            if (matcher.find()) resultado.add(new ColumnaAlcance(indice, matcher.group(1), matcher.group(1)));
        });
        return resultado;
    }

    private List<AlcanceAcademicoDto> resolverAlcances(Row row, List<ColumnaAlcance> columnas, Integer lista, DataFormatter formatter) {
        Map<String, AlcanceAcademicoDto> resultado = new LinkedHashMap<>();
        for (ColumnaAlcance columna : columnas) {
            if (MARCAS_ACTIVAS.contains(valor(row, columna.indice(), formatter).trim().toUpperCase(Locale.ROOT))) {
                resultado.put(columna.codigo(), new AlcanceAcademicoDto(columna.codigo(), columna.nombre()));
            }
        }
        if (lista != null) {
            Arrays.stream(valor(row, lista, formatter).split("[,;|]"))
                    .map(String::trim).filter(item -> !item.isBlank())
                    .forEach(item -> resultado.putIfAbsent(item, new AlcanceAcademicoDto(item, item)));
        }
        return new ArrayList<>(resultado.values());
    }

    private boolean filaVacia(Row row, DataFormatter formatter) {
        if (row == null) return true;
        for (Cell cell : row) if (!formatter.formatCellValue(cell).trim().isBlank()) return false;
        return true;
    }

    private String valor(Row row, Integer indice, DataFormatter formatter) {
        if (row == null || indice == null || row.getCell(indice) == null) return "";
        return formatter.formatCellValue(row.getCell(indice));
    }

    private String normalizarCabecera(String valor) {
        return valor == null ? "" : valor.trim().toUpperCase(Locale.ROOT).replaceAll("[.\\-]+", " ").replaceAll("\\s+", " ");
    }

    private String normalizarCi(String valor) {
        String ci = valor == null ? "" : valor.trim();
        if (ci.isBlank()) throw new IllegalArgumentException("El CI es obligatorio");
        return ci;
    }

    private String nombreRequerido(String valor) {
        if (valor == null || valor.trim().isBlank()) throw new IllegalArgumentException("El nombre completo es obligatorio");
        return valor;
    }

    private record ColumnaAlcance(int indice, String codigo, String nombre) {}
}
