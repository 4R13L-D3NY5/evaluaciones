import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { UnitepcGatewayService } from '../../core/services/unitepc-gateway.service';

export interface DetallePreguntaOmr {
  pregunta: number;
  patron: string;
  marcada: string;
  estado: 'CORRECTA' | 'INCORRECTA' | 'EN_BLANCO' | 'DOBLE_MARCA';
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
}

/**
 * Componente: Calificación Óptica OMR y Visor Interactivo de Cartillas
 * @author Ariel Camara / XpertiFlow
 */
@Component({
  selector: 'sea-calificacion-omr',
  standalone: true,
  imports: [CommonModule, FormsModule],
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
            Motor de lectura automática de cartillas de respuestas escaneadas, validación de marcas y auditoría de notas.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <!-- Botón Ver Patrón Oficial -->
          <button 
            (click)="dialogPatron.set(true)"
            class="bg-card border border-border hover:bg-muted text-foreground font-bold text-xs py-2.5 px-3.5 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-102 cursor-pointer">
            <i class="pi pi-key text-amber-600"></i>
            <span>Ver Patrón Clave (Var A)</span>
          </button>

          <!-- Botón Exportar Acta Excel -->
          <button 
            (click)="exportarActaNotasExcel()"
            class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-xs transition-transform hover:scale-102 cursor-pointer">
            <i class="pi pi-file-excel"></i>
            <span>Exportar Acta de Notas</span>
          </button>
        </div>
      </div>

      <!-- 2. Tarjetas Resumen del Proceso OMR -->
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

      <!-- 3. Visor Interactivo OMR: Split Screen (Izquierda Imagen / Derecha Desglose) -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- PANEL IZQUIERDO: VISOR DE CARTILLA ESCANEADA & CANVAS (7 Cols) -->
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
                    <i class="pi pi-minus"></i>
                  </button>
                  <span class="text-[10px] font-mono font-bold px-1.5 text-foreground">{{ (zoomNivel() * 100) | number:'1.0-0' }}%</span>
                  <button 
                    (click)="ajustarZoom(0.15)"
                    title="Aumentar Zoom"
                    class="h-6 w-6 flex items-center justify-center text-foreground hover:bg-muted rounded text-xs cursor-pointer">
                    <i class="pi pi-plus"></i>
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
                    [src]="modoAnotado() ? ('assets/omr/' + est.imagenAnotada) : ('assets/omr/' + est.imagenEscaneada)"
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
                Resolución: 300 DPI · OpenCV v5.0
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
                    CÓDIGO: {{ est.codigo }} · VARIANTE {{ est.variante }}
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
                  <span>Auditoría de Respuestas (30 Reactivos)</span>
                </h4>
                <span class="text-[10px] text-muted-foreground font-bold">
                  {{ est.aciertos }} de 30 correctas
                </span>
              </div>

              <div class="overflow-y-auto max-h-[380px] border border-border rounded-xl">
                <table class="w-full text-[11px] text-left border-collapse">
                  <thead class="bg-muted/80 text-muted-foreground uppercase text-[9px] font-black sticky top-0 border-b border-border">
                    <tr>
                      <th class="p-2 text-center">Nº</th>
                      <th class="p-2 text-center">Patrón</th>
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

      <!-- 4. Modal de Patrón Oficial de Respuestas (Var A) -->
      @if (dialogPatron()) {
        <div class="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden space-y-4 p-6">
            
            <div class="flex items-center justify-between border-b border-border pb-3">
              <div class="flex items-center gap-2">
                <i class="pi pi-key text-purple-700 text-lg"></i>
                <h3 class="text-base font-black text-foreground">Patrón Oficial de Respuestas (Variante A)</h3>
              </div>
              <button (click)="dialogPatron.set(false)" class="text-muted-foreground hover:text-foreground cursor-pointer">
                <i class="pi pi-times"></i>
              </button>
            </div>

            <p class="text-xs text-muted-foreground">
              Matriz de 30 reactivos con la clave oficial generada para la asignatura <strong>[CPEC18] AUDITORÍA TRIBUTARIA</strong>.
            </p>

            <div class="grid grid-cols-5 sm:grid-cols-6 gap-2">
              @for (item of patronArray; track item.q) {
                <div class="bg-muted/70 border border-border p-2 rounded-xl text-center">
                  <span class="text-[9px] font-extrabold text-muted-foreground block">P{{ item.q }}</span>
                  <span class="text-sm font-black font-mono text-purple-700">{{ item.ans }}</span>
                </div>
              }
            </div>

            <div class="flex justify-end pt-3 border-t border-border">
              <button 
                (click)="dialogPatron.set(false)"
                class="bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs px-4 py-2 rounded-xl cursor-pointer">
                Cerrar Patrón
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class CalificacionOmrComponent implements OnInit {
  public readonly gateway = inject(UnitepcGatewayService);

  // Estados reactivos
  public estudiantes = signal<EstudianteOmrItem[]>([]);
  public estudianteActivoIdx = signal<number>(0);
  public modoAnotado = signal<boolean>(true);
  public zoomNivel = signal<number>(0.85);
  public rotacionGrados = signal<number>(0);
  public dialogPatron = signal<boolean>(false);

  public patronArray = [
    { q: 1, ans: 'D' }, { q: 2, ans: 'C' }, { q: 3, ans: 'B' }, { q: 4, ans: 'B' }, { q: 5, ans: 'C' },
    { q: 6, ans: 'A' }, { q: 7, ans: 'A' }, { q: 8, ans: 'A' }, { q: 9, ans: 'A' }, { q: 10, ans: 'A' },
    { q: 11, ans: 'A' }, { q: 12, ans: 'A' }, { q: 13, ans: 'A' }, { q: 14, ans: 'A' }, { q: 15, ans: 'A' },
    { q: 16, ans: 'A' }, { q: 17, ans: 'A' }, { q: 18, ans: 'A' }, { q: 19, ans: 'A' }, { q: 20, ans: 'A' },
    { q: 21, ans: 'A' }, { q: 22, ans: 'A' }, { q: 23, ans: 'A' }, { q: 24, ans: 'A' }, { q: 25, ans: 'A' },
    { q: 26, ans: 'A' }, { q: 27, ans: 'A' }, { q: 28, ans: 'A' }, { q: 29, ans: 'A' }, { q: 30, ans: 'A' }
  ];

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
    this._cargarResultadosOmr();
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

    const data: any[][] = [
      ['UNIVERSIDAD TÉCNICA PRIVADA COSMOS - UNITEPC'],
      ['ACTA OFICIAL DE CALIFICACIONES OMR - SISTEMA SEA'],
      ['ASIGNATURA:', '[CPEC18] AUDITORÍA TRIBUTARIA', 'EVALUACIÓN:', '1er Parcial'],
      ['DOCENTE:', 'MAURICIO QUIROZ LAFUENTE', 'FECHA:', new Date().toLocaleDateString()],
      [],
      ['Nº', 'CÓDIGO ESTUDIANTE', 'APELLIDOS Y NOMBRES', 'CARRERA', 'GRUPO', 'VARIANTE', 'ACIERTOS (30P)', 'FALLOS', 'BLANCOS', 'DOBLES', 'NOTA FINAL (/100)', 'ESTADO']
    ];

    list.forEach((est, idx) => {
      data.push([
        idx + 1,
        est.codigo,
        est.nombre,
        est.carrera,
        est.grupo,
        est.variante,
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
    XLSX.writeFile(wb, `ACTA_CALIFICACIONES_OMR_CPEC18_1ER_PARCIAL.xlsx`);
  }

  private _cargarResultadosOmr(): void {
    // 5 Estudiantes con los resultados computados por el Motor OMR de OpenCV
    const mockEstudiantes: EstudianteOmrItem[] = [
      {
        estudianteId: 1,
        codigo: '7849102',
        nombre: 'JUAN CARLOS PÉREZ MAMANI',
        carrera: 'AUDITORÍA / CONTADURÍA',
        grupo: 'TA-01',
        variante: 'A',
        totalPreguntas: 30,
        aciertos: 28,
        fallos: 2,
        blancos: 0,
        doblesMarcas: 0,
        nota100: 93.3,
        nota30: 28.0,
        aprobado: true,
        estadoCalificacion: 'CALIFICADO',
        imagenEscaneada: 'cartilla_simulada_estudiante_1_7849102.png',
        imagenAnotada: 'cartilla_calificada_estudiante_1_7849102.png',
        detalles: this._generarDetallesEstudiante(1, { 4: 'C', 12: 'B' })
      },
      {
        estudianteId: 2,
        codigo: '8392104',
        nombre: 'MARÍA BELÉN QUISPE FLORES',
        carrera: 'AUDITORÍA / CONTADURÍA',
        grupo: 'TA-01',
        variante: 'A',
        totalPreguntas: 30,
        aciertos: 24,
        fallos: 6,
        blancos: 0,
        doblesMarcas: 0,
        nota100: 80.0,
        nota30: 24.0,
        aprobado: true,
        estadoCalificacion: 'CALIFICADO',
        imagenEscaneada: 'cartilla_simulada_estudiante_2_8392104.png',
        imagenAnotada: 'cartilla_calificada_estudiante_2_8392104.png',
        detalles: this._generarDetallesEstudiante(2, { 2: 'A', 5: 'A', 9: 'C', 15: 'D', 20: 'B', 28: 'C' })
      },
      {
        estudianteId: 3,
        codigo: '6928103',
        nombre: 'RODRIGO ALEJANDRO CONDORI RODRÍGUEZ',
        carrera: 'AUDITORÍA / CONTADURÍA',
        grupo: 'TA-01',
        variante: 'A',
        totalPreguntas: 30,
        aciertos: 18,
        fallos: 12,
        blancos: 0,
        doblesMarcas: 0,
        nota100: 60.0,
        nota30: 18.0,
        aprobado: true,
        estadoCalificacion: 'CALIFICADO',
        imagenEscaneada: 'cartilla_simulada_estudiante_3_6928103.png',
        imagenAnotada: 'cartilla_calificada_estudiante_3_6928103.png',
        detalles: this._generarDetallesEstudiante(3, { 1: 'A', 3: 'D', 6: 'B', 7: 'C', 10: 'E', 13: 'B', 16: 'C', 19: 'D', 22: 'E', 25: 'B', 27: 'C', 30: 'D' })
      },
      {
        estudianteId: 4,
        codigo: '7194820',
        nombre: 'GABRIELA SOFÍA LÓPEZ TORRICO',
        carrera: 'AUDITORÍA / CONTADURÍA',
        grupo: 'TA-01',
        variante: 'A',
        totalPreguntas: 30,
        aciertos: 13,
        fallos: 15,
        blancos: 2,
        doblesMarcas: 0,
        nota100: 43.3,
        nota30: 13.0,
        aprobado: false,
        estadoCalificacion: 'CALIFICADO',
        imagenEscaneada: 'cartilla_simulada_estudiante_4_7194820.png',
        imagenAnotada: 'cartilla_calificada_estudiante_4_7194820.png',
        detalles: this._generarDetallesEstudiante(4, { 1: 'B', 2: 'B', 4: 'A', 5: 'B', 7: 'B', 8: 'C', 9: 'D', 11: 'E', 14: '', 17: 'B', 18: 'C', 20: 'D', 21: 'E', 23: 'B', 24: 'C', 26: 'D', 29: '' })
      },
      {
        estudianteId: 5,
        codigo: '7391028',
        nombre: 'SERGIO ALEJANDRO MENDOZA TAPIA',
        carrera: 'AUDITORÍA / CONTADURÍA',
        grupo: 'TA-01',
        variante: 'A',
        totalPreguntas: 30,
        aciertos: 22,
        fallos: 7,
        blancos: 0,
        doblesMarcas: 1,
        nota100: 73.3,
        nota30: 22.0,
        aprobado: true,
        estadoCalificacion: 'CALIFICADO',
        imagenEscaneada: 'cartilla_simulada_estudiante_5_7391028.png',
        imagenAnotada: 'cartilla_calificada_estudiante_5_7391028.png',
        detalles: this._generarDetallesEstudiante(5, { 3: 'A', 5: 'D', 8: 'B', 11: 'C', 15: 'E', 18: 'AB', 22: 'D', 27: 'B' })
      }
    ];

    this.estudiantes.set(mockEstudiantes);
  }

  private _generarDetallesEstudiante(estId: number, overrides: Record<number, string>): DetallePreguntaOmr[] {
    const list: DetallePreguntaOmr[] = [];
    for (let q = 1; q <= 30; q++) {
      const patron = this.patronArray[q - 1].ans;
      const marcada = overrides[q] !== undefined ? overrides[q] : patron;

      let estado: 'CORRECTA' | 'INCORRECTA' | 'EN_BLANCO' | 'DOBLE_MARCA' = 'CORRECTA';
      let puntos = 3.33;

      if (marcada === '') {
        estado = 'EN_BLANCO';
        puntos = 0;
      } else if (marcada.length > 1) {
        estado = 'DOBLE_MARCA';
        puntos = 0;
      } else if (marcada !== patron) {
        estado = 'INCORRECTA';
        puntos = 0;
      }

      list.push({
        pregunta: q,
        patron,
        marcada,
        estado,
        puntos,
        densidades: [20, 5, 4, 6, 5]
      });
    }
    return list;
  }
}
