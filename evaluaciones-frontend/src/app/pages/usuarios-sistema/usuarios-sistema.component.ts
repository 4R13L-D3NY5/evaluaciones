import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { UsuariosSistemaService, UsuarioSistema, RolSistema, AlcanceAcademico, AlcanceCampus, AsignacionAcademica, UsuarioSistemaRequest, ImportacionUsuariosResponse, CredencialTemporal, AnalisisDocentesSeaResponse, DocenteSeaAnalisis, SincronizacionDocentesSeaResponse } from '../../core/services/usuarios-sistema.service';
import { UnitepcGatewayService } from '../../core/services/unitepc-gateway.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';
import { BranchOffice, Campus, Career, Course } from '../../core/models/unitepc-gateway.models';

interface RolCatalogo extends RolSistema {
  alcance: string;
  permisos: string[];
  icono: string;
}

@Component({
  selector: 'sea-usuarios-sistema',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="space-y-6">
      <header class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div class="flex items-center gap-3">
            <span class="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><i class="pi pi-users text-xl"></i></span>
            <div>
              <h1 class="text-2xl font-black tracking-tight text-foreground">{{ contexto === 'EVALUACIONES' ? 'Personal de evaluaciones' : 'Usuarios y accesos' }}</h1>
              <p class="mt-1 text-sm text-muted-foreground">{{ contexto === 'EVALUACIONES' ? 'Administra responsables y personal vinculados al proceso de evaluaciones.' : 'Registra cuentas institucionales y define su alcance académico.' }}</p>
            </div>
          </div>
        </div>
        @if (vistaActual() === 'usuarios') {
          <div class="flex flex-wrap gap-2">
            <button class="secondary-button" (click)="descargarPlantilla()"><i class="pi pi-download"></i> Plantilla Excel</button>
            <label class="secondary-button cursor-pointer"><i class="pi pi-upload"></i> Importar lote<input class="hidden" type="file" accept=".xlsx,.xls" (change)="importar($event)"></label>
            <button class="primary-button" (click)="abrirNuevo()"><i class="pi pi-plus"></i> Registrar usuario</button>
          </div>
        }
      </header>

      <div class="grid gap-4 md:grid-cols-4">
        <div class="metric-card"><span>Usuarios registrados</span><strong>{{ usuarios().length }}</strong><small>cuentas internas</small></div>
        <div class="metric-card"><span>Activos</span><strong>{{ activos() }}</strong><small>con acceso habilitado</small></div>
        <div class="metric-card"><span>Por cambiar clave</span><strong>{{ pendientesClave() }}</strong><small>primer ingreso pendiente</small></div>
        <div class="metric-card"><span>Roles disponibles</span><strong>{{ rolesConPermisos().length }}</strong><small>perfiles institucionales</small></div>
      </div>

      <nav class="view-tabs" aria-label="Secciones de usuarios y accesos">
        <button type="button" class="view-tab" [class.active]="vistaActual() === 'usuarios'" (click)="cambiarVista('usuarios')">
          <i class="pi pi-users"></i><span>Usuarios del sistema</span><small>{{ usuarios().length }}</small>
        </button>
        @if (contexto === 'INSTITUCIONAL') {
          <button type="button" class="view-tab" [class.active]="vistaActual() === 'sea'" (click)="cambiarVista('sea')">
            <i class="pi pi-sync"></i><span>Docentes SEA</span><small>{{ analisisDocentesSea()?.docentesEnSea ?? '—' }}</small>
          </button>
        }
        <button type="button" class="view-tab" [class.active]="vistaActual() === 'roles'" (click)="cambiarVista('roles')">
          <i class="pi pi-shield"></i><span>Roles y permisos</span><small>{{ rolesConPermisos().length }}</small>
        </button>
      </nav>

      @if (vistaActual() === 'roles') {
      <details class="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <summary class="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl px-1 py-1 outline-none transition-colors hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-primary/30">
          <div>
            <p class="eyebrow">Catálogo institucional · Consulta ocasional</p>
            <h2 class="text-lg font-black text-foreground">Roles y permisos</h2>
            <p class="text-xs text-muted-foreground">Consulta qué puede hacer cada perfil y el alcance académico que limita sus operaciones.</p>
          </div>
          <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-muted/30 text-primary transition-transform"><i class="pi pi-chevron-down"></i></span>
        </summary>

        <div class="mt-4 border-t border-border pt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          @for (rol of rolesConPermisos(); track rol.codigo) {
            <article class="rounded-xl border border-border bg-muted/20 p-4 transition-colors hover:border-primary/40 hover:bg-primary/5">
              <div class="flex items-start gap-3">
                <span class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><i [class]="rol.icono"></i></span>
                <div class="min-w-0">
                  <span class="font-mono text-[9px] font-bold uppercase tracking-wide text-primary">{{ rol.codigo }}</span>
                  <h3 class="mt-1 text-sm font-black text-foreground">{{ rol.nombre }}</h3>
                </div>
              </div>
              <p class="mt-3 min-h-10 text-xs leading-relaxed text-muted-foreground">{{ rol.descripcion }}</p>
              <div class="mt-3 flex items-start gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[10px] text-muted-foreground">
                <i class="pi pi-map-marker mt-0.5 text-primary"></i>
                <span><strong class="text-foreground">Alcance:</strong> {{ rol.alcance }}</span>
              </div>
              <div class="mt-4">
                <p class="text-[10px] font-black uppercase tracking-wider text-foreground">Permisos principales</p>
                <ul class="mt-2 space-y-2">
                  @for (permiso of rol.permisos; track permiso) {
                    <li class="flex items-start gap-2 text-[11px] leading-snug text-muted-foreground"><i class="pi pi-check-circle mt-0.5 shrink-0 text-emerald-600"></i><span>{{ permiso }}</span></li>
                  }
                </ul>
              </div>
            </article>
          }
        </div>

        <div class="mt-4 flex items-start gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2.5 text-[11px] leading-relaxed text-sky-800">
          <i class="pi pi-info-circle mt-0.5 shrink-0"></i>
          <span>El alcance asignado a cada usuario restringe la información académica que puede consultar. La información de docentes, estudiantes, grupos y asignaturas se toma del servicio SEA cuando participa en el proceso.</span>
        </div>
      </details>
      }

      @if (contexto === 'INSTITUCIONAL' && vistaActual() === 'sea') {
      <section class="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="eyebrow">Fuente oficial SEA</p>
            <h2 class="text-lg font-black text-foreground">Sincronización de docentes</h2>
            <p class="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">Analiza la nómina docente de SEA, compara quién tiene acceso y sincroniza cuentas nuevas o ausentes sin eliminar registros históricos.</p>
          </div>
          <div class="flex flex-wrap items-end gap-2">
            <label class="form-label min-w-36">Gestión SEA<input class="field-input" [(ngModel)]="gestionSea" placeholder="2-2026" (keyup.enter)="analizarDocentesSea()"></label>
            <button class="secondary-button" (click)="analizarDocentesSea()" [disabled]="cargandoDocentesSea()"><i [class]="cargandoDocentesSea() ? 'pi pi-spin pi-spinner' : 'pi pi-refresh'"></i> Analizar SEA</button>
          </div>
        </div>

        @if (cargandoDocentesSea()) {
          <div class="message info mt-4"><i class="pi pi-spin pi-spinner"></i><span>Consultando docentes y grupos de la gestión {{ gestionSea }} en SEA...</span></div>
        } @else if (errorDocentesSea()) {
          <div class="message error mt-4"><i class="pi pi-exclamation-circle"></i><span>{{ errorDocentesSea() }}</span></div>
        } @else {
          @if (analisisDocentesSea(); as analisis) {
          <div class="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <div class="metric-card"><span>Docentes en SEA</span><strong>{{ analisis.docentesEnSea }}</strong><small>gestión {{ analisis.gestion }}</small></div>
            <div class="metric-card border-emerald-200 bg-emerald-50/50"><span>Con acceso</span><strong class="text-emerald-700">{{ analisis.conAcceso }}</strong><small>cuenta docente activa</small></div>
            <div class="metric-card border-amber-200 bg-amber-50/50"><span>Nuevos</span><strong class="text-amber-700">{{ analisis.nuevos }}</strong><small>sin cuenta registrada</small></div>
            <div class="metric-card border-orange-200 bg-orange-50/50"><span>Sin acceso</span><strong class="text-orange-700">{{ analisis.sinAcceso }}</strong><small>inactivos o rol distinto</small></div>
            <div class="metric-card border-rose-200 bg-rose-50/50"><span>Ya no están</span><strong class="text-rose-700">{{ analisis.yaNoEstan }}</strong><small>cuentas para desactivar</small></div>
          </div>

          <div class="mt-4 flex flex-col gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex items-start gap-2 text-xs text-muted-foreground"><i class="pi pi-info-circle mt-0.5 text-primary"></i><span>Las cuentas nuevas se crean con el CI como clave temporal y deberán cambiarla en su primer ingreso. Las ausencias se desactivan de forma lógica.</span></div>
            <div class="flex shrink-0 flex-wrap gap-2">
              <button class="secondary-button" (click)="seleccionarSinAcceso()" [disabled]="sincronizandoDocentesSea() || !analisis.nuevos && !analisis.sinAcceso"><i class="pi pi-check-square"></i> Seleccionar sin acceso</button>
              <button class="primary-button" (click)="sincronizarSeleccionados()" [disabled]="sincronizandoDocentesSea() || !seleccionadosDocentesSea().length"><i [class]="sincronizandoDocentesSea() ? 'pi pi-spin pi-spinner' : 'pi pi-user-plus'"></i> Sincronizar selección ({{ seleccionadosDocentesSea().length }})</button>
              <button class="secondary-button" (click)="sincronizarTodos()" [disabled]="sincronizandoDocentesSea() || (!analisis.nuevos && !analisis.sinAcceso && !analisis.yaNoEstan)"><i class="pi pi-sync"></i> Sincronizar todo</button>
            </div>
          </div>

          <div class="sea-filter-toolbar mt-4"><div class="relative min-w-0"><i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"></i><input class="field-input pl-9" [ngModel]="filtroDocenteSea()" (ngModelChange)="filtroDocenteSea.set($event)" placeholder="Buscar docente por CI o nombre..."></div><span class="text-[10px] font-bold text-muted-foreground">{{ docentesSeaFiltrados().length }} registros mostrados</span></div>
          <div class="mt-3 overflow-x-auto rounded-xl border border-border">
            <table class="min-w-full text-left text-xs">
              <thead><tr class="border-b border-border bg-muted/60 text-[10px] uppercase tracking-wider text-muted-foreground"><th class="px-3 py-3">Sel.</th><th class="px-3 py-3">CI</th><th class="px-3 py-3">Docente oficial SEA</th><th class="px-3 py-3">Grupos</th><th class="px-3 py-3">Estado de acceso</th><th class="px-3 py-3 text-right">Acción</th></tr></thead>
              <tbody>
                @for (docente of docentesSeaFiltrados(); track docente.ci) {
                  <tr class="border-b border-border/70 last:border-0 hover:bg-muted/30">
                    <td class="px-3 py-3"><input type="checkbox" [checked]="estaSeleccionado(docente.ci)" (change)="alternarSeleccionDocente(docente)" [disabled]="!puedeSincronizar(docente) || sincronizandoDocentesSea()"></td>
                    <td class="px-3 py-3 align-top"><strong class="font-mono text-primary">{{ docente.ci }}</strong><span class="mt-1 block text-[10px] text-muted-foreground">Identidad oficial SEA</span></td>
                    <td class="px-3 py-3 align-top"><span class="font-bold text-foreground">{{ docente.nombreCompleto }}</span>@if (docente.proveedorIdentidad) { <span class="mt-1 block text-[10px] text-muted-foreground">Cuenta: {{ docente.proveedorIdentidad }}</span> }</td>
                    <td class="px-3 py-3 align-top"><span class="font-mono font-bold text-foreground">{{ docente.gruposSea }}</span></td>
                    <td class="px-3 py-3 align-top"><span [class]="claseEstadoDocente(docente.estado)">{{ etiquetaEstadoDocente(docente.estado) }}</span>@if (docente.estado === 'ROL_DIFERENTE') { <span class="mt-1 block text-[10px] text-rose-700">{{ docente.rolCodigo }}</span> }</td>
                    <td class="px-3 py-3 text-right align-top">@if (puedeSincronizar(docente)) { <button class="icon-button" [title]="docente.estado === 'NUEVO' ? 'Crear acceso' : 'Actualizar acceso'" (click)="sincronizarIndividual(docente)" [disabled]="sincronizandoDocentesSea()"><i class="pi pi-user-plus"></i></button> } @else { <span class="text-[10px] text-muted-foreground">Sin acción</span> }</td>
                  </tr>
                } @empty {
                  <tr><td colspan="6" class="px-4 py-10 text-center text-muted-foreground"><i class="pi pi-users mb-2 block text-2xl"></i>No hay docentes disponibles para la gestión consultada.</td></tr>
                }
              </tbody>
            </table>
          </div>
          }
        }
      </section>
      }

      @if (vistaActual() === 'usuarios') {
      <div class="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div class="filter-toolbar">
          <div class="relative min-w-0 flex-1">
            <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"></i>
            <input class="field-input pl-9" [ngModel]="busqueda()" (ngModelChange)="busqueda.set($event)" placeholder="Buscar por CI, nombre o rol...">
          </div>
          <select class="field-input" [ngModel]="filtroRol()" (ngModelChange)="filtroRol.set($event)">
            <option value="">Todos los roles</option>
            @for (rol of rolesVisibles(); track rol.codigo) { <option [value]="rol.codigo">{{ rol.nombre }}</option> }
          </select>
          <select class="field-input" [ngModel]="filtroEstado()" (ngModelChange)="filtroEstado.set($event)">
            <option value="TODOS">Todos</option><option value="ACTIVOS">Activos</option><option value="INACTIVOS">Inactivos</option>
          </select>
        </div>

        <div class="mt-4 overflow-x-auto rounded-xl border border-border">
          <table class="min-w-full text-left text-xs">
            <thead><tr class="border-b border-border bg-muted/60 text-[10px] uppercase tracking-wider text-muted-foreground">
              <th class="px-4 py-3">Usuario / CI</th><th class="px-4 py-3">Nombre completo SEA</th><th class="px-4 py-3">Rol</th><th class="px-4 py-3">Alcance</th><th class="px-4 py-3">Estado</th><th class="px-4 py-3 text-right">Acciones</th>
            </tr></thead>
            <tbody>
              @for (usuario of usuariosFiltrados(); track usuario.id) {
                <tr class="border-b border-border/70 last:border-0 hover:bg-muted/30">
                  <td class="px-4 py-3 align-top"><strong class="font-mono text-primary">{{ usuario.usuario }}</strong><span class="mt-1 block text-[10px] text-muted-foreground">CI oficial</span></td>
                  <td class="px-4 py-3 align-top"><span class="font-bold text-foreground">{{ usuario.nombreCompleto }}</span><span class="mt-1 block text-[10px] text-muted-foreground">{{ usuario.proveedorIdentidad }}</span></td>
                  <td class="px-4 py-3 align-top"><span class="role-pill">{{ usuario.rolNombre }}</span></td>
                  <td class="px-4 py-3 align-top"><span class="block font-semibold text-foreground">{{ resumenAlcance(usuario) }}</span><span class="mt-1 block max-w-xs text-[10px] text-muted-foreground">{{ nombresAlcance(usuario) }}</span></td>
                  <td class="px-4 py-3 align-top"><span [class]="usuario.activo ? 'status-pill active' : 'status-pill inactive'">{{ usuario.activo ? 'ACTIVO' : 'INACTIVO' }}</span>@if (usuario.debeCambiarContrasena) { <span class="mt-1 block text-[10px] font-bold text-amber-700">Cambiar clave</span> }</td>
                  <td class="px-4 py-3 text-right align-top"><div class="flex justify-end gap-1"><button class="icon-button" title="Editar" (click)="editar(usuario)"><i class="pi pi-pencil"></i></button><button class="icon-button warning" title="Restablecer contraseña" (click)="restablecer(usuario)"><i class="pi pi-key"></i></button></div></td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="px-4 py-12 text-center text-muted-foreground"><i class="pi pi-users mb-2 block text-2xl"></i>No hay usuarios que coincidan con los filtros.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
      }

      @if (formularioAbierto()) {
        <div class="modal-backdrop" (click)="cerrarFormulario()">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <div class="flex items-start justify-between border-b border-border px-6 py-5"><div><p class="eyebrow">Administración de acceso</p><h2 class="text-xl font-black">{{ usuarioEditando ? 'Editar usuario' : 'Registrar usuario' }}</h2><p class="mt-1 text-xs text-muted-foreground">La contraseña inicial será el CI y se exigirá cambiarla en el primer ingreso.</p></div><button class="icon-button" (click)="cerrarFormulario()"><i class="pi pi-times"></i></button></div>
            <form class="space-y-5 p-6" (ngSubmit)="guardar()" #usuarioForm="ngForm">
              <div class="grid gap-4 md:grid-cols-2"><label class="form-label">CI / Usuario<input class="field-input" name="ci" [(ngModel)]="form.ci" required [disabled]="guardando()"></label><label class="form-label">Rol<select class="field-input" name="rol" [(ngModel)]="form.rolCodigo" (ngModelChange)="cambiarRol($event)" required [disabled]="guardando()"><option value="">Seleccionar rol</option>@for (rol of rolesPermitidos(); track rol.codigo) {<option [value]="rol.codigo">{{ rol.nombre }}</option>}</select></label></div>
              <label class="form-label">Nombre completo (tal como llega de SEA)<input class="field-input" name="nombre" [(ngModel)]="form.nombreCompleto" required [disabled]="guardando()"><small>Se conserva el orden: nombres, apellido 1 y apellido 2, exactamente como se recibe.</small></label>
              <label class="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 text-xs font-bold"><input type="checkbox" name="activo" [(ngModel)]="form.activo"> Usuario activo y habilitado para ingresar</label>

              @if (requiereAsignacionesAcademicas()) {
                <div class="assignment-panel">
                  <div class="section-title"><i class="pi pi-sitemap"></i><span>Asignaciones académicas</span><small>agrega cada relación por separado</small></div>
                  <p class="assignment-help">Un mismo usuario puede tener distintas combinaciones de sede, carrera y asignatura.</p>
                  <div class="grid gap-3 md:grid-cols-3">
                    <label class="form-label">Sede<select class="field-input" name="sedeAsignacion" [(ngModel)]="sedeAsignacionCodigo" (ngModelChange)="cambiarSedeAsignacion($event)" [disabled]="guardando()"><option value="">Seleccionar sede...</option>@for (sede of sedes; track sede.code) {<option [value]="sede.code">{{ sede.code }} · {{ sede.name }}</option>}</select></label>
                    @if (mostrarCarrerasAsignacion()) {
                      <label class="form-label">Carrera<select class="field-input" name="carreraAsignacion" [(ngModel)]="carreraAsignacionCodigo" (ngModelChange)="cambiarCarreraAsignacion($event)" [disabled]="guardando()"><option value="">Seleccionar carrera...</option>@for (carrera of carrerasAsignacion; track carrera.careerCode) {<option [value]="carrera.careerCode">{{ carrera.careerCode }} · {{ carrera.careerName }}</option>}</select></label>
                    }
                    @if (esDocenteSeleccionado() && carreraAsignacionCodigo) {
                      <label class="form-label">Asignatura<select class="field-input" name="asignaturaAsignacion" [(ngModel)]="asignaturaAsignacionCodigo" [disabled]="guardando() || cargandoAsignaturas"><option value="">{{ cargandoAsignaturas ? 'Cargando...' : 'Seleccionar asignatura...' }}</option>@for (asignatura of asignaturasAsignacion; track asignatura.courseCode) {<option [value]="asignatura.courseCode">{{ asignatura.courseCode }} · {{ asignatura.courseName }}</option>}</select></label>
                    }
                  </div>
                  @if (!sedeAsignacionCodigo) { <p class="assignment-empty">Selecciona una sede para habilitar la selección de carreras.</p> }
                  @if (sedeAsignacionCodigo && !carrerasAsignacion.length && !cargandoCarreras) { <p class="assignment-empty">No hay carreras disponibles para la sede seleccionada.</p> }
                  <button type="button" class="secondary-button mt-3" (click)="agregarAsignacion()" [disabled]="guardando() || !puedeAgregarAsignacion()"><i class="pi pi-plus"></i> Agregar asignación</button>
                  @if (asignacionesSeleccionadas.length) {
                    <div class="assignment-list mt-3">
                      @for (asignacion of asignacionesSeleccionadas; track claveAsignacion(asignacion)) {
                        <div class="assignment-row"><div><strong>{{ asignacion.sedeCodigo }} · {{ asignacion.carreraCodigo }}</strong><small>{{ asignacion.sedeNombre }} · {{ asignacion.carreraNombre }}@if (asignacion.asignaturaCodigo) { · {{ asignacion.asignaturaCodigo }} · {{ asignacion.asignaturaNombre }}}</small></div><button type="button" class="icon-button" title="Quitar asignación" (click)="quitarAsignacion(asignacion)"><i class="pi pi-times"></i></button></div>
                      }
                    </div>
                  } @else { <p class="assignment-empty">Aún no hay asignaciones agregadas.</p> }
                </div>
              } @else if (esPersonalEvaluacionesSeleccionado()) {
                <div class="assignment-panel campus-access-panel">
                  <div class="section-title"><i class="pi pi-map-marker"></i><span>Sedes y campus asignados</span><small>puedes marcar varias sedes y campus</small></div>
                  <p class="assignment-help">El personal podrá trabajar únicamente con los campus habilitados. Puedes deshabilitar un campus temporalmente sin eliminar la asignación.</p>
                  <div class="check-grid">@for (sede of sedes; track sede.code) {<label class="check-item"><input type="checkbox" [checked]="tieneSede(sede.code)" (change)="alternarSede(sede)"><span><strong>{{ sede.code }}</strong><small>{{ sede.name }}</small></span></label>}</div>
                  @if (!sedes.length) {<p class="empty-note">No se pudieron cargar las sedes desde SEA.</p>}
                  @for (sede of sedesParaCampus(); track sede.code) {
                    <div class="campus-group">
                      <div class="campus-group-title"><span><strong>{{ sede.code }}</strong> · {{ sede.name }}</span><small>Campus autorizados</small></div>
                      @if (!campusDeSede(sede.code).length) {<p class="assignment-empty">No hay campus disponibles para esta sede.</p>}
                      <div class="check-grid campus-grid">@for (campus of campusDeSede(sede.code); track campus.campusId || campus.code || campus.name) {<label class="check-item" [class.campus-disabled]="tieneCampus(sede.code, campus) && !campusHabilitado(sede.code, campus)"><input type="checkbox" [checked]="tieneCampus(sede.code, campus)" (change)="alternarCampus(sede, campus)"><span><strong>{{ campus.code || campus.campusId || 'Campus' }}</strong><small>{{ campus.name }}</small></span>@if (tieneCampus(sede.code, campus)) {<button type="button" class="campus-status" [class.enabled]="campusHabilitado(sede.code, campus)" (click)="$event.preventDefault(); $event.stopPropagation(); alternarEstadoCampus(sede.code, campus)" [title]="campusHabilitado(sede.code, campus) ? 'Deshabilitar campus' : 'Habilitar campus'"><i [class]="campusHabilitado(sede.code, campus) ? 'pi pi-check-circle' : 'pi pi-ban'"></i>{{ campusHabilitado(sede.code, campus) ? 'Habilitado' : 'Deshabilitado' }}</button>}</label>}</div>
                    </div>
                  }
                </div>
              } @else if (esRolConAlcanceSimple()) {
                <div><div class="section-title"><i class="pi pi-building"></i><span>Sedes asignadas</span><small>puedes marcar varias</small></div><div class="check-grid">@for (sede of sedes; track sede.code) {<label class="check-item"><input type="checkbox" [checked]="tieneSede(sede.code)" (change)="alternarSede(sede)"><span><strong>{{ sede.code }}</strong><small>{{ sede.name }}</small></span></label>}</div>@if (!sedes.length) {<p class="empty-note">No se pudieron cargar las sedes desde SEA.</p>}</div>
              }
              @if (error()) {<div class="message error"><i class="pi pi-exclamation-circle"></i>{{ error() }}</div>}
              <div class="flex justify-end gap-2 border-t border-border pt-5"><button type="button" class="secondary-button" (click)="cerrarFormulario()">Cancelar</button><button type="submit" class="primary-button" [disabled]="usuarioForm.invalid || guardando()">@if (guardando()) {<i class="pi pi-spin pi-spinner"></i> Guardando...} @else {Guardar usuario}</button></div>
            </form>
          </div>
        </div>
      }

      @if (resultadoImportacion()) {<div class="modal-backdrop" (click)="resultadoImportacion.set(null)"><div class="modal-card compact" (click)="$event.stopPropagation()"><div class="flex items-start justify-between border-b border-border px-6 py-5"><div><p class="eyebrow">Importación finalizada</p><h2 class="text-xl font-black">Resultado del lote</h2></div><button class="icon-button" (click)="resultadoImportacion.set(null)"><i class="pi pi-times"></i></button></div><div class="grid grid-cols-3 gap-3 p-6"><div class="result-box"><strong>{{ resultadoImportacion()!.totalFilas }}</strong><span>filas</span></div><div class="result-box success"><strong>{{ resultadoImportacion()!.creados }}</strong><span>creados</span></div><div class="result-box"><strong>{{ resultadoImportacion()!.actualizados }}</strong><span>actualizados</span></div></div>@if (resultadoImportacion()!.credencialesTemporales.length) {<div class="px-6 pb-5"><div class="message info"><i class="pi pi-info-circle"></i>Las credenciales nuevas se muestran una sola vez. Entrégalas de forma segura.</div><div class="mt-3 max-h-52 overflow-auto rounded-xl border border-border"><table class="min-w-full text-xs"><thead class="bg-muted/60"><tr><th class="p-2 text-left">CI</th><th class="p-2 text-left">Nombre</th><th class="p-2 text-left">Clave inicial</th></tr></thead><tbody>@for (item of resultadoImportacion()!.credencialesTemporales; track item.fila) {<tr class="border-t border-border"><td class="p-2 font-mono">{{ item.ci }}</td><td class="p-2">{{ item.nombreCompleto }}</td><td class="p-2 font-mono font-bold text-primary">{{ item.contrasenaTemporal }}</td></tr>}</tbody></table></div></div>}@if (resultadoImportacion()!.errores.length) {<div class="mx-6 mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800"><strong>Filas observadas:</strong>@for (error of resultadoImportacion()!.errores; track error.fila) {<div>Fila {{ error.fila }} · {{ error.detalle }}</div>}</div>}<div class="flex justify-end border-t border-border px-6 py-4"><button class="primary-button" (click)="resultadoImportacion.set(null)">Cerrar</button></div></div></div>}
      @if (resultadoSincronizacion()) {<div class="modal-backdrop" (click)="resultadoSincronizacion.set(null)"><div class="modal-card compact" (click)="$event.stopPropagation()"><div class="flex items-start justify-between border-b border-border px-6 py-5"><div><p class="eyebrow">Sincronización SEA finalizada</p><h2 class="text-xl font-black">Resultado de la operación</h2></div><button class="icon-button" (click)="resultadoSincronizacion.set(null)"><i class="pi pi-times"></i></button></div><div class="grid grid-cols-2 gap-3 p-6 sm:grid-cols-4"><div class="result-box"><strong>{{ resultadoSincronizacion()!.solicitados }}</strong><span>procesados</span></div><div class="result-box success"><strong>{{ resultadoSincronizacion()!.creados }}</strong><span>creados</span></div><div class="result-box"><strong>{{ resultadoSincronizacion()!.actualizados }}</strong><span>actualizados</span></div><div class="result-box"><strong>{{ resultadoSincronizacion()!.desactivados }}</strong><span>desactivados</span></div></div>@if (resultadoSincronizacion()!.credencialesTemporales.length) {<div class="px-6 pb-5"><div class="message info"><i class="pi pi-info-circle"></i>Las credenciales nuevas se muestran una sola vez. Entrégalas de forma segura.</div><div class="mt-3 max-h-52 overflow-auto rounded-xl border border-border"><table class="min-w-full text-xs"><thead class="bg-muted/60"><tr><th class="p-2 text-left">CI</th><th class="p-2 text-left">Docente</th><th class="p-2 text-left">Clave inicial</th></tr></thead><tbody>@for (item of resultadoSincronizacion()!.credencialesTemporales; track item.ci) {<tr class="border-t border-border"><td class="p-2 font-mono">{{ item.ci }}</td><td class="p-2">{{ item.nombreCompleto }}</td><td class="p-2 font-mono font-bold text-primary">{{ item.contrasenaTemporal }}</td></tr>}</tbody></table></div></div>}@if (resultadoSincronizacion()!.errores.length) {<div class="mx-6 mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800"><strong>Observaciones:</strong>@for (error of resultadoSincronizacion()!.errores; track error.ci + error.fila) {<div>{{ error.ci }} · {{ error.detalle }}</div>}</div>}<div class="flex justify-end border-t border-border px-6 py-4"><button class="primary-button" (click)="resultadoSincronizacion.set(null)">Cerrar</button></div></div></div>}
      @if (credencialMostrada()) {<div class="toast-credential"><i class="pi pi-key"></i><div><strong>Contraseña temporal restablecida</strong><span>CI: {{ credencialMostrada()!.ci }} · Clave: <b>{{ credencialMostrada()!.contrasenaTemporal }}</b></span></div><button (click)="credencialMostrada.set(null)"><i class="pi pi-times"></i></button></div>}
      @if (mensaje()) {<div class="toast-message" [class.error-toast]="mensajeTipo() === 'error'"><i [class]="mensajeTipo() === 'error' ? 'pi pi-exclamation-circle' : 'pi pi-check-circle'"></i>{{ mensaje() }}</div>}
    </section>
  `,
  styles: [`
    :host { display: block; } details > summary::-webkit-details-marker { display:none; } details[open] > summary > span { transform:rotate(180deg); } .view-tabs { display:flex; gap:.35rem; overflow-x:auto; padding:.3rem; border:1px solid var(--surface-border); border-radius:.9rem; background:var(--surface-ground); } .view-tab { display:inline-flex; align-items:center; justify-content:center; gap:.5rem; min-height:2.65rem; padding:.65rem .85rem; border:1px solid transparent; border-radius:.65rem; background:transparent; color:var(--text-color-secondary); font-size:.72rem; font-weight:800; white-space:nowrap; cursor:pointer; transition:all 150ms ease; } .view-tab:hover { color:var(--primary-color); background:var(--sea-primary-soft); } .view-tab.active { border-color:var(--primary-color); background:var(--surface-card); color:var(--primary-color); box-shadow:0 4px 12px rgba(15,23,42,.06); } .view-tab small { min-width:1.35rem; padding:.18rem .35rem; border-radius:999px; background:var(--surface-ground); color:var(--text-color-secondary); font-size:.6rem; text-align:center; } .view-tab.active small { background:var(--sea-primary-soft); color:var(--primary-color); } .filter-toolbar { display:grid; grid-template-columns:minmax(0,1fr) minmax(10rem,16rem) minmax(9rem,12rem); gap:.65rem; align-items:center; } .sea-filter-toolbar { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:.65rem; align-items:center; } .metric-card { padding: 1rem 1.15rem; border: 1px solid var(--surface-border); border-radius: 1rem; background: var(--surface-card); box-shadow: 0 4px 15px rgba(15,23,42,.04); } .metric-card span,.metric-card small { display:block; color:var(--text-color-secondary); font-size:.68rem; font-weight:700; } .metric-card strong { display:block; margin:.25rem 0; color:var(--text-color); font-size:1.5rem; font-weight:900; } .secondary-button,.primary-button { display:inline-flex; align-items:center; justify-content:center; gap:.45rem; min-height:2.45rem; padding:.65rem .85rem; border-radius:.7rem; font-size:.72rem; font-weight:800; transition:all 150ms ease; } .secondary-button { border:1px solid var(--surface-border); background:var(--surface-card); color:var(--text-color); } .secondary-button:hover { border-color:var(--primary-color); color:var(--primary-color); } .primary-button { border:1px solid var(--primary-color); background:var(--primary-color); color:#fff; } .primary-button:hover { filter:brightness(.94); box-shadow:0 7px 16px var(--sea-primary-ring); } .field-input { width:100%; min-height:2.45rem; padding:.65rem .75rem; border:1px solid var(--surface-border); border-radius:.65rem; background:var(--surface-ground); color:var(--text-color); outline:none; font:inherit; font-size:.75rem; } .field-input:focus { border-color:var(--primary-color); box-shadow:0 0 0 3px var(--sea-primary-ring); } .role-pill,.status-pill { display:inline-flex; border-radius:999px; padding:.3rem .55rem; font-size:.62rem; font-weight:800; } .role-pill { background:var(--sea-primary-soft); color:var(--primary-color); } .status-pill.active { background:#dcfce7; color:#047857; } .status-pill.warning { background:#fef3c7; color:#92400e; } .status-pill.inactive { background:#f1f5f9; color:#64748b; } .icon-button { display:inline-grid; width:2rem; height:2rem; place-items:center; border:1px solid var(--surface-border); border-radius:.55rem; background:var(--surface-card); color:var(--text-color-secondary); cursor:pointer; } .icon-button:hover { color:var(--primary-color); border-color:var(--primary-color); } .icon-button.warning:hover { color:#b45309; border-color:#f59e0b; } .modal-backdrop { position:fixed; inset:0; z-index:1000; display:grid; place-items:center; padding:1rem; background:rgba(15,23,42,.62); } .modal-card { width:min(100%, 50rem); max-height:calc(100vh - 2rem); overflow:auto; border:1px solid var(--surface-border); border-radius:1rem; background:var(--surface-card); color:var(--text-color); box-shadow:0 25px 70px rgba(15,23,42,.25); } .modal-card.compact { width:min(100%, 42rem); } .eyebrow { margin:0 0 .35rem; color:var(--primary-color); font-size:.62rem; font-weight:900; letter-spacing:.12em; text-transform:uppercase; } .form-label { display:grid; gap:.4rem; color:var(--text-color); font-size:.68rem; font-weight:800; text-transform:uppercase; letter-spacing:.04em; } .form-label small { color:var(--text-color-secondary); font-size:.62rem; font-weight:600; text-transform:none; letter-spacing:0; } .section-title { display:flex; align-items:center; gap:.45rem; margin-bottom:.55rem; color:var(--text-color); font-size:.75rem; font-weight:900; } .section-title i { color:var(--primary-color); } .section-title small { margin-left:auto; color:var(--text-color-secondary); font-size:.62rem; font-weight:600; } .assignment-panel { padding: .85rem; border: 1px solid color-mix(in srgb, var(--primary-color) 18%, var(--surface-border)); border-radius: .85rem; background: color-mix(in srgb, var(--sea-primary-soft) 42%, var(--surface-card)); } .assignment-help { margin: -.2rem 0 .8rem; color: var(--text-color-secondary); font-size: .68rem; } .assignment-list { display: grid; gap: .45rem; max-height: 11rem; overflow: auto; } .assignment-row { display:flex; align-items:center; justify-content:space-between; gap:.7rem; padding:.6rem .7rem; border:1px solid var(--surface-border); border-radius:.65rem; background:var(--surface-card); } .assignment-row strong,.assignment-row small { display:block; } .assignment-row strong { color:var(--text-color); font-size:.7rem; } .assignment-row small { margin-top:.15rem; color:var(--text-color-secondary); font-size:.61rem; line-height:1.35; } .assignment-empty { margin:.65rem 0 0; color:var(--text-color-secondary); font-size:.68rem; } .check-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(12rem,1fr)); gap:.5rem; max-height:10rem; overflow:auto; padding:.1rem; } .check-item { display:flex; align-items:flex-start; gap:.5rem; padding:.6rem; border:1px solid var(--surface-border); border-radius:.65rem; background:var(--surface-ground); cursor:pointer; } .check-item:has(input:checked) { border-color:var(--primary-color); background:var(--sea-primary-soft); } .check-item input { margin-top:.16rem; accent-color:var(--primary-color); } .check-item strong,.check-item small { display:block; } .check-item strong { color:var(--text-color); font-size:.69rem; } .check-item small { margin-top:.15rem; color:var(--text-color-secondary); font-size:.61rem; line-height:1.3; } .empty-note { color:#b45309; font-size:.7rem; } .message { display:flex; gap:.5rem; padding:.7rem .8rem; border-radius:.65rem; font-size:.72rem; line-height:1.45; } .message.error { border:1px solid var(--sea-danger-border); background:var(--sea-danger-soft); color:var(--sea-danger); } .message.info { border:1px solid #bae6fd; background:#f0f9ff; color:#0369a1; } .result-box { display:grid; place-items:center; padding:.8rem; border:1px solid var(--surface-border); border-radius:.75rem; background:var(--surface-ground); } .result-box strong { font-size:1.4rem; } .result-box span { color:var(--text-color-secondary); font-size:.65rem; } .result-box.success { border-color:#a7f3d0; background:#ecfdf5; color:#047857; } .toast-message,.toast-credential { position:fixed; right:1.5rem; bottom:1.5rem; z-index:1100; display:flex; align-items:center; gap:.65rem; padding:.8rem 1rem; border-radius:.75rem; background:#0f172a; color:#fff; box-shadow:0 12px 30px rgba(15,23,42,.22); font-size:.75rem; } .toast-message i { color:#6ee7b7; } .error-toast i { color:#fca5a5; } .toast-credential { bottom:5.5rem; background:#047857; } .toast-credential span { display:block; margin-top:.2rem; font-size:.68rem; } .toast-credential button { margin-left:.5rem; color:#fff; } @media(max-width:700px) { .filter-toolbar,.sea-filter-toolbar { grid-template-columns:1fr; } .view-tab { flex:1 0 auto; } } @media(max-width:640px) { .toast-message,.toast-credential { left:1rem; right:1rem; } }
  `,
    `.campus-group { margin-top:.8rem; padding-top:.75rem; border-top:1px solid var(--surface-border); } .campus-group-title { display:flex; justify-content:space-between; gap:.75rem; margin-bottom:.45rem; color:var(--text-color); font-size:.7rem; } .campus-group-title small { color:var(--text-color-secondary); font-size:.61rem; } .campus-grid { max-height:none; } .campus-disabled { opacity:.7; } .campus-status { margin-left:auto; display:inline-flex; align-items:center; gap:.25rem; border:0; border-radius:999px; padding:.25rem .4rem; background:#fef2f2; color:#b91c1c; font-size:.56rem; font-weight:800; cursor:pointer; } .campus-status.enabled { background:#ecfdf5; color:#047857; }`
  ]
})
export class UsuariosSistemaComponent implements OnInit {
  @Input() contexto: 'EVALUACIONES' | 'INSTITUCIONAL' = 'INSTITUCIONAL';

  private readonly service = inject(UsuariosSistemaService);
  private readonly gateway = inject(UnitepcGatewayService);
  private readonly auth = inject(AuthService);
  private readonly feedback = inject(UiFeedbackService);

  public readonly usuarios = signal<UsuarioSistema[]>([]);
  public readonly roles = signal<RolSistema[]>([]);
  public readonly formularioAbierto = signal(false);
  public readonly resultadoImportacion = signal<ImportacionUsuariosResponse | null>(null);
  public readonly resultadoSincronizacion = signal<SincronizacionDocentesSeaResponse | null>(null);
  public readonly analisisDocentesSea = signal<AnalisisDocentesSeaResponse | null>(null);
  public readonly cargandoDocentesSea = signal(false);
  public readonly sincronizandoDocentesSea = signal(false);
  public readonly errorDocentesSea = signal<string | null>(null);
  public readonly seleccionadosDocentesSea = signal<string[]>([]);
  public readonly credencialMostrada = signal<CredencialTemporal | null>(null);
  public readonly error = signal<string | null>(null);
  public readonly mensaje = signal<string | null>(null);
  public readonly mensajeTipo = signal<'success' | 'error'>('success');
  public readonly guardando = signal(false);
  public readonly vistaActual = signal<'usuarios' | 'sea' | 'roles'>('usuarios');
  public readonly busqueda = signal('');
  public readonly filtroRol = signal('');
  public readonly filtroEstado = signal<'TODOS' | 'ACTIVOS' | 'INACTIVOS'>('TODOS');
  public gestionSea = '2-2026';
  public readonly filtroDocenteSea = signal('');
  public sedes: BranchOffice[] = [];
  public carreras: Career[] = [];
  public carrerasAsignacion: Career[] = [];
  public asignaturasAsignacion: Course[] = [];
  public sedeAsignacionCodigo = '';
  public carreraAsignacionCodigo = '';
  public asignaturaAsignacionCodigo = '';
  public cargandoCarreras = false;
  public cargandoAsignaturas = false;
  public asignacionesSeleccionadas: AsignacionAcademica[] = [];
  public campusesPorSede = new Map<string, Campus[]>();
  public usuarioEditando: UsuarioSistema | null = null;
  public form: UsuarioSistemaRequest = this.formularioVacio();
  private sedesSeleccionadas = new Map<string, AlcanceAcademico>();
  private carrerasSeleccionadas = new Map<string, AlcanceAcademico>();
  private campusesSeleccionados = new Map<string, AlcanceCampus>();

  private readonly rolesDeEvaluaciones = new Set(['RESPONSABLE_EVALUACIONES', 'PERSONAL_EVALUACIONES']);
  private readonly rolesInstitucionales = new Set(['ADMINISTRADOR_SISTEMA', 'DIRECTOR_CARRERA', 'DOCENTE', 'VICERRECTOR']);

  private readonly catalogoRolesBase: RolCatalogo[] = [
    {
      codigo: 'ADMINISTRADOR_SISTEMA',
      nombre: 'Administrador del sistema',
      descripcion: 'Administra la configuración global, las cuentas internas y la seguridad del sistema.',
      alcance: 'Toda la institución',
      permisos: [
        'Administrar usuarios, roles y alcances académicos.',
        'Configurar parámetros y catálogos operativos.',
        'Gestionar bancos, roles de examen y evaluaciones.',
        'Consultar reportes y trazabilidad de las operaciones.'
      ],
      icono: 'pi pi-shield'
    },
    {
      codigo: 'RESPONSABLE_EVALUACIONES',
      nombre: 'Responsable de evaluaciones',
      descripcion: 'Coordina el ciclo institucional de las evaluaciones y supervisa su cumplimiento.',
      alcance: 'Evaluaciones institucionales autorizadas',
      permisos: [
        'Gestionar roles de examen y programación de exámenes.',
        'Validar bancos y solicitar la generación de documentos.',
        'Administrar los estados de las evaluaciones.',
        'Supervisar calificación OMR y reportes.'
      ],
      icono: 'pi pi-briefcase'
    },
    {
      codigo: 'PERSONAL_EVALUACIONES',
      nombre: 'Personal de evaluaciones',
      descripcion: 'Opera las actividades diarias de preparación, entrega, recepción y calificación.',
      alcance: 'Sedes y campus asignados',
      permisos: [
        'Consultar roles de examen asignados.',
        'Generar e imprimir exámenes y cartillas.',
        'Registrar la entrega y devolución del material.',
        'Procesar lecturas y observaciones OMR.'
      ],
      icono: 'pi pi-file-edit'
    },
    {
      codigo: 'DIRECTOR_CARRERA',
      nombre: 'Director de carrera',
      descripcion: 'Supervisa la programación y el seguimiento de las evaluaciones de sus carreras asignadas.',
      alcance: 'Carreras y sedes asignadas',
      permisos: [
        'Consultar el plan de estudios de su alcance.',
        'Registrar y consultar roles de examen de sus carreras.',
        'Dar seguimiento a estados y cronogramas.',
        'Consultar resultados y reportes de su alcance.'
      ],
      icono: 'pi pi-sitemap'
    },
    {
      codigo: 'DOCENTE',
      nombre: 'Docente',
      descripcion: 'Prepara el contenido de sus evaluaciones y registra notas cuando el flujo lo habilita.',
      alcance: 'Materias, grupos y sedes asignadas',
      permisos: [
        'Cargar y gestionar su banco o documento de evaluación.',
        'Consultar sus roles de examen, grupos y estudiantes del SEA.',
        'Ingresar a la sala virtual cuando corresponda.',
        'Cargar notas en evaluaciones habilitadas para el docente.'
      ],
      icono: 'pi pi-user'
    },
    {
      codigo: 'VICERRECTOR',
      nombre: 'Vicerrector',
      descripcion: 'Consulta información consolidada para la supervisión académica institucional.',
      alcance: 'Sedes asignadas',
      permisos: [
        'Consultar evaluaciones y su trazabilidad.',
        'Consultar resultados y reportes consolidados.',
        'Supervisar indicadores académicos del alcance asignado.',
        'Sin permisos de edición operativa.'
      ],
      icono: 'pi pi-chart-bar'
    }
  ];

  public readonly rolesConPermisos = computed<RolCatalogo[]>(() => {
    const codigosVisibles = this.codigosRolesContexto();
    const rolesDelServicio = new Map(this.roles().map(rol => [rol.codigo, rol]));
    const rolesBase = this.catalogoRolesBase.filter(rol => codigosVisibles.has(rol.codigo)).map(rol => {
      const rolDelServicio = rolesDelServicio.get(rol.codigo);
      return rolDelServicio ? { ...rol, nombre: rolDelServicio.nombre, descripcion: rolDelServicio.descripcion || rol.descripcion } : rol;
    });
    const rolesNoDocumentados = this.roles().filter(rol => codigosVisibles.has(rol.codigo) && !this.catalogoRolesBase.some(base => base.codigo === rol.codigo)).map(rol => ({
      ...rol,
      descripcion: rol.descripcion || 'Perfil institucional definido en el servicio de acceso.',
      alcance: 'Definido por administración',
      permisos: ['Permisos pendientes de documentar en este catálogo.'],
      icono: 'pi pi-users'
    }));
    return [...rolesBase, ...rolesNoDocumentados];
  });

  public readonly rolesVisibles = computed(() => this.roles().filter(rol => this.codigosRolesContexto().has(rol.codigo)));
  public readonly usuariosVisibles = computed(() => this.usuarios().filter(usuario => this.codigosRolesContexto().has(usuario.rol)));
  public readonly activos = computed(() => this.usuariosVisibles().filter(item => item.activo).length);
  public readonly pendientesClave = computed(() => this.usuariosVisibles().filter(item => item.debeCambiarContrasena).length);
  public readonly usuariosFiltrados = computed(() => {
    const query = this.busqueda().trim().toLowerCase();
    const rol = this.filtroRol();
    const estado = this.filtroEstado();
    return this.usuariosVisibles().filter(item => {
      const texto = `${item.ci} ${item.usuario} ${item.nombreCompleto} ${item.rolNombre}`.toLowerCase();
      return (!query || texto.includes(query)) && (!rol || item.rol === rol) && (estado === 'TODOS' || (estado === 'ACTIVOS' ? item.activo : !item.activo));
    });
  });
  public readonly docentesSeaFiltrados = computed(() => {
    const analisis = this.analisisDocentesSea();
    const query = this.filtroDocenteSea().trim().toLowerCase();
    return (analisis?.docentes || []).filter(item => !query || `${item.ci} ${item.nombreCompleto} ${item.estado}`.toLowerCase().includes(query));
  });

  public ngOnInit(): void {
    this.cargarUsuarios();
    this.service.listarRoles().subscribe({ next: roles => this.roles.set(roles), error: error => this.mostrarError(error) });
    this.cargarCatalogo();
    this.analizarDocentesSea();
  }

  public rolesPermitidos(): RolSistema[] {
    return this.auth.usuario()?.rol === 'ADMINISTRADOR_SISTEMA'
      ? this.rolesVisibles()
      : this.rolesVisibles().filter(rol => rol.codigo !== 'ADMINISTRADOR_SISTEMA');
  }

  public cambiarVista(vista: 'usuarios' | 'sea' | 'roles'): void { this.vistaActual.set(vista); }

  private codigosRolesContexto(): Set<string> {
    return this.contexto === 'EVALUACIONES' ? this.rolesDeEvaluaciones : this.rolesInstitucionales;
  }

  public abrirNuevo(): void {
    this.usuarioEditando = null; this.form = this.formularioVacio(); this.sedesSeleccionadas.clear(); this.carrerasSeleccionadas.clear(); this.campusesSeleccionados.clear(); this.campusesPorSede.clear(); this.limpiarConstructorAsignaciones(); this.error.set(null); this.formularioAbierto.set(true);
  }

  public editar(usuario: UsuarioSistema): void {
    const campuses = [...(usuario.campuses || [])];
    this.usuarioEditando = usuario; this.form = { ci: usuario.ci, nombreCompleto: usuario.nombreCompleto, rolCodigo: usuario.rol, activo: usuario.activo, sedes: [...usuario.sedes], carreras: [...usuario.carreras], campuses, asignaciones: [...(usuario.asignaciones || [])] }; this.sedesSeleccionadas = new Map(usuario.sedes.map(item => [item.codigo, item])); this.carrerasSeleccionadas = new Map(usuario.carreras.map(item => [item.codigo, item])); this.campusesSeleccionados = new Map(campuses.map(item => [this.claveCampus(item.sedeCodigo, item), item])); this.campusesPorSede.clear(); this.asignacionesSeleccionadas = [...(usuario.asignaciones || [])]; this.limpiarSeleccionAsignacion(); this.error.set(null); this.formularioAbierto.set(true);
    this.sedesParaCampus().forEach(sede => this.cargarCampusSede(sede));
  }

  public cerrarFormulario(): void { if (!this.guardando()) this.formularioAbierto.set(false); }

  public tieneSede(codigo: string): boolean { return this.sedesSeleccionadas.has(codigo); }
  public tieneCarrera(codigo: string): boolean { return this.carrerasSeleccionadas.has(codigo); }
  public alternarSede(sede: BranchOffice): void {
    if (this.tieneSede(sede.code)) {
      this.sedesSeleccionadas.delete(sede.code);
      [...this.campusesSeleccionados.keys()].filter(clave => clave.startsWith(`${sede.code}|`)).forEach(clave => this.campusesSeleccionados.delete(clave));
    } else {
      this.sedesSeleccionadas.set(sede.code, { codigo: sede.code, nombre: sede.name });
      this.cargarCampusSede(sede);
    }
  }
  public alternarCarrera(carrera: Career): void { this.tieneCarrera(carrera.careerCode) ? this.carrerasSeleccionadas.delete(carrera.careerCode) : this.carrerasSeleccionadas.set(carrera.careerCode, { codigo: carrera.careerCode, nombre: carrera.careerName }); }

  public esPersonalEvaluacionesSeleccionado(): boolean { return this.form.rolCodigo === 'PERSONAL_EVALUACIONES'; }
  public sedesParaCampus(): BranchOffice[] { return this.sedes.filter(sede => this.tieneSede(sede.code)); }
  public campusDeSede(sedeCodigo: string): Campus[] { return this.campusesPorSede.get(sedeCodigo) || []; }
  public cargarCampusSede(sede: BranchOffice): void {
    if (this.campusesPorSede.has(sede.code)) return;
    this.gateway.getCampuses(sede.branchOfficeId).pipe(catchError(() => of([] as Campus[]))).subscribe(campuses => {
      this.campusesPorSede.set(sede.code, [...campuses].sort((a, b) => (a.code || a.name).localeCompare(b.code || b.name)));
      this.campusesPorSede = new Map(this.campusesPorSede);
    });
  }
  public claveCampus(sedeCodigo: string, campus: Campus | AlcanceCampus): string {
    const item = campus as Campus & AlcanceCampus;
    return `${sedeCodigo}|${item.campusId || item.campusCodigo || item.code || item.campusNombre || item.name}`;
  }
  public tieneCampus(sedeCodigo: string, campus: Campus): boolean { return this.campusesSeleccionados.has(this.claveCampus(sedeCodigo, campus)); }
  public campusHabilitado(sedeCodigo: string, campus: Campus): boolean { return this.campusesSeleccionados.get(this.claveCampus(sedeCodigo, campus))?.habilitado ?? false; }
  public alternarCampus(sede: BranchOffice, campus: Campus): void {
    const clave = this.claveCampus(sede.code, campus);
    if (this.campusesSeleccionados.has(clave)) {
      this.campusesSeleccionados.delete(clave);
    } else {
      this.campusesSeleccionados.set(clave, { sedeCodigo: sede.code, sedeNombre: sede.name, campusId: campus.campusId || '', campusCodigo: campus.code || '', campusNombre: campus.name, habilitado: true });
    }
  }
  public alternarEstadoCampus(sedeCodigo: string, campus: Campus): void {
    const clave = this.claveCampus(sedeCodigo, campus);
    const actual = this.campusesSeleccionados.get(clave);
    if (actual) this.campusesSeleccionados.set(clave, { ...actual, habilitado: !actual.habilitado });
  }

  public cambiarRol(rol: string): void {
    this.limpiarConstructorAsignaciones();
    // Las asignaciones pertenecen al tipo de rol; nunca se arrastran al cambiar
    // entre docente, director u otro perfil.
    this.asignacionesSeleccionadas = [];
    this.campusesSeleccionados.clear();
    if (rol === 'PERSONAL_EVALUACIONES') this.sedesSeleccionadas.clear();
  }

  public requiereAsignacionesAcademicas(): boolean {
    return this.esRolDeAsignaciones(this.form.rolCodigo);
  }

  public esDocenteSeleccionado(): boolean { return this.form.rolCodigo === 'DOCENTE'; }

  public esRolConAlcanceSimple(): boolean {
    return !this.requiereAsignacionesAcademicas();
  }

  public mostrarCarrerasAsignacion(): boolean {
    return this.requiereAsignacionesAcademicas() && !!this.sedeAsignacionCodigo;
  }

  public cambiarSedeAsignacion(codigo: string): void {
    this.sedeAsignacionCodigo = codigo || '';
    this.carreraAsignacionCodigo = '';
    this.asignaturaAsignacionCodigo = '';
    this.carrerasAsignacion = [];
    this.asignaturasAsignacion = [];
    if (!this.sedeAsignacionCodigo) return;
    this.cargandoCarreras = true;
    this.gateway.getCareers(this.sedeAsignacionCodigo).pipe(catchError(() => of([] as Career[]))).subscribe(carreras => {
      this.carrerasAsignacion = [...carreras].sort((a, b) => a.careerCode.localeCompare(b.careerCode));
      this.cargandoCarreras = false;
    });
  }

  public cambiarCarreraAsignacion(codigo: string): void {
    this.carreraAsignacionCodigo = codigo || '';
    this.asignaturaAsignacionCodigo = '';
    this.asignaturasAsignacion = [];
    if (!this.esDocenteSeleccionado() || !this.sedeAsignacionCodigo || !this.carreraAsignacionCodigo) return;
    this.cargandoAsignaturas = true;
    this.gateway.getCourses(this.sedeAsignacionCodigo, this.carreraAsignacionCodigo).pipe(catchError(() => of([] as Course[]))).subscribe(asignaturas => {
      this.asignaturasAsignacion = [...asignaturas].sort((a, b) => a.courseCode.localeCompare(b.courseCode));
      this.cargandoAsignaturas = false;
    });
  }

  public puedeAgregarAsignacion(): boolean {
    return !!this.sedeAsignacionCodigo && !!this.carreraAsignacionCodigo
      && (!this.esDocenteSeleccionado() || !!this.asignaturaAsignacionCodigo);
  }

  public agregarAsignacion(): void {
    if (!this.puedeAgregarAsignacion()) return;
    const sede = this.sedes.find(item => item.code === this.sedeAsignacionCodigo);
    const carrera = this.carrerasAsignacion.find(item => item.careerCode === this.carreraAsignacionCodigo);
    const asignatura = this.asignaturasAsignacion.find(item => item.courseCode === this.asignaturaAsignacionCodigo);
    if (!sede || !carrera || (this.esDocenteSeleccionado() && !asignatura)) return;
    const nueva: AsignacionAcademica = {
      sedeCodigo: sede.code, sedeNombre: sede.name,
      carreraCodigo: carrera.careerCode, carreraNombre: carrera.careerName,
      asignaturaCodigo: asignatura?.courseCode || '', asignaturaNombre: asignatura?.courseName || ''
    };
    if (!this.asignacionesSeleccionadas.some(item => this.claveAsignacion(item) === this.claveAsignacion(nueva))) {
      this.asignacionesSeleccionadas = [...this.asignacionesSeleccionadas, nueva];
    }
    this.carreraAsignacionCodigo = '';
    this.asignaturaAsignacionCodigo = '';
    this.asignaturasAsignacion = [];
  }

  public quitarAsignacion(asignacion: AsignacionAcademica): void {
    const clave = this.claveAsignacion(asignacion);
    this.asignacionesSeleccionadas = this.asignacionesSeleccionadas.filter(item => this.claveAsignacion(item) !== clave);
  }

  public claveAsignacion(asignacion: AsignacionAcademica): string {
    return `${asignacion.sedeCodigo}|${asignacion.carreraCodigo}|${asignacion.asignaturaCodigo || ''}`;
  }

  public guardar(): void {
    this.error.set(null); this.guardando.set(true);
    const asignaciones = this.requiereAsignacionesAcademicas() ? [...this.asignacionesSeleccionadas] : [];
    const usaRelacionesNuevas = this.requiereAsignacionesAcademicas() && asignaciones.length > 0;
    const sedes = usaRelacionesNuevas
      ? this.alcancesDesdeAsignaciones(asignaciones, 'sede')
      : [...this.sedesSeleccionadas.values()];
    const carreras = usaRelacionesNuevas
      ? this.alcancesDesdeAsignaciones(asignaciones, 'carrera')
      : [...this.carrerasSeleccionadas.values()];
    const campuses = this.esPersonalEvaluacionesSeleccionado() ? [...this.campusesSeleccionados.values()] : [];
    const request = { ...this.form, ci: this.form.ci.trim(), sedes, carreras: this.esPersonalEvaluacionesSeleccionado() ? [] : carreras, campuses, asignaciones };
    const operation = this.usuarioEditando ? this.service.actualizar(this.usuarioEditando.id, request) : this.service.crear(request);
    operation.subscribe({ next: () => { this.guardando.set(false); this.formularioAbierto.set(false); this.cargarUsuarios(); this.mostrarMensaje(this.usuarioEditando ? 'Usuario actualizado correctamente.' : 'Usuario registrado. La clave inicial es el CI.'); }, error: error => { this.guardando.set(false); this.error.set(error?.error?.message || error?.error?.error || error?.message || 'No se pudo guardar el usuario.'); } });
  }

  public importar(event: Event): void { const input = event.target as HTMLInputElement; const archivo = input.files?.[0]; if (!archivo) return; this.service.importar(archivo).subscribe({ next: resultado => { this.resultadoImportacion.set(resultado); this.cargarUsuarios(); input.value = ''; }, error: error => { this.mostrarError(error); input.value = ''; } }); }
  public analizarDocentesSea(): void {
    this.cargandoDocentesSea.set(true);
    this.errorDocentesSea.set(null);
    this.service.analizarDocentesSea(this.gestionSea.trim() || '2-2026').subscribe({
      next: resultado => { this.analisisDocentesSea.set(resultado); this.seleccionadosDocentesSea.set([]); this.cargandoDocentesSea.set(false); },
      error: error => { this.analisisDocentesSea.set(null); this.cargandoDocentesSea.set(false); this.errorDocentesSea.set(error?.error?.message || 'No se pudo consultar la nómina de docentes en SEA.'); }
    });
  }
  public seleccionarSinAcceso(): void {
    this.seleccionadosDocentesSea.set(this.docentesSeaFiltrados().filter(item => this.puedeSincronizar(item) && item.estado !== 'CON_ACCESO').map(item => item.ci));
  }
  public estaSeleccionado(ci: string): boolean { return this.seleccionadosDocentesSea().includes(ci); }
  public puedeSincronizar(docente: DocenteSeaAnalisis): boolean { return docente.presenteEnSea && docente.estado !== 'ROL_DIFERENTE'; }
  public alternarSeleccionDocente(docente: DocenteSeaAnalisis): void {
    if (!this.puedeSincronizar(docente)) return;
    const actuales = this.seleccionadosDocentesSea();
    this.seleccionadosDocentesSea.set(actuales.includes(docente.ci) ? actuales.filter(ci => ci !== docente.ci) : [...actuales, docente.ci]);
  }
  public sincronizarIndividual(docente: DocenteSeaAnalisis): void {
    if (!this.puedeSincronizar(docente)) return;
    this.ejecutarSincronizacion([docente.ci], false);
  }
  public sincronizarSeleccionados(): void {
    const cis = this.seleccionadosDocentesSea();
    if (!cis.length) { this.mostrarError({ error: { message: 'Selecciona al menos un docente para sincronizar.' } }); return; }
    this.ejecutarSincronizacion(cis, false);
  }
  public async sincronizarTodos(): Promise<void> {
    const analisis = this.analisisDocentesSea();
    if (!analisis || (!analisis.nuevos && !analisis.sinAcceso && !analisis.yaNoEstan)) return;
    if (!await this.feedback.confirmar(
      `Se sincronizarán los docentes de la gestión ${analisis.gestion} y se desactivarán las cuentas docentes que ya no aparezcan en SEA. ¿Deseas continuar?`,
      'Sincronizar docentes SEA',
      'warning',
      'Sincronizar'
    )) return;
    this.ejecutarSincronizacion([], true);
  }
  public etiquetaEstadoDocente(estado: DocenteSeaAnalisis['estado']): string {
    return { CON_ACCESO: 'CON ACCESO', NUEVO: 'NUEVO', SIN_ACCESO: 'SIN ACCESO', ROL_DIFERENTE: 'ROL DIFERENTE', YA_NO_ESTA: 'YA NO ESTÁ' }[estado];
  }
  public claseEstadoDocente(estado: DocenteSeaAnalisis['estado']): string {
    const clases: Record<DocenteSeaAnalisis['estado'], string> = {
      CON_ACCESO: 'status-pill active',
      NUEVO: 'status-pill warning',
      SIN_ACCESO: 'status-pill warning',
      ROL_DIFERENTE: 'status-pill inactive',
      YA_NO_ESTA: 'status-pill inactive'
    };
    return clases[estado];
  }
  public descargarPlantilla(): void {
    const columnas = ['CI', 'NOMBRE_COMPLETO', 'ROL', ...this.sedes.map(sede => `SEDE [${sede.code}]`), ...this.carreras.map(carrera => `CARRERA [${carrera.careerCode}]`)];
    const ejemplo = ['1234567', 'APELLIDO1 APELLIDO2 NOMBRES', 'DOCENTE', ...this.sedes.map((_, index) => index === 0 ? 'X' : ''), ...this.carreras.map((_, index) => index === 0 ? 'X' : '')];
    const usuarios = XLSX.utils.aoa_to_sheet([columnas, ejemplo]);
    const instrucciones = XLSX.utils.aoa_to_sheet([
      ['PLANTILLA DE USUARIOS SEA'],
      ['CI', 'Obligatorio. Será el usuario y la contraseña temporal de una cuenta nueva.'],
      ['NOMBRE_COMPLETO', 'Obligatorio. Conservar exactamente el orden recibido desde SEA.'],
      ['ROL', 'Usar el código del rol asignado, por ejemplo DOCENTE o DIRECTOR_CARRERA.'],
      ['SEDE [...] / CARRERA [...]', 'Marcar con X las columnas que correspondan. Se pueden marcar varias.'],
      ['Nota', 'No elimines ni cambies los códigos entre corchetes; son los códigos oficiales del catálogo SEA.']
    ]);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, usuarios, 'USUARIOS');
    XLSX.utils.book_append_sheet(libro, instrucciones, 'INSTRUCCIONES');
    columnas.forEach((_, index) => { usuarios['!cols'] = usuarios['!cols'] || []; usuarios['!cols']![index] = { wch: Math.min(Math.max(columnas[index].length + 3, 12), 34) }; });
    XLSX.writeFile(libro, 'plantilla_usuarios.xlsx');
  }
  public async restablecer(usuario: UsuarioSistema): Promise<void> {
    if (!await this.feedback.confirmar(
      `¿Restablecer la contraseña de ${usuario.nombreCompleto}? Volverá a ser su CI.`,
      'Restablecer contraseña',
      'warning',
      'Restablecer'
    )) return;
    this.service.restablecerContrasena(usuario.id).subscribe({ next: credencial => { this.credencialMostrada.set(credencial); this.cargarUsuarios(); }, error: error => this.mostrarError(error) });
  }

  public resumenAlcance(usuario: UsuarioSistema): string { const asignaciones = usuario.asignaciones?.length || 0; if (asignaciones) return `${asignaciones} asignación${asignaciones === 1 ? '' : 'es'}`; const campuses = usuario.campuses?.length || 0; if (campuses) { const habilitados = usuario.campuses.filter(item => item.habilitado).length; return `${usuario.sedes?.length || 0} sede${(usuario.sedes?.length || 0) === 1 ? '' : 's'} · ${campuses} campus · ${habilitados} habilitado${habilitados === 1 ? '' : 's'}`; } const sedes = usuario.sedes?.length || 0; const carreras = usuario.carreras?.length || 0; return `${sedes} sede${sedes === 1 ? '' : 's'} · ${carreras} carrera${carreras === 1 ? '' : 's'}`; }
  public nombresAlcance(usuario: UsuarioSistema): string { if (usuario.asignaciones?.length) return usuario.asignaciones.map(item => `${item.sedeCodigo}/${item.carreraCodigo}${item.asignaturaCodigo ? '/' + item.asignaturaCodigo : ''}`).join(' · '); if (usuario.campuses?.length) return usuario.campuses.map(item => `${item.sedeCodigo}/${item.campusCodigo || item.campusNombre} · ${item.habilitado ? 'Habilitado' : 'Deshabilitado'}`).join(' · '); return [...(usuario.sedes || []).map(item => item.codigo), ...(usuario.carreras || []).map(item => item.codigo)].join(' · ') || 'Sin alcance específico registrado'; }

  private formularioVacio(): UsuarioSistemaRequest { return { ci: '', nombreCompleto: '', rolCodigo: 'DOCENTE', activo: true, sedes: [], carreras: [], campuses: [], asignaciones: [] }; }
  private cargarUsuarios(): void { this.service.listar(this.contexto).subscribe({ next: usuarios => this.usuarios.set(usuarios), error: error => this.mostrarError(error) }); }
  private cargarCatalogo(): void { this.gateway.getBranchOffices().pipe(switchMap(sedes => { this.sedes = sedes; return sedes.length ? forkJoin(sedes.map(sede => this.gateway.getCareers(sede.code).pipe(catchError(() => of([] as Career[]))))).pipe(map(listas => listas.flat())) : of([] as Career[]); })).subscribe({ next: carreras => { const unicas = new Map<string, Career>(); carreras.forEach(carrera => unicas.set(carrera.careerCode, carrera)); this.carreras = [...unicas.values()].sort((a, b) => a.careerCode.localeCompare(b.careerCode)); }, error: () => { this.sedes = []; this.carreras = []; } }); }
  private esRolDeAsignaciones(rol: string): boolean { return rol === 'DIRECTOR_CARRERA' || rol === 'DOCENTE'; }
  private limpiarSeleccionAsignacion(): void { this.sedeAsignacionCodigo = ''; this.carreraAsignacionCodigo = ''; this.asignaturaAsignacionCodigo = ''; this.carrerasAsignacion = []; this.asignaturasAsignacion = []; this.cargandoCarreras = false; this.cargandoAsignaturas = false; }
  private limpiarConstructorAsignaciones(): void { this.limpiarSeleccionAsignacion(); }
  private alcancesDesdeAsignaciones(asignaciones: AsignacionAcademica[], tipo: 'sede' | 'carrera'): AlcanceAcademico[] {
    const unicos = new Map<string, AlcanceAcademico>();
    asignaciones.forEach(item => {
      const codigo = tipo === 'sede' ? item.sedeCodigo : item.carreraCodigo;
      const nombre = tipo === 'sede' ? item.sedeNombre : item.carreraNombre;
      if (codigo) unicos.set(codigo, { codigo, nombre });
    });
    return [...unicos.values()];
  }
  private ejecutarSincronizacion(cis: string[], desactivarAusentes: boolean): void {
    this.sincronizandoDocentesSea.set(true);
    this.service.sincronizarDocentesSea(cis, desactivarAusentes, this.gestionSea.trim() || '2-2026').subscribe({
      next: resultado => {
        this.sincronizandoDocentesSea.set(false);
        this.seleccionadosDocentesSea.set([]);
        this.resultadoSincronizacion.set(resultado);
        this.cargarUsuarios();
        this.analizarDocentesSea();
      },
      error: error => { this.sincronizandoDocentesSea.set(false); this.mostrarError(error); }
    });
  }
  private mostrarMensaje(texto: string): void { this.mensajeTipo.set('success'); this.mensaje.set(texto); window.setTimeout(() => this.mensaje.set(null), 4500); }
  private mostrarError(error: any): void {
    const detalle = typeof error?.error === 'string' ? error.error : error?.error?.message || error?.error?.detail;
    const mensaje = error?.status === 401
      ? 'La sesión expiró. Vuelve a iniciar sesión para continuar.'
      : detalle || error?.message || 'No se pudo completar la operación.';
    this.mensajeTipo.set('error'); this.mensaje.set(mensaje); window.setTimeout(() => this.mensaje.set(null), 6500);
  }
}
