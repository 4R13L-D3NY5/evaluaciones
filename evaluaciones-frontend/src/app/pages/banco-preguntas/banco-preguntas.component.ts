import { Component, inject, signal, computed, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EvaluacionesStorageService } from '../../core/services/evaluaciones-storage.service';
import { UnitepcGatewayService } from '../../core/services/unitepc-gateway.service';
import { BranchOffice, Career, Course, GroupItem } from '../../core/models/unitepc-gateway.models';
import { RolExamenResponse, RolExamenService } from '../../core/services/rol-examen.service';
import { BancoPreguntasResponse, BancoPreguntasService } from '../../core/services/banco-preguntas.service';
import { ConfiguracionEvaluacionesService } from '../../core/services/configuracion-evaluaciones.service';
import { GeneracionTypstService } from '../../core/services/generacion-typst.service';
import { PrevisualizacionTypstRequest } from '../../core/models/generacion-typst.model';
import { DocumentoSinCartilla, ExamenSinCartillaService } from '../../core/services/examen-sin-cartilla.service';
import { SearchableSelectComponent, SearchableSelectOption } from '../../shared/components/searchable-select/searchable-select.component';
import { firstValueFrom, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import * as pdfjsLib from 'pdfjs-dist';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker-4.10.38.min.mjs';
}

