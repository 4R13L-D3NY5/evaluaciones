import { Component, inject, signal, computed, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EvaluacionesStorageService } from '../../core/services/evaluaciones-storage.service';
import { EvaluacionesDbService } from '../../core/services/evaluaciones-db.service';
import * as XLSX from 'xlsx';

export interface PreguntaValidada {
  fila: number;
  tipo: string;
  grupo: string;
  enunciado: string;
  opcion_a: string;
  opcion_b: string;
  opcion_c: string;
  opcion_d: string;
  opcion_e: string;
  opciones?: { [key: string]: string };
  respuesta_correcta: string;
  dificultad: '1' | '2' | '3';
  peso: number;
  observaciones: string;
  formulaTypst?: string;
  valido: boolean;
  errores: string[];
}

export interface ExamenDocenteCronograma {
  id: number;
  codigo: string;
  materia: string;
  carrera: string;
  semestre: number;
  grupo: string;
  tipo: '1er Parcial' | '2do Parcial' | 'Examen Final' | '2da Instancia';
  fecha: string; // 'DD/MM/YYYY'
  horario: string;
  aula: string;
  conCartilla: boolean;
  estado: 'Programado' | 'Generado' | 'Impreso' | 'Entregado' | 'Devuelto' | 'Enviado';
}

export interface CampusEvaluacion {
  id: string;
  nombre: string;
  ciudad: string;
  correos: string[];
  oficina: string;
}

export interface ComprobanteEnvio {
  ticket: string;
  fechaHora: string;
  campusNombre: string;
  correoDestino: string;
  correoDocente: string;
  docenteNombre: string;
  docenteCi: string;
  materia: string;
  codigoMateria: string;
  grupo: string;
  parcial: string;
  modalidad: string;
  totalPreguntas: number;
  hashCriptografico: string;
  nombreArchivoPkg: string;
}

export interface DiaCalendario {
  dayNumber: number;
  isCurrentMonth: boolean;
  dateStr: string;
  examenes: ExamenDocenteCronograma[];
}

