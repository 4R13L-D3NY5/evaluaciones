import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestVocacionalService } from '../../core/services/test-vocacional.service';
import { UnitepcGatewayService } from '../../core/services/unitepc-gateway.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';
import { BranchOffice, TimeFrame } from '../../core/models/unitepc-gateway.models';
import {
  TestVocacionalActualizarRequest,
  TestVocacionalItem,
  InterpretacionVocacional,
  DimensionRiasec
} from '../../core/models/test-vocacional.models';

export interface PaqueteParalelo {
  colegio: string;
  paralelo: string;
  totalEstudiantes: number;
  fecha?: string;
  loteId?: string;
  sede?: string;
  gestion?: string;
  municipio?: string;
}

@Component({
  selector: 'sea-test-vocacional',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Encabezado Principal -->
      <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="h-10 w-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <i class="pi pi-compass text-lg"></i>
            </div>
            <div>
              <span class="text-[10px] font-extrabold uppercase tracking-widest text-teal-700">
                EVALUACIÓN VOCACIONAL · MODELO RIASEC & MATRIZ UNITEPC
              </span>
              <h2 class="text-2xl font-black tracking-tight text-foreground">
                Test de Orientación Vocacional (RIASEC)
              </h2>
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            Lectura óptica automatizada de cartillas 8.5x13 pulgadas (42 afirmaciones), extracción OCR de encabezados con candidatos seleccionables, empaquetado por colegios y paralelos, y diagnóstico oficial UNITEPC.
          </p>
        </div>

        <div class="flex items-center flex-wrap gap-2">
          <button
            type="button"
            (click)="cargar()"
            [disabled]="cargando()"
            class="bg-card hover:bg-muted text-foreground border border-border font-bold text-xs py-2.5 px-3 rounded-xl flex items-center gap-1.5 transition-colors"
            title="Refrescar listado">
            <i class="pi pi-refresh" [class.pi-spin]="cargando()"></i> Refrescar
          </button>
          <button
            type="button"
            (click)="exportarExcel()"
            [disabled]="cargando() || evaluaciones().length === 0"
            class="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            title="Descargar reporte completo en formato Excel">
            <i class="pi pi-file-excel"></i> Exportar Excel
          </button>
          <button
            type="button"
            (click)="abrirModalSubida()"
            [disabled]="procesando()"
            class="bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-colors">
            <i class="pi pi-cloud-upload"></i> Evaluar Escaneado
          </button>
        </div>
      </header>

      <!-- Panel de Métricas / KPIs -->
      <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article class="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <span class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
            Total Hojas Evaluadas
          </span>
          <strong class="block mt-1 text-2xl font-black text-foreground">
            {{ totalHojas() }}
          </strong>
          <span class="text-[11px] text-muted-foreground">
            Cartillas procesadas en el sistema
          </span>
        </article>

        <article class="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <span class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
            Colegios Registrados
          </span>
          <strong class="block mt-1 text-2xl font-black text-teal-700">
            {{ totalColegios() }}
          </strong>
          <span class="text-[11px] text-muted-foreground">
            Instituciones educativas participantes
          </span>
        </article>

        <article class="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <span class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
            Paralelos Evaluados
          </span>
          <strong class="block mt-1 text-2xl font-black text-indigo-700">
            {{ paquetesDisponibles().length }}
          </strong>
          <span class="text-[11px] text-muted-foreground">
            Grupos / cursos empaquetados
          </span>
        </article>

        <article class="bg-card border border-border rounded-2xl p-4 shadow-xs">
          <span class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
            Facultad Más Frecuente
          </span>
          <strong class="block mt-1 text-base font-black text-amber-700 truncate" [title]="facultadMasFrecuente()">
            {{ facultadMasFrecuente() }}
          </strong>
          <span class="text-[11px] text-muted-foreground">
            Preferencia vocacional dominante
          </span>
        </article>
      </section>

      <!-- ========================================== -->
      <!-- ALERTA DE PROCESAMIENTO EN VIVO CON BARRA  -->
      <!-- ========================================== -->
      @if (procesando()) {
        <section class="p-4 rounded-2xl border border-teal-200 bg-teal-50 text-teal-900 shadow-sm space-y-2.5 animate-pulse">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="h-7 w-7 rounded-lg bg-teal-200 flex items-center justify-center shrink-0">
                <i class="pi pi-spin pi-spinner text-teal-800 text-sm"></i>
              </div>
              <div>
                <h4 class="text-xs font-black uppercase tracking-wider text-teal-950">Motor de Visión OMR & OCR Activo</h4>
                <p class="text-[11px] text-teal-800">{{ progresoTexto() || 'Procesando escaneado...' }}</p>
              </div>
            </div>
            <div class="text-right font-mono">
              <span class="text-sm font-black text-teal-900">{{ progresoPorcentaje() }}%</span>
              @if (progresoTotalPaginas() > 0) {
                <span class="text-[10px] text-teal-700 block">Hoja {{ progresoPaginaActual() }} de {{ progresoTotalPaginas() }}</span>
              }
            </div>
          </div>

          <!-- Barra de Progreso en Vivo -->
          <div class="w-full bg-teal-200/60 rounded-full h-2.5 overflow-hidden">
            <div
              class="bg-teal-700 h-2.5 rounded-full transition-all duration-300"
              [style.width.%]="progresoPorcentaje()"></div>
          </div>
        </section>
      }

      <!-- ======================================================== -->
      <!-- SELECTOR Y EMPAQUETADO POR COLEGIO Y PARALELO            -->
      <!-- ======================================================== -->
      <section class="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-4">
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <span class="text-[10px] uppercase tracking-wider font-extrabold text-teal-700 block">
              Organización de Evaluaciones
            </span>
            <h3 class="text-base font-black text-foreground">
              Empaquetado por Colegio y Paralelo (Promociones)
            </h3>
            <p class="text-xs text-muted-foreground mt-0.5">
              Selecciona el colegio y el paralelo para visualizar exclusivamente sus estudiantes o revisar el lote hoja por hoja.
            </p>
          </div>

          <!-- Controles de Selección de Paquete -->
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Selector Colegio -->
            <div class="w-48 sm:w-56">
              <label class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground block mb-1">
                1. Colegio
              </label>
              <select
                [ngModel]="colegioSeleccionado()"
                (ngModelChange)="onColegioChange($event)"
                class="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground">
                <option value="">Seleccione Colegio...</option>
                @for (col of colegiosDisponibles(); track col) {
                  <option [value]="col">{{ col }}</option>
                }
              </select>
            </div>

            <!-- Selector Paralelo -->
            <div class="w-40 sm:w-48">
              <label class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground block mb-1">
                2. Paralelo
              </label>
              <select
                [ngModel]="paraleloSeleccionado()"
                (ngModelChange)="onParaleloChange($event)"
                [disabled]="!colegioSeleccionado()"
                class="w-full bg-muted/50 border border-border rounded-xl px-3 py-2 text-xs font-semibold text-foreground disabled:opacity-50">
                <option value="">Seleccione Paralelo...</option>
                @for (par of paralelosDelColegioSeleccionado(); track par) {
                  <option [value]="par">{{ par }}</option>
                }
              </select>
            </div>

            @if (paqueteActivo()) {
              <div class="pt-5">
                <button
                  type="button"
                  (click)="limpiarSeleccionPaquete()"
                  class="bg-muted hover:bg-muted/80 text-foreground font-bold text-xs py-2 px-3 rounded-xl border border-border flex items-center gap-1.5 transition-colors"
                  title="Ver todos los paquetes disponibles">
                  <i class="pi pi-th-large"></i> Ver Paquetes
                </button>
              </div>
            }
          </div>
        </div>

        <!-- ============================================== -->
        <!-- BANNER DE PAQUETE ACTIVO (CUANDO ESTÁ ELEGIDO) -->
        <!-- ============================================== -->
        @if (paqueteActivo(); as paq) {
          <div class="bg-gradient-to-r from-teal-50 via-teal-100/40 to-muted p-4 rounded-xl border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-lg shadow-2xs">
                <i class="pi pi-folder-open"></i>
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-[10px] uppercase font-extrabold tracking-wider bg-teal-700 text-white px-2 py-0.5 rounded">
                    PAQUETE ACTIVO
                  </span>
                  <span class="text-xs font-mono font-bold text-teal-800">
                    {{ paq.totalEstudiantes }} estudiante(s)
                  </span>
                  @if (paq.sede) {
                    <span class="text-[10px] bg-white border border-teal-200 text-teal-800 px-1.5 py-0.5 rounded font-bold">
                      <i class="pi pi-map-marker text-[9px]"></i> {{ paq.sede }}
                    </span>
                  }
                  @if (paq.gestion) {
                    <span class="text-[10px] bg-white border border-teal-200 text-teal-800 px-1.5 py-0.5 rounded font-bold font-mono">
                      Gestión {{ paq.gestion }}
                    </span>
                  }
                  @if (paq.municipio) {
                    <span class="text-[10px] bg-white border border-border text-muted-foreground px-1.5 py-0.5 rounded font-medium">
                      {{ paq.municipio }}
                    </span>
                  }
                  @if (paq.fecha) {
                    <span class="text-[11px] text-muted-foreground font-mono">· Fecha: {{ paq.fecha }}</span>
                  }
                </div>
                <h4 class="text-sm font-black text-foreground mt-0.5">
                  {{ paq.colegio }} — <span class="text-teal-800">{{ paq.paralelo }}</span> (Promoción)
                </h4>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <button
                type="button"
                (click)="abrirModalRevisionLote(0)"
                class="bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-colors">
                <i class="pi pi-eye"></i> Revisar Lote y OCR
              </button>
              <button
                type="button"
                (click)="exportarExcelPaquete()"
                class="bg-card hover:bg-muted text-foreground border border-border font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors">
                <i class="pi pi-file-excel text-emerald-600"></i> Excel del Paquete
              </button>
            </div>
          </div>
        }
      </section>

      <!-- ========================================================= -->
      <!-- CASO A: CUADRÍCULA DE PAQUETES (SI NO HAY SELECCIÓN FIJA) -->
      <!-- ========================================================= -->
      @if (!paqueteActivo()) {
        <section class="space-y-4">
          <!-- Barra Superior de Paquetes con Buscador y Conmutador de Vistas -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border rounded-2xl p-4 shadow-xs">
            <div>
              <div class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></span>
                <h4 class="text-xs font-black uppercase tracking-wider text-foreground">
                  Paquetes de Paralelos Registrados ({{ paquetesDisponibles().length }})
                </h4>
              </div>
              <p class="text-[11px] text-muted-foreground mt-0.5">
                Selecciona cualquier paralelo para ver el listado de estudiantes y sus evaluaciones.
              </p>
            </div>

            <div class="flex items-center gap-2 flex-wrap">
              <!-- Buscador Rápido de Paquetes -->
              <div class="relative min-w-[200px] sm:min-w-[240px]">
                <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs pointer-events-none"></i>
                <input
                  type="text"
                  [ngModel]="busquedaPaquetes()"
                  (ngModelChange)="busquedaPaquetes.set($event)"
                  placeholder="Buscar colegio, paralelo, sede..."
                  class="w-full bg-muted/50 border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-foreground focus:ring-2 focus:ring-teal-500/20" />
              </div>

              <!-- Selector de Modo de Vista (Tarjetas vs Tabla) -->
              <div class="bg-muted p-0.5 rounded-xl border border-border flex items-center">
                <button
                  type="button"
                  (click)="vistaPaquetes.set('tarjetas')"
                  [class.bg-card]="vistaPaquetes() === 'tarjetas'"
                  [class.text-teal-700]="vistaPaquetes() === 'tarjetas'"
                  [class.font-black]="vistaPaquetes() === 'tarjetas'"
                  [class.shadow-2xs]="vistaPaquetes() === 'tarjetas'"
                  [class.text-muted-foreground]="vistaPaquetes() !== 'tarjetas'"
                  class="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="Vista en Tarjetas">
                  <i class="pi pi-th-large text-xs"></i>
                  <span class="hidden sm:inline">Tarjetas</span>
                </button>
                <button
                  type="button"
                  (click)="vistaPaquetes.set('tabla')"
                  [class.bg-card]="vistaPaquetes() === 'tabla'"
                  [class.text-teal-700]="vistaPaquetes() === 'tabla'"
                  [class.font-black]="vistaPaquetes() === 'tabla'"
                  [class.shadow-2xs]="vistaPaquetes() === 'tabla'"
                  [class.text-muted-foreground]="vistaPaquetes() !== 'tabla'"
                  class="px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="Vista en Tabla">
                  <i class="pi pi-list text-xs"></i>
                  <span class="hidden sm:inline">Tabla</span>
                </button>
              </div>
            </div>
          </div>

          <!-- MODO 1: TARJETAS (GRID) -->
          @if (vistaPaquetes() === 'tarjetas') {
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (paq of paquetesDisponiblesFiltrados(); track paq.colegio + paq.paralelo) {
                <div
                  (click)="seleccionarPaquete(paq.colegio, paq.paralelo)"
                  class="bg-card border border-border hover:border-teal-500 rounded-2xl p-5 sm:p-6 shadow-xs transition-all cursor-pointer hover:shadow-md group flex flex-col justify-between gap-4">
                  <div>
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex items-center gap-3 min-w-0">
                        <div class="h-10 w-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-base group-hover:bg-teal-600 group-hover:text-white transition-colors shrink-0">
                          <i class="pi pi-folder"></i>
                        </div>
                        <div class="min-w-0">
                          <span class="text-[9px] uppercase tracking-wider font-extrabold text-teal-700 block">
                            PROMOCIÓN
                          </span>
                          <h4 class="text-sm font-black text-foreground group-hover:text-teal-700 transition-colors truncate">
                            {{ paq.paralelo }}
                          </h4>
                        </div>
                      </div>
                      <span class="text-xs font-mono font-black bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-lg shrink-0">
                        {{ paq.totalEstudiantes }} hojas
                      </span>
                    </div>

                    <h5 class="text-sm font-bold text-foreground mt-3.5 truncate" [title]="paq.colegio">
                      {{ paq.colegio }}
                    </h5>
                    <div class="flex items-center gap-1.5 flex-wrap mt-2 text-[10px]">
                      @if (paq.sede) {
                        <span class="inline-flex items-center gap-1 text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                          <i class="pi pi-map-marker text-[9px]"></i> {{ paq.sede }}
                        </span>
                      }
                      @if (paq.gestion) {
                        <span class="inline-flex items-center gap-1 text-foreground font-bold font-mono bg-muted px-2 py-0.5 rounded-md border border-border">
                          Gestión {{ paq.gestion }}
                        </span>
                      }
                      @if (paq.municipio) {
                        <span class="inline-flex items-center gap-1 text-muted-foreground font-medium bg-muted px-2 py-0.5 rounded-md border border-border">
                          {{ paq.municipio }}
                        </span>
                      }
                    </div>
                    @if (paq.fecha) {
                      <span class="text-[11px] text-muted-foreground block font-mono mt-2">
                        Fecha: {{ paq.fecha }}
                      </span>
                    }
                  </div>

                  <div class="pt-3 border-t border-border flex items-center justify-between gap-2">
                    <button
                      type="button"
                      (click)="seleccionarPaquete(paq.colegio, paq.paralelo); $event.stopPropagation()"
                      class="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5 py-1">
                      <span>Abrir evaluaciones</span>
                      <i class="pi pi-arrow-right text-[10px]"></i>
                    </button>
                    <div class="flex items-center gap-1.5">
                      <button
                        type="button"
                        (click)="abrirVistaPreviaDirectaPaquete(paq); $event.stopPropagation()"
                        class="text-[11px] font-bold text-muted-foreground hover:text-teal-700 bg-muted hover:bg-teal-50 px-2.5 py-1.5 rounded-lg border border-border flex items-center gap-1.5 transition-colors"
                        title="Revisar hoja por hoja en vista previa">
                        <i class="pi pi-eye text-[11px]"></i>
                        <span>Vista Previa</span>
                      </button>
                      <button
                        type="button"
                        (click)="solicitarEliminarPaquete(paq); $event.stopPropagation()"
                        class="h-7 w-7 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg border border-rose-200/70 flex items-center justify-center transition-colors"
                        title="Eliminar este paralelo y todas sus evaluaciones">
                        <i class="pi pi-trash text-[11px]"></i>
                      </button>
                    </div>
                  </div>
                </div>
              } @empty {
                <div class="col-span-full bg-card border border-border rounded-2xl p-8 text-center">
                  <i class="pi pi-inbox text-3xl text-muted-foreground/40 mb-2"></i>
                  <h4 class="text-xs font-black text-foreground">No se encontraron paquetes</h4>
                  <p class="text-[11px] text-muted-foreground mt-1">
                    No hay paquetes que coincidan con la búsqueda ingresada.
                  </p>
                </div>
              }
            </div>
          }

          <!-- MODO 2: TABLA -->
          @if (vistaPaquetes() === 'tabla') {
            <div class="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="border-b border-border bg-muted/40 text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground">
                      <th class="p-3.5">Colegio / Institución</th>
                      <th class="p-3.5">Paralelo</th>
                      <th class="p-3.5">Sede</th>
                      <th class="p-3.5">Gestión</th>
                      <th class="p-3.5">Municipio</th>
                      <th class="p-3.5 text-center">Cartillas</th>
                      <th class="p-3.5">Fecha</th>
                      <th class="p-3.5 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border/60">
                    @for (paq of paquetesDisponiblesFiltrados(); track paq.colegio + paq.paralelo) {
                      <tr
                        (click)="seleccionarPaquete(paq.colegio, paq.paralelo)"
                        class="hover:bg-teal-50/30 transition-colors cursor-pointer group">
                        <!-- Colegio -->
                        <td class="p-3.5 font-bold text-foreground">
                          <div class="flex items-center gap-2.5">
                            <div class="h-8 w-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center text-sm font-bold group-hover:bg-teal-600 group-hover:text-white transition-colors shrink-0">
                              <i class="pi pi-folder"></i>
                            </div>
                            <span class="truncate max-w-[240px]" [title]="paq.colegio">{{ paq.colegio }}</span>
                          </div>
                        </td>

                        <!-- Paralelo -->
                        <td class="p-3.5">
                          <span class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-black bg-slate-900 text-teal-300">
                            {{ paq.paralelo }}
                          </span>
                        </td>

                        <!-- Sede -->
                        <td class="p-3.5">
                          @if (paq.sede) {
                            <span class="inline-flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                              <i class="pi pi-map-marker text-[9px]"></i> {{ paq.sede }}
                            </span>
                          } @else {
                            <span class="text-muted-foreground">—</span>
                          }
                        </td>

                        <!-- Gestión -->
                        <td class="p-3.5">
                          @if (paq.gestion) {
                            <span class="font-mono font-bold text-[11px] bg-muted px-2 py-0.5 rounded border border-border">
                              {{ paq.gestion }}
                            </span>
                          } @else {
                            <span class="text-muted-foreground">—</span>
                          }
                        </td>

                        <!-- Municipio -->
                        <td class="p-3.5 text-muted-foreground">
                          {{ paq.municipio || '—' }}
                        </td>

                        <!-- Cartillas -->
                        <td class="p-3.5 text-center">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-teal-100 text-teal-800">
                            {{ paq.totalEstudiantes }} hojas
                          </span>
                        </td>

                        <!-- Fecha -->
                        <td class="p-3.5 text-muted-foreground font-mono text-[11px]">
                          {{ paq.fecha || '—' }}
                        </td>

                        <!-- Acciones -->
                        <td class="p-3.5 text-right whitespace-nowrap">
                          <div class="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              (click)="seleccionarPaquete(paq.colegio, paq.paralelo); $event.stopPropagation()"
                              class="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
                              title="Abrir evaluaciones de este paralelo">
                              <i class="pi pi-arrow-right text-[10px]"></i>
                              <span>Abrir</span>
                            </button>
                            <button
                              type="button"
                              (click)="abrirVistaPreviaDirectaPaquete(paq); $event.stopPropagation()"
                              class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:text-teal-700 hover:bg-teal-50 flex items-center justify-center transition-colors"
                              title="Vista previa y revisión OCR">
                              <i class="pi pi-eye text-xs"></i>
                            </button>
                            <button
                              type="button"
                              (click)="solicitarEliminarPaquete(paq); $event.stopPropagation()"
                              class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center transition-colors"
                              title="Eliminar paralelo completo">
                              <i class="pi pi-trash text-xs"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="8" class="p-8 text-center text-muted-foreground">
                          No se encontraron paquetes registrados que coincidan con la búsqueda.
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </section>
      }

      <!-- ======================================================== -->
      <!-- CASO B: TABLA DE EVALUACIONES DEL PAQUETE SELECCIONADO   -->
      <!-- ======================================================== -->
      @if (paqueteActivo()) {
        <section class="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
          <div class="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 class="text-sm font-black text-foreground flex items-center gap-2">
                <span>Estudiantes de {{ colegioSeleccionado() }} — {{ paraleloSeleccionado() }}</span>
                <span class="text-xs font-mono font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                  {{ evaluacionesDelPaquete().length }} registros
                </span>
              </h3>
              <p class="text-[11px] text-muted-foreground">
                Revisa la extracción OCR y el diagnóstico vocacional RIASEC de cada estudiante.
              </p>
            </div>

            <!-- Búsqueda rápida y botón eliminar dentro del paquete -->
            <div class="flex items-center gap-2">
              <div class="relative w-full sm:w-64">
                <input
                  type="text"
                  [ngModel]="busquedaEnPaquete()"
                  (ngModelChange)="busquedaEnPaquete.set($event)"
                  placeholder="Buscar por nombre, celular..."
                  class="w-full bg-muted/50 border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs font-semibold text-foreground" />
                <i class="pi pi-search absolute left-2.5 top-2.5 text-muted-foreground text-xs"></i>
              </div>
              <button
                type="button"
                (click)="solicitarEliminarPaqueteActivo()"
                class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                title="Eliminar este paralelo completo">
                <i class="pi pi-trash text-xs"></i>
                <span class="hidden sm:inline">Eliminar Paralelo</span>
              </button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead>
                <tr class="bg-muted/40 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                  <th class="p-3.5 text-center">#</th>
                  <th class="p-3.5">Estudiante (OCR)</th>
                  <th class="p-3.5">Contacto</th>
                  <th class="p-3.5">Perfil RIASEC / Facultad</th>
                  <th class="p-3.5 text-center">Total</th>
                  <th class="p-3.5">Vector Números</th>
                  <th class="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-border">
                @for (item of evaluacionesDelPaqueteFiltradas(); track item.id; let idx = $index) {
                  <tr class="hover:bg-muted/20 transition-colors">
                    <!-- Índice / Pág -->
                    <td class="p-3.5 text-center font-mono text-[11px] text-muted-foreground">
                      <span class="font-bold text-foreground">{{ idx + 1 }}</span>
                      <span class="block text-[9px]">Pág {{ item.paginaNumero }}</span>
                    </td>

                    <!-- Nombre y Candidatos -->
                    <td class="p-3.5 max-w-[210px]">
                      <div class="font-black text-foreground text-xs truncate" [title]="item.nombreCompleto || 'Sin nombre'">
                        {{ item.nombreCompleto || '— [Sin nombre detectado] —' }}
                      </div>
                      @if (item.candidatosNombre && item.candidatosNombre.length > 1) {
                        <div class="flex items-center gap-1 mt-1 flex-wrap">
                          <span class="text-[9px] bg-teal-100 text-teal-800 font-bold px-1.5 py-0.2 rounded">
                            {{ item.candidatosNombre.length }} opciones OCR
                          </span>
                        </div>
                      }
                      <span class="block text-[10px] font-mono text-muted-foreground mt-0.5">
                        Lote: {{ item.loteId }}
                        @if (item.sede) { · {{ item.sede }} }
                        @if (item.gestion) { · {{ item.gestion }} }
                      </span>
                    </td>

                    <!-- Celular y Correo -->
                    <td class="p-3.5">
                      <div class="flex items-center gap-1.5 text-foreground font-mono font-bold text-[11px]">
                        <i class="pi pi-phone text-[10px] text-emerald-600"></i>
                        <span>{{ item.celular || '—' }}</span>
                      </div>
                      @if (item.correo) {
                        <div class="flex items-center gap-1.5 text-muted-foreground text-[10px] truncate max-w-[160px] mt-0.5" [title]="item.correo">
                          <i class="pi pi-envelope text-[9px]"></i>
                          <span>{{ item.correo }}</span>
                        </div>
                      }
                    </td>

                    <!-- Perfil RIASEC / Facultad -->
                    <td class="p-3.5 min-w-[210px] max-w-[240px]">
                      @if (item.codigoHolland) {
                        <div class="space-y-1">
                          <div class="flex items-center gap-1.5 flex-wrap">
                            <span
                              class="inline-flex items-center font-mono font-black text-xs px-2 py-0.5 rounded-md bg-slate-900 text-teal-300 tracking-wider shadow-2xs"
                              title="Código Holland Dominante">
                              {{ item.codigoHolland }}
                            </span>
                            <button
                              type="button"
                              (click)="abrirModalDiagnostico(item)"
                              class="text-[10px] font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors"
                              title="Abrir Informe de Diagnóstico Completo">
                              <i class="pi pi-chart-pie text-[9px]"></i> Informe
                            </button>
                          </div>
                          <div
                            class="text-[10px] font-extrabold px-2 py-0.5 rounded-md border truncate block"
                            [ngClass]="obtenerClaseFacultad(item.facultadSugerida)"
                            [title]="item.facultadSugerida || ''">
                            {{ abreviarFacultad(item.facultadSugerida) }}
                          </div>
                          @if (item.carrerasSugeridas && item.carrerasSugeridas.length > 0) {
                            <div class="text-[10px] text-muted-foreground truncate font-medium flex items-center gap-1" [title]="'Carrera más afín: ' + item.carrerasSugeridas[0].carrera">
                              <i class="pi pi-star-fill text-[9px] text-amber-500"></i>
                              <span class="font-bold text-foreground">{{ item.carrerasSugeridas[0].carrera }}</span>
                              <span>({{ item.carrerasSugeridas[0].afinidadPorcentaje }}%)</span>
                            </div>
                          }
                        </div>
                      } @else {
                        <div class="flex items-center gap-1 text-[11px] text-muted-foreground italic">
                          <i class="pi pi-clock text-[10px]"></i> Sin calcular
                        </div>
                      }
                    </td>

                    <!-- Total Marcados -->
                    <td class="p-3.5 text-center">
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black"
                        [class.bg-emerald-100]="item.totalMarcados > 0"
                        [class.text-emerald-800]="item.totalMarcados > 0"
                        [class.bg-rose-100]="item.totalMarcados === 0"
                        [class.text-rose-800]="item.totalMarcados === 0">
                        {{ item.totalMarcados }} / 42
                      </span>
                    </td>

                    <!-- Vector de Números Marcados -->
                    <td class="p-3.5 max-w-[200px]">
                      <div class="flex items-center gap-1.5">
                        <span class="font-mono text-[11px] font-bold text-primary truncate select-all bg-muted/60 px-2 py-1 rounded-md border border-border block flex-1">
                          {{ formatVector(item.numerosMarcados) }}
                        </span>
                        <button
                          type="button"
                          (click)="copiarVector(item.numerosMarcados)"
                          title="Copiar vector al portapapeles"
                          class="h-7 w-7 rounded-lg border border-border text-muted-foreground hover:text-primary hover:bg-muted flex items-center justify-center transition-colors shrink-0">
                          <i class="pi pi-copy text-xs"></i>
                        </button>
                      </div>
                    </td>

                    <!-- Acciones -->
                    <td class="p-3.5 text-right whitespace-nowrap">
                      <div class="flex items-center justify-end gap-1.5">
                        <!-- Vista Previa & Revisión OCR -->
                        <button
                          type="button"
                          (click)="abrirModalRevisionPorItem(item)"
                          title="Vista previa de hoja y revisión OCR (Nombre, Celular, Correo)"
                          class="h-8 w-8 rounded-lg border border-teal-200 text-teal-700 bg-teal-50/70 hover:bg-teal-100 flex items-center justify-center transition-colors">
                          <i class="pi pi-eye text-xs"></i>
                        </button>
                        <!-- Informe RIASEC -->
                        <button
                          type="button"
                          (click)="abrirModalDiagnostico(item)"
                          title="Ver Informe Vocacional RIASEC UNITEPC"
                          class="h-8 w-8 rounded-lg border border-border text-teal-700 hover:text-teal-900 hover:bg-teal-50 flex items-center justify-center transition-colors">
                          <i class="pi pi-chart-pie text-xs"></i>
                        </button>
                        <!-- Eliminar -->
                        <button
                          type="button"
                          (click)="eliminar(item)"
                          title="Eliminar registro"
                          class="h-8 w-8 rounded-lg border border-border text-muted-foreground hover:text-rose-700 hover:bg-rose-50 flex items-center justify-center transition-colors">
                          <i class="pi pi-trash text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="p-10 text-center text-muted-foreground">
                      No se encontraron estudiantes para los filtros ingresados dentro de este paquete.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>
      }

      <!-- ======================================================== -->
      <!-- MODAL DE VISTA PREVIA Y REVISIÓN OCR (HOJA POR HOJA)    -->
      <!-- ======================================================== -->
      @if (modalRevisionAbierto() && itemEnRevision()) {
        <div class="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-6xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
            
            <!-- Cabecera de Revisión -->
            <div class="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black text-lg">
                  <i class="pi pi-file-edit"></i>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] uppercase font-extrabold tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                      VISTA PREVIA & OCR
                    </span>
                    <span class="text-[10px] font-mono text-muted-foreground">
                      {{ itemEnRevision()?.colegio }} · {{ itemEnRevision()?.curso }}
                    </span>
                  </div>
                  <h3 class="text-sm font-black text-foreground mt-0.5">
                    Hoja {{ indiceRevision() + 1 }} de {{ totalHojasRevision() }} · Pág {{ itemEnRevision()?.paginaNumero }}
                  </h3>
                </div>
              </div>

              <!-- Navegación entre Hojas del Lote -->
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="anteriorHojaRevision()"
                  [disabled]="indiceRevision() === 0"
                  class="bg-card hover:bg-muted disabled:opacity-40 text-foreground border border-border font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors">
                  <i class="pi pi-arrow-left"></i> Anterior
                </button>
                <span class="text-xs font-mono font-bold text-muted-foreground px-1">
                  {{ indiceRevision() + 1 }} / {{ totalHojasRevision() }}
                </span>
                <button
                  type="button"
                  (click)="siguienteHojaRevision()"
                  [disabled]="indiceRevision() >= totalHojasRevision() - 1"
                  class="bg-card hover:bg-muted disabled:opacity-40 text-foreground border border-border font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors">
                  Siguiente <i class="pi pi-arrow-right"></i>
                </button>
                <button
                  type="button"
                  (click)="cerrarModalRevision()"
                  class="text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-muted transition-colors ml-2">
                  <i class="pi pi-times text-base"></i>
                </button>
              </div>
            </div>

            <!-- Cuerpo Dividido en 2 Columnas: Izquierda Imagen / Derecha Formulario OCR y OMR -->
            <div class="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-border">
              
              <!-- Columna Izquierda: Imagen Escaneada con Recuadros -->
              <div class="lg:col-span-7 bg-slate-950/20 p-4 overflow-auto flex flex-col items-center justify-center max-h-[45vh] lg:max-h-full">
                <div class="relative max-h-full flex items-center justify-center">
                  <img
                    [src]="testVocacionalService.getPreviewUrl(itemEnRevision()!.id, versionPreview())"
                    [alt]="'Preview Hoja ' + itemEnRevision()?.paginaNumero"
                    class="max-h-[75vh] w-auto rounded-lg shadow-md border border-border object-contain bg-white" />
                </div>
                <div class="text-[10px] text-muted-foreground mt-2 flex items-center gap-3">
                  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Burbujas OMR marcadas</span>
                  <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span> Cajas de lectura OCR</span>
                </div>
              </div>

              <!-- Columna Derecha: Formulario OCR con Candidatos y Burbujas -->
              <div class="lg:col-span-5 p-5 overflow-y-auto space-y-4 bg-card">

                <!-- Barra de Herramienta: Lupa de Zonas Manuscritas -->
                <div class="bg-teal-50 border border-teal-200 rounded-xl p-3 flex items-center justify-between gap-2 shadow-2xs">
                  <div class="flex items-center gap-2">
                    <div class="h-7 w-7 rounded-lg bg-teal-200 text-teal-800 flex items-center justify-center shrink-0">
                      <i class="pi pi-search-plus text-sm"></i>
                    </div>
                    <div>
                      <h4 class="text-xs font-black text-teal-950">Lupa de Zonas Manuscritas</h4>
                      <p class="text-[10px] text-teal-800">Muestra los recortes originales ampliados para transcripción manual</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <button
                      type="button"
                      (click)="toggleLupaZonas()"
                      [class.bg-teal-700]="lupaZonasVisible()"
                      [class.text-white]="lupaZonasVisible()"
                      [class.bg-white]="!lupaZonasVisible()"
                      [class.text-teal-900]="!lupaZonasVisible()"
                      class="text-[11px] font-bold px-2.5 py-1.5 rounded-lg border border-teal-300 flex items-center gap-1.5 transition-colors shadow-2xs">
                      <i class="pi" [class.pi-eye]="!lupaZonasVisible()" [class.pi-eye-slash]="lupaZonasVisible()"></i>
                      <span>{{ lupaZonasVisible() ? 'Ocultar Lupas' : 'Ver Zonas con Lupa' }}</span>
                    </button>
                    <button
                      type="button"
                      (click)="abrirModalLupaGeneral()"
                      class="text-[11px] font-bold px-2 py-1.5 rounded-lg border border-teal-300 bg-white hover:bg-teal-100 text-teal-900 flex items-center gap-1 transition-colors"
                      title="Ver ventana ampliada flotante con todas las casillas">
                      <i class="pi pi-external-link"></i>
                    </button>
                  </div>
                </div>

                <!-- 1. CAMPO: NOMBRE COMPLETO (Mejor coincidencia + hasta 5 opciones) -->
                <div class="bg-muted/20 border border-border rounded-xl p-3.5 space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="text-xs font-black text-foreground flex items-center gap-1.5">
                      <i class="pi pi-user text-teal-600"></i> NOMBRE COMPLETO *
                    </label>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="toggleLupaCampo('nombre')"
                        [class.bg-teal-700]="lupaCampoVisible().nombre"
                        [class.text-white]="lupaCampoVisible().nombre"
                        [class.bg-muted]="!lupaCampoVisible().nombre"
                        [class.text-foreground]="!lupaCampoVisible().nombre"
                        class="text-[10px] font-bold px-2 py-0.5 rounded-md border border-border hover:border-teal-500 flex items-center gap-1 transition-colors"
                        title="Alternar recorte manuscrito ampliado de Nombre">
                        <i class="pi pi-search-plus text-[9px]"></i>
                        <span>Lupa</span>
                      </button>
                      <span class="text-[10px] text-teal-700 font-extrabold uppercase">Editable</span>
                    </div>
                  </div>

                  <!-- Recorte Manuscrito Ampliado (Lupa Nombre) -->
                  @if ((lupaZonasVisible() || lupaCampoVisible().nombre) && recorteNombreUrl()) {
                    <div class="bg-slate-950 p-2 rounded-xl border border-teal-500/40 shadow-xs space-y-1 animate-fade-in">
                      <div class="flex items-center justify-between text-[9px] font-bold text-teal-300 px-1">
                        <span class="flex items-center gap-1"><i class="pi pi-search-plus"></i> Manuscrito original: NOMBRE COMPLETO</span>
                        <span class="text-slate-400 font-mono">Zoom 2.2x</span>
                      </div>
                      <div class="overflow-hidden rounded-lg bg-white border border-slate-700 flex items-center justify-center p-1">
                        <img [src]="recorteNombreUrl()" alt="Recorte Nombre" class="w-full h-auto max-h-24 object-contain" />
                      </div>
                    </div>
                  }

                  <input
                    type="text"
                    [(ngModel)]="nombreRevision"
                    placeholder="Escriba o seleccione un candidato..."
                    class="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:ring-2 focus:ring-teal-500/20" />

                  <!-- Opciones sugeridas OCR (hasta 5) -->
                  @if (candidatosNombreRevision.length > 0) {
                    <div class="pt-1 space-y-1">
                      <span class="text-[10px] font-bold text-muted-foreground block">
                        Opciones OCR (clic para seleccionar):
                      </span>
                      <div class="flex items-center gap-1.5 flex-wrap">
                        @for (cand of candidatosNombreRevision; track cand; let cIdx = $index) {
                          <button
                            type="button"
                            (click)="seleccionarCandidatoNombreRevision(cand)"
                            [class.bg-teal-700]="nombreRevision === cand"
                            [class.text-white]="nombreRevision === cand"
                            [class.border-teal-800]="nombreRevision === cand"
                            [class.bg-muted]="nombreRevision !== cand"
                            [class.text-foreground]="nombreRevision !== cand"
                            class="text-[10px] font-semibold border border-border px-2 py-1 rounded-lg transition-colors flex items-center gap-1 hover:border-teal-500">
                            <span class="text-[8px] opacity-70">#{{ cIdx + 1 }}</span>
                            <span>{{ cand }}</span>
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>

                <!-- 2. CAMPO: CELULAR (Mejor coincidencia + hasta 5 opciones) -->
                <div class="bg-muted/20 border border-border rounded-xl p-3.5 space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="text-xs font-black text-foreground flex items-center gap-1.5">
                      <i class="pi pi-phone text-emerald-600"></i> CELULAR (Editable)
                    </label>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="toggleLupaCampo('celular')"
                        [class.bg-emerald-700]="lupaCampoVisible().celular"
                        [class.text-white]="lupaCampoVisible().celular"
                        [class.bg-muted]="!lupaCampoVisible().celular"
                        [class.text-foreground]="!lupaCampoVisible().celular"
                        class="text-[10px] font-bold px-2 py-0.5 rounded-md border border-border hover:border-emerald-500 flex items-center gap-1 transition-colors"
                        title="Alternar recorte manuscrito ampliado de Celular">
                        <i class="pi pi-search-plus text-[9px]"></i>
                        <span>Lupa</span>
                      </button>
                      <span class="text-[10px] text-muted-foreground">Editable</span>
                    </div>
                  </div>

                  <!-- Recorte Manuscrito Ampliado (Lupa Celular) -->
                  @if ((lupaZonasVisible() || lupaCampoVisible().celular) && recorteCelularUrl()) {
                    <div class="bg-slate-950 p-2 rounded-xl border border-emerald-500/40 shadow-xs space-y-1 animate-fade-in">
                      <div class="flex items-center justify-between text-[9px] font-bold text-emerald-300 px-1">
                        <span class="flex items-center gap-1"><i class="pi pi-search-plus"></i> Manuscrito original: CELULAR</span>
                        <span class="text-slate-400 font-mono">Zoom 2.8x</span>
                      </div>
                      <div class="overflow-hidden rounded-lg bg-white border border-slate-700 flex items-center justify-center p-1">
                        <img [src]="recorteCelularUrl()" alt="Recorte Celular" class="w-full h-auto max-h-24 object-contain" />
                      </div>
                    </div>
                  }

                  <input
                    type="text"
                    [(ngModel)]="celularRevision"
                    placeholder="Número de celular..."
                    class="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold font-mono text-foreground focus:ring-2 focus:ring-teal-500/20" />

                  @if (candidatosCelularRevision.length > 0) {
                    <div class="pt-1 space-y-1">
                      <span class="text-[10px] font-bold text-muted-foreground block">
                        Opciones de Celular sugeridas:
                      </span>
                      <div class="flex items-center gap-1.5 flex-wrap">
                        @for (cand of candidatosCelularRevision; track cand; let cIdx = $index) {
                          <button
                            type="button"
                            (click)="seleccionarCandidatoCelularRevision(cand)"
                            [class.bg-emerald-700]="celularRevision === cand"
                            [class.text-white]="celularRevision === cand"
                            [class.border-emerald-800]="celularRevision === cand"
                            [class.bg-muted]="celularRevision !== cand"
                            [class.text-foreground]="celularRevision !== cand"
                            class="text-[10px] font-mono font-semibold border border-border px-2 py-1 rounded-lg transition-colors flex items-center gap-1 hover:border-emerald-500">
                            <span class="text-[8px] opacity-70">#{{ cIdx + 1 }}</span>
                            <span>{{ cand }}</span>
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>

                <!-- 3. CAMPO: CORREO ELECTRÓNICO (Opcional + opciones OCR) -->
                <div class="bg-muted/20 border border-border rounded-xl p-3.5 space-y-2">
                  <div class="flex items-center justify-between">
                    <label class="text-xs font-black text-foreground flex items-center gap-1.5">
                      <i class="pi pi-envelope text-indigo-600"></i> CORREO ELECTRÓNICO (Opcional)
                    </label>
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="toggleLupaCampo('correo')"
                        [class.bg-indigo-700]="lupaCampoVisible().correo"
                        [class.text-white]="lupaCampoVisible().correo"
                        [class.bg-muted]="!lupaCampoVisible().correo"
                        [class.text-foreground]="!lupaCampoVisible().correo"
                        class="text-[10px] font-bold px-2 py-0.5 rounded-md border border-border hover:border-indigo-500 flex items-center gap-1 transition-colors"
                        title="Alternar recorte manuscrito ampliado de Correo">
                        <i class="pi pi-search-plus text-[9px]"></i>
                        <span>Lupa</span>
                      </button>
                      <span class="text-[10px] text-muted-foreground">Opcional</span>
                    </div>
                  </div>

                  <!-- Recorte Manuscrito Ampliado (Lupa Correo) -->
                  @if ((lupaZonasVisible() || lupaCampoVisible().correo) && recorteCorreoUrl()) {
                    <div class="bg-slate-950 p-2 rounded-xl border border-indigo-500/40 shadow-xs space-y-1 animate-fade-in">
                      <div class="flex items-center justify-between text-[9px] font-bold text-indigo-300 px-1">
                        <span class="flex items-center gap-1"><i class="pi pi-search-plus"></i> Manuscrito original: CORREO ELECTRÓNICO</span>
                        <span class="text-slate-400 font-mono">Zoom 2.2x</span>
                      </div>
                      <div class="overflow-hidden rounded-lg bg-white border border-slate-700 flex items-center justify-center p-1">
                        <img [src]="recorteCorreoUrl()" alt="Recorte Correo" class="w-full h-auto max-h-24 object-contain" />
                      </div>
                    </div>
                  }

                  <div class="flex items-center gap-1.5">
                    <input
                      type="email"
                      [(ngModel)]="correoRevision"
                      placeholder="ejemplo&#64;correo.com..."
                      class="flex-1 bg-card border border-border rounded-xl px-3 py-2 text-xs font-medium text-foreground focus:ring-2 focus:ring-teal-500/20" />
                    <button
                      type="button"
                      (click)="autocompletarDominioCorreo('&#64;gmail.com')"
                      class="px-2.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs flex items-center gap-1"
                      title="Completar con &#64;gmail.com">
                      <span>&#64;gmail.com</span>
                    </button>
                  </div>

                  @if (candidatosCorreoRevision.length > 0) {
                    <div class="pt-1 space-y-1">
                      <span class="text-[10px] font-bold text-muted-foreground block">
                        Opciones de Correo sugeridas:
                      </span>
                      <div class="flex items-center gap-1.5 flex-wrap">
                        @for (cand of candidatosCorreoRevision; track cand; let cIdx = $index) {
                          <button
                            type="button"
                            (click)="seleccionarCandidatoCorreoRevision(cand)"
                            [class.bg-indigo-700]="correoRevision === cand"
                            [class.text-white]="correoRevision === cand"
                            [class.border-indigo-800]="correoRevision === cand"
                            [class.bg-muted]="correoRevision !== cand"
                            [class.text-foreground]="correoRevision !== cand"
                            class="text-[10px] font-semibold border border-border px-2 py-1 rounded-lg transition-colors flex items-center gap-1 hover:border-indigo-500">
                            <span class="text-[8px] opacity-70">#{{ cIdx + 1 }}</span>
                            <span>{{ cand }}</span>
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>

                <!-- 4. RESULTADO OMR Y PERFIL HOLLAND -->
                <div class="bg-card border border-border rounded-xl p-3.5 space-y-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-black text-foreground">
                      Resultado OMR ({{ numerosRevision.length }} de 42)
                    </span>
                    <span class="text-[11px] font-mono font-black px-2 py-0.5 rounded bg-slate-900 text-teal-300">
                      {{ itemEnRevision()?.codigoHolland || 'Sin código' }}
                    </span>
                  </div>

                  <div class="text-[10px] text-muted-foreground">
                    Facultad Sugerida: <strong class="text-foreground">{{ itemEnRevision()?.facultadSugerida || '—' }}</strong>
                  </div>

                  <!-- Grilla Interactiva de las 42 Burbujas -->
                  <div class="grid grid-cols-7 sm:grid-cols-14 gap-1 pt-1">
                    @for (num of todasLasPreguntas; track num) {
                      <button
                        type="button"
                        (click)="alternarPreguntaRevision(num)"
                        [class.bg-teal-600]="numerosRevision.includes(num)"
                        [class.text-white]="numerosRevision.includes(num)"
                        [class.font-bold]="numerosRevision.includes(num)"
                        [class.bg-muted]="!numerosRevision.includes(num)"
                        [class.text-muted-foreground]="!numerosRevision.includes(num)"
                        [title]="obtenerTextoPregunta(num)"
                        class="h-7 rounded border border-border text-[11px] flex items-center justify-center transition-colors">
                        {{ num }}
                      </button>
                    }
                  </div>
                </div>
              </div>
            </div>

            <!-- Pie de la Ventana de Revisión -->
            <div class="p-4 bg-muted/20 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
              <span class="text-xs text-muted-foreground font-mono">
                Presiona "Guardar y Siguiente" para avanzar rápidamente hoja por hoja.
              </span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="cerrarModalRevision()"
                  class="px-4 py-2 border border-border rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted">
                  Cerrar
                </button>
                <button
                  type="button"
                  (click)="guardarCambiosRevision(false)"
                  [disabled]="cargando()"
                  class="px-4 py-2 bg-card hover:bg-muted border border-border text-foreground rounded-xl text-xs font-bold">
                  Guardar
                </button>
                <button
                  type="button"
                  (click)="guardarCambiosRevision(true)"
                  [disabled]="cargando()"
                  class="px-5 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs">
                  <span>Guardar y Siguiente</span>
                  <i class="pi pi-arrow-right text-[10px]"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- ======================================================== -->
      <!-- MODAL DE SUBIDA / EVALUAR ESCANEADO (SOLO PIDE PARALELO) -->
      <!-- ======================================================== -->
      @if (modalSubidaAbierto()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div class="p-5 border-b border-border flex items-start justify-between bg-muted/20">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center text-lg font-bold">
                  <i class="pi pi-cloud-upload"></i>
                </div>
                <div>
                  <span class="text-[10px] uppercase tracking-wider font-extrabold text-teal-700">Subida & Reconocimiento</span>
                  <h3 class="text-base font-black text-foreground mt-0.5">Evaluar Test Vocacional Escaneado</h3>
                </div>
              </div>
              <button
                type="button"
                (click)="cerrarModalSubida()"
                [disabled]="procesando()"
                class="text-muted-foreground hover:text-foreground p-1 rounded-lg">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <form (ngSubmit)="procesarArchivo()" class="p-5 space-y-4 overflow-y-auto">
              <!-- Sede, Gestión y Municipio (Conectados al Gateway SEA) -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <!-- Sede (Desde Servicios SEA) -->
                <div>
                  <label class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground block mb-1 flex items-center justify-between">
                    <span>Sede (SEA) *</span>
                    @if (sedesSea().length > 0) {
                      <span class="text-[9px] text-teal-700 font-bold">Oficial SEA</span>
                    }
                  </label>
                  @if (sedesSea().length > 0) {
                    <select
                      [(ngModel)]="sedeUpload"
                      name="sedeUpload"
                      required
                      class="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-teal-500/20">
                      @for (s of sedesSea(); track s.code) {
                        <option [value]="s.name">{{ s.name }} ({{ s.code }})</option>
                      }
                    </select>
                  } @else {
                    <input
                      type="text"
                      [(ngModel)]="sedeUpload"
                      name="sedeUpload"
                      required
                      placeholder="Ej: Cochabamba..."
                      list="listaSedesDisponibles"
                      class="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-teal-500/20" />
                    <datalist id="listaSedesDisponibles">
                      @for (s of sedesSugeridas; track s) {
                        <option [value]="s"></option>
                      }
                    </datalist>
                  }
                </div>

                <!-- Gestión (Desde Servicios SEA) -->
                <div>
                  <label class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground block mb-1 flex items-center justify-between">
                    <span>Gestión (SEA) *</span>
                    @if (gestionesSea().length > 0) {
                      <span class="text-[9px] text-teal-700 font-bold">Oficial SEA</span>
                    }
                  </label>
                  @if (gestionesSea().length > 0) {
                    <select
                      [(ngModel)]="gestionUpload"
                      name="gestionUpload"
                      required
                      class="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-teal-500/20">
                      <option value="2-2026">2-2026 (Gestión II-2026)</option>
                      @for (g of gestionesSea(); track g.code) {
                        @if (g.code !== '2-2026') {
                          <option [value]="g.code">{{ g.code }} ({{ g.name }})</option>
                        }
                      }
                      <option [value]="anioActual">{{ anioActual }} (Anual)</option>
                    </select>
                  } @else {
                    <input
                      type="text"
                      [(ngModel)]="gestionUpload"
                      name="gestionUpload"
                      required
                      placeholder="Ej: 2-2026..."
                      class="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-teal-500/20" />
                  }
                </div>

                <!-- Municipio (Opcional) -->
                <div>
                  <label class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground block mb-1">
                    Municipio <span class="text-[9px] text-muted-foreground font-normal">(Opcional)</span>
                  </label>
                  <input
                    type="text"
                    [(ngModel)]="municipioUpload"
                    name="municipioUpload"
                    placeholder="Ej: Cercado, Quillacollo..."
                    list="listaMunicipiosDisponibles"
                    class="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-teal-500/20" />
                  <datalist id="listaMunicipiosDisponibles">
                    @for (m of municipiosDisponibles(); track m) {
                      <option [value]="m"></option>
                    }
                  </datalist>
                </div>
              </div>

              <!-- Colegio -->
              <div>
                <label class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground block mb-1">
                  Nombre del Colegio *
                </label>
                <input
                  type="text"
                  [(ngModel)]="colegioUpload"
                  name="colegioUpload"
                  required
                  placeholder="Ej: Colegio Don Bosco, San Calixto, U.E. Bolívar..."
                  list="listaColegiosRegistrados"
                  class="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-teal-500/20" />
                <datalist id="listaColegiosRegistrados">
                  @for (col of colegiosDisponibles(); track col) {
                    <option [value]="col"></option>
                  }
                </datalist>
              </div>

              <!-- Paralelo (Solo pide paralelo, ya que siempre es promoción) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground block mb-1">
                    Paralelo (Promoción / 6to de Sec.) *
                  </label>
                  <div class="space-y-1.5">
                    <input
                      type="text"
                      [(ngModel)]="paraleloUpload"
                      name="paraleloUpload"
                      required
                      placeholder="Ej: A, B, C, Azul..."
                      class="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-teal-500/20" />
                    <!-- Botones rápidos de Paralelo común -->
                    <div class="flex items-center gap-1">
                      <span class="text-[9px] text-muted-foreground font-bold">Rápido:</span>
                      @for (pLetra of ['A', 'B', 'C', 'D']; track pLetra) {
                        <button
                          type="button"
                          (click)="seleccionarParaleloRapido(pLetra)"
                          class="h-6 w-6 rounded bg-muted hover:bg-teal-100 hover:text-teal-800 text-[10px] font-bold border border-border transition-colors">
                          {{ pLetra }}
                        </button>
                      }
                    </div>
                  </div>
                </div>

                <div>
                  <label class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground block mb-1">
                    Fecha de Aplicación *
                  </label>
                  <input
                    type="date"
                    [(ngModel)]="fechaUpload"
                    name="fechaUpload"
                    required
                    class="w-full bg-muted/50 border border-border rounded-xl px-3.5 py-2.5 text-xs font-semibold text-foreground focus:ring-2 focus:ring-teal-500/20" />
                </div>
              </div>

              <!-- Switch: Almacenar archivo PDF original en el servidor -->
              <div class="bg-muted/30 border border-border rounded-xl p-3 flex items-center justify-between gap-3">
                <div>
                  <label class="text-xs font-bold text-foreground block cursor-pointer" for="switchAlmacenarPdf">
                    Almacenar archivo PDF original en el servidor
                  </label>
                  <p class="text-[10px] text-muted-foreground mt-0.5">
                    Desactivado por defecto para no ocupar espacio en disco. Las imágenes de vista previa de cada hoja se conservan siempre.
                  </p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    id="switchAlmacenarPdf"
                    type="checkbox"
                    [(ngModel)]="almacenarPdfUpload"
                    name="almacenarPdfUpload"
                    class="sr-only peer" />
                  <div class="w-10 h-5 bg-muted-foreground/30 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>

              <!-- Opciones de Reconocimiento OCR de Campos Manuscritos -->
              <div class="bg-muted/20 border border-border rounded-xl p-3.5 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-extrabold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                    <i class="pi pi-bolt text-amber-500"></i> Opciones de Reconocimiento OCR (Opcional)
                  </span>
                  <span class="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Apagados por defecto (Ultra rápido)
                  </span>
                </div>
                <p class="text-[11px] text-muted-foreground leading-relaxed">
                  Mantener estas casillas desactivadas permite evaluar 50 hojas en solo <strong>2 a 3 segundos</strong>. Puedes ingresar o verificar los datos usando las lupas de alta definición en la pantalla de revisión.
                </p>

                <div class="space-y-2 pt-1 border-t border-border">
                  <!-- OCR Nombre Completo -->
                  <label class="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-muted/40 transition-colors">
                    <div class="flex items-center gap-2">
                      <i class="pi pi-user text-xs text-teal-600"></i>
                      <div>
                        <span class="text-xs font-bold text-foreground">Reconocimiento OCR en Nombre Completo</span>
                        <span class="block text-[10px] text-muted-foreground">Lee e interpreta el nombre manuscrito del estudiante</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      [(ngModel)]="ocrNombreUpload"
                      name="ocrNombreUpload"
                      class="h-4 w-4 rounded border-border text-teal-600 focus:ring-teal-500" />
                  </label>

                  <!-- OCR Celular -->
                  <label class="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-muted/40 transition-colors">
                    <div class="flex items-center gap-2">
                      <i class="pi pi-phone text-xs text-emerald-600"></i>
                      <div>
                        <span class="text-xs font-bold text-foreground">Reconocimiento OCR en Celular</span>
                        <span class="block text-[10px] text-muted-foreground">Busca números telefónicos bolivianos válidos (8 dígitos)</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      [(ngModel)]="ocrCelularUpload"
                      name="ocrCelularUpload"
                      class="h-4 w-4 rounded border-border text-teal-600 focus:ring-teal-500" />
                  </label>

                  <!-- OCR Correo Electrónico -->
                  <label class="flex items-center justify-between cursor-pointer p-1.5 rounded-lg hover:bg-muted/40 transition-colors">
                    <div class="flex items-center gap-2">
                      <i class="pi pi-envelope text-xs text-indigo-600"></i>
                      <div>
                        <span class="text-xs font-bold text-foreground">Reconocimiento OCR en Correo Electrónico (Email)</span>
                        <span class="block text-[10px] text-muted-foreground">Extrae direcciones de correo con &#64; y dominio</span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      [(ngModel)]="ocrCorreoUpload"
                      name="ocrCorreoUpload"
                      class="h-4 w-4 rounded border-border text-teal-600 focus:ring-teal-500" />
                  </label>
                </div>
              </div>

              <!-- Selector de Archivo Escaneado -->
              <div>
                <label class="text-[10px] uppercase tracking-wider font-extrabold text-muted-foreground block mb-1">
                  Archivo Escaneado (PDF o Imagen 8.5x13 in) *
                </label>
                <div
                  class="border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer"
                  [ngClass]="isDragging() ? 'border-teal-500 bg-teal-500/10 scale-[1.01]' : 'border-border hover:border-teal-500/50 bg-muted/10'"
                  (click)="fileInput.click()"
                  (dragover)="onDragOver($event)"
                  (dragleave)="onDragLeave($event)"
                  (drop)="onFileDrop($event)">
                  <input
                    #fileInput
                    type="file"
                    (change)="onArchivoSeleccionado($event)"
                    accept=".pdf,image/png,image/jpeg,image/jpg"
                    class="hidden" />
                  
                  @if (archivoUpload) {
                    <div class="flex items-center justify-center gap-2 text-teal-700 font-bold text-xs">
                      <i class="pi pi-file-pdf text-lg"></i>
                      <span>{{ archivoNombreUpload }}</span>
                      <span class="text-[10px] text-muted-foreground">({{ (archivoUpload.size / 1024 / 1024) | number:'1.1-2' }} MB)</span>
                    </div>
                    <span class="text-[10px] text-muted-foreground block mt-1">Clic o arrastra otro archivo para cambiar</span>
                  } @else {
                    <i class="pi pi-upload text-3xl block mb-2" [ngClass]="isDragging() ? 'text-teal-600 scale-110 transition-transform' : 'text-muted-foreground/60'"></i>
                    <p class="text-xs font-bold text-foreground">
                      {{ isDragging() ? '¡Suelta el archivo escaneado aquí!' : 'Haz clic o arrastra el archivo escaneado aquí' }}
                    </p>
                    <p class="text-[10px] text-muted-foreground mt-0.5">Soporta documentos PDF multipágina o imágenes JPG/PNG</p>
                  }
                </div>
              </div>

              <!-- Botones Modal -->
              <div class="pt-2 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  (click)="cerrarModalSubida()"
                  [disabled]="procesando()"
                  class="px-4 py-2.5 border border-border rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted">
                  Cancelar
                </button>
                <button
                  type="submit"
                  [disabled]="!archivoUpload || !colegioUpload.trim() || !paraleloUpload.trim() || procesando()"
                  class="px-5 py-2.5 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
                  <i class="pi pi-bolt"></i> Iniciar Procesamiento
                </button>
              </div>
            </form>
          </div>
        </div>
      }

      <!-- ======================================================== -->
      <!-- MODAL DE INFORME Y DIAGNÓSTICO VOCACIONAL RIASEC (UNITEPC) -->
      <!-- ======================================================== -->
      @if (modalDiagnosticoAbierto() && itemSeleccionado()) {
        <div class="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
            
            <div class="p-5 border-b border-border flex items-start justify-between bg-muted/20">
              <div class="flex items-center gap-3">
                <div class="h-11 w-11 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xl font-bold shadow-xs">
                  <i class="pi pi-compass"></i>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] uppercase tracking-wider font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      DIAGNÓSTICO OFICIAL UNITEPC
                    </span>
                    <span class="text-[10px] text-muted-foreground font-mono">
                      Registro #{{ itemSeleccionado()?.id }}
                    </span>
                  </div>
                  <h3 class="text-lg font-black text-foreground mt-0.5">
                    Informe de Orientación Vocacional (Modelo RIASEC)
                  </h3>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  type="button"
                  (click)="imprimirDiagnostico()"
                  class="bg-card hover:bg-muted text-foreground border border-border font-bold text-xs py-2 px-3 rounded-xl flex items-center gap-1.5 transition-colors"
                  title="Imprimir informe vocacional para el estudiante">
                  <i class="pi pi-print text-sm"></i> Imprimir Ficha
                </button>
                <button
                  type="button"
                  (click)="cerrarModalDiagnostico()"
                  class="text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-muted transition-colors">
                  <i class="pi pi-times text-base"></i>
                </button>
              </div>
            </div>

            <!-- Contenido Principal con Scroll -->
            <div id="seccion-impresion-diagnostico" class="p-6 overflow-y-auto space-y-6 flex-1">
              
              <!-- Banner del Estudiante y Resumen de Perfil -->
              <div class="bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-md border border-teal-800/40">
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span class="text-[10px] uppercase font-extrabold tracking-widest text-teal-300">
                      ESTUDIANTE EVALUADO
                    </span>
                    <h2 class="text-2xl font-black mt-0.5 text-white">
                      {{ itemSeleccionado()?.nombreCompleto || 'Estudiante sin identificar' }}
                    </h2>
                    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-2 font-medium">
                      <span><i class="pi pi-building text-teal-400 mr-1"></i> {{ itemSeleccionado()?.colegio }}</span>
                      <span><i class="pi pi-bookmark text-teal-400 mr-1"></i> {{ itemSeleccionado()?.curso }}</span>
                      <span><i class="pi pi-calendar text-teal-400 mr-1"></i> {{ itemSeleccionado()?.fecha || '—' }}</span>
                      @if (itemSeleccionado()?.celular) {
                        <span><i class="pi pi-phone text-emerald-400 mr-1"></i> {{ itemSeleccionado()?.celular }}</span>
                      }
                      <span><i class="pi pi-check-circle text-teal-400 mr-1"></i> {{ itemSeleccionado()?.totalMarcados }} de 42 afirmaciones</span>
                    </div>
                  </div>

                  <!-- Insignia del Código Holland y Facultad -->
                  <div class="flex flex-col sm:flex-row md:flex-col items-end gap-2.5 shrink-0">
                    <div class="text-right">
                      <span class="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                        CÓDIGO HOLLAND DOMINANTE
                      </span>
                      <div class="inline-flex items-center font-mono font-black text-2xl tracking-widest text-teal-300 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-teal-500/30 shadow-inner">
                        {{ interpretacionActiva()?.codigoHolland || itemSeleccionado()?.codigoHolland || '—' }}
                      </div>
                    </div>
                    <div class="text-right">
                      <span class="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                        FACULTAD SUGERIDA
                      </span>
                      <span class="inline-block text-xs font-black text-white bg-teal-600/90 px-3 py-1 rounded-lg border border-teal-400/40 max-w-[260px] truncate" [title]="interpretacionActiva()?.facultadSugerida || ''">
                        {{ interpretacionActiva()?.facultadSugerida || itemSeleccionado()?.facultadSugerida || '—' }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pestañas de Navegación del Diagnóstico -->
              <div class="flex items-center gap-2 border-b border-border pb-2">
                <button
                  type="button"
                  (click)="tabDiagnostico.set('resumen')"
                  [class.bg-teal-700]="tabDiagnostico() === 'resumen'"
                  [class.text-white]="tabDiagnostico() === 'resumen'"
                  [class.bg-muted]="tabDiagnostico() !== 'resumen'"
                  [class.text-foreground]="tabDiagnostico() !== 'resumen'"
                  class="font-bold text-xs py-2 px-3.5 rounded-xl transition-colors flex items-center gap-1.5">
                  <i class="pi pi-chart-bar"></i> Perfil Holland & Facultades
                </button>
                <button
                  type="button"
                  (click)="tabDiagnostico.set('carreras')"
                  [class.bg-teal-700]="tabDiagnostico() === 'carreras'"
                  [class.text-white]="tabDiagnostico() === 'carreras'"
                  [class.bg-muted]="tabDiagnostico() !== 'carreras'"
                  [class.text-foreground]="tabDiagnostico() !== 'carreras'"
                  class="font-bold text-xs py-2 px-3.5 rounded-xl transition-colors flex items-center gap-1.5">
                  <i class="pi pi-star"></i> Carreras Recomendadas (Top)
                </button>
                <button
                  type="button"
                  (click)="tabDiagnostico.set('todas')"
                  [class.bg-teal-700]="tabDiagnostico() === 'todas'"
                  [class.text-white]="tabDiagnostico() === 'todas'"
                  [class.bg-muted]="tabDiagnostico() !== 'todas'"
                  [class.text-foreground]="tabDiagnostico() !== 'todas'"
                  class="font-bold text-xs py-2 px-3.5 rounded-xl transition-colors flex items-center gap-1.5">
                  <i class="pi pi-list"></i> Matriz Completa UNITEPC (24 Carreras)
                </button>
              </div>

              <!-- PESTAÑA 1: RESUMEN -->
              @if (tabDiagnostico() === 'resumen') {
                <div class="space-y-6">
                  <div>
                    <h4 class="text-sm font-black text-foreground mb-3 flex items-center gap-2">
                      <i class="pi pi-th-large text-teal-600"></i> Desglose de Dimensiones RIASEC
                    </h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      @for (dim of obtenerListaDimensiones(interpretacionActiva()); track dim.letra) {
                        <div class="bg-card border border-border rounded-xl p-4 shadow-2xs flex flex-col justify-between">
                          <div>
                            <div class="flex items-center justify-between">
                              <div class="flex items-center gap-2">
                                <span class="h-8 w-8 rounded-lg flex items-center justify-center font-black font-mono text-sm text-white" [ngClass]="obtenerColorDimension(dim.letra).bg">
                                  {{ dim.letra }}
                                </span>
                                <div>
                                  <h5 class="text-xs font-black text-foreground">{{ dim.nombre }}</h5>
                                  <span class="text-[10px] text-muted-foreground">{{ dim.aciertos }} de {{ dim.totalPreguntas }} marcados</span>
                                </div>
                              </div>
                              <span class="text-sm font-black font-mono" [ngClass]="obtenerColorDimension(dim.letra).text">
                                {{ dim.porcentaje }}%
                              </span>
                            </div>
                            <div class="w-full bg-muted rounded-full h-2 mt-3 overflow-hidden">
                              <div
                                class="h-2 rounded-full transition-all duration-500"
                                [ngClass]="obtenerColorDimension(dim.letra).bar"
                                [style.width.%]="dim.porcentaje"></div>
                            </div>
                            <p class="text-[11px] text-muted-foreground mt-2.5 leading-snug">
                              {{ dim.descripcion }}
                            </p>
                          </div>
                          <div class="mt-3 pt-2.5 border-t border-border/70 flex items-center justify-between text-[10px]">
                            <span class="text-muted-foreground">Ítems marcados:</span>
                            <span class="font-mono font-bold text-foreground">
                              {{ dim.preguntasMarcadas.length > 0 ? '[' + dim.preguntasMarcadas.join(', ') + ']' : 'Ninguno' }}
                            </span>
                          </div>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Facultades UNITEPC -->
                  <div>
                    <h4 class="text-sm font-black text-foreground mb-3 flex items-center gap-2">
                      <i class="pi pi-building text-indigo-600"></i> Afinidad por Facultades (UNITEPC)
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      @for (fac of (interpretacionActiva()?.facultades || []); track fac.facultad) {
                        <div
                          class="rounded-xl border p-4 transition-all relative overflow-hidden"
                          [ngClass]="fac.facultad === interpretacionActiva()?.facultadSugerida ? 'border-teal-500 bg-teal-50/20' : 'border-border bg-card'">
                          @if (fac.facultad === interpretacionActiva()?.facultadSugerida) {
                            <div class="absolute top-0 right-0 bg-teal-600 text-white font-extrabold text-[9px] uppercase px-3 py-0.5 rounded-bl-lg tracking-wider shadow-2xs">
                              FACULTAD SUGERIDA
                            </div>
                          }
                          <div class="flex items-start justify-between gap-2">
                            <div>
                              <span class="text-[10px] font-extrabold font-mono uppercase tracking-wider text-muted-foreground">
                                Perfil: {{ fac.perfilHolland }}
                              </span>
                              <h5 class="text-xs font-black text-foreground mt-0.5">
                                {{ fac.facultad }}
                              </h5>
                            </div>
                            <span class="text-base font-black font-mono text-teal-700 shrink-0">
                              {{ fac.afinidadPorcentaje }}%
                            </span>
                          </div>
                          <div class="w-full bg-muted rounded-full h-2.5 mt-2.5 overflow-hidden">
                            <div
                              class="h-2.5 rounded-full transition-all duration-500"
                              [ngClass]="fac.facultad === interpretacionActiva()?.facultadSugerida ? 'bg-teal-600' : 'bg-slate-500'"
                              [style.width.%]="fac.afinidadPorcentaje"></div>
                          </div>
                          <p class="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                            {{ fac.enfoque }}
                          </p>
                          <div class="mt-3 pt-2 border-t border-border/70 flex items-center justify-between text-[10px]">
                            <span class="text-muted-foreground">Ítems coincidentes:</span>
                            <span class="font-mono font-bold text-foreground">
                              {{ fac.preguntasCoincidentes.length }} de {{ fac.preguntasClave.length }} ({{ formatVector(fac.preguntasCoincidentes) }})
                            </span>
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              }

              <!-- PESTAÑA 2: CARRERAS RECOMENDADAS TOP -->
              @if (tabDiagnostico() === 'carreras') {
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @for (carr of (interpretacionActiva()?.carrerasRecomendadas || []).slice(0, 8); track carr.carrera; let cIdx = $index) {
                    <div class="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-3">
                      <div class="flex items-start justify-between gap-2">
                        <div class="flex items-center gap-2.5">
                          <span class="h-7 w-7 rounded-lg bg-teal-100 text-teal-800 font-black text-xs flex items-center justify-center font-mono">
                            #{{ cIdx + 1 }}
                          </span>
                          <div>
                            <h4 class="text-sm font-black text-foreground">{{ carr.carrera }}</h4>
                            <span class="text-[10px] font-semibold text-muted-foreground block">{{ carr.facultad }}</span>
                          </div>
                        </div>
                        <span class="text-base font-black font-mono text-teal-700">{{ carr.afinidadPorcentaje }}%</span>
                      </div>
                      <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          class="h-2 rounded-full"
                          [ngClass]="cIdx < 3 ? 'bg-amber-500' : 'bg-teal-600'"
                          [style.width.%]="carr.afinidadPorcentaje"></div>
                      </div>
                      <p class="bg-muted/30 rounded-lg p-2.5 border border-border/60 text-[11px] text-muted-foreground leading-relaxed">
                        {{ carr.perfilVocacional }}
                      </p>
                    </div>
                  }
                </div>
              }

              <!-- PESTAÑA 3: MATRIZ COMPLETA 24 CARRERAS -->
              @if (tabDiagnostico() === 'todas') {
                <div class="overflow-x-auto border border-border rounded-xl">
                  <table class="w-full text-left text-xs">
                    <thead>
                      <tr class="bg-muted/40 border-b border-border text-[10px] uppercase tracking-wider text-muted-foreground">
                        <th class="p-3 text-center">Rank</th>
                        <th class="p-3">Carrera</th>
                        <th class="p-3">Facultad UNITEPC</th>
                        <th class="p-3 text-center">Código RIASEC</th>
                        <th class="p-3 text-center">Afinidad</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y border-border">
                      @for (carr of (interpretacionActiva()?.carrerasRecomendadas || []); track carr.carrera; let cIdx = $index) {
                        <tr class="hover:bg-muted/20 transition-colors">
                          <td class="p-3 text-center font-mono font-bold text-muted-foreground">#{{ cIdx + 1 }}</td>
                          <td class="p-3 font-black text-foreground">{{ carr.carrera }}</td>
                          <td class="p-3 text-[11px] text-muted-foreground">{{ abreviarFacultad(carr.facultad) }}</td>
                          <td class="p-3 text-center font-mono font-black">{{ carr.codigoRiasec }}</td>
                          <td class="p-3 text-center font-mono font-black text-teal-700">{{ carr.afinidadPorcentaje }}%</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>

            <!-- Pie del Modal -->
            <div class="p-4 bg-muted/20 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
              <span>UNITEPC · Sistema de Evaluaciones y Orientación Vocacional</span>
              <button
                type="button"
                (click)="cerrarModalDiagnostico()"
                class="px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:opacity-90">
                Cerrar Informe
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Flotante de Lupa General (Zonas Ampliadas en Alta Resolución) -->
      @if (modalLupaGeneralAbierto()) {
        <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div class="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <div class="flex items-center gap-2.5">
                <div class="h-9 w-9 rounded-xl bg-teal-600 text-white flex items-center justify-center text-base font-black">
                  <i class="pi pi-search-plus"></i>
                </div>
                <div>
                  <h3 class="text-sm font-black text-foreground">Lupa de Zonas Manuscritas · Hoja {{ indiceRevision() + 1 }} de {{ totalHojasRevision() }}</h3>
                  <p class="text-[11px] text-muted-foreground">Recortes de alta definición de las casillas de la cartilla escaneada</p>
                </div>
              </div>
              <button
                type="button"
                (click)="cerrarModalLupaGeneral()"
                class="text-muted-foreground hover:text-foreground p-2 rounded-xl hover:bg-muted">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="p-5 overflow-y-auto space-y-4 bg-slate-950">
              <!-- Nombre -->
              <div class="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5">
                <div class="flex items-center justify-between text-xs font-bold text-teal-400">
                  <span class="flex items-center gap-1.5"><i class="pi pi-user"></i> NOMBRE COMPLETO</span>
                  <span class="text-[10px] text-slate-400 font-mono">Zoom 2.2x</span>
                </div>
                <div class="bg-white rounded-lg p-2 overflow-auto flex items-center justify-center min-h-[60px]">
                  @if (recorteNombreUrl()) {
                    <img [src]="recorteNombreUrl()" alt="Nombre Ampliado" class="max-h-28 w-auto object-contain" />
                  } @else {
                    <span class="text-xs text-muted-foreground italic">Generando recorte ampliado...</span>
                  }
                </div>
              </div>

              <!-- Celular y Correo -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5">
                  <div class="flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span class="flex items-center gap-1.5"><i class="pi pi-phone"></i> CELULAR</span>
                    <span class="text-[10px] text-slate-400 font-mono">Zoom 2.8x</span>
                  </div>
                  <div class="bg-white rounded-lg p-2 overflow-auto flex items-center justify-center min-h-[60px]">
                    @if (recorteCelularUrl()) {
                      <img [src]="recorteCelularUrl()" alt="Celular Ampliado" class="max-h-28 w-auto object-contain" />
                    } @else {
                      <span class="text-xs text-muted-foreground italic">Generando recorte ampliado...</span>
                    }
                  </div>
                </div>

                <div class="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5">
                  <div class="flex items-center justify-between text-xs font-bold text-indigo-400">
                    <span class="flex items-center gap-1.5"><i class="pi pi-envelope"></i> CORREO ELECTRÓNICO</span>
                    <span class="text-[10px] text-slate-400 font-mono">Zoom 2.2x</span>
                  </div>
                  <div class="bg-white rounded-lg p-2 overflow-auto flex items-center justify-center min-h-[60px]">
                    @if (recorteCorreoUrl()) {
                      <img [src]="recorteCorreoUrl()" alt="Correo Ampliado" class="max-h-28 w-auto object-contain" />
                    } @else {
                      <span class="text-xs text-muted-foreground italic">Generando recorte ampliado...</span>
                    }
                  </div>
                </div>
              </div>
            </div>

            <div class="p-3 bg-card border-t border-border flex justify-end">
              <button
                type="button"
                (click)="cerrarModalLupaGeneral()"
                class="px-4 py-2 bg-teal-700 text-white rounded-xl text-xs font-bold hover:bg-teal-800">
                Cerrar Lupa
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal Confirmación Eliminación Paralelo Completo -->
      @if (modalEliminarPaqueteAbierto() && paqueteAEliminar()) {
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col">
            <div class="p-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between">
              <div class="flex items-center gap-2.5 text-rose-800">
                <div class="h-9 w-9 rounded-xl bg-rose-200 text-rose-800 flex items-center justify-center text-lg font-black shrink-0">
                  <i class="pi pi-exclamation-triangle"></i>
                </div>
                <div>
                  <h3 class="text-sm font-black text-rose-950">¿Eliminar Paralelo Completo?</h3>
                  <p class="text-[11px] text-rose-800 font-medium">Esta acción no se puede deshacer</p>
                </div>
              </div>
              <button
                type="button"
                (click)="cerrarModalEliminarPaquete()"
                class="text-rose-500 hover:text-rose-800 p-1.5 rounded-lg">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="p-5 space-y-4">
              <div class="text-xs text-foreground space-y-2">
                <p>
                  Estás a punto de eliminar definitivamente todo el paquete de evaluaciones de:
                </p>
                <div class="bg-muted/40 p-3 rounded-xl border border-border space-y-1">
                  <div class="font-black text-foreground text-sm flex items-center gap-1.5">
                    <i class="pi pi-building text-teal-600"></i>
                    <span>{{ paqueteAEliminar()?.colegio }}</span>
                  </div>
                  <div class="text-xs font-bold text-teal-800 flex items-center gap-1.5">
                    <i class="pi pi-bookmark"></i>
                    <span>{{ paqueteAEliminar()?.paralelo }}</span>
                    <span class="text-muted-foreground font-normal">({{ paqueteAEliminar()?.totalEstudiantes }} hojas registradas)</span>
                  </div>
                </div>
                <p class="text-rose-700 font-medium text-[11px] leading-relaxed">
                  ⚠️ Se borrarán todas las respuestas de las 42 afirmaciones, diagnósticos RIASEC y recortes de vista previa para permitirte volver a evaluar desde cero.
                </p>
              </div>

              <div class="space-y-1.5 pt-2 border-t border-border">
                <label class="text-[11px] font-bold text-muted-foreground block">
                  Para confirmar, escribe la palabra <span class="font-mono font-black text-rose-600 select-all">ELIMINAR</span> a continuación:
                </label>
                <input
                  type="text"
                  [(ngModel)]="confirmacionTextoEliminar"
                  name="confirmacionTextoEliminar"
                  placeholder="Escribe ELIMINAR"
                  autocomplete="off"
                  class="w-full bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground focus:ring-2 focus:ring-rose-500/30 uppercase tracking-widest placeholder:tracking-normal" />
              </div>
            </div>

            <div class="p-3 bg-muted/20 border-t border-border flex justify-end gap-2">
              <button
                type="button"
                (click)="cerrarModalEliminarPaquete()"
                [disabled]="eliminandoPaquete()"
                class="px-4 py-2 border border-border rounded-xl text-xs font-bold text-muted-foreground hover:bg-muted">
                Cancelar
              </button>
              <button
                type="button"
                (click)="confirmarEliminacionPaquete()"
                [disabled]="confirmacionTextoEliminar.trim().toUpperCase() !== 'ELIMINAR' || eliminandoPaquete()"
                class="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors">
                @if (eliminandoPaquete()) {
                  <i class="pi pi-spin pi-spinner text-xs"></i>
                  <span>Eliminando...</span>
                } @else {
                  <i class="pi pi-trash text-xs"></i>
                  <span>Eliminar Todo</span>
                }
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    @media print {
      body * {
        visibility: hidden;
      }
      #seccion-impresion-diagnostico, #seccion-impresion-diagnostico * {
        visibility: visible;
      }
      #seccion-impresion-diagnostico {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        background: white !important;
        color: black !important;
        padding: 10px;
      }
    }
  `]
})
export class TestVocacionalComponent implements OnInit, OnDestroy {
  public readonly testVocacionalService = inject(TestVocacionalService);
  public readonly gateway = inject(UnitepcGatewayService);
  private readonly uiFeedback = inject(UiFeedbackService);

  public readonly sedesSea = signal<BranchOffice[]>([]);
  public readonly gestionesSea = signal<TimeFrame[]>([]);
  public readonly anioActual = new Date().getFullYear().toString();

  public readonly evaluaciones = signal<TestVocacionalItem[]>([]);
  public readonly cargando = signal<boolean>(false);
  public readonly procesando = signal<boolean>(false);
  
  // Estado del Progreso en Vivo
  public readonly progresoTexto = signal<string>('');
  public readonly progresoPorcentaje = signal<number>(0);
  public readonly progresoPaginaActual = signal<number>(0);
  public readonly progresoTotalPaginas = signal<number>(0);

  // Filtros y Empaquetado por Colegio y Paralelo (SIGNALS PARA REACTIVIDAD COMPLETA)
  public readonly colegioSeleccionado = signal<string>('');
  public readonly paraleloSeleccionado = signal<string>('');
  public readonly busquedaEnPaquete = signal<string>('');

  // Modales
  public readonly modalSubidaAbierto = signal<boolean>(false);
  public readonly modalRevisionAbierto = signal<boolean>(false);
  public readonly modalDiagnosticoAbierto = signal<boolean>(false);
  public readonly modalLupaGeneralAbierto = signal<boolean>(false);
  public readonly modalEliminarPaqueteAbierto = signal<boolean>(false);
  public readonly paqueteAEliminar = signal<PaqueteParalelo | null>(null);
  public readonly eliminandoPaquete = signal<boolean>(false);
  public confirmacionTextoEliminar = '';

  // Estado de Lupas y Recortes Ampliados (Nombre, Celular, Correo)
  public readonly lupaZonasVisible = signal<boolean>(true);
  public readonly lupaCampoVisible = signal<{ nombre: boolean; celular: boolean; correo: boolean }>({
    nombre: true,
    celular: true,
    correo: true
  });
  public readonly recorteNombreUrl = signal<string>('');
  public readonly recorteCelularUrl = signal<string>('');
  public readonly recorteCorreoUrl = signal<string>('');

  // Estado de Revisión / Vista Previa Lote
  public readonly indiceRevision = signal<number>(0);
  public readonly versionPreview = signal<number>(1);
  public readonly itemEnRevision = signal<TestVocacionalItem | null>(null);
  public readonly itemsRevisionLote = signal<TestVocacionalItem[]>([]);

  // Campos en Edición de la Hoja en Revisión
  public nombreRevision = '';
  public celularRevision = '';
  public correoRevision = '';
  public numerosRevision: number[] = [];
  public candidatosNombreRevision: string[] = [];
  public candidatosCelularRevision: string[] = [];
  public candidatosCorreoRevision: string[] = [];

  // Formulario de Subida (Sede, Gestión, Municipio, Colegio y Paralelo)
  public sedeUpload = 'Cochabamba';
  public gestionUpload = '2-2026';
  public municipioUpload = '';
  public sedesSugeridas = ['Cochabamba', 'La Paz', 'El Alto', 'Santa Cruz', 'Oruro', 'Potosí', 'Sucre', 'Tarija', 'Beni', 'Pando'];
  public colegioUpload = '';
  public paraleloUpload = 'A';
  public fechaUpload = new Date().toISOString().substring(0, 10);
  public almacenarPdfUpload = false;
  public ocrNombreUpload = false;
  public ocrCelularUpload = false;
  public ocrCorreoUpload = false;
  public archivoUpload: File | null = null;
  public archivoNombreUpload = '';
  public readonly isDragging = signal<boolean>(false);

  // Diagnóstico RIASEC
  public readonly itemSeleccionado = signal<TestVocacionalItem | null>(null);
  public readonly interpretacionActiva = signal<InterpretacionVocacional | null>(null);
  public readonly tabDiagnostico = signal<'resumen' | 'carreras' | 'todas'>('resumen');

  public readonly todasLasPreguntas = Array.from({ length: 42 }, (_, i) => i + 1);

  public readonly afirmaciones = [
    'Me gusta trabajar con automóviles.',
    'Me gusta resolver rompecabezas.',
    'Se me da bien trabajar de forma independiente.',
    'Me gusta trabajar en equipo.',
    'Soy una persona ambiciosa y me pongo metas.',
    'Me gusta organizar cosas (archivos, escritorios u oficinas).',
    'Me gusta construir cosas.',
    'Me gusta leer sobre arte y música.',
    'Me gusta tener instrucciones claras que seguir.',
    'Me gusta intentar influir o persuadir a la gente.',
    'Me gusta hacer experimentos.',
    'Me gusta enseñar o formar a la gente.',
    'Me gusta intentar ayudar a la gente a resolver sus problemas.',
    'Me gusta cuidar de animales.',
    'No me importaría trabajar ocho horas al día en una oficina.',
    'Me gusta vender cosas.',
    'Disfruto de la escritura creativa.',
    'Me gusta la ciencia.',
    'Asumo nuevas responsabilidades rápidamente.',
    'Me interesa sanar a la gente.',
    'Me gusta intentar entender cómo funcionan las cosas.',
    'Me gusta montar o ensamblar cosas.',
    'Soy una persona creativa.',
    'Presto atención a los detalles.',
    'Me gusta archivar documentos o escribir a máquina.',
    'Me gusta analizar cosas (problemas o situaciones).',
    'Me gusta tocar instrumentos o cantar.',
    'Disfruto aprendiendo sobre otras culturas.',
    'Me gustaría montar mi propio negocio.',
    'Me gusta cocinar.',
    'Me gusta actuar en obras de teatro.',
    'Soy una persona práctica.',
    'Me gusta trabajar con números o gráficos.',
    'Me gusta participar en discusiones sobre distintos temas.',
    'Se me da bien llevar un registro de mi trabajo.',
    'Me gusta liderar.',
    'Me gusta trabajar al aire libre.',
    'Me gustaría trabajar en una oficina.',
    'Se me dan bien las matemáticas.',
    'Me gusta ayudar a la gente.',
    'Me gusta dibujar.',
    'Me gusta dar discursos.'
  ];

  private pollingInterval: any = null;

  // KPIs computados
  public readonly totalHojas = computed(() => this.evaluaciones().length);
  public readonly totalColegios = computed(() => new Set(this.evaluaciones().map(e => e.colegio)).size);
  public readonly facultadMasFrecuente = computed(() => {
    const list = this.evaluaciones();
    if (list.length === 0) return 'Sin datos';
    const counts: Record<string, number> = {};
    for (const item of list) {
      if (item.facultadSugerida) {
        counts[item.facultadSugerida] = (counts[item.facultadSugerida] || 0) + 1;
      }
    }
    const entries = Object.entries(counts);
    if (entries.length === 0) return 'Sin datos';
    entries.sort((a, b) => b[1] - a[1]);
    return this.abreviarFacultad(entries[0][0]);
  });

  // Paquetes computados (Colegio + Paralelo)
  public readonly paquetesDisponibles = computed<PaqueteParalelo[]>(() => {
    const map = new Map<string, PaqueteParalelo>();
    for (const item of this.evaluaciones()) {
      const key = `${item.colegio}___${item.curso}`;
      if (!map.has(key)) {
        map.set(key, {
          colegio: item.colegio,
          paralelo: item.curso,
          totalEstudiantes: 1,
          fecha: item.fecha,
          loteId: item.loteId,
          sede: item.sede,
          gestion: item.gestion,
          municipio: item.municipio
        });
      } else {
        const exist = map.get(key)!;
        exist.totalEstudiantes++;
        if (!exist.sede && item.sede) exist.sede = item.sede;
        if (!exist.gestion && item.gestion) exist.gestion = item.gestion;
        if (!exist.municipio && item.municipio) exist.municipio = item.municipio;
      }
    }
    return Array.from(map.values()).sort((a, b) => a.colegio.localeCompare(b.colegio));
  });

  // Vista de paquetes (Tarjetas vs Tabla) y Búsqueda
  public readonly vistaPaquetes = signal<'tarjetas' | 'tabla'>('tarjetas');
  public readonly busquedaPaquetes = signal<string>('');

  public readonly paquetesDisponiblesFiltrados = computed<PaqueteParalelo[]>(() => {
    const lista = this.paquetesDisponibles();
    const q = this.busquedaPaquetes().toLowerCase().trim();
    if (!q) return lista;
    return lista.filter(p =>
      (p.colegio && p.colegio.toLowerCase().includes(q)) ||
      (p.paralelo && p.paralelo.toLowerCase().includes(q)) ||
      (p.sede && p.sede.toLowerCase().includes(q)) ||
      (p.gestion && p.gestion.toLowerCase().includes(q)) ||
      (p.municipio && p.municipio.toLowerCase().includes(q))
    );
  });

  public readonly colegiosDisponibles = computed<string[]>(() => {
    const set = new Set(this.evaluaciones().map(e => e.colegio).filter(Boolean));
    return Array.from(set).sort();
  });

  public readonly municipiosDisponibles = computed<string[]>(() => {
    const set = new Set(this.evaluaciones().map(e => e.municipio).filter(Boolean) as string[]);
    return Array.from(set).sort();
  });

  public readonly paralelosDelColegioSeleccionado = computed<string[]>(() => {
    const col = this.colegioSeleccionado();
    if (!col) return [];
    const set = new Set(
      this.evaluaciones()
        .filter(e => e.colegio === col)
        .map(e => e.curso)
        .filter(Boolean)
    );
    return Array.from(set).sort();
  });

  public readonly paqueteActivo = computed<PaqueteParalelo | null>(() => {
    const col = this.colegioSeleccionado();
    const par = this.paraleloSeleccionado();
    if (!col || !par) return null;
    const encontrado = this.paquetesDisponibles().find(
      p => p.colegio === col && p.paralelo === par
    );
    if (encontrado) return encontrado;
    const primerItem = this.evaluacionesDelPaquete()[0];
    return {
      colegio: col,
      paralelo: par,
      totalEstudiantes: this.evaluacionesDelPaquete().length,
      sede: primerItem?.sede,
      gestion: primerItem?.gestion,
      municipio: primerItem?.municipio
    };
  });

  public readonly evaluacionesDelPaquete = computed<TestVocacionalItem[]>(() => {
    const col = this.colegioSeleccionado();
    const par = this.paraleloSeleccionado();
    if (!col || !par) return [];
    return this.evaluaciones().filter(
      e => e.colegio === col && e.curso === par
    );
  });

  public readonly evaluacionesDelPaqueteFiltradas = computed<TestVocacionalItem[]>(() => {
    const lista = this.evaluacionesDelPaquete();
    const q = this.busquedaEnPaquete().toLowerCase().trim();
    if (!q) return lista;
    return lista.filter(e =>
      (e.nombreCompleto && e.nombreCompleto.toLowerCase().includes(q)) ||
      (e.celular && e.celular.includes(q)) ||
      (e.correo && e.correo.toLowerCase().includes(q)) ||
      (e.codigoHolland && e.codigoHolland.toLowerCase().includes(q))
    );
  });

  public readonly totalHojasRevision = computed<number>(() => this.itemsRevisionLote().length);

  public ngOnInit(): void {
    this.cargar();
    this._cargarCatalogosSea();
  }

  public ngOnDestroy(): void {
    this.detenerPolling();
  }

  private _cargarCatalogosSea(): void {
    this.gateway.getBranchOffices().subscribe({
      next: sedes => {
        this.sedesSea.set(sedes);
        const inicial = this.gateway.resolverSedeInicial(sedes);
        if (inicial && (!this.sedeUpload || this.sedeUpload === 'Cochabamba')) {
          this.sedeUpload = inicial.name || inicial.code;
        }
      },
      error: () => {}
    });

    this.gateway.getTimeFrames().subscribe({
      next: gestiones => {
        this.gestionesSea.set(gestiones);
      },
      error: () => {}
    });

    this.gateway.getActiveTimeFrame().subscribe({
      next: activa => {
        // Se mantiene prioritariamente 2-2026 como predeterminado solicitado por la institución
        if (!this.gestionUpload) {
          this.gestionUpload = (activa && (activa.code || activa.name)) ? (activa.code || activa.name) : '2-2026';
        }
      },
      error: () => {}
    });
  }

  public cargar(alFinalizar?: (items: TestVocacionalItem[]) => void): void {
    this.cargando.set(true);
    this.testVocacionalService.listar().subscribe({
      next: items => {
        this.evaluaciones.set(items);
        this.cargando.set(false);
        if (alFinalizar) {
          alFinalizar(items);
        }
      },
      error: err => {
        this.cargando.set(false);
        this.uiFeedback.mostrar('Error al cargar evaluaciones: ' + (err.error?.message || err.message), 'Error', 'error');
      }
    });
  }

  // --- Selección de Paquetes ---
  public seleccionarPaquete(colegio: string, paralelo: string): void {
    this.colegioSeleccionado.set(colegio);
    this.paraleloSeleccionado.set(paralelo);
    this.busquedaEnPaquete.set('');
  }

  public onColegioChange(col: string): void {
    this.colegioSeleccionado.set(col);
    const paralelos = this.paralelosDelColegioSeleccionado();
    if (paralelos.length === 1) {
      this.paraleloSeleccionado.set(paralelos[0]);
    } else {
      this.paraleloSeleccionado.set('');
    }
  }

  public onParaleloChange(par: string): void {
    this.paraleloSeleccionado.set(par);
    this.busquedaEnPaquete.set('');
  }

  public limpiarSeleccionPaquete(): void {
    this.colegioSeleccionado.set('');
    this.paraleloSeleccionado.set('');
    this.busquedaEnPaquete.set('');
  }

  public abrirVistaPreviaDirectaPaquete(paq: PaqueteParalelo): void {
    this.seleccionarPaquete(paq.colegio, paq.paralelo);
    const items = this.evaluaciones().filter(
      e => e.colegio === paq.colegio && e.curso === paq.paralelo
    );
    this.abrirModalRevisionLote(0, items);
  }

  // --- Eliminación de Paquetes de Paralelos ---
  public solicitarEliminarPaquete(paq: PaqueteParalelo): void {
    this.paqueteAEliminar.set(paq);
    this.confirmacionTextoEliminar = '';
    this.modalEliminarPaqueteAbierto.set(true);
  }

  public solicitarEliminarPaqueteActivo(): void {
    const col = this.colegioSeleccionado();
    const par = this.paraleloSeleccionado();
    if (!col || !par) return;
    const paq = this.paquetesDisponibles().find(p => p.colegio === col && p.paralelo === par) || {
      colegio: col,
      paralelo: par,
      totalEstudiantes: this.evaluacionesDelPaquete().length,
      fecha: this.evaluacionesDelPaquete()[0]?.fecha || ''
    };
    this.solicitarEliminarPaquete(paq);
  }

  public cerrarModalEliminarPaquete(): void {
    this.modalEliminarPaqueteAbierto.set(false);
    this.paqueteAEliminar.set(null);
    this.confirmacionTextoEliminar = '';
  }

  public confirmarEliminacionPaquete(): void {
    const paq = this.paqueteAEliminar();
    if (!paq) return;
    if (this.confirmacionTextoEliminar.trim().toUpperCase() !== 'ELIMINAR') return;

    this.eliminandoPaquete.set(true);
    this.testVocacionalService.eliminarPaquete(paq.colegio, paq.paralelo).subscribe({
      next: resp => {
        this.eliminandoPaquete.set(false);
        this.cerrarModalEliminarPaquete();

        // Si el paquete eliminado estaba seleccionado, deseleccionarlo
        if (this.colegioSeleccionado() === paq.colegio && this.paraleloSeleccionado() === paq.paralelo) {
          this.limpiarSeleccionPaquete();
        }

        this.cargar();
        this.uiFeedback.mostrar(
          `Se eliminaron ${resp.eliminados} evaluación(es) de ${paq.colegio} — ${paq.paralelo}.`,
          'Paralelo Eliminado',
          'success'
        );
      },
      error: err => {
        this.eliminandoPaquete.set(false);
        this.uiFeedback.mostrar('Error al eliminar paquete: ' + (err.error?.message || err.message), 'Error', 'error');
      }
    });
  }

  // --- Subida / Evaluación Escaneada ---
  public abrirModalSubida(): void {
    this.modalSubidaAbierto.set(true);
    this.archivoUpload = null;
    this.archivoNombreUpload = '';
    this.isDragging.set(false);

    if (this.sedesSea().length > 0) {
      const inicial = this.gateway.resolverSedeInicial(this.sedesSea());
      if (inicial) {
        this.sedeUpload = inicial.name || inicial.code;
      }
    } else if (!this.sedeUpload) {
      this.sedeUpload = 'Cochabamba';
    }

    if (!this.gestionUpload) {
      this.gestionUpload = '2-2026';
    }

    this.municipioUpload = '';
    this.almacenarPdfUpload = false;
    this.ocrNombreUpload = false;
    this.ocrCelularUpload = false;
    this.ocrCorreoUpload = false;
  }

  public cerrarModalSubida(): void {
    this.modalSubidaAbierto.set(false);
  }

  public seleccionarParaleloRapido(letra: string): void {
    this.paraleloUpload = letra;
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  public onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  public onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.cargarArchivoSeleccionado(file);
    }
  }

  private cargarArchivoSeleccionado(file: File): void {
    const ext = file.name.toLowerCase();
    if (!ext.endsWith('.pdf') && !ext.endsWith('.png') && !ext.endsWith('.jpg') && !ext.endsWith('.jpeg')) {
      this.uiFeedback.mostrar('Formato no válido. Debe ser un archivo PDF o imagen JPG/PNG.', 'Archivo inválido', 'warning');
      return;
    }
    this.archivoUpload = file;
    this.archivoNombreUpload = file.name;
  }

  public onArchivoSeleccionado(event: any): void {
    const file = event.target?.files?.[0];
    if (file) {
      this.cargarArchivoSeleccionado(file);
    }
  }

  public procesarArchivo(): void {
    if (!this.archivoUpload) return;
    this.procesando.set(true);
    this.progresoTexto.set('Subiendo escaneado y encolando en el motor de visión OMR & OCR...');
    this.progresoPorcentaje.set(5);
    this.progresoPaginaActual.set(0);
    this.progresoTotalPaginas.set(0);

    // Estandarizar nombre del paralelo como "Paralelo X"
    const pTrim = this.paraleloUpload.trim().toUpperCase();
    const cursoEstandarizado = pTrim.startsWith('PARALELO') ? pTrim : `Paralelo ${pTrim}`;
    const colegioTarget = this.colegioUpload.trim();

    this.testVocacionalService
      .procesar(
        this.archivoUpload,
        colegioTarget,
        cursoEstandarizado,
        this.fechaUpload,
        this.almacenarPdfUpload,
        this.ocrNombreUpload,
        this.ocrCelularUpload,
        this.ocrCorreoUpload,
        this.sedeUpload.trim(),
        this.gestionUpload.trim(),
        this.municipioUpload.trim()
      )
      .subscribe({
        next: resp => {
          this.cerrarModalSubida();
          this.iniciarPollingJob(resp.jobId, colegioTarget, cursoEstandarizado);
        },
        error: err => {
          this.procesando.set(false);
          this.uiFeedback.mostrar('No se pudo iniciar el procesamiento: ' + (err.error?.message || err.message), 'Error', 'error');
        }
      });
  }

  public autocompletarDominioCorreo(dominio: string = '@gmail.com'): void {
    const cur = (this.correoRevision || '').trim();
    if (!cur) {
      this.correoRevision = dominio;
      return;
    }
    const atIndex = cur.indexOf('@');
    if (atIndex >= 0) {
      this.correoRevision = cur.substring(0, atIndex) + dominio;
    } else {
      this.correoRevision = cur + dominio;
    }
  }

  private iniciarPollingJob(jobId: string, colegioTarget: string, cursoTarget: string): void {
    this.progresoTexto.set('Analizando marcas ópticas y leyendo texto con OCR...');
    this.detenerPolling();

    this.pollingInterval = setInterval(() => {
      this.testVocacionalService.consultarJob(jobId).subscribe({
        next: job => {
          if (job.paginaActual !== undefined && job.paginaActual > 0) {
            this.progresoPaginaActual.set(job.paginaActual);
          }
          if (job.totalPaginas !== undefined && job.totalPaginas > 0) {
            this.progresoTotalPaginas.set(job.totalPaginas);
          }
          if (job.porcentaje !== undefined && job.porcentaje > 0) {
            this.progresoPorcentaje.set(job.porcentaje);
          }
          if (job.mensaje) {
            this.progresoTexto.set(job.mensaje);
          }

          if (job.estado === 'COMPLETADO') {
            this.detenerPolling();
            this.procesando.set(false);

            // Seleccionar automáticamente el paquete que acaba de finalizar
            this.seleccionarPaquete(colegioTarget, cursoTarget);

            // Refrescar y abrir la vista previa
            this.cargar(itemsActualizados => {
              const itemsDelLote = (job.resultados && job.resultados.length > 0)
                ? job.resultados
                : itemsActualizados.filter(e => e.colegio === colegioTarget && e.curso === cursoTarget);

              if (itemsDelLote.length > 0) {
                this.abrirModalRevisionLote(0, itemsDelLote);
              }
            });

            this.uiFeedback.mostrar(
              `Procesamiento completado con éxito. Se evaluaron ${job.totalPaginas} hoja(s).`,
              'Test Vocacional Procesado',
              'success'
            );
          } else if (job.estado === 'ERROR') {
            this.detenerPolling();
            this.procesando.set(false);
            this.uiFeedback.mostrar('Error durante el procesamiento OMR: ' + job.mensaje, 'Error', 'error');
          }
        },
        error: () => {
          this.detenerPolling();
          this.procesando.set(false);
        }
      });
    }, 1500);
  }

  private detenerPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  // --- Modal de Revisión y Vista Previa (Hoja por Hoja) ---
  public abrirModalRevisionLote(indice: number = 0, itemsEspecificos?: TestVocacionalItem[]): void {
    let items = itemsEspecificos && itemsEspecificos.length > 0 ? itemsEspecificos : this.evaluacionesDelPaquete();
    if (items.length === 0) {
      const col = this.colegioSeleccionado();
      const par = this.paraleloSeleccionado();
      items = this.evaluaciones().filter(e => e.colegio === col && e.curso === par);
    }
    if (items.length === 0) {
      items = this.evaluaciones();
    }
    if (items.length === 0) {
      this.uiFeedback.mostrar('No hay evaluaciones disponibles para revisar en vista previa.', 'Información', 'info');
      return;
    }

    this.itemsRevisionLote.set(items);
    this.cargarHojaEnRevision(indice);
    this.modalRevisionAbierto.set(true);
  }

  public abrirModalRevisionPorItem(item: TestVocacionalItem): void {
    let items = this.evaluacionesDelPaquete();
    if (items.length === 0) {
      items = this.evaluaciones();
    }
    const idx = items.findIndex(x => x.id === item.id);
    this.itemsRevisionLote.set(items.length > 0 ? items : [item]);
    this.cargarHojaEnRevision(idx >= 0 ? idx : 0);
    this.modalRevisionAbierto.set(true);
  }

  private cargarHojaEnRevision(idx: number): void {
    const list = this.itemsRevisionLote();
    if (idx < 0 || idx >= list.length) return;
    this.indiceRevision.set(idx);
    const item = list[idx];
    this.itemEnRevision.set(item);

    this.nombreRevision = item.nombreCompleto || '';
    this.celularRevision = item.celular || '';
    this.correoRevision = item.correo || '';
    this.numerosRevision = item.numerosMarcados ? [...item.numerosMarcados] : [];

    this.candidatosNombreRevision = item.candidatosNombre || [];
    this.candidatosCelularRevision = item.candidatosCelular || [];
    this.candidatosCorreoRevision = item.candidatosCorreo || [];

    // Refrescar recortes manuscritos en alta resolución
    this.actualizarRecortesLupa();
  }

  public cerrarModalRevision(): void {
    this.modalRevisionAbierto.set(false);
    this.itemEnRevision.set(null);
  }

  public anteriorHojaRevision(): void {
    if (this.indiceRevision() > 0) {
      this.cargarHojaEnRevision(this.indiceRevision() - 1);
    }
  }

  public siguienteHojaRevision(): void {
    if (this.indiceRevision() < this.totalHojasRevision() - 1) {
      this.cargarHojaEnRevision(this.indiceRevision() + 1);
    }
  }

  // --- Métodos de Lupas y Recortes Ampliados ---
  public toggleLupaZonas(): void {
    this.lupaZonasVisible.update(v => !v);
  }

  public toggleLupaCampo(campo: 'nombre' | 'celular' | 'correo'): void {
    const act = this.lupaCampoVisible();
    this.lupaCampoVisible.set({
      ...act,
      [campo]: !act[campo]
    });
  }

  public abrirModalLupaGeneral(): void {
    this.modalLupaGeneralAbierto.set(true);
  }

  public cerrarModalLupaGeneral(): void {
    this.modalLupaGeneralAbierto.set(false);
  }

  public actualizarRecortesLupa(): void {
    const item = this.itemEnRevision();
    if (!item) {
      this.recorteNombreUrl.set('');
      this.recorteCelularUrl.set('');
      this.recorteCorreoUrl.set('');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      if (!nw || !nh) return;

      const extraerRecorte = (sxRatio: number, syRatio: number, swRatio: number, shRatio: number, scale: number = 2.2): string => {
        try {
          const canvas = document.createElement('canvas');
          const sw = swRatio * nw;
          const sh = shRatio * nh;
          canvas.width = Math.round(sw * scale);
          canvas.height = Math.round(sh * scale);
          const ctx = canvas.getContext('2d');
          if (!ctx) return '';
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, sxRatio * nw, syRatio * nh, sw, sh, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/png');
        } catch {
          return '';
        }
      };

      // Recortes calibrados para hoja 8.5x13 pulgadas (amplificación 2.2x - 2.8x):
      // 1. Nombre Completo: x: 2.8% a 58.5%, y: 23.0% a 26.3%
      this.recorteNombreUrl.set(extraerRecorte(0.028, 0.230, 0.555, 0.033, 2.2));
      // 2. Celular: x: 79.2% a 97.5%, y: 26.5% a 29.8%
      this.recorteCelularUrl.set(extraerRecorte(0.792, 0.265, 0.183, 0.033, 2.8));
      // 3. Correo Electrónico: x: 40.2% a 79.5%, y: 26.5% a 29.8%
      this.recorteCorreoUrl.set(extraerRecorte(0.402, 0.265, 0.393, 0.033, 2.2));
    };

    img.src = this.testVocacionalService.getPreviewUrl(item.id, this.versionPreview());
  }

  public seleccionarCandidatoNombreRevision(cand: string): void {
    this.nombreRevision = cand;
  }

  public seleccionarCandidatoCelularRevision(cand: string): void {
    this.celularRevision = cand;
  }

  public seleccionarCandidatoCorreoRevision(cand: string): void {
    this.correoRevision = cand;
  }

  public alternarPreguntaRevision(num: number): void {
    if (this.numerosRevision.includes(num)) {
      this.numerosRevision = this.numerosRevision.filter(n => n !== num);
    } else {
      this.numerosRevision = [...this.numerosRevision, num].sort((a, b) => a - b);
    }
  }

  public guardarCambiosRevision(avanzarSiguiente: boolean = false): void {
    const item = this.itemEnRevision();
    if (!item) return;

    const data: TestVocacionalActualizarRequest = {
      colegio: item.colegio,
      curso: item.curso,
      fecha: item.fecha,
      sede: item.sede,
      gestion: item.gestion,
      municipio: item.municipio,
      nombreCompleto: this.nombreRevision,
      celular: this.celularRevision,
      correo: this.correoRevision,
      numerosMarcados: this.numerosRevision,
      observaciones: item.observaciones
    };

    this.cargando.set(true);
    this.testVocacionalService.actualizar(item.id, data).subscribe({
      next: actualizado => {
        this.cargando.set(false);
        this.versionPreview.update(v => v + 1);

        // Actualizar en el arreglo local de revisión
        const list = this.itemsRevisionLote();
        const idx = this.indiceRevision();
        list[idx] = actualizado;
        this.itemsRevisionLote.set([...list]);
        this.itemEnRevision.set(actualizado);

        // Actualizar en la lista general de evaluaciones
        const genList = this.evaluaciones();
        const genIdx = genList.findIndex(e => e.id === item.id);
        if (genIdx >= 0) {
          genList[genIdx] = actualizado;
          this.evaluaciones.set([...genList]);
        }

        // Si es guardado manual simple, mostrar mensaje; si es "Guardar y Siguiente", avanzar sin interrumpir con modal
        if (!avanzarSiguiente) {
          this.uiFeedback.mostrar('Datos del estudiante guardados correctamente.', 'Guardado', 'success');
        } else {
          if (this.indiceRevision() < this.totalHojasRevision() - 1) {
            this.siguienteHojaRevision();
          } else {
            this.uiFeedback.mostrar('¡Has completado la revisión de todas las hojas del paquete!', 'Lote Revisado', 'success');
            this.cerrarModalRevision();
          }
        }
      },
      error: err => {
        this.cargando.set(false);
        this.uiFeedback.mostrar('Error al guardar cambios: ' + (err.error?.message || err.message), 'Error', 'error');
      }
    });
  }

  // --- Modal Diagnóstico RIASEC ---
  public abrirModalDiagnostico(item: TestVocacionalItem): void {
    this.itemSeleccionado.set(item);
    this.tabDiagnostico.set('resumen');

    if (item.codigoHolland && item.puntajesRiasec && item.facultadesAfinidad && item.carrerasSugeridas) {
      this.interpretacionActiva.set({
        codigoHolland: item.codigoHolland,
        facultadSugerida: item.facultadSugerida || '',
        dimensiones: item.puntajesRiasec,
        facultades: item.facultadesAfinidad,
        carrerasRecomendadas: item.carrerasSugeridas
      });
      this.modalDiagnosticoAbierto.set(true);
    } else {
      this.testVocacionalService.obtenerInterpretacion(item.id).subscribe({
        next: interp => {
          this.interpretacionActiva.set(interp);
          this.modalDiagnosticoAbierto.set(true);
        },
        error: err => {
          this.uiFeedback.mostrar('Error al cargar la interpretación: ' + (err.error?.message || err.message), 'Error', 'error');
        }
      });
    }
  }

  public cerrarModalDiagnostico(): void {
    this.modalDiagnosticoAbierto.set(false);
    this.interpretacionActiva.set(null);
  }

  public imprimirDiagnostico(): void {
    window.print();
  }

  public obtenerListaDimensiones(interp: InterpretacionVocacional | null): DimensionRiasec[] {
    if (!interp || !interp.dimensiones) return [];
    const orden = ['R', 'I', 'A', 'S', 'E', 'C'];
    return orden.map(k => interp.dimensiones[k]).filter(Boolean);
  }

  public obtenerClaseFacultad(facultad?: string): string {
    if (!facultad) return 'bg-slate-100 text-slate-800 border-slate-300';
    const lower = facultad.toLowerCase();
    if (lower.includes('salud')) return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (lower.includes('tecnolog')) return 'bg-indigo-100 text-indigo-800 border-indigo-300';
    if (lower.includes('econ') || lower.includes('empres')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (lower.includes('social') || lower.includes('juríd')) return 'bg-purple-100 text-purple-800 border-purple-300';
    return 'bg-teal-100 text-teal-800 border-teal-300';
  }

  public abreviarFacultad(facultad?: string): string {
    if (!facultad) return 'Sin determinar';
    const lower = facultad.toLowerCase();
    if (lower.includes('salud')) return 'Fac. Ciencias de la Salud';
    if (lower.includes('tecnolog')) return 'Fac. Ciencias de la Tecnología';
    if (lower.includes('econ') || lower.includes('empres')) return 'Fac. Ciencias Económicas y Empresariales';
    if (lower.includes('social') || lower.includes('juríd')) return 'Fac. Ciencias Sociales y Jurídicas';
    return facultad;
  }

  public obtenerColorDimension(letra: string): { bg: string; text: string; bar: string } {
    switch (letra) {
      case 'R': return { bg: 'bg-sky-600', text: 'text-sky-700', bar: 'bg-sky-500' };
      case 'I': return { bg: 'bg-indigo-600', text: 'text-indigo-700', bar: 'bg-indigo-500' };
      case 'A': return { bg: 'bg-pink-600', text: 'text-pink-700', bar: 'bg-pink-500' };
      case 'S': return { bg: 'bg-emerald-600', text: 'text-emerald-700', bar: 'bg-emerald-500' };
      case 'E': return { bg: 'bg-amber-600', text: 'text-amber-700', bar: 'bg-amber-500' };
      case 'C': return { bg: 'bg-slate-700', text: 'text-slate-700', bar: 'bg-slate-600' };
      default: return { bg: 'bg-teal-600', text: 'text-teal-700', bar: 'bg-teal-500' };
    }
  }

  public obtenerTextoPregunta(num: number): string {
    const idx = num - 1;
    return `${num}. ${this.afirmaciones[idx] || 'Afirmación ' + num}`;
  }

  public formatVector(nums?: number[]): string {
    if (!nums || nums.length === 0) return '[]';
    return `[${nums.join(', ')}]`;
  }

  public copiarVector(nums?: number[]): void {
    const texto = this.formatVector(nums);
    navigator.clipboard.writeText(texto).then(() => {
      this.uiFeedback.mostrar(`Vector copiado al portapapeles: ${texto}`, 'Copiado', 'success');
    });
  }

  // --- Eliminar ---
  public async eliminar(item: TestVocacionalItem): Promise<void> {
    const conf = await this.uiFeedback.confirmar(
      `¿Desea eliminar la evaluación de ${item.nombreCompleto || 'este estudiante'} (Pág ${item.paginaNumero})? Esta acción no se puede deshacer.`,
      'Eliminar Registro',
      'error',
      'Eliminar'
    );
    if (!conf) return;

    this.cargando.set(true);
    this.testVocacionalService.eliminar(item.id).subscribe({
      next: () => {
        this.cargando.set(false);
        this.cargar();
        this.uiFeedback.mostrar('Registro eliminado con éxito.', 'Eliminado', 'info');
      },
      error: err => {
        this.cargando.set(false);
        this.uiFeedback.mostrar('Error al eliminar: ' + (err.error?.message || err.message), 'Error', 'error');
      }
    });
  }

  // --- Exportar Excel ---
  public exportarExcel(): void {
    this.cargando.set(true);
    this.testVocacionalService.exportarExcel().subscribe({
      next: blob => {
        this.cargando.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_test_vocacional_riasec_${new Date().toISOString().substring(0, 10)}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: err => {
        this.cargando.set(false);
        this.uiFeedback.mostrar('Error al exportar a Excel: ' + (err.error?.message || err.message), 'Error', 'error');
      }
    });
  }

  public exportarExcelPaquete(): void {
    const col = this.colegioSeleccionado();
    const par = this.paraleloSeleccionado();
    if (!col || !par) return;
    this.cargando.set(true);
    this.testVocacionalService.exportarExcel(col, par).subscribe({
      next: blob => {
        this.cargando.set(false);
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const nombreArchivo = `test_vocacional_${col}_${par}_${new Date().toISOString().substring(0, 10)}.xlsx`
          .replace(/\s+/g, '_')
          .toLowerCase();
        a.download = nombreArchivo;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: err => {
        this.cargando.set(false);
        this.uiFeedback.mostrar('Error al exportar Excel del paquete: ' + (err.error?.message || err.message), 'Error', 'error');
      }
    });
  }
}