export interface PreguntaValidada {
  fila: number;
  tipo: string;
  grupo: string;
  enunciado: string;
  imagen_base64?: string;
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

interface DetalleErrorDocente {
  regla: string;
  problema: string;
  correccion: string;
}

type TamanoImagen = 'GRANDE' | 'MEDIANA' | 'PEQUENA' | 'MUY_PEQUENA';

export interface ExamenDocenteCronograma {
  id: string;
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
  estado: string;
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
  imports: [CommonModule, FormsModule, SearchableSelectComponent],
  template: `
    <div class="space-y-6">
      
      <!-- Input de archivo oculto para carga real de Excel -->
      <input 
        #fileInput 
        type="file" 
        [accept]="esSinCartillaActivo() ? '.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document' : '.xlsx,.xls'"
        (change)="onFileSelected($event)" 
        class="hidden" />

      <input
        #imageInput
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        (change)="onImageSelected($event)"
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
                Banco de preguntas
              </h1>
              <p class="text-xs text-muted-foreground font-medium mt-0.5">
                Carga, revisión y aprobación de reactivos para cada evaluación.
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
            <span>Banco de preguntas</span>
          </button>

          <button 
            (click)="tabActiva.set('calendario')"
            [class]="tabActiva() === 'calendario' ? 'bg-purple-700 text-white font-black shadow-xs' : 'text-muted-foreground hover:text-foreground font-bold'"
            class="px-4 py-2 text-xs rounded-lg transition-all flex items-center gap-2 cursor-pointer">
            <i class="pi pi-calendar text-xs"></i>
            <span>Calendario de exámenes</span>
          </button>
        </div>
      </div>

      @if (tabActiva() === 'validador') {
        <div class="grid grid-cols-1 gap-2 rounded-2xl border border-border bg-card p-2 shadow-xs text-[10px] sm:grid-cols-3 sm:text-xs">
          <div class="flex items-center gap-2 rounded-xl bg-purple-50 px-3 py-2 font-black text-purple-900">
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-700 text-white">1</span>
            <span>Contexto del examen</span>
          </div>
          <div [class]="preguntasCargadas().length > 0 ? 'flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 font-black text-indigo-900' : 'flex items-center gap-2 rounded-xl px-3 py-2 text-muted-foreground'">
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700">2</span>
            <span>Cargar y validar</span>
          </div>
          <div [class]="esBancoTotalmenteValido() ? 'flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 font-black text-emerald-900' : 'flex items-center gap-2 rounded-xl px-3 py-2 text-muted-foreground'">
            <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">3</span>
            <span>Revisar y aprobar</span>
          </div>
        </div>
      }

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
                  {{ asignaturaNombreCompleto() }} · {{ grupoSeleccionado() }}
                </span>
              </div>
            </div>

            <!-- Grilla de 4 Selects Reactivos Conectados al Gateway SEA -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <!-- Select 1: Sede -->
              <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <i class="pi pi-building text-purple-700"></i> Sede
                </label>
                <select 
                  [ngModel]="sedeSeleccionada()?.code"
                  (ngModelChange)="onSedeChange($event)"
                  [disabled]="cargandoSedes()"
                  class="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-none cursor-pointer disabled:opacity-50">
                  @for (s of sedes(); track s.branchOfficeId) {
                    <option [value]="s.code">{{ s.name }} ({{ s.code }})</option>
                  }
                </select>
              </div>

              <!-- Select 2: Carrera -->
              <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <i class="pi pi-graduation-cap text-purple-700"></i> Carrera
                </label>
                <select 
                  [ngModel]="carreraSeleccionada()?.careerCode"
                  (ngModelChange)="onCarreraChange($event)"
                  [disabled]="cargandoCarreras()"
                  class="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-none cursor-pointer disabled:opacity-50">
                  @for (c of carreras(); track c.careerId) {
                    <option [value]="c.careerCode">{{ c.careerName }} ({{ c.careerCode }})</option>
                  }
                </select>
              </div>

              <!-- Select 3: Asignatura -->
              <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <i class="pi pi-book text-purple-700"></i> Asignatura
                </label>
                <sea-searchable-select
                  [options]="asignaturaOpciones()"
                  [value]="asignaturaSeleccionada()?.courseCode || ''"
                  (valueChange)="onAsignaturaChange($event)"
                  [disabled]="cargandoAsignaturas()"
                  placeholder="Seleccione una asignatura"
                  searchPlaceholder="Buscar por código o nombre..."
                  noResultsText="No se encontraron asignaturas." />
              </div>

              <!-- Select 4: Grupo -->
              <div class="space-y-1.5">
                <label class="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  <i class="pi pi-users text-purple-700"></i> Grupo / Paralelo
                </label>
                <select 
                  [ngModel]="grupoSeleccionado()"
                  (ngModelChange)="onGrupoChange($event)"
                  [disabled]="cargandoGrupos()"
                  class="w-full bg-background border border-border rounded-xl px-3 py-2 text-foreground font-semibold focus:ring-2 focus:ring-purple-600 focus:outline-none cursor-pointer disabled:opacity-50">
                  @if (grupos().length > 0) {
                    @for (g of grupos(); track g.groupId) {
                      <option [value]="g.code">{{ g.code }} — {{ g.teacherName || (g.teacherIdentityNumber ? 'Nombre no disponible (CI ' + g.teacherIdentityNumber + ')' : 'Sin docente asignado') }}</option>
                    }
                  } @else {
                    <option value="">Sin grupos oficiales disponibles</option>
                  }
                </select>
              </div>
            </div>

            @if (rolExamenActivo(); as rol) {
              <div [class]="rolPuedeCargarBanco() ? 'flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900' : 'flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-950'">
                <div class="flex items-center gap-2">
                  <i [class]="rolPuedeCargarBanco() ? 'pi pi-database' : 'pi pi-lock'"></i>
                  <span><strong>Rol de examen oficial:</strong> {{ rol.id }} · {{ rol.fechaDisplay }}</span>
                </div>
                <span class="font-black uppercase">{{ rol.estadoFlujo }}</span>
              </div>
              @if (cargandoBancoPersistido()) {
                <div class="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
                  <i class="pi pi-spin pi-spinner"></i><span>Consultando banco de preguntas guardado...</span>
                </div>
              } @else {
                @if (bancoPersistido(); as banco) {
                  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs text-emerald-950">
                    <div class="flex items-start gap-2">
                      <i class="pi pi-check-circle mt-0.5 text-emerald-700"></i>
                      <div>
                        <strong class="block uppercase">Banco de preguntas cargado</strong>
                        <span class="text-[10px]">{{ banco.totalReactivos }} reactivos · {{ banco.nombreArchivoExcel }} · Validado</span>
                      </div>
                    </div>
                    @if (rolPuedeEliminarBanco()) {
                      <button (click)="abrirEliminarBancoPersistido()" class="shrink-0 rounded-lg border border-rose-200 bg-white px-3 py-2 text-[10px] font-black text-rose-700 hover:bg-rose-50 cursor-pointer">
                        <i class="pi pi-trash mr-1"></i> Eliminar banco
                      </button>
                    }
                  </div>
                } @else {
                  <div class="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                    <i class="pi pi-info-circle"></i><span>Este grupo todavía no tiene banco de preguntas cargado para {{ parcialActivo() }}.</span>
                  </div>
                }
              }
              @if (!rolPuedeCargarBanco()) {
                <div class="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-950">
                  <i class="pi pi-info-circle mt-0.5"></i>
                <span>Este rol de examen ya está en <strong>{{ rol.estadoFlujo }}</strong>. Para reemplazar o volver a registrar el banco, primero debes restablecerlo a <strong>VALIDADO</strong> desde Evaluaciones del día, indicando el motivo.</span>
                </div>
              }
            } @else {
              <div class="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
                <i class="pi pi-exclamation-triangle"></i>
                <span>No existe un rol de examen oficial para esta materia, grupo y parcial. Regístralo antes de cargar el banco.</span>
              </div>
            }
          </div>
          
          @if (rolExamenActivo()) {
            @if (esSinCartillaActivo()) {
            <!-- Flujo específico: examen presencial sin cartilla -->
            <div class="bg-card border border-emerald-200 rounded-2xl p-6 shadow-xs space-y-5">
              <div class="flex items-start gap-3 border-b border-emerald-100 pb-4">
                <div class="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shrink-0">
                  <i class="pi pi-file-edit"></i>
                </div>
                <div>
                  <h3 class="text-base font-black text-foreground">Cargar examen sin cartilla</h3>
                  <p class="text-xs text-muted-foreground mt-1">El docente debe subir el examen oficial en formato .doc o .docx. Al registrarlo, el rol de examen queda en <strong>Validado</strong> para que Evaluaciones gestione su impresión y entrega.</p>
                </div>
              </div>

              @if (documentoSinCartilla(); as documento) {
                <div class="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950">
                  <div class="flex items-start gap-2">
                    <i class="pi pi-check-circle text-emerald-700 mt-0.5"></i>
                    <div><strong class="block">Documento registrado y validado</strong><span class="text-[10px]">{{ documento.nombreArchivo }} · {{ formatearTamanoDocumento(documento.tamanoBytes) }} · {{ documento.cargadoPor }}</span></div>
                  </div>
                  <button (click)="abrirDocumentoSinCartilla()" class="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-[10px] font-black text-emerald-800 hover:bg-emerald-100 cursor-pointer"><i class="pi pi-download mr-1"></i> Descargar examen</button>
                </div>
              }

              <div (click)="triggerFileInput()" (dragover)="onDragOver($event)" (drop)="onDropFile($event)" [class]="rolPuedeCargarBanco() ? 'border-2 border-dashed border-emerald-300 hover:border-emerald-600 rounded-2xl p-8 text-center space-y-3 bg-emerald-50/40 hover:bg-emerald-50 transition-all cursor-pointer' : 'border-2 border-dashed border-amber-300 rounded-2xl p-8 text-center space-y-3 bg-amber-50/60 opacity-80 cursor-not-allowed'">
                <div class="h-14 w-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto"><i class="pi pi-file-word"></i></div>
                <div><div class="text-sm font-black text-foreground">{{ archivoSinCartillaSeleccionado()?.name || (rolPuedeCargarBanco() ? 'Haz clic para seleccionar el examen .doc o .docx' : 'Carga bloqueada: restablezca el rol de examen a Validado') }}</div><p class="text-xs text-muted-foreground mt-1">Máximo 5 MB. El documento debe estar configurado en tamaño oficio: 8,5 × 13 pulgadas.</p></div>
              </div>

              <div class="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
                <button (click)="limpiarArchivoSinCartilla()" [disabled]="!archivoSinCartillaSeleccionado() || cargandoDocumentoSinCartilla()" class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground cursor-pointer disabled:opacity-40">Limpiar</button>
                <button (click)="subirDocumentoSinCartilla()" [disabled]="!archivoSinCartillaSeleccionado() || !rolPuedeCargarBanco() || cargandoDocumentoSinCartilla()" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black cursor-pointer disabled:opacity-50"><i class="pi" [class.pi-spin]="cargandoDocumentoSinCartilla()" [class.pi-spinner]="cargandoDocumentoSinCartilla()" [class.pi-check]="!cargandoDocumentoSinCartilla()"></i> {{ cargandoDocumentoSinCartilla() ? 'Subiendo y validando...' : 'Subir y validar examen' }}</button>
              </div>
            </div>
            } @else {
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

            <!-- Recursos oficiales de carga -->
            <div class="flex flex-wrap items-center gap-2">
              <button 
                (click)="descargarExcelBaseMacro()"
                title="Descargar la plantilla oficial en blanco con 4 hojas, listas desplegables y fórmulas automáticas"
                class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer">
                <i class="pi pi-download text-xs"></i>
                <span>Plantilla Oficial (4 Hojas)</span>
              </button>

              <button 
                (click)="abrirModalEjemplos()"
                title="Abrir la guía visual del formato oficial del examen"
                class="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer">
                <i class="pi pi-book text-xs"></i>
                <span>Guía del formato del examen</span>
              </button>
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
              @if (esBancoTotalmenteValido() && rolPuedeCargarBanco()) {
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
            @if (esBancoTotalmenteValido() && rolPuedeCargarBanco()) {
              @if (!pdfPrevisualizadoYConforme()) {
                <div class="p-4 bg-amber-500/10 border border-amber-300 dark:border-amber-700 rounded-2xl flex items-start gap-3.5 shadow-2xs animate-fade-in">
                  <div class="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0 mt-0.5 border border-amber-300">
                    <i class="pi pi-exclamation-triangle text-base"></i>
                  </div>
                  <div class="space-y-1 flex-1">
                    <div class="flex items-center justify-between">
                      <h5 class="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-tight">
                        Paso Obligatorio: Previsualización del formato oficial requerida
                      </h5>
                      <span class="bg-amber-200 text-amber-900 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                        Pendiente de Revisión
                      </span>
                    </div>
                    <p class="text-xs text-amber-900/90 dark:text-amber-300/90 font-medium leading-relaxed">
                      El banco de preguntas ha cumplido las cuotas mínimas. Por normativa institucional, <strong>debes abrir "Previsualizar Examen (Paso 1 Obligatorio)" y recorrer el PDF completo hasta su última página</strong> para verificar la diagramación oficial, fórmulas matemáticas/químicas y enunciados antes de desbloquear la descarga del paquete encriptado (.pkg), la remisión oficial o el registro del banco.
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

            @if (esBancoTotalmenteValido() && !rolPuedeCargarBanco()) {
              <div class="p-4 bg-amber-500/10 border border-amber-300 dark:border-amber-700 rounded-2xl flex items-start gap-3.5 shadow-2xs animate-fade-in">
                <div class="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0 mt-0.5 border border-amber-300">
                  <i class="pi pi-lock text-base"></i>
                </div>
                <div class="space-y-1 flex-1">
                  <h5 class="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-tight">
                    Banco validado, pero el rol de examen no admite nuevos registros
                  </h5>
                  <p class="text-xs text-amber-900/90 dark:text-amber-300/90 font-medium leading-relaxed">
                    El archivo cumple las cuotas mínimas, pero el rol de examen está en <strong>{{ rolExamenActivo()?.estadoFlujo }}</strong>. Restablécelo a <strong>VALIDADO</strong> desde Evaluaciones del día antes de aprobar o reemplazar el banco.
                  </p>
                </div>
              </div>
            }

            <!-- Zona Drag and Drop con Input Interactivo -->
            <div 
              (click)="triggerFileInput()"
              (dragover)="onDragOver($event)"
              (drop)="onDropFile($event)"
              [class]="rolPuedeCargarBanco() ? 'border-2 border-dashed border-border hover:border-purple-600 rounded-2xl p-8 text-center space-y-3 bg-muted/20 hover:bg-muted/40 transition-all cursor-pointer' : 'border-2 border-dashed border-amber-300 rounded-2xl p-8 text-center space-y-3 bg-amber-50/60 opacity-80 cursor-not-allowed'">
              <div [class]="rolPuedeCargarBanco() ? 'h-14 w-14 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center text-2xl mx-auto shadow-2xs' : 'h-14 w-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl mx-auto shadow-2xs'">
                <i [class]="rolPuedeCargarBanco() ? 'pi pi-file-excel' : 'pi pi-lock'"></i>
              </div>
              <div>
                <div class="text-sm font-black text-foreground">
                  {{ nombreArchivoCargado() || (rolPuedeCargarBanco() ? 'Haz clic para seleccionar tu archivo Excel (.xlsx) o arrástralo aquí' : 'Carga bloqueada: el rol de examen debe estar PROGRAMADO o VALIDADO') }}
                </div>
                <p class="text-xs text-muted-foreground mt-1">
                  Validación instantánea de tipos de reactivos, cuotas de dificultad y fórmulas matemáticas/químicas.
                </p>
                <p class="text-xs text-indigo-700 mt-1">
                  Puedes agregar la columna opcional <code>imagen_base64</code> para mostrar una imagen debajo de la pregunta en el examen virtual.
                </p>
              </div>
            </div>

            @if (!esSinCartillaActivo()) {
              <details class="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4 shadow-xs" [open]="mostrarHerramientaImagen() || !!imagenBase64Generada()" (toggle)="mostrarHerramientaImagen.set($any($event.target).open)">
                <summary class="flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl text-indigo-950 outline-none focus:ring-2 focus:ring-indigo-300">
                  <span class="flex items-center gap-2 text-sm font-black">
                    <i class="pi pi-image text-indigo-700"></i>
                    Herramienta opcional: imágenes de apoyo
                  </span>
                  <span class="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-indigo-800">
                    @if (imagenBase64Generada()) { <span class="rounded-full bg-emerald-100 px-2 py-1 text-emerald-800">Imagen lista</span> } @else { <span>Mostrar herramienta</span> }
                    <i class="pi pi-chevron-down text-xs"></i>
                  </span>
                </summary>

                <div class="mt-4 space-y-4 border-t border-indigo-200 pt-4">
                  <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <p class="max-w-3xl text-[11px] leading-relaxed text-indigo-900/75">
                      Convierte una imagen a Base64 y revisa cómo se verá dentro de una hoja de 8,5 × 13 pulgadas. Esta herramienta solo es necesaria cuando el reactivo incluye una imagen, ecuación u otro apoyo visual.
                    </p>
                    @if (imagenBase64Generada()) {
                      <button (click)="limpiarImagenBase64(); $event.stopPropagation()" type="button" class="shrink-0 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 cursor-pointer">
                        <i class="pi pi-trash mr-1"></i> Limpiar
                      </button>
                    }
                  </div>

                  <div class="grid gap-4 lg:grid-cols-[minmax(240px,0.75fr)_minmax(320px,1.25fr)]">
                    <div
                      (click)="triggerImageInput()"
                      (dragover)="onImageDragOver($event)"
                      (drop)="onImageDrop($event)"
                      (paste)="onImagePaste($event)"
                      tabindex="0"
                      class="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-300 bg-white/80 p-5 text-center transition hover:border-indigo-600 hover:bg-white focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                      <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-xl text-indigo-700">
                        <i [class]="procesandoImagen() ? 'pi pi-spin pi-spinner' : 'pi pi-upload'"></i>
                      </div>
                      <p class="mt-3 text-xs font-black text-indigo-950">
                        {{ procesandoImagen() ? 'Preparando imagen...' : (imagenNombre() || 'Haz clic o arrastra una imagen aquí') }}
                      </p>
                      <p class="mt-1 text-[10px] text-indigo-900/65">PNG, JPG, WEBP o GIF · también puedes pegar con Ctrl + V</p>
                      @if (errorImagen()) {
                        <p class="mt-2 text-[11px] font-bold text-rose-700">{{ errorImagen() }}</p>
                      }
                    </div>

                    <div class="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
                      <div class="mx-auto w-36 rounded-lg border border-indigo-200 bg-slate-200 p-2 shadow-inner" style="aspect-ratio: 8.5 / 13">
                        @if (imagenBase64Generada(); as imagen) {
                          <div class="flex h-full w-full items-center justify-center bg-white p-3 shadow-sm">
                            <img [src]="imagen" alt="Previsualización de imagen en hoja 8,5 x 13" class="max-w-full object-contain" [style.max-height.%]="alturaImagenPrevisualizacion()" />
                          </div>
                        } @else {
                          <div class="flex h-full items-center justify-center bg-white p-3 text-center text-[10px] font-bold text-slate-400">Vista de hoja 8,5 × 13</div>
                        }
                      </div>

                      <div class="space-y-3">
                        <div>
                          <p class="text-[10px] font-black uppercase tracking-wide text-indigo-900">Tamaño de visualización</p>
                          <div class="mt-2 flex flex-wrap gap-2">
                            @for (tamano of tamanosImagen; track tamano.valor) {
                              <button type="button" (click)="tamanoImagen.set(tamano.valor)" [class]="tamanoImagen() === tamano.valor ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm' : 'border-indigo-200 bg-white text-indigo-800 hover:bg-indigo-100'" class="rounded-lg border px-3 py-2 text-[11px] font-black cursor-pointer">
                                {{ tamano.etiqueta }}{{ tamano.valor === 'MEDIANA' ? ' (predeterminado)' : '' }}
                              </button>
                            }
                          </div>
                        </div>
                        <div>
                          <div class="mb-1 flex items-center justify-between gap-2">
                            <label class="text-[10px] font-black uppercase tracking-wide text-indigo-900">Base64 listo para copiar</label>
                            <button type="button" (click)="copiarImagenBase64()" [disabled]="!imagenBase64Generada()" title="Copiar Base64" aria-label="Copiar Base64" class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer">
                              <i class="pi pi-copy text-xs"></i>
                            </button>
                          </div>
                          <textarea [value]="imagenBase64ParaCopiar()" readonly rows="4" placeholder="Aquí aparecerá el texto Base64 de la imagen" class="w-full resize-none rounded-xl border border-indigo-200 bg-white px-3 py-2 font-mono text-[10px] text-slate-700 outline-none focus:border-indigo-500"></textarea>
                          <p class="mt-1 text-[10px] leading-relaxed text-indigo-900/65">Pega este valor en la columna <code>imagen_base64</code> del Excel. El tamaño se conserva como metadato de la data URI, sin agregar otra columna.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </details>
            }

            <!-- Resumen de Errores si el archivo no es válido -->
            @if (observacionesValidacion().length > 0 || preguntasConErrores().length > 0) {
              <div class="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2 text-xs animate-fade-in">
                <div class="flex items-center gap-2 font-black text-rose-900">
                  <i class="pi pi-exclamation-triangle text-rose-600"></i>
                  <span>Observaciones que debes corregir antes de aprobar el banco:</span>
                </div>
                <div class="rounded-lg border border-rose-200 bg-white/70 px-3 py-2 text-[11px] leading-relaxed text-rose-900">
                  <strong>¿Dónde corregir la opción?</strong> La aplicación no mueve incisos automáticamente. Corrige la fila en el Excel original,
                  usando las columnas oficiales <code>respuesta_correcta</code> y <code>opcion_a</code> a <code>opcion_e</code>.
                  En <strong>Selección de la mejor respuesta</strong> y <strong>Subítem de caso o problema</strong>, si la respuesta es <code>E</code>, <code>opcion_e</code> debe contener el texto de esa alternativa.
                  En <strong>Verdadero o Falso Complejas</strong>, <code>opcion_e</code> debe quedar vacía: la letra <code>E</code> sí puede registrarse en <code>respuesta_correcta</code> porque identifica una combinación de las cuatro proposiciones.
                  Luego vuelve a cargar el archivo para ejecutar nuevamente todas las validaciones.
                </div>
                <ul class="list-disc pl-5 space-y-1 text-rose-800 text-[11px]">
                  @for (observacion of observacionesValidacion(); track observacion) {
                    <li>{{ observacion }}</li>
                  }
                  @if (preguntasConErrores().length > 0) {
                    <li>Hay {{ preguntasConErrores().length }} filas con errores específicos:</li>
                    @for (errItem of preguntasConErrores(); track errItem.fila) {
                      <li class="ml-4 list-none space-y-1.5">
                        <div class="font-black text-rose-950">Fila {{ errItem.fila }} · {{ getTipoNombreAmigable(errItem.tipo) }}</div>
                        <div class="rounded-lg border border-rose-200 bg-white px-3 py-2 space-y-1.5">
                          <div class="text-[10px] font-black uppercase tracking-wide text-rose-700">{{ errItem.enunciado ? (errItem.enunciado | slice:0:90) + (errItem.enunciado.length > 90 ? '...' : '') : 'Sin enunciado' }}</div>
                          @for (detalle of getDetalleErroresDocente(errItem); track detalle.regla + detalle.problema) {
                            <div class="border-t border-rose-100 pt-1.5 text-[11px] leading-relaxed">
                              <strong class="text-rose-950">{{ detalle.regla }}:</strong>
                              <span class="text-rose-900"> {{ detalle.problema }}</span>
                              <div class="mt-0.5 text-rose-700"><strong>Corrección:</strong> {{ detalle.correccion }}</div>
                            </div>
                          }
                        </div>
                      </li>
                    }
                  }
                </ul>
              </div>
            }
          </div>
          @if (preguntasCargadas().length > 0) {
          <!-- Paneles de Métricas y Balance del Examen -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            <!-- Tarjeta 1: Estado de Validación -->
            <div class="lg:col-span-3 bg-card border border-border rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
              <div>
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Estado del Examen</span>
                <h3 class="text-base font-black text-foreground mt-0.5">{{ parcialActivo() }}</h3>
                <p class="text-xs font-bold text-primary font-mono mt-1">
                  {{ totalPreguntasValidas() }} preguntas válidas (mínimo {{ totalPreguntasRequeridas() }})
                </p>
              </div>
              
              <div>
                @if (esBancoTotalmenteValido()) {
                  <div class="bg-emerald-50 border border-emerald-300 p-3 rounded-xl text-center space-y-1">
                    <span class="text-emerald-800 font-black text-xs flex items-center justify-center gap-1">
                      <i class="pi pi-shield text-emerald-600"></i> EXAMEN APROBADO
                    </span>
                    <p class="text-[10px] text-emerald-700">Cuotas mínimas cumplidas y reactivos conformes</p>
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
                    <span class="font-mono text-foreground">{{ countFaciles() }}/{{ cuotasDificultad().facil }} mín.</span>
                  </div>
                  <div class="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 rounded-full transition-all duration-500" [style.width.%]="porcentajeCuota(countFaciles(), cuotasDificultad().facil)"></div>
                  </div>
                </div>

                <!-- Medias (2) -->
                <div>
                  <div class="flex justify-between font-bold text-[11px] mb-1">
                    <span class="text-amber-600">Medias (2)</span>
                    <span class="font-mono text-foreground">{{ countMedias() }}/{{ cuotasDificultad().medio }} mín.</span>
                  </div>
                  <div class="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div class="h-full bg-amber-500 rounded-full transition-all duration-500" [style.width.%]="porcentajeCuota(countMedias(), cuotasDificultad().medio)"></div>
                  </div>
                </div>

                <!-- Difíciles (3) -->
                <div>
                  <div class="flex justify-between font-bold text-[11px] mb-1">
                    <span class="text-rose-600">Difíciles (3)</span>
                    <span class="font-mono text-foreground">{{ countDificiles() }}/{{ cuotasDificultad().dificil }} mín.</span>
                  </div>
                  <div class="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div class="h-full bg-rose-500 rounded-full transition-all duration-500" [style.width.%]="porcentajeCuota(countDificiles(), cuotasDificultad().dificil)"></div>
                  </div>
                </div>
              </div>

              <div [class]="cuotaDificultadCumplida() ? 'text-emerald-700' : 'text-amber-700'" class="text-[10px] font-extrabold flex items-center gap-1 pt-1">
                <i [class]="cuotaDificultadCumplida() ? 'pi pi-check-circle text-xs' : 'pi pi-exclamation-circle text-xs'"></i>
                <span>{{ cuotaDificultadCumplida() ? 'Cuotas mínimas alcanzadas para este examen' : 'Faltan preguntas para completar las cuotas mínimas' }}</span>
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
                    <span class="text-purple-700">G3 (Casos / Fórmulas + Emp.)</span>
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

            }
          }
          } @else {
            <div class="flex items-start gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-4 text-xs text-muted-foreground">
              <i class="pi pi-arrow-up-right mt-0.5 text-purple-700"></i>
              <div>
                <strong class="block text-foreground">Selecciona un rol de examen para continuar</strong>
                <span>El cargador, la validación y las métricas aparecerán cuando exista una asignatura, grupo y parcial compatibles.</span>
              </div>
            </div>
          }

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
                    [ngModel]="examenRolSeleccionadoId()"
                    (ngModelChange)="examenRolSeleccionadoId.set($event)"
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
                    <strong class="text-foreground">{{ docenteOficialActivo().nombre }}</strong>
                    <span class="block text-[10px] text-muted-foreground">C.I.: {{ docenteOficialActivo().ci }}</span>
                  </div>
                  <div>
                    <span class="text-muted-foreground block text-[10px]">Correo del Docente:</span>
                    <strong class="text-foreground font-mono">{{ docenteOficialActivo().correo }}</strong>
                    <span class="block text-[9px] text-emerald-700 font-bold">Dato consultado desde SEA</span>
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
      <!-- MODAL: PREVISUALIZACIÓN DEL EXAMEN EN FORMATO PDF OFICIAL -->
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
                    <h3 class="text-base font-black">Previsualización de Cuadernillo de Examen (Formato oficial)</h3>
                    <span class="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Excel actual · {{ preguntasValidasParaPdf().length }} reactivos
                    </span>
                  </div>
                  <p class="text-xs text-slate-300 font-mono">
                    {{ parcialActivo() | uppercase }} · {{ nombreArchivoCargado() || 'Excel actual' }} · UNA COLUMNA
                  </p>
                </div>
              </div>

              <!-- El PDF de validación siempre se genera en una sola columna. -->
              <div class="flex flex-wrap items-center gap-2">
                <button (click)="cerrarModalPrevisualizacionPdf()" class="text-white/80 hover:text-white p-1 text-base cursor-pointer ml-1">
                  <i class="pi pi-times"></i>
                </button>
              </div>
            </div>

            <!-- PDF real generado con las reglas oficiales, renderizado por el
                 componente para poder controlar el desplazamiento completo. -->
            <div id="area-scroll-banco-pdf" (scroll)="onScrollDocumentoPdf($event)" class="p-4 sm:p-8 overflow-y-auto bg-slate-200/90 dark:bg-slate-900/90 flex-1 min-h-[65vh] max-h-[72vh]">
              @if (pdfPreviewPages().length > 0) {
                <div class="w-full flex flex-col items-center gap-6">
                  @for (page of pdfPreviewPages(); track $index) {
                    <div class="w-full max-w-[900px] bg-white shadow-xl border border-slate-300 rounded-sm overflow-hidden">
                      <div class="px-3 py-1.5 bg-slate-100 border-b border-slate-200 text-[10px] font-mono text-slate-500 text-right">
                        PÁGINA {{ $index + 1 }} / {{ pdfPreviewPages().length }}
                      </div>
                      <img [src]="page" [alt]="'Página ' + ($index + 1) + ' de la previsualización oficial'" class="block w-full h-auto" />
                    </div>
                  }
                </div>
              } @else if (pdfPreviewUrl()) {
                <div class="h-[65vh] flex items-center justify-center text-slate-600">Renderizando páginas del PDF oficial...</div>
              } @else {
                <div class="h-[65vh] flex items-center justify-center text-slate-600">Generando PDF oficial...</div>
              }
            </div>

            <!-- Maqueta histórica conservada únicamente como referencia de código; no se muestra. -->
            <div class="hidden">
              
              <!-- Hoja de Examen Impresa Oficial -->
              <div class="bg-white text-slate-900 border border-slate-300 rounded-2xl shadow-xl p-6 sm:p-10 max-w-4xl mx-auto space-y-6 font-serif text-xs leading-relaxed">
                
                <!-- 1. Encabezado Institucional UNITEPC Oficial -->
                <div class="border-b-2 border-slate-900 pb-4 text-center space-y-1.5 font-sans">
                  <div class="flex items-center justify-between pb-1">
                    <div class="text-left font-mono text-[9px] text-slate-600 font-bold uppercase">
                      <div>UNITEPC · SEDE COCHABAMBA</div>
                      <div>VICERRECTORADO ACADÉMICO</div>
                    </div>

                    <div class="text-right font-mono text-[9px] text-purple-900 font-black uppercase">
                      <div>SISTEMA DE EVALUACIONES</div>
                      <div>MOTOR DE DIAGRAMACIÓN OFICIAL</div>
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
                <div class="border border-slate-700 rounded-lg overflow-hidden text-[10px] font-sans bg-white">
                  <div class="grid grid-cols-12 border-b border-slate-400">
                    <div class="col-span-7 p-1.5 border-r border-slate-400">
                      <strong>NOMBRE:</strong> <span class="text-slate-800">JUAN CARLOS PÉREZ MAMANI</span>
                    </div>
                    <div class="col-span-5 p-1.5">
                      <strong>CARRERA:</strong> <span class="text-slate-800">{{ carreraNombreCompleto() | uppercase }}</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-12 border-b border-slate-400">
                    <div class="col-span-7 p-1.5 border-r border-slate-400">
                      <strong>MATERIA:</strong> <span class="text-slate-800">{{ asignaturaNombreCompleto() | uppercase }}</span>
                    </div>
                    <div class="col-span-5 p-1.5">
                      <strong>GRUPO:</strong> <span class="text-slate-800">{{ grupoSeleccionado() }}</span> <strong class="ml-2">SEMESTRE:</strong> {{ asignaturaSeleccionada()?.semester || 3 }}
                    </div>
                  </div>
                  <div class="grid grid-cols-12 border-b border-slate-400">
                    <div class="col-span-7 p-1.5 border-r border-slate-400">
                      <strong>DOCENTE:</strong> <span class="text-slate-800">{{ docenteOficialActivo().nombre }}</span>
                    </div>
                    <div class="col-span-5 p-1.5">
                      <strong>EXAMEN:</strong> <span class="text-slate-800">{{ parcialActivo() }}</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-12 border-b border-slate-400">
                    <div class="col-span-7 p-1.5 border-r border-slate-400">
                      <strong>FECHA:</strong> <span class="text-slate-800">22/08/2026</span>
                    </div>
                    <div class="col-span-5 p-1.5">
                      <strong>HORA:</strong> <span class="text-slate-800">08:15:00 - 09:45:00</span>
                    </div>
                  </div>
                  <div class="grid grid-cols-12">
                    <div class="col-span-7 p-2 border-r border-slate-400 flex flex-col justify-between">
                      <strong class="text-[9px] uppercase">FIRMA DEL ESTUDIANTE:</strong>
                      <div class="border-b border-dotted border-slate-700 h-4 mt-1"></div>
                    </div>
                    <div class="col-span-5 p-2 flex flex-col justify-between">
                      <strong class="text-[9px] uppercase">CODIGO:</strong>
                      <div class="text-center font-black font-mono text-lg tracking-widest text-slate-950 -mt-1">
                        7849102
                      </div>
                    </div>
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
                <!-- 4. Cuerpo Completo de Preguntas del Banco en formato oficial -->
                <div class="pt-2 border-t-2 border-slate-900 font-serif">
                  <div class="text-center font-sans font-black text-sm uppercase tracking-widest text-slate-950">
                    CUESTIONARIO DE PREGUNTAS ({{ preguntasValidasParaPdf().length }} REACTIVOS)
                  </div>
                  <div class="text-center font-sans font-bold text-[11px] uppercase text-slate-600 mb-3 pb-2">
                    {{ asignaturaNombreCompleto() }} · EVALUACIÓN TEÓRICA {{ parcialActivo() | uppercase }} · VARIANTE A
                  </div>

                  <hr class="border-t-2 border-slate-900 mb-6" />

                  <!-- Lista de Preguntas Formateadas Idénticas a la Impresión de Examen -->
                  <div [class]="vistaPdfColumnas() === '2' ? 'grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5' : 'space-y-5'">
                    
                    @for (pregunta of preguntasValidasParaPdf(); track pregunta.fila; let i = $index) {
                      
                      <!-- Renderizado de Encabezado de Sección si corresponde -->
                      @if (i === 0) {
                        <div class="col-span-full border-b border-slate-300 pb-1 mb-2 font-sans">
                          <div class="font-black text-xs uppercase text-slate-950">
                            SELECCIÓN DE LA MEJOR RESPUESTA (Preguntas 1 a 15)
                          </div>
                          <div class="text-[10px] text-slate-700 italic">
                            <strong>Instrucciones:</strong> Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.
                          </div>
                        </div>
                      } @else if (i === 15) {
                        <div class="col-span-full border-b border-slate-300 pb-1 my-3 font-sans">
                          <div class="font-black text-xs uppercase text-slate-950">
                            FALSO O VERDADERO (Preguntas 16 a 25)
                          </div>
                          <div class="text-[10px] text-slate-700 italic">
                            <strong>Instrucciones:</strong> Determine si cada afirmación es verdadera (A) o falsa (B).
                          </div>
                        </div>
                      } @else if (i === 25) {
                        <div class="col-span-full border-b border-slate-300 pb-1 my-3 font-sans">
                          <div class="font-black text-xs uppercase text-slate-950">
                            PREMISAS A / B / AMBAS / NINGUNA (Preguntas 26 a 35)
                          </div>
                          <div class="text-[10px] text-slate-700 italic">
                            <strong>Instrucciones:</strong> Analice las dos premisas y elija la opción de relación correcta.
                          </div>
                        </div>
                      } @else if (i === 35) {
                        <div class="col-span-full border-b border-slate-300 pb-1 my-3 font-sans">
                          <div class="font-black text-xs uppercase text-slate-950">
                            PREGUNTAS CON CLAVE DE RESPUESTA (Preguntas 36 a 45)
                          </div>
                          <div class="text-[10px] text-slate-700 italic">
                            <strong>Instrucciones:</strong> Marque A si 1, 2 y 3 son correctas; B si 1 y 3; C si 2 y 4; D si solo 4; E si todas son correctas.
                          </div>
                        </div>
                      } @else if (i === 45) {
                        <div class="col-span-full border-b border-slate-300 pb-1 my-3 font-sans">
                          <div class="font-black text-xs uppercase text-slate-950">
                            CASOS PRÁCTICOS Y PROBLEMAS APLICADOS (Preguntas 46 a 55)
                          </div>
                          <div class="p-2 bg-slate-100 rounded-lg border border-slate-300 text-[10.5px] mt-1 text-slate-800">
                            <strong>CASO PRÁCTICO N° 1 (Comercial Andina S.R.L.):</strong> En la fiscalización integral se detectaron compras no bancarizadas por Bs 150.000 y retenciones de servicios no declaradas.
                          </div>
                        </div>
                      } @else if (i === 55) {
                        <div class="col-span-full border-b border-slate-300 pb-1 my-3 font-sans">
                          <div class="font-black text-xs uppercase text-slate-950">
                            EMPAREJAMIENTO DE CONCEPTOS (Preguntas 56 a 60)
                          </div>
                          <div class="p-2.5 bg-slate-100 rounded-lg border border-slate-300 text-[10.5px] mt-1 space-y-1">
                            <div class="font-bold text-slate-900">OPCIONES DE REFERENCIA:</div>
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] text-slate-800 pl-2">
                              <div><strong>A)</strong> Determinación sobre Base Presunta</div>
                              <div><strong>B)</strong> Crédito Fiscal IVA Trasladable</div>
                              <div><strong>C)</strong> Alícuota Adicional IUE Financiero</div>
                              <div><strong>D)</strong> Exención Tributaria Subjetiva</div>
                              <div><strong>E)</strong> Determinación sobre Base Cierta</div>
                            </div>
                            <div class="text-[9.5px] text-slate-600 italic pt-1">Relacione cada uno de los siguientes enunciados con la opción correspondiente:</div>
                          </div>
                        </div>
                      }

                      <!-- Reactivo Individual Formateado Idéntico a Captura 2 -->
                      <div class="space-y-1.5 break-inside-avoid">
                        
                        <!-- Enunciado de la Pregunta -->
                        <div class="text-slate-950 text-[11.5px] leading-snug font-sans">
                          <strong>{{ i + 1 }}.</strong> {{ pregunta.enunciado }}
                        </div>

                        <!-- Renderizado de fórmulas si existen -->
                        @if (pregunta.formulaTypst) {
                          <div class="bg-slate-950 text-emerald-400 font-mono text-[10px] p-2 rounded border border-slate-800 my-1 overflow-x-auto">
                            {{ pregunta.formulaTypst }}
                          </div>
                        }

                        <!-- Opciones de Respuesta en Texto Puro Formato A) B) C) D) E) -->
                        <div class="pl-4 space-y-0.5 text-slate-900 font-sans text-[11px]">
                          @if (pregunta.tipo === 'VERDADERO_O_FALSO_SIMPLE') {
                            <div>A) Verdadero</div>
                            <div>B) Falso</div>
                          } @else if (pregunta.tipo === 'OPCION_EMPAREJAMIENTO') {
                            <div class="text-[10px] text-slate-600 font-mono italic">[Opción de Relación A–E]</div>
                          } @else {
                            @if (pregunta.opcion_a) { <div>A) {{ pregunta.opcion_a }}</div> }
                            @if (pregunta.opcion_b) { <div>B) {{ pregunta.opcion_b }}</div> }
                            @if (pregunta.opcion_c) { <div>C) {{ pregunta.opcion_c }}</div> }
                            @if (pregunta.opcion_d) { <div>D) {{ pregunta.opcion_d }}</div> }
                            @if (pregunta.opcion_e) { <div>E) {{ pregunta.opcion_e }}</div> }
                          }
                        </div>

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
                    Certificación del formato oficial · Total {{ preguntasValidasParaPdf().length }} Reactivos Certificados
                  </div>
                </div>

              </div>

            </div>

            <!-- Pie del Modal con Acción de Aprobación de Banco Requerida -->
            <div class="bg-card border-t border-border p-4 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs shrink-0">
              <div class="flex items-center gap-2 text-center sm:text-left">
                @if (!documentoRecorridoCompleto()) {
                  <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 font-bold">
                    <i class="pi pi-arrow-down animate-bounce text-xs"></i>
                    <span>Debes visualizar y recorrer las {{ pdfPreviewPages().length || 'todas las' }} páginas del PDF oficial hasta el final para habilitar la validación y el registro.</span>
                  </div>
                } @else {
                  <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 font-bold">
                    <i class="pi pi-check-circle text-emerald-600 text-sm"></i>
                    <span>PDF oficial real generado en Oficio, una columna y revisado hasta el final. Ya puedes validar y registrar.</span>
                  </div>
                }
              </div>

              <div class="flex items-center gap-2.5">
                <button 
                  (click)="cerrarModalPrevisualizacionPdf()"
                  class="px-4 py-2.5 bg-muted hover:bg-border text-foreground rounded-xl font-bold transition-colors cursor-pointer">
                  Cerrar
                </button>

                <button 
                  [disabled]="!documentoRecorridoCompleto() || !rolExamenActivo() || !archivoExcelSeleccionado() || cargandoBanco() || pdfPreviewPages().length === 0"
                  (click)="aprobarDiagramacionPdf()"
                  class="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-black shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                  <i class="pi pi-check-circle text-sm"></i>
                  <span>{{ cargandoBanco() ? 'Guardando en PostgreSQL...' : 'Aprobar y Guardar Banco de Preguntas' }}</span>
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
                  <strong class="text-foreground">{{ docenteOficialActivo().nombre }}</strong>
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
                    <span>Contenido parseado y validado listo para la diagramación oficial:</span>
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

      <!-- MODAL: GUÍA OFICIAL DE LINEAMIENTOS Y RENDERIZADO EN PDF -->
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
                  <h3 class="text-base font-black">Guía del formato oficial del examen</h3>
                  <p class="text-xs text-white/80 font-medium">
                    Cómo llenar el Excel y cómo se organiza cada sección dentro del cuadernillo impreso.
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
                 Todas las secciones
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
                 Apoyo transversal: fórmulas ($ ... $)
              </button>
            </div>

            <!-- Resumen visual del formato de impresión -->
            <div class="border-b border-border bg-white px-4 py-3 text-[10px] text-slate-700 sm:px-6">
              <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span class="font-black uppercase tracking-wide text-purple-900">Formato del cuadernillo</span>
                <span class="inline-flex items-center gap-1.5"><i class="pi pi-id-card text-purple-600"></i> Identificación del estudiante</span>
                <span class="inline-flex items-center gap-1.5"><i class="pi pi-list text-purple-600"></i> Cuestionario con numeración corrida</span>
                <span class="inline-flex items-center gap-1.5"><i class="pi pi-th-large text-purple-600"></i> Secciones I a VI</span>
                <span class="inline-flex items-center gap-1.5"><i class="pi pi-check-square text-purple-600"></i> Opciones A a E</span>
              </div>
              <p class="mt-2 text-[10px] text-slate-500">Las fórmulas, imágenes y casos se integran dentro de la sección del reactivo; no crean una sección independiente.</p>
            </div>

            <!-- Cuerpo de Ejemplos con Comparador Dual (Excel vs PDF Impreso) -->
            <div class="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-foreground text-xs">

              <!-- SECCIÓN 1: VERDADERO O FALSO SIMPLE -->
              @if (filtroGuiaTipo() === 'TODOS' || filtroGuiaTipo() === 'VF_SIMPLE') {
                <div class="border border-border rounded-2xl p-5 space-y-4 bg-muted/20">
                  <div class="flex items-center justify-between border-b border-border pb-3">
                    <div class="flex items-center gap-2">
                      <span class="bg-emerald-600 text-white font-black px-2.5 py-1 rounded text-xs">SECCIÓN I</span>
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

                    <!-- Cómo se verá en el PDF oficial -->
                    <div class="lg:col-span-6 bg-white border border-slate-300 rounded-xl p-4 space-y-2 text-slate-900 shadow-xs">
                      <div class="flex items-center justify-between border-b border-slate-200 pb-1 text-[10px] font-mono text-slate-500">
                        <span class="font-bold uppercase text-purple-900"><i class="pi pi-file-pdf text-rose-500"></i> Vista en Cuadernillo Impreso</span>
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
                      <span class="bg-teal-600 text-white font-black px-2.5 py-1 rounded text-xs">SECCIÓN II</span>
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
                        Use las columnas <code class="bg-muted px-1 rounded">opcion_a</code> a <code class="bg-muted px-1 rounded">opcion_d</code> para las proposiciones 1 a 4. Deje <code class="bg-muted px-1 rounded">opcion_e</code> vacía. La respuesta usa la lista canónica A–E; la letra E es válida como combinación, aunque no exista texto en la columna opcion_e:
                      </p>
                      <div class="bg-muted/40 p-2.5 rounded text-[10px] font-mono space-y-1">
                        <div><strong>opcion_a:</strong> 1. Gasto respaldado con facturas originales</div>
                        <div><strong>opcion_b:</strong> 2. Gasto vinculado a la actividad gravada</div>
                        <div><strong>opcion_c:</strong> 3. Bancarización en pagos &gt;= Bs 50.000</div>
                        <div><strong>opcion_d:</strong> 4. Donaciones deducibles hasta el 50% (Falso)</div>
                        <div><strong>respuesta_correcta:</strong> A (1, 2 y 3 son verdaderas) | <strong>opcion_e:</strong> vacía | <strong>dificultad:</strong> 2</div>
                      </div>
                    </div>

                    <div class="lg:col-span-6 bg-white border border-slate-300 rounded-xl p-4 space-y-2 text-slate-900 shadow-xs">
                      <div class="flex items-center justify-between border-b border-slate-200 pb-1 text-[10px] font-mono text-slate-500">
                        <span class="font-bold uppercase text-purple-900"><i class="pi pi-file-pdf text-rose-500"></i> Vista en Cuadernillo Impreso</span>
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
                      <span class="bg-cyan-600 text-white font-black px-2.5 py-1 rounded text-xs">SECCIÓN III</span>
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
                        <span class="font-bold uppercase text-purple-900"><i class="pi pi-file-pdf text-rose-500"></i> Vista en Cuadernillo Impreso</span>
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
                      <span class="bg-blue-600 text-white font-black px-2.5 py-1 rounded text-xs">SECCIÓN IV</span>
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
                        <span class="font-bold uppercase text-purple-900"><i class="pi pi-file-pdf text-rose-500"></i> Vista en Cuadernillo Impreso</span>
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
                      <span class="bg-indigo-600 text-white font-black px-2.5 py-1 rounded text-xs">SECCIÓN V</span>
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
                        <span class="font-bold uppercase text-purple-900"><i class="pi pi-file-pdf text-rose-500"></i> Vista en Cuadernillo Impreso</span>
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
                      <span class="bg-amber-600 text-white font-black px-2.5 py-1 rounded text-xs">SECCIÓN VI</span>
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
                        <span class="font-bold uppercase text-purple-900"><i class="pi pi-file-pdf text-rose-500"></i> Vista en Cuadernillo Impreso</span>
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

              <!-- SECCIÓN 7: FÓRMULAS MATEMÁTICAS -->
              @if (filtroGuiaTipo() === 'TODOS' || filtroGuiaTipo() === 'TYPST') {
                <div class="border border-border rounded-2xl p-5 space-y-4 bg-muted/20">
                  <div class="flex items-center justify-between border-b border-border pb-3">
                    <div class="flex items-center gap-2">
                      <span class="bg-purple-700 text-white font-black px-2.5 py-1 rounded text-xs">APOYO TRANSVERSAL</span>
                      <h4 class="text-sm font-black text-foreground">Renderizado de Fórmulas Matemáticas y Químicas ($ ... $)</h4>
                    </div>
                    <span class="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
                      Aplica dentro de las secciones correspondientes
                    </span>
                  </div>

                  <div class="p-4 bg-card border border-border rounded-xl space-y-3">
                    <p class="text-xs text-muted-foreground">
                      Puedes insertar fórmulas matemáticas o químicas en el enunciado y en las opciones envolviendo la expresión con <code class="bg-muted px-1 rounded font-mono">$ ... $</code>. La previsualización usa el mismo motor Typst del examen final para interpretar raíces, potencias, subíndices, multiplicación, flechas y ±.
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
                 Descarga la <strong>Plantilla Oficial</strong> para empezar a completar tus preguntas.
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

      <!-- MODAL: ELIMINAR BANCO PERSISTIDO -->
      @if (dialogEliminarBancoPersistido()) {
        <div class="fixed inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-rose-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
            <div class="p-5 border-b border-border flex items-start justify-between gap-4">
              <div class="flex items-start gap-3">
                <div class="h-9 w-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center"><i class="pi pi-trash"></i></div>
                <div>
                  <h3 class="text-sm font-black text-foreground">Eliminar banco de preguntas</h3>
                  <p class="text-xs text-muted-foreground">{{ asignaturaNombreCompleto() }} · {{ grupoSeleccionado() }} · {{ parcialActivo() }}</p>
                </div>
              </div>
              <button (click)="cerrarEliminarBancoPersistido()" class="text-muted-foreground hover:text-foreground cursor-pointer"><i class="pi pi-times"></i></button>
            </div>
            <div class="p-5 space-y-4 text-xs">
              <div class="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-900 leading-relaxed">
                Se eliminarán el banco y sus reactivos asociados. El rol de examen volverá a <strong>PROGRAMADO</strong> para permitir una nueva carga.
              </div>
              <label class="block space-y-1.5">
                <span class="font-black text-foreground">Escribe <code class="rounded bg-rose-100 px-1.5 py-0.5 text-rose-800">ELIMINAR</code> para confirmar</span>
                <input [(ngModel)]="confirmacionEliminarBancoPersistido" autocomplete="off" class="w-full rounded-xl border border-border bg-muted/50 px-3 py-2.5 text-xs font-black uppercase tracking-wider text-foreground outline-none focus:border-rose-500" placeholder="ELIMINAR">
              </label>
            </div>
            <div class="p-4 border-t border-border flex justify-end gap-2">
              <button (click)="cerrarEliminarBancoPersistido()" class="px-4 py-2 rounded-xl border border-border text-xs font-bold text-muted-foreground cursor-pointer">Cancelar</button>
              <button (click)="confirmarEliminarBancoPersistido()" [disabled]="confirmacionEliminarBancoPersistido.trim().toUpperCase() !== 'ELIMINAR' || eliminandoBancoPersistido()" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black cursor-pointer disabled:opacity-50">
                <i class="pi" [class.pi-spin]="eliminandoBancoPersistido()" [class.pi-spinner]="eliminandoBancoPersistido()" [class.pi-trash]="!eliminandoBancoPersistido()"></i> {{ eliminandoBancoPersistido() ? 'Eliminando...' : 'Eliminar banco' }}
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Toast Notificación -->
      @if (toastMessage()) {
        <div class="app-toast fixed bottom-6 right-6 bg-foreground text-background px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 z-[20000] animate-bounce" role="status" aria-live="polite">
          <i [class]="toastType() === 'error' ? 'pi pi-exclamation-triangle text-rose-400' : 'pi pi-check-circle text-emerald-400'" class="text-lg"></i>
          <span class="text-xs font-bold">{{ toastMessage() }}</span>
        </div>
      }

    </div>
  `
})
export class BancoPreguntasComponent implements OnInit {
  public readonly storage = inject(EvaluacionesStorageService);
  private readonly _sanitizer = inject(DomSanitizer);
  private readonly _gateway = inject(UnitepcGatewayService);
  private readonly _rolService = inject(RolExamenService);
  private readonly _bancoService = inject(BancoPreguntasService);
  private readonly _configuracionService = inject(ConfiguracionEvaluacionesService);
  private readonly _generacionTypst = inject(GeneracionTypstService);
  private readonly _sinCartillaService = inject(ExamenSinCartillaService);

