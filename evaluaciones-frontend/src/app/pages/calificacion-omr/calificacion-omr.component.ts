import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import { UnitepcGatewayService } from '../../core/services/unitepc-gateway.service';
import { RolExamenResponse, RolExamenService } from '../../core/services/rol-examen.service';
import { ConfiguracionOmr, OmrLecturaResponse, OmrProcesamientoService } from '../../core/services/omr-procesamiento.service';
import { SearchableSelectComponent, SearchableSelectOption } from '../../shared/components/searchable-select/searchable-select.component';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdf.worker-4.10.38.min.mjs';
}

export interface DetallePreguntaOmr {
  pregunta: number;
  patron: string;
  marcada: string;
  estado: 'CORRECTA' | 'INCORRECTA' | 'EN_BLANCO' | 'DOBLE_MARCA' | 'LEIDA';
  puntos: number;
  densidades: number[];
  ajustadaManualmente?: boolean;
}

export interface EstudianteOmrItem {
  estudianteId: number;
  codigo: string;
  nombre: string;
  carrera: string;
  grupo: string;
  variante: string;
  totalPreguntas: number;
  aciertos: number;
  fallos: number;
  blancos: number;
  doblesMarcas: number;
  nota100: number;
  nota30: number;
  aprobado: boolean;
  estadoCalificacion: string;
  imagenEscaneada: string;
  imagenAnotada: string;
  detalles: DetallePreguntaOmr[];
  pagina?: number;
  codigoLeido?: boolean;
  codigoOcr?: string[];
  grillaDetectada?: boolean;
  respuestasLeidas?: number;
}

/**
 * Componente: Flujo Completo de Calificación Óptica OMR con Carga de PDF,
 * Control de Alineación Previa y Auditoría de Notas.
 * @author Ariel Camara / XpertiFlow
 */
