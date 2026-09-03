import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluacionesStorageService, PlanEstudioItem, PlanEstudioSemestre, PlanExamenResumen } from '../../core/services/evaluaciones-storage.service';
import { UnitepcGatewayService } from '../../core/services/unitepc-gateway.service';
import { BancoPreguntasResponse, BancoPreguntasService } from '../../core/services/banco-preguntas.service';
import { RolExamenResponse, RolExamenService } from '../../core/services/rol-examen.service';
import { AuthService } from '../../core/services/auth.service';
import { BranchOffice, Career, Course, GroupItem } from '../../core/models/unitepc-gateway.models';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

type PlanParcialClave = '1P' | '2P' | 'FINAL' | '2DA_INSTANCIA';

@Component({
  selector: 'sea-plan-estudios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <i class="pi pi-book text-base"></i>
            </div>
            <h2 class="text-2xl font-black tracking-tight text-foreground">Plan de Estudios</h2>
          </div>
          <p class="text-xs text-muted-foreground mt-1">Vista general del plan de estudios por semestre y gestión de modalidades de examen.</p>
        </div>

        <div class="flex items-center gap-2">
          <button (click)="descargarMalla()" class="bg-card hover:bg-muted text-primary border border-border font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 shadow-2xs transition-colors">
            <i class="pi pi-download"></i>
            <span>Descargar Malla</span>
          </button>
        </div>
      </div>

      <!-- Filtros Superiores -->
      <div class="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
        
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          <!-- Selector de Gestión (Default II-2026) -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-calendar text-primary text-[10px]"></i> Gestión Académica
            </label>
            <select 
              [ngModel]="storage.gestionActiva()" 
              (ngModelChange)="onGestionChange($event)"
              class="w-full bg-muted/70 border border-border rounded-xl px-3 py-2 text-xs font-black text-foreground outline-none cursor-pointer focus:border-primary">
              <option value="II-2026">II-2026 (Gestión Activa)</option>
              <option value="I-2026">I-2026 (Anterior)</option>
              <option value="II-2025">II-2025 (Histórico)</option>
            </select>
          </div>

          <!-- Sede Académica -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-building text-primary text-[10px]"></i> Sede Académica
            </label>
            <select 
              [(ngModel)]="filtroSedeCodigo"
              (ngModelChange)="onSedeChange($event)"
              [disabled]="cargandoSedes()"
              class="w-full bg-muted/70 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary">
              @if (cargandoSedes()) {
                <option value="">Cargando sedes...</option>
              } @else if (sedes().length === 0) {
                <option value="">No hay sedes disponibles</option>
              } @else {
                @for (sede of sedes(); track sede.branchOfficeId) {
                  <option [value]="sede.code">{{ sede.name }} ({{ sede.code }})</option>
                }
              }
            </select>
          </div>

          <!-- Carrera -->
          <div class="lg:col-span-2">
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-graduation-cap text-primary text-[10px]"></i> Carrera
            </label>
            <select 
              [(ngModel)]="filtroCarreraCodigo"
              (ngModelChange)="onCarreraChange($event)"
              [disabled]="cargandoCarreras() || !filtroSedeCodigo"
              class="w-full bg-muted/70 border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary">
              @if (cargandoCarreras()) {
                <option value="">Cargando carreras...</option>
              } @else if (carreras().length === 0) {
                <option value="">No hay carreras disponibles</option>
              } @else {
                @for (carrera of carreras(); track carrera.careerId) {
                  <option [value]="carrera.careerCode">{{ carrera.careerName }} ({{ carrera.careerCode }})</option>
                }
              }
            </select>
          </div>

          <!-- Buscar Plan de Estudios -->
          <div>
            <label class="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
              <i class="pi pi-search text-primary text-[10px]"></i> Búsqueda
            </label>
            <div class="relative">
              <input 
                type="text" 
                [ngModel]="busquedaTexto()"
                (ngModelChange)="busquedaTexto.set($event)"
                placeholder="Buscar plan de estudios..."
                class="w-full bg-muted/70 border border-border rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-foreground outline-none focus:border-primary">
              <i class="pi pi-search absolute left-2.5 top-2.5 text-muted-foreground text-xs"></i>
            </div>
          </div>

        </div>

        <!-- Fila Inferior de Filtros: Plan Curricular, Toggle y Tabs de Parcial -->
        <div class="pt-3 border-t border-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          <!-- Selector Plan Curricular y Toggle -->
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-[10px] font-extrabold uppercase text-muted-foreground">Plan Curricular:</span>
              <select 
                [ngModel]="filtroPlanCurricular()"
                (ngModelChange)="filtroPlanCurricular.set($event)"
                [disabled]="planesCurriculares().length === 0"
                class="bg-muted/70 border border-border rounded-lg px-2.5 py-1 text-xs font-bold text-foreground outline-none">
                <option value="todos">Todos los Planes</option>
                @for (plan of planesCurriculares(); track plan) {
                  <option [value]="plan">{{ plan }}</option>
                }
              </select>
              @if (planesCurriculares().length === 0) {
                <span class="text-[10px] text-muted-foreground">SEA no informó planes curriculares</span>
              }
            </div>

            <!-- Toggle Ocultar sin asignar -->
            <label class="flex items-center gap-2 text-xs font-bold text-foreground cursor-pointer select-none">
              <input 
                type="checkbox" 
                [ngModel]="ocultarSinAsignar()"
                (ngModelChange)="ocultarSinAsignar.set($event)"
                class="rounded text-amber-500 focus:ring-amber-500 h-4 w-4">
              <span class="text-muted-foreground">Ocultar sin asignar</span>
            </label>
          </div>

          <!-- Tabs de Seguimiento de Examen (Pills interactivas) -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mr-1">Seguimiento de Examen:</span>
            
            <button 
              [class]="parcialActivo() === '1P' ? 'bg-primary text-white shadow-xs' : 'bg-muted text-muted-foreground hover:text-foreground'"
              (click)="parcialActivo.set('1P')"
              class="font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
              <i class="pi pi-flag text-xs"></i>
              <span>1er Parcial</span>
            </button>

            <button 
              [class]="parcialActivo() === '2P' ? 'bg-primary text-white shadow-xs' : 'bg-muted text-muted-foreground hover:text-foreground'"
              (click)="parcialActivo.set('2P')"
              class="font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
              <i class="pi pi-check-circle text-xs"></i>
              <span>2do Parcial</span>
            </button>

            <button 
              [class]="parcialActivo() === 'FINAL' ? 'bg-primary text-white shadow-xs' : 'bg-muted text-muted-foreground hover:text-foreground'"
              (click)="parcialActivo.set('FINAL')"
              class="font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
              <i class="pi pi-star text-xs"></i>
              <span>Examen Final</span>
            </button>

            <button 
              [class]="parcialActivo() === '2DA_INSTANCIA' ? 'bg-primary text-white shadow-xs' : 'bg-muted text-muted-foreground hover:text-foreground'"
              (click)="parcialActivo.set('2DA_INSTANCIA')"
              class="font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
              <i class="pi pi-refresh text-xs"></i>
              <span>2da Instancia</span>
            </button>
          </div>

        </div>

      </div>

      @if (cargandoPlan()) {
        <div class="bg-card border border-primary/20 rounded-xl p-5 flex items-center gap-3 text-sm text-primary shadow-xs">
          <i class="pi pi-spin pi-spinner"></i>
          <span class="font-bold">Cargando plan de estudios y bancos de preguntas registrados...</span>
        </div>
      } @else if (errorCarga()) {
        <div class="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3 text-sm text-rose-800 shadow-xs">
          <i class="pi pi-exclamation-triangle mt-0.5"></i>
          <div>
            <p class="font-black">No se pudo cargar el plan de estudios.</p>
            <p class="text-xs mt-1">{{ errorCarga() }}</p>
            <button (click)="recargarPlan()" class="mt-2 text-xs font-black underline">Intentar nuevamente</button>
          </div>
        </div>
      }

      <!-- Tarjetas de Estadísticas -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <!-- Total Plan de Estudios -->
        <div class="bg-card border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div class="space-y-0.5">
            <span class="text-3xl font-black text-primary font-mono">{{ totalPlan() }}</span>
            <p class="text-xs font-bold text-muted-foreground">Total Plan de Estudios</p>
          </div>
          <div class="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <i class="pi pi-book text-xl"></i>
          </div>
        </div>

        <!-- Asignadas con Docente -->
        <div class="bg-card border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div class="space-y-0.5">
            <span class="text-3xl font-black text-emerald-600 font-mono">{{ totalAsignadas() }}</span>
            <p class="text-xs font-bold text-muted-foreground">Asignadas con Docente</p>
          </div>
          <div class="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <i class="pi pi-user-plus text-xl"></i>
          </div>
        </div>

        <!-- Vacantes / Por Designar -->
        <div class="bg-card border border-border rounded-xl p-5 shadow-xs flex items-center justify-between">
          <div class="space-y-0.5">
            <span class="text-3xl font-black text-amber-500 font-mono">{{ totalSinAsignar() }}</span>
            <p class="text-xs font-bold text-muted-foreground">Vacantes / Por Designar</p>
          </div>
          <div class="h-12 w-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
            <i class="pi pi-user-minus text-xl"></i>
          </div>
        </div>

      </div>

      <!-- Lista de Semestres (Acordeones Expandibles por Semestre) -->
      <div class="space-y-4">
        @for (sem of semestresFiltrados(); track sem.numero) {
          <div class="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
            
            <!-- Cabecera del Semestre (Acordeón) -->
            <div 
              (click)="toggleSemestre(sem.numero)"
              class="p-4 bg-card hover:bg-muted/30 border-b border-border flex items-center justify-between cursor-pointer transition-colors select-none">
              
              <div class="flex items-center gap-3">
                <div class="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-xs font-mono shadow-xs">
                  {{ sem.numero }}°
                </div>
                <div>
                  <h3 class="text-sm font-black text-foreground">{{ sem.nombre }}</h3>
                  <p class="text-[11px] text-muted-foreground font-medium">
                    {{ sem.asignaturas.length }} planes de estudio · {{ sem.horasTotales }} horas
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <i [class]="isExpanded(sem.numero) ? 'pi pi-chevron-up text-primary' : 'pi pi-chevron-down text-muted-foreground'" class="text-sm"></i>
              </div>
            </div>

            <!-- Tabla de Asignaturas del Semestre (Sin columna de conteo de preguntas) -->
            @if (isExpanded(sem.numero)) {
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="border-b border-border bg-muted/40 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      <th class="p-3.5">Código</th>
                      <th class="p-3.5">Plan de Estudios</th>
                      <th class="p-3.5 text-center">Horas</th>
                      <th class="p-3.5">Docente / Grupo</th>
                      <th class="p-3.5 text-center">Modalidad principal</th>
                      <th class="p-3.5 min-w-[430px]">Información del parcial seleccionado</th>
                      <th class="p-3.5 text-center">Estado</th>
                      <th class="p-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border text-xs">
                    @for (asig of sem.asignaturas; track asig.id) {
                      <tr class="hover:bg-muted/20 transition-colors">
                        
                        <!-- Código -->
                        <td class="p-3.5 font-mono font-bold text-primary">
                          {{ asig.codigo }}
                        </td>

                        <!-- Plan de Estudios -->
                        <td class="p-3.5">
                          <div class="font-black text-foreground">{{ asig.nombre }}</div>
                          @if (asig.esMateriaComun) {
                            <span class="bg-indigo-50 border border-indigo-200 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 inline-block">
                              Materia Común
                            </span>
                          }
                        </td>

                        <!-- Horas -->
                        <td class="p-3.5 text-center font-mono font-bold text-muted-foreground">
                          {{ asig.horas }}
                        </td>

                        <!-- Docente / Grupo -->
                        <td class="p-3.5">
                          @if (asig.asignada) {
                            <div class="flex items-center gap-2">
                              <div class="h-7 w-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                <i class="pi pi-user"></i>
                              </div>
                              <div class="min-w-0">
                                <div class="font-bold text-foreground text-[11px] truncate">{{ asig.docenteNombre }}</div>
                                <span class="text-[10px] text-primary font-bold">
                                  <i class="pi pi-users text-[9px]"></i> {{ asig.grupo }}
                                </span>
                              </div>
                            </div>
                          } @else {
                            <div class="flex items-center gap-1.5 text-amber-600 text-xs italic font-medium">
                              <i class="pi pi-exclamation-triangle"></i>
                              <span>Sin asignar</span>
                            </div>
                          }
                        </td>

                        <!-- Modalidad principal -->
                        <td class="p-3.5 text-center">
                          @let modalidadPrincipal = getInformacionParcial(asig)?.modalidad;
                          @if (asig.asignada && modalidadPrincipal === 'Virtual') {
                            <span class="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <i class="pi pi-desktop text-[9px]"></i> Virtual
                            </span>
                          } @else if (asig.asignada && (modalidadPrincipal === 'Con Cartilla' || (!modalidadPrincipal && asig.conCartilla))) {
                            <span class="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <i class="pi pi-file-check text-[9px]"></i> Con Cartilla
                            </span>
                          } @else if (asig.asignada) {
                            <span class="bg-muted text-muted-foreground border border-border text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <i class="pi pi-file text-[9px]"></i> Sin Cartilla
                            </span>
                          } @else {
                            <span class="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <i class="pi pi-question-circle text-[9px]"></i> Por definir
                            </span>
                          }
                        </td>

                        <!-- Información macro del parcial seleccionado -->
                        <td class="p-2">
                          @let info = getInformacionParcial(asig);
                          @if (info?.tieneRol) {
                            <div [class]="'flex items-center gap-2 rounded-lg border px-2.5 py-2 ' + (info?.cumple ? 'border-emerald-200 bg-emerald-50' : 'border-indigo-200 bg-indigo-50/50')">
                              <span class="w-20 shrink-0 text-[10px] font-black text-primary">{{ info?.etiqueta }}</span>
                              <span class="bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-full px-2 py-0.5 text-[9px] font-black whitespace-nowrap">Rol de examen programado</span>
                              <span class="text-[10px] font-mono text-foreground whitespace-nowrap">
                                {{ info?.facil }}F · {{ info?.medio }}M · {{ info?.dificil }}D · {{ info?.total }} total
                              </span>
                              <span class="text-[9px] font-bold text-muted-foreground whitespace-nowrap">{{ info?.modalidad }}</span>
                              @if (info?.cumple) {
                                <span class="ml-auto bg-emerald-600 text-white text-[10px] font-black rounded-full px-2 py-0.5 whitespace-nowrap">
                                  <i class="pi pi-check-circle mr-1"></i> OK
                                </span>
                              } @else if (!info?.bancoCargado) {
                                <span class="ml-auto text-amber-700 text-[10px] font-black whitespace-nowrap">Banco pendiente</span>
                              } @else {
                                <span class="ml-auto text-amber-700 text-[10px] font-black whitespace-nowrap">Pendiente</span>
                              }
                            </div>
                          } @else {
                            <div class="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2">
                              <span class="w-20 shrink-0 text-[10px] font-black text-primary">{{ info?.etiqueta || parcialLabel() }}</span>
                              <i class="pi pi-info-circle text-amber-600"></i>
                              <span class="text-[10px] font-black text-amber-800">No tiene rol de examen programado para este parcial</span>
                            </div>
                          }
                        </td>

                        <!-- Estado del parcial activo -->
                        <td class="p-3.5 text-center">
                          @let est = getEstadoExamen(asig);
                          <span class="bg-indigo-900 text-white font-black text-[10px] px-2.5 py-0.5 rounded-md uppercase shadow-2xs">
                            {{ est }}
                          </span>
                        </td>

                        <!-- Estado de Asignación -->
                        <td class="p-3.5 text-center">
                          @if (asig.asignada) {
                            <span class="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2 py-0.5 rounded-md">
                              Asignada
                            </span>
                          } @else {
                            <span class="bg-amber-100 text-amber-800 font-black text-[10px] px-2 py-0.5 rounded-md">
                              Vacante
                            </span>
                          }
                        </td>

                        <!-- Columna Acciones: Abre Modal de Confirmación y Advertencia de Estados -->
                        <td class="p-3.5 text-right">
                          <div class="inline-flex items-center gap-1.5">
                            @if (asig.asignada && asig.conCartilla) {
                              <button 
                                (click)="solicitarCambioCartilla(asig)"
                                title="Cambiar a Sin Cartilla (Examen físico/manual)"
                                class="bg-muted hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200 text-muted-foreground border border-border font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all">
                                <i class="pi pi-times-circle text-[10px]"></i>
                                <span>Sin Cartilla</span>
                              </button>
                            } @else if (asig.asignada) {
                              <button 
                                (click)="solicitarCambioCartilla(asig)"
                                title="Cambiar a generación digital"
                                class="bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/30 font-bold text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all">
                                <i class="pi pi-check-circle text-[10px]"></i>
                                <span>Con Cartilla</span>
                              </button>
                            }
                          </div>
                        </td>

                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }

          </div>
        }
      </div>

      <!-- Modal de Advertencia de Transición de Estados -->
      @if (itemSeleccionadoParaCambio()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in">
            
            <!-- Cabecera del Modal con Icono de Advertencia -->
            <div class="flex items-start gap-3.5">
              <div class="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
                <i class="pi pi-exclamation-triangle text-xl"></i>
              </div>
              <div class="space-y-1">
                <h3 class="text-base font-black text-foreground">Cambio en la Secuencia de Estados</h3>
                <p class="text-xs font-bold text-primary font-mono">
                  {{ itemSeleccionadoParaCambio()?.codigo }} · {{ itemSeleccionadoParaCambio()?.nombre }}
                </p>
              </div>
            </div>

            <!-- Cuerpo de la Advertencia según la transición -->
            <div class="bg-muted/60 border border-border rounded-xl p-4 space-y-3 text-xs text-foreground">
              @if (itemSeleccionadoParaCambio()?.conCartilla) {
                <!-- Transición: De Con Cartilla -> Sin Cartilla -->
                <p class="text-muted-foreground leading-relaxed">
                  Está a punto de cambiar la modalidad de evaluación a <strong>Sin Cartilla</strong>.
                </p>

                <div class="bg-amber-500/10 border-l-4 border-amber-500 p-3 rounded-r-lg space-y-1.5">
                  <div class="font-extrabold text-amber-800 flex items-center gap-1.5">
                    <i class="pi pi-info-circle"></i>
                    <span>Impacto en el Flujo de Estados:</span>
                  </div>
                  <ul class="list-disc list-inside text-amber-900/90 text-[11px] space-y-1 font-medium">
                    <li>No se requerirá la carga de archivo Excel con banco de preguntas.</li>
                    <li>No se generarán variantes automáticas ni hojas de respuestas dentro del examen.</li>
                    <li>El estado del examen pasará a <strong>Gestión Manual / Exento de Banco</strong>.</li>
                  </ul>
                </div>
              } @else {
                <!-- Transición: De Sin Cartilla -> Con Cartilla -->
                <p class="text-muted-foreground leading-relaxed">
                  Está a punto de activar la modalidad <strong>Con Cartilla</strong>.
                </p>

                <div class="bg-indigo-500/10 border-l-4 border-indigo-600 p-3 rounded-r-lg space-y-1.5">
                  <div class="font-extrabold text-indigo-900 flex items-center gap-1.5">
                    <i class="pi pi-info-circle"></i>
                    <span>Impacto en el Flujo de Estados:</span>
                  </div>
                  <ul class="list-disc list-inside text-indigo-900/90 text-[11px] space-y-1 font-medium">
                    <li>El encargado de evaluaciones subirá el archivo Excel con las preguntas y fórmulas.</li>
                    <li>El ciclo requerirá: <strong>Programado $\rightarrow$ Generado $\rightarrow$ Impreso $\rightarrow$ Entregado $\rightarrow$ Devuelto $\rightarrow$ Pendiente de notas $\rightarrow$ Calificado</strong>.</li>
                  </ul>
                </div>
              }
            </div>

            <!-- Botones de Acción -->
            <div class="flex items-center justify-end gap-3 pt-2">
              <button 
                (click)="cancelarCambio()"
                class="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors">
                Cancelar
              </button>
              
              <button 
                (click)="confirmarCambio()"
                class="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-black shadow-xs transition-colors flex items-center gap-2">
                <i class="pi pi-check"></i>
                <span>Confirmar y Cambiar Secuencia</span>
              </button>
            </div>

          </div>
        </div>
      }

      <!-- Toast Notificación -->
      @if (toastMessage()) {
        <div class="app-toast fixed bottom-6 right-6 bg-foreground text-background px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 z-[20000] animate-bounce" role="status" aria-live="polite">
          <i class="pi pi-check-circle text-emerald-400 text-lg"></i>
          <span class="text-xs font-bold">{{ toastMessage() }}</span>
        </div>
      }

    </div>
  `
})
export class PlanEstudiosComponent implements OnInit {
  public readonly storage = inject(EvaluacionesStorageService);
  private readonly gateway = inject(UnitepcGatewayService);
  private readonly rolService = inject(RolExamenService);
  private readonly bancoService = inject(BancoPreguntasService);
  private readonly auth = inject(AuthService);

  public sedes = signal<BranchOffice[]>([]);
  public carreras = signal<Career[]>([]);
  public filtroSedeCodigo = '';
  public filtroCarreraCodigo = '';
  public cargandoSedes = signal(true);
  public cargandoCarreras = signal(false);
  public cargandoPlan = signal(false);
  public errorCarga = signal<string | null>(null);
  public planSemestres = signal<PlanEstudioSemestre[]>([]);
  public filtroPlanCurricular = signal('todos');
  public busquedaTexto = signal('');
  public ocultarSinAsignar = signal(false);

  public parcialActivo = signal<'1P' | '2P' | 'FINAL' | '2DA_INSTANCIA'>('1P');
  public toastMessage = signal<string | null>(null);
  public itemSeleccionadoParaCambio = signal<PlanEstudioItem | null>(null);

  private readonly parcialesConfig: Array<{ clave: PlanParcialClave; etiqueta: string }> = [
    { clave: '1P', etiqueta: '1er Parcial' },
    { clave: '2P', etiqueta: '2do Parcial' },
    { clave: 'FINAL', etiqueta: 'Examen Final' },
    { clave: '2DA_INSTANCIA', etiqueta: '2da Instancia' }
  ];

  private _expandedSemestres = signal<number[]>([1, 2, 3]);

  public totalPlan = computed(() => this.planSemestres().reduce((total, semestre) => total + semestre.asignaturas.length, 0));
  public totalAsignadas = computed(() => this.planSemestres().reduce(
    (total, semestre) => total + semestre.asignaturas.filter(asignatura => asignatura.asignada).length, 0
  ));
  public totalSinAsignar = computed(() => this.totalPlan() - this.totalAsignadas());
  public planesCurriculares = computed(() => [...new Set(
    this.planSemestres()
      .flatMap(semestre => semestre.asignaturas)
      .map(asignatura => asignatura.planCurricular)
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, 'es')));

  public ngOnInit(): void {
    if (this.auth.usuario()?.rol === 'DOCENTE') this.ocultarSinAsignar.set(true);
    this.cargarSedes();
  }

  public onSedeChange(codigoSede: string): void {
    const sede = this.sedes().find(item => item.code === codigoSede);
    if (!sede) return;

    this.filtroSedeCodigo = sede.code;
    this.filtroCarreraCodigo = '';
    this.carreras.set([]);
    this.planSemestres.set([]);
    this.cargarCarreras(sede.code);
  }

  public onCarreraChange(codigoCarrera: string): void {
    const carrera = this.carreras().find(item => item.careerCode === codigoCarrera);
    if (!carrera) return;

    this.filtroCarreraCodigo = carrera.careerCode;
    this.filtroPlanCurricular.set('todos');
    this.cargarPlanReal(this.filtroSedeCodigo, carrera.careerCode);
  }

  public recargarPlan(): void {
    if (this.filtroSedeCodigo && this.filtroCarreraCodigo) {
      this.cargarPlanReal(this.filtroSedeCodigo, this.filtroCarreraCodigo);
    } else {
      this.cargarSedes();
    }
  }

  private cargarSedes(): void {
    this.cargandoSedes.set(true);
    this.errorCarga.set(null);
    this.gateway.getBranchOffices().subscribe({
      next: sedes => {
        this.sedes.set(sedes || []);
        this.cargandoSedes.set(false);

        const sedeInicial = this.gateway.resolverSedeInicial(sedes);
        if (sedeInicial) {
          this.filtroSedeCodigo = sedeInicial.code;
          this.cargarCarreras(sedeInicial.code);
        } else {
          this.carreras.set([]);
          this.planSemestres.set([]);
          this.errorCarga.set('El catálogo institucional no devolvió ninguna sede.');
        }
      },
      error: () => {
        this.cargandoSedes.set(false);
        this.carreras.set([]);
        this.planSemestres.set([]);
        this.errorCarga.set('No fue posible consultar las sedes oficiales. Verifica la conexión institucional.');
      }
    });
  }

  private cargarCarreras(codigoSede: string): void {
    this.cargandoCarreras.set(true);
    this.errorCarga.set(null);
    this.gateway.getCareers(codigoSede).subscribe({
      next: carreras => {
        this.carreras.set(carreras || []);
        this.cargandoCarreras.set(false);

        const carreraInicial = carreras[0];
        if (carreraInicial) {
          this.filtroCarreraCodigo = carreraInicial.careerCode;
          this.cargarPlanReal(codigoSede, carreraInicial.careerCode);
        } else {
          this.planSemestres.set([]);
          this.errorCarga.set('La sede seleccionada no tiene carreras disponibles.');
        }
      },
      error: () => {
        this.cargandoCarreras.set(false);
        this.planSemestres.set([]);
        this.errorCarga.set('No fue posible consultar las carreras de la sede seleccionada.');
      }
    });
  }

  private cargarPlanReal(codigoSede: string, codigoCarrera: string): void {
    if (!codigoSede || !codigoCarrera) return;

    this.cargandoPlan.set(true);
    this.errorCarga.set(null);
    const sede = this.sedes().find(item => item.code === codigoSede);
    const carrera = this.carreras().find(item => item.careerCode === codigoCarrera);
    const gruposSea$ = sede && carrera
      ? this.gateway.getGroups(this.gestionParaSea(), sede.branchOfficeId, carrera.careerId, undefined, sede.code, carrera.careerCode).pipe(
          catchError(() => of([] as GroupItem[]))
        )
      : of([] as GroupItem[]);

    forkJoin({
      cursos: this.gateway.getCourses(codigoSede, codigoCarrera),
      grupos: gruposSea$,
      roles: this.rolService.listar(codigoSede, codigoCarrera)
    }).subscribe({
      next: ({ cursos, grupos, roles }) => {
        const consultasBanco = roles.map(rol => this.bancoService.obtenerPorRol(rol.id).pipe(
          catchError(() => of(null))
        ));

        if (consultasBanco.length === 0) {
          this.planSemestres.set(this.construirPlan(cursos, grupos, roles, new Map()));
          this.cargandoPlan.set(false);
          return;
        }

        forkJoin(consultasBanco).subscribe({
          next: bancos => {
            const bancosPorRol = new Map<string, BancoPreguntasResponse>();
            bancos.forEach((banco, indice) => {
              if (banco) bancosPorRol.set(roles[indice].id, banco);
            });
            this.planSemestres.set(this.construirPlan(cursos, grupos, roles, bancosPorRol));
            this.cargandoPlan.set(false);
          },
          error: () => {
            this.planSemestres.set(this.construirPlan(cursos, grupos, roles, new Map()));
            this.cargandoPlan.set(false);
            this.errorCarga.set('Se cargó el plan, pero no fue posible consultar el detalle de los bancos de preguntas.');
          }
        });
      },
      error: () => {
        this.cargandoPlan.set(false);
        this.planSemestres.set([]);
        this.errorCarga.set('No fue posible consultar las asignaturas y exámenes de la carrera seleccionada.');
      }
    });
  }

  private construirPlan(
    cursos: Course[],
    grupos: GroupItem[],
    roles: RolExamenResponse[],
    bancosPorRol: Map<string, BancoPreguntasResponse>
  ): PlanEstudioSemestre[] {
    const rolesPorCurso = new Map<string, RolExamenResponse[]>();
    for (const rol of roles) {
      const llave = rol.seaSyllabusCourseId || rol.materiaCodigo;
      const actuales = rolesPorCurso.get(llave) || [];
      actuales.push(rol);
      rolesPorCurso.set(llave, actuales);
    }

    const docente = this.auth.usuario()?.rol === 'DOCENTE';
    const cursosVisibles = docente
      ? cursos.filter(curso => grupos.some(grupo => grupo.syllabusCourseId === curso.syllabusCourseId)
          || roles.some(rol => (rol.seaSyllabusCourseId || rol.materiaCodigo) === curso.syllabusCourseId))
      : cursos;
    const items: PlanEstudioItem[] = [];
    let id = 1;
    for (const curso of cursosVisibles) {
      const rolesCurso = rolesPorCurso.get(curso.syllabusCourseId) || [];
      const gruposCurso = grupos.filter(grupo => grupo.syllabusCourseId === curso.syllabusCourseId);

      // El grupo/docente proviene del catálogo SEA aunque todavía no exista
      // un rol de examen. Los roles solo complementan el estado del parcial.
      items.push(this.crearItemPlan(curso, gruposCurso, rolesCurso, id++, bancosPorRol));
    }

    const porSemestre = new Map<number, PlanEstudioItem[]>();
    for (const item of items) {
      const semestre = item.semestre || 0;
      porSemestre.set(semestre, [...(porSemestre.get(semestre) || []), item]);
    }

    return [...porSemestre.entries()]
      .sort(([semestreA], [semestreB]) => semestreA - semestreB)
      .map(([numero, asignaturas]) => ({
        numero,
        nombre: numero > 0 ? `${numero}° Semestre` : 'Sin semestre asignado',
        horasTotales: asignaturas.reduce((total, item) => total + item.horas, 0),
        asignaturas
      }));
  }

  private crearItemPlan(
    curso: Course,
    grupos: GroupItem[],
    roles: RolExamenResponse[],
    id: number,
    bancosPorRol: Map<string, BancoPreguntasResponse> = new Map()
  ): PlanEstudioItem {
    const rolPrincipal = roles[0];
    const grupoPrincipal = grupos[0];
    const gruposUnicos = grupos.filter((grupo, indice, lista) =>
      lista.findIndex(item => item.groupId === grupo.groupId) === indice
    );
    const gruposLabel = gruposUnicos.map(grupo => grupo.code).filter(Boolean).join(' · ');
    const docentesGrupo = gruposUnicos.map(grupo => {
      const rolGrupo = roles.find(rol => (rol.grupo || '').trim() === grupo.code);
      return rolGrupo?.docenteNombre?.trim()
        || grupo.teacherName?.trim()
        || (grupo.teacherIdentityNumber ? `Nombre no disponible (CI ${grupo.teacherIdentityNumber})` : '');
    }).filter(Boolean);
    const docentesRol = roles.map(rol => rol.docenteNombre?.trim()).filter(Boolean) as string[];
    const docentes = [...new Set(docentesGrupo.length > 0 ? docentesGrupo : docentesRol)];
    const cisGrupo = gruposUnicos.map(grupo => grupo.teacherIdentityNumber?.trim()).filter(Boolean);
    const cisRol = roles.map(rol => rol.docenteCi?.trim()).filter(Boolean) as string[];
    const docentesCi = [...new Set(cisGrupo.length > 0 ? cisGrupo : cisRol)];
    const gruposMostrar = gruposLabel || [...new Set(roles.map(rol => rol.grupo).filter(Boolean))].join(' · ');
    const examenes = {} as Record<string, PlanExamenResumen>;
    for (const parcial of this.parcialesConfig) {
      const rol = roles.find(item => this.normalizarParcial(item.tipoParcial) === parcial.clave);
      const banco = rol ? bancosPorRol.get(rol.id) : undefined;
      const facil = banco?.facilesCount || 0;
      const medio = banco?.mediasCount || 0;
      const dificil = banco?.dificilesCount || 0;
      const total = banco?.totalReactivos || 0;
      examenes[parcial.clave] = {
        clave: parcial.clave,
        etiqueta: parcial.etiqueta,
        facil,
        medio,
        dificil,
        total,
        modalidad: rol ? this.getModalidadLabel(rol.modalidad) : 'No registrado',
        estado: rol?.estadoFlujo || 'Sin examen',
        bancoCargado: !!banco,
        tieneRol: !!rol,
        cumple: !!banco && total === 60 && facil === 15 && medio === 30 && dificil === 15
      };
    }

    return {
      id,
      codigo: curso.courseCode,
      nombre: curso.courseName.trim(),
      planCurricular: curso.planCurricular?.trim() || '',
      semestre: curso.semester || 0,
      horas: (curso.theoryHours || 0) + (curso.practiceHours || 0),
      docenteNombre: docentes.join(' · ') || rolPrincipal?.docenteNombre || '',
      docenteCi: docentesCi.join(' · ') || rolPrincipal?.docenteCi || '',
      grupo: gruposMostrar || rolPrincipal?.grupo || grupoPrincipal?.code || '',
      asignada: gruposUnicos.length > 0 || roles.length > 0,
      esMateriaComun: false,
      conCartilla: roles.some(rol => rol.modalidad === 'PRESENCIAL_CARTILLA'),
      progresoDoc: 0,
      preguntas1P: this.aResumenDificultad(examenes['1P']),
      preguntas2P: this.aResumenDificultad(examenes['2P']),
      preguntasFinal: this.aResumenDificultad(examenes['FINAL']),
      examenes,
      fecha1P: examenes['1P'].estado === 'Sin examen' ? '—' : (roles.find(rol => this.normalizarParcial(rol.tipoParcial) === '1P')?.fechaDisplay || '—'),
      fecha2P: examenes['2P'].estado === 'Sin examen' ? '—' : (roles.find(rol => this.normalizarParcial(rol.tipoParcial) === '2P')?.fechaDisplay || '—'),
      fechaFinal: examenes['FINAL'].estado === 'Sin examen' ? '—' : (roles.find(rol => this.normalizarParcial(rol.tipoParcial) === 'FINAL')?.fechaDisplay || '—'),
      estadoExamen1P: this.mapEstadoLegacy(examenes['1P'].estado),
      estadoExamen2P: this.mapEstadoLegacy(examenes['2P'].estado),
      estadoExamenFinal: this.mapEstadoLegacy(examenes['FINAL'].estado)
    };
  }

  private aResumenDificultad(info: PlanExamenResumen): { facil: number; medio: number; dificil: number; total: number } {
    return { facil: info.facil, medio: info.medio, dificil: info.dificil, total: info.total };
  }

  private getModalidadLabel(modalidad: string): string {
    if (modalidad === 'VIRTUAL') return 'Virtual';
    if (modalidad === 'PRESENCIAL_CARTILLA') return 'Con Cartilla';
    if (modalidad === 'PRESENCIAL_SIN_CARTILLA') return 'Sin Cartilla';
    return modalidad || 'No registrada';
  }

  private normalizarParcial(tipo: string): PlanParcialClave | null {
    if (tipo === '1er Parcial') return '1P';
    if (tipo === '2do Parcial') return '2P';
    if (tipo === 'Final' || tipo === 'Examen Final') return 'FINAL';
    if (tipo === '2da Instancia') return '2DA_INSTANCIA';
    return null;
  }

  private mapEstadoLegacy(estado: string): 'Calificado' | 'Devuelto' | 'Pendiente' | 'Generado' {
    if (estado === 'GENERADO' || estado === 'IMPRESO' || estado === 'ENTREGADO') return 'Generado';
    if (estado === 'DEVUELTO') return 'Devuelto';
    if (estado === 'PENDIENTE_NOTAS') return 'Pendiente';
    if (estado === 'CALIFICADO') return 'Calificado';
    return 'Pendiente';
  }

  public parcialLabel = computed(() => {
    switch (this.parcialActivo()) {
      case '1P': return '1er Parcial';
      case '2P': return '2do Parcial';
      case 'FINAL': return 'Examen Final';
      case '2DA_INSTANCIA': return '2da Instancia';
    }
  });

  public semestresFiltrados = computed(() => {
    let list = this.planSemestres();
    const planSeleccionado = this.filtroPlanCurricular().trim().toLowerCase();
    const query = this.busquedaTexto().trim().toLowerCase();

    if (planSeleccionado && planSeleccionado !== 'todos') {
      list = list.map(sem => ({
        ...sem,
        asignaturas: sem.asignaturas.filter(a => a.planCurricular.trim().toLowerCase() === planSeleccionado)
      })).filter(sem => sem.asignaturas.length > 0);
    }

    if (query) {
      list = list.map(sem => ({
        ...sem,
        asignaturas: sem.asignaturas.filter(a => 
          a.nombre.toLowerCase().includes(query) || 
          a.codigo.toLowerCase().includes(query) ||
          a.docenteNombre.toLowerCase().includes(query)
        )
      })).filter(sem => sem.asignaturas.length > 0);
    }

    if (this.ocultarSinAsignar()) {
      list = list.map(sem => ({
        ...sem,
        asignaturas: sem.asignaturas.filter(a => a.asignada)
      })).filter(sem => sem.asignaturas.length > 0);
    }

    return list;
  });

  public isExpanded(semestreNum: number): boolean {
    return this._expandedSemestres().includes(semestreNum);
  }

  public toggleSemestre(semestreNum: number): void {
    const current = this._expandedSemestres();
    if (current.includes(semestreNum)) {
      this._expandedSemestres.set(current.filter(n => n !== semestreNum));
    } else {
      this._expandedSemestres.set([...current, semestreNum]);
    }
  }

  public getFecha(asig: PlanEstudioItem): string {
    switch (this.parcialActivo()) {
      case '1P': return asig.fecha1P;
      case '2P': return asig.fecha2P;
      case 'FINAL':
      case '2DA_INSTANCIA': return asig.fechaFinal;
    }
  }

  public getEstadoExamen(asig: PlanEstudioItem): string {
    return this.getInformacionParcial(asig)?.estado || 'Pendiente';
  }

  public getInformacionParcial(asig: PlanEstudioItem): PlanExamenResumen | null {
    const examenes = asig.examenes || {};
    return examenes[this.parcialActivo()] || null;
  }

  public solicitarCambioCartilla(asig: PlanEstudioItem): void {
    this.itemSeleccionadoParaCambio.set(asig);
  }

  public cancelarCambio(): void {
    this.itemSeleccionadoParaCambio.set(null);
  }

  public confirmarCambio(): void {
    const item = this.itemSeleccionadoParaCambio();
    if (!item) return;

    this.storage.toggleCartillaPlan(item.id);
    const nuevaModalidad = !item.conCartilla ? 'Con Cartilla' : 'Sin Cartilla';
    this.itemSeleccionadoParaCambio.set(null);
    this._mostrarToast(`${item.codigo}: Modalidad cambiada a '${nuevaModalidad}'. La secuencia de estados ha sido actualizada.`);
  }

  public onGestionChange(gestion: string): void {
    this.storage.setGestionActiva(gestion);
    if (this.filtroSedeCodigo && this.filtroCarreraCodigo) {
      this.cargarPlanReal(this.filtroSedeCodigo, this.filtroCarreraCodigo);
    }
  }

  /** Convierte el formato visual II-2026 al formato de gestión que usa SEA: 2-2026. */
  private gestionParaSea(): string {
    const gestion = this.storage.gestionActiva();
    const coincidencia = gestion.match(/^(I|II)-(\d{4})$/);
    if (!coincidencia) return gestion;
    return `${coincidencia[1] === 'II' ? '2' : '1'}-${coincidencia[2]}`;
  }

  public descargarMalla(): void {
    alert('Simulación: Descargando Malla Curricular PDF oficial de la Carrera.');
  }

  private _mostrarToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 3500);
  }
}