  @ViewChild('fileInput') public fileInputRef!: ElementRef<HTMLInputElement>;
  @ViewChild('imageInput') public imageInputRef!: ElementRef<HTMLInputElement>;

  // Archivo Excel original para subir al backend
  public archivoExcelSeleccionado = signal<File | null>(null);
  public archivoSinCartillaSeleccionado = signal<File | null>(null);
  public documentoSinCartilla = signal<DocumentoSinCartilla | null>(null);
  public cargandoDocumentoSinCartilla = signal<boolean>(false);
  private readonly maxDocumentoSinCartillaBytes = 5 * 1024 * 1024;

  // Pestaña activa: 'validador' (default) o 'calendario'
  public tabActiva = signal<'validador' | 'calendario'>('validador');
  public vistaCalendario = signal<'calendario' | 'lista'>('calendario');

  // Estados de Datos Reales de SEA Gateway
  public sedes = signal<BranchOffice[]>([]);
  public sedeSeleccionada = signal<BranchOffice | null>(null);

  public carreras = signal<Career[]>([]);
  public carreraSeleccionada = signal<Career | null>(null);

  public asignaturas = signal<Course[]>([]);
  public asignaturaSeleccionada = signal<Course | null>(null);

  public asignaturaOpciones = computed<SearchableSelectOption[]>(() =>
    this.asignaturas()
      .slice()
      .sort((a, b) => this.compararCodigos(a.courseCode, b.courseCode))
      .map(asignatura => ({
        value: asignatura.courseCode,
        label: `[${asignatura.courseCode}] ${asignatura.courseName}`,
        searchText: `${asignatura.courseCode} ${asignatura.courseName}`
      }))
  );

  public grupos = signal<GroupItem[]>([]);
  public grupoSeleccionado = signal<string>('');
  public rolesOficiales = signal<RolExamenResponse[]>([]);

  public cargandoSedes = signal<boolean>(false);
  public cargandoCarreras = signal<boolean>(false);
  public cargandoAsignaturas = signal<boolean>(false);
  public cargandoGrupos = signal<boolean>(false);

  public asignaturaNombreCompleto = computed(() => {
    const asig = this.asignaturaSeleccionada();
    if (!asig) return 'Selecciona una asignatura';
    return `[${asig.courseCode}] ${asig.courseName}`;
  });

  public carreraNombreCompleto = computed(() => {
    return this.carreraSeleccionada()?.careerName || 'Selecciona una carrera';
  });

  public rolExamenActivo = computed(() => {
    const materiaCodigo = this.asignaturaSeleccionada()?.courseCode;
    const grupo = this.grupoSeleccionado();
    const parcial = this._mapParcialBackend(this.parcialActivo());
    const rolSeleccionado = this.rolesOficiales().find(rol => rol.id === this.examenRolSeleccionadoId());

    // El ID seleccionado puede quedar de una materia anterior. Nunca debe
    // prevalecer sobre la materia, grupo y parcial visibles actualmente.
    if (materiaCodigo && grupo && parcial) {
      const compatibles = this.rolesOficiales().filter(rol =>
        rol.materiaCodigo === materiaCodigo &&
        rol.grupo === grupo &&
        rol.tipoParcial === parcial
      );
      return compatibles.find(rol => rol.id === this.examenRolSeleccionadoId())
        || compatibles.find(rol => rol.estadoFlujo === 'PROGRAMADO' || rol.estadoFlujo === 'VALIDADO')
        || compatibles[0]
        || null;
    }

    return rolSeleccionado || null;
  });

  public docenteOficialActivo = computed(() => {
    const rol = this.rolExamenActivo();
    return {
      nombre: rol?.docenteNombre?.trim() || 'Docente no disponible en los servicios institucionales',
      ci: rol?.docenteCi?.trim() || '—',
      correo: 'No informado por SEA'
    };
  });

  public rolPuedeCargarBanco = computed(() => {
    const estado = this.rolExamenActivo()?.estadoFlujo;
    return estado === 'PROGRAMADO' || estado === 'VALIDADO';
  });

  public esSinCartillaActivo(): boolean {
    return this.rolExamenActivo()?.modalidad === 'PRESENCIAL_SIN_CARTILLA';
  }

  public rolPuedeEliminarBanco = computed(() => {
    const estado = this.rolExamenActivo()?.estadoFlujo;
    return this.bancoPersistido() !== null && (estado === 'PROGRAMADO' || estado === 'VALIDADO');
  });

  public ngOnInit(): void {
    this._configuracionService.cargar().subscribe({
      error: () => {
        // Se conservan los valores oficiales predeterminados del servicio.
      }
    });
    this._cargarSedes();
  }

  private _cargarSedes(): void {
    this.cargandoSedes.set(true);
    this._gateway.getBranchOffices().subscribe({
      next: data => {
        this.sedes.set(data);
        this.cargandoSedes.set(false);
        const sedeInicial = this._gateway.resolverSedeInicial(data);
        if (sedeInicial) {
          this.seleccionarSede(sedeInicial);
        }
      },
      error: () => this.cargandoSedes.set(false)
    });
  }

  public onSedeChange(sedeCode: string): void {
    const sede = this.sedes().find(s => s.code === sedeCode);
    if (sede) {
      this.seleccionarSede(sede);
    }
  }

  public seleccionarSede(sede: BranchOffice): void {
    this.sedeSeleccionada.set(sede);
    this.carreraSeleccionada.set(null);
    this.asignaturas.set([]);
    this.asignaturaSeleccionada.set(null);
    this._cargarCarrerasDeSede(sede.code);
  }

  private _cargarCarrerasDeSede(branchCode: string): void {
    this.cargandoCarreras.set(true);
    this._gateway.getCareers(branchCode).subscribe({
      next: data => {
        this.carreras.set(data);
        this.cargandoCarreras.set(false);
        if (data.length > 0) {
          this.seleccionarCarrera(data[0]);
        }
      },
      error: () => this.cargandoCarreras.set(false)
    });
  }

  public onCarreraChange(careerCode: string): void {
    const carrera = this.carreras().find(c => c.careerCode === careerCode);
    if (carrera) {
      this.seleccionarCarrera(carrera);
    }
  }

