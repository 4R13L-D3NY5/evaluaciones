import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluacionesStorageService } from '../../core/services/evaluaciones-storage.service';
import { EvaluacionesDbService } from '../../core/services/evaluaciones-db.service';

export interface CampusItem {
  id: number;
  nombre: string;
  sede: string;
  direccion: string;
  correos: string[];
  carrerasCount: number;
  activo: boolean;
}

export interface CarreraCampusItem {
  id: number;
  campus: string;
  carreras: { id: number; nombre: string }[];
}

export interface UsuarioEvaluadorItem {
  id: number;
  nombre: string;
  email: string;
  campus: string[];
  carreras: string[];
  activo: boolean;
}

export interface ParcialConfig {
  nombre: string;
  totalPreguntas: number;
  distribucion: { facil: number; medio: number; dificil: number };
}

@Component({
  selector: 'sea-administracion-evaluaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Cabecera Oficial de Administración de Evaluaciones -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="h-9 w-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center">
              <i class="pi pi-cog text-lg"></i>
            </div>
            <div>
              <h2 class="text-2xl font-black tracking-tight text-foreground">Administración de Evaluaciones</h2>
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            Gestión de campus, carreras, usuarios y configuración de exámenes a nivel nacional.
          </p>
        </div>
      </div>

      <!-- Card Principal con Pestañas de Navegación -->
      <div class="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
        
        <!-- Pestañas Horizontales Oficiales -->
        <div class="flex items-center border-b border-border bg-muted/20 px-6 pt-3 gap-2 overflow-x-auto">
          <button 
            (click)="tabActual.set('campus')"
            [class]="tabActual() === 'campus' ? 'border-purple-700 text-purple-800 bg-card font-black shadow-xs' : 'border-transparent text-muted-foreground hover:text-foreground font-bold'"
            class="px-4 py-2.5 border-b-2 text-xs flex items-center gap-2 rounded-t-xl transition-all cursor-pointer">
            <i class="pi pi-building text-xs"></i>
            <span>Campus por Sede</span>
          </button>

          <button 
            (click)="tabActual.set('carreras')"
            [class]="tabActual() === 'carreras' ? 'border-purple-700 text-purple-800 bg-card font-black shadow-xs' : 'border-transparent text-muted-foreground hover:text-foreground font-bold'"
            class="px-4 py-2.5 border-b-2 text-xs flex items-center gap-2 rounded-t-xl transition-all cursor-pointer">
            <i class="pi pi-graduation-cap text-xs"></i>
            <span>Carreras por Campus</span>
          </button>

          <button 
            (click)="tabActual.set('usuarios')"
            [class]="tabActual() === 'usuarios' ? 'border-purple-700 text-purple-800 bg-card font-black shadow-xs' : 'border-transparent text-muted-foreground hover:text-foreground font-bold'"
            class="px-4 py-2.5 border-b-2 text-xs flex items-center gap-2 rounded-t-xl transition-all cursor-pointer">
            <i class="pi pi-users text-xs"></i>
            <span>Usuarios Evaluadores</span>
          </button>

          <button 
            (click)="tabActual.set('configuracion')"
            [class]="tabActual() === 'configuracion' ? 'border-purple-700 text-purple-800 bg-card font-black shadow-xs' : 'border-transparent text-muted-foreground hover:text-foreground font-bold'"
            class="px-4 py-2.5 border-b-2 text-xs flex items-center gap-2 rounded-t-xl transition-all cursor-pointer">
            <i class="pi pi-sliders-h text-xs"></i>
            <span>Configuración de Exámenes</span>
          </button>

          <button 
            (click)="tabActual.set('tiempos')"
            [class]="tabActual() === 'tiempos' ? 'border-purple-700 text-purple-800 bg-card font-black shadow-xs' : 'border-transparent text-muted-foreground hover:text-foreground font-bold'"
            class="px-4 py-2.5 border-b-2 text-xs flex items-center gap-2 rounded-t-xl transition-all cursor-pointer">
            <i class="pi pi-clock text-xs"></i>
            <span>Configuración de Tiempos</span>
          </button>
        </div>

        <div class="p-6">
          
          <!-- ============================================================ -->
          <!-- TAB 1: CAMPUS POR SEDE -->
          <!-- ============================================================ -->
          @if (tabActual() === 'campus') {
            <div class="space-y-5 animate-fade-in">
              
              <!-- Sub-Cabecera de Tab -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 class="text-base font-black text-foreground">Campus por Sede</h3>
                  <p class="text-xs text-muted-foreground">Administra los campus asociados a cada sede universitaria.</p>
                </div>

                <button 
                  (click)="abrirModalCampus()"
                  class="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors">
                  <i class="pi pi-plus"></i>
                  <span>Nuevo Campus</span>
                </button>
              </div>

              <!-- Filtro por Sede -->
              <div class="max-w-xs">
                <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">Filtrar por Sede</label>
                <select 
                  [(ngModel)]="filtroSedeCampus"
                  class="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary">
                  <option value="Todos">Todas las Sedes</option>
                  <option value="Cochabamba">Cochabamba</option>
                  <option value="Cobija">Cobija</option>
                  <option value="El Alto">El Alto</option>
                  <option value="La Paz">La Paz</option>
                  <option value="Puerto Quijarro">Puerto Quijarro</option>
                  <option value="Santa Cruz">Santa Cruz</option>
                  <option value="Guayaramerin">Guayaramerin</option>
                </select>
              </div>

              <!-- Tabla de Campus -->
              <div class="border border-border rounded-xl overflow-hidden shadow-2xs">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-muted/40 border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      <th class="p-3.5">Campus</th>
                      <th class="p-3.5">Sede</th>
                      <th class="p-3.5">Dirección</th>
                      <th class="p-3.5">Correos de Evaluaciones</th>
                      <th class="p-3.5 text-center">Carreras</th>
                      <th class="p-3.5 text-center">Estado</th>
                      <th class="p-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border">
                    @for (camp of campusFiltrados(); track camp.id) {
                      <tr class="hover:bg-muted/20 transition-colors">
                        <!-- Campus -->
                        <td class="p-3.5 font-black text-foreground uppercase tracking-tight">
                          {{ camp.nombre }}
                        </td>

                        <!-- Sede -->
                        <td class="p-3.5">
                          <span class="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                            <i class="pi pi-building text-[9px]"></i> {{ camp.sede }}
                          </span>
                        </td>

                        <!-- Dirección -->
                        <td class="p-3.5 text-muted-foreground">
                          {{ camp.direccion || 'Campus Universitario' }}
                        </td>

                        <!-- Correos de Evaluaciones Registrados -->
                        <td class="p-3.5">
                          <div class="flex flex-wrap gap-1.5 max-w-xs">
                            @for (email of camp.correos; track $index) {
                              <span class="bg-purple-50 text-purple-900 border border-purple-200 text-[10px] font-bold px-2 py-0.5 rounded-md inline-flex items-center gap-1 font-mono shadow-2xs">
                                <i class="pi pi-envelope text-[9px] text-purple-600"></i>
                                <span>{{ email }}</span>
                              </span>
                            }
                            @if (!camp.correos || camp.correos.length === 0) {
                              <span class="text-muted-foreground text-[10px] italic">Sin correos asignados</span>
                            }
                          </div>
                        </td>

                        <!-- Carreras Conteo -->
                        <td class="p-3.5 text-center font-mono font-bold text-foreground">
                          {{ camp.carrerasCount }}
                        </td>

                        <!-- Estado -->
                        <td class="p-3.5 text-center">
                          <span [class]="camp.activo ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'" class="text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                            {{ camp.activo ? 'Activo' : 'Inactivo' }}
                          </span>
                        </td>

                        <!-- Acciones -->
                        <td class="p-3.5 text-right">
                          <div class="inline-flex items-center gap-1.5">
                            <button 
                              (click)="abrirModalCampus(camp)"
                              title="Editar Campus y Correos"
                              class="text-amber-600 hover:bg-amber-50 p-1.5 rounded-lg transition-colors cursor-pointer">
                              <i class="pi pi-pencil text-xs"></i>
                            </button>
                            <button 
                              (click)="toggleCampus(camp)"
                              [title]="camp.activo ? 'Desactivar Campus' : 'Activar Campus'"
                              [class]="camp.activo ? 'text-teal-600 hover:bg-teal-50' : 'text-slate-400 hover:bg-slate-100'"
                              class="p-1.5 rounded-lg transition-colors cursor-pointer">
                              <i [class]="camp.activo ? 'pi pi-toggle-on text-base' : 'pi pi-toggle-off text-base'"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

            </div>
          }

          <!-- ============================================================ -->
          <!-- TAB 2: CARRERAS POR CAMPUS -->
          <!-- ============================================================ -->
          @if (tabActual() === 'carreras') {
            <div class="space-y-5 animate-fade-in">
              
              <!-- Sub-Cabecera -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 class="text-base font-black text-foreground">Carreras por Campus</h3>
                  <p class="text-xs text-muted-foreground">Asigna las carreras que se gestionan en cada campus.</p>
                </div>

                <button 
                  (click)="abrirModalAsignarCarrera()"
                  class="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors">
                  <i class="pi pi-plus"></i>
                  <span>Asignar Carrera</span>
                </button>
              </div>

              <!-- Filtro por Campus -->
              <div class="max-w-xs">
                <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">Filtrar por Campus</label>
                <select 
                  [(ngModel)]="filtroCampusCarreras"
                  class="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary">
                  <option value="Todos">Todos los Campus</option>
                  @for (c of listaCampus; track c.id) {
                    <option [value]="c.nombre">{{ c.nombre }}</option>
                  }
                </select>
              </div>

              <!-- Tabla de Carreras por Campus -->
              <div class="border border-border rounded-xl overflow-hidden shadow-2xs">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-muted/40 border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      <th class="p-3.5 w-48">Campus</th>
                      <th class="p-3.5">Carreras Asignadas</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border">
                    @for (row of carrerasPorCampusFiltradas(); track row.id) {
                      <tr class="hover:bg-muted/20 transition-colors">
                        
                        <!-- Campus Badge -->
                        <td class="p-3.5 align-top">
                          <span class="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black px-2.5 py-1 rounded-lg inline-flex items-center gap-1 shadow-2xs">
                            <i class="pi pi-building text-[9px]"></i> {{ row.campus }}
                          </span>
                        </td>

                        <!-- Lista de Carreras Chips con Botones de Edición y Eliminar -->
                        <td class="p-3.5">
                          <div class="flex flex-wrap items-center gap-1.5">
                            @for (carr of row.carreras; track carr.id) {
                              <span class="bg-indigo-50 text-indigo-900 border border-indigo-200 text-[10px] font-black px-2.5 py-1 rounded-md inline-flex items-center gap-1.5 shadow-2xs">
                                <span>{{ carr.nombre }}</span>
                                <button (click)="editarCarreraCampus(row, carr)" title="Editar" class="text-amber-600 hover:text-amber-800">
                                  <i class="pi pi-pencil text-[9px]"></i>
                                </button>
                                <button (click)="quitarCarreraCampus(row, carr)" title="Quitar Carrera" class="text-rose-600 hover:text-rose-800">
                                  <i class="pi pi-times text-[9px]"></i>
                                </button>
                              </span>
                            }
                          </div>
                        </td>

                      </tr>
                    }
                  </tbody>
                </table>
              </div>

            </div>
          }

          <!-- ============================================================ -->
          <!-- TAB 3: USUARIOS EVALUADORES -->
          <!-- ============================================================ -->
          @if (tabActual() === 'usuarios') {
            <div class="space-y-5 animate-fade-in">
              
              <!-- Sub-Cabecera -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 class="text-base font-black text-foreground">Usuarios de Evaluaciones</h3>
                  <p class="text-xs text-muted-foreground">Asigna usuarios con el rol Evaluaciones a uno o más campus.</p>
                </div>

                <button 
                  (click)="abrirModalUsuario()"
                  class="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors">
                  <i class="pi pi-user-plus"></i>
                  <span>Agregar Evaluador</span>
                </button>
              </div>

              <!-- Filtro por Campus -->
              <div class="max-w-xs">
                <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">Filtrar por Campus</label>
                <select 
                  [(ngModel)]="filtroCampusUsuarios"
                  class="w-full bg-muted/60 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none focus:border-primary">
                  <option value="Todos">Todos los Campus</option>
                  @for (c of listaCampus; track c.id) {
                    <option [value]="c.nombre">{{ c.nombre }}</option>
                  }
                </select>
              </div>

              <!-- Tabla de Usuarios Evaluadores -->
              <div class="border border-border rounded-xl overflow-hidden shadow-2xs">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-muted/40 border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      <th class="p-3.5">Usuario</th>
                      <th class="p-3.5">Campus</th>
                      <th class="p-3.5">Carreras Asignadas</th>
                      <th class="p-3.5 text-center">Acceso al Sistema</th>
                      <th class="p-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border">
                    @for (usr of usuariosEvaluadoresFiltrados(); track usr.id) {
                      <tr class="hover:bg-muted/20 transition-colors">
                        
                        <!-- Avatar y Nombre -->
                        <td class="p-3.5">
                          <div class="flex items-center gap-2.5">
                            <div class="h-8 w-8 rounded-full bg-purple-700 text-white flex items-center justify-center font-black text-xs shrink-0">
                              {{ usr.nombre.charAt(0) }}
                            </div>
                            <div>
                              <div class="font-black text-foreground">{{ usr.nombre }}</div>
                              <div class="text-[10px] text-muted-foreground">{{ usr.email }}</div>
                            </div>
                          </div>
                        </td>

                        <!-- Campus Chips -->
                        <td class="p-3.5">
                          <div class="flex flex-wrap gap-1">
                            @for (camp of usr.campus; track camp) {
                              <span class="bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                                {{ camp }}
                              </span>
                            }
                          </div>
                        </td>

                        <!-- Carreras Chips -->
                        <td class="p-3.5">
                          <div class="flex flex-wrap gap-1">
                            @for (carr of usr.carreras; track carr) {
                              <span class="bg-blue-50 text-blue-800 border border-blue-200 text-[9px] font-bold px-2 py-0.5 rounded-md">
                                {{ carr }}
                              </span>
                            }
                          </div>
                        </td>

                        <!-- Acceso al Sistema -->
                        <td class="p-3.5 text-center">
                          <div class="inline-flex items-center gap-2">
                            <button 
                              (click)="toggleAccesoUsuario(usr)"
                              [class]="usr.activo ? 'bg-emerald-500' : 'bg-slate-300'"
                              class="w-8 h-4 rounded-full p-0.5 transition-colors relative flex items-center">
                              <div [class]="usr.activo ? 'translate-x-4 bg-white' : 'translate-x-0 bg-white'" class="w-3 h-3 rounded-full shadow-md transform transition-transform"></div>
                            </button>
                            <span [class]="usr.activo ? 'text-emerald-700 font-bold text-[10px]' : 'text-slate-400 font-bold text-[10px]'">
                              {{ usr.activo ? 'Activo' : 'Inactivo' }}
                            </span>
                          </div>
                        </td>

                        <!-- Acciones -->
                        <td class="p-3.5 text-right">
                          <div class="inline-flex items-center gap-1.5">
                            <button (click)="abrirModalUsuario(usr)" title="Editar" class="text-amber-600 hover:bg-amber-50 p-1.5 rounded-lg">
                              <i class="pi pi-pencil text-xs"></i>
                            </button>
                            <button (click)="quitarRolUsuario(usr)" title="Quitar rol" class="text-rose-600 hover:bg-rose-50 p-1.5 rounded-lg">
                              <i class="pi pi-user-minus text-xs"></i>
                            </button>
                          </div>
                        </td>

                      </tr>
                    }
                  </tbody>
                </table>
              </div>

            </div>
          }

          <!-- ============================================================ -->
          <!-- TAB 4: CONFIGURACIÓN DE EXÁMENES -->
          <!-- ============================================================ -->
          @if (tabActual() === 'configuracion') {
            <div class="space-y-6 animate-fade-in">
              
              <!-- Sub-Cabecera de Configuración -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 class="text-base font-black text-foreground">Configuración de Exámenes</h3>
                  <p class="text-xs text-muted-foreground">Define los parámetros globales, por sede y por carrera.</p>
                </div>

                <button 
                  (click)="guardarConfiguracion()"
                  class="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-xs transition-colors">
                  <i class="pi pi-save"></i>
                  <span>Guardar Configuración</span>
                </button>
              </div>

              <!-- Parámetros vigentes para la generación oficial -->
              <div class="bg-card border border-border rounded-xl p-4 shadow-xs space-y-3">
                <div class="flex items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-palette text-purple-700"></i>
                    <div>
                      <h4 class="text-xs font-black uppercase tracking-wider text-foreground">Motor de generación · Parámetros de diagramación</h4>
                      <p class="text-[10px] text-muted-foreground">Valores por defecto aplicados por el worker a los nuevos exámenes.</p>
                    </div>
                  </div>
                  <span class="bg-purple-50 text-purple-700 border border-purple-200 rounded-full px-2.5 py-1 text-[10px] font-mono font-black">30 Preguntas (7 Fáciles, 16 Medias, 7 Difíciles)</span>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <label class="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">Formato hoja</label>
                    <select [(ngModel)]="typstFormatoHoja" class="w-full bg-muted border border-border rounded-lg px-2.5 py-2 text-xs font-bold">
                      <option>Oficio (Folio UNITEPC)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">Tipo de letra (fuente)</label>
                    <select [(ngModel)]="typstFuente" class="w-full bg-muted border border-border rounded-lg px-2.5 py-2 text-xs font-bold">
                      <option>Times New Roman</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">Tamaño de letra</label>
                    <select [(ngModel)]="typstTamanoFuente" class="w-full bg-muted border border-border rounded-lg px-2.5 py-2 text-xs font-bold">
                      <option [ngValue]="11">11.0 pt (Grande)</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">Espaciado (leading)</label>
                    <select [(ngModel)]="typstLeading" class="w-full bg-muted border border-border rounded-lg px-2.5 py-2 text-xs font-bold">
                      <option>0.8em (línea) · 1.2em (pregunta)</option>
                    </select>
                  </div>
                </div>
                <div class="flex items-center gap-2 text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <i class="pi pi-info-circle"></i>
                  <span>La hoja de respuestas institucional se entrega por separado; no se genera cartilla dentro del cuadernillo.</span>
                </div>
              </div>

              <!-- Selector de Nivel de Configuración -->
              <div class="bg-muted/40 border border-border rounded-xl p-5 space-y-3 shadow-2xs">
                <div class="flex items-center gap-1.5 text-xs font-black text-foreground uppercase tracking-wider">
                  <i class="pi pi-sliders-h text-primary"></i>
                  <span>Nivel de Configuración</span>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                  <button 
                    (click)="nivelConfig.set('nacional')"
                    [class]="nivelConfig() === 'nacional' ? 'bg-purple-700 text-white font-black shadow-xs' : 'bg-card text-muted-foreground hover:text-foreground font-bold border border-border'"
                    class="px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all">
                    <i class="pi pi-globe"></i>
                    <span>Nacional</span>
                  </button>

                  <button 
                    (click)="nivelConfig.set('sede')"
                    [class]="nivelConfig() === 'sede' ? 'bg-purple-700 text-white font-black shadow-xs' : 'bg-card text-muted-foreground hover:text-foreground font-bold border border-border'"
                    class="px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all">
                    <i class="pi pi-building"></i>
                    <span>Por Sede</span>
                  </button>

                  <button 
                    (click)="nivelConfig.set('carrera')"
                    [class]="nivelConfig() === 'carrera' ? 'bg-purple-700 text-white font-black shadow-xs' : 'bg-card text-muted-foreground hover:text-foreground font-bold border border-border'"
                    class="px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all">
                    <i class="pi pi-graduation-cap"></i>
                    <span>Por Carrera</span>
                  </button>
                </div>

                <!-- Selectores Dinámicos según Nivel -->
                @if (nivelConfig() === 'sede') {
                  <div class="pt-2 max-w-xs animate-fade-in">
                    <label class="block text-[10px] font-bold text-muted-foreground mb-1">Seleccionar Sede</label>
                    <select [(ngModel)]="configSede" class="w-full bg-card border border-border rounded-lg p-2 text-xs font-bold">
                      <option value="Cochabamba">Cochabamba</option>
                      <option value="La Paz">La Paz</option>
                      <option value="Santa Cruz">Santa Cruz</option>
                      <option value="El Alto">El Alto</option>
                    </select>
                  </div>
                }

                @if (nivelConfig() === 'carrera') {
                  <div class="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl animate-fade-in">
                    <div>
                      <label class="block text-[10px] font-bold text-muted-foreground mb-1">Sede</label>
                      <select [(ngModel)]="configSede" class="w-full bg-card border border-border rounded-lg p-2 text-xs font-bold">
                        <option value="Cochabamba">Cochabamba</option>
                        <option value="La Paz">La Paz</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-[10px] font-bold text-muted-foreground mb-1">Carrera</label>
                      <select [(ngModel)]="configCarrera" class="w-full bg-card border border-border rounded-lg p-2 text-xs font-bold">
                        <option value="Ingeniería de Sistemas">Licenciatura en Ingeniería de Sistemas</option>
                        <option value="Medicina">Licenciatura en Medicina</option>
                      </select>
                    </div>
                  </div>
                }
              </div>

              <!-- Parámetro de Variantes por Estudiantes -->
              <div class="bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl p-5 shadow-xs space-y-3">
                <div class="flex items-center justify-between border-b border-purple-200 pb-3">
                  <div class="flex items-center gap-2">
                    <i class="pi pi-users text-purple-700 font-bold"></i>
                    <h4 class="text-xs font-black uppercase tracking-wider text-purple-950 dark:text-purple-200">
                      Algoritmo de Cálculo Dinámico de Variantes por Nómina
                    </h4>
                  </div>
                  <span class="bg-purple-200 text-purple-900 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    Fórmula Dinámica UNITEPC
                  </span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label class="block text-[10px] font-extrabold uppercase text-muted-foreground mb-1">
                      Ratio: Cantidad de Estudiantes por Variante
                    </label>
                    <div class="flex items-center gap-2">
                      <input 
                        type="number" 
                        [(ngModel)]="ratioEstudiantesPorVariante" 
                        min="1" 
                        max="30"
                        class="w-24 bg-card border border-border rounded-xl px-3 py-1.5 text-xs font-mono font-bold">
                      <span class="text-xs font-bold text-foreground">estudiantes / variante</span>
                    </div>
                    <p class="text-[10px] text-muted-foreground mt-1">
                      Para esta fase de pruebas se utilizará 1 estudiante por variante (máx. 5 variantes A–E).
                    </p>
                  </div>

                  <div class="p-3 bg-card border border-purple-200/80 rounded-xl space-y-1">
                    <span class="text-[10px] font-bold text-purple-700 block uppercase">Simulación en Vivo:</span>
                    <p class="text-[11px] text-muted-foreground leading-snug">
                      Para un grupo con <strong>12 estudiantes</strong> y ratio <strong>{{ ratioEstudiantesPorVariante }}</strong>:
                      <br>
                      Variantes = ceil(12 / {{ ratioEstudiantesPorVariante }}) =
                      <strong class="text-purple-700 font-mono text-xs ml-1">
                        {{ Math.min(Math.ceil(12 / (ratioEstudiantesPorVariante || 1)), 5) }} Variantes
                      </strong>
                    </p>
                  </div>
                </div>
              </div>

              <!-- Grilla de Configuración: Estructura por Parcial -->
              <div class="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
                <div class="flex items-center gap-2 border-b border-border pb-3">
                  <i class="pi pi-question-circle text-amber-600"></i>
                  <h4 class="text-xs font-black uppercase tracking-wider text-foreground">Estructura de Preguntas por Parcial</h4>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  @for (parcial of parcialesConfig(); track parcial.nombre) {
                    <div class="bg-muted/20 border border-border/80 rounded-xl p-4 space-y-3">
                      <div class="flex items-center justify-between">
                        <span class="font-black text-xs text-foreground">{{ parcial.nombre }}</span>
                        <span class="text-[10px] text-muted-foreground font-mono">Requerido por examen</span>
                      </div>

                      <!-- Total Preguntas -->
                      <div>
                        <label class="block text-[9px] font-extrabold uppercase text-muted-foreground mb-1">Total de Preguntas</label>
                        <div class="flex items-center gap-2">
                          <input 
                            type="number" 
                            [(ngModel)]="parcial.totalPreguntas" 
                            class="w-24 bg-card border border-border rounded-lg px-2.5 py-1 text-xs font-mono font-bold">
                          <span class="text-xs text-muted-foreground">preguntas</span>
                        </div>
                      </div>

                      <!-- Distribución por Dificultad -->
                      <div class="grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded block text-center mb-1">
                            Fácil
                          </span>
                          <input type="number" [(ngModel)]="parcial.distribucion.facil" class="w-full bg-card border border-border rounded-lg p-1.5 text-xs font-mono font-bold text-center">
                        </div>

                        <div>
                          <span class="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black px-2 py-0.5 rounded block text-center mb-1">
                            Medio
                          </span>
                          <input type="number" [(ngModel)]="parcial.distribucion.medio" class="w-full bg-card border border-border rounded-lg p-1.5 text-xs font-mono font-bold text-center">
                        </div>

                        <div>
                          <span class="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-black px-2 py-0.5 rounded block text-center mb-1">
                            Difícil
                          </span>
                          <input type="number" [(ngModel)]="parcial.distribucion.dificil" class="w-full bg-card border border-border rounded-lg p-1.5 text-xs font-mono font-bold text-center">
                        </div>
                      </div>

                      <!-- Banner de Validación de Suma -->
                      @let suma = parcial.distribucion.facil + parcial.distribucion.medio + parcial.distribucion.dificil;
                      <div [class]="suma === parcial.totalPreguntas ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'" class="border rounded-lg p-2 text-xs font-bold flex items-center justify-between">
                        <div class="flex items-center gap-1.5">
                          <i [class]="suma === parcial.totalPreguntas ? 'pi pi-check text-emerald-600' : 'pi pi-exclamation-triangle text-amber-600'"></i>
                          <span>Total distribución: {{ suma }}</span>
                        </div>
                        @if (suma !== parcial.totalPreguntas) {
                          <span class="text-[10px] text-amber-700 font-normal">(debe sumar {{ parcial.totalPreguntas }})</span>
                        }
                      </div>

                    </div>
                  }
                </div>
              </div>

            </div>
          }

          <!-- ============================================================ -->
          <!-- TAB 5: CONFIGURACIÓN DE TIEMPOS (NAV APARTE) -->
          <!-- ============================================================ -->
          @if (tabActual() === 'tiempos') {
            <div class="space-y-6 animate-fade-in">
              
              <!-- Sub-Cabecera de Tiempos -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 class="text-base font-black text-foreground">Configuración de Tiempos y Políticas de Seguridad</h3>
                  <p class="text-xs text-muted-foreground">Define los umbrales de anticipación, candados de edición y restricciones de liberación de exámenes.</p>
                </div>

                <div class="flex items-center gap-3">
                  <div class="flex items-center gap-2 bg-muted border border-border rounded-xl px-3 py-1.5 shadow-2xs">
                    <span class="text-[10px] font-extrabold uppercase text-muted-foreground">Gestión:</span>
                    <select [(ngModel)]="gestionTiempos" class="bg-transparent text-xs font-black text-foreground outline-none cursor-pointer">
                      <option value="1/2026">Gestión 1/2026</option>
                      <option value="2/2026">Gestión 2/2026 (Activa)</option>
                      <option value="3/2026">Gestión 3/2026</option>
                    </select>
                  </div>

                  <button 
                    (click)="guardarTiempos()"
                    class="bg-blue-700 hover:bg-blue-800 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer">
                    <i class="pi pi-save"></i>
                    <span>Guardar Tiempos</span>
                  </button>
                </div>
              </div>

              <!-- Grilla Principal: Parámetros de Tiempos + Políticas de Candado -->
              <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                <!-- Columna Izquierda: Parámetros de Tiempos -->
                <div class="lg:col-span-7 bg-card border border-border rounded-2xl p-6 shadow-2xs space-y-4">
                  <div class="flex items-center gap-2 border-b border-border pb-3">
                    <i class="pi pi-clock text-blue-600 font-bold"></i>
                    <h4 class="text-xs font-black uppercase tracking-wider text-foreground">Parámetros Cronológicos de Exámenes</h4>
                  </div>

                  <div class="space-y-4">
                    
                    <!-- Parámetro 1 -->
                    <div class="p-3.5 rounded-xl bg-muted/30 border border-border/70 space-y-1.5">
                      <label class="block text-xs font-black text-foreground">
                        Minutos antes del examen para entrega
                      </label>
                      <p class="text-[11px] text-muted-foreground">Anticipación mínima para habilitar el retiro de sobres en jefatura.</p>
                      <div class="flex items-center gap-2 pt-1 max-w-xs">
                        <input type="number" [(ngModel)]="tiempoMinutosAntesEntrega" class="w-full bg-card border border-border rounded-lg p-2 text-xs font-mono font-bold text-foreground">
                        <span class="text-xs font-bold text-muted-foreground font-mono">min</span>
                      </div>
                    </div>

                    <!-- Parámetro 2 -->
                    <div class="p-3.5 rounded-xl bg-muted/30 border border-border/70 space-y-1.5">
                      <label class="block text-xs font-black text-foreground">
                        Horas antes para mostrar opción Generar Examen
                      </label>
                      <p class="text-[11px] text-muted-foreground">Ventana de tiempo previa para generar los cuadernillos oficiales.</p>
                      <div class="flex items-center gap-2 pt-1 max-w-xs">
                        <input type="number" [(ngModel)]="tiempoHorasAntesGeneracion" class="w-full bg-card border border-border rounded-lg p-2 text-xs font-mono font-bold text-foreground">
                        <span class="text-xs font-bold text-muted-foreground font-mono">horas</span>
                      </div>
                    </div>

                    <!-- Parámetro 3 -->
                    <div class="p-3.5 rounded-xl bg-muted/30 border border-border/70 space-y-1.5">
                      <label class="block text-xs font-black text-foreground">
                        Horas post-entrega para mostrar patrón (3-Hour Lock)
                      </label>
                      <p class="text-[11px] text-muted-foreground">Tiempo de resguardo criptográfico del patrón de respuestas OMR.</p>
                      <div class="flex items-center gap-2 pt-1 max-w-xs">
                        <input type="number" [(ngModel)]="tiempoHorasPostPatron" class="w-full bg-card border border-border rounded-lg p-2 text-xs font-mono font-bold text-foreground">
                        <span class="text-xs font-bold text-muted-foreground font-mono">horas</span>
                      </div>
                    </div>

                    <!-- Parámetro 4 -->
                    <div class="p-3.5 rounded-xl bg-muted/30 border border-border/70 space-y-1.5">
                      <label class="block text-xs font-black text-foreground">
                        Horas antes para liberación lista de exámenes
                      </label>
                      <p class="text-[11px] text-muted-foreground">Publicación en el módulo de evaluaciones por día del docente.</p>
                      <div class="flex items-center gap-2 pt-1 max-w-xs">
                        <input type="number" [(ngModel)]="tiempoHorasAntesLista" class="w-full bg-card border border-border rounded-lg p-2 text-xs font-mono font-bold text-foreground">
                        <span class="text-xs font-bold text-muted-foreground font-mono">horas</span>
                      </div>
                    </div>

                    <!-- Parámetro 5: NUEVO CANDADO 72 HORAS (Captura 2) -->
                    <div class="p-3.5 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 space-y-1.5">
                      <label class="block text-xs font-black text-purple-950 dark:text-purple-200 flex items-center gap-1.5">
                        <i class="pi pi-lock text-purple-600"></i>
                        <span>Horas antes para bloqueo estricto del Rol de Exámenes (Candado 72 Horas)</span>
                      </label>
                      <p class="text-[11px] text-muted-foreground">Bloquea la edición o reprogramación de exámenes en el calendario.</p>
                      <div class="flex items-center gap-2 pt-1 max-w-xs">
                        <input type="number" [(ngModel)]="tiempoHorasCandado72" class="w-full bg-card border border-border rounded-lg p-2 text-xs font-mono font-black text-purple-700 dark:text-purple-300">
                        <span class="text-xs font-bold text-purple-800 dark:text-purple-300 font-mono">horas</span>
                      </div>
                    </div>

                  </div>
                </div>

                <!-- Columna Derecha: Tarjetas de Políticas de Seguridad (Captura 2) -->
                <div class="lg:col-span-5 space-y-4">
                  
                  <!-- Card Oficial de Candado 72 Horas (Idéntico a Captura 2) -->
                  <div class="p-4 bg-card border border-border rounded-2xl flex items-start gap-3 shadow-2xs hover:border-teal-500/40 transition-colors">
                    <div class="text-teal-600 text-lg mt-0.5 shrink-0">
                      <i class="pi pi-lock"></i>
                    </div>
                    <div class="space-y-1">
                      <h5 class="text-xs font-black text-foreground">Candado {{ tiempoHorasCandado72 }} Horas:</h5>
                      <p class="text-xs text-muted-foreground leading-relaxed">
                        Bloqueo estricto del Rol de Exámenes {{ tiempoHorasCandado72 }}h antes de la prueba.
                      </p>
                    </div>
                  </div>

                  <!-- Card Informativa de Patrón OMR Encriptado -->
                  <div class="p-4 bg-card border border-border rounded-2xl flex items-start gap-3 shadow-2xs hover:border-amber-500/40 transition-colors">
                    <div class="text-amber-600 text-lg mt-0.5 shrink-0">
                      <i class="pi pi-shield"></i>
                    </div>
                    <div class="space-y-1">
                      <h5 class="text-xs font-black text-foreground">Protocolo 3-Hour Answer Lock:</h5>
                      <p class="text-xs text-muted-foreground leading-relaxed">
                        El patrón de respuestas oficial permanece encriptado en el servidor y solo se revela {{ tiempoHorasPostPatron }}h después del inicio oficial del examen.
                      </p>
                    </div>
                  </div>

                  <!-- Card Motor de generación -->
                  <div class="p-4 bg-card border border-border rounded-2xl flex items-start gap-3 shadow-2xs hover:border-purple-500/40 transition-colors">
                    <div class="text-purple-600 text-lg mt-0.5 shrink-0">
                      <i class="pi pi-bolt"></i>
                    </div>
                    <div class="space-y-1">
                      <h5 class="text-xs font-black text-foreground">Generación anticipada:</h5>
                      <p class="text-xs text-muted-foreground leading-relaxed">
                        Los cuadernillos se compilan {{ tiempoHorasAntesGeneracion }}h antes para permitir la revisión de variantes e impresión controlada en sobre cerrado.
                      </p>
                    </div>
                  </div>

                </div>

              </div>

            </div>
          }

        </div>
      </div>

      <!-- MODAL PARA NUEVO / EDITAR CAMPUS -->
      @if (dialogCampus()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            
            <div class="flex items-center justify-between border-b border-border pb-3">
              <div class="flex items-center gap-2">
                <div class="h-8 w-8 rounded-lg bg-purple-100 text-purple-800 flex items-center justify-center">
                  <i class="pi pi-building"></i>
                </div>
                <h3 class="text-base font-black text-foreground">{{ campusEditando() ? 'Editar Campus' : 'Nuevo Campus' }}</h3>
              </div>
              <button (click)="cerrarModalCampus()" class="text-muted-foreground hover:text-foreground p-1 cursor-pointer">
                <i class="pi pi-times"></i>
              </button>
            </div>
            
            <div class="space-y-3.5 text-xs">
              <div>
                <label class="block font-bold text-muted-foreground mb-1">Nombre del Campus</label>
                <input type="text" [(ngModel)]="formCampusNombre" placeholder="Ej: CAMPUS COLONIAL" class="w-full bg-muted border border-border rounded-lg p-2 font-bold text-foreground">
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block font-bold text-muted-foreground mb-1">Sede</label>
                  <select [(ngModel)]="formCampusSede" class="w-full bg-muted border border-border rounded-lg p-2 font-bold text-foreground">
                    <option value="Cochabamba">Cochabamba</option>
                    <option value="La Paz">La Paz</option>
                    <option value="Santa Cruz">Santa Cruz</option>
                    <option value="El Alto">El Alto</option>
                    <option value="Cobija">Cobija</option>
                    <option value="Puerto Quijarro">Puerto Quijarro</option>
                    <option value="Guayaramerin">Guayaramerin</option>
                  </select>
                </div>

                <div>
                  <label class="block font-bold text-muted-foreground mb-1">Dirección / Ubicación</label>
                  <input type="text" [(ngModel)]="formCampusDireccion" placeholder="Ej: Av. Heroínas esq. Ayacucho" class="w-full bg-muted border border-border rounded-lg p-2 font-medium text-foreground">
                </div>
              </div>

              <!-- GESTIÓN DINÁMICA DE MÚLTIPLES CORREOS POR CAMPUS -->
              <div class="space-y-2 pt-1 border-t border-border">
                <div class="flex items-center justify-between">
                  <label class="block font-black text-purple-900 uppercase text-[10px] tracking-wider">
                    Correos de Evaluaciones (Buzones Oficiales)
                  </label>
                  <span class="text-[10px] text-muted-foreground font-bold font-mono">
                    {{ formCampusCorreos().length }} correo(s)
                  </span>
                </div>

                <!-- Input para agregar nuevo correo -->
                <div class="flex items-center gap-2">
                  <input 
                    type="email" 
                    [(ngModel)]="nuevoCorreoInput" 
                    (keydown.enter)="agregarCorreoCampusForm()"
                    placeholder="ej: evaluaciones.cbba@unitepc.edu.bo"
                    class="w-full bg-muted border border-border rounded-lg p-2 text-xs font-mono text-foreground outline-none focus:border-purple-600">
                  
                  <button 
                    (click)="agregarCorreoCampusForm()"
                    type="button"
                    class="px-3 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0">
                    <i class="pi pi-plus text-[10px]"></i>
                    <span>Agregar</span>
                  </button>
                </div>

                <!-- Lista de Correos Registrados -->
                <div class="bg-muted/40 border border-border rounded-xl p-2.5 max-h-32 overflow-y-auto space-y-1.5">
                  @for (email of formCampusCorreos(); track $index; let idx = $index) {
                    <div class="flex items-center justify-between bg-card border border-border px-2.5 py-1.5 rounded-lg text-xs font-mono">
                      <div class="flex items-center gap-1.5 text-purple-950 font-bold">
                        <i class="pi pi-envelope text-purple-600 text-[10px]"></i>
                        <span>{{ email }}</span>
                      </div>
                      <button 
                        (click)="eliminarCorreoCampusForm(idx)"
                        title="Eliminar correo"
                        class="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded transition-colors cursor-pointer">
                        <i class="pi pi-trash text-[11px]"></i>
                      </button>
                    </div>
                  }
                  @if (formCampusCorreos().length === 0) {
                    <div class="text-center py-2 text-muted-foreground text-[11px] italic">
                      No hay correos agregados. Añade al menos uno para las notificaciones.
                    </div>
                  }
                </div>
                <p class="text-[10px] text-muted-foreground">
                  * Las evaluaciones de este campus se despacharán a todos los correos registrados en esta lista.
                </p>
              </div>

            </div>

            <div class="flex justify-end gap-2 pt-3 border-t border-border">
              <button (click)="cerrarModalCampus()" class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted cursor-pointer">Cancelar</button>
              <button (click)="guardarCampusModal()" class="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-black shadow-xs cursor-pointer">Guardar Cambios</button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL PARA ASIGNAR CARRERA A CAMPUS -->
      @if (dialogAsignarCarrera()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <h3 class="text-base font-black text-foreground">Asignar Carrera a Campus</h3>
            
            <div class="space-y-3 text-xs">
              <div>
                <label class="block font-bold text-muted-foreground mb-1">Campus</label>
                <select [(ngModel)]="formAsignarCampus" class="w-full bg-muted border border-border rounded-lg p-2 font-bold text-foreground">
                  @for (c of listaCampus; track c.id) {
                    <option [value]="c.nombre">{{ c.nombre }}</option>
                  }
                </select>
              </div>

              <div>
                <label class="block font-bold text-muted-foreground mb-1">Carrera a Asignar</label>
                <input type="text" [(ngModel)]="formAsignarCarreraNombre" placeholder="Ej: LICENCIATURA EN BIOQUÍMICA Y FARMACIA" class="w-full bg-muted border border-border rounded-lg p-2 font-bold text-foreground">
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button (click)="cerrarModalAsignarCarrera()" class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground">Cancelar</button>
              <button (click)="guardarAsignacionCarreraModal()" class="px-5 py-2 rounded-xl bg-purple-700 text-white text-xs font-black">Asignar</button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL PARA USUARIO EVALUADOR -->
      @if (dialogUsuario()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-scale-in">
            <h3 class="text-base font-black text-foreground">{{ usuarioEditando() ? 'Editar Evaluador' : 'Agregar Evaluador' }}</h3>
            
            <div class="space-y-3 text-xs">
              <div>
                <label class="block font-bold text-muted-foreground mb-1">Nombre Completo</label>
                <input type="text" [(ngModel)]="formUsuarioNombre" class="w-full bg-muted border border-border rounded-lg p-2 font-bold text-foreground">
              </div>

              <div>
                <label class="block font-bold text-muted-foreground mb-1">Correo Institucional</label>
                <input type="email" [(ngModel)]="formUsuarioEmail" class="w-full bg-muted border border-border rounded-lg p-2 font-medium text-foreground">
              </div>

              <div>
                <label class="block font-bold text-muted-foreground mb-1">Campus Principal</label>
                <select [(ngModel)]="formUsuarioCampus" class="w-full bg-muted border border-border rounded-lg p-2 font-bold text-foreground">
                  @for (c of listaCampus; track c.id) {
                    <option [value]="c.nombre">{{ c.nombre }}</option>
                  }
                </select>
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-2">
              <button (click)="cerrarModalUsuario()" class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground">Cancelar</button>
              <button (click)="guardarUsuarioModal()" class="px-5 py-2 rounded-xl bg-purple-700 text-white text-xs font-black">Guardar</button>
            </div>
          </div>
        </div>
      }

      <!-- Toast Notificación -->
      @if (toastMessage()) {
        <div class="fixed bottom-6 right-6 bg-foreground text-background px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50 animate-bounce">
          <i class="pi pi-check-circle text-emerald-400 text-lg"></i>
          <span class="text-xs font-bold">{{ toastMessage() }}</span>
        </div>
      }

    </div>
  `
})
export class AdministracionEvaluacionesComponent {
  public readonly storage = inject(EvaluacionesStorageService);
  private readonly _db = inject(EvaluacionesDbService);
  public readonly Math = Math;

  public ratioEstudiantesPorVariante: number = 1;

  public tabActual = signal<'campus' | 'carreras' | 'usuarios' | 'configuracion' | 'tiempos'>('campus');
  public toastMessage = signal<string | null>(null);

  constructor() {
    this.ratioEstudiantesPorVariante = this._db.getEstudiantesPorVarianteParam();
    // El catálogo operativo debe llegar desde SEA. No mostrar catálogos
    // históricos o de demostración embebidos en el frontend.
    this.listaCampus = [];
    this.listaCarrerasCampus = [];
    this.listaUsuariosEvaluadores = [];
  }

  // TAB 1: Campus por Sede
  public filtroSedeCampus = 'Todos';
  public listaCampus: CampusItem[] = [
    { id: 1, nombre: 'COLONIAL', sede: 'Cochabamba', direccion: 'Av. Heroínas esq. Ayacucho', correos: ['evaluaciones.cochabamba@unitepc.edu.bo'], carrerasCount: 15, activo: true },
    { id: 2, nombre: 'JUAN PABLO II', sede: 'Cochabamba', direccion: 'Campus Juan Pablo II', correos: ['evaluaciones.juanpablo@unitepc.edu.bo'], carrerasCount: 8, activo: true },
    { id: 3, nombre: 'FLORIDA NORTE', sede: 'Cochabamba', direccion: 'Zona Norte', correos: ['evaluaciones.florida@unitepc.edu.bo'], carrerasCount: 3, activo: true },
    { id: 4, nombre: 'Campus Cobija', sede: 'Cobija', direccion: 'Campus Principal en Pando', correos: ['evaluaciones.cobija@unitepc.edu.bo'], carrerasCount: 5, activo: true },
    { id: 5, nombre: 'Campus El Alto', sede: 'El Alto', direccion: 'Campus Principal en La Paz', correos: ['evaluaciones.elalto@unitepc.edu.bo', 'evaluaciones.lapaz@unitepc.edu.bo'], carrerasCount: 20, activo: true },
    { id: 6, nombre: 'Campus Miragavina', sede: 'Cochabamba', direccion: 'Campus Principal en Cochabamba', correos: ['evaluaciones.miragavina@unitepc.edu.bo'], carrerasCount: 6, activo: true },
    { id: 7, nombre: 'Campus La Paz', sede: 'La Paz', direccion: 'Campus Principal en La Paz', correos: ['evaluaciones.lapaz@unitepc.edu.bo'], carrerasCount: 14, activo: true },
    { id: 8, nombre: 'Campus Puerto Quijarro', sede: 'Puerto Quijarro', direccion: 'Campus Principal en Santa Cruz', correos: ['evaluaciones.puertoquijarro@unitepc.edu.bo'], carrerasCount: 16, activo: true },
    { id: 9, nombre: 'Campus Santa Cruz', sede: 'Santa Cruz', direccion: 'Campus Principal en Santa Cruz', correos: ['evaluaciones.santacruz@unitepc.edu.bo'], carrerasCount: 10, activo: true },
    { id: 10, nombre: 'Campus Guayaramerin', sede: 'Guayaramerin', direccion: 'Campus Principal en Beni', correos: ['evaluaciones.guayaramerin@unitepc.edu.bo'], carrerasCount: 5, activo: true }
  ];

  public dialogCampus = signal<boolean>(false);
  public campusEditando = signal<CampusItem | null>(null);
  public formCampusNombre = '';
  public formCampusSede = 'Cochabamba';
  public formCampusDireccion = '';

  // TAB 2: Carreras por Campus
  public filtroCampusCarreras = 'Todos';
  public listaCarrerasCampus: CarreraCampusItem[] = [
    {
      id: 1,
      campus: 'Campus Cobija',
      carreras: [
        { id: 101, nombre: 'COMPLEMENTARIA CONTADURÍA PÚBLICA' },
        { id: 102, nombre: 'LICENCIATURA EN DERECHO' },
        { id: 103, nombre: 'LICENCIATURA EN MEDICINA VETERINARIA Y ZOOTECNIA' },
        { id: 104, nombre: 'LICENCIATURA EN BIOQUÍMICA Y FARMACIA' },
        { id: 105, nombre: 'LICENCIATURA EN MEDICINA' }
      ]
    },
    {
      id: 2,
      campus: 'Campus El Alto',
      carreras: [
        { id: 201, nombre: 'COMPLEMENTARIA CONTADURÍA PÚBLICA' },
        { id: 202, nombre: 'COMPLEMENTARIA EN ADMINISTRACIÓN DE EMPRESAS' },
        { id: 203, nombre: 'COMPLEMENTARIA INGENIERÍA COMERCIAL' },
        { id: 204, nombre: 'LICENCIATURA EN COMUNICACIÓN SOCIAL' },
        { id: 205, nombre: 'LICENCIATURA EN DERECHO' },
        { id: 206, nombre: 'LICENCIATURA EN INGENIERÍA ELECTRÓNICA' },
        { id: 207, nombre: 'LICENCIATURA EN INGENIERÍA DE SONIDO' },
        { id: 208, nombre: 'LICENCIATURA EN INGENIERÍA DE SISTEMAS' },
        { id: 209, nombre: 'LICENCIATURA EN INGENIERÍA BIOMÉDICA' },
        { id: 210, nombre: 'LICENCIATURA EN MEDICINA' }
      ]
    },
    {
      id: 3,
      campus: 'COLONIAL',
      carreras: [
        { id: 301, nombre: 'COMPLEMENTARIA CONTADURÍA PÚBLICA' },
        { id: 302, nombre: 'LICENCIATURA EN ADMINISTRACIÓN DE EMPRESAS' },
        { id: 303, nombre: 'LICENCIATURA EN INGENIERÍA COMERCIAL' },
        { id: 304, nombre: 'LICENCIATURA EN DERECHO' },
        { id: 305, nombre: 'LICENCIATURA EN INGENIERÍA DE SISTEMAS' },
        { id: 306, nombre: 'LICENCIATURA EN MEDICINA' }
      ]
    },
    {
      id: 4,
      campus: 'FLORIDA NORTE',
      carreras: [
        { id: 401, nombre: 'LICENCIATURA EN BIOQUÍMICA Y FARMACIA' },
        { id: 402, nombre: 'LICENCIATURA EN FISIOTERAPIA Y KINESIOLOGÍA' },
        { id: 403, nombre: 'LICENCIATURA EN MEDICINA' }
      ]
    },
    {
      id: 5,
      campus: 'JUAN PABLO II',
      carreras: [
        { id: 501, nombre: 'LICENCIATURA EN COMUNICACIÓN SOCIAL' },
        { id: 502, nombre: 'LICENCIATURA EN ARTE Y ESCULTURA' },
        { id: 503, nombre: 'LICENCIATURA EN INGENIERÍA ELECTRÓNICA' },
        { id: 504, nombre: 'LICENCIATURA EN INGENIERÍA DE SONIDO' },
        { id: 505, nombre: 'LICENCIATURA EN INGENIERÍA DE SISTEMAS' }
      ]
    }
  ];

  public dialogAsignarCarrera = signal<boolean>(false);
  public formAsignarCampus = 'COLONIAL';
  public formAsignarCarreraNombre = '';

  // TAB 3: Usuarios Evaluadores
  public filtroCampusUsuarios = 'Todos';
  public listaUsuariosEvaluadores: UsuarioEvaluadorItem[] = [
    { id: 1, nombre: 'LORENA VARGAS', email: 'lorena.vargas@unitepc.edu.bo', campus: ['Campus Miragavina'], carreras: ['LICENCIATURA EN CONTADURÍA PÚBLICA', 'LICENCIATURA EN ADM'], activo: true },
    { id: 2, nombre: 'LUCIEL TORREZ', email: 'luciel_miki@unitepc.edu.bo', campus: ['FLORIDA NORTE'], carreras: ['LICENCIATURA EN BIOQUÍMICA Y FARMACIA', 'LICENCIATURA EN ENFERMERÍA'], activo: true },
    { id: 3, nombre: 'YASMIL ANGULO', email: 'kayssmil.angulo.torres@gmail.com', campus: ['COLONIAL'], carreras: ['COMPLEMENTARIA CONTADURÍA PÚBLICA'], activo: true },
    { id: 4, nombre: 'SELENA PATZI', email: 'selena.patzi@unitepc.edu.bo', campus: ['JUAN PABLO II'], carreras: ['LICENCIATURA EN COMUNICACIÓN SOCIAL', 'LICENCIATURA EN ARTE Y ES'], activo: false },
    { id: 5, nombre: 'CLARIBEL RODRIGUEZ', email: 'claribel.rodriguez@unitepc.edu.bo', campus: ['COLONIAL'], carreras: ['COMPLEMENTARIA CONTADURÍA PÚBLICA'], activo: false },
    { id: 6, nombre: 'Omar Fernandez Romero', email: 'ofernandez_u10@unitepc.edu.bo', campus: ['Campus El Alto'], carreras: ['COMPLEMENTARIA CONTADURÍA PÚBLICA'], activo: false },
    { id: 7, nombre: 'Elmer Velasco Mejia', email: 'evelasco_mirai@unitepc.edu.bo', campus: ['Campus El Alto'], carreras: ['COMPLEMENTARIA CONTADURÍA PÚBLICA'], activo: true },
    { id: 8, nombre: 'Fernando Ponce', email: 'fernandoponce@unitepc.edu.bo', campus: ['Campus Guayaramerin'], carreras: ['LICENCIATURA EN INGENIERÍA COMERCIAL'], activo: true },
    { id: 9, nombre: 'MARCIAL LAKA', email: 'mlaka_evaluaciones@unitepc.edu.bo', campus: ['Campus Puerto Quijarro'], carreras: ['COMPLEMENTARIA CONTADURÍA PÚBLICA'], activo: true },
    { id: 10, nombre: 'JOSÉ ANTONIO LLUSCO', email: 'jose.hurtado@unitepc.edu.bo', campus: ['Campus Cobija'], carreras: ['LICENCIATURA EN DERECHO'], activo: false }
  ];

  public dialogUsuario = signal<boolean>(false);
  public usuarioEditando = signal<UsuarioEvaluadorItem | null>(null);
  public formUsuarioNombre = '';
  public formUsuarioEmail = '';
  public formUsuarioCampus = 'COLONIAL';

  // TAB 4: Configuración de Exámenes
  public nivelConfig = signal<'nacional' | 'sede' | 'carrera'>('nacional');
  public configSede = 'Cochabamba';
  public configCarrera = 'Ingeniería de Sistemas';
  public typstFormatoHoja = 'Oficio (Folio UNITEPC)';
  public typstFuente = 'Times New Roman';
  public typstTamanoFuente = 11;
  public typstLeading = '0.8em (línea) · 1.2em (pregunta)';

  public parcialesConfig = signal<ParcialConfig[]>([
    { nombre: '1º Parcial', totalPreguntas: 30, distribucion: { facil: 7, medio: 16, dificil: 7 } },
    { nombre: '2º Parcial', totalPreguntas: 30, distribucion: { facil: 7, medio: 16, dificil: 7 } },
    { nombre: 'Examen Final', totalPreguntas: 60, distribucion: { facil: 15, medio: 30, dificil: 15 } },
    { nombre: '2da Instancia', totalPreguntas: 50, distribucion: { facil: 10, medio: 25, dificil: 15 } }
  ]);

  public gestionTiempos = '2/2026';
  public tiempoMinutosAntesEntrega = 15;
  public tiempoHorasAntesGeneracion = 144;
  public tiempoHorasPostPatron = 8;
  public tiempoHorasAntesLista = 24;
  public tiempoHorasCandado72 = 72;

  // Filtros computados
  public campusFiltrados = computed(() => {
    if (this.filtroSedeCampus === 'Todos') return this.listaCampus;
    return this.listaCampus.filter(c => c.sede === this.filtroSedeCampus);
  });

  public carrerasPorCampusFiltradas = computed(() => {
    if (this.filtroCampusCarreras === 'Todos') return this.listaCarrerasCampus;
    return this.listaCarrerasCampus.filter(row => row.campus === this.filtroCampusCarreras);
  });

  public usuariosEvaluadoresFiltrados = computed(() => {
    if (this.filtroCampusUsuarios === 'Todos') return this.listaUsuariosEvaluadores;
    return this.listaUsuariosEvaluadores.filter(u => u.campus.includes(this.filtroCampusUsuarios));
  });

  public formCampusCorreos = signal<string[]>([]);
  public nuevoCorreoInput = '';

  // Acciones Campus
  public abrirModalCampus(item?: CampusItem): void {
    this.nuevoCorreoInput = '';
    if (item) {
      this.campusEditando.set(item);
      this.formCampusNombre = item.nombre;
      this.formCampusSede = item.sede;
      this.formCampusDireccion = item.direccion;
      this.formCampusCorreos.set([...(item.correos || [])]);
    } else {
      this.campusEditando.set(null);
      this.formCampusNombre = '';
      this.formCampusSede = 'Cochabamba';
      this.formCampusDireccion = '';
      this.formCampusCorreos.set(['evaluaciones@unitepc.edu.bo']);
    }
    this.dialogCampus.set(true);
  }

  public cerrarModalCampus(): void {
    this.dialogCampus.set(false);
  }

  public agregarCorreoCampusForm(): void {
    const emailLimpio = this.nuevoCorreoInput.trim().toLowerCase();
    if (!emailLimpio) return;
    if (this.formCampusCorreos().includes(emailLimpio)) {
      this._mostrarToast('El correo ya se encuentra en la lista.');
      return;
    }
    this.formCampusCorreos.update(list => [...list, emailLimpio]);
    this.nuevoCorreoInput = '';
  }

  public eliminarCorreoCampusForm(index: number): void {
    this.formCampusCorreos.update(list => list.filter((_, idx) => idx !== index));
  }

  public guardarCampusModal(): void {
    const edit = this.campusEditando();
    const correosFinales = this.formCampusCorreos().length > 0 ? this.formCampusCorreos() : ['evaluaciones@unitepc.edu.bo'];
    
    if (edit) {
      edit.nombre = this.formCampusNombre;
      edit.sede = this.formCampusSede;
      edit.direccion = this.formCampusDireccion;
      edit.correos = [...correosFinales];
      this._mostrarToast(`Campus '${edit.nombre}' actualizado con éxito.`);
    } else {
      const nuevo: CampusItem = {
        id: Date.now(),
        nombre: this.formCampusNombre || 'NUEVO CAMPUS',
        sede: this.formCampusSede,
        direccion: this.formCampusDireccion,
        correos: [...correosFinales],
        carrerasCount: 0,
        activo: true
      };
      this.listaCampus.unshift(nuevo);
      this._mostrarToast(`Campus '${nuevo.nombre}' creado con éxito.`);
    }
    this.cerrarModalCampus();
  }

  public toggleCampus(camp: CampusItem): void {
    camp.activo = !camp.activo;
    this._mostrarToast(`Campus '${camp.nombre}' ${camp.activo ? 'activado' : 'desactivado'}.`);
  }

  // Acciones Carreras por Campus
  public abrirModalAsignarCarrera(): void {
    this.dialogAsignarCarrera.set(true);
  }

  public cerrarModalAsignarCarrera(): void {
    this.dialogAsignarCarrera.set(false);
  }

  public guardarAsignacionCarreraModal(): void {
    const campusTarget = this.listaCarrerasCampus.find(c => c.campus === this.formAsignarCampus);
    if (campusTarget && this.formAsignarCarreraNombre) {
      campusTarget.carreras.push({ id: Date.now(), nombre: this.formAsignarCarreraNombre.toUpperCase() });
      this._mostrarToast(`Carrera '${this.formAsignarCarreraNombre}' asignada a '${campusTarget.campus}'.`);
    }
    this.cerrarModalAsignarCarrera();
  }

  public editarCarreraCampus(row: CarreraCampusItem, carr: { id: number; nombre: string }): void {
    this._mostrarToast(`Editando carrera '${carr.nombre}' en '${row.campus}'.`);
  }

  public quitarCarreraCampus(row: CarreraCampusItem, carr: { id: number; nombre: string }): void {
    row.carreras = row.carreras.filter(c => c.id !== carr.id);
    this._mostrarToast(`Carrera '${carr.nombre}' removida de '${row.campus}'.`);
  }

  // Acciones Usuarios Evaluadores
  public abrirModalUsuario(item?: UsuarioEvaluadorItem): void {
    if (item) {
      this.usuarioEditando.set(item);
      this.formUsuarioNombre = item.nombre;
      this.formUsuarioEmail = item.email;
      this.formUsuarioCampus = item.campus[0] || 'COLONIAL';
    } else {
      this.usuarioEditando.set(null);
      this.formUsuarioNombre = '';
      this.formUsuarioEmail = '';
      this.formUsuarioCampus = 'COLONIAL';
    }
    this.dialogUsuario.set(true);
  }

  public cerrarModalUsuario(): void {
    this.dialogUsuario.set(false);
  }

  public guardarUsuarioModal(): void {
    const edit = this.usuarioEditando();
    if (edit) {
      edit.nombre = this.formUsuarioNombre;
      edit.email = this.formUsuarioEmail;
      edit.campus = [this.formUsuarioCampus];
      this._mostrarToast(`Evaluador '${edit.nombre}' actualizado con éxito.`);
    } else {
      const nuevo: UsuarioEvaluadorItem = {
        id: Date.now(),
        nombre: this.formUsuarioNombre || 'NUEVO EVALUADOR',
        email: this.formUsuarioEmail || 'evaluador@unitepc.edu.bo',
        campus: [this.formUsuarioCampus],
        carreras: ['LICENCIATURA EN INGENIERÍA DE SISTEMAS'],
        activo: true
      };
      this.listaUsuariosEvaluadores.unshift(nuevo);
      this._mostrarToast(`Evaluador '${nuevo.nombre}' agregado con éxito.`);
    }
    this.cerrarModalUsuario();
  }

  public toggleAccesoUsuario(usr: UsuarioEvaluadorItem): void {
    usr.activo = !usr.activo;
    this._mostrarToast(`Acceso al sistema para '${usr.nombre}' ${usr.activo ? 'activado' : 'desactivado'}.`);
  }

  public quitarRolUsuario(usr: UsuarioEvaluadorItem): void {
    this.listaUsuariosEvaluadores = this.listaUsuariosEvaluadores.filter(u => u.id !== usr.id);
    this._mostrarToast(`Rol de evaluador removido para '${usr.nombre}'.`);
  }

  // Acciones Configuración
  public guardarConfiguracion(): void {
    this._db.setEstudiantesPorVarianteParam(this.ratioEstudiantesPorVariante || 1);
    this._mostrarToast(`Ratio de ${this.ratioEstudiantesPorVariante} alumno(s) por variante aplicado durante esta sesión.`);
  }

  public guardarTiempos(): void {
    this._mostrarToast(`Configuración de tiempos guardada exitosamente para la gestión ${this.gestionTiempos}.`);
  }

  private _mostrarToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