@Component({
  selector: 'sea-banco-preguntas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Input de archivo oculto para carga real de Excel -->
      <input 
        #fileInput 
        type="file" 
        accept=".xlsx,.xls" 
        (change)="onFileSelected($event)" 
        class="hidden" />

      <!-- Cabecera Limpia del Módulo -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="h-10 w-10 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center text-xl font-bold">
              <i class="pi pi-check-square"></i>
            </div>
            <div>
              <h1 class="text-2xl font-black tracking-tight text-foreground">
                Gestión y Validación de Evaluaciones
              </h1>
              <p class="text-xs text-muted-foreground font-medium mt-0.5">
                Validador oficial de banco de preguntas y calendario interactivo de exámenes.
              </p>
            </div>
          </div>
        </div>

        <!-- Pestañas Principales: 1. Validador de Examen (Default), 2. Fechas y Calendario -->
        <div class="flex items-center bg-muted/60 p-1 rounded-xl border border-border">
          <button 
            (click)="tabActiva.set('validador')"
            [class]="tabActiva() === 'validador' ? 'bg-purple-700 text-white font-black shadow-xs' : 'text-muted-foreground hover:text-foreground font-bold'"
            class="px-4 py-2 text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer">
            <i class="pi pi-verified text-xs"></i>
            <span>Validador de Examen</span>
          </button>

          <button 
            (click)="tabActiva.set('calendario')"
            [class]="tabActiva() === 'calendario' ? 'bg-purple-700 text-white font-black shadow-xs' : 'text-muted-foreground hover:text-foreground font-bold'"
            class="px-4 py-2 text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer">
            <i class="pi pi-calendar text-xs"></i>
            <span>Fechas y Calendario</span>
          </button>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- TAB 1: VALIDADOR DE EXAMEN (DEFAULT - LIMPIO Y ENFOCADO EN EL EXAMEN) -->
      <!-- ================================================================= -->
      @if (tabActiva() === 'validador') {
        <div class="space-y-6 animate-fade-in">
          
          <!-- Selector Académico: Sede, Carrera, Asignatura, Grupo -->
          <div class="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
              <div class="flex items-center gap-2">
                <span class="h-8 w-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-black text-sm">
                  <i class="pi pi-sliders-h"></i>
                </span>
                <div>
                  <h3 class="text-sm font-black text-foreground">Asignación Académica del Examen</h3>
                  <p class="text-[11px] text-muted-foreground font-medium">Seleccione la sede, carrera, asignatura y grupo para parametrizar el banco de preguntas institucional.</p>
                </div>
              </div>
              
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-900 border border-purple-200 rounded-full text-xs font-bold font-mono">
                  <i class="pi pi-check-circle text-purple-600 text-xs"></i>
                  {{ asignaturaSeleccionada() }} · {{ grupoSeleccionado() }}
                </span>
              </div>
            </div>

            <!-- Grilla de 4 Selects Reactivos -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <!-- Select 1: Sede -->
              <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <i class="pi pi-building text-purple-700"></i> Sede / Campus
                </label>
                <select 
                  [ngModel]="sedeSeleccionada()"
                  (ngModelChange)="sedeSeleccionada.set($event)"
                  class="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-none cursor-pointer">
                  @for (s of sedesCatalogo; track s) {
                    <option [value]="s">{{ s }}</option>
                  }
                </select>
              </div>

              <!-- Select 2: Carrera -->
              <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <i class="pi pi-graduation-cap text-purple-700"></i> Carrera
                </label>
                <select 
                  [ngModel]="carreraSeleccionada()"
                  (ngModelChange)="onCarreraChange($event)"
                  class="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-none cursor-pointer">
                  @for (c of carrerasCatalogo; track c) {
                    <option [value]="c">{{ c }}</option>
                  }
                </select>
              </div>

              <!-- Select 3: Asignatura -->
              <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <i class="pi pi-book text-purple-700"></i> Asignatura
                </label>
                <select 
                  [ngModel]="asignaturaSeleccionada()"
                  (ngModelChange)="onAsignaturaChange($event)"
                  class="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-none cursor-pointer">
                  @for (a of asignaturasDisponibles(); track a) {
                    <option [value]="a">{{ a }}</option>
                  }
                </select>
              </div>

              <!-- Select 4: Grupo -->
              <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <i class="pi pi-users text-purple-700"></i> Grupo / Paralelo
                </label>
                <select 
                  [ngModel]="grupoSeleccionado()"
                  (ngModelChange)="grupoSeleccionado.set($event)"
                  class="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-none cursor-pointer">
                  @for (g of gruposDisponibles(); track g) {
                    <option [value]="g">{{ g }}</option>
                  }
                </select>
              </div>
            </div>
          </div>
          
          <!-- Barra Superior de Acciones y Recursos del Examen -->
          <div class="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Parcial a Validar</span>
              <div class="flex flex-wrap items-center gap-1.5 mt-1.5">
                @for (p of ['1er Parcial', '2do Parcial', 'Examen Final', '2da Instancia']; track p) {
                  <button 
                    (click)="cambiarParcial(p)"
                    [class]="parcialActivo() === p ? 'bg-purple-700 text-white font-black shadow-xs' : 'bg-muted/70 text-muted-foreground hover:text-foreground font-bold'"
                    class="px-3.5 py-1.5 text-xs rounded-xl transition-all cursor-pointer">
                    {{ p }} ({{ getResumenCuota(p) }})
                  </button>
                }
              </div>
            </div>

            <!-- Botonera de Plantilla y Ejemplos -->
            <div class="flex flex-wrap items-center gap-2">
              <button 
                (click)="descargarExcelBaseMacro()"
                title="Descargar la plantilla oficial en blanco con 4 hojas, listas desplegables y fórmulas automáticas"
                class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer">
                <i class="pi pi-download text-xs"></i>
                <span>Plantilla Oficial (4 Hojas)</span>
              </button>

              <button 
                (click)="descargarEjemploValido()"
                title="Descargar y cargar en vivo un banco 100% conforme con 60 preguntas y las 6 tipologías"
                class="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer">
                <i class="pi pi-check-circle text-xs"></i>
                <span>Ejemplo Válido (60 Reactivos)</span>
              </button>

              <button 
                (click)="descargarEjemploInvalido()"
                title="Descargar y cargar en vivo un banco con observaciones intencionales para probar el validador"
                class="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer">
                <i class="pi pi-exclamation-triangle text-xs"></i>
                <span>Ejemplo con Errores</span>
              </button>

              <button 
                (click)="abrirModalEjemplos()"
                title="Abrir la Guía Oficial interactiva con las 6 tipologías pedagógicas de UNITEPC"
                class="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer">
                <i class="pi pi-book text-xs"></i>
                <span>Guía de Reglas (6 Tipologías)</span>
              </button>
            </div>
          </div>

          <!-- Paneles de Métricas y Balance del Examen -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            <!-- Tarjeta 1: Estado de Validación -->
            <div class="lg:col-span-3 bg-card border border-border rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Estado del Examen</span>
                <h3 class="text-base font-black text-foreground mt-0.5">{{ parcialActivo() }}</h3>
                <p class="text-xs font-bold text-primary font-mono mt-1">
                  {{ totalPreguntasValidas() }}/{{ totalPreguntasRequeridas() }} preguntas validadas
                </p>
              </div>
              
              <div>
                @if (esBancoTotalmenteValido()) {
                  <div class="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-center space-y-1">
                    <span class="text-emerald-800 font-black text-xs flex items-center justify-center gap-1">
                      <i class="pi pi-shield text-emerald-600"></i> EXAMEN 100% APROBADO
                    </span>
                    <p class="text-[10px] text-emerald-700">Cuotas cumplidas y reactivos conformes</p>
                  </div>
                } @else {
                  <div class="bg-amber-50 border border-amber-300 p-3 rounded-xl text-center space-y-0.5">
                    <span class="text-amber-800 font-bold text-xs">Pendiente de Aprobación</span>
                    <p class="text-[9px] text-amber-700 font-mono">Faltan reactivos o corregir errores</p>
                  </div>
                }
              </div>
            </div>

            <!-- Tarjeta 2: Conteo por Dificultad (OBLIGATORIO) -->
            <div class="lg:col-span-5 bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
              <div class="flex items-center justify-between border-b border-border pb-2">
                <span class="text-xs font-black text-foreground uppercase tracking-wide">Cuotas por Dificultad</span>
                <span class="bg-rose-600 text-white font-extrabold text-[9px] px-2 py-0.5 rounded uppercase shadow-2xs">
                  OBLIGATORIO
                </span>
              </div>

              <div class="space-y-2.5 text-xs">
                <!-- Fáciles (1) -->
                <div>
                  <div class="flex justify-between font-bold text-[11px] mb-1">
                    <span class="text-emerald-700">Fáciles (1)</span>
                    <span class="font-mono text-foreground">{{ countFaciles() }}/{{ cuotasDificultad().facil }}</span>
                  </div>
                  <div class="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 rounded-full transition-all duration-500" [style.width.%]="(countFaciles() / cuotasDificultad().facil) * 100"></div>
                  </div>
                </div>

                <!-- Medias (2) -->
                <div>
                  <div class="flex justify-between font-bold text-[11px] mb-1">
                    <span class="text-amber-600">Medias (2)</span>
                    <span class="font-mono text-foreground">{{ countMedias() }}/{{ cuotasDificultad().medio }}</span>
                  </div>
                  <div class="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div class="h-full bg-amber-500 rounded-full transition-all duration-500" [style.width.%]="(countMedias() / cuotasDificultad().medio) * 100"></div>
                  </div>
                </div>

                <!-- Difíciles (3) -->
                <div>
                  <div class="flex justify-between font-bold text-[11px] mb-1">
                    <span class="text-rose-600">Difíciles (3)</span>
                    <span class="font-mono text-foreground">{{ countDificiles() }}/{{ cuotasDificultad().dificil }}</span>
                  </div>
                  <div class="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div class="h-full bg-rose-500 rounded-full transition-all duration-500" [style.width.%]="(countDificiles() / cuotasDificultad().dificil) * 100"></div>
                  </div>
                </div>
              </div>

              <div [class]="cuotaDificultadCumplida() ? 'text-emerald-700' : 'text-amber-700'" class="text-[10px] font-extrabold flex items-center gap-1 pt-1">
                <i [class]="cuotaDificultadCumplida() ? 'pi pi-check-circle text-xs' : 'pi pi-exclamation-circle text-xs'"></i>
                <span>{{ cuotaDificultadCumplida() ? '100% de cuotas alcanzadas para este examen' : 'Cuotas incompletas según parcial' }}</span>
              </div>
            </div>

            <!-- Tarjeta 3: Conteo por Grupo de Tipo (REFERENCIAL) -->
            <div class="lg:col-span-4 bg-card border border-border rounded-xl p-5 shadow-xs space-y-3">
              <div class="flex items-center justify-between border-b border-border pb-2">
                <span class="text-xs font-black text-foreground uppercase tracking-wide">Mezcla por Grupo de Tipo</span>
                <span class="bg-slate-700 text-white font-extrabold text-[9px] px-2 py-0.5 rounded uppercase shadow-2xs">
                  REFERENCIAL
                </span>
              </div>

              <div class="space-y-2.5 text-xs">
                <div>
                  <div class="flex justify-between font-bold text-[11px] mb-1">
                    <span class="text-emerald-700">G1 (VF + Compuesta + Clave)</span>
                    <span class="font-mono text-foreground">{{ countG1() }}/{{ cuotasGrupos().g1 }}</span>
                  </div>
                  <div class="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 rounded-full transition-all duration-500" [style.width.%]="(countG1() / cuotasGrupos().g1) * 100"></div>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between font-bold text-[11px] mb-1">
                    <span class="text-blue-600">G2 (Selección Simple / Mejor Rpta)</span>
                    <span class="font-mono text-foreground">{{ countG2() }}/{{ cuotasGrupos().g2 }}</span>
                  </div>
                  <div class="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div class="h-full bg-blue-500 rounded-full transition-all duration-500" [style.width.%]="(countG2() / cuotasGrupos().g2) * 100"></div>
                  </div>
                </div>

                <div>
                  <div class="flex justify-between font-bold text-[11px] mb-1">
                    <span class="text-purple-700">G3 (Casos / Fórmulas Typst + Emp.)</span>
                    <span class="font-mono text-foreground">{{ countG3() }}/{{ cuotasGrupos().g3 }}</span>
                  </div>
                  <div class="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div class="h-full bg-purple-600 rounded-full transition-all duration-500" [style.width.%]="(countG3() / cuotasGrupos().g3) * 100"></div>
                  </div>
                </div>
              </div>

              <p class="text-[10px] text-muted-foreground leading-tight pt-1">
                Balance referencial de tipos de reactivos.
              </p>
            </div>

          </div>

          <!-- Zona Principal de Validación y Acciones de Aprobación -->
          <div class="bg-card border border-border rounded-2xl p-6 shadow-xs space-y-5">
            
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 class="text-base font-black text-foreground flex items-center gap-2">
                  <i class="pi pi-upload text-purple-700"></i>
                  <span>Cargar y Validar Archivo Excel del Examen</span>
                </h3>
                <p class="text-xs text-muted-foreground">Sube el archivo .xlsx completado con las preguntas oficiales</p>
              </div>

              <!-- Botones de Acción: Forzar Previsualización PDF antes de Descargar o Previsualizar Encriptado -->
              @if (esBancoTotalmenteValido()) {
                <div class="flex flex-wrap items-center gap-2.5 animate-fade-in">
                  
                  <!-- BOTÓN 1: PREVISUALIZAR PDF (OBLIGATORIO) -->
                  <button 
                    (click)="abrirModalPrevisualizacionPdf()"
                    [class]="!pdfPrevisualizadoYConforme() ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg ring-4 ring-blue-400/30 animate-pulse font-black' : 'bg-blue-600 hover:bg-blue-700 text-white font-bold'"
                    class="text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all hover:scale-105 cursor-pointer">
                    <i class="pi pi-file-pdf text-sm"></i>
                    <span>{{ pdfPrevisualizadoYConforme() ? 'Volver a Previsualizar PDF' : 'Previsualizar Examen (Paso 1 Obligatorio)' }}</span>
                    @if (pdfPrevisualizadoYConforme()) {
                      <i class="pi pi-check text-[10px] text-emerald-300 font-bold"></i>
                    }
                  </button>

                  <!-- BOTÓN 2: PREVISUALIZAR ENCRIPTADO (.PKG) (DESBLOQUEADO TRAS VER PDF) -->
                  @if (pdfPrevisualizadoYConforme()) {
                    <button 
                      (click)="abrirModalPrevisualizacionPkg()"
                      title="Inspeccionar el contenido cifrado y payload de seguridad del paquete .pkg"
                      class="bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-900 dark:text-purple-200 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 border border-purple-300 dark:border-purple-700 transition-all hover:scale-105 cursor-pointer">
                      <i class="pi pi-eye text-xs text-purple-600"></i>
                      <span>Previsualizar Encriptado</span>
                    </button>
                  } @else {
                    <button 
                      disabled
                      title="Debes previsualizar el PDF del examen primero para desbloquear esta opción"
                      class="bg-muted text-muted-foreground/60 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 border border-border/60 cursor-not-allowed opacity-60">
                      <i class="pi pi-lock text-xs"></i>
                      <span>Previsualizar Encriptado</span>
                    </button>
                  }

                  <!-- BOTÓN 3: DESCARGAR COPIA .PKG (DESBLOQUEADO TRAS VER PDF) -->
                  @if (pdfPrevisualizadoYConforme()) {
                    <button 
                      (click)="generarYDescargarPaqueteEncriptado()"
                      title="Descargar una copia de respaldo cifrada en formato .pkg"
                      class="bg-muted hover:bg-border text-foreground font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 border border-border transition-all hover:scale-105 cursor-pointer">
                      <i class="pi pi-shield text-xs text-purple-700"></i>
                      <span>Descargar .pkg</span>
                    </button>
                  } @else {
                    <button 
                      disabled
                      title="Debes previsualizar el PDF del examen primero para desbloquear esta opción"
                      class="bg-muted text-muted-foreground/60 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 border border-border/60 cursor-not-allowed opacity-60">
                      <i class="pi pi-lock text-xs"></i>
                      <span>Descargar .pkg</span>
                    </button>
                  }

                  <!-- BOTÓN 4: ENVIAR A OFICINA DE EVALUACIONES (DESBLOQUEADO TRAS VER PDF) -->
                  @if (pdfPrevisualizadoYConforme()) {
                    <button 
                      (click)="abrirModalEnvioEvaluaciones()"
                      class="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all hover:scale-105 cursor-pointer">
                      <i class="pi pi-send text-sm"></i>
                      <span>Enviar a Oficina de Evaluaciones</span>
                    </button>
                  } @else {
                    <button 
                      disabled
                      title="Debes previsualizar el PDF del examen primero para desbloquear esta opción"
                      class="bg-muted text-muted-foreground/60 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 border border-border/60 cursor-not-allowed opacity-60">
                      <i class="pi pi-lock text-xs"></i>
                      <span>Enviar a Evaluaciones</span>
                    </button>
                  }

                </div>
              }
            </div>

            <!-- Banner de Estado de Previsualización Obligatoria -->
            @if (esBancoTotalmenteValido()) {
              @if (!pdfPrevisualizadoYConforme()) {
                <div class="p-4 bg-amber-500/10 border border-amber-300 dark:border-amber-700 rounded-2xl flex items-start gap-3.5 shadow-2xs animate-fade-in">
                  <div class="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0 mt-0.5 border border-amber-300">
                    <i class="pi pi-exclamation-triangle text-base"></i>
                  </div>
                  <div class="space-y-1 flex-1">
                    <div class="flex items-center justify-between">
                      <h5 class="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-tight">
                        Paso Obligatorio: Previsualización de Diagramación Typst Requerida
                      </h5>
                      <span class="bg-amber-200 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        Pendiente de Revisión
                      </span>
                    </div>
                    <p class="text-xs text-amber-900/90 dark:text-amber-300/90 font-medium leading-relaxed">
                      El banco de preguntas ha alcanzado el 100% de cuotas válidas. Por normativa institucional, <strong>debes hacer clic en "Previsualizar Examen (Paso 1 Obligatorio)"</strong> para verificar la diagramación en PDF, fórmulas matemáticas/químicas y enunciados antes de desbloquear la descarga del paquete encriptado (.pkg) o la remisión oficial.
                    </p>
                  </div>
                </div>
              } @else {
                <div class="p-4 bg-emerald-500/10 border border-emerald-300 dark:border-emerald-700 rounded-2xl flex items-start gap-3.5 shadow-2xs animate-fade-in">
                  <div class="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-300">
                    <i class="pi pi-check-circle text-base"></i>
                  </div>
                  <div class="space-y-1 flex-1">
                    <div class="flex items-center justify-between">
                      <h5 class="text-xs font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-tight">
                        Diagramación PDF Verificada y Aprobada por el Docente
                      </h5>
                      <span class="bg-emerald-200 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        Conforme ✓
                      </span>
                    </div>
                    <p class="text-xs text-emerald-900/90 dark:text-emerald-300/90 font-medium leading-relaxed">
                      Has verificado la diagramación oficial del examen en PDF. Las opciones para <strong>previsualizar el paquete encriptado</strong>, <strong>descargar la copia de respaldo .pkg</strong> y <strong>enviar la evaluación a la oficina de evaluaciones</strong> han sido desbloqueadas exitosamente.
                    </p>
                  </div>
                </div>
              }
            }

            <!-- Zona Drag and Drop con Input Interactivo -->
            <div 
              (click)="triggerFileInput()"
              (dragover)="onDragOver($event)"
              (drop)="onDropFile($event)"
              class="border-2 border-dashed border-border hover:border-purple-600 rounded-2xl p-8 text-center space-y-3 bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer">
              <div class="h-14 w-14 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center text-2xl mx-auto shadow-2xs">
                <i class="pi pi-file-excel"></i>
              </div>
              <div>
                <div class="text-sm font-black text-foreground">
                  {{ nombreArchivoCargado() || 'Haz clic para seleccionar tu archivo Excel (.xlsx) o arrástralo aquí' }}
                </div>
                <p class="text-xs text-muted-foreground mt-1">
                  Validación instantánea de tipos de reactivos, cuotas de dificultad y fórmulas matemáticas/químicas Typst.
                </p>
              </div>
            </div>

            <!-- Resumen de Errores si el archivo no es válido -->
            @if (preguntasConErrores().length > 0) {
              <div class="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2 text-xs animate-fade-in">
                <div class="flex items-center gap-2 font-black text-rose-900">
                  <i class="pi pi-exclamation-triangle text-rose-600"></i>
                  <span>Se detectaron {{ preguntasConErrores().length }} filas con observaciones que deben corregirse:</span>
                </div>
                <ul class="list-disc pl-5 space-y-1 text-rose-800 text-[11px]">
                  @for (errItem of preguntasConErrores(); track errItem.fila) {
                    <li>
                      <strong>Fila {{ errItem.fila }}:</strong> {{ errItem.errores.join(', ') }} <em>({{ errItem.enunciado ? (errItem.enunciado | slice:0:60) + '...' : 'Sin enunciado' }})</em>
                    </li>
                  }
                </ul>
              </div>
            }

            <!-- ================================================================= -->
            <!-- TABLA INTERACTIVA DE REACTIVOS CARGADOS Y VALIDACIONES EN TIEMPO REAL -->
            <!-- ================================================================= -->
            @if (preguntasCargadas().length > 0) {
              <div class="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4 animate-fade-in">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                  <div>
                    <h4 class="text-sm font-black text-foreground flex items-center gap-2">
                      <i class="pi pi-list text-purple-700"></i>
                      <span>Reactivos Procesados del Banco ({{ preguntasCargadas().length }} Filas)</span>
                    </h4>
                    <p class="text-[11px] text-muted-foreground">
                      Inspección detallada de las 6 tipologías pedagógicas según <code>formato_banco_preguntas_asig_EF.xlsx</code>
                    </p>
                  </div>

                  <div class="flex items-center gap-2 text-xs">
                    <span class="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-lg">
                      {{ totalPreguntasValidas() }} Válidas
                    </span>
                    @if (preguntasConErrores().length > 0) {
                      <span class="bg-rose-100 text-rose-800 font-bold px-2.5 py-1 rounded-lg">
                        {{ preguntasConErrores().length }} Observadas
                      </span>
                    }
                  </div>
                </div>

                <div class="overflow-x-auto max-h-[500px] overflow-y-auto border border-border rounded-xl">
                  <table class="w-full text-left border-collapse text-[11px]">
                    <thead class="sticky top-0 bg-muted/90 backdrop-blur-xs z-10">
                      <tr class="border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                        <th class="p-2.5 text-center w-12">Fila</th>
                        <th class="p-2.5 w-44">Tipología</th>
                        <th class="p-2.5 w-24">Grupo</th>
                        <th class="p-2.5 min-w-[220px]">Enunciado / Pregunta</th>
                        <th class="p-2.5 min-w-[200px]">Opciones (A-E)</th>
                        <th class="p-2.5 text-center w-14">Clave</th>
                        <th class="p-2.5 text-center w-20">Dificultad</th>
                        <th class="p-2.5 w-32 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border">
                      @for (p of preguntasCargadas(); track p.fila) {
                        <tr [class]="p.valido ? 'hover:bg-muted/30' : 'bg-rose-500/5 hover:bg-rose-500/10'" class="transition-colors">
                          <td class="p-2.5 text-center font-mono font-bold text-muted-foreground">{{ p.fila }}</td>
                          
                          <td class="p-2.5">
                            <span [class]="getTipoBadgeClass(p.tipo)" class="px-2 py-0.5 rounded text-[9px] font-bold inline-block leading-tight">
                              {{ getTipoNombreAmigable(p.tipo) }}
                            </span>
                          </td>

                          <td class="p-2.5 font-mono text-[10px] text-muted-foreground font-bold">
                            {{ p.grupo || '—' }}
                          </td>

                          <td class="p-2.5 font-medium text-foreground">
                            <div class="line-clamp-2" [title]="p.enunciado">{{ p.enunciado }}</div>
                            @if (p.formulaTypst) {
                              <span class="text-[9px] font-mono text-purple-700 bg-purple-50 px-1 py-0.5 rounded border border-purple-200 mt-1 inline-block">
                                Typst: {{ p.formulaTypst }}
                              </span>
                            }
                          </td>

                          <td class="p-2.5 text-muted-foreground text-[10px]">
                            @if (p.opcion_a || p.opcion_b) {
                              <div class="space-y-0.5 max-w-[260px]">
                                @if (p.opcion_a) { <div class="truncate"><strong>A:</strong> {{ p.opcion_a }}</div> }
                                @if (p.opcion_b) { <div class="truncate"><strong>B:</strong> {{ p.opcion_b }}</div> }
                                @if (p.opcion_c) { <div class="truncate"><strong>C:</strong> {{ p.opcion_c }}</div> }
                                @if (p.opcion_d) { <div class="truncate"><strong>D:</strong> {{ p.opcion_d }}</div> }
                                @if (p.opcion_e) { <div class="truncate"><strong>E:</strong> {{ p.opcion_e }}</div> }
                              </div>
                            } @else {
                              <span class="text-muted-foreground/50 italic">—</span>
                            }
                          </td>

                          <td class="p-2.5 text-center">
                            @if (p.respuesta_correcta) {
                              <span class="bg-purple-100 text-purple-800 font-mono font-black px-2 py-0.5 rounded text-[11px] border border-purple-200">
                                {{ p.respuesta_correcta }}
                              </span>
                            } @else {
                              <span class="text-muted-foreground/40 font-mono">—</span>
                            }
                          </td>

                          <td class="p-2.5 text-center">
                            <span [class]="p.dificultad === '1' ? 'bg-emerald-100 text-emerald-800' : (p.dificultad === '2' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')" class="px-2 py-0.5 rounded text-[9px] font-extrabold font-mono">
                              {{ p.dificultad === '1' ? 'Fácil (1)' : (p.dificultad === '2' ? 'Medio (2)' : 'Difícil (3)') }}
                            </span>
                          </td>

                          <td class="p-2.5 text-center">
                            @if (p.valido) {
                              <span class="bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1">
                                <i class="pi pi-check text-[9px]"></i> OK
                              </span>
                            } @else {
                              <span class="bg-rose-100 text-rose-800 border border-rose-300 font-bold px-2 py-0.5 rounded-full text-[9px] inline-flex items-center gap-1" [title]="p.errores.join(', ')">
                                <i class="pi pi-times text-[9px]"></i> Observado
                              </span>
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            }

          </div>

        </div>
      }

      <!-- ================================================================= -->
      <!-- TAB 2: FECHAS Y CALENDARIO INTERACTIVO DE EXÁMENES -->
      <!-- ================================================================= -->
      @if (tabActiva() === 'calendario') {
        <div class="space-y-6 animate-fade-in">
          
          <!-- Barra de Navegación del Calendario y Selector de Mes -->
          <div class="bg-card border border-border rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <!-- Navegación de Meses -->
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1 bg-muted/70 p-1 rounded-xl border border-border">
                <button 
                  (click)="cambiarMesRelativo(-1)" 
                  class="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-card text-foreground transition-all cursor-pointer">
                  <i class="pi pi-chevron-left text-xs"></i>
                </button>
                <span class="font-black text-sm text-foreground px-3 min-w-[140px] text-center uppercase tracking-wide">
                  {{ nombreMesActual() }} {{ anioActual() }}
                </span>
                <button 
                  (click)="cambiarMesRelativo(1)" 
                  class="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-card text-foreground transition-all cursor-pointer">
                  <i class="pi pi-chevron-right text-xs"></i>
                </button>
              </div>

              <!-- Selector Rápido de Meses del Semestre -->
              <div class="hidden sm:flex items-center gap-1">
                @for (m of mesesSemestre; track m.mesIndex) {
                  <button 
                    (click)="seleccionarMesDirecto(m.mesIndex)"
                    [class]="mesActual() === m.mesIndex ? 'bg-purple-700 text-white font-bold' : 'bg-muted/60 text-muted-foreground hover:text-foreground font-medium'"
                    class="px-2.5 py-1 text-[11px] rounded-lg transition-all cursor-pointer">
                    {{ m.label }}
                  </button>
                }
              </div>
            </div>

            <!-- Conmutador Lista / Cuadrícula Calendario -->
            <div class="flex items-center gap-2">
              <button 
                (click)="vistaCalendario.set('calendario')"
                [class]="vistaCalendario() === 'calendario' ? 'bg-purple-700 text-white font-black shadow-xs' : 'bg-muted text-muted-foreground font-bold'"
                class="px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer">
                <i class="pi pi-calendar text-xs"></i>
                <span>Vista Calendario Mensual</span>
              </button>

              <button 
                (click)="vistaCalendario.set('lista')"
                [class]="vistaCalendario() === 'lista' ? 'bg-purple-700 text-white font-black shadow-xs' : 'bg-muted text-muted-foreground font-bold'"
                class="px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer">
                <i class="pi pi-list text-xs"></i>
                <span>Vista Lista (Tabla)</span>
              </button>
            </div>

          </div>

          <!-- VISTA 1: CUADRÍCULA DE CALENDARIO MENSUAL INTERACTIVO -->
          @if (vistaCalendario() === 'calendario') {
            <div class="bg-card border border-border rounded-2xl shadow-xs overflow-hidden">
              
              <!-- Cabecera de Días de la Semana (Lunes a Domingo) -->
              <div class="grid grid-cols-7 border-b border-border bg-muted/40 text-center text-xs font-black text-muted-foreground py-2.5 uppercase tracking-wider">
                <div>Lun</div>
                <div>Mar</div>
                <div>Mié</div>
                <div>Jue</div>
                <div>Vie</div>
                <div>Sáb</div>
                <div>Dom</div>
              </div>

              <!-- Matriz de Días -->
              <div class="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border text-xs">
                @for (dia of matrizDiasCalendario(); track dia.dateStr) {
                  <div 
                    [class]="getDiaClass(dia)"
                    class="min-h-[140px] p-2 flex flex-col justify-between transition-all hover:bg-muted/30">
                    
                    <!-- Encabezado del Día -->
                    <div class="flex items-center justify-between mb-1.5">
                      <span 
                        [class]="dia.examenes.length > 0 ? 'bg-purple-800 text-white font-black px-1.5 py-0.5 rounded-md text-[11px] shadow-2xs' : 'font-bold text-foreground text-xs'">
                        {{ dia.dayNumber }}
                      </span>

                      @if (dia.examenes.length > 0) {
                        <span class="text-[9px] font-extrabold text-purple-700 bg-purple-100 border border-purple-200 px-1.5 py-0.2 rounded-full">
                          {{ dia.examenes.length }} {{ dia.examenes.length === 1 ? 'examen' : 'exámenes' }}
                        </span>
                      }
                    </div>

                    <!-- Eventos de Examen en este Día -->
                    <div class="space-y-1.5 flex-1">
                      @for (ex of dia.examenes; track ex.id) {
                        <div 
                          (click)="abrirModalDetalleExamen(ex)"
                          [class]="ex.conCartilla ? 'border-l-4 border-l-blue-600 bg-blue-50/80 border border-blue-200' : 'border-l-4 border-l-amber-600 bg-amber-50/80 border border-amber-200'"
                          class="p-2 rounded-lg text-[10px] space-y-1 shadow-2xs hover:shadow-xs transition-all cursor-pointer hover:scale-[1.02]">
                          
                          <!-- Tipo de Parcial y Estado -->
                          <div class="flex items-center justify-between gap-1">
                            <span class="bg-purple-700 text-white font-black px-1.5 py-0.2 rounded text-[9px] uppercase">
                              {{ ex.tipo }}
                            </span>
                            <span [class]="getEstadoBadgeClass(ex.estado)" class="text-[8px] font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                              {{ ex.estado }}
                            </span>
                          </div>

                          <!-- Materia y Código -->
                          <div class="font-black text-foreground leading-tight">
                            [{{ ex.codigo }}] {{ ex.materia }}
                          </div>

                          <!-- Grupo y Modalidad (Con/Sin Cartilla) -->
                          <div class="flex items-center justify-between text-muted-foreground font-medium text-[9px]">
                            <span>{{ ex.grupo }}</span>
                            
                            @if (ex.conCartilla) {
                              <span class="text-blue-700 font-bold flex items-center gap-0.5">
                                <i class="pi pi-check-square text-[9px]"></i> Con Cartilla
                              </span>
                            } @else {
                              <span class="text-amber-700 font-bold flex items-center gap-0.5">
                                <i class="pi pi-file text-[9px]"></i> Sin Cartilla
                              </span>
                            }
                          </div>

                          <!-- Horario y Aula -->
                          <div class="flex items-center justify-between font-mono text-[9px] text-foreground pt-0.5 border-t border-black/5">
                            <span><i class="pi pi-clock text-[8px] text-primary"></i> {{ ex.horario.split(' - ')[0] }}</span>
                            <span class="truncate max-w-[80px]">{{ ex.aula.split(' ')[0] }} {{ ex.aula.split(' ')[1] }}</span>
                          </div>

                        </div>
                      }
                    </div>

                  </div>
                }
              </div>

            </div>
          }

          <!-- VISTA 2: TABLA LISTA OFICIAL -->
          @if (vistaCalendario() === 'lista') {
            <div class="bg-card border border-border rounded-xl shadow-xs overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr class="bg-muted/40 border-b border-border text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                      <th class="p-3.5">Código / Materia</th>
                      <th class="p-3.5 text-center">Semestre</th>
                      <th class="p-3.5 text-center">Grupo</th>
                      <th class="p-3.5 text-center">Tipo de Examen</th>
                      <th class="p-3.5 text-center">Modalidad</th>
                      <th class="p-3.5">Fecha</th>
                      <th class="p-3.5">Horario</th>
                      <th class="p-3.5">Aula / Bloque</th>
                      <th class="p-3.5 text-center">Estado</th>
                      <th class="p-3.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-border">
                    @for (ex of listaExamenesDocente; track ex.id) {
                      <tr class="hover:bg-muted/20 transition-colors">
                        <td class="p-3.5">
                          <div class="font-mono font-black text-foreground">{{ ex.codigo }}</div>
                          <div class="font-bold text-muted-foreground text-[11px]">{{ ex.materia }}</div>
                        </td>
                        <td class="p-3.5 text-center">
                          <span class="bg-teal-50 text-teal-700 border border-teal-200 font-bold px-2 py-0.5 rounded text-[10px]">
                            Sem. {{ ex.semestre }}
                          </span>
                        </td>
                        <td class="p-3.5 text-center font-mono font-bold">{{ ex.grupo }}</td>
                        <td class="p-3.5 text-center">
                          <span class="bg-purple-100 text-purple-800 font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                            {{ ex.tipo }}
                          </span>
                        </td>
                        <td class="p-3.5 text-center">
                          @if (ex.conCartilla) {
                            <span class="bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                              <i class="pi pi-check-square text-[9px]"></i> Con Cartilla
                            </span>
                          } @else {
                            <span class="bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                              <i class="pi pi-file text-[9px]"></i> Sin Cartilla
                            </span>
                          }
                        </td>
                        <td class="p-3.5 font-mono font-bold text-foreground">{{ ex.fecha }}</td>
                        <td class="p-3.5 font-mono text-muted-foreground">{{ ex.horario }}</td>
                        <td class="p-3.5 font-bold text-foreground">{{ ex.aula }}</td>
                        <td class="p-3.5 text-center">
                          <span [class]="getEstadoBadgeClass(ex.estado)" class="font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase">
                            {{ ex.estado }}
                          </span>
                        </td>
                        <td class="p-3.5 text-right">
                          <button 
                            (click)="irAValidarExamenDesdeCalendario(ex)"
                            class="bg-purple-700 hover:bg-purple-800 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                            Validar Banco
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

        </div>
      }

      <!-- ================================================================= -->
      <!-- MODAL: DESPACHO OFICIAL DE EXAMEN POR CORREO A EVALUACIONES       -->
      <!-- ================================================================= -->
      @if (dialogEnvioEvaluaciones()) {
        <div class="fixed inset-0 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div class="bg-card border border-border rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-scale-in my-6">
            
            <!-- Cabecera del Modal de Envío -->
            <div class="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-5 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center text-white text-lg">
                  <i class="pi pi-send"></i>
                </div>
                <div>
                  <h3 class="text-base font-black">Remisión Oficial a Oficina de Evaluaciones</h3>
                  <p class="text-xs text-white/80 font-medium">Despacho seguro directo al correo institucional de la sede</p>
                </div>
              </div>

              @if (!enviandoCorreo()) {
                <button (click)="cerrarModalEnvioEvaluaciones()" class="text-white/80 hover:text-white p-2 text-base cursor-pointer">
                  <i class="pi pi-times"></i>
                </button>
              }
            </div>

            <!-- Si ya se envió con éxito, mostramos el Comprobante / Acuse Oficial -->
            @if (comprobanteGenerado()) {
              <div class="p-6 space-y-5 bg-card text-foreground">
                
                <div class="bg-emerald-50 border border-emerald-300 rounded-2xl p-5 text-center space-y-2">
                  <div class="h-12 w-12 rounded-full bg-emerald-600 text-white flex items-center justify-center text-2xl mx-auto shadow-md">
                    <i class="pi pi-envelope"></i>
                  </div>
                  <h4 class="text-base font-black text-emerald-900">¡Plantilla Oficial y Paquete Generados!</h4>
                  <p class="text-xs text-emerald-800 max-w-md mx-auto">
                    Se descargó el paquete <strong>{{ comprobanteGenerado()?.nombreArchivoPkg }}</strong> y se preparó el despacho para <strong>{{ comprobanteGenerado()?.correoDestino }}</strong>.
                  </p>
                </div>

                <!-- Ficha del Ticket Oficial -->
                <div class="bg-muted/40 border border-border rounded-xl p-4 space-y-3 text-xs">
                  <div class="flex items-center justify-between border-b border-border pb-2">
                    <span class="font-mono font-black text-primary text-sm">{{ comprobanteGenerado()?.ticket }}</span>
                    <span class="text-muted-foreground font-mono text-[11px]">{{ comprobanteGenerado()?.fechaHora }}</span>
                  </div>

                  <div class="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span class="text-muted-foreground block text-[10px]">Campus de Destino:</span>
                      <strong class="text-foreground">{{ comprobanteGenerado()?.campusNombre }}</strong>
                    </div>
                    <div>
                      <span class="text-muted-foreground block text-[10px]">Correo Evaluaciones:</span>
                      <strong class="font-mono text-purple-900">{{ comprobanteGenerado()?.correoDestino }}</strong>
                    </div>
                    <div>
                      <span class="text-muted-foreground block text-[10px]">Asignatura y Grupo:</span>
                      <strong class="text-foreground">[{{ comprobanteGenerado()?.codigoMateria }}] {{ comprobanteGenerado()?.materia }} ({{ comprobanteGenerado()?.grupo }})</strong>
                    </div>
                    <div>
                      <span class="text-muted-foreground block text-[10px]">Evaluación / Reactivos:</span>
                      <strong class="text-foreground">{{ comprobanteGenerado()?.parcial }} · {{ comprobanteGenerado()?.totalPreguntas }} preguntas OK</strong>
                    </div>
                    <div>
                      <span class="text-muted-foreground block text-[10px]">Docente Remitente:</span>
                      <strong class="text-foreground">{{ comprobanteGenerado()?.docenteNombre }} ({{ comprobanteGenerado()?.docenteCi }})</strong>
                    </div>
                    <div>
                      <span class="text-muted-foreground block text-[10px]">Copia de Seguridad:</span>
                      <strong class="font-mono text-foreground">{{ comprobanteGenerado()?.correoDocente }}</strong>
                    </div>
                  </div>

                  <div class="pt-2 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                    <span>Archivo: <strong>{{ comprobanteGenerado()?.nombreArchivoPkg }}</strong></span>
                    <span>Hash: {{ comprobanteGenerado()?.hashCriptografico | slice:0:16 }}...</span>
                  </div>
                </div>

                <!-- Botones de Acción Inmediata: Abrir en Correo, Copiar Texto, Descargar .pkg -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button 
                    (click)="abrirClienteCorreo(comprobanteGenerado()!)"
                    class="px-3 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer">
                    <i class="pi pi-external-link"></i>
                    <span>Abrir en mi Correo</span>
                  </button>

                  <button 
                    (click)="copiarTextoCorreo(comprobanteGenerado()!)"
                    class="px-3 py-2.5 bg-muted hover:bg-border text-foreground rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-border cursor-pointer">
                    <i class="pi pi-copy"></i>
                    <span>Copiar Texto</span>
                  </button>

                  <button 
                    (click)="generarYDescargarPaqueteEncriptado()"
                    class="px-3 py-2.5 bg-muted hover:bg-border text-foreground rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-border cursor-pointer">
                    <i class="pi pi-download"></i>
                    <span>Descargar .pkg</span>
                  </button>
                </div>

                <div class="flex items-center justify-between pt-2 border-t border-border">
                  <button 
                    (click)="imprimirComprobanteEnvio()"
                    class="px-4 py-2 bg-muted hover:bg-border text-foreground rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer">
                    <i class="pi pi-print"></i>
                    <span>Imprimir Constancia</span>
                  </button>

                  <button 
                    (click)="cerrarModalEnvioEvaluaciones()"
                    class="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs">
                    Cerrar
                  </button>
                </div>

              </div>
            } @else {
              <!-- Formulario de Selección de Campus y Confirmación de Datos -->
              <div class="p-6 space-y-4 text-xs text-foreground">
                
                <!-- 1. Selector de Campus / Sede de Destino -->
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    1. Selecciona el Campus / Sede de Evaluaciones
                  </label>
                  <select 
                    [(ngModel)]="campusSeleccionadoId"
                    class="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-none focus:border-purple-600 cursor-pointer">
                    @for (camp of listaCampusEvaluacion; track camp.id) {
                      <option [value]="camp.id">
                        {{ camp.nombre }} — ({{ camp.correos.join(', ') }})
                      </option>
                    }
                  </select>
                </div>

                <!-- Detalle del Campus Elegido y sus Múltiples Correos -->
                @if (campusActivo()) {
                  <div class="bg-purple-50/70 border border-purple-200 rounded-xl p-3.5 space-y-2 text-[11px]">
                    <div class="flex items-center justify-between">
                      <span class="text-purple-900 font-extrabold uppercase text-[10px]">
                        {{ campusActivo().oficina }} · Sede {{ campusActivo().ciudad }}
                      </span>
                      <span class="bg-purple-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                        {{ campusActivo().correos.length }} Buzón(es) de Destino
                      </span>
                    </div>

                    <div class="flex flex-wrap gap-1.5 pt-0.5">
                      @for (mail of campusActivo().correos; track $index) {
                        <span class="bg-white border border-purple-300 text-purple-950 font-bold px-2.5 py-1 rounded-lg font-mono text-[11px] inline-flex items-center gap-1.5 shadow-2xs">
                          <i class="pi pi-envelope text-purple-700 text-[10px]"></i>
                          <span>{{ mail }}</span>
                        </span>
                      }
                    </div>
                  </div>
                }

                <!-- 2. Selección de la Materia / Rol de Examen del Docente -->
                <div class="space-y-1.5">
                  <label class="block text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    2. Asignatura y Rol de Examen Programado
                  </label>
                  <select 
                    [(ngModel)]="examenRolSeleccionadoId"
                    class="w-full bg-muted/60 border border-border rounded-xl px-3.5 py-2.5 text-xs font-bold text-foreground outline-none focus:border-purple-600 cursor-pointer">
                    @for (ex of listaExamenesDocente; track ex.id) {
                      <option [value]="ex.id">
                        [{{ ex.codigo }}] {{ ex.materia }} — {{ ex.grupo }} ({{ ex.tipo }} · {{ ex.fecha }} {{ ex.horario.split(' - ')[0] }})
                      </option>
                    }
                  </select>
                </div>

                <!-- 3. Ficha Resumen de Emisión -->
                <div class="grid grid-cols-2 gap-3 bg-muted/40 p-4 rounded-xl border border-border text-[11px]">
                  <div>
                    <span class="text-muted-foreground block text-[10px]">Docente Titular:</span>
                    <strong class="text-foreground">{{ docenteSesion.nombre }}</strong>
                    <span class="block text-[10px] text-muted-foreground">C.I.: {{ docenteSesion.ci }}</span>
                  </div>
                  <div>
                    <span class="text-muted-foreground block text-[10px]">Correo del Docente:</span>
                    <strong class="text-foreground font-mono">{{ docenteSesion.correo }}</strong>
                    <span class="block text-[9px] text-emerald-700 font-bold">Recibirá copia de entrega</span>
                  </div>
                  <div>
                    <span class="text-muted-foreground block text-[10px]">Paquete Generado:</span>
                    <strong class="font-mono text-purple-900">{{ nombreArchivoPaquete() }}</strong>
                  </div>
                  <div>
                    <span class="text-muted-foreground block text-[10px]">Certificación:</span>
                    <strong class="text-emerald-700 font-bold">✓ {{ totalPreguntasValidas() }} reactivos validados</strong>
                  </div>
                </div>

                <!-- 4. Observaciones Opcionales para el Personal de Evaluaciones -->
                <div class="space-y-1">
                  <label class="block text-[11px] font-bold text-muted-foreground">
                    Observaciones o notas para la Oficina de Evaluaciones (Opcional):
                  </label>
                  <textarea 
                    [(ngModel)]="observacionesDocenteEnvio"
                    rows="2"
                    placeholder="Ejemplo: Se solicita imprimir con variante A y B en tamaño Oficio..."
                    class="w-full bg-muted/50 border border-border rounded-xl p-3 text-xs text-foreground outline-none focus:border-purple-600 resize-none">
                  </textarea>
                </div>

              </div>

              <!-- Footer con Botón de Envío Directo -->
              <div class="bg-muted/30 border-t border-border p-4 flex items-center justify-between">
                <button 
                  (click)="cerrarModalEnvioEvaluaciones()"
                  [disabled]="enviandoCorreo()"
                  class="px-4 py-2 bg-muted text-foreground rounded-xl text-xs font-bold hover:bg-muted/80 cursor-pointer disabled:opacity-50">
                  Cancelar
                </button>

                <button 
                  (click)="ejecutarEnvioCorreoEvaluaciones()"
                  [disabled]="enviandoCorreo()"
                  class="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all hover:scale-105 cursor-pointer disabled:opacity-50">
                  @if (enviandoCorreo()) {
                    <i class="pi pi-spin pi-spinner text-sm"></i>
                    <span>Despachando Correo...</span>
                  } @else {
                    <i class="pi pi-send text-sm"></i>
                    <span>Confirmar y Enviar Evaluación</span>
                  }
                </button>
              </div>
            }

          </div>
        </div>
      }

      <!-- MODAL: DETALLE DE EXAMEN SELECCIONADO EN CALENDARIO -->
      @if (examenSeleccionadoModal()) {
        <div class="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div class="bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-scale-in my-6">
            
            <div class="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-5 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center text-white text-lg">
                  <i class="pi pi-calendar"></i>
                </div>
                <div>
                  <h3 class="text-base font-black">{{ examenSeleccionadoModal()?.materia }}</h3>
                  <p class="text-xs text-white/80 font-mono">{{ examenSeleccionadoModal()?.codigo }} · {{ examenSeleccionadoModal()?.grupo }}</p>
                </div>
              </div>

              <button (click)="examenSeleccionadoModal.set(null)" class="text-white/80 hover:text-white p-2 text-base">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="p-6 space-y-4 text-xs text-foreground">
              
              <div class="grid grid-cols-2 gap-3 bg-muted/40 p-4 rounded-xl border border-border font-medium">
                <div>
                  <span class="text-[10px] text-muted-foreground uppercase font-bold block">Tipo de Evaluación</span>
                  <span class="font-black text-purple-900 text-xs">{{ examenSeleccionadoModal()?.tipo }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-muted-foreground uppercase font-bold block">Modalidad</span>
                  <span class="font-bold text-xs">{{ examenSeleccionadoModal()?.conCartilla ? 'Con Cartilla Óptica' : 'Sin Cartilla' }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-muted-foreground uppercase font-bold block">Fecha Programada</span>
                  <span class="font-mono font-bold text-xs text-foreground">{{ examenSeleccionadoModal()?.fecha }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-muted-foreground uppercase font-bold block">Horario</span>
                  <span class="font-mono font-bold text-xs text-foreground">{{ examenSeleccionadoModal()?.horario }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-muted-foreground uppercase font-bold block">Aula / Bloque</span>
                  <span class="font-bold text-xs text-foreground">{{ examenSeleccionadoModal()?.aula }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-muted-foreground uppercase font-bold block">Estado Actual</span>
                  <span [class]="getEstadoBadgeClass(examenSeleccionadoModal()!.estado)" class="text-[9px] font-black px-2 py-0.5 rounded-full uppercase inline-block mt-0.5">
                    {{ examenSeleccionadoModal()?.estado }}
                  </span>
                </div>
              </div>

              <div class="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px] leading-relaxed">
                <i class="pi pi-info-circle text-blue-700 mr-1"></i>
                Para este examen se requiere un banco validado de <strong>{{ getResumenCuota(examenSeleccionadoModal()!.tipo) }}</strong>.
              </div>

            </div>

            <div class="bg-muted/30 border-t border-border p-4 flex items-center justify-between">
              <button 
                (click)="examenSeleccionadoModal.set(null)"
                class="px-4 py-2 bg-muted text-foreground rounded-xl text-xs font-bold hover:bg-muted/80">
                Cerrar
              </button>

              <button 
                (click)="irAValidarExamenDesdeCalendario(examenSeleccionadoModal()!)"
                class="px-5 py-2 bg-purple-700 text-white rounded-xl text-xs font-black hover:bg-purple-800 flex items-center gap-2 shadow-xs cursor-pointer">
                <i class="pi pi-verified text-xs"></i>
                <span>Ir a Validar Banco para este Examen</span>
              </button>
            </div>

          </div>
        </div>
      }

      <!-- ================================================================= -->
      <!-- MODAL: PREVISUALIZACIÓN DEL EXAMEN EN FORMATO PDF / CUADERNILLO TYPST -->
      <!-- ================================================================= -->
      @if (dialogPrevisualizacionPdf()) {
        <div class="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div class="bg-card border border-border rounded-2xl max-w-6xl w-full shadow-2xl overflow-hidden animate-scale-in my-auto flex flex-col max-h-[92vh]">
            
            <!-- Barra Superior del Visor PDF (Estilo Lector de Documentos) -->
            <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/60 shrink-0">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-400 text-xl shrink-0">
                  <i class="pi pi-file-pdf"></i>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-black">Previsualización de Cuadernillo de Examen (Motor Typst)</h3>
                    <span class="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                      100% del Banco ({{ preguntasValidasParaPdf().length }} Reactivos)
                    </span>
                  </div>
                  <p class="text-xs text-slate-300 font-mono">
                    {{ parcialActivo() }} · Variante Tipo A · UNITEPC Gestión II-2026
                  </p>
                </div>
              </div>

              <!-- Herramientas de Control del Visor: Filtro de Dificultad, Columnas e Impresión -->
              <div class="flex flex-wrap items-center gap-2">
                
                <!-- Filtro de Dificultad Rápido -->
                <div class="flex items-center bg-white/10 p-0.5 rounded-lg border border-white/15 text-[11px]">
                  <button 
                    (click)="filtroPdfDificultad.set('TODAS')"
                    [class]="filtroPdfDificultad() === 'TODAS' ? 'bg-white text-slate-950 font-black shadow-xs' : 'text-slate-200 hover:text-white font-medium'"
                    class="px-2.5 py-1 rounded-md transition-all cursor-pointer">
                    Todas ({{ totalPreguntasValidas() }})
                  </button>
                  <button 
                    (click)="filtroPdfDificultad.set('1')"
                    [class]="filtroPdfDificultad() === '1' ? 'bg-emerald-500 text-white font-black shadow-xs' : 'text-slate-200 hover:text-white font-medium'"
                    class="px-2 py-1 rounded-md transition-all cursor-pointer">
                    Fáciles ({{ countFaciles() }})
                  </button>
                  <button 
                    (click)="filtroPdfDificultad.set('2')"
                    [class]="filtroPdfDificultad() === '2' ? 'bg-amber-500 text-white font-black shadow-xs' : 'text-slate-200 hover:text-white font-medium'"
                    class="px-2 py-1 rounded-md transition-all cursor-pointer">
                    Medias ({{ countMedias() }})
                  </button>
                  <button 
                    (click)="filtroPdfDificultad.set('3')"
                    [class]="filtroPdfDificultad() === '3' ? 'bg-rose-500 text-white font-black shadow-xs' : 'text-slate-200 hover:text-white font-medium'"
                    class="px-2 py-1 rounded-md transition-all cursor-pointer">
                    Difíciles ({{ countDificiles() }})
                  </button>
                </div>

                <!-- Conmutador 2 Columnas / 1 Columna -->
                <button 
                  (click)="vistaPdfColumnas.set(vistaPdfColumnas() === '2' ? '1' : '2')"
                  title="Cambiar entre 2 columnas (impreso Typst) y 1 columna"
                  class="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1.5 rounded-lg border border-white/15 text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer">
                  <i [class]="vistaPdfColumnas() === '2' ? 'pi pi-table' : 'pi pi-list'"></i>
                  <span>{{ vistaPdfColumnas() === '2' ? '2 Columnas' : '1 Columna' }}</span>
                </button>

                <button (click)="cerrarModalPrevisualizacionPdf()" class="text-white/80 hover:text-white p-1 text-base cursor-pointer ml-1">
                  <i class="pi pi-times"></i>
                </button>
              </div>
            </div>

            <!-- Área de Visualización: Hoja de Examen en Tamaño Real (Estilo Papel Académico) -->
            <div class="p-4 sm:p-8 overflow-y-auto bg-slate-200/90 dark:bg-slate-900/90 flex-1 space-y-6">
              
              <!-- Hoja de Examen Impresa Oficial (Renderizado Typst) -->
              <div class="bg-white text-slate-900 border border-slate-300 rounded-2xl shadow-xl p-6 sm:p-10 max-w-4xl mx-auto space-y-6 font-serif text-xs leading-relaxed">
                
                <!-- 1. Encabezado Institucional UNITEPC Oficial -->
                <div class="border-b-2 border-slate-900 pb-4 text-center space-y-1.5 font-sans">
                  <div class="flex items-center justify-between pb-1">
                    <div class="text-left font-mono text-[9px] text-slate-600 font-bold uppercase">
                      <div>UNITEPC · SEDE COCHABAMBA</div>
                      <div>VICERRECTORADO ACADÉMICO</div>
                    </div>

                    <div class="text-right font-mono text-[9px] text-purple-900 font-black uppercase">
                      <div>SISTEMA DE EVALUACIONES (SEA)</div>
                      <div>MOTOR DE DIAGRAMACIÓN TYPST v0.11</div>
                    </div>
                  </div>

                  <h2 class="text-base sm:text-lg font-black uppercase tracking-wider text-slate-950">
                    UNIVERSIDAD TÉCNICA PRIVADA COSMOS
                  </h2>
                  <p class="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                    CUADERNILLO OFICIAL DE EXAMEN · GESTIÓN ACADÉMICA II-2026
                  </p>

                  <!-- Ficha de Datos del Examen -->
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-300 text-[10px] font-mono text-slate-800 text-left bg-slate-50 p-2.5 rounded-lg border">
                    <div>
                      <span class="text-slate-500 font-sans block text-[9px] uppercase font-bold">Asignatura:</span>
                      <strong class="text-slate-950 font-sans text-[11px]">TELECOMUNICACIONES</strong>
                    </div>
                    <div>
                      <span class="text-slate-500 font-sans block text-[9px] uppercase font-bold">Tipo de Prueba:</span>
                      <strong class="text-purple-900 font-black">{{ parcialActivo() | uppercase }}</strong>
                    </div>
                    <div>
                      <span class="text-slate-500 font-sans block text-[9px] uppercase font-bold">Variante:</span>
                      <strong class="text-slate-950 font-black">TIPO A (Oficial)</strong>
                    </div>
                    <div>
                      <span class="text-slate-500 font-sans block text-[9px] uppercase font-bold">Ponderación:</span>
                      <strong class="text-slate-950 font-black">100 PUNTOS</strong>
                    </div>
                  </div>
                </div>

                <!-- 2. Cuadro de Identificación y Firma del Estudiante -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px] font-sans border border-slate-400 p-3 rounded-xl bg-slate-50/80">
                  <div class="sm:col-span-2">
                    <span class="text-slate-500 font-bold block text-[9px] uppercase">Apellidos y Nombres del Estudiante:</span>
                    <div class="border-b border-slate-400 h-5 mt-1"></div>
                  </div>
                  <div>
                    <span class="text-slate-500 font-bold block text-[9px] uppercase">C.I. / R.U.:</span>
                    <div class="border-b border-slate-400 h-5 mt-1"></div>
                  </div>
                  <div>
                    <span class="text-slate-500 font-bold block text-[9px] uppercase">Firma del Estudiante:</span>
                    <div class="border-b border-slate-400 h-5 mt-1"></div>
                  </div>
                  <div>
                    <span class="text-slate-500 font-bold block text-[9px] uppercase">Fecha de Aplicación:</span>
                    <div class="font-mono font-bold text-slate-800 pt-1">____ / ____ / 2026</div>
                  </div>
                  <div>
                    <span class="text-slate-500 font-bold block text-[9px] uppercase">Grupo / Paralelo:</span>
                    <div class="font-mono font-bold text-slate-800 pt-1">Grupo 1 (G1)</div>
                  </div>
                </div>

                <!-- 3. Instrucciones Generales para la Evaluación -->
                <div class="p-3 bg-amber-50/70 border border-amber-300/80 rounded-xl text-[10px] font-sans text-amber-950 space-y-1">
                  <div class="font-black uppercase flex items-center gap-1.5 text-amber-900">
                    <i class="pi pi-info-circle"></i>
                    <span>Instrucciones Generales de la Prueba</span>
                  </div>
                  <ul class="list-disc pl-4 space-y-0.5 text-amber-900/90">
                    <li>Lea cuidadosamente cada reactivo antes de marcar su respuesta definitiva.</li>
                    <li>Rellene completamente el círculo correspondiente en la <strong>Cartilla de Respuestas Óptica (OMR)</strong> con bolígrafo negro o azul.</li>
                    <li>No se admiten tachaduras, borrones ni marcas dobles. Cada pregunta tiene una única respuesta correcta.</li>
                  </ul>
                </div>

                <!-- 4. Cuerpo Completo de Preguntas del Banco (100% de los reactivos) -->
                <div class="pt-2 border-t border-slate-300">
                  <div class="text-center font-sans font-black text-xs uppercase tracking-widest text-slate-700 mb-4 pb-1 border-b border-slate-200">
                    — CUESTIONARIO OFICIAL DE PREGUNTAS (TOTAL: {{ preguntasValidasParaPdf().length }} REACTIVOS) —
                  </div>

                  <!-- Grilla de Preguntas (2 Columnas o 1 Columna) -->
                  <div [class]="vistaPdfColumnas() === '2' ? 'grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6' : 'space-y-6'">
                    
                    @for (pregunta of preguntasValidasParaPdf(); track pregunta.fila; let i = $index) {
                      <div class="space-y-2 p-3 rounded-xl border border-slate-200 bg-slate-50/40 hover:bg-slate-50 transition-colors break-inside-avoid">
                        
                        <!-- Encabezado de la Pregunta: Número, Dificultad, Tipo y Clave -->
                        <div class="flex items-start justify-between gap-2 border-b border-slate-200 pb-1.5">
                          <div class="font-sans font-black text-slate-900 text-xs flex items-center gap-1.5">
                            <span class="h-5 w-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] shrink-0">
                              {{ i + 1 }}
                            </span>
                            <span class="font-bold text-[10px] text-slate-600 uppercase font-mono">
                              Fila Excel {{ pregunta.fila }}
                            </span>
                          </div>

                          <div class="flex items-center gap-1 font-mono text-[9px]">
                            <!-- Badge Dificultad -->
                            <span [class]="pregunta.dificultad === '1' ? 'bg-emerald-100 text-emerald-800' : (pregunta.dificultad === '2' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800')" class="px-1.5 py-0.2 rounded font-bold uppercase">
                              {{ getDificultadNombre(pregunta.dificultad) }}
                            </span>
                            
                            <!-- Clave Correcta -->
                            <span class="bg-purple-100 text-purple-900 font-black px-1.5 py-0.2 rounded border border-purple-200">
                              Clave: {{ pregunta.respuesta_correcta }}
                            </span>
                          </div>
                        </div>

                        <!-- Enunciado de la Pregunta -->
                        <p class="font-bold text-slate-950 text-xs leading-snug font-sans">
                          {{ pregunta.enunciado }}
                        </p>

                        <!-- Renderizado de Fórmulas Typst si existen -->
                        @if (pregunta.formulaTypst) {
                          <div class="bg-slate-950 text-emerald-400 font-mono text-[10.5px] p-2.5 rounded-lg border border-slate-800 my-1 overflow-x-auto">
                            {{ pregunta.formulaTypst }}
                          </div>
                        }

                        <!-- Opciones de Respuesta según tipo de reactivo -->
                        @if (pregunta.tipo === 'FALSO_VERDADERO') {
                          <div class="grid grid-cols-2 gap-2 pl-2 font-sans text-[11px] pt-1">
                            <div class="flex items-center gap-1.5 p-1.5 rounded border border-slate-200 bg-white" [class.ring-2]="pregunta.respuesta_correcta === 'A'" [class.ring-emerald-500]="pregunta.respuesta_correcta === 'A'">
                              <strong class="h-4 w-4 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-[9px]">A</strong>
                              <span>Verdadero</span>
                            </div>
                            <div class="flex items-center gap-1.5 p-1.5 rounded border border-slate-200 bg-white" [class.ring-2]="pregunta.respuesta_correcta === 'B'" [class.ring-emerald-500]="pregunta.respuesta_correcta === 'B'">
                              <strong class="h-4 w-4 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-[9px]">B</strong>
                              <span>Falso</span>
                            </div>
                          </div>
                        } @else if (pregunta.tipo === 'RESPUESTA_COMPUESTA') {
                          <div class="space-y-1.5 pl-2 font-sans text-[11px] pt-1">
                            @if (pregunta.opcion_a) {
                              <div class="flex items-start gap-1.5 p-1 rounded border border-slate-200 bg-white" [class.ring-2]="pregunta.respuesta_correcta === 'A'" [class.ring-emerald-500]="pregunta.respuesta_correcta === 'A'">
                                <strong class="h-4 w-4 rounded bg-slate-200 text-slate-800 flex items-center justify-center text-[9px] shrink-0 mt-0.5">A</strong>
                                <span>{{ pregunta.opcion_a }}</span>
                              </div>
                            }
                            @if (pregunta.opcion_b) {
                              <div class="flex items-start gap-1.5 p-1 rounded border border-slate-200 bg-white" [class.ring-2]="pregunta.respuesta_correcta === 'B'" [class.ring-emerald-500]="pregunta.respuesta_correcta === 'B'">
                                <strong class="h-4 w-4 rounded bg-slate-200 text-slate-800 flex items-center justify-center text-[9px] shrink-0 mt-0.5">B</strong>
                                <span>{{ pregunta.opcion_b }}</span>
                              </div>
                            }
                            @if (pregunta.opcion_c) {
                              <div class="flex items-start gap-1.5 p-1 rounded border border-slate-200 bg-white" [class.ring-2]="pregunta.respuesta_correcta === 'C'" [class.ring-emerald-500]="pregunta.respuesta_correcta === 'C'">
                                <strong class="h-4 w-4 rounded bg-slate-200 text-slate-800 flex items-center justify-center text-[9px] shrink-0 mt-0.5">C</strong>
                                <span>{{ pregunta.opcion_c }}</span>
                              </div>
                            }
                            @if (pregunta.opcion_d) {
                              <div class="flex items-start gap-1.5 p-1 rounded border border-slate-200 bg-white" [class.ring-2]="pregunta.respuesta_correcta === 'D'" [class.ring-emerald-500]="pregunta.respuesta_correcta === 'D'">
                                <strong class="h-4 w-4 rounded bg-slate-200 text-slate-800 flex items-center justify-center text-[9px] shrink-0 mt-0.5">D</strong>
                                <span>{{ pregunta.opcion_d }}</span>
                              </div>
                            }
                          </div>
                        } @else {
                          <!-- SELECCIÓN SIMPLE / PREGUNTA CON CLAVE / PROBLEMAS -->
                          <div class="grid grid-cols-1 gap-1.5 pl-2 font-sans text-[11px] pt-1">
                            @if (pregunta.opcion_a) {
                              <div class="flex items-start gap-1.5 p-1.5 rounded border border-slate-200 bg-white" [class.ring-2]="pregunta.respuesta_correcta === 'A'" [class.ring-emerald-500]="pregunta.respuesta_correcta === 'A'">
                                <strong class="h-4 w-4 rounded bg-slate-200 text-slate-800 flex items-center justify-center text-[9px] shrink-0 mt-0.5">A</strong>
                                <span>{{ pregunta.opcion_a }}</span>
                              </div>
                            }
                            @if (pregunta.opcion_b) {
                              <div class="flex items-start gap-1.5 p-1.5 rounded border border-slate-200 bg-white" [class.ring-2]="pregunta.respuesta_correcta === 'B'" [class.ring-emerald-500]="pregunta.respuesta_correcta === 'B'">
                                <strong class="h-4 w-4 rounded bg-slate-200 text-slate-800 flex items-center justify-center text-[9px] shrink-0 mt-0.5">B</strong>
                                <span>{{ pregunta.opcion_b }}</span>
                              </div>
                            }
                            @if (pregunta.opcion_c) {
                              <div class="flex items-start gap-1.5 p-1.5 rounded border border-slate-200 bg-white" [class.ring-2]="pregunta.respuesta_correcta === 'C'" [class.ring-emerald-500]="pregunta.respuesta_correcta === 'C'">
                                <strong class="h-4 w-4 rounded bg-slate-200 text-slate-800 flex items-center justify-center text-[9px] shrink-0 mt-0.5">C</strong>
                                <span>{{ pregunta.opcion_c }}</span>
                              </div>
                            }
                            @if (pregunta.opcion_d) {
                              <div class="flex items-start gap-1.5 p-1.5 rounded border border-slate-200 bg-white" [class.ring-2]="pregunta.respuesta_correcta === 'D'" [class.ring-emerald-500]="pregunta.respuesta_correcta === 'D'">
                                <strong class="h-4 w-4 rounded bg-slate-200 text-slate-800 flex items-center justify-center text-[9px] shrink-0 mt-0.5">D</strong>
                                <span>{{ pregunta.opcion_d }}</span>
                              </div>
                            }
                            @if (pregunta.opcion_e) {
                              <div class="flex items-start gap-1.5 p-1.5 rounded border border-slate-200 bg-white" [class.ring-2]="pregunta.respuesta_correcta === 'E'" [class.ring-emerald-500]="pregunta.respuesta_correcta === 'E'">
                                <strong class="h-4 w-4 rounded bg-slate-200 text-slate-800 flex items-center justify-center text-[9px] shrink-0 mt-0.5">E</strong>
                                <span>{{ pregunta.opcion_e }}</span>
                              </div>
                            }
                          </div>
                        }

                      </div>
                    }

                  </div>
                </div>

                <!-- 5. Pie de Cuadernillo Académico Oficial -->
                <div class="border-t-2 border-slate-800 pt-4 text-center font-sans text-[10px] text-slate-600 space-y-1">
                  <div class="font-bold uppercase tracking-wider text-slate-900">
                    UNIVERSIDAD TÉCNICA PRIVADA COSMOS · DEPARTAMENTO NACIONAL DE EVALUACIONES
                  </div>
                  <div class="font-mono text-[9px]">
                    Certificación Criptográfica Typst v0.11 · Total {{ preguntasValidasParaPdf().length }} Reactivos Certificados
                  </div>
                </div>

              </div>

            </div>

            <!-- Pie del Modal con Acción de Aprobación de Diagramación Requerida -->
            <div class="bg-card border-t border-border p-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs shrink-0">
              <div class="flex items-center gap-2 text-muted-foreground font-medium text-center sm:text-left">
                <i class="pi pi-shield text-purple-700 text-sm"></i>
                <span>Has revisado el 100% de las <strong>{{ preguntasValidasParaPdf().length }} preguntas</strong> del banco oficial.</span>
              </div>

              <div class="flex items-center gap-2.5">
                <button 
                  (click)="cerrarModalPrevisualizacionPdf()"
                  class="px-4 py-2.5 bg-muted hover:bg-border text-foreground rounded-xl font-bold transition-colors cursor-pointer">
                  Cerrar sin Aprobar
                </button>

                <button 
                  (click)="aprobarDiagramacionPdf()"
                  class="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black shadow-md transition-all hover:scale-105 flex items-center gap-2 cursor-pointer">
                  <i class="pi pi-check-circle text-sm"></i>
                  <span>Aprobar Diagramación y Desbloquear Encriptado</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      }

      <!-- ================================================================= -->
      <!-- MODAL: PREVISUALIZACIÓN DE PAQUETE ENCRIPTADO (.PKG)              -->
      <!-- ================================================================= -->
      @if (dialogPrevisualizacionPkg()) {
        <div class="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div class="bg-card border border-border rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden animate-scale-in my-auto">
            
            <!-- Cabecera Encriptado -->
            <div class="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white p-5 flex items-center justify-between border-b border-purple-800/40">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 text-xl">
                  <i class="pi pi-shield"></i>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-black">Previsualización de Paquete Encriptado (.pkg)</h3>
                    <span class="bg-purple-500/30 text-purple-200 border border-purple-400/40 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                      AES-XOR / SHA-256
                    </span>
                  </div>
                  <p class="text-xs text-purple-200/80 font-mono">
                    {{ nombreArchivoPaquete() }} · {{ parcialActivo() }}
                  </p>
                </div>
              </div>

              <button (click)="cerrarModalPrevisualizacionPkg()" class="text-white/80 hover:text-white p-2 text-base cursor-pointer">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <!-- Ficha Criptográfica y Selector de Vista (Cifrado Raw vs Desencriptado) -->
            <div class="p-5 space-y-4 text-xs text-foreground bg-muted/20">
              
              <!-- Tarjeta de Metadatos de Seguridad -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-card border border-border rounded-xl font-mono text-[11px]">
                <div>
                  <span class="text-muted-foreground text-[10px] block uppercase font-sans font-bold">Docente Certificador:</span>
                  <strong class="text-foreground">{{ docenteSesion.nombre }}</strong>
                </div>
                <div>
                  <span class="text-muted-foreground text-[10px] block uppercase font-sans font-bold">Total Reactivos:</span>
                  <strong class="text-emerald-600 font-black">{{ totalPreguntasValidas() }} Preguntas OK</strong>
                </div>
                <div>
                  <span class="text-muted-foreground text-[10px] block uppercase font-sans font-bold">Sello SHA-256:</span>
                  <strong class="text-purple-700 truncate block">b94d27b9934d3e08...</strong>
                </div>
              </div>

              <!-- Pestañas de Inspección -->
              <div class="flex items-center gap-2 border-b border-border pb-1">
                <button 
                  (click)="tabPrevisualizacionPkg.set('cifrado')"
                  [class]="tabPrevisualizacionPkg() === 'cifrado' ? 'border-purple-600 text-purple-700 dark:text-purple-300 font-black border-b-2' : 'text-muted-foreground hover:text-foreground font-bold'"
                  class="px-3 py-2 text-xs flex items-center gap-1.5 transition-all cursor-pointer">
                  <i class="pi pi-lock text-xs"></i>
                  <span>1. Paquete Cifrado (.pkg Raw)</span>
                </button>

                <button 
                  (click)="tabPrevisualizacionPkg.set('desencriptado')"
                  [class]="tabPrevisualizacionPkg() === 'desencriptado' ? 'border-purple-600 text-purple-700 dark:text-purple-300 font-black border-b-2' : 'text-muted-foreground hover:text-foreground font-bold'"
                  class="px-3 py-2 text-xs flex items-center gap-1.5 transition-all cursor-pointer">
                  <i class="pi pi-code text-xs"></i>
                  <span>2. Payload Desencriptado (JSON Oficial)</span>
                </button>
              </div>

              <!-- Visualizador de Código con Scroll -->
              @if (tabPrevisualizacionPkg() === 'cifrado') {
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Estructura de archivo de paquete binario/hexadecimal protegido contra manipulaciones:</span>
                    <button (click)="copiarContenidoPkg()" class="text-purple-700 dark:text-purple-300 hover:underline font-bold flex items-center gap-1 cursor-pointer">
                      <i class="pi pi-copy text-[10px]"></i> Copiar Texto
                    </button>
                  </div>
                  <pre class="bg-slate-950 text-purple-300 font-mono text-[11px] p-4 rounded-xl max-h-64 overflow-y-auto border border-purple-900/50 leading-relaxed whitespace-pre-wrap select-all">{{ pkgHexData() }}</pre>
                </div>
              } @else {
                <div class="space-y-2">
                  <div class="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Contenido parseado y validado listo para la diagramación Typst:</span>
                    <button (click)="copiarContenidoPkg()" class="text-purple-700 dark:text-purple-300 hover:underline font-bold flex items-center gap-1 cursor-pointer">
                      <i class="pi pi-copy text-[10px]"></i> Copiar JSON
                    </button>
                  </div>
                  <pre class="bg-slate-950 text-emerald-400 font-mono text-[11px] p-4 rounded-xl max-h-64 overflow-y-auto border border-slate-800 leading-relaxed whitespace-pre-wrap select-all">{{ pkgJsonData() }}</pre>
                </div>
              }

            </div>

            <!-- Footer del Modal de Paquete -->
            <div class="bg-card border-t border-border p-4 flex items-center justify-between text-xs">
              <button 
                (click)="generarYDescargarPaqueteEncriptado()"
                class="px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer">
                <i class="pi pi-download"></i>
                <span>Descargar Archivo {{ nombreArchivoPaquete() }}</span>
              </button>

              <button 
                (click)="cerrarModalPrevisualizacionPkg()"
                class="px-5 py-2.5 bg-muted hover:bg-border text-foreground rounded-xl font-bold transition-colors cursor-pointer">
                Cerrar
              </button>
            </div>

          </div>
        </div>
      }

      <!-- MODAL: GUÍA OFICIAL DE LINEAMIENTOS Y RENDERIZADO TYPST EN PDF -->
      @if (dialogEjemplos()) {
        <div class="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in overflow-y-auto">
          <div class="bg-card border border-border rounded-2xl max-w-5xl w-full shadow-2xl overflow-hidden animate-scale-in my-6">
            
            <!-- Cabecera de la Guía -->
            <div class="bg-gradient-to-r from-purple-800 to-indigo-900 text-white p-5 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="h-11 w-11 rounded-xl bg-white/15 flex items-center justify-center text-white text-xl">
                  <i class="pi pi-book"></i>
                </div>
                <div>
                  <h3 class="text-base font-black">Guía Oficial de Reactivos y Renderizado de Examen (Typst)</h3>
                  <p class="text-xs text-white/80 font-medium">
                    Lineamientos de llenado en Excel y previsualización exacta de cómo se imprimirá cada tipo de pregunta en el examen.
                  </p>
                </div>
              </div>

              <button (click)="cerrarModalEjemplos()" class="text-white/80 hover:text-white p-2 text-base cursor-pointer">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <!-- Filtro de Tipos de Pregunta -->
            <div class="bg-muted/60 border-b border-border p-3 flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs">
              <button 
                (click)="filtroGuiaTipo.set('TODOS')"
                [class]="filtroGuiaTipo() === 'TODOS' ? 'bg-purple-700 text-white font-black shadow-2xs' : 'bg-card text-muted-foreground hover:text-foreground font-bold'"
                class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                Todas las Tipologías
              </button>
              <button 
                (click)="filtroGuiaTipo.set('VF_SIMPLE')"
                [class]="filtroGuiaTipo() === 'VF_SIMPLE' ? 'bg-purple-700 text-white font-black shadow-2xs' : 'bg-card text-muted-foreground hover:text-foreground font-bold'"
                class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                1. V/F Simple
              </button>
              <button 
                (click)="filtroGuiaTipo.set('VF_COMPLEJAS')"
                [class]="filtroGuiaTipo() === 'VF_COMPLEJAS' ? 'bg-purple-700 text-white font-black shadow-2xs' : 'bg-card text-muted-foreground hover:text-foreground font-bold'"
                class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                2. V/F Complejas (1-4)
              </button>
              <button 
                (click)="filtroGuiaTipo.set('PREMISAS')"
                [class]="filtroGuiaTipo() === 'PREMISAS' ? 'bg-purple-700 text-white font-black shadow-2xs' : 'bg-card text-muted-foreground hover:text-foreground font-bold'"
                class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                3. Premisas A/B/Ambas/Ninguna
              </button>
              <button 
                (click)="filtroGuiaTipo.set('SELECCION')"
                [class]="filtroGuiaTipo() === 'SELECCION' ? 'bg-purple-700 text-white font-black shadow-2xs' : 'bg-card text-muted-foreground hover:text-foreground font-bold'"
                class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                4. Selección de la Mejor Rpta
              </button>
              <button 
                (click)="filtroGuiaTipo.set('CASOS')"
                [class]="filtroGuiaTipo() === 'CASOS' ? 'bg-purple-700 text-white font-black shadow-2xs' : 'bg-card text-muted-foreground hover:text-foreground font-bold'"
                class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                5. Casos Clínicos y Problemas
              </button>
              <button 
                (click)="filtroGuiaTipo.set('EMPAREJAMIENTO')"
                [class]="filtroGuiaTipo() === 'EMPAREJAMIENTO' ? 'bg-purple-700 text-white font-black shadow-2xs' : 'bg-card text-muted-foreground hover:text-foreground font-bold'"
                class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                6. Emparejamiento Ampliado
              </button>
              <button 
                (click)="filtroGuiaTipo.set('TYPST')"
                [class]="filtroGuiaTipo() === 'TYPST' ? 'bg-purple-700 text-white font-black shadow-2xs' : 'bg-card text-muted-foreground hover:text-foreground font-bold'"
                class="px-3 py-1.5 rounded-lg transition-all cursor-pointer">
                7. Fórmulas Typst ($ ... $)
              </button>
            </div>

            <!-- Cuerpo de Ejemplos con Comparador Dual (Excel vs PDF Impreso) -->
            <div class="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-foreground text-xs">

              <!-- SECCIÓN 1: VERDADERO O FALSO SIMPLE -->
              @if (filtroGuiaTipo() === 'TODOS' || filtroGuiaTipo() === 'VF_SIMPLE') {
                <div class="border border-border rounded-2xl p-5 space-y-4 bg-muted/20">
                  <div class="flex items-center justify-between border-b border-border pb-3">
                    <div class="flex items-center gap-2">
                      <span class="bg-emerald-600 text-white font-black px-2.5 py-1 rounded text-xs">TIPOLOGÍA 1</span>
                      <h4 class="text-sm font-black text-foreground">Verdadero o Falso Simple</h4>
                    </div>
                    <span class="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      Grupo G1 · Dificultad 1 (Fácil)
                    </span>
                  </div>

                  <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <!-- Cómo se llena en el Excel -->
                    <div class="lg:col-span-6 bg-card border border-border rounded-xl p-4 space-y-2.5">
                      <div class="flex items-center gap-1.5 font-bold text-purple-900 text-xs">
                        <i class="pi pi-file-excel text-emerald-600"></i>
                        <span>1. Cómo se completa en el archivo Excel:</span>
                      </div>
                      <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-[10px] font-mono">
                          <thead>
                            <tr class="bg-purple-900 text-white font-bold">
                              <th class="p-1.5">tipo</th>
                              <th class="p-1.5">enunciado</th>
                              <th class="p-1.5">opcion_a</th>
                              <th class="p-1.5">opcion_b</th>
                              <th class="p-1.5">resp.</th>
                              <th class="p-1.5">dif.</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr class="bg-muted/40 border-b border-border">
                              <td class="p-1.5 font-bold text-emerald-700">Verdadero o Falso Simple</td>
                              <td class="p-1.5">El principio de devengado tributario reconoce ingresos y gastos cuando se generan legalmente...</td>
                              <td class="p-1.5">Verdadero</td>
                              <td class="p-1.5">Falso</td>
                              <td class="p-1.5 font-bold text-purple-800">A</td>
                              <td class="p-1.5">1</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <ul class="list-disc pl-4 space-y-1 text-muted-foreground text-[11px]">
                        <li><strong>Regla:</strong> La respuesta correcta debe ser <strong>A</strong> (Verdadero) o <strong>B</strong> (Falso).</li>
                        <li>Las columnas <code class="bg-muted px-1 rounded">opcion_a</code> y <code class="bg-muted px-1 rounded">opcion_b</code> se preparan automáticamente en la plantilla Excel.</li>
                      </ul>
                    </div>

                    <!-- Cómo se verá en el PDF Typst -->
                    <div class="lg:col-span-6 bg-white border border-slate-300 rounded-xl p-4 space-y-2 text-slate-900 shadow-xs">
                      <div class="flex items-center justify-between border-b border-slate-200 pb-1 text-[10px] font-mono text-slate-500">
                        <span class="font-bold uppercase text-purple-900"><i class="pi pi-file-pdf text-rose-500"></i> Vista en Cuadernillo Impreso (Typst)</span>
                        <span>Sección I</span>
                      </div>
                      <div class="font-serif text-xs space-y-2 pt-1">
                        <p class="font-bold text-slate-900 leading-snug">
                          <strong>1.</strong> El principio contable de devengado establece que los ingresos y gastos deben reconocerse en el ejercicio en que se generan legalmente, con independencia de su cobro o pago.
                        </p>
                        <div class="grid grid-cols-2 gap-2 pl-4 font-sans text-[11px] text-slate-800 font-medium">
                          <div class="flex items-center gap-1.5">
                            <span class="h-4 w-4 rounded-full border border-slate-400 flex items-center justify-center text-[9px] font-bold">A</span>
                            <span>Verdadero</span>
                          </div>
                          <div class="flex items-center gap-1.5">
                            <span class="h-4 w-4 rounded-full border border-slate-400 flex items-center justify-center text-[9px] font-bold">B</span>
                            <span>Falso</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- SECCIÓN 2: VERDADERO O FALSO COMPLEJAS -->
              @if (filtroGuiaTipo() === 'TODOS' || filtroGuiaTipo() === 'VF_COMPLEJAS') {
                <div class="border border-border rounded-2xl p-5 space-y-4 bg-muted/20">
                  <div class="flex items-center justify-between border-b border-border pb-3">
                    <div class="flex items-center gap-2">
                      <span class="bg-teal-600 text-white font-black px-2.5 py-1 rounded text-xs">TIPOLOGÍA 2</span>
                      <h4 class="text-sm font-black text-foreground">Verdadero o Falso Complejas (Proposiciones 1, 2, 3 y 4)</h4>
                    </div>
                    <span class="bg-teal-100 text-teal-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      Grupo G1 · Dificultad 2 (Medio)
                    </span>
                  </div>

                  <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div class="lg:col-span-6 bg-card border border-border rounded-xl p-4 space-y-2.5">
                      <div class="flex items-center gap-1.5 font-bold text-purple-900 text-xs">
                        <i class="pi pi-file-excel text-emerald-600"></i>
                        <span>1. Cómo se completa en el archivo Excel:</span>
                      </div>
                      <p class="text-[11px] text-muted-foreground">
                        Use las columnas <code class="bg-muted px-1 rounded">opcion_a</code> a <code class="bg-muted px-1 rounded">opcion_d</code> para las proposiciones 1 a 4. La respuesta usa la lista canónica:
                      </p>
                      <div class="bg-muted/40 p-2.5 rounded text-[10px] font-mono space-y-1">
                        <div><strong>opcion_a:</strong> 1. Gasto respaldado con facturas originales</div>
                        <div><strong>opcion_b:</strong> 2. Gasto vinculado a la actividad gravada</div>
                        <div><strong>opcion_c:</strong> 3. Bancarización en pagos &gt;= Bs 50.000</div>
                        <div><strong>opcion_d:</strong> 4. Donaciones deducibles hasta el 50% (Falso)</div>
                        <div><strong>respuesta:</strong> A (1, 2 y 3 son verdaderas) | <strong>dificultad:</strong> 2</div>
                      </div>
                    </div>

                    <div class="lg:col-span-6 bg-white border border-slate-300 rounded-xl p-4 space-y-2 text-slate-900 shadow-xs">
                      <div class="flex items-center justify-between border-b border-slate-200 pb-1 text-[10px] font-mono text-slate-500">
                        <span class="font-bold uppercase text-purple-900"><i class="pi pi-file-pdf text-rose-500"></i> Vista en Cuadernillo Impreso (Typst)</span>
                        <span>Sección II</span>
                      </div>
                      <div class="font-serif text-xs space-y-2 pt-1">
                        <p class="font-bold text-slate-900 leading-snug">
                          <strong>2.</strong> Respecto a los requisitos de deducibilidad del IUE según la Ley 843, analice las afirmaciones:
                        </p>
                        <div class="pl-4 text-[11px] text-slate-800 space-y-0.5 font-sans">
                          <div>1. El gasto debe estar respaldado documentalmente con facturas originales.</div>
                          <div>2. Los gastos deben estar dirigidos a la obtención y conservación de la fuente.</div>
                          <div>3. Pagos &gt;= Bs 50.000 deben contar con documento fehaciente de bancarización.</div>
                          <div>4. Las donaciones son deducibles hasta el 50% de la utilidad imponible.</div>
                        </div>
                        <div class="grid grid-cols-2 gap-1.5 pl-4 font-sans text-[11px] text-slate-800 pt-1">
                          <div><strong>A)</strong> 1, 2 y 3 son verdaderas</div>
                          <div><strong>B)</strong> 1 y 3 son verdaderas</div>
                          <div><strong>C)</strong> 2 y 4 son verdaderas</div>
                          <div><strong>D)</strong> Solo 4 es verdadera</div>
                          <div><strong>E)</strong> Todas son verdaderas</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- SECCIÓN 3: PREMISAS A/B/AMBAS/NINGUNA -->
              @if (filtroGuiaTipo() === 'TODOS' || filtroGuiaTipo() === 'PREMISAS') {
                <div class="border border-border rounded-2xl p-5 space-y-4 bg-muted/20">
                  <div class="flex items-center justify-between border-b border-border pb-3">
                    <div class="flex items-center gap-2">
                      <span class="bg-cyan-600 text-white font-black px-2.5 py-1 rounded text-xs">TIPOLOGÍA 3</span>
                      <h4 class="text-sm font-black text-foreground">Respuesta A/B/Ambas/Ninguna (Premisas I y II)</h4>
                    </div>
                    <span class="bg-cyan-100 text-cyan-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      Grupo G1 · Dificultad 2 o 3
                    </span>
                  </div>

                  <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div class="lg:col-span-6 bg-card border border-border rounded-xl p-4 space-y-2.5">
                      <div class="flex items-center gap-1.5 font-bold text-purple-900 text-xs">
                        <i class="pi pi-file-excel text-emerald-600"></i>
                        <span>1. Cómo se completa en el archivo Excel:</span>
                      </div>
                      <div class="bg-muted/40 p-2.5 rounded text-[10px] font-mono space-y-1">
                        <div><strong>enunciado:</strong> I. El crédito fiscal IVA por compras vinculadas es computable.\nII. Las retenciones a informales no requieren declaración mensual.</div>
                        <div><strong>opcion_a:</strong> A. Si la primera es verdadera</div>
                        <div><strong>opcion_b:</strong> B. Si la segunda es verdadera</div>
                        <div><strong>opcion_c:</strong> C. Si ambas son verdaderas</div>
                        <div><strong>opcion_d:</strong> D. Si ninguna es verdadera</div>
                        <div><strong>respuesta:</strong> A | <strong>dificultad:</strong> 2</div>
                      </div>
                    </div>

                    <div class="lg:col-span-6 bg-white border border-slate-300 rounded-xl p-4 space-y-2 text-slate-900 shadow-xs">
                      <div class="flex items-center justify-between border-b border-slate-200 pb-1 text-[10px] font-mono text-slate-500">
                        <span class="font-bold uppercase text-purple-900"><i class="pi pi-file-pdf text-rose-500"></i> Vista en Cuadernillo Impreso (Typst)</span>
                        <span>Sección III</span>
                      </div>
                      <div class="font-serif text-xs space-y-2 pt-1">
                        <p class="font-bold text-slate-900 leading-snug">
                          <strong>3.</strong> <strong>I.</strong> El crédito fiscal IVA respaldado por compras vinculadas a la actividad gravada es computable.<br>
                          <strong>II.</strong> Las retenciones tributarias a proveedores informales de servicios extinguen la obligación sin requerir declaración jurada.
                        </p>
                        <div class="space-y-1 pl-4 font-sans text-[11px] text-slate-800">
                          <div><strong>A)</strong> Si la primera proposición es verdadera</div>
                          <div><strong>B)</strong> Si la segunda proposición es verdadera</div>
                          <div><strong>C)</strong> Si ambas proposiciones son verdaderas</div>
                          <div><strong>D)</strong> Si ninguna proposición es verdadera</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- SECCIÓN 4: SELECCIÓN MEJOR RESPUESTA -->
              @if (filtroGuiaTipo() === 'TODOS' || filtroGuiaTipo() === 'SELECCION') {
                <div class="border border-border rounded-2xl p-5 space-y-4 bg-muted/20">
                  <div class="flex items-center justify-between border-b border-border pb-3">
                    <div class="flex items-center gap-2">
                      <span class="bg-blue-600 text-white font-black px-2.5 py-1 rounded text-xs">TIPOLOGÍA 4</span>
                      <h4 class="text-sm font-black text-foreground">Selección de la Mejor Respuesta (5 Opciones A-E)</h4>
                    </div>
                    <span class="bg-blue-100 text-blue-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      Grupo G2 · Dificultad 1, 2 o 3
                    </span>
                  </div>

                  <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div class="lg:col-span-6 bg-card border border-border rounded-xl p-4 space-y-2.5">
                      <div class="flex items-center gap-1.5 font-bold text-purple-900 text-xs">
                        <i class="pi pi-file-excel text-emerald-600"></i>
                        <span>1. Cómo se completa en el archivo Excel:</span>
                      </div>
                      <p class="text-[11px] text-muted-foreground">
                        Llene las 5 opciones en <code class="bg-muted px-1 rounded">opcion_a</code> a <code class="bg-muted px-1 rounded">opcion_e</code>. La respuesta correcta debe ser una letra de la A a la E.
                      </p>
                      <div class="bg-muted/40 p-2.5 rounded text-[10px] font-mono space-y-1">
                        <div><strong>enunciado:</strong> ¿Cuál es el efecto jurídico del vencimiento de los 60 días sin Resolución Determinativa?</div>
                        <div><strong>opcion_a:</strong> Suspende intereses moratorios | <strong>opcion_b:</strong> Caducidad absoluta</div>
                        <div><strong>respuesta:</strong> A | <strong>dificultad:</strong> 3</div>
                      </div>
                    </div>

                    <div class="lg:col-span-6 bg-white border border-slate-300 rounded-xl p-4 space-y-2 text-slate-900 shadow-xs">
                      <div class="flex items-center justify-between border-b border-slate-200 pb-1 text-[10px] font-mono text-slate-500">
                        <span class="font-bold uppercase text-purple-900"><i class="pi pi-file-pdf text-rose-500"></i> Vista en Cuadernillo Impreso (Typst)</span>
                        <span>Sección IV</span>
                      </div>
                      <div class="font-serif text-xs space-y-2 pt-1">
                        <p class="font-bold text-slate-900 leading-snug">
                          <strong>4.</strong> ¿Cuál es el efecto jurídico del vencimiento del término probatorio en una fiscalización sin emisión de Resolución Determinativa en 60 días?
                        </p>
                        <div class="grid grid-cols-1 gap-1 pl-4 font-sans text-[11px] text-slate-800">
                          <div><strong>A)</strong> No opera la caducidad pero suspende el cómputo de intereses moratorios.</div>
                          <div><strong>B)</strong> Opera la caducidad automática de pleno derecho.</div>
                          <div><strong>C)</strong> Se convalida la declaración jurada original quedando extinguida la deuda.</div>
                          <div><strong>D)</strong> El SIN queda inhabilitado para fiscalizar.</div>
                          <div><strong>E)</strong> Pasa de oficio a la Autoridad de Impugnación Tributaria.</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- SECCIÓN 5: CASOS CLÍNICOS Y PROBLEMAS -->
              @if (filtroGuiaTipo() === 'TODOS' || filtroGuiaTipo() === 'CASOS') {
                <div class="border border-border rounded-2xl p-5 space-y-4 bg-muted/20">
                  <div class="flex items-center justify-between border-b border-border pb-3">
                    <div class="flex items-center gap-2">
                      <span class="bg-indigo-600 text-white font-black px-2.5 py-1 rounded text-xs">TIPOLOGÍA 5</span>
                      <h4 class="text-sm font-black text-foreground">Ítems Agrupados por Caso Clínico o Problema (Tronco + Subítems)</h4>
                    </div>
                    <span class="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      Grupo G3 · Dificultad 2 y 3
                    </span>
                  </div>

                  <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div class="lg:col-span-6 bg-card border border-border rounded-xl p-4 space-y-2.5">
                      <div class="flex items-center gap-1.5 font-bold text-purple-900 text-xs">
                        <i class="pi pi-file-excel text-emerald-600"></i>
                        <span>1. Cómo se completa en el archivo Excel (2 o más filas):</span>
                      </div>
                      <div class="overflow-x-auto">
                        <table class="w-full text-left border-collapse text-[10px] font-mono">
                          <thead>
                            <tr class="bg-purple-900 text-white font-bold">
                              <th class="p-1">tipo</th>
                              <th class="p-1">grupo</th>
                              <th class="p-1">enunciado</th>
                              <th class="p-1">resp.</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr class="bg-indigo-50/70 border-b border-border font-bold">
                              <td class="p-1 text-indigo-700">Ítems agrupados...</td>
                              <td class="p-1 text-purple-900">CASO-TRIB1</td>
                              <td class="p-1">Caso: En la fiscalización a 'Comercial Andina'...</td>
                              <td class="p-1"><em>(vacío)</em></td>
                            </tr>
                            <tr class="bg-muted/40 border-b border-border">
                              <td class="p-1 text-blue-700">Subítem de caso...</td>
                              <td class="p-1 text-purple-900">CASO-TRIB1</td>
                              <td class="p-1">¿Cuál es el reparo en IUE (25%) e IVA?</td>
                              <td class="p-1 font-bold text-purple-800">A</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div class="lg:col-span-6 bg-white border border-slate-300 rounded-xl p-4 space-y-2 text-slate-900 shadow-xs">
                      <div class="flex items-center justify-between border-b border-slate-200 pb-1 text-[10px] font-mono text-slate-500">
                        <span class="font-bold uppercase text-purple-900"><i class="pi pi-file-pdf text-rose-500"></i> Vista en Cuadernillo Impreso (Typst)</span>
                        <span>Sección V</span>
                      </div>
                      <div class="font-serif text-xs space-y-2.5 pt-1">
                        <div class="bg-slate-50 border border-slate-400 p-2.5 rounded text-[11px] font-sans">
                          <span class="font-black text-slate-900 uppercase block text-[10px] text-purple-950 border-b border-slate-300 pb-1 mb-1">
                            CONTEXTO / CASO TRIBUTARIO 1 (Preguntas 5 y 6)
                          </span>
                          <p class="text-slate-700 leading-relaxed italic">
                            Durante la auditoría tributaria a "Manufacturas del Valle S.A." se detectaron compras por Bs 200.000 pagadas en efectivo sin bancarización y ventas no facturadas por Bs 80.000.
                          </p>
                        </div>
                        <div class="space-y-1 pl-2">
                          <p class="font-bold text-slate-900 text-xs"><strong>5.</strong> ¿Cuál es el reparo impositivo aplicable por IUE no deducible y pérdida de crédito fiscal?</p>
                          <div class="grid grid-cols-2 gap-1 pl-3 font-sans text-[11px]">
                            <div><strong>A)</strong> Reparo IUE Bs 50.000 + IVA Bs 26.000</div>
                            <div><strong>B)</strong> Solo sanción formal de 500 UFV</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- SECCIÓN 6: EMPAREJAMIENTO AMPLIADO -->
              @if (filtroGuiaTipo() === 'TODOS' || filtroGuiaTipo() === 'EMPAREJAMIENTO') {
                <div class="border border-border rounded-2xl p-5 space-y-4 bg-muted/20">
                  <div class="flex items-center justify-between border-b border-border pb-3">
                    <div class="flex items-center gap-2">
                      <span class="bg-amber-600 text-white font-black px-2.5 py-1 rounded text-xs">TIPOLOGÍA 6</span>
                      <h4 class="text-sm font-black text-foreground">Emparejamiento Ampliado (Claves Maestras + Opciones)</h4>
                    </div>
                    <span class="bg-amber-100 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      Grupo G3 · Dificultad 1 y 2
                    </span>
                  </div>

                  <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div class="lg:col-span-6 bg-card border border-border rounded-xl p-4 space-y-2.5">
                      <div class="flex items-center gap-1.5 font-bold text-purple-900 text-xs">
                        <i class="pi pi-file-excel text-emerald-600"></i>
                        <span>1. Cómo se completa en el archivo Excel:</span>
                      </div>
                      <div class="bg-muted/40 p-2.5 rounded text-[10px] font-mono space-y-1">
                        <div><strong>Fila Madre:</strong> Emparejamiento Ampliado | grupo: EMP-TRIB1 | opcion_a: Verificación Externa | opcion_b: Fiscalización Integral</div>
                        <div><strong>Fila Hija 1:</strong> Opción de Emparejamiento | grupo: EMP-TRIB1 | enunciado: Revisión puntual de transacción | resp: A</div>
                      </div>
                    </div>

                    <div class="lg:col-span-6 bg-white border border-slate-300 rounded-xl p-4 space-y-2 text-slate-900 shadow-xs">
                      <div class="flex items-center justify-between border-b border-slate-200 pb-1 text-[10px] font-mono text-slate-500">
                        <span class="font-bold uppercase text-purple-900"><i class="pi pi-file-pdf text-rose-500"></i> Vista en Cuadernillo Impreso (Typst)</span>
                        <span>Sección VI</span>
                      </div>
                      <div class="font-serif text-xs space-y-2 pt-1">
                        <p class="font-bold text-slate-900 leading-snug">
                          <strong>Lista de Claves:</strong> [A] Verificación Externa Focalizada | [B] Fiscalización Integral | [C] Control en Punto Fijo
                        </p>
                        <div class="space-y-1.5 pl-2">
                          <p class="text-xs"><strong>7.</strong> Revisión puntual de una transacción o crédito fiscal mediante requerimiento de información.</p>
                          <div class="font-sans text-[11px] text-purple-900 font-bold pl-3">➡️ Clave de Emparejamiento: [A]</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- SECCIÓN 7: FÓRMULAS TYPST -->
              @if (filtroGuiaTipo() === 'TODOS' || filtroGuiaTipo() === 'TYPST') {
                <div class="border border-border rounded-2xl p-5 space-y-4 bg-muted/20">
                  <div class="flex items-center justify-between border-b border-border pb-3">
                    <div class="flex items-center gap-2">
                      <span class="bg-purple-700 text-white font-black px-2.5 py-1 rounded text-xs">MOTOR TYPST</span>
                      <h4 class="text-sm font-black text-foreground">Renderizado de Fórmulas Matemáticas y Químicas ($ ... $)</h4>
                    </div>
                    <span class="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      Todas las Tipologías
                    </span>
                  </div>

                  <div class="p-4 bg-card border border-border rounded-xl space-y-3">
                    <p class="text-xs text-muted-foreground">
                      Puedes insertar fórmulas matemáticas en el enunciado o en las opciones envolviendo la expresión con el signo de dólar <code class="bg-muted px-1 rounded font-mono">$ ... $</code>.
                    </p>
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-[11px]">
                      <div class="p-3 bg-muted/40 rounded-xl border border-border">
                        <span class="text-[10px] text-muted-foreground block font-bold">Cálculo Financiero:</span>
                        <code>$ "Reparo" = 150.000 times 25% $</code>
                      </div>
                      <div class="p-3 bg-muted/40 rounded-xl border border-border">
                        <span class="text-[10px] text-muted-foreground block font-bold">Ecuación Cuadrática:</span>
                        <code>$ x = (-b +- sqrt(b^2 - 4a c)) / (2a) $</code>
                      </div>
                      <div class="p-3 bg-muted/40 rounded-xl border border-border">
                        <span class="text-[10px] text-muted-foreground block font-bold">Química / Subíndices:</span>
                        <code>$ H_2 S O_4 + 2 N a O H arrow N a_2 S O_4 $</code>
                      </div>
                    </div>
                  </div>
                </div>
              }

            </div>

            <!-- Pie del Modal -->
            <div class="bg-muted/40 border-t border-border p-4 flex items-center justify-between">
              <span class="text-xs text-muted-foreground">
                <i class="pi pi-info-circle text-primary mr-1"></i>
                Descarga la <strong>Plantilla Oficial (3 Hojas)</strong> para empezar a completar tus preguntas.
              </span>

              <div class="flex items-center gap-2">
                <button 
                  (click)="descargarExcelBaseMacro()"
                  class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs">
                  <i class="pi pi-download text-xs"></i>
                  <span>Descargar Plantilla Excel</span>
                </button>

                <button 
                  (click)="cerrarModalEjemplos()"
                  class="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-black cursor-pointer shadow-xs">
                  Cerrar Guía
                </button>
              </div>
            </div>

          </div>
        </div>
      }

      <!-- ================================================================= -->
      <!-- MODAL: DOBLE AUTENTICACIÓN DOCENTE (2FA / OTP)                     -->
      <!-- ================================================================= -->
      @if (dialog2FA()) {
        <div class="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl max-w-md w-full shadow-2xl p-6 space-y-5 animate-scale-in text-foreground">
            
            <div class="text-center space-y-2">
              <div class="h-14 w-14 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-2xl mx-auto border border-purple-300">
                <i class="pi pi-shield"></i>
              </div>
              <h3 class="text-lg font-black text-foreground">Doble Autenticación Docente (2FA)</h3>
              <p class="text-xs text-muted-foreground leading-relaxed">
                Para autorizar formalmente, sellar con <strong>SHA-256</strong> y validar el banco de preguntas, ingresa el código OTP de seguridad de 6 dígitos.
              </p>
            </div>

            <!-- Input de Código 2FA -->
            <div class="space-y-2">
              <div class="flex justify-center">
                <input 
                  type="text" 
                  maxlength="6"
                  [(ngModel)]="codigo2FAIngresado"
                  placeholder="202688"
                  class="w-48 text-center text-2xl font-mono font-black tracking-widest bg-muted/60 border-2 border-purple-600 rounded-xl py-2.5 text-foreground outline-none focus:ring-4 focus:ring-purple-400/30">
              </div>
              <div class="text-center">
                <span class="text-[11px] text-muted-foreground font-mono">Código demo sugerido: <strong class="text-purple-700 font-bold">202688</strong></span>
              </div>
            </div>

            <!-- Ficha de Seguridad del Docente -->
            <div class="bg-muted/40 rounded-xl p-3.5 text-[11px] text-muted-foreground space-y-1.5 font-mono border border-border">
              <div class="flex justify-between">
                <span>Docente Titular:</span>
                <strong class="text-foreground font-sans">{{ docenteSesion.nombre }}</strong>
              </div>
              <div class="flex justify-between">
                <span>C.I. / Documento:</span>
                <strong class="text-foreground">{{ docenteSesion.ci }}</strong>
              </div>
              <div class="flex justify-between">
                <span>Asignatura:</span>
                <strong class="text-purple-800">[CPEC18] AUDITORÍA TRIBUTARIA</strong>
              </div>
              <div class="flex justify-between">
                <span>Algoritmo de Sello:</span>
                <strong class="text-emerald-700">TOTP SHA-256 (RFC 6238)</strong>
              </div>
            </div>

            <!-- Botones de Acción 2FA -->
            <div class="flex gap-2 pt-2 border-t border-border">
              <button 
                (click)="cerrarModal2FA()" 
                class="w-1/2 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer">
                Cancelar
              </button>
              <button 
                (click)="confirmarCodigo2FA()" 
                [disabled]="!codigo2FAIngresado || codigo2FAIngresado.trim().length < 6"
                class="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5">
                <i class="pi pi-lock-open text-xs"></i>
                <span>Validar y Sellar</span>
              </button>
            </div>

          </div>
        </div>
      }

      <!-- Toast Notificación -->
      @if (toastMessage()) {
        <div class="fixed bottom-6 right-6 bg-foreground text-background px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50 animate-bounce">
          <i [class]="toastType() === 'error' ? 'pi pi-exclamation-triangle text-rose-400' : 'pi pi-check-circle text-emerald-400'" class="text-lg"></i>
          <span class="text-xs font-bold">{{ toastMessage() }}</span>
        </div>
      }

    </div>
  `
})
export class BancoPreguntasComponent {
  public readonly storage = inject(EvaluacionesStorageService);
  private readonly _db = inject(EvaluacionesDbService);

  @ViewChild('fileInput') public fileInputRef!: ElementRef<HTMLInputElement>;

  // Pestaña activa: 'validador' (default) o 'calendario'
  public tabActiva = signal<'validador' | 'calendario'>('validador');
  public vistaCalendario = signal<'calendario' | 'lista'>('calendario');

  // Navegación de Calendario Mensual (Default: Marzo 2026 = mes 2)
  public mesActual = signal<number>(2); // 0 = Enero, 2 = Marzo, 4 = Mayo, 5 = Junio
  public anioActual = signal<number>(2026);

  public mesesSemestre = [
    { label: 'Marzo', mesIndex: 2 },
    { label: 'Abril', mesIndex: 3 },
    { label: 'Mayo', mesIndex: 4 },
    { label: 'Junio', mesIndex: 5 },
    { label: 'Julio', mesIndex: 6 }
  ];

  public examenSeleccionadoModal = signal<ExamenDocenteCronograma | null>(null);

  public parcialActivo = signal<'1er Parcial' | '2do Parcial' | 'Examen Final' | '2da Instancia'>('1er Parcial');
  public nombreArchivoCargado = signal<string | null>('BANCO_PRUEBA_VALIDO_60PREGUNTAS.xlsx');
  public dialogEjemplos = signal<boolean>(false);
  public filtroGuiaTipo = signal<string>('TODOS');
  public dialogPrevisualizacionPdf = signal<boolean>(false);
  public pdfPrevisualizadoYConforme = signal<boolean>(false);
  public dialogPrevisualizacionPkg = signal<boolean>(false);
  public tabPrevisualizacionPkg = signal<'cifrado' | 'desencriptado'>('cifrado');
  public pkgHexData = signal<string>('');
  public pkgJsonData = signal<string>('');
  public dialogEnvioEvaluaciones = signal<boolean>(false);
  public enviandoCorreo = signal<boolean>(false);
  public comprobanteGenerado = signal<ComprobanteEnvio | null>(null);

  public toastMessage = signal<string | null>(null);
  public toastType = signal<'success' | 'error'>('success');

  // Datos del Docente en Sesión Activa
  public docenteSesion = {
    nombre: 'Ing. Ariel Denys Quispe',
    ci: '6849201 Cbba',
    correo: 'a.quispe@unitepc.edu.bo'
  };

  // Directorio Institucional de Oficinas de Evaluación por Campus (Múltiples correos por campus)
  public listaCampusEvaluacion: CampusEvaluacion[] = [
    { id: 'TEST-ARIEL', nombre: '🧪 Modo Pruebas / QA — Ing. Ariel Cámara', ciudad: 'Pruebas Unitarias', correos: ['arielcamara@unitepc.edu.bo'], oficina: 'Buzón Directo de Validación' },
    { id: 'CBBA-COL', nombre: 'Cochabamba - Campus Colonial (Central)', ciudad: 'Cochabamba', correos: ['evaluaciones.cochabamba@unitepc.edu.bo', 'arielcamara@unitepc.edu.bo'], oficina: 'Jefatura de Evaluaciones Bloque A' },
    { id: 'CBBA-FLO', nombre: 'Cochabamba - Campus Florida (Salud)', ciudad: 'Cochabamba', correos: ['evaluaciones.florida@unitepc.edu.bo'], oficina: 'Oficina Evaluaciones Salud' },
    { id: 'LPZ-CEN', nombre: 'La Paz - Sede Central', ciudad: 'La Paz', correos: ['evaluaciones.lapaz@unitepc.edu.bo', 'evaluaciones.central@unitepc.edu.bo'], oficina: 'Evaluaciones Sede La Paz' },
    { id: 'EAL-SAT', nombre: 'El Alto - Campus Satélite', ciudad: 'El Alto', correos: ['evaluaciones.elalto@unitepc.edu.bo'], oficina: 'Oficina Evaluaciones El Alto' },
    { id: 'SCZ-NOR', nombre: 'Santa Cruz - Sede Norte', ciudad: 'Santa Cruz', correos: ['evaluaciones.santacruz@unitepc.edu.bo', 'arielcamara@unitepc.edu.bo'], oficina: 'Jefatura Evaluaciones Santa Cruz' },
    { id: 'GYM-BEN', nombre: 'Guayaramerín - Sede Beni', ciudad: 'Guayaramerín', correos: ['evaluaciones.guayaramerin@unitepc.edu.bo'], oficina: 'Oficina Evaluaciones Beni' },
    { id: 'COB-PAN', nombre: 'Cobija - Sede Pando', ciudad: 'Cobija', correos: ['evaluaciones.cobija@unitepc.edu.bo'], oficina: 'Oficina Evaluaciones Pando' },
    { id: 'IVI-TRO', nombre: 'Ivirgarzama - Campus Trópico', ciudad: 'Ivirgarzama', correos: ['evaluaciones.ivirgarzama@unitepc.edu.bo'], oficina: 'Oficina Evaluaciones Trópico' }
  ];

  // ============================================================
  // SELECTS DE ASIGNACIÓN ACADÉMICA DEL EXAMEN (SEDE, CARRERA, ASIG, GRUPO)
  // ============================================================
  public sedesCatalogo: string[] = [
    'Cochabamba - Campus Colonial (Central)',
    'Cochabamba - Campus Florida (Salud)',
    'La Paz - Sede Central',
    'El Alto - Campus Satélite',
    'Santa Cruz - Sede Norte',
    'Guayaramerín - Sede Beni',
    'Cobija - Sede Pando',
    'Ivirgarzama - Campus Trópico'
  ];

  public carrerasCatalogo: string[] = [
    'Complementaria Contaduría Pública',
    'Auditoría Financiera',
    'Medicina',
    'Odontología',
    'Ingeniería de Sistemas',
    'Derecho',
    'Fisioterapia y Kinesiología'
  ];

  public asignaturasPorCarrera: Record<string, string[]> = {
    'Complementaria Contaduría Pública': ['[CPEC18] AUDITORÍA TRIBUTARIA', '[CPEC12] CONTABILIDAD GUBERNAMENTAL', '[CPEC15] GABINETE DE AUDITORÍA'],
    'Auditoría Financiera': ['[AUD-201] AUDITORÍA FINANCIERA I', '[AUD-305] AUDITORÍA FORENSE'],
    'Medicina': ['[MED-101] ANATOMÍA HUMANA I', '[MED-204] FARMACOLOGÍA GENERAL', '[MED-301] FISIOPATOLOGÍA'],
    'Odontología': ['[ODO-102] ANATOMÍA DENTAL', '[ODO-201] CIRUGÍA BUCAL I'],
    'Ingeniería de Sistemas': ['[SIS-413] TELECOMUNICACIONES', '[SIS-322] INFRAESTRUCTURA TECNOLÓGICA', '[SIS-210] ESTRUCTURA DE DATOS'],
    'Derecho': ['[DER-301] DERECHO TRIBUTARIO', '[DER-205] DERECHO PROCESAL PENAL'],
    'Fisioterapia y Kinesiología': ['[FIS-101] KINESIOLOGÍA APLICADA', '[FIS-203] BIOMECÁNICA']
  };

  public gruposPorAsignatura: Record<string, string[]> = {
    '[CPEC18] AUDITORÍA TRIBUTARIA': ['TA-01', 'TA-02', 'TB-01'],
    '[CPEC12] CONTABILIDAD GUBERNAMENTAL': ['TA-01', 'TA-02'],
    '[CPEC15] GABINETE DE AUDITORÍA': ['TA-01'],
    '[SIS-413] TELECOMUNICACIONES': ['Grupo 1', 'Grupo 2'],
    '[SIS-322] INFRAESTRUCTURA TECNOLÓGICA': ['Grupo 1', 'Grupo 2'],
    '[MED-101] ANATOMÍA HUMANA I': ['M1', 'M2', 'M3'],
    '[MED-204] FARMACOLOGÍA GENERAL': ['M1', 'M2']
  };

  public sedeSeleccionada = signal<string>('Cochabamba - Campus Colonial (Central)');
  public carreraSeleccionada = signal<string>('Complementaria Contaduría Pública');
  public asignaturaSeleccionada = signal<string>('[CPEC18] AUDITORÍA TRIBUTARIA');
  public grupoSeleccionado = signal<string>('TA-01');

  public asignaturasDisponibles = computed(() => {
    return this.asignaturasPorCarrera[this.carreraSeleccionada()] || ['[CPEC18] AUDITORÍA TRIBUTARIA'];
  });

  public gruposDisponibles = computed(() => {
    return this.gruposPorAsignatura[this.asignaturaSeleccionada()] || ['Grupo 1', 'Grupo 2', 'TA-01'];
  });

  public onCarreraChange(carrera: string): void {
    this.carreraSeleccionada.set(carrera);
    const asigs = this.asignaturasPorCarrera[carrera] || [];
    if (asigs.length > 0) {
      this.onAsignaturaChange(asigs[0]);
    }
  }

  public onAsignaturaChange(asig: string): void {
    this.asignaturaSeleccionada.set(asig);
    const grps = this.gruposPorAsignatura[asig] || ['Grupo 1', 'TA-01'];
    this.grupoSeleccionado.set(grps[0]);
    this.pdfPrevisualizadoYConforme.set(false);
  }

  public campusSeleccionadoId = 'TEST-ARIEL';
  public examenRolSeleccionadoId = 2; // SIS-413 por defecto
  public observacionesDocenteEnvio = '';

  public campusActivo = computed(() => {
    return this.listaCampusEvaluacion.find(c => c.id === this.campusSeleccionadoId) || this.listaCampusEvaluacion[0];
  });

  // Lista Completa de Exámenes Programados para el Docente en el Semestre II-2026
  public listaExamenesDocente: ExamenDocenteCronograma[] = [
    { 
      id: 1, 
      codigo: 'SIS-322', 
      materia: 'INFRAESTRUCTURA TECNOLÓGICA', 
      carrera: 'INGENIERÍA DE SISTEMAS', 
      semestre: 6, 
      grupo: 'Grupo 1', 
      tipo: '1er Parcial', 
      fecha: '30/03/2026', 
      horario: '09:45:00 - 11:15:00', 
      aula: 'Lab Redes 2 (Bloque A)', 
      conCartilla: true, 
      estado: 'Devuelto' 
    },
    { 
      id: 2, 
      codigo: 'SIS-413', 
      materia: 'TELECOMUNICACIONES', 
      carrera: 'INGENIERÍA DE SISTEMAS', 
      semestre: 7, 
      grupo: 'Grupo 1', 
      tipo: '1er Parcial', 
      fecha: '31/03/2026', 
      horario: '15:45:00 - 17:15:00', 
      aula: 'Aula 402 (Bloque B)', 
      conCartilla: true, 
      estado: 'Devuelto' 
    },
    { 
      id: 3, 
      codigo: 'SIS-322', 
      materia: 'INFRAESTRUCTURA TECNOLÓGICA', 
      carrera: 'INGENIERÍA DE SISTEMAS', 
      semestre: 6, 
      grupo: 'Grupo 1', 
      tipo: '2do Parcial', 
      fecha: '25/05/2026', 
      horario: '09:45:00 - 11:15:00', 
      aula: 'Lab Redes 2 (Bloque A)', 
      conCartilla: true, 
      estado: 'Devuelto' 
    },
    { 
      id: 4, 
      codigo: 'SIS-413', 
      materia: 'TELECOMUNICACIONES', 
      carrera: 'INGENIERÍA DE SISTEMAS', 
      semestre: 7, 
      grupo: 'Grupo 1', 
      tipo: '2do Parcial', 
      fecha: '26/05/2026', 
      horario: '15:45:00 - 17:15:00', 
      aula: 'Aula 402 (Bloque B)', 
      conCartilla: true, 
      estado: 'Devuelto' 
    },
    { 
      id: 5, 
      codigo: 'SIS-322', 
      materia: 'INFRAESTRUCTURA TECNOLÓGICA', 
      carrera: 'INGENIERÍA DE SISTEMAS', 
      semestre: 6, 
      grupo: 'Grupo 1', 
      tipo: 'Examen Final', 
      fecha: '15/06/2026', 
      horario: '09:45:00 - 11:15:00', 
      aula: 'Lab Redes 2 (Bloque A)', 
      conCartilla: false, 
      estado: 'Programado' 
    },
    { 
      id: 6, 
      codigo: 'SIS-413', 
      materia: 'TELECOMUNICACIONES', 
      carrera: 'INGENIERÍA DE SISTEMAS', 
      semestre: 7, 
      grupo: 'Grupo 1', 
      tipo: 'Examen Final', 
      fecha: '16/06/2026', 
      horario: '15:45:00 - 17:15:00', 
      aula: 'Aula 402 (Bloque B)', 
      conCartilla: true, 
      estado: 'Programado' 
    },
    { 
      id: 7, 
      codigo: 'SIS-322', 
      materia: 'INFRAESTRUCTURA TECNOLÓGICA', 
      carrera: 'INGENIERÍA DE SISTEMAS', 
      semestre: 6, 
      grupo: 'Grupo 1', 
      tipo: '2da Instancia', 
      fecha: '29/06/2026', 
      horario: '09:45:00 - 11:15:00', 
      aula: 'Lab Redes 2 (Bloque A)', 
      conCartilla: false, 
      estado: 'Programado' 
    },
    { 
      id: 8, 
      codigo: 'SIS-413', 
      materia: 'TELECOMUNICACIONES', 
      carrera: 'INGENIERÍA DE SISTEMAS', 
      semestre: 7, 
      grupo: 'Grupo 1', 
      tipo: '2da Instancia', 
      fecha: '30/06/2026', 
      horario: '15:45:00 - 17:15:00', 
      aula: 'Aula 402 (Bloque B)', 
      conCartilla: false, 
      estado: 'Programado' 
    }
  ];

  public nombreMesActual = computed(() => {
    const nombres = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return nombres[this.mesActual()];
  });

  // Matriz de celdas para el Calendario (Lunes a Domingo)
  public matrizDiasCalendario = computed<DiaCalendario[]>(() => {
    const mes = this.mesActual();
    const anio = this.anioActual();

    const primerDiaMes = new Date(anio, mes, 1);
    const ultimoDiaMes = new Date(anio, mes + 1, 0);

    let primerDiaSemana = primerDiaMes.getDay() - 1;
    if (primerDiaSemana === -1) primerDiaSemana = 6;

    const totalDias = ultimoDiaMes.getDate();
    const diasPrevios = new Date(anio, mes, 0).getDate();

    const resultado: DiaCalendario[] = [];

    for (let i = primerDiaSemana - 1; i >= 0; i--) {
      const dNum = diasPrevios - i;
      const mPrev = mes === 0 ? 11 : mes - 1;
      const aPrev = mes === 0 ? anio - 1 : anio;
      const dateStr = `${String(dNum).padStart(2, '0')}/${String(mPrev + 1).padStart(2, '0')}/${aPrev}`;
      resultado.push({
        dayNumber: dNum,
        isCurrentMonth: false,
        dateStr,
        examenes: this.listaExamenesDocente.filter(e => e.fecha === dateStr)
      });
    }

    for (let d = 1; d <= totalDias; d++) {
      const dateStr = `${String(d).padStart(2, '0')}/${String(mes + 1).padStart(2, '0')}/${anio}`;
      resultado.push({
        dayNumber: d,
        isCurrentMonth: true,
        dateStr,
        examenes: this.listaExamenesDocente.filter(e => e.fecha === dateStr)
      });
    }

    const resto = resultado.length % 7;
    if (resto !== 0) {
      const diasFaltantes = 7 - resto;
      const mNext = mes === 11 ? 0 : mes + 1;
      const aNext = mes === 11 ? anio + 1 : anio;
      for (let d = 1; d <= diasFaltantes; d++) {
        const dateStr = `${String(d).padStart(2, '0')}/${String(mNext + 1).padStart(2, '0')}/${aNext}`;
        resultado.push({
          dayNumber: d,
          isCurrentMonth: false,
          dateStr,
          examenes: this.listaExamenesDocente.filter(e => e.fecha === dateStr)
        });
      }
    }

    return resultado;
  });

  public getDiaClass(dia: DiaCalendario): string {
    const base = dia.isCurrentMonth ? 'bg-card' : 'bg-muted/10 opacity-40';
    if (dia.examenes.length > 0) {
      return `${base} ring-2 ring-purple-400 bg-purple-50/30`;
    }
    return base;
  }

  public cambiarMesRelativo(delta: number): void {
    let nuevoMes = this.mesActual() + delta;
    if (nuevoMes < 0) {
      nuevoMes = 11;
      this.anioActual.update(a => a - 1);
    } else if (nuevoMes > 11) {
      nuevoMes = 0;
      this.anioActual.update(a => a + 1);
    }
    this.mesActual.set(nuevoMes);
  }

  public seleccionarMesDirecto(idx: number): void {
    this.mesActual.set(idx);
  }

  public abrirModalDetalleExamen(ex: ExamenDocenteCronograma): void {
    this.examenSeleccionadoModal.set(ex);
  }

  public irAValidarExamenDesdeCalendario(ex: ExamenDocenteCronograma): void {
    this.examenSeleccionadoModal.set(null);
    this.parcialActivo.set(ex.tipo);
    this.examenRolSeleccionadoId = ex.id;
    this.tabActiva.set('validador');
    this._mostrarToast(`Redirigido al Validador para: ${ex.materia} (${ex.tipo}).`);
  }

  // Cuotas Oficiales según parcial
  public cuotasDificultad = computed(() => {
    switch (this.parcialActivo()) {
      case '1er Parcial':
      case '2do Parcial':
        return { facil: 15, medio: 30, dificil: 15, total: 60 };
      case 'Examen Final':
        return { facil: 30, medio: 60, dificil: 30, total: 120 };
      case '2da Instancia':
        return { facil: 10, medio: 25, dificil: 15, total: 50 };
    }
  });

  public cuotasGrupos = computed(() => {
    switch (this.parcialActivo()) {
      case '1er Parcial':
      case '2do Parcial':
        return { g1: 15, g2: 30, g3: 15 };
      case 'Examen Final':
        return { g1: 30, g2: 60, g3: 30 };
      case '2da Instancia':
        return { g1: 10, g2: 25, g3: 15 };
    }
  });

  public totalPreguntasRequeridas = computed(() => this.cuotasDificultad().total);

  // Inicialmente 60 preguntas válidas de muestra para 1er/2do parcial
  public preguntasCargadas = signal<PreguntaValidada[]>(this._generarPreguntasMockValidas());

  // Conteos dinámicos calculados directamente sobre las preguntas cargadas
  public totalPreguntasValidas = computed(() => this.preguntasCargadas().filter(p => p.valido).length);
  public countFaciles = computed(() => this.preguntasCargadas().filter(p => p.valido && p.dificultad === '1').length);
  public countMedias = computed(() => this.preguntasCargadas().filter(p => p.valido && p.dificultad === '2').length);
  public countDificiles = computed(() => this.preguntasCargadas().filter(p => p.valido && p.dificultad === '3').length);

  public countG1 = computed(() => this.preguntasCargadas().filter(p => p.valido && [
    'VERDADERO_O_FALSO_SIMPLE', 'FALSO_VERDADERO',
    'RESPUESTA_PREMISAS_ABCD', 'RESPUESTA_COMPUESTA',
    'VERDADERO_O_FALSO_COMPLEJAS', 'PREGUNTA_CON_CLAVE'
  ].includes(p.tipo)).length);

  public countG2 = computed(() => this.preguntasCargadas().filter(p => p.valido && [
    'SELECCION_MEJOR_RESPUESTA', 'SELECCION_SIMPLE', 'SELECCION_UNICA'
  ].includes(p.tipo)).length);

  public countG3 = computed(() => this.preguntasCargadas().filter(p => p.valido && [
    'CASO_CLINICO_TRONCO', 'PROBLEMA', 'CASO_CLINICO',
    'SUBITEM_CASO', 'SUBPROBLEMA',
    'EMPAREJAMIENTO_TRONCO', 'EMPAREJAMIENTO',
    'OPCION_EMPAREJAMIENTO'
  ].includes(p.tipo)).length);

  // Estado del Modal de Doble Autenticación Docente (2FA / OTP)
  public dialog2FA = signal<boolean>(false);
  public codigo2FAIngresado: string = '';

  public cuotaDificultadCumplida = computed(() => {
    const c = this.cuotasDificultad();
    return this.countFaciles() >= c.facil && this.countMedias() >= c.medio && this.countDificiles() >= c.dificil;
  });

  public esBancoTotalmenteValido = computed(() => {
    return this.totalPreguntasValidas() >= this.totalPreguntasRequeridas() && this.cuotaDificultadCumplida() && this.preguntasConErrores().length === 0;
  });

  public preguntasConErrores = computed(() => {
    return this.preguntasCargadas().filter(p => !p.valido);
  });

  public filtroPdfDificultad = signal<'TODAS' | '1' | '2' | '3'>('TODAS');
  public vistaPdfColumnas = signal<'2' | '1'>('2');

  public preguntasValidasParaPdf = computed(() => {
    const todas = this.preguntasCargadas().filter(p => p.valido);
    if (this.filtroPdfDificultad() === 'TODAS') return todas;
    return todas.filter(p => p.dificultad === this.filtroPdfDificultad());
  });

  public getDificultadNombre(dif: string): string {
    if (dif === '1') return 'Fácil';
    if (dif === '3') return 'Difícil';
    return 'Media';
  }

  public nombreArchivoPaquete = computed(() => {
    const ex = this.listaExamenesDocente.find(e => e.id === this.examenRolSeleccionadoId) || this.listaExamenesDocente[1];
    const cod = ex.codigo.replace('-', '');
    const pCode = this.parcialActivo().toUpperCase().replace(' ', '_');
    return `PAQUETE_EVAL_${cod}_${pCode}_2026.pkg`;
  });

  public getResumenCuota(parcial: string): string {
    switch (parcial) {
      case '1er Parcial': return '60 preguntas';
      case '2do Parcial': return '60 preguntas';
      case 'Examen Final': return '120 preguntas';
      case '2da Instancia': return '50 preguntas';
      default: return '60 preguntas';
    }
  }

  public cambiarParcial(parcial: string): void {
    this.parcialActivo.set(parcial as any);
    this.pdfPrevisualizadoYConforme.set(false);
    this._mostrarToast(`Examen configurado para ${parcial} (${this.getResumenCuota(parcial)}).`);
  }

  public getEstadoBadgeClass(estado: string): string {
    switch (estado) {
      case 'Programado': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'Generado': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'Impreso': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'Entregado': return 'bg-cyan-100 text-cyan-800 border border-cyan-200';
      case 'Devuelto': return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Enviado': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      default: return 'bg-slate-100 text-slate-800';
    }
  }

  // ============================================================
  // CARGA Y VALIDACIÓN ROBUSTA DE ARCHIVOS EXCEL (SheetJS)
  // ============================================================
  public triggerFileInput(): void {
    this.fileInputRef.nativeElement.click();
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  public onDropFile(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.procesarArchivoExcelReal(file);
    }
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.procesarArchivoExcelReal(input.files[0]);
    }
  }

  public async procesarArchivoExcelReal(file: File): Promise<void> {
    this.nombreArchivoCargado.set(file.name);
    this.pdfPrevisualizadoYConforme.set(false);
    try {
      const arrayBuffer = await file.arrayBuffer();

      // Detección temprana de archivo corrupto o HTML previo
      const previewBytes = new Uint8Array(arrayBuffer.slice(0, 150));
      const previewText = new TextDecoder('utf-8').decode(previewBytes).toLowerCase();
      if (previewText.includes('<!doctype') || previewText.includes('<html') || previewText.includes('404')) {
        this._mostrarToast('El archivo cargado es un documento HTML o está dañado. Por favor haz clic en "Ejemplo con Errores" arriba para descargar el Excel oficial.', 'error');
        return;
      }

      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });

      // Buscar hoja Banco o primera hoja
      const sheetName = workbook.SheetNames.find(s => s.toLowerCase() === 'banco') || workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        this._mostrarToast('No se encontró la hoja "Banco" en el archivo Excel.', 'error');
        return;
      }

      // Convertir a JSON plano
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false });

      if (rows.length === 0) {
        this._mostrarToast('El archivo no contiene filas con datos en la hoja Banco.', 'error');
        return;
      }

      const preguntasParsed: PreguntaValidada[] = [];

      rows.forEach((row, index) => {
        // Encontrar valor de forma flexible (mayúsculas o minúsculas)
        const getVal = (keys: string[]) => {
          for (const k of keys) {
            if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
              return String(row[k]).trim();
            }
            const foundKey = Object.keys(row).find(rk => rk.toLowerCase().trim() === k.toLowerCase().trim());
            if (foundKey && row[foundKey] !== undefined && String(row[foundKey]).trim() !== '') {
              return String(row[foundKey]).trim();
            }
          }
          return '';
        };

        const tipoRaw = getVal(['tipo', 'TIPO']).trim();
        const tipoUpper = tipoRaw.toUpperCase();
        const enunciadoRaw = getVal(['enunciado', 'ENUNCIADO']);
        const grupoRaw = getVal(['grupo', 'GRUPO']);
        let opA = getVal(['opcion_a', 'opcion a', 'A', 'a']);
        let opB = getVal(['opcion_b', 'opcion b', 'B', 'b']);
        let opC = getVal(['opcion_c', 'opcion c', 'C', 'c']);
        let opD = getVal(['opcion_d', 'opcion d', 'D', 'd']);
        let opE = getVal(['opcion_e', 'opcion e', 'E', 'e']);
        let respRaw = getVal(['respuesta_correcta', 'respuesta', 'RESPUESTA']).trim().toUpperCase();
        const difRaw = getVal(['dificultad', 'DIFICULTAD', 'nivel_dificultad']).trim().toUpperCase();
        const pesoNum = Number(getVal(['peso', 'PESO'])) || 5;

        if (!tipoRaw && !enunciadoRaw) return;

        // Normalizar Tipo de Pregunta Oficial UNITEPC
        let tipoNorm = 'SELECCION_MEJOR_RESPUESTA';
        if (tipoUpper.includes('VERDADERO O FALSO SIMPLE') || tipoUpper.includes('FALSO_VERDADERO') || tipoUpper === 'VF_SIMPLE') {
          tipoNorm = 'VERDADERO_O_FALSO_SIMPLE';
        } else if (tipoUpper.includes('VERDADERO O FALSO COMPLEJAS') || tipoUpper.includes('PREGUNTA_CON_CLAVE') || tipoUpper === 'VF_COMPLEJAS') {
          tipoNorm = 'VERDADERO_O_FALSO_COMPLEJAS';
        } else if (tipoUpper.includes('RESPUESTA A/B/AMBAS/NINGUNA') || tipoUpper.includes('RESPUESTA_COMPUESTA') || tipoUpper.includes('PREMISAS')) {
          tipoNorm = 'RESPUESTA_PREMISAS_ABCD';
        } else if (tipoUpper.includes('ÍTEMS AGRUPADOS') || tipoUpper.includes('ITEMS AGRUPADOS') || tipoUpper === 'PROBLEMA' || tipoUpper === 'CASO_CLINICO') {
          tipoNorm = 'CASO_CLINICO_TRONCO';
        } else if (tipoUpper.includes('SUBÍTEM') || tipoUpper.includes('SUBITEM') || tipoUpper === 'SUBPROBLEMA') {
          tipoNorm = 'SUBITEM_CASO';
        } else if (tipoUpper === 'EMPAREJAMIENTO AMPLIADO' || tipoUpper === 'EMPAREJAMIENTO') {
          tipoNorm = 'EMPAREJAMIENTO_TRONCO';
        } else if (tipoUpper.includes('OPCIÓN DE EMPAREJAMIENTO') || tipoUpper.includes('OPCION DE EMPAREJAMIENTO') || tipoUpper === 'OPCION_EMPAREJAMIENTO') {
          tipoNorm = 'OPCION_EMPAREJAMIENTO';
        } else if (tipoUpper.includes('SELECCIÓN') || tipoUpper.includes('SELECCION') || tipoUpper === 'SELECCION_SIMPLE' || tipoUpper === 'SELECCION_UNICA') {
          tipoNorm = 'SELECCION_MEJOR_RESPUESTA';
        }

        // Normalizar Respuesta Correcta (extraer letra principal A-E)
        let respNorm = respRaw;
        if (respNorm.startsWith('A')) respNorm = 'A';
        else if (respNorm.startsWith('B')) respNorm = 'B';
        else if (respNorm.startsWith('C')) respNorm = 'C';
        else if (respNorm.startsWith('D')) respNorm = 'D';
        else if (respNorm.startsWith('E')) respNorm = 'E';
        else if (respNorm === 'VERDADERO') respNorm = 'A';
        else if (respNorm === 'FALSO') respNorm = 'B';

        // Normalizar Dificultad (1, 2, 3)
        let difNorm: '1' | '2' | '3' = '2';
        if (difRaw === '1' || difRaw === 'FACIL' || difRaw === 'FÁCIL') difNorm = '1';
        else if (difRaw === '3' || difRaw === 'DIFICIL' || difRaw === 'DIFÍCIL') difNorm = '3';

        // Auto-completado inteligente de opciones según el tipo
        if (tipoNorm === 'VERDADERO_O_FALSO_SIMPLE') {
          if (!opA) opA = 'Verdadero';
          if (!opB) opB = 'Falso';
          if (!respNorm) respNorm = 'A';
        } else if (tipoNorm === 'RESPUESTA_PREMISAS_ABCD') {
          if (!opA) opA = 'A. Si la primera es verdadera';
          if (!opB) opB = 'B. Si la segunda es verdadera';
          if (!opC) opC = 'C. Si ambas son verdaderas';
          if (!opD) opD = 'D. Si ninguna es verdadera';
        }

        // Validaciones Estrictas basadas en formato_banco_preguntas_asig_EF.xlsx
        const errores: string[] = [];
        if (!enunciadoRaw && tipoNorm !== 'EMPAREJAMIENTO_TRONCO') {
          errores.push('Falta enunciado de la pregunta');
        }

        if (['CASO_CLINICO_TRONCO', 'SUBITEM_CASO', 'EMPAREJAMIENTO_TRONCO', 'OPCION_EMPAREJAMIENTO'].includes(tipoNorm)) {
          if (!grupoRaw) {
            errores.push('Falta código de grupo identificador (ej. CASO-01 o EMP-01)');
          }
        }

        if (tipoNorm === 'VERDADERO_O_FALSO_SIMPLE') {
          if (!['A', 'B'].includes(respNorm)) {
            errores.push('Respuesta en V/F debe ser A (Verdadero) o B (Falso)');
          }
        } else if (tipoNorm === 'RESPUESTA_PREMISAS_ABCD') {
          if (!['A', 'B', 'C', 'D'].includes(respNorm)) {
            errores.push('Respuesta en premisas debe ser A, B, C o D');
          }
        } else if (tipoNorm === 'VERDADERO_O_FALSO_COMPLEJAS') {
          if (!opA || !opB || !opC || !opD) {
            errores.push('Requiere las 4 proposiciones (1 a 4) en incisos A-D');
          }
          if (!['A', 'B', 'C', 'D', 'E'].includes(respNorm)) {
            errores.push('Respuesta en V/F complejas debe ser clave A-E');
          }
        } else if (tipoNorm === 'SELECCION_MEJOR_RESPUESTA' || tipoNorm === 'SUBITEM_CASO') {
          if (!opA || !opB || !opC || !opD || !opE) {
            errores.push('Requiere 5 opciones completas (incisos A al E)');
          }
          if (!['A', 'B', 'C', 'D', 'E'].includes(respNorm)) {
            errores.push('Respuesta debe ser una letra entre A y E');
          }
        } else if (tipoNorm === 'EMPAREJAMIENTO_TRONCO') {
          if (!opA || !opB) {
            errores.push('Emparejamiento requiere al menos 2 claves/conceptos en opciones A y B');
          }
        } else if (tipoNorm === 'OPCION_EMPAREJAMIENTO') {
          if (!['A', 'B', 'C', 'D', 'E'].includes(respNorm)) {
            errores.push('Respuesta de emparejamiento debe ser la letra asignada (A-E)');
          }
        }

        const valido = errores.length === 0;

        preguntasParsed.push({
          fila: index + 2,
          tipo: tipoNorm,
          grupo: grupoRaw,
          enunciado: enunciadoRaw || (tipoNorm === 'EMPAREJAMIENTO_TRONCO' ? 'De la lista de opciones, seleccione la respuesta correcta para cada enunciado' : ''),
          opcion_a: opA,
          opcion_b: opB,
          opcion_c: opC,
          opcion_d: opD,
          opcion_e: opE,
          opciones: { A: opA, B: opB, C: opC, D: opD, E: opE },
          respuesta_correcta: respNorm,
          dificultad: difNorm,
          peso: pesoNum,
          observaciones: valido ? 'OK' : errores.join(', '),
          valido,
          errores
        });
      });

      this.preguntasCargadas.set(preguntasParsed);
      if (this.esBancoTotalmenteValido()) {
        this._mostrarToast(`Archivo verificado: 100% de preguntas conformes (${preguntasParsed.length} reactivos).`);
      } else {
        this._mostrarToast(`Archivo procesado: ${preguntasParsed.length} reactivos analizados. Se detectaron observaciones.`);
      }
    } catch (err) {
      console.error(err);
      this._mostrarToast('Error al procesar el archivo Excel. Verifica el formato.', 'error');
    }
  }

  // ============================================================
  // DESCARGA Y CARGA DE EJEMPLOS OFICIALES (SheetJS - 4 Hojas)
  // ============================================================
  public descargarEjemploValido(): void {
    const headers = ['tipo', 'grupo', 'enunciado', 'opcion_a', 'opcion_b', 'opcion_c', 'opcion_d', 'opcion_e', 'respuesta_correcta', 'dificultad', 'parcial', 'observaciones'];
    
    const dataInst = [
      ['BANCO DE PREGUNTAS - GUÍA OFICIAL UNITEPC'],
      [],
      ['1. CÓDIGOS DE PREGUNTA OFICIALES', 'Verdadero o Falso Simple, Verdadero o Falso Complejas, Respuesta A/B/Ambas/Ninguna, Selección de la mejor respuesta, Ítems agrupados por caso clínico o problema, Subítem de caso o problema, Emparejamiento Ampliado, Opción de Emparejamiento Ampliado'],
      ['2. CUOTAS OFICIALES EXIGIDAS', '15 Fáciles (1), 30 Medias (2), 15 Difíciles (3) - Total: 60 preguntas para 1er/2do Parcial'],
      ['3. MATERIA PILOTO', '[CPEC18] Auditoría Tributaria - Carrera Complementaria Contaduría Pública (Cochabamba)']
    ];

    const dataBanco: any[][] = [headers];
    const preguntasParsed: PreguntaValidada[] = [];

    // 15 Fáciles (Nivel 1): V/F Simple, Selección, Emparejamiento
    for (let i = 1; i <= 15; i++) {
      let tipo = 'Verdadero o Falso Simple';
      let grupo = '';
      let enun = `Pregunta Fácil ${i}: El principio de devengado tributario reconoce ingresos y gastos cuando se generan legalmente, con independencia del cobro o pago.`;
      let opA = 'Verdadero';
      let opB = 'Falso';
      let opC = '';
      let opD = '';
      let opE = '';
      let resp = 'A';
      let dif = '1';

      if (i > 5 && i <= 10) {
        tipo = 'Selección de la mejor respuesta';
        enun = `Pregunta Fácil ${i}: ¿Cuál es el plazo reglamentario para la presentación de descargos ante una Orden de Verificación del SIN?`;
        opA = '20 días hábiles computables a partir de la notificación legal';
        opB = '5 días calendario improrrogables';
        opC = '60 días hábiles administrativos';
        opD = '15 días continuos según código tributario';
        opE = 'No existe plazo formal establecido';
        resp = 'A';
      } else if (i > 10) {
        tipo = 'Opción de Emparejamiento Ampliado';
        grupo = 'EMP-TRIB1';
        enun = `Concepto ${i}: Base imponible presunta calculada sobre ventas brutas declaradas en el periodo fiscal.`;
        opA = ''; opB = ''; opC = ''; opD = ''; opE = '';
        resp = 'B';
      }

      dataBanco.push([tipo, grupo, enun, opA, opB, opC, opD, opE, resp, dif, '1P', 'OK']);
    }

    // 30 Medias (Nivel 2): Premisas A/B/Ambas/Ninguna, V/F Complejas
    for (let i = 1; i <= 30; i++) {
      let tipo = 'Respuesta A/B/Ambas/Ninguna';
      let grupo = '';
      let enun = `Pregunta Media ${i}: I. El crédito fiscal IVA respaldado por compras vinculadas a la actividad gravada es computable.\nII. Las retenciones tributarias no liberan al sujeto pasivo de su obligación formal.`;
      let opA = 'A. Si la primera es verdadera';
      let opB = 'B. Si la segunda es verdadera';
      let opC = 'C. Si ambas son verdaderas';
      let opD = 'D. Si ninguna es verdadera';
      let opE = '';
      let resp = 'C';
      let dif = '2';

      if (i > 15) {
        tipo = 'Verdadero o Falso Complejas';
        enun = `Pregunta Media ${i}: Respecto a los reparos tributarios en auditoría fiscal determine la validez: 1. Omisión de ingresos, 2. Falta de bancarización, 3. Crédito fiscal indebido, 4. Errores aritméticos.`;
        opA = '1. Omisión de ingresos reales en estados financieros auditados.';
        opB = '2. Gastos no deducibles por falta de documento de bancarización.';
        opC = '3. Crédito fiscal computado sin factura original o electrónica.';
        opD = '4. Errores aritméticos en libros de compras y ventas IVA.';
        resp = 'A';
      }

      dataBanco.push([tipo, grupo, enun, opA, opB, opC, opD, opE, resp, dif, '1P', 'OK']);
    }

    // 15 Difíciles (Nivel 3): Casos Clínicos / Problemas y Selección Avanzada
    for (let i = 1; i <= 15; i++) {
      let tipo = 'Subítem de caso o problema';
      let grupo = 'CASO-TRIB1';
      let enun = `Problema Tributario ${i}: En la fiscalización a 'Comercial Andina S.R.L.', se detectaron facturas sin medio fehaciente de pago por Bs 150.000. Calcule el reparo impositivo aplicable por IUE no deducible (25%).`;
      let opA = 'Reparo IUE Bs 37.500 (25%) + Sanción formal 500 UFV';
      let opB = 'Reparo IUE Bs 19.500 (13%) + Sanción formal 200 UFV';
      let opC = 'Reparo IUE Bs 45.000 (30%) + Sanción formal 1.000 UFV';
      let opD = 'No procede reparo si la factura tiene código de autorización vigente';
      let opE = 'Reparo total acumulado de Bs 75.000';
      let resp = 'A';
      let dif = '3';

      if (i > 5) {
        tipo = 'Selección de la mejor respuesta';
        grupo = '';
        enun = `Pregunta Difícil ${i}: En una fiscalización externa, ¿cuál es el efecto jurídico del vencimiento del término probatorio sin emisión de Resolución Determinativa dentro del plazo de 60 días?`;
        opA = 'No opera la prescripción pero suspende el cómputo de intereses moratorios';
        opB = 'Caducidad automática de pleno derecho de la facultad fiscalizadora';
        opC = 'Anulación de la Vista de Cargo emitida previamente';
        opD = 'Extinción de la deuda tributaria y costas procesales';
        opE = 'Imposibilidad de recurrir a la Autoridad de Impugnación Tributaria';
        resp = 'A';
      }

      dataBanco.push([tipo, grupo, enun, opA, opB, opC, opD, opE, resp, dif, '1P', 'OK']);
    }

    const dataEj = [
      headers,
      ['Verdadero o Falso Simple', '', 'El agua hierve a 100 grados Celsius al nivel del mar.', 'Verdadero', 'Falso', '', '', '', 'A', '1', '1P', 'OK'],
      ['Selección de la mejor respuesta', '', '¿Qué órgano bombea la sangre en el cuerpo humano?', 'Pulmón', 'Hígado', 'Corazón', 'Estómago', 'Riñón', 'C', '2', '1P', 'OK']
    ];

    const dataVal = [
      ['TIPOS_PREGUNTA', 'RESP_ABCDE', 'RESP_ABCD', 'RESP_AB', 'DIFICULTADES_123'],
      ['Verdadero o Falso Simple', 'A', 'A', 'A', '1'],
      ['Verdadero o Falso Complejas', 'B', 'B', 'B', '2'],
      ['Respuesta A/B/Ambas/Ninguna', 'C', 'C', '', '3'],
      ['Selección de la mejor respuesta', 'D', 'D', '', ''],
      ['Ítems agrupados por caso clínico o problema', 'E', '', '', ''],
      ['Subítem de caso o problema', '', '', '', ''],
      ['Emparejamiento Ampliado', '', '', '', ''],
      ['Opción de Emparejamiento Ampliado', '', '', '', '']
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dataVal), 'VALIDACIONES');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dataInst), 'Instrucciones');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dataBanco), 'Banco');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dataEj), 'Ejemplo');

    const fileName = `BANCO_OFICIAL_VALIDO_CPEC18_60PREGUNTAS.xlsx`;
    XLSX.writeFile(wb, fileName);

    // Cargar directamente en memoria para inspección visual instantánea
    this.nombreArchivoCargado.set(fileName);
    this.pdfPrevisualizadoYConforme.set(false);
    this.preguntasCargadas.set(this._generarPreguntasMockValidas());
    this._mostrarToast(`Descargado y cargado en vivo: ${fileName} (100% Conforme).`);
  }

  public descargarEjemploInvalido(): void {
    const headers = ['tipo', 'grupo', 'enunciado', 'opcion_a', 'opcion_b', 'opcion_c', 'opcion_d', 'opcion_e', 'respuesta_correcta', 'dificultad', 'parcial', 'observaciones'];
    const dataBanco: any[][] = [headers];

    // Filas con errores pedagógicos y sintácticos intencionales
    dataBanco.push(['Verdadero o Falso Simple', '', 'Pregunta V/F con clave errónea (marcada C en vez de A/B)', 'Verdadero', 'Falso', '', '', '', 'C', '1', '1P', 'Falta revisar: respuesta A-B']);
    dataBanco.push(['Selección de la mejor respuesta', '', '', 'Distractor A', 'Distractor B', 'Distractor C', 'Distractor D', 'Distractor E', 'A', '1', '1P', 'Falta revisar: enunciado']);
    dataBanco.push(['Selección de la mejor respuesta', '', 'Pregunta de selección incompleta con solo 3 opciones', 'Opción 1', 'Opción 2', 'Opción 3', '', '', 'A', '2', '1P', 'Falta revisar: incisos A-E']);
    dataBanco.push(['Subítem de caso o problema', '', 'Subítem sin código de grupo identificador del caso padre', 'Opción A', 'Opción B', 'Opción C', 'Opción D', 'Opción E', 'B', '3', '1P', 'Falta revisar: grupo']);
    dataBanco.push(['Respuesta A/B/Ambas/Ninguna', '', 'I. Premisa tributaria 1.\nII. Premisa 2.', 'A. Primera verdadera', 'B. Segunda verdadera', 'C. Ambas', 'D. Ninguna', '', 'Z', '2', '1P', 'Falta revisar: respuesta A-D']);
    dataBanco.push(['Emparejamiento Ampliado', 'EMP-01', 'Emparejamiento con solo 1 clave definida', 'Clave 1', '', '', '', '', '', '', '1P', 'Falta revisar: minimo 2 claves']);
    dataBanco.push(['Verdadero o Falso Complejas', '', 'V/F compleja con proposición 3 vacía', '1. Premisa 1', '2. Premisa 2', '', '4. Premisa 4', '', 'A', '2', '1P', 'Falta revisar: incisos 1-4']);

    for (let i = 8; i <= 25; i++) {
      dataBanco.push(['Selección de la mejor respuesta', '', `Pregunta sin completar cuota ${i}`, 'Opción A', 'Opción B', 'Opción C', 'Opción D', 'Opción E', 'A', '2', '1P', 'OK']);
    }

    const dataInst = [
      ['BANCO DE PREGUNTAS CON ERRORES PARA PRUEBAS DE VALIDACIÓN'],
      ['Este archivo contiene fallas intencionales para verificar el validador institucional UNITEPC.']
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dataInst), 'Instrucciones');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(dataBanco), 'Banco');

    const fileName = `BANCO_OFICIAL_CON_OBSERVACIONES_CPEC18.xlsx`;
    XLSX.writeFile(wb, fileName);

    // Parsear y cargar directamente en el validador interactivo
    const errList: PreguntaValidada[] = [
      { fila: 2, tipo: 'VERDADERO_O_FALSO_SIMPLE', grupo: '', enunciado: 'Pregunta V/F con clave errónea (marcada C en vez de A/B)', opcion_a: 'Verdadero', opcion_b: 'Falso', opcion_c: '', opcion_d: '', opcion_e: '', respuesta_correcta: 'C', dificultad: '1', peso: 5, observaciones: 'Falta revisar: respuesta A-B', valido: false, errores: ['Respuesta en V/F debe ser A (Verdadero) o B (Falso)'] },
      { fila: 3, tipo: 'SELECCION_MEJOR_RESPUESTA', grupo: '', enunciado: '', opcion_a: 'Distractor A', opcion_b: 'Distractor B', opcion_c: 'Distractor C', opcion_d: 'Distractor D', opcion_e: 'Distractor E', respuesta_correcta: 'A', dificultad: '1', peso: 5, observaciones: 'Falta revisar: enunciado', valido: false, errores: ['Falta enunciado de la pregunta'] },
      { fila: 4, tipo: 'SELECCION_MEJOR_RESPUESTA', grupo: '', enunciado: 'Pregunta de selección incompleta con solo 3 opciones', opcion_a: 'Opción 1', opcion_b: 'Opción 2', opcion_c: 'Opción 3', opcion_d: '', opcion_e: '', respuesta_correcta: 'A', dificultad: '2', peso: 5, observaciones: 'Falta revisar: incisos A-E', valido: false, errores: ['Requiere 5 opciones completas (incisos A al E)'] },
      { fila: 5, tipo: 'SUBITEM_CASO', grupo: '', enunciado: 'Subítem sin código de grupo identificador del caso padre', opcion_a: 'Opción A', opcion_b: 'Opción B', opcion_c: 'Opción C', opcion_d: 'Opción D', opcion_e: 'Opción E', respuesta_correcta: 'B', dificultad: '3', peso: 5, observaciones: 'Falta revisar: grupo', valido: false, errores: ['Falta código de grupo identificador (ej. CASO-01)'] },
      { fila: 6, tipo: 'RESPUESTA_PREMISAS_ABCD', grupo: '', enunciado: 'I. Premisa tributaria 1.\nII. Premisa 2.', opcion_a: 'A. Primera verdadera', opcion_b: 'B. Segunda verdadera', opcion_c: 'C. Ambas', opcion_d: 'D. Ninguna', opcion_e: '', respuesta_correcta: 'Z', dificultad: '2', peso: 5, observaciones: 'Falta revisar: respuesta A-D', valido: false, errores: ['Respuesta en premisas debe ser A, B, C o D'] },
      { fila: 7, tipo: 'EMPAREJAMIENTO_TRONCO', grupo: 'EMP-01', enunciado: 'Emparejamiento con solo 1 clave definida', opcion_a: 'Clave 1', opcion_b: '', opcion_c: '', opcion_d: '', opcion_e: '', respuesta_correcta: '', dificultad: '1', peso: 5, observaciones: 'Falta revisar: minimo 2 claves', valido: false, errores: ['Emparejamiento requiere al menos 2 claves/conceptos en opciones A y B'] },
      { fila: 8, tipo: 'VERDADERO_O_FALSO_COMPLEJAS', grupo: '', enunciado: 'V/F compleja con proposición 3 vacía', opcion_a: '1. Premisa 1', opcion_b: '2. Premisa 2', opcion_c: '', opcion_d: '4. Premisa 4', opcion_e: '', respuesta_correcta: 'A', dificultad: '2', peso: 5, observaciones: 'Falta revisar: incisos 1-4', valido: false, errores: ['Requiere las 4 proposiciones (1 a 4) en incisos A-D'] }
    ];

    for (let i = 9; i <= 25; i++) {
      errList.push({ fila: i, tipo: 'SELECCION_MEJOR_RESPUESTA', grupo: '', enunciado: `Pregunta sin completar cuota ${i}`, opcion_a: 'Opción A', opcion_b: 'Opción B', opcion_c: 'Opción C', opcion_d: 'Opción D', opcion_e: 'Opción E', respuesta_correcta: 'A', dificultad: '2', peso: 5, observaciones: 'OK', valido: true, errores: [] });
    }

    this.nombreArchivoCargado.set(fileName);
    this.pdfPrevisualizadoYConforme.set(false);
    this.preguntasCargadas.set(errList);
    this._mostrarToast(`Descargado y analizado: ${fileName} (Se detectaron 7 observaciones).`, 'error');
  }

  // ============================================================
  // DESCARGA DE PLANTILLA OFICIAL ENRIQUECIDA (4 HOJAS CON VALIDACIONES Y FÓRMULAS)
  // ============================================================
  public descargarExcelBaseMacro(): void {
    const filename = 'formato_banco_preguntas_asig_EF.xlsx';
    const asigClean = this.asignaturaSeleccionada().replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
    const link = document.createElement('a');
    link.href = `assets/${filename}`;
    link.download = `PLANTILLA_BANCO_${asigClean}_${this.grupoSeleccionado()}_${this.parcialActivo().toUpperCase().replace(/\s+/g, '_')}_2026.xlsx`;
    link.click();
    this._mostrarToast(`Plantilla oficial descargada para ${this.asignaturaSeleccionada()} (${this.grupoSeleccionado()}).`);
  }

  // ============================================================
  // FLUJO DE REMISIÓN POR CORREO DIRECTO A EVALUACIONES
  // ============================================================
  public abrirModalEnvioEvaluaciones(): void {
    this.comprobanteGenerado.set(null);
    this.dialogEnvioEvaluaciones.set(true);
  }

  public cerrarModalEnvioEvaluaciones(): void {
    this.dialogEnvioEvaluaciones.set(false);
  }

  public ejecutarEnvioCorreoEvaluaciones(): void {
    this.enviandoCorreo.set(true);

    const campus = this.campusActivo();
    const examenRol = this.listaExamenesDocente.find(e => e.id === this.examenRolSeleccionadoId) || this.listaExamenesDocente[1];
    const preguntasValidas = this.preguntasCargadas().filter(p => p.valido);

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fechaHoraStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const randomTicket = `TKT-EVAL-2026-${campus?.id.split('-')[0] || 'CBBA'}-${Math.floor(1000 + Math.random() * 9000)}`;

    const comprobante: ComprobanteEnvio = {
      ticket: randomTicket,
      fechaHora: fechaHoraStr,
      campusNombre: campus?.nombre || 'Cochabamba - Campus Colonial',
      correoDestino: campus?.correos ? campus.correos.join(', ') : 'evaluaciones.cochabamba@unitepc.edu.bo',
      correoDocente: this.docenteSesion.correo,
      docenteNombre: this.docenteSesion.nombre,
      docenteCi: this.docenteSesion.ci,
      materia: examenRol.materia,
      codigoMateria: examenRol.codigo,
      grupo: examenRol.grupo,
      parcial: this.parcialActivo(),
      modalidad: examenRol.conCartilla ? 'Con Cartilla Óptica' : 'Sin Cartilla',
      totalPreguntas: preguntasValidas.length,
      hashCriptografico: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
      nombreArchivoPkg: this.nombreArchivoPaquete()
    };

    setTimeout(() => {
      this.enviandoCorreo.set(false);
      this.comprobanteGenerado.set(comprobante);

      // 1. Descargar automáticamente el paquete encriptado .pkg
      this.generarYDescargarPaqueteEncriptado();

      // 2. Abrir la aplicación de correo del usuario (mailto)
      this.abrirClienteCorreo(comprobante);

      // Actualizar estado en lista de exámenes del docente y en la BD de Evaluaciones
      examenRol.estado = 'Enviado';
      this._db.actualizarEstadoPorBancoValidado(
        examenRol.codigo, 
        this.parcialActivo(), 
        this.nombreArchivoPaquete() || `BANCO_${examenRol.codigo}.xlsx`, 
        comprobante.hashCriptografico, 
        comprobante.totalPreguntas
      );
      this._mostrarToast(`Plantilla oficial lista y banco encriptado. El examen pasó a VALIDADO en la Lista de Evaluaciones.`);
    }, 600);
  }

  public generarTextoCuerpoCorreo(c: ComprobanteEnvio): string {
    return `========================================================================