  public seleccionarCarrera(carrera: Career): void {
    this.carreraSeleccionada.set(carrera);
    const sede = this.sedeSeleccionada();
    if (sede) {
      this._cargarRolesOficiales(sede.code, carrera.careerCode);
      this._cargarMateriasDeCarrera(sede.code, carrera.careerCode);
    }
  }

  private _cargarRolesOficiales(sedeCodigo: string, carreraCodigo: string): void {
    this._rolService.listar(sedeCodigo, carreraCodigo).subscribe({
      next: roles => {
        this.rolesOficiales.set(roles);
        this.listaExamenesDocente = roles.map(rol => this._mapearRolACronograma(rol));
        this.examenRolSeleccionadoId.set(null);
        if (roles.length > 0) {
          const fecha = new Date(`${roles[0].fecha}T00:00:00`);
          if (!Number.isNaN(fecha.getTime())) {
            this.mesActual.set(fecha.getMonth());
            this.anioActual.set(fecha.getFullYear());
          }

          const materiaActual = this.asignaturaSeleccionada()?.courseCode;
          const materiaActualTieneRol = roles.some(rol => rol.materiaCodigo === materiaActual);
          if (!materiaActualTieneRol) {
            const materiaConRol = this.asignaturas().find(materia =>
              roles.some(rol => rol.materiaCodigo === materia.courseCode)
            );
            if (materiaConRol) this.seleccionarAsignatura(materiaConRol);
          }
          this._sincronizarRolSeleccionadoConContexto();
        } else {
          this.examenRolSeleccionadoId.set(null);
        }
      },
      error: err => {
        this.rolesOficiales.set([]);
        this.listaExamenesDocente = [];
        this._mostrarToast(err?.error?.error || 'No se pudieron cargar los roles de examen oficiales.', 'error');
      }
    });
  }

  private _cargarMateriasDeCarrera(branchCode: string, careerCode: string): void {
    this.cargandoAsignaturas.set(true);
    this._gateway.getCourses(branchCode, careerCode).subscribe({
      next: data => {
        const asignaturasOrdenadas = data.slice().sort((a, b) => this.compararCodigos(a.courseCode, b.courseCode));
        this.asignaturas.set(asignaturasOrdenadas);
        this.cargandoAsignaturas.set(false);
        if (asignaturasOrdenadas.length > 0) {
          const materiaConRol = asignaturasOrdenadas.find(m => this.rolesOficiales().some(rol => rol.materiaCodigo === m.courseCode));
          const defaultAsig = materiaConRol || asignaturasOrdenadas[0];
          this.seleccionarAsignatura(defaultAsig);
        }
      },
      error: () => this.cargandoAsignaturas.set(false)
    });
  }

  private compararCodigos(a: string, b: string): number {
    return (a || '').localeCompare(b || '', 'es', { numeric: true, sensitivity: 'base' });
  }

  public onAsignaturaChange(courseCode: string): void {
    const asig = this.asignaturas().find(m => m.courseCode === courseCode);
    if (asig) {
      this.seleccionarAsignatura(asig);
    }
  }

  public onGrupoChange(grupo: string): void {
    this.grupoSeleccionado.set(grupo);
    this._sincronizarRolSeleccionadoConContexto();
    this.pdfPrevisualizadoYConforme.set(false);
  }

  public seleccionarAsignatura(asig: Course): void {
    this.asignaturaSeleccionada.set(asig);
    // Evita conservar el ID de otra asignatura mientras se cargan los grupos.
    this.examenRolSeleccionadoId.set(null);
    this.pdfPrevisualizadoYConforme.set(false);
    this._cargarGruposDeMateria(asig.syllabusCourseId);
  }

  private _cargarGruposDeMateria(syllabusCourseId: string, grupoPreferido?: string): void {
    this.cargandoGrupos.set(true);
    const sede = this.sedeSeleccionada();
    const carrera = this.carreraSeleccionada();
    this._gateway.getGroups('2-2026', sede?.branchOfficeId, carrera?.careerId, syllabusCourseId, sede?.code, carrera?.careerCode).subscribe({
      next: data => {
        this.grupos.set(data);
        this.cargandoGrupos.set(false);
        if (data.length > 0) {
          const rolDeSeleccion = this.rolesOficiales().find(rol =>
            rol.materiaCodigo === this.asignaturaSeleccionada()?.courseCode &&
            rol.tipoParcial === this._mapParcialBackend(this.parcialActivo()) &&
            data.some(grupo => grupo.code === rol.grupo)
          );
          const codigoPreferido = grupoPreferido && data.some(grupo => grupo.code === grupoPreferido)
            ? grupoPreferido
            : rolDeSeleccion?.grupo;
          this.grupoSeleccionado.set(codigoPreferido || data[0].code);
          this._sincronizarRolSeleccionadoConContexto();
        } else {
          const rol = this.rolesOficiales().find(r =>
            r.materiaCodigo === this.asignaturaSeleccionada()?.courseCode &&
            r.tipoParcial === this._mapParcialBackend(this.parcialActivo())
          );
          this.grupoSeleccionado.set(grupoPreferido || rol?.grupo || '');
          this._sincronizarRolSeleccionadoConContexto();
        }
      },
      error: () => {
        this.cargandoGrupos.set(false);
        const rol = this.rolesOficiales().find(r =>
          r.materiaCodigo === this.asignaturaSeleccionada()?.courseCode &&
          r.tipoParcial === this._mapParcialBackend(this.parcialActivo())
        );
        this.grupoSeleccionado.set(grupoPreferido || rol?.grupo || '');
        this._sincronizarRolSeleccionadoConContexto();
      }
    });
  }

  public mesActual = signal<number>(new Date().getMonth());
  public anioActual = signal<number>(new Date().getFullYear());

