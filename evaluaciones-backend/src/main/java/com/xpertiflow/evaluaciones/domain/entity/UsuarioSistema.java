package com.xpertiflow.evaluaciones.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "sea_usuarios_sistema")
@Getter
@Setter
@NoArgsConstructor
public class UsuarioSistema {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario", nullable = false, unique = true, length = 100)
    private String usuario;

    @Column(name = "ci", unique = true, length = 30)
    private String ci;

    @Column(name = "correo", unique = true, length = 150)
    private String correo;

    @Column(name = "contrasena_hash", nullable = false, length = 100)
    private String contrasenaHash;

    @Column(name = "nombre_completo", nullable = false, length = 150)
    private String nombreCompleto;

    @Column(name = "rol_codigo", nullable = false, length = 50)
    private String rolCodigo;

    @Column(name = "debe_cambiar_contrasena", nullable = false)
    private boolean debeCambiarContrasena = true;

    @Column(name = "proveedor_identidad", nullable = false, length = 30)
    private String proveedorIdentidad = "INTERNO";

    @Column(name = "identidad_externa", length = 180)
    private String identidadExterna;

    @Column(name = "sedes_asignadas", nullable = false, columnDefinition = "TEXT")
    private String sedesAsignadas = "";

    @Column(name = "activo", nullable = false)
    private boolean activo = true;

    @Column(name = "ultimo_ingreso")
    private LocalDateTime ultimoIngreso;

    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "sea_usuario_sedes", joinColumns = @JoinColumn(name = "usuario_id"))
    private Set<AlcanceSede> sedes = new LinkedHashSet<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "sea_usuario_carreras", joinColumns = @JoinColumn(name = "usuario_id"))
    private Set<AlcanceCarrera> carreras = new LinkedHashSet<>();
}