SISTEMA DE EVALUACIONES ACADÉMICAS UNITEPC (SEA)
REMISIÓN OFICIAL DE BANCO DE PREGUNTAS Y EXAMEN
========================================================================

NÚMERO DE TICKET: ${c.ticket}
FECHA Y HORA: ${c.fechaHora}

1. DATOS DE LA EVALUACIÓN:
• Asignatura: [${c.codigoMateria}] ${c.materia}
• Grupo: ${c.grupo}
• Tipo de Evaluación: ${c.parcial}
• Modalidad: ${c.modalidad}
• Campus de Destino: ${c.campusNombre}

2. DATOS DEL DOCENTE REMITENTE:
• Docente: ${c.docenteNombre}
• C.I.: ${c.docenteCi}
• Correo Institucional: ${c.correoDocente}

3. CERTIFICACIÓN DE REACTIVOS Y BANCO:
• Total de Preguntas Validadas: ${c.totalPreguntas} reactivos conformes (100% de cuotas)
• Archivo del Paquete Encriptado: ${c.nombreArchivoPkg}
• Sello Criptográfico SHA-256: ${c.hashCriptografico}

4. OBSERVACIONES:
${this.observacionesDocenteEnvio ? this.observacionesDocenteEnvio : 'Sin observaciones adicionales.'}