  public mesesSemestre = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ].map((label, mesIndex) => ({ label, mesIndex }));

  public examenSeleccionadoModal = signal<ExamenDocenteCronograma | null>(null);

  public parcialActivo = signal<'1er Parcial' | '2do Parcial' | 'Examen Final' | '2da Instancia'>('1er Parcial');
  public nombreArchivoCargado = signal<string | null>(null);
  public imagenBase64Generada = signal<string | null>(null);
  public imagenNombre = signal<string | null>(null);
  public mostrarHerramientaImagen = signal<boolean>(false);
  public tamanoImagen = signal<TamanoImagen>('MEDIANA');
  public procesandoImagen = signal<boolean>(false);
  public errorImagen = signal<string>('');
  public tamanosImagen: Array<{ valor: TamanoImagen; etiqueta: string }> = [
    { valor: 'GRANDE', etiqueta: 'Grande' },
    { valor: 'MEDIANA', etiqueta: 'Mediana' },
    { valor: 'PEQUENA', etiqueta: 'Pequeña' },
    { valor: 'MUY_PEQUENA', etiqueta: 'Muy pequeña' }
  ];
  public alturaImagenPrevisualizacion = computed(() => {
    const alturas: Record<TamanoImagen, number> = { GRANDE: 58, MEDIANA: 36, PEQUENA: 24, MUY_PEQUENA: 15 };
    return alturas[this.tamanoImagen()];
  });
  public imagenBase64ParaCopiar = computed(() => {
    const imagen = this.imagenBase64Generada();
    if (!imagen) return '';
    return this.agregarTamanoImagen(imagen, this.tamanoImagen());
  });
  public cargandoBanco = signal<boolean>(false);
  public bancoPersistido = signal<BancoPreguntasResponse | null>(null);
  public cargandoBancoPersistido = signal<boolean>(false);
  public dialogEliminarBancoPersistido = signal<boolean>(false);
  public confirmacionEliminarBancoPersistido = '';
  public eliminandoBancoPersistido = signal<boolean>(false);
  public dialogEjemplos = signal<boolean>(false);
  public filtroGuiaTipo = signal<string>('TODOS');
  public dialogPrevisualizacionPdf = signal<boolean>(false);
  public pdfPreviewUrl = signal<SafeResourceUrl | null>(null);
  public pdfPreviewPages = signal<string[]>([]);
  private pdfPreviewObjectUrl: string | null = null;
  public documentoRecorridoCompleto = signal<boolean>(false);
  public pdfPrevisualizadoYConforme = signal<boolean>(false);
  public dialogPrevisualizacionPkg = signal<boolean>(false);
  public tabPrevisualizacionPkg = signal<'cifrado' | 'desencriptado'>('cifrado');
  public pkgHexData = signal<string>('');
  public pkgJsonData = signal<string>('');
  public dialogEnvioEvaluaciones = signal<boolean>(false);
  public enviandoCorreo = signal<boolean>(false);
  public comprobanteGenerado = signal<ComprobanteEnvio | null>(null);

  // Estado de generación Typst (Fase 3)
  public toastMessage = signal<string | null>(null);
  public toastType = signal<'success' | 'error'>('success');

  // Directorio Institucional de Oficinas de Evaluación por Campus (Múltiples correos por campus)
  public listaCampusEvaluacion: CampusEvaluacion[] = [
    { id: 'CBBA-COL', nombre: 'Cochabamba - Campus Colonial (Central)', ciudad: 'Cochabamba', correos: ['evaluaciones.cochabamba@unitepc.edu.bo'], oficina: 'Jefatura de Evaluaciones Bloque A' },
    { id: 'CBBA-FLO', nombre: 'Cochabamba - Campus Florida (Salud)', ciudad: 'Cochabamba', correos: ['evaluaciones.florida@unitepc.edu.bo'], oficina: 'Oficina Evaluaciones Salud' },
    { id: 'LPZ-CEN', nombre: 'La Paz - Sede Central', ciudad: 'La Paz', correos: ['evaluaciones.lapaz@unitepc.edu.bo', 'evaluaciones.central@unitepc.edu.bo'], oficina: 'Evaluaciones Sede La Paz' },
    { id: 'EAL-SAT', nombre: 'El Alto - Campus Satélite', ciudad: 'El Alto', correos: ['evaluaciones.elalto@unitepc.edu.bo'], oficina: 'Oficina Evaluaciones El Alto' },
    { id: 'SCZ-NOR', nombre: 'Santa Cruz - Sede Norte', ciudad: 'Santa Cruz', correos: ['evaluaciones.santacruz@unitepc.edu.bo'], oficina: 'Jefatura Evaluaciones Santa Cruz' },
    { id: 'GYM-BEN', nombre: 'Guayaramerín - Sede Beni', ciudad: 'Guayaramerín', correos: ['evaluaciones.guayaramerin@unitepc.edu.bo'], oficina: 'Oficina Evaluaciones Beni' },
    { id: 'COB-PAN', nombre: 'Cobija - Sede Pando', ciudad: 'Cobija', correos: ['evaluaciones.cobija@unitepc.edu.bo'], oficina: 'Oficina Evaluaciones Pando' },
    { id: 'IVI-TRO', nombre: 'Ivirgarzama - Campus Trópico', ciudad: 'Ivirgarzama', correos: ['evaluaciones.ivirgarzama@unitepc.edu.bo'], oficina: 'Oficina Evaluaciones Trópico' }
  ];



  public campusSeleccionadoId = 'CBBA-COL';
  public examenRolSeleccionadoId = signal<string | null>(null);
  public observacionesDocenteEnvio = '';

  public campusActivo = computed(() => {
    return this.listaCampusEvaluacion.find(c => c.id === this.campusSeleccionadoId) || this.listaCampusEvaluacion[0];
  });

  public listaExamenesDocente: ExamenDocenteCronograma[] = [];

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
    this.examenRolSeleccionadoId.set(ex.id);
    const asignatura = this.asignaturas().find(item => item.courseCode === ex.codigo);
    if (asignatura) {
      this.asignaturaSeleccionada.set(asignatura);
      this._cargarGruposDeMateria(asignatura.syllabusCourseId, ex.grupo);
    }
    this.grupoSeleccionado.set(ex.grupo);
    this.tabActiva.set('validador');
    this._mostrarToast(`Redirigido al Validador para: ${ex.materia} (${ex.tipo}).`);
  }

  private _mapearRolACronograma(rol: RolExamenResponse): ExamenDocenteCronograma {
    const tipo = rol.tipoParcial === 'Final' ? 'Examen Final' : rol.tipoParcial;
    const estado = rol.estadoFlujo.charAt(0) + rol.estadoFlujo.slice(1).toLowerCase();
    return {
      id: rol.id,
      codigo: rol.materiaCodigo,
      materia: rol.materiaNombre,
      carrera: rol.carreraNombre,
      semestre: rol.semestre,
      grupo: rol.grupo,
      tipo: tipo as ExamenDocenteCronograma['tipo'],
      fecha: rol.fechaDisplay,
      horario: rol.horario,
      aula: `${rol.aula} (${rol.campus})`,
      conCartilla: rol.modalidad === 'PRESENCIAL_CARTILLA',
      estado
    };
  }

  // Cuotas Oficiales según parcial
  public cuotasDificultad = computed(() => {
    return { facil: 15, medio: 30, dificil: 15, total: 60 };
  });

  public cuotasGrupos = computed(() => {
    return { g1: 15, g2: 30, g3: 15 };
  });

  public totalPreguntasRequeridas = computed(() => this.cuotasDificultad().total);

  public preguntasCargadas = signal<PreguntaValidada[]>([]);

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

  public observacionesValidacion = computed(() => {
    const preguntas = this.preguntasCargadas();
    if (preguntas.length === 0) return [] as string[];

    const observaciones: string[] = [];
    const cuotas = this.cuotasDificultad();
    const validas = this.totalPreguntasValidas();

    if (preguntas.length < cuotas.total) {
      observaciones.push(`Cantidad total insuficiente: se encontraron ${preguntas.length} reactivos y se requieren como mínimo ${cuotas.total}. Corrección: agrega ${cuotas.total - preguntas.length} reactivo(s) válido(s) en el Excel.`);
    }
    if (validas < cuotas.total) {
      observaciones.push(`Preguntas válidas insuficientes: hay ${validas} y se requieren como mínimo ${cuotas.total}. Corrección: corrige las filas observadas y vuelve a cargar el archivo.`);
    }
    if (this.countFaciles() < cuotas.facil) {
      observaciones.push(`Cuota de dificultad fácil incompleta: hay ${this.countFaciles()} y se requieren como mínimo ${cuotas.facil}. Corrección: agrega o corrige ${cuotas.facil - this.countFaciles()} reactivo(s) con dificultad 1.`);
    }
    if (this.countMedias() < cuotas.medio) {
      observaciones.push(`Cuota de dificultad media incompleta: hay ${this.countMedias()} y se requieren como mínimo ${cuotas.medio}. Corrección: agrega o corrige ${cuotas.medio - this.countMedias()} reactivo(s) con dificultad 2.`);
    }
    if (this.countDificiles() < cuotas.dificil) {
      observaciones.push(`Cuota de dificultad difícil incompleta: hay ${this.countDificiles()} y se requieren como mínimo ${cuotas.dificil}. Corrección: agrega o corrige ${cuotas.dificil - this.countDificiles()} reactivo(s) con dificultad 3.`);
    }

    return observaciones;
  });

  public getDetalleErroresDocente(pregunta: PreguntaValidada): DetalleErrorDocente[] {
    return pregunta.errores.map(error => this.detallarErrorDocente(pregunta, error));
  }

  private detallarErrorDocente(pregunta: PreguntaValidada, error: string): DetalleErrorDocente {
    const opciones = [
      { campo: 'opcion_a', valor: pregunta.opcion_a },
      { campo: 'opcion_b', valor: pregunta.opcion_b },
      { campo: 'opcion_c', valor: pregunta.opcion_c },
      { campo: 'opcion_d', valor: pregunta.opcion_d },
      { campo: 'opcion_e', valor: pregunta.opcion_e }
    ];

    if (error === 'Las opciones no pueden repetir el mismo texto') {
      const repetidas = new Map<string, string[]>();
      opciones.filter(opcion => opcion.valor?.trim()).forEach(opcion => {
        const huella = this.huellaTextoExcel(opcion.valor);
        repetidas.set(huella, [...(repetidas.get(huella) || []), opcion.campo]);
      });
      const gruposRepetidos = [...repetidas.values()].filter(campos => campos.length > 1);
      const valoresRepetidos = gruposRepetidos.map(campos => {
        const valor = opciones.find(opcion => opcion.campo === campos[0])?.valor || '';
        return `${campos.join(' y ')} = "${valor}"`;
      });
      return {
        regla: 'Opciones repetidas',
        problema: `Se encontró el mismo texto en ${valoresRepetidos.join('; ')}.`,
        correccion: 'Cambia una de esas opciones por una alternativa diferente y conserva solo una respuesta correcta. No copies la misma opción en dos columnas.'
      };
    }

    if (error === 'Falta tipo de reactivo') {
      return { regla: 'Columna tipo', problema: 'La columna tipo está vacía.', correccion: 'Selecciona una tipología válida, por ejemplo SELECCIÓN_MEJOR_RESPUESTA.' };
    }
    if (error.startsWith('Tipo de reactivo no reconocido:')) {
      return { regla: 'Columna tipo', problema: `El valor registrado no pertenece al catálogo oficial: ${error.replace('Tipo de reactivo no reconocido: ', '')}.`, correccion: 'Usa una tipología disponible en la guía del formato del examen y vuelve a cargar el Excel.' };
    }
    if (error === 'Falta enunciado de la pregunta') {
      return { regla: 'Columna enunciado', problema: 'El reactivo no tiene pregunta o enunciado.', correccion: 'Escribe el enunciado completo en la columna enunciado.' };
    }
    if (error.includes('código de grupo')) {
      return { regla: 'Columna grupo', problema: 'El reactivo agrupado no tiene un código para relacionarlo con su fila principal.', correccion: 'Escribe el mismo código de grupo en la fila madre y en todas sus filas hijas.' };
    }
    if (error === 'El grupo supera el máximo de 100 caracteres') {
      return { regla: 'Columna grupo', problema: 'El código de grupo supera los 100 caracteres.', correccion: 'Usa un código breve, único y compartido por las filas del mismo caso o emparejamiento.' };
    }
    if (error === 'El enunciado supera el máximo de 10000 caracteres') {
      return { regla: 'Columna enunciado', problema: 'El enunciado supera los 10.000 caracteres.', correccion: 'Reduce el texto del enunciado o divide el contenido en reactivos relacionados.' };
    }
    if (error.includes('Una opción supera el máximo de 2000')) {
      const camposLargos = opciones.filter(opcion => opcion.valor.length > 2000).map(opcion => opcion.campo);
      return { regla: 'Opciones A–E', problema: `${camposLargos.join(', ')} supera(n) los 2.000 caracteres.`, correccion: 'Resume la alternativa manteniendo una sola idea y un texto legible para el cuadernillo.' };
    }
    if (error === 'Respuesta en V/F debe ser A (Verdadero) o B (Falso)') {
      return { regla: 'Respuesta correcta', problema: 'La tipología Verdadero o Falso solo admite A o B.', correccion: 'Registra A para Verdadero o B para Falso y deja vacías las opciones C, D y E.' };
    }
    if (error.includes('Respuesta en premisas')) {
      return { regla: 'Respuesta correcta', problema: 'La tipología de premisas solo admite las claves A, B, C o D.', correccion: 'Registra una de esas cuatro letras y verifica las dos premisas.' };
    }
    if (error.includes('Requiere las 4 proposiciones')) {
      return { regla: 'Proposiciones 1–4', problema: 'Falta una o más proposiciones en las columnas opcion_a a opcion_d.', correccion: 'Completa exactamente las cuatro proposiciones y no uses opcion_e para esta tipología.' };
    }
    if (error.includes('Respuesta en V/F complejas')) {
      return { regla: 'Clave de respuesta', problema: 'La respuesta no corresponde a una clave A–E de Verdadero o Falso Complejas.', correccion: 'Registra la letra de la combinación correcta según la guía: A, B, C, D o E.' };
    }
    if (error.includes('Requiere 5 opciones completas')) {
      const faltantes = opciones.filter(opcion => !opcion.valor?.trim()).map(opcion => opcion.campo);
      return { regla: 'Opciones A–E', problema: `Faltan opciones obligatorias: ${faltantes.join(', ')}.`, correccion: 'Completa las cinco alternativas con textos diferentes antes de volver a cargar el archivo.' };
    }
    if (error === 'Respuesta debe ser una letra entre A y E') {
      return { regla: 'Respuesta correcta', problema: 'La clave registrada no es válida para una pregunta de selección.', correccion: 'Escribe únicamente A, B, C, D o E y asegúrate de que esa columna tenga texto.' };
    }
    if (error.includes('opciones de referencia')) {
      return { regla: 'Fila madre de emparejamiento', problema: 'La fila principal debe tener entre 2 y 5 opciones de referencia.', correccion: 'Completa opcion_a hasta opcion_e con entre 2 y 5 conceptos y deja vacía respuesta_correcta.' };
    }
    if (error.includes('Emparejamiento madre')) {
      return { regla: 'Fila madre de emparejamiento', problema: 'La fila principal contiene una respuesta correcta que no corresponde.', correccion: 'Deja vacía la columna respuesta_correcta de la fila madre; la clave se registra en cada fila hija.' };
    }
    if (error.includes('Respuesta de emparejamiento')) {
      return { regla: 'Respuesta de emparejamiento', problema: 'La clave de la fila hija no corresponde a una opción A–E.', correccion: 'Registra la letra de la opción relacionada: A, B, C, D o E.' };
    }
    if (error.includes('V/F simple solo permite')) {
      return { regla: 'Opciones V/F', problema: 'La fila contiene opciones adicionales a Verdadero y Falso.', correccion: 'Deja únicamente opcion_a y opcion_b; elimina los valores de opcion_c, opcion_d y opcion_e.' };
    }
    if (error.includes('V/F complejas debe dejar vacía opcion_e')) {
      return { regla: 'Opción E deshabilitada', problema: 'La columna opcion_e tiene contenido, pero esta tipología reserva la letra E para una combinación de respuestas.', correccion: 'Borra el contenido de opcion_e. Mantén la letra E, si corresponde, únicamente en respuesta_correcta.' };
    }
    if (error.includes('no permite opción E')) {
      return { regla: 'Opciones permitidas', problema: 'Esta tipología no utiliza la columna opcion_e.', correccion: 'Elimina el contenido de opcion_e y conserva únicamente las columnas permitidas por la guía.' };
    }
    if (error.includes('fila madre de caso')) {
      return { regla: 'Fila madre de caso', problema: 'La fila principal contiene opciones o respuesta correcta.', correccion: 'Deja la fila madre solo con tipo, grupo y enunciado; registra opciones y respuesta en los subítems.' };
    }
    if (error.includes('opción de emparejamiento no debe')) {
      return { regla: 'Fila hija de emparejamiento', problema: 'La fila hija contiene valores en opcion_a a opcion_e.', correccion: 'Deja vacías las opciones A–E y coloca la clave únicamente en respuesta_correcta.' };
    }
    if (error.includes('no tiene una opción activa')) {
      return { regla: 'Respuesta correcta', problema: `${error}.`, correccion: 'Completa la opción indicada o cambia respuesta_correcta a una letra que tenga texto.' };
    }
    if (error.includes('Dificultad obligatoria')) {
      return { regla: 'Columna dificultad', problema: 'El reactivo no tiene nivel de dificultad.', correccion: 'Registra 1 para fácil, 2 para medio o 3 para difícil.' };
    }
    if (error.includes('tipología madre no debe llevar dificultad')) {
      return { regla: 'Columna dificultad', problema: 'La fila madre tiene una dificultad que se asigna únicamente a los subítems.', correccion: 'Deja vacía dificultad en la fila madre y registra el nivel en las filas respondibles.' };
    }
    if (error.startsWith('Dificultad inválida:')) {
      return { regla: 'Columna dificultad', problema: `El valor registrado no es válido: ${error.replace('Dificultad inválida: ', '')}.`, correccion: 'Usa únicamente 1/Fácil, 2/Medio o 3/Difícil.' };
    }
    if (error.startsWith('Parcial ')) {
      return { regla: 'Columna parcial', problema: `${error}.`, correccion: `Selecciona el parcial correcto para este banco: ${this.parcialActivo()}.` };
    }
    if (error.startsWith('Peso inválido')) {
      return { regla: 'Columna peso', problema: 'El valor de peso no cumple el formato permitido.', correccion: 'Usa un número mayor que 0, hasta 100 y con máximo dos decimales.' };
    }
    if (error.includes('fórmula inválida')) {
      return { regla: 'Fórmula o contenido', problema: 'El enunciado u opción contiene un error de Excel, caracteres no permitidos o signos $ desbalanceados.', correccion: 'Corrige la fórmula o cierra correctamente cada expresión entre signos $.' };
    }
    if (error.includes('imagen_base64')) {
      return { regla: 'Imagen de apoyo', problema: `${error}.`, correccion: 'Usa una imagen PNG, JPG, WEBP o GIF válida, de hasta 512 KB, en formato Base64.' };
    }
    if (error.includes('pregunta está duplicada')) {
      return { regla: 'Pregunta duplicada', problema: 'Existe otra fila con el mismo tipo, grupo y enunciado.', correccion: 'Elimina la fila repetida o cambia su grupo y enunciado si realmente representa otro reactivo.' };
    }
    if (error.includes('necesita primero')) {
      return { regla: 'Orden del grupo', problema: `${error}.`, correccion: 'Coloca primero la fila madre y luego sus subítems consecutivos con el mismo código de grupo.' };
    }
    if (error.includes('debe aparecer inmediatamente')) {
      return { regla: 'Orden del grupo', problema: `${error}.`, correccion: 'Mueve la fila hija inmediatamente después de la fila madre correspondiente, sin intercalar otra pregunta.' };
    }
    if (error.includes('solo puede tener un enunciado principal')) {
      return { regla: 'Grupo duplicado', problema: `${error}.`, correccion: 'Conserva una sola fila madre por grupo y mueve las preguntas relacionadas como subítems.' };
    }
    if (error.includes('necesita entre 2 y 10')) {
      return { regla: 'Cantidad de subítems', problema: `${error}.`, correccion: 'Agrega o elimina filas hijas hasta dejar entre 2 y 10 preguntas relacionadas.' };
    }

    return { regla: 'Validación del reactivo', problema: `${error}.`, correccion: 'Revisa la fila según la guía del formato del examen y vuelve a cargar el Excel.' };
  }

  public filtroPdfDificultad = signal<'TODAS' | '1' | '2' | '3'>('TODAS');
  // Se conserva el tipo por compatibilidad con la maqueta histórica oculta;
  // la previsualización operativa siempre se genera y muestra en una columna.
  public vistaPdfColumnas = signal<'2' | '1'>('1');

  public preguntasValidasParaPdf = computed(() => {
    const todas = this.preguntasCargadas().filter(p => p.valido);
    if (this.filtroPdfDificultad() === 'TODAS') return todas;
    return todas.filter(p => p.dificultad === this.filtroPdfDificultad());
  });

  private validarEstructuraAgrupada(preguntas: PreguntaValidada[]): void {
    this.validarBloqueAgrupado(preguntas, 'CASO_CLINICO_TRONCO', 'SUBITEM_CASO', 'caso o problema', 'preguntas relacionadas');
    this.validarBloqueAgrupado(preguntas, 'EMPAREJAMIENTO_TRONCO', 'OPCION_EMPAREJAMIENTO', 'emparejamiento', 'opciones de emparejamiento');
  }

  private validarBloqueAgrupado(
    preguntas: PreguntaValidada[],
    tipoPrincipal: string,
    tipoHijo: string,
    nombreBloque: string,
    nombreHijos: string
  ): void {
    const principalesPorGrupo = new Map<string, PreguntaValidada[]>();
    const hijosPorGrupo = new Map<string, PreguntaValidada[]>();

    for (const pregunta of preguntas) {
      if (!pregunta.grupo) continue;
      if (pregunta.tipo === tipoPrincipal) {
        const grupo = principalesPorGrupo.get(pregunta.grupo) || [];
        grupo.push(pregunta);
        principalesPorGrupo.set(pregunta.grupo, grupo);
      } else if (pregunta.tipo === tipoHijo) {
        const grupo = hijosPorGrupo.get(pregunta.grupo) || [];
        grupo.push(pregunta);
        hijosPorGrupo.set(pregunta.grupo, grupo);
      }
    }

    const grupos = new Set([...principalesPorGrupo.keys(), ...hijosPorGrupo.keys()]);
    for (const grupo of grupos) {
      const principales = principalesPorGrupo.get(grupo) || [];
      const hijos = hijosPorGrupo.get(grupo) || [];

      if (principales.length === 0) {
        for (const hijo of hijos) {
          this.agregarErrorEstructural(hijo, `Esta fila de ${nombreBloque} necesita primero un enunciado principal con el mismo grupo '${grupo}'`);
        }
        continue;
      }

      for (const principalDuplicado of principales.slice(1)) {
        this.agregarErrorEstructural(principalDuplicado, `El grupo '${grupo}' solo puede tener un enunciado principal de ${nombreBloque}`);
      }

      const principal = principales[0];
      if (hijos.length < 2 || hijos.length > 10) {
        this.agregarErrorEstructural(principal, `El grupo '${grupo}' necesita entre 2 y 10 ${nombreHijos}`);
      }

      const indicePrincipal = preguntas.indexOf(principal);
      const indicesInmediatos = new Set<number>();
      let filaEsperada = principal.fila + 1;
      for (let indice = indicePrincipal + 1; indice < preguntas.length; indice++) {
        const siguiente = preguntas[indice];
        if (siguiente.tipo === tipoHijo && siguiente.grupo === grupo && siguiente.fila === filaEsperada) {
          indicesInmediatos.add(indice);
          filaEsperada++;
          continue;
        }
        break;
      }

      for (const hijo of hijos) {
        if (!indicesInmediatos.has(preguntas.indexOf(hijo))) {
          this.agregarErrorEstructural(hijo, `Esta fila debe aparecer inmediatamente después del enunciado principal del grupo '${grupo}'. No dejes otras filas entre ambos`);
        }
      }
    }
  }

  private agregarErrorEstructural(pregunta: PreguntaValidada, mensaje: string): void {
    if (pregunta.errores.includes(mensaje)) return;
    pregunta.errores.push(mensaje);
    pregunta.observaciones = pregunta.errores.join(', ');
    pregunta.valido = false;
  }

  public getDificultadNombre(dif: string): string {
    if (dif === '1') return 'Fácil';
    if (dif === '3') return 'Difícil';
    return 'Media';
  }

  public porcentajeCuota(actual: number, minimo: number): number {
    return minimo > 0 ? Math.min(100, (actual / minimo) * 100) : 0;
  }

  public nombreArchivoPaquete = computed(() => {
    const ex = this.rolExamenActivo();
    const cod = (ex?.materiaCodigo || this.asignaturaSeleccionada()?.courseCode || 'SIN_MATERIA').replace('-', '');
    const pCode = this.parcialActivo().toUpperCase().replace(' ', '_');
    return `PAQUETE_EVAL_${cod}_${pCode}_${this.anioActual()}.pkg`;
  });

  public getResumenCuota(parcial: string): string {
    return '60 preguntas';
  }

  public cambiarParcial(parcial: string): void {
    this.parcialActivo.set(parcial as any);
    this.examenRolSeleccionadoId.set(null);
    this._sincronizarRolSeleccionadoConContexto();
    this.pdfPrevisualizadoYConforme.set(false);
    this._mostrarToast(`Examen configurado para ${parcial} (${this.getResumenCuota(parcial)}).`);
  }

  private _sincronizarRolSeleccionadoConContexto(): void {
    const materiaCodigo = this.asignaturaSeleccionada()?.courseCode;
    const grupo = this.grupoSeleccionado();
    const parcial = this._mapParcialBackend(this.parcialActivo());
    if (!materiaCodigo || !grupo || !parcial) return;

    const compatibles = this.rolesOficiales().filter(rol =>
      rol.materiaCodigo === materiaCodigo &&
      rol.grupo === grupo &&
      rol.tipoParcial === parcial
    );
    const rol = compatibles.find(item => item.estadoFlujo === 'PROGRAMADO' || item.estadoFlujo === 'VALIDADO')
      || compatibles[0]
      || null;
    const nuevoId = rol?.id || null;
    if (this.examenRolSeleccionadoId() !== nuevoId) {
      this.examenRolSeleccionadoId.set(nuevoId);
      this._cargarBancoPersistido();
    }
  }

  private _cargarBancoPersistido(): void {
    const rol = this.rolExamenActivo();
    this.bancoPersistido.set(null);
    this.documentoSinCartilla.set(null);
    this.archivoSinCartillaSeleccionado.set(null);
    this.cargandoBancoPersistido.set(false);
    if (!rol) return;

    if (rol.modalidad === 'PRESENCIAL_SIN_CARTILLA') {
      this.cargandoBancoPersistido.set(true);
      this._sinCartillaService.obtenerDocumento(rol.id).pipe(catchError(() => of(null))).subscribe(documento => {
        this.documentoSinCartilla.set(documento);
        this.cargandoBancoPersistido.set(false);
      });
      return;
    }

    this.cargandoBancoPersistido.set(true);
    this._bancoService.obtenerPorRol(rol.id).pipe(
      catchError(() => of(null))
    ).subscribe(banco => {
      this.bancoPersistido.set(banco);
      this.cargandoBancoPersistido.set(false);
    });
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
    if (!this.rolPuedeCargarBanco()) {
      this._mostrarToast('El rol de examen ya avanzó en el flujo. Restablécelo a VALIDADO antes de registrar otro banco.', 'error');
      return;
    }
    this.fileInputRef.nativeElement.click();
  }

  public triggerImageInput(): void {
    this.imageInputRef?.nativeElement.click();
  }

  public onImageDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  public onImageDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer?.files?.[0];
    if (file) void this.procesarImagenBase64(file);
  }

  public onImagePaste(event: ClipboardEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const item = Array.from(event.clipboardData?.items || [])
      .find(entrada => entrada.kind === 'file' && entrada.type.startsWith('image/'));
    const file = item?.getAsFile();
    if (file) {
      void this.procesarImagenBase64(file);
    } else {
      this.errorImagen.set('El portapapeles no contiene una imagen. Copia primero una imagen y vuelve a intentarlo.');
    }
  }

  public onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) void this.procesarImagenBase64(file);
  }

  public async procesarImagenBase64(file: File): Promise<void> {
    this.errorImagen.set('');
    const formatosPermitidos = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
    if (!formatosPermitidos.includes(file.type)) {
      this.errorImagen.set('Selecciona una imagen PNG, JPG, WEBP o GIF.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.errorImagen.set('La imagen original supera el límite de 10 MB.');
      return;
    }

    this.procesandoImagen.set(true);
    try {
      const dataUrl = await this.optimizarImagenParaExcel(file);
      this.imagenBase64Generada.set(this.quitarTamanoImagen(dataUrl));
      this.imagenNombre.set(file.name);
      this.tamanoImagen.set('MEDIANA');
      this._mostrarToast('Imagen convertida a Base64 y optimizada para Excel.');
    } catch (error) {
      this.errorImagen.set(error instanceof Error ? error.message : 'No se pudo convertir la imagen.');
      this.imagenBase64Generada.set(null);
      this.imagenNombre.set(null);
    } finally {
      this.procesandoImagen.set(false);
      if (this.imageInputRef?.nativeElement) this.imageInputRef.nativeElement.value = '';
    }
  }

  public limpiarImagenBase64(): void {
    this.imagenBase64Generada.set(null);
    this.imagenNombre.set(null);
    this.errorImagen.set('');
    if (this.imageInputRef?.nativeElement) this.imageInputRef.nativeElement.value = '';
  }

  public copiarImagenBase64(): void {
    const contenido = this.imagenBase64ParaCopiar();
    if (!contenido) return;
    navigator.clipboard?.writeText(contenido).then(
      () => this._mostrarToast('Base64 copiado al portapapeles.'),
      () => this._mostrarToast('No se pudo copiar automáticamente. Selecciona el texto manualmente.', 'error')
    );
  }

  private agregarTamanoImagen(dataUrl: string, tamano: TamanoImagen): string {
    const base = this.quitarTamanoImagen(dataUrl);
    return `${base}#sea-size=${tamano}`;
  }

  private quitarTamanoImagen(dataUrl: string): string {
    return (dataUrl || '').split('#', 1)[0];
  }

  private leerImagenComoDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(String(lector.result || ''));
      lector.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
      lector.readAsDataURL(file);
    });
  }

  private cargarImagenParaCanvas(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const imagen = new Image();
      imagen.onload = () => resolve(imagen);
      imagen.onerror = () => reject(new Error('El archivo no contiene una imagen válida.'));
      imagen.src = dataUrl;
    });
  }

  private async optimizarImagenParaExcel(file: File): Promise<string> {
    const original = await this.leerImagenComoDataUrl(file);
    if (original.length <= 32767 && file.size <= 512 * 1024) return original;

    const imagen = await this.cargarImagenParaCanvas(original);
    const dimensiones = [1600, 1400, 1200, 1000, 800, 640, 520, 420, 340, 280, 220, 180, 140, 110, 80];
    const calidades = [0.9, 0.82, 0.74, 0.66, 0.58, 0.5, 0.42, 0.34, 0.26, 0.2, 0.15];
    let mejorResultado = '';

    for (const maximo of dimensiones) {
      const escala = Math.min(1, maximo / Math.max(imagen.naturalWidth, imagen.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(imagen.naturalWidth * escala));
      canvas.height = Math.max(1, Math.round(imagen.naturalHeight * escala));
      const contexto = canvas.getContext('2d');
      if (!contexto) continue;
      contexto.fillStyle = '#ffffff';
      contexto.fillRect(0, 0, canvas.width, canvas.height);
      contexto.drawImage(imagen, 0, 0, canvas.width, canvas.height);

      for (const calidad of calidades) {
        const candidatos = [
          canvas.toDataURL('image/webp', calidad),
          canvas.toDataURL('image/jpeg', calidad)
        ].sort((a, b) => a.length - b.length);
        const resultado = candidatos[0];
        if (!mejorResultado || resultado.length < mejorResultado.length) mejorResultado = resultado;
        if (resultado.length <= 32767) return resultado;
      }
    }

    if (mejorResultado.length <= 32767) return mejorResultado;
    throw new Error('No se pudo reducir la imagen al límite de una celda Excel. Usa una imagen más pequeña.');
  }

  public onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  public onDropFile(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.rolPuedeCargarBanco()) {
      this._mostrarToast('El rol de examen ya avanzó en el flujo. Restablécelo a VALIDADO antes de registrar otro banco.', 'error');
      return;
    }
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (this.esSinCartillaActivo()) {
        this.procesarArchivoSinCartilla(file);
      } else {
        this.procesarArchivoExcelReal(file);
      }
    }
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      if (this.esSinCartillaActivo()) {
        this.procesarArchivoSinCartilla(input.files[0]);
      } else {
        this.procesarArchivoExcelReal(input.files[0]);
      }
    }
  }

  public procesarArchivoSinCartilla(file: File): void {
    if (!this.esSinCartillaActivo() || !this.rolPuedeCargarBanco()) {
      this._mostrarToast('El examen sin cartilla solo se puede cargar cuando el rol de examen está PROGRAMADO o VALIDADO.', 'error');
      return;
    }
    const nombre = file.name.toLowerCase();
    if (!nombre.endsWith('.doc') && !nombre.endsWith('.docx')) {
      this._mostrarToast('Solo se aceptan documentos .doc o .docx para un examen sin cartilla.', 'error');
      return;
    }
    if (file.size > this.maxDocumentoSinCartillaBytes) {
      this._mostrarToast('El documento supera el límite máximo de 5 MB para exámenes sin cartilla.', 'error');
      return;
    }
    this.archivoSinCartillaSeleccionado.set(file);
  }

  public limpiarArchivoSinCartilla(): void {
    this.archivoSinCartillaSeleccionado.set(null);
    if (this.fileInputRef?.nativeElement) this.fileInputRef.nativeElement.value = '';
  }

  public subirDocumentoSinCartilla(): void {
    const rol = this.rolExamenActivo();
    const file = this.archivoSinCartillaSeleccionado();
    if (!rol || !file || !this.esSinCartillaActivo() || !this.rolPuedeCargarBanco() || this.cargandoDocumentoSinCartilla()) return;

    this.cargandoDocumentoSinCartilla.set(true);
    this._sinCartillaService.cargarDocumento(rol.id, file, 'DOCENTE').subscribe({
      next: documento => {
        this.documentoSinCartilla.set(documento);
        this.archivoSinCartillaSeleccionado.set(null);
        this.cargandoDocumentoSinCartilla.set(false);
        this._mostrarToast('Examen sin cartilla cargado y validado correctamente.');
        const sede = this.sedeSeleccionada();
        const carrera = this.carreraSeleccionada();
        if (sede && carrera) this._cargarRolesOficiales(sede.code, carrera.careerCode);
      },
      error: err => {
        this.cargandoDocumentoSinCartilla.set(false);
        this._mostrarToast(err?.error?.message || err?.error?.error || 'No se pudo cargar el examen sin cartilla.', 'error');
      }
    });
  }

  public abrirDocumentoSinCartilla(): void {
    const rol = this.rolExamenActivo();
    if (!rol || !this.documentoSinCartilla()) return;
    window.open(this._sinCartillaService.urlDocumento(rol.id), '_blank');
  }

  public formatearTamanoDocumento(bytes: number): string {
    if (!bytes) return '0 KB';
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  public async procesarArchivoExcelReal(file: File): Promise<void> {
    if (!this.rolPuedeCargarBanco()) {
      this._mostrarToast('El rol de examen ya avanzó en el flujo. Restablécelo a VALIDADO antes de registrar otro banco.', 'error');
      return;
    }
    this.archivoExcelSeleccionado.set(file);
    this.nombreArchivoCargado.set(file.name);
    this.preguntasCargadas.set([]);
    this.pdfPrevisualizadoYConforme.set(false);
    try {
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        this._mostrarToast('Solo se aceptan archivos Excel .xlsx; no se permiten .xls, .xlsm, .csv ni archivos renombrados.', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        this._mostrarToast('El archivo supera el límite máximo de 10 MB.', 'error');
        return;
      }
      const arrayBuffer = await file.arrayBuffer();

      // Detección temprana de archivo corrupto o HTML previo
      const previewBytes = new Uint8Array(arrayBuffer.slice(0, 150));
      const previewText = new TextDecoder('utf-8').decode(previewBytes).toLowerCase();
      if (previewText.includes('<!doctype') || previewText.includes('<html') || previewText.includes('404')) {
        this._mostrarToast('El archivo cargado es un documento HTML o está dañado. Descarga la plantilla oficial y vuelve a intentarlo.', 'error');
        return;
      }

      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });

      // El formato oficial exige una hoja llamada Banco; no se usa una hoja alternativa.
      const sheetName = workbook.SheetNames.find(s => this.normalizarEncabezadoExcel(s) === 'banco');
      if (!sheetName) {
        this._mostrarToast('No se encontró la hoja oficial "Banco" en el archivo Excel.', 'error');
        return;
      }
      const worksheet = workbook.Sheets[sheetName];

      const erroresEncabezado = this.validarEncabezadosExcel(worksheet);
      if (erroresEncabezado.length > 0) {
        this._mostrarToast(erroresEncabezado.join(' · '), 'error');
        return;
      }

      // Convertir a JSON plano
      const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '', raw: false, blankrows: true });

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
        const tipoClave = tipoUpper.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
        const enunciadoRaw = getVal(['enunciado', 'ENUNCIADO']);
        const imagenBase64 = getVal(['imagen_base64', 'imagen base64', 'imagen', 'imagen_data_uri']);
        const grupoRaw = getVal(['grupo', 'GRUPO']);
        let opA = getVal(['opcion_a', 'opcion a', 'A', 'a']);
        let opB = getVal(['opcion_b', 'opcion b', 'B', 'b']);
        let opC = getVal(['opcion_c', 'opcion c', 'C', 'c']);
        let opD = getVal(['opcion_d', 'opcion d', 'D', 'd']);
        let opE = getVal(['opcion_e', 'opcion e', 'E', 'e']);
        let respRaw = getVal(['respuesta_correcta', 'respuesta', 'RESPUESTA']).trim().toUpperCase();
        const difRaw = getVal(['dificultad', 'DIFICULTAD', 'nivel_dificultad']).trim().toUpperCase();
        const hayDatos = [tipoRaw, grupoRaw, enunciadoRaw, imagenBase64, opA, opB, opC, opD, opE, respRaw, difRaw, getVal(['parcial', 'PARCIAL']), getVal(['peso', 'PESO'])].some(valor => valor.trim() !== '');
        if (!hayDatos) return;

        // Normalizar Tipo de Pregunta Oficial UNITEPC
        let tipoNorm = '';
        if (tipoClave.includes('VERDADERO_O_FALSO_SIMPLE') || tipoClave.includes('FALSO_VERDADERO') || tipoClave === 'VF_SIMPLE') {
          tipoNorm = 'VERDADERO_O_FALSO_SIMPLE';
        } else if (tipoClave.includes('VERDADERO_O_FALSO_COMPLEJAS') || tipoClave.includes('PREGUNTA_CON_CLAVE') || tipoClave === 'VF_COMPLEJAS') {
          tipoNorm = 'VERDADERO_O_FALSO_COMPLEJAS';
        } else if (tipoClave.includes('RESPUESTA_A_B_AMBAS_NINGUNA') || tipoClave.includes('RESPUESTA_COMPUESTA') || tipoClave.includes('PREMISAS')) {
          tipoNorm = 'RESPUESTA_PREMISAS_ABCD';
        } else if (tipoClave.includes('ITEMS_AGRUPADOS') || ['PROBLEMA', 'CASO_CLINICO', 'CASO_CLINICO_TRONCO'].includes(tipoClave)) {
          tipoNorm = 'CASO_CLINICO_TRONCO';
        } else if (tipoClave.includes('SUBITEM') || tipoClave === 'SUBPROBLEMA') {
          tipoNorm = 'SUBITEM_CASO';
        } else if (['EMPAREJAMIENTO_AMPLIADO', 'EMPAREJAMIENTO_DE_CONCEPTOS', 'EMPAREJAMIENTO_TRONCO', 'EMPAREJAMIENTO'].includes(tipoClave)) {
          tipoNorm = 'EMPAREJAMIENTO_TRONCO';
        } else if (tipoClave.includes('OPCION_DE_EMPAREJAMIENTO') || tipoClave === 'OPCION_EMPAREJAMIENTO') {
          tipoNorm = 'OPCION_EMPAREJAMIENTO';
        } else if (tipoClave.includes('SELECCION') || tipoClave === 'SELECCION_SIMPLE' || tipoClave === 'SELECCION_UNICA') {
          tipoNorm = 'SELECCION_MEJOR_RESPUESTA';
        } else {
          tipoNorm = 'TIPO_NO_RECONOCIDO';
        }

        // Normalizar Respuesta Correcta (extraer letra principal A-E)
        let respNorm = '';
        if (/^[A-E]$/.test(respRaw)) respNorm = respRaw;
        else if (tipoNorm === 'VERDADERO_O_FALSO_SIMPLE' && respRaw === 'VERDADERO') respNorm = 'A';
        else if (tipoNorm === 'VERDADERO_O_FALSO_SIMPLE' && respRaw === 'FALSO') respNorm = 'B';

        // Normalizar Dificultad (1, 2, 3)
        let difNorm: '1' | '2' | '3' = '2';
        if (difRaw === '1' || difRaw === 'FACIL' || difRaw === 'FÁCIL') difNorm = '1';
        else if (difRaw === '2' || difRaw === 'MEDIO') difNorm = '2';
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
        if (!tipoRaw) {
          errores.push('Falta tipo de reactivo');
        }
        if (tipoNorm === 'TIPO_NO_RECONOCIDO') {
          errores.push(`Tipo de reactivo no reconocido: ${tipoRaw}`);
        }
        if (!enunciadoRaw && tipoNorm !== 'EMPAREJAMIENTO_TRONCO') {
          errores.push('Falta enunciado de la pregunta');
        }

        if (['CASO_CLINICO_TRONCO', 'SUBITEM_CASO', 'EMPAREJAMIENTO_TRONCO', 'OPCION_EMPAREJAMIENTO'].includes(tipoNorm)) {
          if (!grupoRaw) {
            errores.push('Esta pregunta necesita un código de grupo para relacionarla con su enunciado principal');
          }
        }

        if (grupoRaw.length > 100) errores.push('El grupo supera el máximo de 100 caracteres');
        if (enunciadoRaw.length > 10000) errores.push('El enunciado supera el máximo de 10000 caracteres');
        errores.push(...this.validarImagenBase64Excel(imagenBase64));
        if ([opA, opB, opC, opD, opE].some(opcion => opcion.length > 2000)) {
          errores.push('Una opción supera el máximo de 2000 caracteres');
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
          const activas = [opA, opB, opC, opD, opE].filter(Boolean).length;
          if (activas < 2 || activas > 5) {
            errores.push('El enunciado principal debe tener entre 2 y 5 opciones de referencia en las columnas A a E');
          }
          if (respRaw) errores.push('Emparejamiento madre no debe llevar respuesta correcta');
        } else if (tipoNorm === 'OPCION_EMPAREJAMIENTO') {
          if (!['A', 'B', 'C', 'D', 'E'].includes(respNorm)) {
            errores.push('Respuesta de emparejamiento debe ser la letra asignada (A-E)');
          }
        }

        if (tipoNorm === 'VERDADERO_O_FALSO_SIMPLE' && (opC || opD || opE)) {
          errores.push('V/F simple solo permite opciones A y B');
        }
        if (tipoNorm === 'VERDADERO_O_FALSO_COMPLEJAS' && opE) {
          errores.push('V/F complejas debe dejar vacía opcion_e');
        }
        if (tipoNorm === 'RESPUESTA_PREMISAS_ABCD' && opE) {
          errores.push(`${tipoNorm} no permite opción E`);
        }
        if (tipoNorm === 'CASO_CLINICO_TRONCO' && (opA || opB || opC || opD || opE || respRaw)) {
          errores.push('La fila madre de caso no debe llevar opciones ni respuesta correcta');
        }
        if (tipoNorm === 'OPCION_EMPAREJAMIENTO' && (opA || opB || opC || opD || opE)) {
          errores.push('La opción de emparejamiento no debe llevar opciones A-E');
        }
        if (!['CASO_CLINICO_TRONCO', 'EMPAREJAMIENTO_TRONCO', 'OPCION_EMPAREJAMIENTO', 'VERDADERO_O_FALSO_COMPLEJAS'].includes(tipoNorm)
          && respNorm && !({ A: opA, B: opB, C: opC, D: opD, E: opE } as Record<string, string>)[respNorm]) {
          errores.push(`La respuesta correcta ${respNorm} no tiene una opción activa`);
        }

        if (!['CASO_CLINICO_TRONCO', 'EMPAREJAMIENTO_TRONCO'].includes(tipoNorm) && !difRaw) {
          errores.push('Dificultad obligatoria: use 1, 2 o 3');
        } else if (['CASO_CLINICO_TRONCO', 'EMPAREJAMIENTO_TRONCO'].includes(tipoNorm) && difRaw) {
          errores.push('Esta tipología madre no debe llevar dificultad');
        } else if (difRaw && !['1', '2', '3', 'FACIL', 'FÁCIL', 'MEDIO', 'DIFICIL', 'DIFÍCIL'].includes(difRaw)) {
          errores.push(`Dificultad inválida: ${difRaw}`);
        }

        const parcialRaw = getVal(['parcial', 'PARCIAL']).trim();
        if (parcialRaw && !this.parcialExcelCoincide(parcialRaw)) {
          errores.push(`Parcial '${parcialRaw}' no coincide con el parcial seleccionado`);
        }

        const pesoRaw = getVal(['peso', 'PESO']).trim();
        const pesoNormalizado = pesoRaw.replace(',', '.');
        const pesoParsed = pesoRaw ? Number(pesoNormalizado) : 1;
        if (!Number.isFinite(pesoParsed) || pesoParsed <= 0 || pesoParsed > 100 || (pesoRaw && !/^\d+([.,]\d{1,2})?$/.test(pesoRaw))) {
          errores.push('Peso inválido: debe ser mayor que 0, máximo 100 y con hasta 2 decimales');
        }

        const textos = [enunciadoRaw, opA, opB, opC, opD, opE];
        if (textos.some(texto => this.textoExcelTieneError(texto))) {
          errores.push('El enunciado u opciones contienen una fórmula inválida, error de Excel o delimitadores $ desbalanceados');
        }
        const huellasOpciones = textos.slice(1).filter(Boolean).map(texto => this.huellaTextoExcel(texto));
        if (new Set(huellasOpciones).size !== huellasOpciones.length) {
          errores.push('Las opciones no pueden repetir el mismo texto');
        }

        const huellaPregunta = this.huellaTextoExcel(`${tipoNorm}|${grupoRaw}|${enunciadoRaw}`);
        if (preguntasParsed.some(pregunta => this.huellaTextoExcel(`${pregunta.tipo}|${pregunta.grupo}|${pregunta.enunciado}`) === huellaPregunta)) {
          errores.push('La pregunta está duplicada: mismo tipo, grupo y enunciado');
        }

        const valido = errores.length === 0;

        preguntasParsed.push({
          fila: index + 2,
          tipo: tipoNorm,
          grupo: grupoRaw,
          enunciado: enunciadoRaw || (tipoNorm === 'EMPAREJAMIENTO_TRONCO' ? 'De la lista de opciones, seleccione la respuesta correcta para cada enunciado' : ''),
          imagen_base64: this.normalizarImagenBase64Excel(imagenBase64),
          opcion_a: opA,
          opcion_b: opB,
          opcion_c: opC,
          opcion_d: opD,
          opcion_e: opE,
          opciones: { A: opA, B: opB, C: opC, D: opD, E: opE },
          respuesta_correcta: respNorm,
          dificultad: difNorm,
          peso: pesoParsed,
          observaciones: valido ? 'OK' : errores.join(', '),
          valido,
          errores
          });
        });

      this.validarEstructuraAgrupada(preguntasParsed);

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
  // DESCARGA DE PLANTILLA OFICIAL ENRIQUECIDA (4 HOJAS CON VALIDACIONES Y FÓRMULAS)
  // ============================================================
  private normalizarEncabezadoExcel(valor: string): string {
    return (valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  }

  private aliasColumnaExcel(valor: string): string | null {
    switch (this.normalizarEncabezadoExcel(valor)) {
      case 'tipo': case 'tipo_reactivo': case 'tipo_de_reactivo': return 'tipo';
      case 'grupo': case 'grupo_contexto': return 'grupo';
      case 'enunciado': case 'pregunta': return 'enunciado';
      case 'imagen': case 'imagen_base64': case 'imagen_base_64': case 'imagen_data_uri': case 'imagen_data': return 'imagen_base64';
      case 'opcion_a': case 'opciona': case 'a': return 'opcion_a';
      case 'opcion_b': case 'opcionb': case 'b': return 'opcion_b';
      case 'opcion_c': case 'opcionc': case 'c': return 'opcion_c';
      case 'opcion_d': case 'opciond': case 'd': return 'opcion_d';
      case 'opcion_e': case 'opcione': case 'e': return 'opcion_e';
      case 'respuesta': case 'respuesta_correcta': case 'clave': case 'clave_respuesta': return 'respuesta_correcta';
      case 'dificultad': case 'nivel': case 'nivel_dificultad': return 'dificultad';
      case 'parcial': case 'tipo_parcial': return 'parcial';
      case 'peso': case 'peso_puntos': case 'puntaje': return 'peso';
      default: return null;
    }
  }

  private validarEncabezadosExcel(worksheet: XLSX.WorkSheet): string[] {
    const errores: string[] = [];
    const rango = worksheet['!ref'];
    if (!rango) return ['La hoja Banco no tiene un rango de datos válido.'];
    const filas = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false }) as unknown[][];
    const encabezado = filas[0] || [];
    const columnas = new Set<string>();
    encabezado.forEach(valor => {
      const canonico = this.aliasColumnaExcel(String(valor ?? ''));
      if (!canonico) return;
      if (columnas.has(canonico)) errores.push(`Encabezado duplicado: ${String(valor)}`);
      columnas.add(canonico);
    });
    ['tipo', 'enunciado', 'opcion_a', 'opcion_b', 'opcion_c', 'opcion_d', 'opcion_e', 'respuesta_correcta', 'dificultad']
      .filter(columna => !columnas.has(columna))
      .forEach(columna => errores.push(`Falta la columna oficial obligatoria: ${columna}`));
    return errores;
  }

  private textoExcelTieneError(valor: string): boolean {
    if (!valor) return false;
    const mayusculas = valor.toUpperCase();
    return ['#REF!', '#DIV/0!', '#VALUE!', '#NAME?', '#N/A'].some(error => mayusculas.includes(error))
      || (valor.match(/\$/g) || []).length % 2 !== 0
      || [...valor].some(caracter => /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(caracter));
  }

  private normalizarImagenBase64Excel(valor: string): string | undefined {
    if (!valor?.trim()) return undefined;
    const entrada = valor.trim();
    const fragmento = entrada.indexOf('#');
    const contenido = fragmento >= 0 ? entrada.slice(0, fragmento) : entrada;
    const tamano = fragmento >= 0 && /#sea-size=(GRANDE|MEDIANA|PEQUENA|MUY_PEQUENA)$/i.test(entrada)
      ? `#sea-size=${entrada.slice(fragmento + 10).toUpperCase()}`
      : '';
    if (/^data:image\/(png|jpeg|webp|gif);base64,/i.test(contenido)) {
      const separador = contenido.indexOf(',');
      return `${contenido.slice(0, separador + 1)}${contenido.slice(separador + 1).replace(/\s+/g, '')}${tamano}`;
    }
    return `data:image/png;base64,${contenido.replace(/\s+/g, '')}${tamano}`;
  }

  private validarImagenBase64Excel(valor: string): string[] {
    if (!valor?.trim()) return [];
    const entrada = valor.trim();
    if (entrada.length > 32767) return ['La imagen_base64 supera el límite de 32767 caracteres de una celda Excel'];
    const fragmento = entrada.indexOf('#');
    const contenido = fragmento >= 0 ? entrada.slice(0, fragmento) : entrada;
    if (fragmento >= 0 && !/#sea-size=(GRANDE|MEDIANA|PEQUENA|MUY_PEQUENA)$/i.test(entrada)) {
      return ['El metadato de tamaño de la imagen no es válido'];
    }
    let payload = contenido;
    if (/^data:/i.test(contenido)) {
      const separador = contenido.indexOf(',');
      if (separador < 0 || !/^data:image\/(png|jpeg|webp|gif);base64,/i.test(contenido.slice(0, separador + 1))) {
        return ['La imagen debe ser una data URI Base64 PNG, JPEG, WEBP o GIF'];
      }
      payload = contenido.slice(separador + 1);
    }
    try {
      const binario = atob(payload.replace(/\s+/g, ''));
      if (!binario.length || binario.length > 512 * 1024) return ['La imagen debe pesar entre 1 byte y 512 KB'];
      return [];
    } catch {
      return ['La imagen_base64 no contiene una codificación Base64 válida'];
    }
  }

  private huellaTextoExcel(valor: string): string {
    return (valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
  }

  private parcialExcelCoincide(valor: string): boolean {
    const parcial = this.normalizarEncabezadoExcel(valor).replace(/_/g, '');
    switch (this.parcialActivo()) {
      case '1er Parcial': return ['1p', '1erparcial', 'primerparcial'].includes(parcial);
      case '2do Parcial': return ['2p', '2doparcial', 'segundoparcial'].includes(parcial);
      case 'Examen Final': return ['ef', 'final', 'examenfinal'].includes(parcial);
      case '2da Instancia': return ['2i', '2dainstancia', 'segundainstancia'].includes(parcial);
      default: return false;
    }
  }

  public descargarExcelBaseMacro(): void {
    const filename = 'formato_banco_preguntas_asig_EF_1P.xlsx';
    const asigNombre = this.asignaturaNombreCompleto();
    const link = document.createElement('a');
    link.href = `assets/${filename}`;
    link.download = 'PLANTILLA_BANCO_PREGUNTAS_1P.xlsx';
    link.click();
    this._mostrarToast(`Plantilla oficial descargada para ${asigNombre} (${this.grupoSeleccionado()}).`);
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
    const rolActivo = this.rolExamenActivo();
    const examenRol = rolActivo ? this._mapearRolACronograma(rolActivo) : undefined;
    if (!examenRol) {
      this.enviandoCorreo.set(false);
      this._mostrarToast('Selecciona un rol de examen oficial antes de preparar el envío.', 'error');
      return;
    }
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
      correoDocente: this.docenteOficialActivo().correo,
      docenteNombre: this.docenteOficialActivo().nombre,
      docenteCi: this.docenteOficialActivo().ci,
      materia: examenRol.materia,
      codigoMateria: examenRol.codigo,
      grupo: examenRol.grupo,
      parcial: this.parcialActivo(),
      modalidad: examenRol.conCartilla ? 'Con Cartilla Óptica' : 'Sin Cartilla',
      totalPreguntas: preguntasValidas.length,
      hashCriptografico: this.rolExamenActivo()?.hashEncriptacion || '',
      nombreArchivoPkg: this.nombreArchivoPaquete()
    };

    setTimeout(() => {
      this.enviandoCorreo.set(false);
      this.comprobanteGenerado.set(comprobante);

      // 1. Descargar automáticamente el paquete encriptado .pkg
      this.generarYDescargarPaqueteEncriptado();

      // 2. Abrir la aplicación de correo del usuario (mailto)
      this.abrirClienteCorreo(comprobante);

      this._mostrarToast('Plantilla y paquete preparados con los datos registrados del rol de examen oficial.');
    }, 600);
  }

  public generarTextoCuerpoCorreo(c: ComprobanteEnvio): string {
    return `========================================================================
SISTEMA DE EVALUACIONES ACADÉMICAS UNITEPC
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
• Total de Preguntas Validadas: ${c.totalPreguntas} reactivos conformes (cuotas mínimas cumplidas)
• Archivo del Paquete Encriptado: ${c.nombreArchivoPkg}
• Sello Criptográfico SHA-256: ${c.hashCriptografico}

4. OBSERVACIONES:
${this.observacionesDocenteEnvio ? this.observacionesDocenteEnvio : 'Sin observaciones adicionales.'}

========================================================================
* NOTA: Adjunto se remite el archivo de paquete (${c.nombreArchivoPkg}) generado por el sistema institucional.
* Mensaje oficial generado por el Sistema de Evaluaciones UNITEPC.
========================================================================`;
  }

  public abrirClienteCorreo(c: ComprobanteEnvio): void {
    const subject = encodeURIComponent(`[2026] Remisión de examen: [${c.codigoMateria}] ${c.materia} (${c.parcial}) - ${c.grupo}`);
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

  // Previsualización PDF oficial: se genera como PDF real, en Oficio, una sola
  // columna y sin identidad de estudiante. La aprobación continúa siendo la
  // única operación que persiste el banco en PostgreSQL.
  public async abrirModalPrevisualizacionPdf(): Promise<void> {
    const preguntas = this.preguntasCargadas().filter(p => p.valido);
    if (!preguntas.length) {
      this._mostrarToast('No hay reactivos válidos para generar la previsualización PDF.', 'error');
      return;
    }

    this._liberarPdfPreview();
    this.documentoRecorridoCompleto.set(false);
    try {
      const pdf = await this._crearPdfPreviewConTypst(preguntas);
      this.pdfPreviewObjectUrl = URL.createObjectURL(pdf);
      this.pdfPreviewUrl.set(this._sanitizer.bypassSecurityTrustResourceUrl(this.pdfPreviewObjectUrl));
      this.dialogPrevisualizacionPdf.set(true);
      const paginas = await this._renderizarPaginasPdfPreview(pdf);
      this.pdfPreviewPages.set(paginas);
      // Si todo el documento cabe en el área visible no existe desplazamiento
      // pendiente; para documentos de varias páginas se habilita únicamente
      // al llegar al final del contenedor real de páginas.
      setTimeout(() => this._comprobarFinPrevisualizacion(), 0);
    } catch (error) {
      console.error('[BancoPreguntasComponent] No se pudo generar la previsualización PDF:', error);
      this.dialogPrevisualizacionPdf.set(false);
      this._liberarPdfPreview();
      this._mostrarToast('No se pudo generar el PDF oficial de previsualización.', 'error');
    }
  }

  private async _crearPdfPreviewConTypst(preguntas: PreguntaValidada[]): Promise<Blob> {
    const rol = this.rolExamenActivo();
    if (!rol?.id) throw new Error('No existe un rol de examen activo para previsualizar');
    const request: PrevisualizacionTypstRequest = {
      jobId: `PREVIEW-${crypto.randomUUID()}`,
      rolExamenId: rol.id,
      preguntas: preguntas.map(pregunta => ({
        id: pregunta.fila,
        fila: pregunta.fila,
        tipo: pregunta.tipo,
        grupo: pregunta.grupo,
        enunciado: pregunta.enunciado,
        imagen_base64: pregunta.imagen_base64,
        opcion_a: pregunta.opcion_a,
        opcion_b: pregunta.opcion_b,
        opcion_c: pregunta.opcion_c,
        opcion_d: pregunta.opcion_d,
        opcion_e: pregunta.opcion_e,
        respuesta_correcta: pregunta.respuesta_correcta,
        dificultad: pregunta.dificultad,
      }))
    };
    const accepted = await firstValueFrom(this._generacionTypst.solicitarPrevisualizacion(request));
    const resultado = await firstValueFrom(this._generacionTypst.esperarResultado(accepted.jobId, 1000, 90));
    if (String(resultado.estado || '').startsWith('ERROR')) {
      throw new Error(resultado.mensaje || 'Typst no pudo generar la previsualización');
    }
    const path = resultado.variantes?.[0]?.archivoPdfPath;
    if (!path) throw new Error('Typst terminó sin devolver el PDF de previsualización');
    return firstValueFrom(this._generacionTypst.descargarArchivo(path));
  }

  private async _crearPdfPreviewOficial(preguntas: PreguntaValidada[]): Promise<Blob> {
    const configuracion = this._configuracionService.configuracion();
    const dimensiones = (configuracion.formatoHoja || '').toUpperCase().includes('A4')
      ? { ancho: 210, alto: 297 }
      : { ancho: 215.9, alto: 330.2 };
    const ancho = dimensiones.ancho;
    const alto = dimensiones.alto;
    const margen = 20;
    const pieReservado = 18;
    const tamanoFuente = Number(configuracion.tamanoLetraPt) || 11;
    const factoresLeading = (configuracion.espaciadoLeading || '').match(/\d+(?:\.\d+)?/g)?.map(Number) || [];
    // jsPDF no usa el mismo interlineado interno que Typst cuando recibe un
    // arreglo de líneas. Usamos una separación explícita para conservar la
    // legibilidad del formato oficial y evitar solapamientos.
    const interlineadoBase = tamanoFuente * (factoresLeading[0] || 0.8) * 0.352778;
    const interlineado = Math.max(interlineadoBase, 4.3);
    const separacionPregunta = Math.max(
      tamanoFuente * (factoresLeading[1] || 1.2) * 0.352778,
      5.8
    );
    const indentacion = tamanoFuente * 0.352778;
    const fuenteConfigurada = (configuracion.tipoLetra || '').toLowerCase();
    const familiaFuente = fuenteConfigurada.includes('arial')
      ? 'helvetica'
      : fuenteConfigurada.includes('courier') ? 'courier' : 'times';
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [ancho, alto], compress: true });
    let pagina = 1;
    let y = margen;

    // Método histórico de respaldo para la previsualización. La ruta activa
    // utiliza el mismo motor Typst del examen final. No basta
    // con enviar el texto de Excel tal cual: jsPDF no interpreta los
    // delimitadores $...$ ni la sintaxis Typst. Esta conversión conserva el
    // contenido normal y transforma la notación académica más utilizada en
    // una representación legible para las fuentes estándar de jsPDF. Las
    // fuentes integradas no soportan de forma confiable todos los glifos
    // Unicode (subíndices, raíces y flechas), por lo que la ecuación se
    // imprime en una línea independiente con una notación ASCII clara.
    const convertirDecoradoresFormula = (formula: string): string => {
      let resultado = formula
        .replace(/\\(?:text|mathrm)\s*\{([^{}]*)\}/gi, '$1')
        .replace(/\\(?:times|cdot)\b/gi, '*')
        .replace(/\\(?:rightarrow|to)\b/gi, '->')
        .replace(/\\(?:pm)\b/gi, '+/-')
        .replace(/\b(?:times|cdot)\b/gi, '*')
        .replace(/\b(?:arrow|rightarrow)\b/gi, '->')
        .replace(/\bpm\b/gi, '+/-')
        .replace(/\+\s*-/g, '+/-')
        .replace(/-\s*\+/g, '-/+')
        .replace(/=>|->/g, '->')
        .replace(/\\sqrt\s*/gi, 'sqrt')
        .replace(/\bsqrt\s*/gi, 'sqrt')
        .replace(/\\(alpha|beta|gamma|delta|epsilon|theta|lambda|mu|sigma|omega|phi|psi)\b/gi, '$1');

      // Convierte _2 y _{n} a subíndices visibles en línea base (H2SO4),
      // y conserva ^2 como notación explícita para no perder el exponente.
      resultado = resultado.replace(/([_^])\s*(?:\{([^{}]*)\}|([A-Za-z0-9+()=\-]+))/g, (_match, operador: string, grupo: string, simple: string) => {
        const valor = grupo ?? simple ?? '';
        return operador === '_' ? valor : `^${valor}`;
      });

      // En fórmulas químicas es habitual separar los símbolos con espacios
      // para facilitar la carga en Excel: H_2 S O_4 / N a O H.
      return resultado
        .replace(/(?<=[A-Za-z0-9])\s+(?=[A-Za-z0-9])/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    };

    const textoPdfConFormula = (texto: string): string => {
      if (!texto) return '';
      const segmentos = texto.split(/(\$[^$]*\$)/g);
      return segmentos.map((segmento, indice) => {
        if (!segmento) return '';
        return indice % 2 === 1
          // Cada expresión se separa para evitar que una fórmula larga
          // desplace el texto vecino o salga del ancho de la hoja.
          ? `\n${convertirDecoradoresFormula(segmento.slice(1, -1))}\n`
          : segmento;
      }).join('').replace(/\n{3,}/g, '\n\n').trim();
    };

    const cargarLogo = (): Promise<string | null> => new Promise(resolve => {
      const imagen = new Image();
      imagen.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = imagen.naturalWidth || 1;
        canvas.height = imagen.naturalHeight || 1;
        const contexto = canvas.getContext('2d');
        if (!contexto) {
          resolve(null);
          return;
        }
        contexto.drawImage(imagen, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      imagen.onerror = () => resolve(null);
      imagen.src = '/assets/logo_unitepc_clean.png';
    });
    const logoData = await cargarLogo();
    const imagenesPdf = new Map<string, { dataUrl: string; width: number; height: number }>();
    const cargarImagenPregunta = (valor?: string): Promise<{ dataUrl: string; width: number; height: number } | null> => {
      const contenido = (valor || '').split('#', 1)[0];
      if (!contenido) return Promise.resolve(null);
      const guardada = imagenesPdf.get(contenido);
      if (guardada) return Promise.resolve(guardada);
      return new Promise(resolve => {
        const imagen = new Image();
        imagen.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = imagen.naturalWidth || 1;
          canvas.height = imagen.naturalHeight || 1;
          const contexto = canvas.getContext('2d');
          if (!contexto) {
            resolve(null);
            return;
          }
          contexto.fillStyle = '#ffffff';
          contexto.fillRect(0, 0, canvas.width, canvas.height);
          contexto.drawImage(imagen, 0, 0);
          const resultado = {
            dataUrl: canvas.toDataURL('image/png'),
            width: canvas.width,
            height: canvas.height
          };
          imagenesPdf.set(contenido, resultado);
          resolve(resultado);
        };
        imagen.onerror = () => resolve(null);
        imagen.src = contenido;
      });
    };
    const porcentajeAnchoImagen = (valor?: string): number => {
      const tamano = valor?.match(/#sea-size=(GRANDE|MEDIANA|PEQUENA|MUY_PEQUENA)$/i)?.[1]?.toUpperCase();
      return tamano === 'GRANDE' ? 1 : tamano === 'MUY_PEQUENA' ? 0.28 : tamano === 'PEQUENA' ? 0.45 : 0.70;
    };
    const dimensionesImagen = (imagen: { width: number; height: number }, valor?: string): { width: number; height: number } => {
      const anchoDisponible = (ancho - margen * 2) * porcentajeAnchoImagen(valor);
      const escala = Math.min(1, anchoDisponible / imagen.width);
      return { width: imagen.width * escala, height: imagen.height * escala };
    };
    const dibujarImagenPregunta = (imagen: { dataUrl: string; width: number; height: number } | null, valor?: string): number => {
      if (!imagen) return 0;
      const tamano = dimensionesImagen(imagen, valor);
      if (y + tamano.height > alto - margen - pieReservado) nuevaPagina();
      const anchoUtil = ancho - margen * 2;
      const x = margen + (anchoUtil - tamano.width) / 2;
      doc.addImage(imagen.dataUrl, 'PNG', x, y, tamano.width, tamano.height, undefined, 'FAST');
      y += tamano.height + interlineado * 0.35;
      return tamano.height + interlineado * 0.35;
    };

    const fuente = (estilo: 'normal' | 'bold' | 'italic' = 'normal', tamano = tamanoFuente) => {
      doc.setFont(familiaFuente, estilo);
      doc.setFontSize(tamano);
      doc.setTextColor(0, 0, 0);
    };

    const nuevaPagina = () => {
      doc.addPage([ancho, alto], 'portrait');
      pagina++;
      y = margen;
    };

    const escribir = (texto: string, x: number, anchoDisponible: number, estilo: 'normal' | 'bold' | 'italic' = 'normal', salto = interlineado): void => {
      fuente(estilo, tamanoFuente);
      // Mantener los saltos semánticos del Excel (premisas, claves y casos)
      // mientras se ajusta cada línea al ancho de la hoja.
      const lineas = textoPdfConFormula(texto || '').split(/\r?\n/).flatMap(linea =>
        doc.splitTextToSize(linea.replace(/\s+/g, ' ').trim(), anchoDisponible) as string[]
      );
      const altoTexto = Math.max(1, lineas.length) * salto;
      if (y + altoTexto > alto - margen - pieReservado) nuevaPagina();
      // Dibujar línea por línea evita que el interlineado automático de
      // jsPDF desplace el texto más de lo reservado y provoque solapamientos.
      (lineas.length ? lineas : ['']).forEach(linea => {
        doc.text(linea, x, y);
        y += salto;
      });
    };

    const tituloTipo = (tipo: string): string => {
      const titulos: Record<string, string> = {
        SELECCION_MEJOR_RESPUESTA: 'SELECCIÓN DE LA MEJOR RESPUESTA',
        VERDADERO_O_FALSO_SIMPLE: 'VERDADERO O FALSO SIMPLE',
        RESPUESTA_PREMISAS_ABCD: 'RESPUESTA A/B/AMBAS/NINGUNA',
        VERDADERO_O_FALSO_COMPLEJAS: 'VERDADERO O FALSO COMPLEJAS',
        CASO_CLINICO_TRONCO: 'ITEMS AGRUPADOS POR CASO CLINICO O PROBLEMA',
        SUBITEM_CASO: 'ITEMS AGRUPADOS POR CASO CLINICO O PROBLEMA',
        EMPAREJAMIENTO_TRONCO: 'EMPAREJAMIENTO AMPLIADO',
        OPCION_EMPAREJAMIENTO: 'EMPAREJAMIENTO AMPLIADO'
      };
      return titulos[tipo] || '';
    };

    const instruccionTipo = (tipo: string): string => {
      const instrucciones: Record<string, string> = {
        SELECCION_MEJOR_RESPUESTA: 'INSTRUCCIONES: Lea cuidadosamente cada enunciado y elija una sola respuesta entre las opciones disponibles.',
        VERDADERO_O_FALSO_SIMPLE: 'INSTRUCCIONES: Marque la respuesta correcta.',
        RESPUESTA_PREMISAS_ABCD: 'INSTRUCCIONES: Las siguientes preguntas están compuestas por dos premisas.\nResponda con:\nA: Si solo la primera premisa es verdadera.\nB: Si solo la segunda premisa es verdadera.\nC: Si ambas premisas son verdaderas.\nD: Si ninguna premisa es verdadera.',
        VERDADERO_O_FALSO_COMPLEJAS: 'INSTRUCCIONES: Seleccione la opción correcta de acuerdo con la siguiente clave:\nA: 1, 2 y 3 son verdaderas.\nB: 1 y 3 son verdaderas.\nC: 2 y 4 son verdaderas.\nD: Solo 4 es verdadera.\nE: Todas son verdaderas.',
        CASO_CLINICO_TRONCO: 'INSTRUCCIONES: El siguiente caso clínico o problema tendrá varias preguntas.\nSeleccione la respuesta correcta en cada una.',
        SUBITEM_CASO: 'INSTRUCCIONES: El siguiente caso clínico o problema tendrá varias preguntas.\nSeleccione la respuesta correcta en cada una.',
        EMPAREJAMIENTO_TRONCO: 'INSTRUCCIONES: De la lista de opciones, seleccione la respuesta correcta\npara cada enunciado.',
        OPCION_EMPAREJAMIENTO: 'INSTRUCCIONES: De la lista de opciones, seleccione la respuesta correcta\npara cada enunciado.'
      };
      return instrucciones[tipo] || '';
    };

    const dibujarSeccion = (tipo: string): void => {
      const titulo = tituloTipo(tipo);
      if (!titulo) return;
      if (y + interlineado * 5 > alto - margen - pieReservado) nuevaPagina();
      doc.setLineWidth(0.7);
      doc.line(margen, y, ancho - margen, y);
      y += interlineado;
      escribir(titulo.toUpperCase(), margen, ancho - margen * 2, 'bold');
      instruccionTipo(tipo).split('\n').forEach(linea => escribir(linea, margen, ancho - margen * 2, 'normal'));
      y += interlineado * 0.35;
      doc.setLineWidth(0.2);
      doc.line(margen, y, ancho - margen, y);
      y += interlineado;
    };

    const dibujarTarjeta = (lineas: string[]): void => {
      const contenido = lineas.flatMap(linea => doc.splitTextToSize(textoPdfConFormula(linea), ancho - margen * 2 - 8) as string[]);
      const altoTarjeta = Math.max(interlineado * 2, contenido.length * interlineado + 7);
      if (y + altoTarjeta > alto - margen - pieReservado) nuevaPagina();
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.rect(margen, y - 3, ancho - margen * 2, altoTarjeta);
      fuente('normal', tamanoFuente);
      let tarjetaY = y + interlineado - 1;
      contenido.forEach(linea => {
        doc.text(linea, margen + 4, tarjetaY);
        tarjetaY += interlineado;
      });
      y += altoTarjeta + interlineado;
    };

    const escribirPregunta = (numero: number, enunciado: string): void => {
      const prefijo = `${numero}. ___`;
      fuente('bold', tamanoFuente);
      const anchoPrefijo = doc.getTextWidth(prefijo) + 1;
      const lineasEnunciado = textoPdfConFormula(enunciado || '').split(/\r?\n/).flatMap((linea, indice) =>
        doc.splitTextToSize(linea.replace(/\s+/g, ' ').trim(), indice === 0 ? ancho - margen * 2 - anchoPrefijo : ancho - margen * 2) as string[]
      );
      const altoPregunta = Math.max(1, lineasEnunciado.length) * interlineado;
      if (y + altoPregunta > alto - margen - pieReservado) nuevaPagina();
      doc.text(prefijo, margen, y);
      fuente('normal', tamanoFuente);
      doc.text(lineasEnunciado.length ? lineasEnunciado[0] : '', margen + anchoPrefijo, y);
      y += interlineado;
      lineasEnunciado.slice(1).forEach(linea => {
        doc.text(linea, margen, y);
        y += interlineado;
      });
    };

    const piePagina = () => {
      fuente('normal', tamanoFuente);
      doc.text('NOMBRE COMPLETO:', margen, alto - 12);
      // En la previsualización los valores permanecen vacíos. La excepción
      // de 15 pt aplica únicamente al valor del código del estudiante en el
      // examen generado, no a la etiqueta.
      doc.text('CÓDIGO:', margen, alto - 6);
      fuente('normal', tamanoFuente);
      doc.text(`PÁG. ${pagina}`, ancho - margen, alto - 6, { align: 'right' });
    };

    const cabeceraAlto = 23;
    const cabeceraMitad = 45;
    doc.setLineWidth(0.25);
    doc.rect(margen, y, ancho - margen * 2, cabeceraAlto);
    doc.line(margen + cabeceraMitad, y, margen + cabeceraMitad, y + cabeceraAlto);
    if (logoData) {
      doc.addImage(logoData, 'PNG', margen + 7, y + 5, 31, 12);
    } else {
      fuente('bold', tamanoFuente);
      doc.text('UNITEPC', margen + cabeceraMitad / 2, y + 11, { align: 'center' });
    }
    fuente('bold', tamanoFuente);
    doc.text('UNIVERSIDAD TECNICA PRIVADA COSMOS', margen + cabeceraMitad + (ancho - margen * 2 - cabeceraMitad) / 2, y + 6, { align: 'center' });
    doc.text('GESTION 2-2026', margen + cabeceraMitad + (ancho - margen * 2 - cabeceraMitad) / 2, y + 11, { align: 'center' });
    doc.line(margen + cabeceraMitad + 8, y + 14, ancho - margen - 8, y + 14);
    doc.text(`EVALUACION TEORICA ${this.parcialActivo().toUpperCase()}`, margen + cabeceraMitad + (ancho - margen * 2 - cabeceraMitad) / 2, y + 20, { align: 'center' });
    y += cabeceraAlto + interlineado;

    const fichaVaciaAlto = 34;
    doc.setLineWidth(0.25);
    doc.rect(margen, y, ancho - margen * 2, fichaVaciaAlto);
    doc.line(ancho / 2, y, ancho / 2, y + fichaVaciaAlto);
    for (let fila = 1; fila < 5; fila++) {
      doc.line(margen, y + fila * (fichaVaciaAlto / 5), ancho - margen, y + fila * (fichaVaciaAlto / 5));
    }
    fuente('normal', tamanoFuente);
    const col2 = ancho / 2 + 4;
    const filasFicha = [
      ['NOMBRE:', 'CARRERA:'],
      ['ASIGNATURA:', 'GRUPO:'],
      ['DOCENTE:', 'EXAMEN:'],
      ['FECHA:', 'HORA:'],
      ['FIRMA DEL ESTUDIANTE:', 'CODIGO:']
    ];
    filasFicha.forEach((fila, indiceFila) => {
      const filaY = y + (indiceFila + 1) * (fichaVaciaAlto / 5) - 2;
      doc.text(fila[0], margen + 3, filaY);
      doc.text(fila[1], col2, filaY);
    });
    y += fichaVaciaAlto + interlineado;

    const totalRespondibles = preguntas.filter(item => !['EMPAREJAMIENTO_TRONCO', 'CASO_CLINICO_TRONCO'].includes(item.tipo)).length;
    fuente('bold', tamanoFuente);
    doc.text(`CUESTIONARIO DE PREGUNTAS (${totalRespondibles})`, ancho / 2, y, { align: 'center' });
    y += interlineado;
    doc.setLineWidth(0.35);
    doc.line(margen, y, ancho - margen, y);
    y += interlineado;

    let tipoAnterior = '';
    let numeroPregunta = 0;
    const tieneTroncoEmparejamiento = preguntas.some(item => item.tipo === 'EMPAREJAMIENTO_TRONCO');
    const medirLineas = (texto: string, anchoDisponible: number): string[] => (
      textoPdfConFormula(texto || '').split(/\r?\n/).flatMap(linea =>
        doc.splitTextToSize(linea.replace(/\s+/g, ' ').trim(), anchoDisponible) as string[]
      )
    );
    const claveVfComplejas: Array<[string, string]> = [
      ['A', '1, 2 y 3 son verdaderas.'],
      ['B', '1 y 3 son verdaderas.'],
      ['C', '2 y 4 son verdaderas.'],
      ['D', 'Solo 4 es verdadera.'],
      ['E', 'Todas son verdaderas.']
    ];

    for (const pregunta of preguntas) {
      const imagenPregunta = await cargarImagenPregunta(pregunta.imagen_base64);
      const tipoSeccion = ['EMPAREJAMIENTO_TRONCO', 'OPCION_EMPAREJAMIENTO'].includes(pregunta.tipo)
        ? 'EMPAREJAMIENTO_TRONCO'
        : pregunta.tipo;
      const tipo = tituloTipo(tipoSeccion);
      if (tipo && tipo !== tipoAnterior) {
        dibujarSeccion(tipoSeccion);
        if (pregunta.tipo === 'SUBITEM_CASO' || pregunta.tipo === 'CASO_CLINICO_TRONCO') {
          dibujarTarjeta(['CASO CLINICO O PROBLEMA:  RESPONDA LAS PREGUNTAS DEL GRUPO.']);
        } else if (pregunta.tipo === 'OPCION_EMPAREJAMIENTO' && !tieneTroncoEmparejamiento) {
          dibujarTarjeta(['RELACIONE EL CONCEPTO CON SU DEFINICION CORRECTA:', 'A) ...', 'B) ...', 'C) ...', 'D) ...', 'E) ...']);
        }
        tipoAnterior = tipo;
      }

      // El enunciado principal del emparejamiento es una tarjeta de referencia,
      // no un reactivo que deba responderse con la marca "___".
      if (pregunta.tipo === 'EMPAREJAMIENTO_TRONCO') {
        const opcionesReferencia: Array<[string, string]> = [
          ['A', pregunta.opcion_a], ['B', pregunta.opcion_b], ['C', pregunta.opcion_c],
          ['D', pregunta.opcion_d], ['E', pregunta.opcion_e]
        ].filter(([, texto]) => !!texto?.trim()) as Array<[string, string]>;
        dibujarTarjeta([
          pregunta.enunciado || 'RELACIONE EL CONCEPTO CON SU DEFINICION CORRECTA:',
          ...opcionesReferencia.map(([letra, texto]) => `${letra}) ${texto}`)
        ]);
        dibujarImagenPregunta(imagenPregunta, pregunta.imagen_base64);
        continue;
      }

      if (pregunta.tipo === 'CASO_CLINICO_TRONCO') {
        dibujarTarjeta([
          'CASO CLINICO O PROBLEMA:',
          pregunta.enunciado || 'Resuelva el caso planteado y responda cada pregunta del grupo.'
        ]);
        dibujarImagenPregunta(imagenPregunta, pregunta.imagen_base64);
        continue;
      }

      numeroPregunta++;

      if (pregunta.tipo === 'VERDADERO_O_FALSO_COMPLEJAS') {
        const afirmaciones = [pregunta.opcion_a, pregunta.opcion_b, pregunta.opcion_c, pregunta.opcion_d]
          .filter(Boolean)
          .map((texto, indiceAfirmacion) => `${indiceAfirmacion + 1}) ${texto}`);
        const altoAfirmaciones = afirmaciones.reduce((total, texto) =>
          total + Math.max(1, medirLineas(texto, ancho - margen * 2 - indentacion).length) * interlineado, 0);
        const altoClave = claveVfComplejas.reduce((total, [letra, texto]) =>
          total + Math.max(1, medirLineas(`${letra}) ${texto}`, ancho - margen * 2 - indentacion).length) * interlineado, 0);
        const prefijoComplejo = `${numeroPregunta}. ___`;
        fuente('bold', tamanoFuente);
        const anchoPrefijoComplejo = doc.getTextWidth(prefijoComplejo) + 1;
        const lineasEnunciadoComplejo = medirLineas(pregunta.enunciado || '', ancho - margen * 2 - anchoPrefijoComplejo);
        const altoEnunciadoComplejo = Math.max(1, lineasEnunciadoComplejo.length) * interlineado;
        const dimensionesComplejo = imagenPregunta ? dimensionesImagen(imagenPregunta, pregunta.imagen_base64) : null;
        const altoImagenComplejo = dimensionesComplejo ? dimensionesComplejo.height + interlineado * 0.35 : 0;
        const altoComplejo = altoEnunciadoComplejo + altoImagenComplejo + altoAfirmaciones + altoClave
          + interlineado * 0.15 + interlineado * 0.4 + separacionPregunta;
        if (y + altoComplejo > alto - margen - pieReservado) nuevaPagina();

        escribirPregunta(numeroPregunta, pregunta.enunciado || '');
        dibujarImagenPregunta(imagenPregunta, pregunta.imagen_base64);
        y += interlineado * 0.15;
        afirmaciones.forEach(texto => escribir(texto, margen + indentacion, ancho - margen * 2 - indentacion, 'normal'));
        y += interlineado * 0.4;
        claveVfComplejas.forEach(([letra, texto]) => escribir(`${letra}) ${texto}`, margen + indentacion, ancho - margen * 2 - indentacion, 'normal'));
        y += separacionPregunta;
        continue;
      }

      // Reservar el bloque completo antes de dibujarlo para que el número,
      // enunciado e incisos permanezcan juntos en la misma página.
      const prefijo = `${numeroPregunta}. ___`;
      fuente('bold', tamanoFuente);
      const anchoPrefijo = doc.getTextWidth(prefijo) + 1;
      const lineasEnunciado = medirLineas(pregunta.enunciado || '', ancho - margen * 2 - anchoPrefijo);
      // En emparejamiento las filas hijas solo llevan el enunciado y la
      // clave de relación; no deben imprimirse incisos A-E vacíos.
      const opciones: Array<[string, string]> = ['VERDADERO_O_FALSO_SIMPLE', 'OPCION_EMPAREJAMIENTO'].includes(pregunta.tipo) ? [] : [
          ['A', pregunta.opcion_a], ['B', pregunta.opcion_b], ['C', pregunta.opcion_c],
          ['D', pregunta.opcion_d], ['E', pregunta.opcion_e]
        ].filter(([, texto]) => !!texto?.trim()) as Array<[string, string]>;
      const altoEnunciado = Math.max(1, lineasEnunciado.length) * interlineado;
      const altoOpciones = opciones.reduce((total, [letra, texto]) =>
        total + Math.max(1, medirLineas(`${letra}) ${texto}`, ancho - margen * 2 - indentacion).length) * interlineado, 0);
      const dimensiones = imagenPregunta ? dimensionesImagen(imagenPregunta, pregunta.imagen_base64) : null;
      const altoImagen = dimensiones ? dimensiones.height + interlineado * 0.35 : 0;
      const altoBloque = altoEnunciado + altoImagen + altoOpciones + (opciones.length ? interlineado * 0.15 : 0) + separacionPregunta;
      if (y + altoBloque > alto - margen - pieReservado) nuevaPagina();

      escribirPregunta(numeroPregunta, pregunta.enunciado || '');
      dibujarImagenPregunta(imagenPregunta, pregunta.imagen_base64);

      if (opciones.length) y += interlineado * 0.15;
      opciones.forEach(([letra, texto]) => escribir(`${letra}) ${texto}`, margen + indentacion, ancho - margen * 2 - indentacion, 'normal'));
      y += separacionPregunta;
    }

    for (let numeroPagina = 1; numeroPagina <= pagina; numeroPagina++) {
      doc.setPage(numeroPagina);
      const paginaActual = pagina;
      pagina = numeroPagina;
      piePagina();
      pagina = paginaActual;
    }

    return doc.output('blob');
  }

  private async _renderizarPaginasPdfPreview(pdf: Blob): Promise<string[]> {
    const buffer = await pdf.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
    const pdfDocument = await loadingTask.promise;
    const paginas: string[] = [];

    for (let numeroPagina = 1; numeroPagina <= pdfDocument.numPages; numeroPagina++) {
      const pagina = await pdfDocument.getPage(numeroPagina);
      const viewportBase = pagina.getViewport({ scale: 1 });
      const escala = Math.min(1.35, 860 / viewportBase.width);
      const viewport = pagina.getViewport({ scale: escala });
      const canvas = document.createElement('canvas');
      const contexto = canvas.getContext('2d');
      if (!contexto) {
        continue;
      }

      canvas.width = Math.ceil(viewport.width);
      canvas.height = Math.ceil(viewport.height);
      await pagina.render({ canvasContext: contexto, viewport }).promise;
      paginas.push(canvas.toDataURL('image/png'));

      // Liberar el buffer gráfico de cada página antes de continuar con la siguiente.
      pagina.cleanup();
      canvas.width = 1;
      canvas.height = 1;
    }

    return paginas;
  }

  public onScrollDocumentoPdf(event: Event): void {
    const element = event.target as HTMLElement;
    if (!element) return;
    // Comprobar si el scroll llegó al final o está a menos de 80px del final.
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - 80) {
      this.documentoRecorridoCompleto.set(true);
    }
  }

  private _comprobarFinPrevisualizacion(): void {
    const element = document.getElementById('area-scroll-banco-pdf');
    if (!this.dialogPrevisualizacionPdf() || this.pdfPreviewPages().length === 0) {
      return;
    }
    if (!element) {
      setTimeout(() => this._comprobarFinPrevisualizacion(), 50);
      return;
    }
    if (element.scrollHeight <= element.clientHeight + 2) {
      this.documentoRecorridoCompleto.set(true);
    }
  }

  public cerrarModalPrevisualizacionPdf(): void {
    this.dialogPrevisualizacionPdf.set(false);
    this._liberarPdfPreview();
  }

  private _liberarPdfPreview(): void {
    if (this.pdfPreviewObjectUrl) {
      URL.revokeObjectURL(this.pdfPreviewObjectUrl);
      this.pdfPreviewObjectUrl = null;
    }
    this.pdfPreviewUrl.set(null);
    this.pdfPreviewPages.set([]);
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
        return 'Verdadero o Falso Simple';
      case 'VERDADERO_O_FALSO_COMPLEJAS':
      case 'PREGUNTA_CON_CLAVE':
        return 'Verdadero o Falso Complejas';
      case 'RESPUESTA_PREMISAS_ABCD':
      case 'RESPUESTA_COMPUESTA':
        return 'Respuesta A/B/Ambas/Ninguna';
      case 'SELECCION_MEJOR_RESPUESTA':
      case 'SELECCION_SIMPLE':
      case 'SELECCION_UNICA':
        return 'Selección de la mejor respuesta';
      case 'CASO_CLINICO_TRONCO':
      case 'PROBLEMA':
      case 'CASO_CLINICO':
        return 'Ítems agrupados por caso clínico o problema';
      case 'SUBITEM_CASO':
      case 'SUBPROBLEMA':
        return 'Subítem de caso o problema';
      case 'EMPAREJAMIENTO_TRONCO':
      case 'EMPAREJAMIENTO':
        return 'Emparejamiento Ampliado';
      case 'OPCION_EMPAREJAMIENTO':
        return 'Opción de Emparejamiento Ampliado';
      default:
        return tipo;
    }
  }

  private _mapParcialBackend(parcial: string): string {
    if (parcial === 'Examen Final') return 'Final';
    return parcial;
  }

  public aprobarDiagramacionPdf(): void {
    const rol = this.rolExamenActivo();
    const file = this.archivoExcelSeleccionado();
    if (!rol) {
      this._mostrarToast('No existe un rol de examen oficial para la selección actual.', 'error');
      return;
    }
    if (!this.rolPuedeCargarBanco()) {
      this._mostrarToast(`El rol de examen está en ${rol.estadoFlujo}. Restablécelo a VALIDADO antes de registrar el banco.`, 'error');
      return;
    }
    if (!file) {
      this._mostrarToast('Selecciona el archivo Excel que se registrará en el servidor.', 'error');
      return;
    }
    if (!this.esBancoTotalmenteValido()) {
      this._mostrarToast('El banco todavía no cumple el mínimo de 60 preguntas y las cuotas mínimas 15/30/15.', 'error');
      return;
    }

    this.cargandoBanco.set(true);
    this._bancoService.cargarPorRol(rol.id, file).subscribe({
      next: resultado => {
        this.cargandoBanco.set(false);
        if (!resultado.exito) {
          this._mostrarToast(resultado.erroresValidacion?.join(' · ') || resultado.mensaje, 'error');
          return;
        }

        this.pdfPrevisualizadoYConforme.set(true);
        this.dialogPrevisualizacionPdf.set(false);
        const sede = this.sedeSeleccionada();
        const carrera = this.carreraSeleccionada();
        if (sede && carrera) this._cargarRolesOficiales(sede.code, carrera.careerCode);
        this._mostrarToast(`Banco ${resultado.bancoPreguntasId} validado y registrado en PostgreSQL.`);
      },
      error: err => {
        this.cargandoBanco.set(false);
        const msg = err?.error?.error || err?.error?.message || err?.message || 'No se pudo registrar el banco.';
        this._mostrarToast(msg, 'error');
      }
    });
  }

  public abrirEliminarBancoPersistido(): void {
    if (!this.rolPuedeEliminarBanco()) {
      this._mostrarToast('El banco solo se puede eliminar cuando el rol de examen está PROGRAMADO o VALIDADO.', 'error');
      return;
    }
    this.confirmacionEliminarBancoPersistido = '';
    this.dialogEliminarBancoPersistido.set(true);
  }

  public cerrarEliminarBancoPersistido(): void {
    if (this.eliminandoBancoPersistido()) return;
    this.dialogEliminarBancoPersistido.set(false);
    this.confirmacionEliminarBancoPersistido = '';
  }

  public confirmarEliminarBancoPersistido(): void {
    const rol = this.rolExamenActivo();
    if (!rol || !this.rolPuedeEliminarBanco() || this.confirmacionEliminarBancoPersistido.trim().toUpperCase() !== 'ELIMINAR' || this.eliminandoBancoPersistido()) return;

    this.eliminandoBancoPersistido.set(true);
    this._bancoService.eliminarPorRol(rol.id, 'ELIMINAR').subscribe({
      next: () => {
        this.bancoPersistido.set(null);
        this.archivoExcelSeleccionado.set(null);
        this.nombreArchivoCargado.set(null);
        this.preguntasCargadas.set([]);
        this.pdfPrevisualizadoYConforme.set(false);
        this.eliminandoBancoPersistido.set(false);
        this.dialogEliminarBancoPersistido.set(false);
        this.confirmacionEliminarBancoPersistido = '';
        const sede = this.sedeSeleccionada();
        const carrera = this.carreraSeleccionada();
        if (sede && carrera) this._cargarRolesOficiales(sede.code, carrera.careerCode);
          this._mostrarToast('Banco de preguntas eliminado. El rol de examen volvió a PROGRAMADO.');
      },
      error: err => {
        this.eliminandoBancoPersistido.set(false);
        const detalle = err?.error?.message || err?.error?.error || 'No se pudo eliminar el banco de preguntas.';
        this._mostrarToast(detalle, 'error');
      }
    });
  }

  // Previsualización Paquete Encriptado (.pkg)
  public abrirModalPrevisualizacionPkg(): void {
    const parcialCode = this.parcialActivo().toUpperCase().replace(' ', '_');
    const preguntasValidas = this.preguntasCargadas().filter(p => p.valido);

    const payload = {
      header: 'UNITEPC-ENCRYPTED-EVAL-PACKAGE-V2',
      parcial: this.parcialActivo(),
      gestion: 'II-2026',
      docente: this.docenteOficialActivo().nombre,
      ci: this.docenteOficialActivo().ci,
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

    const fileContent = `--- BEGIN UNITEPC ENCRYPTED EVALUATION PACKAGE ---\nVERSION: 2.0\nPARCIAL: ${parcialCode}\nDOCENTE: ${this.docenteOficialActivo().nombre}\nCHECKSUM_SHA256: b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9\nDATA:\n${encryptedHex}\n--- END UNITEPC ENCRYPTED EVALUATION PACKAGE ---`;

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

  private _mostrarToast(msg: string, type: 'success' | 'error' = 'success'): void {
    this.toastType.set(type);
    this.toastMessage.set(msg);
    setTimeout(() => this.toastMessage.set(null), 4000);
  }
}
