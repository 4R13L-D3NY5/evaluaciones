import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UnitepcGatewayService } from '../../core/services/unitepc-gateway.service';
import { 
  BranchOffice, 
  Career, 
  Course, 
  GroupItem, 
  Campus, 
  TimeFrame 
} from '../../core/models/unitepc-gateway.models';

/**
 * Componente: Catálogo Académico UNITEPC (SEA Gateway Explorer)
 * Visualizador jerárquico interactivo de Sedes, Carreras, Materias, Grupos y Horarios.
 * @author Ariel Camara / XpertiFlow
 */
@Component({
  selector: 'sea-catalogo-unitepc',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <div class="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <i class="pi pi-building-columns text-base"></i>
            </div>
            <h2 class="text-2xl font-black tracking-tight text-foreground">Servicios SEA</h2>
          </div>
          <p class="text-xs text-muted-foreground mt-1">
            Exploración en vivo de Sedes, Carreras, Materias, Grupos, Docentes, Aulas, Horarios y Campus sincronizados con el Gateway SEA.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <button 
            (click)="recargarTodo()" 
            [disabled]="cargando()"
            class="bg-card hover:bg-muted text-primary border border-border font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 shadow-2xs transition-colors disabled:opacity-50">
            <i class="pi pi-sync" [class.pi-spin]="cargando()"></i>
            <span>Sincronizar Gateway</span>
          </button>
        </div>
      </div>

      <!-- Banner de Estado de Conexión Gateway (OAuth2 M2M) -->
      <div class="bg-card border border-border rounded-xl p-4 shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-4">
          
          <div class="flex items-center gap-3">
            <div class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-black text-foreground">Conexión Gateway Activa (M2M)</span>
                <span class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                  HTTPS OAuth2 200 OK
                </span>
              </div>
              <p class="text-[11px] text-muted-foreground mt-0.5">
                Endpoint: <span class="font-mono text-primary">https://gw-dev.unitepc.solutions</span> · ClientId: <span class="font-mono text-foreground font-bold">sea-evaluaciones</span>
              </p>
            </div>
          </div>

          <!-- Métricas de Token y Gestión -->
          <div class="flex flex-wrap items-center gap-3">
            <div class="bg-muted/70 border border-border rounded-lg px-3 py-1.5 text-right">
              <div class="text-[10px] font-extrabold uppercase text-muted-foreground">Gestión Académica</div>
              <div class="text-xs font-black text-primary font-mono">{{ gestionActiva() }}</div>
            </div>

            <div class="bg-muted/70 border border-border rounded-lg px-3 py-1.5 text-right">
              <div class="text-[10px] font-extrabold uppercase text-muted-foreground">Token TTL</div>
              <div class="text-xs font-black text-emerald-600 font-mono">{{ tokenSecondsRemaining() }}s</div>
            </div>
          </div>

        </div>
      </div>

      <!-- Pestañas Principales del Catálogo -->
      <div class="flex border-b border-border gap-2">
        <button 
          (click)="vistaActiva.set('jerarquia')" 
          [class]="vistaActiva() === 'jerarquia' ? 'border-primary text-primary font-black' : 'border-transparent text-muted-foreground hover:text-foreground font-bold'"
          class="px-4 py-2.5 border-b-2 text-xs flex items-center gap-2 transition-colors">
          <i class="pi pi-sitemap"></i>
          <span>Explorador Sedes & Pensum</span>
        </button>

        <button 
          (click)="vistaActiva.set('grupos')" 
          [class]="vistaActiva() === 'grupos' ? 'border-primary text-primary font-black' : 'border-transparent text-muted-foreground hover:text-foreground font-bold'"
          class="px-4 py-2.5 border-b-2 text-xs flex items-center gap-2 transition-colors">
          <i class="pi pi-users"></i>
          <span>Grupos, Docentes y Horarios ({{ grupos().length }})</span>
        </button>

        <button 
          (click)="vistaActiva.set('infraestructura')" 
          [class]="vistaActiva() === 'infraestructura' ? 'border-primary text-primary font-black' : 'border-transparent text-muted-foreground hover:text-foreground font-bold'"
          class="px-4 py-2.5 border-b-2 text-xs flex items-center gap-2 transition-colors">
          <i class="pi pi-map-marker"></i>
          <span>Campus & Gestiones</span>
        </button>
      </div>

      <!-- VISTA 1: JERARQUÍA SEDES -> CARRERAS -> MATERIAS -->
      @if (vistaActiva() === 'jerarquia') {
        <div class="space-y-6 animate-fade-in">
          
          <!-- 1. Carrusel / Grid de Sedes Oficiales -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-extrabold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <i class="pi pi-building text-primary"></i> 1. Selecciona una Sede Oficial ({{ sedes().length }} Sedes)
              </h3>
              @if (sedeSeleccionada()) {
                <span class="text-xs font-bold text-primary">
                  Sede Activa: <strong>{{ sedeSeleccionada()?.name }} ({{ sedeSeleccionada()?.code }})</strong>
                </span>
              }
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5">
              @for (sede of sedes(); track sede.branchOfficeId) {
                <button
                  (click)="seleccionarSede(sede)"
                  [class]="sedeSeleccionada()?.code === sede.code 
                    ? 'bg-primary text-white shadow-md border-primary scale-102 ring-2 ring-primary/30' 
                    : 'bg-card hover:bg-muted/70 text-foreground border-border'"
                  class="p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 group">
                  <span class="font-mono text-xs font-black tracking-wider uppercase"
                    [class.text-primary]="sedeSeleccionada()?.code !== sede.code">
                    {{ sede.code }}
                  </span>
                  <span class="text-[10px] font-bold truncate max-w-full"
                    [class.text-muted-foreground]="sedeSeleccionada()?.code !== sede.code">
                    {{ sede.name }}
                  </span>
                </button>
              }
            </div>
          </div>

          <!-- 2. Carreras de la Sede Seleccionada -->
          @if (sedeSeleccionada()) {
            <div class="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
              
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h3 class="text-sm font-black text-foreground flex items-center gap-2">
                    <i class="pi pi-graduation-cap text-primary"></i>
                    <span>2. Carreras en Sede {{ sedeSeleccionada()?.name }}</span>
                    <span class="bg-indigo-100 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">
                      {{ carrerasFiltradas().length }} Carreras
                    </span>
                  </h3>
                  <p class="text-[11px] text-muted-foreground mt-0.5">Selecciona una carrera para consultar sus materias del plan de estudios.</p>
                </div>

                <!-- Buscador de Carreras -->
                <div class="relative w-full sm:w-72">
                  <input 
                    type="text" 
                    [(ngModel)]="busquedaCarrera" 
                    placeholder="Filtrar carrera por nombre o código..."
                    class="w-full bg-muted/70 border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-foreground outline-none focus:border-primary">
                  <i class="pi pi-search absolute left-2.5 top-2 text-muted-foreground text-xs"></i>
                </div>
              </div>

              <!-- Selector / Cards de Carreras -->
              @if (cargandoCarreras()) {
                <div class="py-8 flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <i class="pi pi-spin pi-spinner text-2xl text-primary"></i>
                  <span class="text-xs font-bold">Cargando carreras de {{ sedeSeleccionada()?.name }}...</span>
                </div>
              } @else if (carrerasFiltradas().length === 0) {
                <div class="py-8 text-center text-muted-foreground text-xs font-medium">
                  No se encontraron carreras para los filtros aplicados.
                </div>
              } @else {
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto pr-1">
                  @for (carrera of carrerasFiltradas(); track carrera.careerId) {
                    <button
                      (click)="seleccionarCarrera(carrera)"
                      [class]="carreraSeleccionada()?.careerCode === carrera.careerCode 
                        ? 'bg-primary/10 border-primary text-primary font-bold shadow-2xs' 
                        : 'bg-muted/40 hover:bg-muted border-border text-foreground'"
                      class="p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 group">
                      <div class="min-w-0">
                        <span class="font-mono text-[10px] font-black uppercase text-primary block">
                          {{ carrera.careerCode }}
                        </span>
                        <h4 class="text-xs font-bold text-foreground line-clamp-2 mt-0.5 group-hover:text-primary transition-colors">
                          {{ carrera.careerName }}
                        </h4>
                      </div>
                      <i [class]="carreraSeleccionada()?.careerCode === carrera.careerCode ? 'pi pi-check-circle text-primary' : 'pi pi-chevron-right text-muted-foreground/50'" class="text-xs shrink-0 mt-1"></i>
                    </button>
                  }
                </div>
              }

            </div>
          }

          <!-- 3. Materias de la Carrera Seleccionada -->
          @if (carreraSeleccionada()) {
            <div class="bg-card border border-border rounded-xl shadow-xs overflow-hidden space-y-0">
              
              <!-- Cabecera de Materias -->
              <div class="p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="bg-primary text-white font-mono text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                      {{ carreraSeleccionada()?.careerCode }}
                    </span>
                    <h3 class="text-sm font-black text-foreground">
                      3. Materias del Pensum: {{ carreraSeleccionada()?.careerName }}
                    </h3>
                  </div>
                  <p class="text-[11px] text-muted-foreground mt-0.5">
                    Sede {{ sedeSeleccionada()?.name }} · {{ materias().length }} Asignaturas registradas en el pensum oficial
                  </p>
                </div>

                <!-- Buscador de Materias -->
                <div class="relative w-full sm:w-64">
                  <input 
                    type="text" 
                    [(ngModel)]="busquedaMateria" 
                    placeholder="Buscar materia o código..."
                    class="w-full bg-card border border-border rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium text-foreground outline-none focus:border-primary">
                  <i class="pi pi-search absolute left-2.5 top-2 text-muted-foreground text-xs"></i>
                </div>
              </div>

              <!-- Tabla de Materias -->
              @if (cargandoMaterias()) {
                <div class="py-12 flex flex-col items-center justify-center text-muted-foreground gap-2">
                  <i class="pi pi-spin pi-spinner text-2xl text-primary"></i>
                  <span class="text-xs font-bold">Cargando materias de {{ carreraSeleccionada()?.careerName }}...</span>
                </div>
              } @else if (materiasFiltradas().length === 0) {
                <div class="py-12 text-center text-muted-foreground text-xs font-medium">
                  No se encontraron materias para esta carrera.
                </div>
              } @else {
                <div class="overflow-x-auto">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="border-b border-border bg-muted/50 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                        <th class="p-3.5 text-center">Semestre</th>
                        <th class="p-3.5">Código Oficial</th>
                        <th class="p-3.5">Nombre de la Asignatura</th>
                        <th class="p-3.5 text-center">Créditos</th>
                        <th class="p-3.5 text-center">Horas Teoría</th>
                        <th class="p-3.5 text-center">Horas Práctica</th>
                        <th class="p-3.5 text-right font-mono">UUID Syllabus</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border text-xs">
                      @for (mat of materiasFiltradas(); track mat.syllabusCourseId) {
                        <tr class="hover:bg-muted/30 transition-colors">
                          
                          <!-- Semestre -->
                          <td class="p-3.5 text-center">
                            <span class="h-6 w-6 rounded-full bg-primary/10 text-primary font-mono font-black text-[11px] inline-flex items-center justify-center">
                              {{ mat.semester }}°
                            </span>
                          </td>

                          <!-- Código -->
                          <td class="p-3.5 font-mono font-bold text-primary">
                            {{ mat.courseCode }}
                          </td>

                          <!-- Nombre -->
                          <td class="p-3.5">
                            <div class="font-black text-foreground">{{ mat.courseName }}</div>
                          </td>

                          <!-- Créditos -->
                          <td class="p-3.5 text-center font-mono font-bold text-muted-foreground">
                            {{ mat.credits }}
                          </td>

                          <!-- Horas Teoría -->
                          <td class="p-3.5 text-center font-mono text-muted-foreground">
                            {{ mat.theoryHours }} hrs
                          </td>

                          <!-- Horas Práctica -->
                          <td class="p-3.5 text-center font-mono text-muted-foreground">
                            {{ mat.practiceHours }} hrs
                          </td>

                          <!-- UUID Syllabus -->
                          <td class="p-3.5 text-right font-mono text-[10px] text-muted-foreground">
                            <span class="bg-muted px-2 py-0.5 rounded border border-border truncate inline-block max-w-[120px]" [title]="mat.syllabusCourseId">
                              {{ mat.syllabusCourseId }}
                            </span>
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
      }

      <!-- VISTA 2: GRUPOS, DOCENTES Y HORARIOS (GESTIÓN 2-2026) -->
      @if (vistaActiva() === 'grupos') {
        <div class="space-y-4 animate-fade-in">
          
          <div class="bg-card border border-border rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 class="text-sm font-black text-foreground flex items-center gap-2">
                <i class="pi pi-users text-primary"></i>
                <span>Grupos y Carga Docente Registrada (Gestión {{ gestionActiva() }})</span>
              </h3>
              <p class="text-[11px] text-muted-foreground mt-0.5">
                Cruce de docentes titulares, números de documento, horarios semanales, aulas y campus físicos.
              </p>
            </div>

            <!-- Buscador de Grupos -->
            <div class="relative w-full sm:w-72">
              <input 
                type="text" 
                [(ngModel)]="busquedaGrupo" 
                placeholder="Buscar por docente, CI, aula o grupo..."
                class="w-full bg-muted/70 border border-border rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-foreground outline-none focus:border-primary">
              <i class="pi pi-search absolute left-2.5 top-2.5 text-muted-foreground text-xs"></i>
            </div>
          </div>

          <!-- Grid de Grupos -->
          @if (cargandoGrupos()) {
            <div class="py-16 flex flex-col items-center justify-center text-muted-foreground gap-2">
              <i class="pi pi-spin pi-spinner text-3xl text-primary"></i>
              <span class="text-xs font-bold">Consultando grupos y horarios del Gateway...</span>
            </div>
          } @else if (gruposFiltrados().length === 0) {
            <div class="bg-card border border-border rounded-xl p-12 text-center text-muted-foreground text-xs font-medium">
              No se encontraron grupos para los criterios de búsqueda.
            </div>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              @for (grp of gruposFiltrados(); track grp.groupId) {
                <div class="bg-card border border-border rounded-xl p-4 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between gap-3">
                  
                  <!-- Cabecera del Grupo -->
                  <div class="flex items-start justify-between gap-2 border-b border-border pb-2.5">
                    <div class="flex items-center gap-2">
                      <span class="h-8 w-8 rounded-lg bg-indigo-50 text-primary font-mono font-black text-xs flex items-center justify-center shrink-0">
                        {{ grp.code }}
                      </span>
                      <div>
                        <span class="text-[10px] font-extrabold uppercase text-muted-foreground">Tipo {{ grp.classType }}</span>
                        <div class="font-mono text-[10px] text-primary font-bold">Term: {{ grp.term }}</div>
                      </div>
                    </div>

                    <span class="bg-muted text-muted-foreground text-[10px] font-mono px-2 py-0.5 rounded border border-border truncate max-w-[100px]" [title]="grp.groupId">
                      {{ grp.groupId.slice(0, 8) }}...
                    </span>
                  </div>

                  <!-- Docente Asignado -->
                  <div class="space-y-1">
                    <div class="text-[10px] font-extrabold uppercase text-muted-foreground flex items-center gap-1">
                      <i class="pi pi-user text-primary text-[10px]"></i> Docente Titular
                    </div>
                    <div class="font-bold text-xs text-foreground">{{ grp.teacherName || 'Docente No Asignado' }}</div>
                    @if (grp.teacherIdentityNumber) {
                      <div class="text-[10px] font-mono text-muted-foreground">
                        CI: <strong class="text-foreground">{{ grp.teacherIdentityNumber }}</strong>
                      </div>
                    }
                  </div>

                  <!-- Horarios y Aulas -->
                  <div class="space-y-1.5 pt-2 border-t border-border">
                    <div class="text-[10px] font-extrabold uppercase text-muted-foreground flex items-center gap-1">
                      <i class="pi pi-clock text-primary text-[10px]"></i> Horarios y Aulas
                    </div>

                    @if (grp.schedules && grp.schedules.length > 0) {
                      <div class="space-y-1">
                        @for (sch of grp.schedules; track $index) {
                          <div class="bg-muted/50 rounded-lg p-2 text-[11px] flex items-center justify-between gap-2">
                            <span class="font-black text-primary font-mono">{{ sch.day }} {{ sch.startTime }} - {{ sch.endTime }}</span>
                            <div class="text-right">
                              <span class="font-bold text-foreground">{{ sch.classroom }}</span>
                              <div class="text-[9px] text-muted-foreground">{{ sch.campus }}</div>
                            </div>
                          </div>
                        }
                      </div>
                    } @else {
                      <div class="text-[11px] text-muted-foreground italic">Sin horarios específicos registrados</div>
                    }
                  </div>

                  <!-- Botón Ver Estudiantes Matriculados en Vivo (byGroup) -->
                  <div class="pt-2 border-t border-border">
                    <button 
                      (click)="abrirModalEstudiantes(grp)"
                      class="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white font-bold text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors">
                      <i class="pi pi-users text-xs"></i>
                      <span>Ver Estudiantes Matriculados</span>
                    </button>
                  </div>

                </div>
              }
            </div>
          }

        </div>
      }

      <!-- VISTA 3: CAMPUS FÍSICOS Y GESTIONES -->
      @if (vistaActiva() === 'infraestructura') {
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in">
          
          <!-- Campus Físicos -->
          <div class="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 class="text-sm font-black text-foreground flex items-center gap-2">
                  <i class="pi pi-map-marker text-primary"></i>
                  <span>Campus Físicos UNITEPC</span>
                </h3>
                <p class="text-[11px] text-muted-foreground mt-0.5">Infraestructura y predios universitarios disponibles.</p>
              </div>
              <span class="bg-indigo-100 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">
                {{ campusList().length }} Campus
              </span>
            </div>

            <div class="space-y-2 max-h-96 overflow-y-auto pr-1">
              @for (cmp of campusList(); track cmp.name) {
                <div class="bg-muted/40 rounded-xl p-3 border border-border flex items-center justify-between">
                  <div class="flex items-center gap-2.5">
                    <div class="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs">
                      <i class="pi pi-building"></i>
                    </div>
                    <span class="text-xs font-bold text-foreground">{{ cmp.name }}</span>
                  </div>
                  @if (cmp.code) {
                    <span class="font-mono text-[10px] bg-muted px-2 py-0.5 rounded font-bold text-primary">
                      {{ cmp.code }}
                    </span>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Gestiones Institucionales -->
          <div class="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
            <div class="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 class="text-sm font-black text-foreground flex items-center gap-2">
                  <i class="pi pi-calendar text-primary"></i>
                  <span>Gestiones Institucionales (TimeFrames)</span>
                </h3>
                <p class="text-[11px] text-muted-foreground mt-0.5">Periodos académicos habilitados en la universidad.</p>
              </div>
              <span class="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full">
                Gestión Activa: {{ gestionActiva() }}
              </span>
            </div>

            <div class="space-y-2 max-h-96 overflow-y-auto pr-1">
              @for (tf of timeFrames(); track tf.code) {
                <div class="bg-muted/40 rounded-xl p-3 border border-border flex items-center justify-between"
                  [class.border-emerald-500]="tf.code === gestionActiva()">
                  <div class="flex items-center gap-2.5">
                    <div class="h-7 w-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center text-xs">
                      <i class="pi pi-calendar-check"></i>
                    </div>
                    <div>
                      <span class="text-xs font-black text-foreground font-mono">{{ tf.code || tf.name }}</span>
                      <div class="text-[10px] text-muted-foreground">{{ tf.name }}</div>
                    </div>
                  </div>

                  @if (tf.code === gestionActiva()) {
                    <span class="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-2xs">
                      VIGENTE
                    </span>
                  }
                </div>
              }
            </div>
          </div>

        </div>
      }

      <!-- Modal: Estudiantes Matriculados por Grupo (Gateway byGroup) -->
      @if (modalEstudiantesAbierto()) {
        <div class="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div class="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
            
            <!-- Modal Header -->
            <div class="p-5 border-b border-border bg-muted/40 flex items-start justify-between gap-4">
              <div class="flex items-center gap-3">
                <div class="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-mono font-black text-sm">
                  {{ grupoSeleccionado()?.code || 'GRP' }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-black text-foreground">Estudiantes Matriculados</h3>
                    <span class="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-black px-2 py-0.5 rounded-full">
                      {{ estudiantesGrupo().length }} Alumnos
                    </span>
                  </div>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    Docente: <strong class="text-foreground">{{ grupoSeleccionado()?.teacherName || 'No Asignado' }}</strong> · Gestión: {{ grupoSeleccionado()?.term }}
                  </p>
                </div>
              </div>

              <button 
                (click)="cerrarModalEstudiantes()" 
                class="h-8 w-8 rounded-lg bg-muted hover:bg-border text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors">
                <i class="pi pi-times text-xs"></i>
              </button>
            </div>

            <!-- Modal Body -->
            <div class="p-5 overflow-y-auto space-y-4 flex-1">
              @if (cargandoEstudiantes()) {
                <div class="py-16 flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <i class="pi pi-spin pi-spinner text-3xl text-primary"></i>
                  <span class="text-xs font-bold">Consultando estudiantes matriculados en vivo del Gateway...</span>
                  <span class="text-[11px] font-mono text-muted-foreground">GET /students/byGroup?groupId={{ grupoSeleccionado()?.groupId }}</span>
                </div>
              } @else if (estudiantesGrupo().length === 0) {
                <div class="py-12 text-center text-muted-foreground text-xs font-medium space-y-1">
                  <i class="pi pi-info-circle text-2xl text-muted-foreground block mb-2"></i>
                  <div class="font-bold">No se encontraron estudiantes matriculados en este grupo.</div>
                  <div class="text-[11px]">Es posible que el período de matriculación aún no haya iniciado para este grupo.</div>
                </div>
              } @else {
                <div class="border border-border rounded-xl overflow-hidden">
                  <table class="w-full text-left border-collapse">
                    <thead>
                      <tr class="bg-muted/60 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border">
                        <th class="p-3 text-center">N°</th>
                        <th class="p-3">Código</th>
                        <th class="p-3">Nombre Completo del Estudiante</th>
                        <th class="p-3 text-center">Estado Académico</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-border text-xs">
                      @for (est of estudiantesGrupo(); track est.studentCode; let i = $index) {
                        <tr class="hover:bg-muted/30 transition-colors">
                          <td class="p-3 text-center font-mono font-bold text-muted-foreground text-[11px]">{{ i + 1 }}</td>
                          <td class="p-3 font-mono font-black text-primary">{{ est.studentCode }}</td>
                          <td class="p-3 font-bold text-foreground">{{ est.fullName }}</td>
                          <td class="p-3 text-center">
                            <span class="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                              <i class="pi pi-check text-[9px]"></i> {{ est.courseState || 'CURSANDO' }}
                            </span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>

            <!-- Modal Footer -->
            <div class="p-4 border-t border-border bg-muted/20 flex items-center justify-between">
              <div class="text-[11px] text-muted-foreground font-mono truncate max-w-sm">
                GroupId: {{ grupoSeleccionado()?.groupId }}
              </div>
              <button 
                (click)="cerrarModalEstudiantes()" 
                class="bg-muted hover:bg-border text-foreground font-bold text-xs py-2 px-4 rounded-xl transition-colors">
                Cerrar
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class CatalogoUnitepcComponent implements OnInit, OnDestroy {
  private readonly _gateway = inject(UnitepcGatewayService);

  // Estados de Vista
  public vistaActiva = signal<'jerarquia' | 'grupos' | 'infraestructura'>('jerarquia');
  public cargando = signal<boolean>(false);
  public cargandoCarreras = signal<boolean>(false);
  public cargandoMaterias = signal<boolean>(false);
  public cargandoGrupos = signal<boolean>(false);
  public cargandoEstudiantes = signal<boolean>(false);

  // Modal Estudiantes
  public modalEstudiantesAbierto = signal<boolean>(false);
  public grupoSeleccionado = signal<GroupItem | null>(null);
  public estudiantesGrupo = signal<any[]>([]);

  // Datos
  public sedes = signal<BranchOffice[]>([]);
  public sedeSeleccionada = signal<BranchOffice | null>(null);

  public carreras = signal<Career[]>([]);
  public carreraSeleccionada = signal<Career | null>(null);

  public materias = signal<Course[]>([]);
  public grupos = signal<GroupItem[]>([]);
  public campusList = signal<Campus[]>([]);
  public timeFrames = signal<TimeFrame[]>([]);

  // Token & Gestión
  public gestionActiva = signal<string>('2-2026');
  public tokenSecondsRemaining = signal<number>(7200);

  // Filtros de búsqueda
  public busquedaCarrera = '';
  public busquedaMateria = '';
  public busquedaGrupo = '';

  private _tokenIntervalId: any = null;

  // Computeds
  public carrerasFiltradas = computed(() => {
    const q = this.busquedaCarrera.trim().toLowerCase();
    if (!q) return this.carreras();
    return this.carreras().filter(c => 
      c.careerName.toLowerCase().includes(q) || 
      c.careerCode.toLowerCase().includes(q)
    );
  });

  public materiasFiltradas = computed(() => {
    const q = this.busquedaMateria.trim().toLowerCase();
    if (!q) return this.materias();
    return this.materias().filter(m => 
      m.courseName.toLowerCase().includes(q) || 
      m.courseCode.toLowerCase().includes(q)
    );
  });

  public gruposFiltrados = computed(() => {
    const q = this.busquedaGrupo.trim().toLowerCase();
    if (!q) return this.grupos();
    return this.grupos().filter(g => 
      (g.teacherName && g.teacherName.toLowerCase().includes(q)) || 
      (g.teacherIdentityNumber && g.teacherIdentityNumber.includes(q)) ||
      (g.code && g.code.toLowerCase().includes(q)) ||
      (g.schedules && g.schedules.some(s => s.classroom && s.classroom.toLowerCase().includes(q)))
    );
  });

  public ngOnInit(): void {
    this._cargarSedes();
    this._cargarGrupos();
    this._cargarInfraestructura();

    // Timer para refrescar el contador de segundos del token
    this._tokenIntervalId = setInterval(() => {
      const state = this._gateway.getTokenState();
      this.tokenSecondsRemaining.set(state.secondsRemaining);
    }, 1000);
  }

  public ngOnDestroy(): void {
    if (this._tokenIntervalId) {
      clearInterval(this._tokenIntervalId);
    }
  }

  public recargarTodo(): void {
    this._gateway.clearTokenCache();
    this._cargarSedes();
    this._cargarGrupos();
    this._cargarInfraestructura();
  }

  public seleccionarSede(sede: BranchOffice): void {
    this.sedeSeleccionada.set(sede);
    this.carreraSeleccionada.set(null);
    this.materias.set([]);
    this._cargarCarrerasDeSede(sede.code);
  }

  public seleccionarCarrera(carrera: Career): void {
    this.carreraSeleccionada.set(carrera);
    const sede = this.sedeSeleccionada();
    if (sede) {
      this._cargarMateriasDeCarrera(sede.code, carrera.careerCode);
    }
  }

  private _cargarSedes(): void {
    this.cargando.set(true);
    this._gateway.getBranchOffices().subscribe({
      next: data => {
        this.sedes.set(data);
        this.cargando.set(false);
        // Seleccionar Cochabamba (CBA) por defecto si existe
        if (!this.sedeSeleccionada() && data.length > 0) {
          const cba = data.find(s => s.code === 'CBA') || data[0];
          this.seleccionarSede(cba);
        }
      },
      error: () => this.cargando.set(false)
    });
  }

  private _cargarCarrerasDeSede(branchCode: string): void {
    this.cargandoCarreras.set(true);
    this._gateway.getCareers(branchCode).subscribe({
      next: data => {
        this.carreras.set(data);
        this.cargandoCarreras.set(false);
        // Seleccionar primera carrera por defecto si existe
        if (data.length > 0) {
          this.seleccionarCarrera(data[0]);
        }
      },
      error: () => this.cargandoCarreras.set(false)
    });
  }

  private _cargarMateriasDeCarrera(branchCode: string, careerCode: string): void {
    this.cargandoMaterias.set(true);
    this._gateway.getCourses(branchCode, careerCode).subscribe({
      next: data => {
        this.materias.set(data);
        this.cargandoMaterias.set(false);
      },
      error: () => this.cargandoMaterias.set(false)
    });
  }

  private _cargarGrupos(): void {
    this.cargandoGrupos.set(true);
    this._gateway.getGroups('2-2026').subscribe({
      next: data => {
        this.grupos.set(data);
        this.cargandoGrupos.set(false);
      },
      error: () => this.cargandoGrupos.set(false)
    });
  }

  private _cargarInfraestructura(): void {
    this._gateway.getCampuses().subscribe({
      next: data => this.campusList.set(data),
      error: () => {}
    });

    this._gateway.getTimeFrames().subscribe({
      next: data => this.timeFrames.set(data),
      error: () => {}
    });

    this._gateway.getActiveTimeFrame().subscribe({
      next: data => {
        if (data && (data.code || data.name)) {
          this.gestionActiva.set(data.code || data.name);
        }
      },
      error: () => {}
    });
  }

  public abrirModalEstudiantes(grp: GroupItem): void {
    this.grupoSeleccionado.set(grp);
    this.estudiantesGrupo.set([]);
    this.modalEstudiantesAbierto.set(true);
    this.cargandoEstudiantes.set(true);

    this._gateway.getStudentsByGroup(grp.groupId).subscribe({
      next: data => {
        this.estudiantesGrupo.set(data || []);
        this.cargandoEstudiantes.set(false);
      },
      error: err => {
        console.error('[CatalogoUnitepcComponent] Error al cargar estudiantes:', err);
        this.estudiantesGrupo.set([]);
        this.cargandoEstudiantes.set(false);
      }
    });
  }

  public cerrarModalEstudiantes(): void {
    this.modalEstudiantesAbierto.set(false);
    this.grupoSeleccionado.set(null);
    this.estudiantesGrupo.set([]);
  }
}