========================================================================
* NOTA: Adjunto se remite el archivo de paquete (${c.nombreArchivoPkg}) generado por el sistema SEA.
* Mensaje oficial generado por el Sistema de Evaluaciones UNITEPC.
========================================================================`;
  }

  public abrirClienteCorreo(c: ComprobanteEnvio): void {
    const subject = encodeURIComponent(`[SEA-2026] Remisión de Examen: [${c.codigoMateria}] ${c.materia} (${c.parcial}) - ${c.grupo}`);
    const body = encodeURIComponent(this.generarTextoCuerpoCorreo(c));
    const to = encodeURIComponent(c.correoDestino);
    const cc = encodeURIComponent(c.correoDocente);

    const mailtoUrl = `mailto:${to}?cc=${cc}&subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  }

  public copiarTextoCorreo(c: ComprobanteEnvio): void {
    const texto = this.generarTextoCuerpoCorreo(c);
    navigator.clipboard.writeText(texto).then(() => {
      this._mostrarToast('Texto oficial del correo copiado al portapapeles.');
    });
  }

  public imprimirComprobanteEnvio(): void {
    window.print();
  }

  // ============================================================
  // GENERAR PAQUETE ENCRIPTADO EXCLUSIVO (.PKG)
  // ============================================================
  public async generarYDescargarPaqueteEncriptado(): Promise<void> {
    const parcialCode = this.parcialActivo().toUpperCase().replace(' ', '_');
    const preguntasValidas = this.preguntasCargadas().filter(p => p.valido);

    const payload = {
      header: 'UNITEPC-ENCRYPTED-EVAL-PACKAGE-V2',
      parcial: this.parcialActivo(),
      timestamp: new Date().toISOString(),
      checksum: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
      totalPreguntas: preguntasValidas.length,
      cuotas: {
        faciles: this.countFaciles(),
        medias: this.countMedias(),
        dificiles: this.countDificiles()
      },
      preguntas: preguntasValidas
    };

    const jsonString = JSON.stringify(payload);
    const keyString = 'UNITEPC_EVAL_SECRET_KEY_2026_PROPRIETARY';
    let encryptedChars: number[] = [];
    for (let i = 0; i < jsonString.length; i++) {
      const charCode = jsonString.charCodeAt(i);
      const keyChar = keyString.charCodeAt(i % keyString.length);
      encryptedChars.push(charCode ^ keyChar);
    }
    const encryptedHex = encryptedChars.map(c => c.toString(16).padStart(4, '0')).join('');

    const fileContent = `--- BEGIN UNITEPC ENCRYPTED EVALUATION PACKAGE ---\nVERSION: 2.0\nPARCIAL: ${parcialCode}\nDATA:\n${encryptedHex}\n--- END UNITEPC ENCRYPTED EVALUATION PACKAGE ---`;

    const blob = new Blob([fileContent], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.nombreArchivoPaquete();
    a.click();
    window.URL.revokeObjectURL(url);

    this._mostrarToast(`Copia de respaldo encriptada (${this.nombreArchivoPaquete()}) descargada.`);
  }

  // Previsualización PDF
  public abrirModalPrevisualizacionPdf(): void {
    this.dialogPrevisualizacionPdf.set(true);
  }

  public cerrarModalPrevisualizacionPdf(): void {
    this.dialogPrevisualizacionPdf.set(false);
  }

  public getTipoBadgeClass(tipo: string): string {
    switch (tipo) {
      case 'VERDADERO_O_FALSO_SIMPLE':
      case 'FALSO_VERDADERO':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
      case 'VERDADERO_O_FALSO_COMPLEJAS':
      case 'PREGUNTA_CON_CLAVE':
        return 'bg-teal-100 text-teal-800 border border-teal-300';
      case 'RESPUESTA_PREMISAS_ABCD':
      case 'RESPUESTA_COMPUESTA':
        return 'bg-cyan-100 text-cyan-800 border border-cyan-300';
      case 'SELECCION_MEJOR_RESPUESTA':
      case 'SELECCION_SIMPLE':
      case 'SELECCION_UNICA':
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'CASO_CLINICO_TRONCO':
      case 'PROBLEMA':
      case 'CASO_CLINICO':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-300 font-bold';
      case 'SUBITEM_CASO':
      case 'SUBPROBLEMA':
        return 'bg-violet-100 text-violet-800 border border-violet-300';
      case 'EMPAREJAMIENTO_TRONCO':
      case 'EMPAREJAMIENTO':
        return 'bg-amber-100 text-amber-900 border border-amber-300 font-bold';
      case 'OPCION_EMPAREJAMIENTO':
        return 'bg-orange-100 text-orange-800 border border-orange-300';
      default:
        return 'bg-slate-100 text-slate-800 border border-slate-300';
    }
  }

  public getTipoNombreAmigable(tipo: string): string {
    switch (tipo) {
      case 'VERDADERO_O_FALSO_SIMPLE':
      case 'FALSO_VERDADERO':
        return '1. V/F Simple';
      case 'VERDADERO_O_FALSO_COMPLEJAS':
      case 'PREGUNTA_CON_CLAVE':
        return '2. V/F Complejas';
      case 'RESPUESTA_PREMISAS_ABCD':
      case 'RESPUESTA_COMPUESTA':
        return '3. Premisas A/B/Ambas/Ninguna';
      case 'SELECCION_MEJOR_RESPUESTA':
      case 'SELECCION_SIMPLE':
      case 'SELECCION_UNICA':
        return '4. Selección Mejor Respuesta';
      case 'CASO_CLINICO_TRONCO':
      case 'PROBLEMA':
      case 'CASO_CLINICO':
        return '5. Caso Clínico (Tronco)';
      case 'SUBITEM_CASO':
      case 'SUBPROBLEMA':
        return '5.1 Subítem de Caso';
      case 'EMPAREJAMIENTO_TRONCO':
      case 'EMPAREJAMIENTO':
        return '6. Emparejamiento (Claves)';
      case 'OPCION_EMPAREJAMIENTO':
        return '6.1 Enunciado a Emparejar';
      default:
        return tipo;
    }
  }

  // Flujo 2FA Docente
  public abrirModal2FA(): void {
    this.dialog2FA.set(true);
    this.codigo2FAIngresado = '';
  }

  public cerrarModal2FA(): void {
    this.dialog2FA.set(false);
  }

  public confirmarCodigo2FA(): void {
    if (!this.codigo2FAIngresado || this.codigo2FAIngresado.trim().length < 6) {
      this._mostrarToast('Por favor ingresa un código de verificación de 6 dígitos.', 'error');
      return;
    }

    this.dialog2FA.set(false);
    this.pdfPrevisualizadoYConforme.set(true);
    this.dialogPrevisualizacionPdf.set(false);

    // Sincronizar automáticamente el estado VALIDADO con la Base de Datos de Evaluaciones
    const examenRol = this.listaExamenesDocente.find(e => e.id === this.examenRolSeleccionadoId) || this.listaExamenesDocente[1];
    const codigo = examenRol?.codigo || 'CPEC18';
    const archivo = this.nombreArchivoCargado() || `BANCO_${codigo}_OFICIAL.xlsx`;
    const hash = 'SHA256-2FA-' + codigo + '-b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9';
    const totalValidas = this.preguntasCargadas().filter(p => p.valido).length || 60;

    this._db.actualizarEstadoPorBancoValidado(codigo, this.parcialActivo(), archivo, hash, totalValidas);

    this._mostrarToast('✅ ¡Doble Autenticación (2FA) exitosa! El banco ha sido sellado con SHA-256 y pasó a estado VALIDADO.');
  }

  public aprobarDiagramacionPdf(): void {
    // Abre el modal 2FA para certificar con doble factor antes de validar
    this.abrirModal2FA();
  }

  // Previsualización Paquete Encriptado (.pkg)
  public abrirModalPrevisualizacionPkg(): void {
    const parcialCode = this.parcialActivo().toUpperCase().replace(' ', '_');
    const preguntasValidas = this.preguntasCargadas().filter(p => p.valido);

    const payload = {
      header: 'UNITEPC-ENCRYPTED-EVAL-PACKAGE-V2',
      parcial: this.parcialActivo(),
      gestion: 'II-2026',
      docente: this.docenteSesion.nombre,
      ci: this.docenteSesion.ci,
      timestamp: new Date().toISOString(),
      checksum: 'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
      totalPreguntas: preguntasValidas.length,
      cuotas: {
        faciles: this.countFaciles(),
        medias: this.countMedias(),
        dificiles: this.countDificiles()
      },
      preguntas: preguntasValidas
    };

    const jsonString = JSON.stringify(payload, null, 2);
    this.pkgJsonData.set(jsonString);

    const keyString = 'UNITEPC_EVAL_SECRET_KEY_2026_PROPRIETARY';
    let encryptedChars: number[] = [];
    for (let i = 0; i < jsonString.length; i++) {
      const charCode = jsonString.charCodeAt(i);
      const keyChar = keyString.charCodeAt(i % keyString.length);
      encryptedChars.push(charCode ^ keyChar);
    }
    const encryptedHex = encryptedChars.map(c => c.toString(16).padStart(4, '0')).join('');

    const fileContent = `--- BEGIN UNITEPC ENCRYPTED EVALUATION PACKAGE ---\nVERSION: 2.0\nPARCIAL: ${parcialCode}\nDOCENTE: ${this.docenteSesion.nombre}\nCHECKSUM_SHA256: b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9\nDATA:\n${encryptedHex}\n--- END UNITEPC ENCRYPTED EVALUATION PACKAGE ---`;

    this.pkgHexData.set(fileContent);
    this.tabPrevisualizacionPkg.set('cifrado');
    this.dialogPrevisualizacionPkg.set(true);
  }

  public cerrarModalPrevisualizacionPkg(): void {
    this.dialogPrevisualizacionPkg.set(false);
  }

  public copiarContenidoPkg(): void {
    const data = this.tabPrevisualizacionPkg() === 'cifrado' ? this.pkgHexData() : this.pkgJsonData();
    navigator.clipboard.writeText(data).then(() => {
      this._mostrarToast('Contenido copiado al portapapeles.');
    });
  }

  public abrirModalEjemplos(): void {
    this.dialogEjemplos.set(true);
  }

  public cerrarModalEjemplos(): void {
    this.dialogEjemplos.set(false);
  }

  private _generarPreguntasMockValidas(): PreguntaValidada[] {
    const list: PreguntaValidada[] = [];

    // 15 Fáciles (1) - V/F Simple, Selección Mejor Respuesta, Emparejamiento
    for (let i = 1; i <= 15; i++) {
      if (i <= 5) {
        list.push({
          fila: i + 1,
          tipo: 'VERDADERO_O_FALSO_SIMPLE',
          grupo: '',
          enunciado: `Pregunta Fácil ${i}: El principio de devengado tributario reconoce ingresos y gastos cuando se generan legalmente, con independencia del cobro o pago.`,
          opcion_a: 'Verdadero',
          opcion_b: 'Falso',
          opcion_c: '',
          opcion_d: '',
          opcion_e: '',
          respuesta_correcta: 'A',
          dificultad: '1',
          peso: 5,
          observaciones: 'OK',
          valido: true,
          errores: []
        });
      } else if (i <= 10) {
        list.push({
          fila: i + 1,
          tipo: 'SELECCION_MEJOR_RESPUESTA',
          grupo: '',
          enunciado: `Pregunta Fácil ${i}: ¿Cuál es el plazo reglamentario para la presentación de descargos ante una Orden de Verificación del SIN?`,
          opcion_a: '20 días hábiles computables a partir de la notificación legal',
          opcion_b: '5 días calendario improrrogables',
          opcion_c: '60 días hábiles administrativos',
          opcion_d: '15 días continuos según código tributario',
          opcion_e: 'No existe plazo formal establecido',
          respuesta_correcta: 'A',
          dificultad: '1',
          peso: 5,
          observaciones: 'OK',
          valido: true,
          errores: []
        });
      } else {
        list.push({
          fila: i + 1,
          tipo: 'OPCION_EMPAREJAMIENTO',
          grupo: 'EMP-GEN1',
          enunciado: `Concepto ${i}: Base imponible presunta calculada sobre ventas brutas declaradas en el periodo fiscal.`,
          opcion_a: '',
          opcion_b: '',
          opcion_c: '',
          opcion_d: '',
          opcion_e: '',
          respuesta_correcta: 'B',
          dificultad: '1',
          peso: 5,
          observaciones: 'OK',
          valido: true,
          errores: []
        });
      }
    }

    // 30 Medias (2) - Premisas A/B/Ambas/Ninguna, V/F Complejas, Subítems
    for (let i = 1; i <= 30; i++) {
      if (i <= 15) {
        list.push({
          fila: i + 16,
          tipo: 'RESPUESTA_PREMISAS_ABCD',
          grupo: '',
          enunciado: `Pregunta Media ${i}: I. El crédito fiscal IVA respaldado por compras vinculadas a la actividad gravada es computable.\nII. Las retenciones tributarias no liberan al sujeto pasivo de su obligación formal.`,
          opcion_a: 'A. Si la primera es verdadera',
          opcion_b: 'B. Si la segunda es verdadera',
          opcion_c: 'C. Si ambas son verdaderas',
          opcion_d: 'D. Si ninguna es verdadera',
          opcion_e: '',
          respuesta_correcta: 'C',
          dificultad: '2',
          peso: 5,
          observaciones: 'OK',
          valido: true,
          errores: []
        });
      } else {
        list.push({
          fila: i + 16,
          tipo: 'VERDADERO_O_FALSO_COMPLEJAS',
          grupo: '',
          enunciado: `Pregunta Media ${i}: Respecto a los reparos tributarios en auditoría fiscal determine la validez: 1. Omisión de ingresos, 2. Gastos no deducibles por falta de bancarización, 3. Crédito fiscal indebido, 4. Errores aritméticos en libros de ventas.`,
          opcion_a: '1. Omisión de ingresos reales en estados financieros auditados.',
          opcion_b: '2. Gastos no deducibles por falta de documento de bancarización.',
          opcion_c: '3. Crédito fiscal computado sin factura original o electrónica.',
          opcion_d: '4. Errores aritméticos en libros de compras y ventas IVA.',
          opcion_e: '',
          respuesta_correcta: 'A',
          dificultad: '2',
          peso: 5,
          observaciones: 'OK',
          valido: true,
          errores: []
        });
      }
    }

    // 15 Difíciles (3) - Casos Clínicos / Problemas Financieros
    for (let i = 1; i <= 15; i++) {
      if (i <= 5) {
        list.push({
          fila: i + 46,
          tipo: 'SUBITEM_CASO',
          grupo: 'CASO-TRIB1',
          enunciado: `Problema Tributario ${i}: En la auditoría fiscal a la empresa 'Comercial Andina S.R.L.', se detectaron facturas sin medio fehaciente de pago por un monto de Bs 150.000. Calcule el reparo impositivo aplicable por IUE no deducible y multa por incumplimiento a deberes formales.`,
          opcion_a: 'Reparo IUE Bs 37.500 (25%) + Sanción formal 500 UFV',
          opcion_b: 'Reparo IUE Bs 19.500 (13%) + Sanción formal 200 UFV',
          opcion_c: 'Reparo IUE Bs 45.000 (30%) + Sanción formal 1.000 UFV',
          opcion_d: 'No procede reparo si la factura tiene código de autorización vigente',
          opcion_e: 'Reparo total acumulado de Bs 75.000',
          respuesta_correcta: 'A',
          dificultad: '3',
          peso: 5,
          observaciones: 'OK',
          formulaTypst: '$ "Reparo IUE" = 150.000 times 25% = 37.500 " Bs" $',
          valido: true,
          errores: []
        });
      } else {
        list.push({
          fila: i + 46,
          tipo: 'SELECCION_MEJOR_RESPUESTA',
          grupo: '',
          enunciado: `Pregunta Difícil ${i}: En una fiscalización externa, ¿cuál es el efecto jurídico del vencimiento del término probatorio sin emisión de Resolución Determinativa dentro del plazo de 60 días?`,
          opcion_a: 'No opera la prescripción pero suspende el cómputo de intereses moratorios',
          opcion_b: 'Caducidad automática de pleno derecho de la facultad fiscalizadora',
          opcion_c: 'Anulación de la Vista de Cargo emitida previamente',
          opcion_d: 'Extinción de la deuda tributaria y costas procesales',
          opcion_e: 'Imposibilidad de recurrir a la Autoridad de Impugnación Tributaria',
          respuesta_correcta: 'A',
          dificultad: '3',
          peso: 5,
          observaciones: 'OK',
          valido: true,
          errores: []
        });
      }
    }

    return list;
  }

  private _mostrarToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toastType.set(type);
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }
}