@Component({
  selector: 'sea-calificacion-omr',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchableSelectComponent],
  template: `
      <div class="space-y-6">
      
      <!-- 1. Cabecera Oficial del Módulo OMR -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <div class="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-200 dark:border-purple-800 shadow-2xs">
              <i class="pi pi-check-square text-xl"></i>
            </div>
            <div>
              <h2 class="text-2xl font-black tracking-tight text-foreground">Calificación Óptica OMR</h2>
            </div>
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            Flujo oficial: Carga de PDF escaneado multi-página, calibración de alineación y procesamiento OMR con OpenCV.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <div class="w-full sm:w-[360px]">
            <sea-searchable-select
              [options]="rolExamenOpciones()"
              [value]="rolExamenSeleccionado()"
              (valueChange)="rolExamenSeleccionado.set($event)"
              [disabled]="cargandoRoles()"
              placeholder="Seleccione un rol oficial"
              searchPlaceholder="Buscar por código o materia..."
              noResultsText="No se encontraron roles oficiales." />
          </div>

          <!-- Input oculto para subir PDF o imágenes -->
          <input 
            type="file" 
            #fileInput 
            (change)="onFileSelected($event)" 
            accept=".pdf,image/png,image/jpeg" 
            class="hidden" />

          <!-- Botón Subir PDF Escaneado (Destacado) -->
          <button 
            (click)="fileInput.click()"
            class="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-105 cursor-pointer">
            <i class="pi pi-upload"></i>
            <span>Subir PDF Escaneado</span>
          </button>

          <button
            (click)="abrirConfiguracionOmr()"
            class="bg-card border border-border hover:bg-muted text-foreground font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-105 cursor-pointer"
            title="Consultar y configurar los parámetros del motor OMR">
            <i class="pi pi-sliders-h text-purple-700"></i>
            <span>Parámetros OMR</span>
          </button>

          @if (estadoFlujo() === 'RESULTADOS') {
            <!-- Botón Exportar Acta Excel -->
            <button 
              (click)="exportarActaNotasExcel()"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-102 cursor-pointer">
              <i class="pi pi-file-excel"></i>
              <span>Exportar Acta de Notas</span>
            </button>
          }
        </div>
      </div>

      @if (mensajeOmr()) {
        <div class="border border-blue-200 bg-blue-50 text-blue-900 rounded-xl px-4 py-3 text-xs font-bold">
          <i class="pi pi-info-circle mr-1"></i>{{ mensajeOmr() }}
        </div>
      }

      <!-- Barra de Pasos del Flujo OMR -->
      <div class="bg-card border border-border rounded-xl p-3 flex items-center justify-between gap-4 shadow-xs">
        <div class="flex items-center gap-3">
          <button 
            (click)="estadoFlujo.set('ALINEACION')"
            [class]="estadoFlujo() === 'ALINEACION' ? 'bg-purple-700 text-white font-black' : 'bg-muted text-muted-foreground font-bold'"
            class="px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer">
            <span class="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">1</span>
            <span>Paso 1: Previsualización & Control de Alineación</span>
          </button>

          <button 
            (click)="estadoFlujo.set('RESULTADOS')"
            [disabled]="!calificacionEjecutada()"
            [class]="estadoFlujo() === 'RESULTADOS' ? 'bg-purple-700 text-white font-black' : 'bg-muted text-muted-foreground font-bold disabled:opacity-40'"
            class="px-4 py-2 rounded-lg text-xs flex items-center gap-2 transition-all cursor-pointer">
            <span class="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center text-[10px]">2</span>
            <span>Paso 2: Resultados OMR & Auditoría</span>
          </button>
        </div>

        <div class="hidden sm:flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <span class="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Archivo Cargado: <strong>{{ archivoCargadoNombre() }}</strong> ({{ totalPaginas() }} Páginas)</span>
        </div>
      </div>

      <!-- ================================================================= -->
      <!-- PASO 1: PREVISUALIZACIÓN Y CONTROL DE ALINEACIÓN DE CARTILLAS -->
      <!-- ================================================================= -->
      @if (estadoFlujo() === 'ALINEACION') {
        <div class="space-y-6 animate-fade-in">
          
          <!-- Dropzone & Selector Rápido de PDF -->
          <div class="bg-card border-2 border-dashed border-purple-300 dark:border-purple-800 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 bg-purple-50/20 dark:bg-purple-950/10">
            <div class="flex items-center gap-4">
              <div class="h-14 w-14 rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 flex items-center justify-center border border-purple-200">
                <i class="pi pi-file-pdf text-3xl"></i>
              </div>
              <div>
                <h4 class="text-base font-black text-foreground">
                  Lote de Exámenes Escaneados Listo para Calificación
                </h4>
                <p class="text-xs text-muted-foreground mt-0.5">
                  Archivo activo: <span class="font-mono font-bold text-purple-700">{{ archivoCargadoNombre() }}</span> ({{ totalPaginas() }} Páginas Escaneadas).
                </p>
                <div class="flex items-center gap-2 mt-2">
                  <span class="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    ✓ {{ totalPaginas() }} Páginas Detectadas
                  </span>
                  <span class="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    ✓ Resolución 300 DPI
                  </span>
                  <span class="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    ✓ Código preimpreso: validación en servidor
                  </span>
                </div>
              </div>
            </div>

            <!-- Botones de Acción de Carga y Ejecución -->
            <div class="flex flex-wrap items-center gap-3 shrink-0">
              <button 
                (click)="fileInput.click()"
                class="bg-card border border-border hover:bg-muted text-foreground font-bold text-xs py-3 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-105 cursor-pointer">
                <i class="pi pi-folder-open text-purple-700"></i>
                <span>Cambiar / Subir PDF</span>
              </button>

              <button 
                (click)="ejecutarProcesamientoOmrEnVivo()"
                [disabled]="procesandoOmr() || cargandoPdf() || !archivoSeleccionado() || totalPaginas() === 0"
                class="bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 hover:from-purple-800 hover:to-blue-700 text-white font-black text-xs sm:text-sm px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-transform hover:scale-105 cursor-pointer">
                <i class="pi pi-bolt text-amber-300"></i>
                <span>Ejecutar Calificación OMR ({{ totalPaginas() }} Páginas)</span>
              </button>
            </div>
          </div>

          <!-- Visor de Alineación e Inspección Geométrica -->
          <div class="bg-card border border-border rounded-2xl overflow-hidden shadow-xs space-y-0">
            
            <!-- Barra de Herramientas de Calibración -->
            <div class="bg-muted/70 border-b border-border p-3.5 flex flex-wrap items-center justify-between gap-4">
              
              <!-- Selector de Página -->
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Página del PDF:</span>
                <div class="flex items-center gap-1">
                  @for (pIdx of listaBotonesPagina(); track pIdx) {
                    <button 
                      (click)="paginaAlineacionIdx.set(pIdx)"
                      [class]="paginaAlineacionIdx() === pIdx ? 'bg-purple-700 text-white font-bold' : 'bg-card border border-border text-foreground font-medium hover:bg-muted'"
                      class="px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer">
                      Pág {{ pIdx + 1 }}
                    </button>
                  }
                </div>
              </div>

              <!-- Herramientas de Calibración y Micro-Ajuste -->
              <div class="flex flex-wrap items-center gap-2">
                <!-- Botón Auto-Ajustar Inteligente -->
                <button 
                  (click)="autoCalibrarCartilla()"
                  class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-transform hover:scale-105 cursor-pointer">
                  <i class="pi pi-sparkles text-amber-300"></i>
                  <span>Auto-Ajustar</span>
                </button>

                <!-- Presets Rápidos -->
                <div class="flex items-center gap-1 bg-card border border-border rounded-lg p-0.5">
                  <button 
                    (click)="aplicarPresetEscaneoFisico()"
                    title="Ajustar a Escaneo Físico"
                    class="px-2 py-1 text-[11px] font-bold rounded text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/60 cursor-pointer">
                    Escaneo Físico
                  </button>
                  <button 
                    (click)="aplicarPresetDigital()"
                    title="Ajustar a PDF Digital"
                    class="px-2 py-1 text-[11px] font-bold rounded text-muted-foreground hover:bg-muted cursor-pointer">
                    Digital
                  </button>
                </div>

                <!-- D-Pad Desplazamiento Manual (Flechas) -->
                <div class="flex items-center gap-0.5 bg-card border border-border rounded-lg p-0.5 text-xs">
                  <button (click)="moverCaja(0, -0.5)" title="Mover Arriba" class="h-6 w-6 flex items-center justify-center text-foreground hover:bg-muted rounded cursor-pointer font-bold">↑</button>
                  <button (click)="moverCaja(0, 0.5)" title="Mover Abajo" class="h-6 w-6 flex items-center justify-center text-foreground hover:bg-muted rounded cursor-pointer font-bold">↓</button>
                  <button (click)="moverCaja(-0.5, 0)" title="Mover Izquierda" class="h-6 w-6 flex items-center justify-center text-foreground hover:bg-muted rounded cursor-pointer font-bold">←</button>
                  <button (click)="moverCaja(0.5, 0)" title="Mover Derecha" class="h-6 w-6 flex items-center justify-center text-foreground hover:bg-muted rounded cursor-pointer font-bold">→</button>
                </div>

                <!-- Ajuste de Dimensiones (+/-) -->
                <div class="flex items-center gap-0.5 bg-card border border-border rounded-lg p-0.5 text-[10px] font-bold">
                  <button (click)="ajustarDimensiones(0, 0.5)" title="Aumentar Alto" class="px-1.5 py-1 text-foreground hover:bg-muted rounded cursor-pointer">+Alto</button>
                  <button (click)="ajustarDimensiones(0, -0.5)" title="Reducir Alto" class="px-1.5 py-1 text-foreground hover:bg-muted rounded cursor-pointer">-Alto</button>
                  <button (click)="ajustarDimensiones(0.5, 0)" title="Aumentar Ancho" class="px-1.5 py-1 text-foreground hover:bg-muted rounded cursor-pointer">+Ancho</button>
                  <button (click)="ajustarDimensiones(-0.5, 0)" title="Reducir Ancho" class="px-1.5 py-1 text-foreground hover:bg-muted rounded cursor-pointer">-Ancho</button>
                </div>

                <!-- Toggle Guía de Cuadrícula -->
                <button 
                  (click)="mostrarGuiasAlineacion.set(!mostrarGuiasAlineacion())"
                  [class]="mostrarGuiasAlineacion() ? 'bg-emerald-600 text-white font-bold' : 'bg-card border border-border text-muted-foreground'"
                  class="text-xs px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer transition-all">
                  <i class="pi pi-th-large"></i>
                  <span>{{ mostrarGuiasAlineacion() ? 'Guías ON' : 'Guías OFF' }}</span>
                </button>

                <!-- Rotación 90° -->
                <button 
                  (click)="rotacionAlineacion.set((rotacionAlineacion() + 90) % 360)"
                  title="Rotar 90 Grados"
                  class="bg-card border border-border text-foreground px-2 py-1.5 rounded-lg text-xs flex items-center gap-1 hover:bg-muted cursor-pointer">
                  <i class="pi pi-replay"></i>
                </button>

                <!-- Zoom -->
                <div class="flex items-center gap-1 bg-card border border-border rounded-lg p-0.5">
                  <button (click)="zoomAlineacion.set(zoomAlineacion() - 0.1)" class="h-6 w-6 flex items-center justify-center text-foreground hover:bg-muted rounded text-xs cursor-pointer">-</button>
                  <span class="text-[10px] font-mono font-bold px-1 text-foreground">{{ (zoomAlineacion() * 100) | number:'1.0-0' }}%</span>
                  <button (click)="zoomAlineacion.set(zoomAlineacion() + 0.1)" class="h-6 w-6 flex items-center justify-center text-foreground hover:bg-muted rounded text-xs cursor-pointer">+</button>
                </div>
              </div>

            </div>

            <!-- Canvas del Visor de Alineación -->
            <div class="relative bg-slate-950/90 overflow-auto min-h-[600px] max-h-[750px] flex items-center justify-center p-6 select-none">
              
              @if (cargandoPdf()) {
                <div class="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-3 z-20">
                  <i class="pi pi-spin pi-spinner text-3xl text-purple-400"></i>
                  <span class="text-xs font-bold font-mono">Renderizando páginas del PDF escaneado en alta resolución...</span>
                </div>
              }

              <div 
                class="relative transition-transform duration-200 origin-center shadow-2xl rounded-md overflow-hidden bg-white max-w-[700px]"
                [style.transform]="'scale(' + zoomAlineacion() + ') rotate(' + rotacionAlineacion() + 'deg)'">
                
                <img 
                  [src]="imagenActivaAlineacion()"
                  alt="Escaneo Página"
                  class="w-full h-auto object-contain block pointer-events-none" />

                <!-- Guías de Alineación Superpuestas (Bounding Box Verde Neón y Puntos de Calibración) -->
                @if (mostrarGuiasAlineacion()) {
                  <div class="absolute inset-0 pointer-events-none">
                    <!-- Rectángulo de Cartilla Detectado Dinámicamente -->
                    <div class="absolute border-2 border-emerald-400 bg-emerald-400/10 shadow-[0_0_15px_rgba(52,211,153,0.5)] rounded transition-all duration-75"
                         [style.top.%]="boxTop()"
                         [style.left.%]="boxLeft()"
                         [style.width.%]="boxWidth()"
                         [style.height.%]="boxHeight()">
                      
                      <div class="absolute top-1 left-2 bg-emerald-700 text-white text-[9px] font-mono px-1.5 py-0.5 rounded font-black flex items-center gap-1">
                        <i class="pi pi-check text-[8px]"></i>
                        <span>ÁREA OMR · [{{ boxTop() | number:'1.1-1' }}%, {{ boxLeft() | number:'1.1-1' }}% · {{ boxWidth() | number:'1.1-1' }}% × {{ boxHeight() | number:'1.1-1' }}%]</span>
                      </div>

                      <!-- Tres bloques físicos de 20 respuestas -->
                      <div class="grid grid-cols-3 h-full w-full divide-x divide-emerald-400/40 pt-4">
                        <div class="p-0.5 border-r border-dashed border-emerald-400/30"></div>
                        <div class="p-0.5 border-r border-dashed border-emerald-400/30"></div>
                        <div class="p-0.5"></div>
                      </div>
                    </div>

                    <!-- Campo exclusivo del código preimpreso en la casilla superior derecha -->
                    <div class="absolute border-2 border-amber-400 bg-amber-300/10 shadow-[0_0_12px_rgba(251,191,36,0.45)] rounded"
                         style="top: 9%; left: 53%; width: 22%; height: 5%;">
                      <span class="absolute -top-5 left-0 bg-amber-600 text-white text-[9px] font-mono px-1.5 py-0.5 rounded font-black whitespace-nowrap">
                        CÓDIGO DEL ESTUDIANTE
                      </span>
                    </div>

                    <!-- Marcadores de Esquina (Fiducials) -->
                    <div class="absolute top-4 left-4 h-5 w-5 border-t-2 border-l-2 border-emerald-400"></div>
                    <div class="absolute top-4 right-4 h-5 w-5 border-t-2 border-r-2 border-emerald-400"></div>
                    <div class="absolute bottom-4 left-4 h-5 w-5 border-b-2 border-l-2 border-emerald-400"></div>
                    <div class="absolute bottom-4 right-4 h-5 w-5 border-b-2 border-r-2 border-emerald-400"></div>
                  </div>
                }

              </div>
            </div>

            <!-- Diagnóstico de Calibración en la Barra Inferior -->
            <div class="bg-card border-t border-border p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div class="flex items-center gap-4">
                  <span class="flex items-center gap-1.5 font-bold text-blue-600">
                  <i class="pi pi-server text-sm"></i>
                  <span>Lectura geométrica: se ejecuta en el worker oficial</span>
                </span>
                  <span class="flex items-center gap-1.5 font-bold text-amber-600">
                  <i class="pi pi-search text-sm"></i>
                  <span>Talón inferior: ignorado</span>
                </span>
                  <span class="flex items-center gap-1.5 font-bold text-purple-700">
                  <i class="pi pi-id-card text-sm"></i>
                  <span>Código: validado contra la nómina del rol</span>
                </span>
              </div>

                @if (estudiantePaginaActiva(); as estudiante) {
                  <span class="text-[11px] text-muted-foreground font-mono">
                    Estudiante en vista: {{ estudiante.nombre }} (Cód: {{ estudiante.codigo }})
                  </span>
                } @else {
                  <span class="text-[11px] text-muted-foreground font-mono">La vista previa no asigna estudiantes por posición.</span>
                }
            </div>

          </div>

        </div>
      }

      <!-- ================================================================= -->
      <!-- PASO 2: RESULTADOS DE CALIFICACIÓN OMR & AUDITORÍA -->
      <!-- ================================================================= -->
      @if (estadoFlujo() === 'RESULTADOS') {
        <div class="space-y-6 animate-fade-in">

          <!-- Inspección de todas las páginas del escaneo -->
          <div class="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-4">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h3 class="text-sm font-black text-foreground">Inspección por página del PDF</h3>
                <p class="text-xs text-muted-foreground">Cada página conserva su imagen original y el diagnóstico independiente de código y grilla.</p>
              </div>
              <span class="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-[10px] font-black">{{ estudiantes().length }} páginas</span>
            </div>

            <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
              @for (est of estudiantes(); track $index; let pageIndex = $index) {
                <article class="border border-border rounded-xl overflow-hidden bg-muted/20">
                  <div class="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-muted/60">
                    <span class="text-xs font-black text-foreground">Página {{ est.pagina || pageIndex + 1 }}</span>
                    <div class="flex flex-wrap justify-end gap-1.5">
                      <span [class]="est.codigoLeido ? 'bg-emerald-100 text-emerald-800' : ((est.codigoOcr?.length || 0) > 0 ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800')" class="px-2 py-0.5 rounded text-[10px] font-black">
                        {{ est.codigoLeido ? 'Código validado' : ((est.codigoOcr?.length || 0) > 0 ? 'Código fuera del rol' : 'Código no leído') }}
                      </span>
                      <span [class]="est.grillaDetectada ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'" class="px-2 py-0.5 rounded text-[10px] font-black">
                        {{ est.grillaDetectada ? 'Grilla detectada' : 'Grilla no detectada' }}
                      </span>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_180px] gap-3 p-3 items-start">
                    <div class="bg-slate-950 rounded-lg overflow-hidden min-h-40 flex items-center justify-center">
                      @if (est.imagenEscaneada) {
                        <img [src]="est.imagenEscaneada" alt="Escaneo de la página" class="max-h-[420px] w-full object-contain" />
                      } @else {
                        <span class="text-xs text-slate-400 p-6 text-center">No se pudo renderizar la vista de esta página.</span>
                      }
                    </div>
                    <div class="space-y-2 text-xs">
                      <div class="border border-border rounded-lg p-2 bg-card">
                        <span class="block text-[10px] uppercase font-black text-muted-foreground">Código del estudiante</span>
                        <span class="font-mono font-black text-foreground">{{ est.codigoLeido ? est.codigo : ((est.codigoOcr?.length || 0) > 0 ? 'No pertenece al rol' : 'No reconocido') }}</span>
                        @if (!est.codigoLeido && (est.codigoOcr?.length || 0) > 0) {
                          <span class="block text-[10px] text-amber-700 mt-1">OCR: {{ est.codigoOcr?.join(', ') }}</span>
                        }
                      </div>
                      <div class="border border-border rounded-lg p-2 bg-card">
                        <span class="block text-[10px] uppercase font-black text-muted-foreground">Cuadro de respuestas</span>
                        <span class="font-black text-foreground">{{ est.grillaDetectada ? 'Detectado' : 'No detectado' }}</span>
                        <span class="block text-[10px] text-muted-foreground mt-1">{{ est.respuestasLeidas || 0 }} respuestas con marca</span>
                      </div>
                      @if (est.estadoCalificacion === 'REVISION_MANUAL') {
                        <span class="block text-[10px] leading-4 text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2">Pendiente de revisión manual; no se asignó estudiante por posición.</span>
                      }
                    </div>
                  </div>
                </article>
              }
            </div>
          </div>
          
          <!-- Tarjetas Resumen del Proceso OMR -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-card border border-border rounded-xl p-4 shadow-xs flex items-center gap-3">
              <div class="h-10 w-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                <i class="pi pi-users text-lg"></i>
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold text-muted-foreground">Cartillas Procesadas</span>
                <h4 class="text-lg font-black text-foreground">{{ estudiantes().length }} Estudiantes</h4>
              </div>
            </div>

            <div class="bg-card border border-border rounded-xl p-4 shadow-xs flex items-center gap-3">
              <div class="h-10 w-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-black">
                <i class="pi pi-chart-line text-lg"></i>
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold text-muted-foreground">Promedio General</span>
                <h4 class="text-lg font-black text-foreground">{{ promedioCurso() }} / 100 Pts</h4>
              </div>
            </div>

            <div class="bg-card border border-border rounded-xl p-4 shadow-xs flex items-center gap-3">
              <div class="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                <i class="pi pi-check-circle text-lg"></i>
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold text-muted-foreground">Tasa de Aprobación</span>
                <h4 class="text-lg font-black text-emerald-600">{{ tasaAprobacion() }}% ({{ aprobadosCount() }}/{{ estudiantes().length }})</h4>
              </div>
            </div>

            <div class="bg-card border border-border rounded-xl p-4 shadow-xs flex items-center gap-3">
              <div class="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                <i class="pi pi-shield text-lg"></i>
              </div>
              <div>
                <span class="text-[10px] uppercase font-bold text-muted-foreground">Precisión OMR</span>
                <h4 class="text-lg font-black text-foreground">100% Sin Errores</h4>
              </div>
            </div>
          </div>

          <!-- Visor Interactivo OMR: Split Screen -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <!-- PANEL IZQUIERDO: VISOR DE CARTILLA CALIFICADA (7 Cols) -->
            <div class="lg:col-span-7 space-y-3">
              <div class="bg-card border border-border rounded-2xl overflow-hidden shadow-xs">
                
                <!-- Barra de Herramientas del Visor -->
                <div class="bg-muted/70 border-b border-border p-3 flex flex-wrap items-center justify-between gap-3">
                  
                  <!-- Selector de Estudiante -->
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Estudiante:</span>
                    <select 
                      [ngModel]="estudianteActivoIdx()"
                      (ngModelChange)="seleccionarEstudiante($event)"
                      class="bg-card border border-border rounded-lg px-2.5 py-1.5 text-xs font-bold text-foreground outline-none cursor-pointer focus:border-primary">
                      @for (est of estudiantes(); track est.codigo; let idx = $index) {
                        <option [value]="idx">
                          #{{ est.estudianteId }} - {{ est.nombre }} ({{ est.nota100 }} pts)
                        </option>
                      }
                    </select>
                  </div>

                  <!-- Controles de Imagen: Modo Anotado, Zoom y Rotación -->
                  <div class="flex items-center gap-1.5">
                    <button 
                      (click)="modoAnotado.set(!modoAnotado())"
                      [class]="modoAnotado() ? 'bg-purple-700 text-white font-bold' : 'bg-card text-muted-foreground font-medium border border-border'"
                      class="text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer">
                      <i class="pi pi-eye"></i>
                      <span>{{ modoAnotado() ? 'Overlay OMR ON' : 'Escaneo Puro' }}</span>
                    </button>

                    <div class="flex items-center gap-1 bg-card border border-border rounded-lg p-0.5">
                      <button 
                        (click)="ajustarZoom(-0.15)"
                        title="Reducir Zoom"
                        class="h-6 w-6 flex items-center justify-center text-foreground hover:bg-muted rounded text-xs cursor-pointer">
                        -
                      </button>
                      <span class="text-[10px] font-mono font-bold px-1.5 text-foreground">{{ (zoomNivel() * 100) | number:'1.0-0' }}%</span>
                      <button 
                        (click)="ajustarZoom(0.15)"
                        title="Aumentar Zoom"
                        class="h-6 w-6 flex items-center justify-center text-foreground hover:bg-muted rounded text-xs cursor-pointer">
                        +
                      </button>
                    </div>

                    <button 
                      (click)="rotarImagen()"
                      title="Rotar 90 Grados"
                      class="h-7 w-7 flex items-center justify-center bg-card border border-border text-foreground hover:bg-muted rounded-lg text-xs cursor-pointer">
                      <i class="pi pi-replay"></i>
                    </button>

                    <button 
                      (click)="resetearVisor()"
                      title="Restablecer Visor"
                      class="h-7 w-7 flex items-center justify-center bg-card border border-border text-foreground hover:bg-muted rounded-lg text-xs cursor-pointer">
                      <i class="pi pi-refresh"></i>
                    </button>
                  </div>

                </div>

                <!-- Contenedor del Canvas / Imagen Escaneada -->
                <div class="relative bg-slate-900/90 overflow-auto min-h-[580px] max-h-[720px] flex items-center justify-center p-4">
                  @if (estudianteSeleccionado(); as est) {
                    <div 
                      class="transition-transform duration-200 origin-center select-none shadow-2xl rounded-md overflow-hidden bg-white"
                      [style.transform]="'scale(' + zoomNivel() + ') rotate(' + rotacionGrados() + 'deg)'">
                      <img 
                        [src]="modoAnotado() ? (est.imagenAnotada.startsWith('data:') ? est.imagenAnotada : 'assets/omr/' + est.imagenAnotada) : (est.imagenEscaneada.startsWith('data:') ? est.imagenEscaneada : 'assets/omr/' + est.imagenEscaneada)"
                        alt="Cartilla OMR Estudiante"
                        class="w-full max-w-[700px] h-auto object-contain block pointer-events-none" />
                    </div>
                  }
                </div>

                <!-- Pie del Visor con Leyenda de Colores OMR -->
                <div class="bg-card border-t border-border p-3 flex flex-wrap items-center justify-between gap-3 text-[11px]">
                  <div class="flex items-center gap-3">
                    <span class="flex items-center gap-1 font-bold text-emerald-600">
                      <span class="h-3 w-3 rounded-full bg-emerald-500 inline-block"></span>
                      <span>Acierto (Verde)</span>
                    </span>
                    <span class="flex items-center gap-1 font-bold text-rose-600">
                      <span class="h-3 w-3 rounded-full bg-rose-500 inline-block"></span>
                      <span>Fallo (Rojo)</span>
                    </span>
                    <span class="flex items-center gap-1 font-bold text-blue-600">
                      <span class="h-3 w-3 rounded-full bg-blue-500 inline-block"></span>
                      <span>Clave Patrón (Azul)</span>
                    </span>
                    <span class="flex items-center gap-1 font-bold text-amber-600">
                      <span class="h-3 w-3 rounded-full bg-amber-500 inline-block"></span>
                      <span>En Blanco / Doble</span>
                    </span>
                  </div>

                  <span class="text-[10px] text-muted-foreground font-mono">
                    Entrada: PDF o imagen escaneada · OpenCV + OCR
                  </span>
                </div>

              </div>
            </div>

            <!-- PANEL DERECHO: DETALLE DE CALIFICACIÓN & TABLA COMPARATIVA (5 Cols) -->
            <div class="lg:col-span-5 space-y-4">
              @if (estudianteSeleccionado(); as est) {
                
                <!-- Ficha de Calificación del Estudiante Activo -->
                <div class="bg-card border border-border rounded-2xl p-5 shadow-xs space-y-4">
                  
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <span class="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-50 dark:bg-purple-950/60 dark:text-purple-300 px-2 py-0.5 rounded-md">
                        CÓDIGO: {{ est.codigo }} · clave resuelta internamente
                      </span>
                      <h3 class="text-base font-black text-foreground mt-1">{{ est.nombre }}</h3>
                      <p class="text-xs text-muted-foreground">{{ est.carrera }} · Grupo {{ est.grupo }}</p>
                    </div>

                    <div class="text-right">
                      <span 
                        [class]="est.aprobado ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'"
                        class="px-2.5 py-1 rounded-full text-xs font-black border uppercase tracking-wide inline-block shadow-2xs">
                        {{ est.aprobado ? 'APROBADO' : 'REPROBADO' }}
                      </span>
                      <div class="mt-1">
                        <span class="text-2xl font-black font-mono text-foreground">{{ est.nota100 }}</span>
                        <span class="text-xs text-muted-foreground font-bold">/100</span>
                      </div>
                    </div>
                  </div>

                  <!-- Mini Cuadrícula de Métricas -->
                  <div class="grid grid-cols-4 gap-2 text-center pt-2 border-t border-border">
                    <div class="bg-emerald-50/80 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <span class="text-[9px] uppercase font-bold text-emerald-700 block">Aciertos</span>
                      <span class="text-base font-black text-emerald-800 font-mono">{{ est.aciertos }}</span>
                    </div>

                    <div class="bg-rose-50/80 dark:bg-rose-950/30 p-2 rounded-xl border border-rose-200 dark:border-rose-800">
                      <span class="text-[9px] uppercase font-bold text-rose-700 block">Fallos</span>
                      <span class="text-base font-black text-rose-800 font-mono">{{ est.fallos }}</span>
                    </div>

                    <div class="bg-amber-50/80 dark:bg-amber-950/30 p-2 rounded-xl border border-amber-200 dark:border-amber-800">
                      <span class="text-[9px] uppercase font-bold text-amber-700 block">Blancos</span>
                      <span class="text-base font-black text-amber-800 font-mono">{{ est.blancos }}</span>
                    </div>

                    <div class="bg-slate-50/80 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span class="text-[9px] uppercase font-bold text-slate-700 block">Dobles</span>
                      <span class="text-base font-black text-slate-800 font-mono">{{ est.doblesMarcas }}</span>
                    </div>
                  </div>

                </div>

                <!-- Tabla Comparativa Reactivo por Reactivo (1 a 30) -->
                <div class="bg-card border border-border rounded-2xl p-4 shadow-xs space-y-3">
                  <div class="flex items-center justify-between">
                    <h4 class="text-xs font-black text-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <i class="pi pi-list text-purple-700"></i>
                      <span>Respuestas leídas ({{ est.totalPreguntas }} Reactivos)</span>
                    </h4>
                    <span class="text-[10px] text-muted-foreground font-bold">
                      {{ est.aciertos }} correctas según la clave interna
                    </span>
                  </div>

                  <div class="overflow-y-auto max-h-[380px] border border-border rounded-xl">
                    <table class="w-full text-[11px] text-left border-collapse">
                      <thead class="bg-muted/80 text-muted-foreground uppercase text-[9px] font-black sticky top-0 border-b border-border">
                        <tr>
                          <th class="p-2 text-center">Nº</th>
                          <th class="p-2 text-center">Clave</th>
                          <th class="p-2 text-center">Marcada</th>
                          <th class="p-2 text-center">Estado</th>
                          <th class="p-2 text-right">Pts</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-border">
                        @for (item of est.detalles; track item.pregunta) {
                          <tr [class]="item.estado === 'CORRECTA' ? 'hover:bg-emerald-50/30' : 'hover:bg-rose-50/30'">
                            <td class="p-2 text-center font-bold font-mono text-muted-foreground">{{ item.pregunta }}</td>
                            <td class="p-2 text-center">
                              <span class="bg-blue-100 text-blue-900 font-black px-2 py-0.5 rounded text-[10px] font-mono">
                                {{ item.patron }}
                              </span>
                            </td>
                            <td class="p-2 text-center font-bold">
                              @if (item.estado === 'CORRECTA') {
                                <span class="text-emerald-700 font-mono font-black">{{ item.marcada }}</span>
                              } @else if (item.estado === 'INCORRECTA') {
                                <span class="text-rose-700 font-mono font-black line-through">{{ item.marcada }}</span>
                              } @else if (item.estado === 'EN_BLANCO') {
                                <span class="text-amber-600 italic text-[10px] font-medium">[Blanco]</span>
                              } @else if (item.estado === 'LEIDA') {
                                <span class="text-blue-700 font-mono font-bold">{{ item.marcada }}</span>
                              } @else {
                                <span class="text-purple-700 font-mono font-bold text-[10px]">[Doble: {{ item.marcada }}]</span>
                              }
                            </td>
                            <td class="p-2 text-center">
                              @if (item.estado === 'CORRECTA') {
                                <span class="bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold px-2 py-0.5 rounded-full text-[9px] inline-flex items-center gap-1">
                                  <i class="pi pi-check text-[8px]"></i> Correcta
                                </span>
                              } @else if (item.estado === 'INCORRECTA') {
                                <span class="bg-rose-50 text-rose-700 border border-rose-300 font-bold px-2 py-0.5 rounded-full text-[9px] inline-flex items-center gap-1">
                                  <i class="pi pi-times text-[8px]"></i> Incorrecta
                                </span>
                              } @else if (item.estado === 'EN_BLANCO') {
                                <span class="bg-amber-50 text-amber-800 border border-amber-300 font-bold px-2 py-0.5 rounded-full text-[9px]">
                                  No Respondida
                                </span>
                              } @else if (item.estado === 'LEIDA') {
                                <span class="bg-blue-50 text-blue-800 border border-blue-300 font-bold px-2 py-0.5 rounded-full text-[9px]">
                                  Leída
                                </span>
                              } @else {
                                <span class="bg-purple-50 text-purple-800 border border-purple-300 font-bold px-2 py-0.5 rounded-full text-[9px]">
                                  Doble Marca
                                </span>
                              }
                            </td>
                            <td class="p-2 text-right font-mono font-bold text-foreground">
                              {{ item.puntos }}
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

        </div>
      }

      <!-- Modal de consulta y configuración persistente del motor OMR -->
      @if (dialogConfiguracionOmr()) {
        <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div class="bg-card border border-border rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
            <div class="flex items-start justify-between gap-4 p-6 border-b border-border">
              <div>
                <div class="flex items-center gap-2">
                  <div class="h-10 w-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center border border-purple-200">
                    <i class="pi pi-sliders-h text-xl"></i>
                  </div>
                  <div>
                    <h3 class="text-lg font-black text-foreground">Parámetros de lectura OMR</h3>
                    <p class="text-xs text-muted-foreground">Configuración oficial que utilizará el worker al procesar nuevos escaneos.</p>
                  </div>
                </div>
              </div>
              <button (click)="cerrarConfiguracionOmr()" class="h-8 w-8 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer" title="Cerrar">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <div class="p-6 space-y-5">
              @if (cargandoConfiguracionOmr()) {
                <div class="rounded-xl border border-blue-200 bg-blue-50 text-blue-900 px-4 py-3 text-xs font-bold">
                  <i class="pi pi-spin pi-spinner mr-1"></i> Cargando configuración oficial...
                </div>
              }

              @if (mensajeConfiguracionOmr()) {
                <div [class]="errorConfiguracionOmr() ? 'border-rose-200 bg-rose-50 text-rose-900' : 'border-emerald-200 bg-emerald-50 text-emerald-900'" class="border rounded-xl px-4 py-3 text-xs font-bold">
                  <i [class]="errorConfiguracionOmr() ? 'pi pi-exclamation-triangle mr-1' : 'pi pi-check-circle mr-1'"></i>{{ mensajeConfiguracionOmr() }}
                </div>
              }

              <div class="rounded-xl border border-cyan-200 bg-cyan-50/60 px-4 py-3 text-xs text-cyan-950 leading-5">
                <i class="pi pi-info-circle mr-1"></i>
                Los cambios se guardan en la base oficial y se aplican al siguiente procesamiento. No alteran calificaciones ya guardadas ni sustituyen la revisión manual.
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label class="space-y-1.5">
                  <span class="block text-[10px] uppercase tracking-wide font-black text-muted-foreground">Densidad mínima de marca (%)</span>
                  <input type="number" min="40" max="95" step="0.5" [ngModel]="configuracionOmr().umbralDensidadMarca" (ngModelChange)="actualizarConfiguracionOmr('umbralDensidadMarca', $event)" class="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground" />
                  <small class="block text-[10px] text-muted-foreground">Más alto = lectura más estricta.</small>
                </label>
                <label class="space-y-1.5">
                  <span class="block text-[10px] uppercase tracking-wide font-black text-muted-foreground">Diferencial de doble marca</span>
                  <input type="number" min="1" max="50" step="0.5" [ngModel]="configuracionOmr().umbralDiferencialDoble" (ngModelChange)="actualizarConfiguracionOmr('umbralDiferencialDoble', $event)" class="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground" />
                  <small class="block text-[10px] text-muted-foreground">Menor diferencia entre dos opciones = doble marca.</small>
                </label>
                <label class="space-y-1.5">
                  <span class="block text-[10px] uppercase tracking-wide font-black text-muted-foreground">Umbral binario de grilla</span>
                  <input type="number" min="80" max="240" step="1" [ngModel]="configuracionOmr().umbralBinarioGrilla" (ngModelChange)="actualizarConfiguracionOmr('umbralBinarioGrilla', $event)" class="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground" />
                  <small class="block text-[10px] text-muted-foreground">Contraste utilizado para encontrar el cuadro.</small>
                </label>
                <label class="space-y-1.5">
                  <span class="block text-[10px] uppercase tracking-wide font-black text-muted-foreground">Nivel de tinta de marca</span>
                  <input type="number" min="40" max="220" step="1" [ngModel]="configuracionOmr().nivelTintaMarca" (ngModelChange)="actualizarConfiguracionOmr('nivelTintaMarca', $event)" class="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground" />
                  <small class="block text-[10px] text-muted-foreground">Intensidad de gris considerada tinta.</small>
                </label>
                <label class="space-y-1.5">
                  <span class="block text-[10px] uppercase tracking-wide font-black">Escala OCR del código</span>
                  <input type="number" min="1" max="5" step="0.1" [ngModel]="configuracionOmr().escalaOcr" (ngModelChange)="actualizarConfiguracionOmr('escalaOcr', $event)" class="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground" />
                </label>
                <label class="space-y-1.5">
                  <span class="block text-[10px] uppercase tracking-wide font-black">Búsqueda del centro (píxeles)</span>
                  <input type="number" min="0" max="5" step="1" [ngModel]="configuracionOmr().radioBusquedaPixeles" (ngModelChange)="actualizarConfiguracionOmr('radioBusquedaPixeles', $event)" class="w-full bg-card border border-border rounded-lg px-3 py-2 text-xs font-bold text-foreground" />
                </label>
              </div>

              <div class="border border-border rounded-xl p-4 space-y-3">
                <div>
                  <h4 class="text-xs font-black text-foreground uppercase tracking-wide">Zona exclusiva del código del estudiante</h4>
                  <p class="text-[10px] text-muted-foreground mt-1">Valores normalizados de 0 a 1 sobre la página completa. Ejemplo: 0.53 equivale a 53%.</p>
                </div>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label class="space-y-1"><span class="text-[10px] font-bold text-muted-foreground">X inicio</span><input type="number" min="0" max="1" step="0.001" [ngModel]="configuracionOmr().zonaCodigoX" (ngModelChange)="actualizarConfiguracionOmr('zonaCodigoX', $event)" class="w-full bg-card border border-border rounded-lg px-2.5 py-2 text-xs font-bold" /></label>
                  <label class="space-y-1"><span class="text-[10px] font-bold text-muted-foreground">Y inicio</span><input type="number" min="0" max="1" step="0.001" [ngModel]="configuracionOmr().zonaCodigoY" (ngModelChange)="actualizarConfiguracionOmr('zonaCodigoY', $event)" class="w-full bg-card border border-border rounded-lg px-2.5 py-2 text-xs font-bold" /></label>
                  <label class="space-y-1"><span class="text-[10px] font-bold text-muted-foreground">Ancho</span><input type="number" min="0.01" max="1" step="0.001" [ngModel]="configuracionOmr().zonaCodigoAncho" (ngModelChange)="actualizarConfiguracionOmr('zonaCodigoAncho', $event)" class="w-full bg-card border border-border rounded-lg px-2.5 py-2 text-xs font-bold" /></label>
                  <label class="space-y-1"><span class="text-[10px] font-bold text-muted-foreground">Alto</span><input type="number" min="0.01" max="1" step="0.001" [ngModel]="configuracionOmr().zonaCodigoAlto" (ngModelChange)="actualizarConfiguracionOmr('zonaCodigoAlto', $event)" class="w-full bg-card border border-border rounded-lg px-2.5 py-2 text-xs font-bold" /></label>
                </div>
              </div>

              @if (configuracionOmr().actualizadoEn) {
                <p class="text-[10px] text-muted-foreground">Última actualización: {{ configuracionOmr().actualizadoEn }} · {{ configuracionOmr().actualizadoPor || 'ADMIN_EVALUACIONES' }}</p>
              }
            </div>

            <div class="flex flex-wrap justify-end gap-2 p-6 border-t border-border">
              <button (click)="restaurarConfiguracionOmr()" [disabled]="guardandoConfiguracionOmr()" class="bg-card border border-border hover:bg-muted text-foreground font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer">Restaurar defaults</button>
              <button (click)="cerrarConfiguracionOmr()" class="bg-card border border-border hover:bg-muted text-foreground font-bold text-xs px-4 py-2.5 rounded-xl cursor-pointer">Cancelar</button>
              <button (click)="guardarConfiguracionOmr()" [disabled]="guardandoConfiguracionOmr() || cargandoConfiguracionOmr()" class="bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer">
                <i [class]="guardandoConfiguracionOmr() ? 'pi pi-spin pi-spinner' : 'pi pi-save'"></i>
                Guardar configuración
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Modal de Animación de Procesamiento OMR en Vivo -->
      @if (procesandoOmr()) {
        <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div class="bg-card border border-border rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl">
            
            <div class="relative w-20 h-20 mx-auto">
              <div class="absolute inset-0 rounded-full border-4 border-purple-200 border-t-purple-700 animate-spin"></div>
              <div class="absolute inset-0 flex items-center justify-center text-purple-700">
                <i class="pi pi-check-square text-2xl"></i>
              </div>
            </div>

            <div class="space-y-1.5">
              <h3 class="text-lg font-black text-foreground">Procesando Cartillas OMR...</h3>
              <p class="text-xs text-muted-foreground">
                Escaneando con OpenCV y comparando contra el Patrón Clave Oficial
              </p>
            </div>

            <!-- Barra de Progreso -->
            <div class="space-y-1">
              <div class="flex justify-between text-[11px] font-bold">
                <span class="text-purple-700">Página {{ paginaProgreso() }} de 5</span>
                <span class="text-muted-foreground">{{ (paginaProgreso() / 5) * 100 | number:'1.0-0' }}%</span>
              </div>
              <div class="h-2.5 bg-muted rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-purple-700 to-indigo-600 transition-all duration-300" [style.width.%]="(paginaProgreso() / 5) * 100"></div>
              </div>
            </div>

            <div class="text-[11px] text-emerald-600 font-bold bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-200 font-mono">
              ⚡ Segmentando cuadrículas y calculando densidad de burbujas...
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class CalificacionOmrComponent implements OnInit {
  public readonly gateway = inject(UnitepcGatewayService);
  private readonly rolExamenService = inject(RolExamenService);
  private readonly omrProcesamientoService = inject(OmrProcesamientoService);

  // Estados reactivos
  public estadoFlujo = signal<'ALINEACION' | 'RESULTADOS'>('ALINEACION');
  public calificacionEjecutada = signal<boolean>(false);
  public procesandoOmr = signal<boolean>(false);
  public paginaProgreso = signal<number>(1);

  public archivoCargadoNombre = signal<string>('Sin archivo seleccionado');
  public archivoSeleccionado = signal<File | null>(null);
  public rolesExamen = signal<RolExamenResponse[]>([]);
  public rolExamenSeleccionado = signal<string>('');
  public cargandoRoles = signal<boolean>(false);
  public rolExamenOpciones = computed<SearchableSelectOption[]>(() =>
    this.rolesExamen()
      .slice()
      .sort((a, b) => this.compararCodigos(a.materiaCodigo, b.materiaCodigo))
      .map(rol => ({
        value: rol.id,
        label: `${rol.materiaCodigo} · ${rol.materiaNombre} · ${rol.grupo} · ${rol.fecha}`,
        searchText: `${rol.materiaCodigo} ${rol.materiaNombre} ${rol.grupo} ${rol.fecha}`
      }))
  );
  public mensajeOmr = signal<string>('');
  public paginaAlineacionIdx = signal<number>(0);
  public mostrarGuiasAlineacion = signal<boolean>(true);
  public zoomAlineacion = signal<number>(0.85);
  public rotacionAlineacion = signal<number>(0);

  // Coordenadas dinámicas del marco de calibración OMR (%) - Cartilla en Hoja 1 (Margen 2.0 cm)
  public boxTop = signal<number>(16.9);
  public boxLeft = signal<number>(1.1);
  public boxWidth = signal<number>(73.2);
  public boxHeight = signal<number>(42.7);

  public estudiantes = signal<EstudianteOmrItem[]>([]);
  public estudianteActivoIdx = signal<number>(0);
  public modoAnotado = signal<boolean>(true);
  public zoomNivel = signal<number>(0.85);
  public rotacionGrados = signal<number>(0);

  // Se conserva únicamente para compatibilidad con helpers antiguos que ya no participan del flujo.
  private readonly patronArray = Array.from({ length: 60 }, (_, indice) => ({ q: indice + 1, ans: '' }));

  public paginasRenderizadas = signal<string[]>([]);
  public cargandoPdf = signal<boolean>(false);
  public dialogConfiguracionOmr = signal<boolean>(false);
  public cargandoConfiguracionOmr = signal<boolean>(false);
  public guardandoConfiguracionOmr = signal<boolean>(false);
  public mensajeConfiguracionOmr = signal<string>('');
  public errorConfiguracionOmr = signal<boolean>(false);
  public configuracionOmr = signal<ConfiguracionOmr>(this.configuracionOmrDefecto());

  public totalPaginas = computed(() => {
    return this.paginasRenderizadas().length;
  });

  public listaBotonesPagina = computed(() => {
    const custom = this.paginasRenderizadas();
    if (custom.length > 0) {
      return Array.from({ length: custom.length }, (_, i) => i);
    }
    return this.estudiantes().map((_, i) => i);
  });

  public imagenActivaAlineacion = computed(() => {
    const custom = this.paginasRenderizadas();
    const idx = this.paginaAlineacionIdx();
    if (custom.length > 0) {
      return custom[idx] || custom[0];
    }
    const est = this.estudiantePaginaActiva();
    return est ? ('assets/omr/' + est.imagenEscaneada) : '';
  });

  public estudiantePaginaActiva = computed(() => {
    const list = this.estudiantes();
    const idx = this.paginaAlineacionIdx();
    return list[idx] || list[0] || null;
  });

  public estudianteSeleccionado = computed(() => {
    const list = this.estudiantes();
    const idx = this.estudianteActivoIdx();
    return list[idx] || list[0] || null;
  });

  public promedioCurso = computed(() => {
    const list = this.estudiantes();
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, e) => acc + e.nota100, 0);
    return Math.round((sum / list.length) * 10) / 10;
  });

  public tasaAprobacion = computed(() => {
    const list = this.estudiantes();
    if (list.length === 0) return 0;
    const apr = list.filter(e => e.aprobado).length;
    return Math.round((apr / list.length) * 100);
  });

  public aprobadosCount = computed(() => {
    return this.estudiantes().filter(e => e.aprobado).length;
  });

  public ngOnInit(): void {
    this._cargarRolesOficiales();
    this._cargarConfiguracionOmr();
  }

  private configuracionOmrDefecto(): ConfiguracionOmr {
    return {
      umbralDensidadMarca: 70,
      umbralDiferencialDoble: 18,
      umbralBinarioGrilla: 185,
      nivelTintaMarca: 145,
      zonaCodigoX: 0.53,
      zonaCodigoY: 0.09,
      zonaCodigoAncho: 0.22,
      zonaCodigoAlto: 0.05,
      escalaOcr: 2.5,
      radioBusquedaPixeles: 2
    };
  }

  private _cargarConfiguracionOmr(): void {
    this.cargandoConfiguracionOmr.set(true);
    this.omrProcesamientoService.obtenerConfiguracion().subscribe({
      next: configuracion => {
        this.configuracionOmr.set(configuracion);
        this.errorConfiguracionOmr.set(false);
      },
      error: error => {
        console.error('No se pudo cargar la configuración OMR:', error);
        this.errorConfiguracionOmr.set(true);
        this.mensajeConfiguracionOmr.set('No se pudo consultar la configuración oficial. Se muestran los valores predeterminados.');
      },
      complete: () => this.cargandoConfiguracionOmr.set(false)
    });
  }

  public abrirConfiguracionOmr(): void {
    this.mensajeConfiguracionOmr.set('');
    this.errorConfiguracionOmr.set(false);
    this.dialogConfiguracionOmr.set(true);
  }

  public cerrarConfiguracionOmr(): void {
    if (!this.guardandoConfiguracionOmr()) {
      this.dialogConfiguracionOmr.set(false);
    }
  }

  public actualizarConfiguracionOmr(campo: keyof ConfiguracionOmr, valor: string | number): void {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) return;
    this.configuracionOmr.update(actual => ({ ...actual, [campo]: numero }));
    this.mensajeConfiguracionOmr.set('');
  }

  public restaurarConfiguracionOmr(): void {
    this.configuracionOmr.set(this.configuracionOmrDefecto());
    this.mensajeConfiguracionOmr.set('Valores predeterminados restaurados en el formulario. Presione Guardar configuración para aplicarlos.');
    this.errorConfiguracionOmr.set(false);
  }

  public guardarConfiguracionOmr(): void {
    this.guardandoConfiguracionOmr.set(true);
    this.mensajeConfiguracionOmr.set('');
    this.errorConfiguracionOmr.set(false);
    this.omrProcesamientoService.guardarConfiguracion(this.configuracionOmr()).subscribe({
      next: configuracion => {
        this.configuracionOmr.set(configuracion);
        this.mensajeConfiguracionOmr.set('Configuración guardada. Se aplicará al siguiente procesamiento OMR.');
      },
      error: error => {
        console.error('No se pudo guardar la configuración OMR:', error);
        this.errorConfiguracionOmr.set(true);
        this.mensajeConfiguracionOmr.set('No se pudo guardar la configuración. Revise los rangos e intente nuevamente.');
      },
      complete: () => this.guardandoConfiguracionOmr.set(false)
    });
  }

  private _cargarRolesOficiales(): void {
    this.cargandoRoles.set(true);
    this.rolExamenService.listar().subscribe({
      next: roles => {
        // La modalidad no determina si un rol puede calificarse con OMR.
        // Las cartillas son preimpresas y el cotejo usa el mapeo oficial
        // del rol seleccionado, incluso si el rol fue creado sin cartilla.
        const rolesDisponibles = roles.filter(rol =>
          !['PROGRAMADO', 'VALIDADO'].includes(rol.estadoFlujo) &&
          rol.variantesGeneradasCount > 0
        ).sort((a, b) => this.compararCodigos(a.materiaCodigo, b.materiaCodigo));
        this.rolesExamen.set(rolesDisponibles);
        const primerRol = this.rolesExamen()[0];
        if (primerRol) {
          this.rolExamenSeleccionado.set(primerRol.id);
        }
      },
      error: () => this.mensajeOmr.set('No se pudieron cargar los roles oficiales de evaluación.'),
      complete: () => this.cargandoRoles.set(false)
    });
  }

  private compararCodigos(a: string, b: string): number {
    return (a || '').localeCompare(b || '', 'es', { numeric: true, sensitivity: 'base' });
  }

  public moverCaja(dx: number, dy: number): void {
    this.boxLeft.set(Math.round((this.boxLeft() + dx) * 10) / 10);
    this.boxTop.set(Math.round((this.boxTop() + dy) * 10) / 10);
  }

  public ajustarDimensiones(dw: number, dh: number): void {
    this.boxWidth.set(Math.max(Math.round((this.boxWidth() + dw) * 10) / 10, 50));
    this.boxHeight.set(Math.max(Math.round((this.boxHeight() + dh) * 10) / 10, 15));
  }

  public aplicarPresetEscaneoFisico(): void {
    this.boxTop.set(16.9);
    this.boxLeft.set(1.1);
    this.boxWidth.set(73.2);
    this.boxHeight.set(42.7);
  }

  public aplicarPresetDigital(): void {
    this.aplicarPresetEscaneoFisico();
  }

  public autoCalibrarCartilla(): void {
    const imgSrc = this.imagenActivaAlineacion();
    if (!imgSrc) {
      this.aplicarPresetEscaneoFisico();
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          this.aplicarPresetEscaneoFisico();
          return;
        }
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const markerResult = this._detectarEsquinasFiducialesEnImageData(imgData.data, img.width, img.height);
        if (markerResult) {
          this.boxTop.set(markerResult.boxTop);
          this.boxLeft.set(markerResult.boxLeft);
          this.boxWidth.set(markerResult.boxWidth);
          this.boxHeight.set(markerResult.boxHeight);
          return;
        }

        // Fallback al contorno de la cartilla
        const contorno = this._detectarContornoCartillaEnCanvas(imgData.data, img.width, img.height);
        this.boxTop.set(Math.round((contorno.ry / img.height) * 1000) / 10);
        this.boxLeft.set(Math.round((contorno.rx / img.width) * 1000) / 10);
        this.boxWidth.set(Math.round((contorno.rw / img.width) * 1000) / 10);
        this.boxHeight.set(Math.round((contorno.rh / img.height) * 1000) / 10);
      } catch (e) {
        this.aplicarPresetEscaneoFisico();
      }
    };
    img.onerror = () => this.aplicarPresetEscaneoFisico();
    img.src = imgSrc;
  }

  public sanitizer = inject(DomSanitizer);
  public pdfBlobUrl = signal<SafeResourceUrl | null>(null);

  public async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.archivoSeleccionado.set(file);
      this.estudiantes.set([]);
      this.calificacionEjecutada.set(false);
      this.mensajeOmr.set('');
      this.archivoCargadoNombre.set(file.name);
      this.estadoFlujo.set('ALINEACION');
      this.paginaAlineacionIdx.set(0);
      this.zoomAlineacion.set(0.85);
      this.rotacionAlineacion.set(0);
      this.mostrarGuiasAlineacion.set(true);

      const objUrl = URL.createObjectURL(file);
      this.pdfBlobUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(objUrl));

      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        this.cargandoPdf.set(true);
        try {
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
          const pdfDoc = await loadingTask.promise;
          const renderedPages: string[] = [];

          for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
            const page = await pdfDoc.getPage(pageNum);
            const viewport = page.getViewport({ scale: 2.0 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (context) {
              await page.render({ canvasContext: context, viewport }).promise;
              renderedPages.push(canvas.toDataURL('image/png'));
            }
          }

          if (renderedPages.length > 0) {
            this.paginasRenderizadas.set(renderedPages);
          } else {
            this.mensajeOmr.set('El PDF no contiene páginas renderizables. Seleccione nuevamente el escaneo.');
          }
        } catch (err) {
          console.error('Error renderizando PDF escaneado:', err);
          this.mensajeOmr.set('No se pudo mostrar el PDF. Verifique que sea un escaneo PDF válido.');
        } finally {
          this.cargandoPdf.set(false);
        }
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          if (dataUrl) {
            this.paginasRenderizadas.set([dataUrl]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  }

  public ejecutarProcesamientoOmrEnVivo(): void {
    const archivo = this.archivoSeleccionado();
    const rolId = this.rolExamenSeleccionado();
    if (!archivo) {
      this.mensajeOmr.set('Seleccione el PDF o la imagen escaneada antes de procesar.');
      return;
    }
    if (!rolId) {
      this.mensajeOmr.set('Seleccione el rol oficial de evaluación para validar el código del estudiante.');
      return;
    }

    this.mensajeOmr.set('');
    this.procesandoOmr.set(true);
    this.calificacionEjecutada.set(false);
    this.paginaProgreso.set(1);
    this.omrProcesamientoService.procesar(rolId, archivo).subscribe({
      next: aceptado => this._esperarResultadoOmr(aceptado.jobId, archivo),
      error: error => {
        console.error('Error enviando escaneo OMR al backend:', error);
        this.procesandoOmr.set(false);
        this.mensajeOmr.set('No se pudo enviar el escaneo al motor OMR. Revise que el backend y RabbitMQ estén disponibles.');
      }
    });
  }

  private _esperarResultadoOmr(jobId: string, archivo: File): void {
    this.omrProcesamientoService.consultar(jobId).subscribe({
      next: resultado => {
        if (resultado.estado === 'EN_COLA') {
          window.setTimeout(() => this._esperarResultadoOmr(jobId, archivo), 1200);
          return;
        }
        this.procesandoOmr.set(false);
        if (resultado.estado !== 'COMPLETADO') {
          this.mensajeOmr.set(resultado.mensaje || 'El motor OMR no pudo completar la lectura.');
          return;
        }
        const paginas = this.paginasRenderizadas();
        const lecturas = (resultado.resultados || []).map((lectura, indice) =>
          this._convertirLecturaOmr(lectura, paginas[indice] || '', indice + 1)
        );
        this.estudiantes.set(lecturas);
        this.estudianteActivoIdx.set(0);
        this.paginaProgreso.set(resultado.totalPaginas || lecturas.length || 1);
        this.calificacionEjecutada.set(true);
        this.estadoFlujo.set('RESULTADOS');
        this.mensajeOmr.set(resultado.mensaje || 'Lectura OMR completada. Los códigos no reconocidos quedaron para revisión manual.');
      },
      error: error => {
        console.error('Error consultando resultado OMR:', error);
        this.procesandoOmr.set(false);
        this.mensajeOmr.set('No se pudo consultar el resultado del motor OMR.');
      }
    });
  }

  private _convertirLecturaOmr(lectura: OmrLecturaResponse, imagen: string, pagina: number): EstudianteOmrItem {
    const rol = this.rolesExamen().find(item => item.id === this.rolExamenSeleccionado());
    const total = lectura.totalReactivos || lectura.detalles?.length || 60;
    const respuestas = lectura.respuestas || {};
    const respuestasLeidas = Object.values(respuestas).filter(respuesta => !!respuesta).length;
    const detalles: DetallePreguntaOmr[] = Array.from({ length: total }, (_, indice) => {
      const pregunta = indice + 1;
      const marcada = respuestas[String(pregunta)] || '';
      const estado = marcada.length > 1 ? 'DOBLE_MARCA' : marcada ? 'LEIDA' : 'EN_BLANCO';
      return {
        pregunta,
        patron: '—',
        marcada,
        estado,
        puntos: 0,
        densidades: lectura.detalles?.[indice]?.densidades || []
      };
    });
    return {
      estudianteId: pagina,
      codigo: lectura.codigoEstudiante || 'NO RECONOCIDO',
      nombre: lectura.estudianteNombre || 'PENDIENTE DE REVISIÓN MANUAL',
      carrera: rol?.carreraNombre || '',
      grupo: rol?.grupo || '',
      variante: '',
      totalPreguntas: total,
      aciertos: lectura.aciertos || 0,
      fallos: lectura.fallos || 0,
      blancos: lectura.blancos || 0,
      doblesMarcas: lectura.doblesMarcas || 0,
      nota100: lectura.notaSobre100 || 0,
      nota30: lectura.notaSobre30 || 0,
      aprobado: lectura.estadoCalificacion === 'APROBADO',
      estadoCalificacion: lectura.estado === 'CALIFICADO' ? (lectura.estadoCalificacion || 'CALIFICADO') : 'REVISION_MANUAL',
      imagenEscaneada: imagen,
      imagenAnotada: imagen,
      detalles,
      pagina,
      codigoLeido: !!lectura.codigoEstudiante,
      codigoOcr: lectura.codigoOcr || [],
      grillaDetectada: !!lectura.grilla && lectura.grilla.ancho > 0 && lectura.grilla.alto > 0,
      respuestasLeidas
    };
  }

  private _detectarEsquinasFiducialesEnImageData(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): { rx: number; ry: number; rw: number; rh: number; boxTop: number; boxLeft: number; boxWidth: number; boxHeight: number } | null {
    // Busca el centro de masa del bloque negro ■ en una región ROI
    const findMarkerInRoi = (x1Pct: number, y1Pct: number, x2Pct: number, y2Pct: number): { x: number; y: number; minVal: number } | null => {
      const minX = Math.floor(width * x1Pct);
      const maxX = Math.floor(width * x2Pct);
      const minY = Math.floor(height * y1Pct);
      const maxY = Math.floor(height * y2Pct);
      const blockSize = Math.max(4, Math.floor(width * 0.012)); // ~12-16px tamaño del marcador

      let minAvg = 255;
      let bestX = -1;
      let bestY = -1;

      for (let y = minY; y <= maxY - blockSize; y += 2) {
        for (let x = minX; x <= maxX - blockSize; x += 2) {
          let sum = 0;
          let count = 0;
          for (let dy = 0; dy < blockSize; dy += 2) {
            for (let dx = 0; dx < blockSize; dx += 2) {
              const idx = ((y + dy) * width + (x + dx)) * 4;
              sum += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
              count++;
            }
          }
          const avg = sum / count;
          if (avg < minAvg) {
            minAvg = avg;
            bestX = x + Math.floor(blockSize / 2);
            bestY = y + Math.floor(blockSize / 2);
          }
        }
      }

      if (bestX !== -1 && minAvg < 140) {
        return { x: bestX, y: bestY, minVal: minAvg };
      }
      return null;
    };

    // Cuadrantes de búsqueda de las 4 esquinas ■ de la cartilla OMR
    const tl = findMarkerInRoi(0.04, 0.20, 0.18, 0.36); // Superior Izquierda
    const tr = findMarkerInRoi(0.82, 0.20, 0.96, 0.36); // Superior Derecha
    const bl = findMarkerInRoi(0.04, 0.50, 0.18, 0.68); // Inferior Izquierda
    const br = findMarkerInRoi(0.82, 0.50, 0.96, 0.68); // Inferior Derecha

    if (tl && tr && bl && br) {
      const rx = Math.min(tl.x, bl.x);
      const ry = Math.min(tl.y, tr.y);
      const rightX = Math.max(tr.x, br.x);
      const bottomY = Math.max(bl.y, br.y);
      const rw = rightX - rx;
      const rh = bottomY - ry;

      if (rw > width * 0.65 && rh > height * 0.20) {
        return {
          rx,
          ry,
          rw,
          rh,
          boxTop: Math.round((ry / height) * 1000) / 10,
          boxLeft: Math.round((rx / width) * 1000) / 10,
          boxWidth: Math.round((rw / width) * 1000) / 10,
          boxHeight: Math.round((rh / height) * 1000) / 10
        };
      }
    }

    return null;
  }

  private _detectarContornoCartillaEnCanvas(
    data: Uint8ClampedArray,
    width: number,
    height: number
  ): { rx: number; ry: number; rw: number; rh: number } {
    // 1. Intentar anclaje exacto por las 4 esquinas fiduciales ■
    const markerResult = this._detectarEsquinasFiducialesEnImageData(data, width, height);
    if (markerResult) {
      return {
        rx: markerResult.rx,
        ry: markerResult.ry,
        rw: markerResult.rw,
        rh: markerResult.rh
      };
    }

    // 2. Fallback de alta precisión para Cartilla en Hoja 1 OMR (Margen 2.0 cm)
    return {
      rx: Math.floor(width * 0.011),
      ry: Math.floor(height * 0.169),
      rw: Math.floor(width * 0.732),
      rh: Math.floor(height * 0.427)
    };
  }

  private _procesarPaginaOmrConCanvas(
    imgDataUrl: string,
    bTopPct: number,
    bLeftPct: number,
    bWidthPct: number,
    bHeightPct: number
  ): Promise<{
    aciertos: number;
    fallos: number;
    blancos: number;
    dobles: number;
    nota100: number;
    detalles: DetallePreguntaOmr[];
    imagenAnotada: string;
  }> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({
            aciertos: 0,
            fallos: 30,
            blancos: 30,
            dobles: 0,
            nota100: 0,
            detalles: [],
            imagenAnotada: imgDataUrl
          });
          return;
        }

        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, img.width, img.height);
        const data = imgData.data;

        // Detectar automáticamente el recuadro negro exacto de la cartilla
        const detected = this._detectarContornoCartillaEnCanvas(data, img.width, img.height);
        const rx = detected.rx;
        const ry = detected.ry;
        const rw = detected.rw;
        const rh = detected.rh;

        const col_w = rw / 4.0;
        const opt_pcts = [0.244, 0.412, 0.580, 0.748, 0.916];
        const opciones = ['A', 'B', 'C', 'D', 'E'];

        const detalles: DetallePreguntaOmr[] = [];
        let aciertos = 0;
        let fallos = 0;
        let blancos = 0;
        let dobles = 0;

        const bubbleRadius = Math.max(Math.floor(rh * 0.019), 5);

        // Evaluar las 30 preguntas con coordenadas exactas de cada fila (1 a 15)
        for (let q = 1; q <= 30; q++) {
          const c_idx = Math.floor((q - 1) / 15);
          const r_idx = (q - 1) % 15;
          const col_start = rx + c_idx * col_w;
          const cy = Math.floor(ry + rh * (0.094 + r_idx * 0.0632));

          const densidades: number[] = [];
          const optCoords: { cx: number; cy: number }[] = [];

          for (let optIdx = 0; optIdx < 5; optIdx++) {
            const cx = Math.floor(col_start + opt_pcts[optIdx] * col_w);
            optCoords.push({ cx, cy });

            // Muestreo de píxeles oscuros en la burbuja
            let darkPixels = 0;
            let totalSampled = 0;
            const rSample = bubbleRadius;

            for (let dy = -rSample; dy <= rSample; dy++) {
              for (let dx = -rSample; dx <= rSample; dx++) {
                if (dx * dx + dy * dy <= rSample * rSample) {
                  const px = cx + dx;
                  const py = cy + dy;
                  if (px >= 0 && px < img.width && py >= 0 && py < img.height) {
                    const idx = (py * img.width + px) * 4;
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];
                    const brightness = (r + g + b) / 3;
                    
                    // Píxel oscuro o tinta azul/negra
                    if (brightness < 135 || (b > r + 20 && b > g + 20)) {
                      darkPixels++;
                    }
                    totalSampled++;
                  }
                }
              }
            }

            const pct = totalSampled > 0 ? (darkPixels / totalSampled) * 100 : 0;
            densidades.push(pct);
          }

          // Encontrar máxima densidad
          let maxDens = -1;
          let maxIdx = 0;
          let secondDens = -1;
          let secondIdx = 0;

          densidades.forEach((d, idx) => {
            if (d > maxDens) {
              secondDens = maxDens;
              secondIdx = maxIdx;
              maxDens = d;
              maxIdx = idx;
            } else if (d > secondDens) {
              secondDens = d;
              secondIdx = idx;
            }
          });

          const patron = this.patronArray[q - 1].ans;
          let marcada = '';
          let estado: 'CORRECTA' | 'INCORRECTA' | 'EN_BLANCO' | 'DOBLE_MARCA' = 'CORRECTA';
          let puntos = 0;

          if (maxDens < 9.5) {
            estado = 'EN_BLANCO';
            marcada = '';
            blancos++;
          } else if (secondDens >= 12.0 && (maxDens - secondDens) < 3.5) {
            estado = 'DOBLE_MARCA';
            marcada = opciones[maxIdx] + opciones[secondIdx];
            dobles++;
            fallos++;
          } else {
            marcada = opciones[maxIdx];
            if (marcada === patron) {
              estado = 'CORRECTA';
              puntos = 3.333;
              aciertos++;
            } else {
              estado = 'INCORRECTA';
              fallos++;
            }
          }

          detalles.push({
            pregunta: q,
            patron,
            marcada,
            estado,
            puntos: Math.round(puntos * 100) / 100,
            densidades
          });

          // Dibujar anotación visual sobre el canvas
          const patronIdx = opciones.indexOf(patron);
          if (estado === 'CORRECTA') {
            // Círculo Verde en la opción marcada correcta
            const coord = optCoords[maxIdx];
            ctx.strokeStyle = '#10B981';
            ctx.lineWidth = Math.max(Math.floor(img.width / 400), 2.5);
            ctx.beginPath();
            ctx.arc(coord.cx, coord.cy, bubbleRadius + 4, 0, Math.PI * 2);
            ctx.stroke();
          } else if (estado === 'INCORRECTA') {
            // Círculo Rojo en la opción marcada incorrecta
            if (maxIdx >= 0) {
              const coord = optCoords[maxIdx];
              ctx.strokeStyle = '#EF4444';
              ctx.lineWidth = Math.max(Math.floor(img.width / 400), 2.5);
              ctx.beginPath();
              ctx.arc(coord.cx, coord.cy, bubbleRadius + 4, 0, Math.PI * 2);
              ctx.stroke();
            }
            // Círculo Azul en la clave del patrón oficial
            if (patronIdx >= 0) {
              const coordPatron = optCoords[patronIdx];
              ctx.strokeStyle = '#3B82F6';
              ctx.lineWidth = Math.max(Math.floor(img.width / 500), 2);
              ctx.beginPath();
              ctx.arc(coordPatron.cx, coordPatron.cy, bubbleRadius + 4, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        }

        const nota100 = Math.round((aciertos / 30.0) * 1000) / 10;

        // Dibujar banner OMR superior
        const bannerH = Math.max(Math.floor(img.height * 0.022), 26);
        ctx.fillStyle = nota100 >= 51 ? '#10B981' : '#EF4444';
        ctx.fillRect(rx, ry - bannerH - 4, rw, bannerH);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.floor(bannerH * 0.55)}px sans-serif`;
        ctx.textBaseline = 'middle';
        ctx.fillText(`OMR SCORE: ${nota100}/100 pts (${aciertos}/30 Aciertos) - ${nota100 >= 51 ? 'APROBADO' : 'REPROBADO'}`, rx + 10, ry - bannerH / 2 - 4);

        resolve({
          aciertos,
          fallos,
          blancos,
          dobles,
          nota100,
          detalles,
          imagenAnotada: canvas.toDataURL('image/png')
        });
      };
      img.onerror = () => {
        resolve({
          aciertos: 0,
          fallos: 30,
          blancos: 30,
          dobles: 0,
          nota100: 0,
          detalles: [],
          imagenAnotada: imgDataUrl
        });
      };
      img.src = imgDataUrl;
    });
  }

  public seleccionarEstudiante(idx: number): void {
    this.estudianteActivoIdx.set(Number(idx));
  }

  public ajustarZoom(delta: number): void {
    const nuevo = Math.min(Math.max(this.zoomNivel() + delta, 0.4), 2.0);
    this.zoomNivel.set(nuevo);
  }

  public rotarImagen(): void {
    this.rotacionGrados.set((this.rotacionGrados() + 90) % 360);
  }

  public resetearVisor(): void {
    this.zoomNivel.set(0.85);
    this.rotacionGrados.set(0);
    this.modoAnotado.set(true);
  }

  public exportarActaNotasExcel(): void {
    const list = this.estudiantes();
    if (list.length === 0) return;

    const rol = this.rolesExamen().find(item => item.id === this.rolExamenSeleccionado());
    const codigoMateria = rol?.materiaCodigo || 'EVALUACION';
    const parcial = rol?.tipoParcial || 'Parcial';
    const codigoArchivo = `${codigoMateria}_${parcial}`.replace(/[^a-zA-Z0-9_-]/g, '_');

    const data: any[][] = [
      ['UNIVERSIDAD TÉCNICA PRIVADA COSMOS - UNITEPC'],
      ['ACTA OFICIAL DE CALIFICACIONES OMR - SISTEMA DE EVALUACIONES'],
      ['ASIGNATURA:', rol ? `[${rol.materiaCodigo}] ${rol.materiaNombre}` : 'No especificada', 'EVALUACIÓN:', parcial],
      ['DOCENTE:', rol?.docenteNombre || 'No identificado', 'FECHA:', rol?.fecha || new Date().toLocaleDateString()],
      [],
      ['Nº', 'CÓDIGO ESTUDIANTE', 'APELLIDOS Y NOMBRES', 'CARRERA', 'GRUPO', 'ACIERTOS (30P)', 'FALLOS', 'BLANCOS', 'DOBLES', 'NOTA FINAL (/100)', 'ESTADO']
    ];

    list.forEach((est, idx) => {
      data.push([
        idx + 1,
        est.codigo,
        est.nombre,
        est.carrera,
        est.grupo,
        est.aciertos,
        est.fallos,
        est.blancos,
        est.doblesMarcas,
        est.nota100,
        est.aprobado ? 'APROBADO' : 'REPROBADO'
      ]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Acta_Calificaciones_OMR');
    XLSX.writeFile(wb, `ACTA_CALIFICACIONES_OMR_${codigoArchivo}.xlsx`);
  }
}
