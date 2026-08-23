import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { PlanEstudiosComponent } from './pages/plan-estudios/plan-estudios.component';
import { EvaluacionesDiaComponent } from './pages/evaluaciones-dia/evaluaciones-dia.component';
import { AdministracionEvaluacionesComponent } from './pages/administracion/administracion.component';
import { ReporteEvaluacionesComponent } from './pages/reportes/reportes.component';
import { RolExamenesComponent } from './pages/rol-examenes/rol-examenes.component';
import { BancoPreguntasComponent } from './pages/banco-preguntas/banco-preguntas.component';
import { AuditoriaComponent } from './pages/auditoria/auditoria.component';
import { CatalogoUnitepcComponent } from './pages/catalogo-unitepc/catalogo-unitepc.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'catalogo-academico', component: CatalogoUnitepcComponent, title: 'Servicios SEA - Sistema de Evaluaciones' },
      { path: 'servicios-sea', component: CatalogoUnitepcComponent, title: 'Servicios SEA - Sistema de Evaluaciones' },
      { path: 'plan-estudios', component: PlanEstudiosComponent, title: 'Plan de Estudios - Sistema de Evaluaciones' },
      { path: 'evaluaciones-dia', component: EvaluacionesDiaComponent, title: 'Lista de Evaluaciones por Día - Sistema de Evaluaciones' },
      { path: 'banco-preguntas', component: BancoPreguntasComponent, title: 'Validador de Banco de Preguntas - Sistema de Evaluaciones' },
      { path: 'administracion-evaluaciones', component: AdministracionEvaluacionesComponent, title: 'Administración - Sistema de Evaluaciones' },
      { path: 'reporte-evaluaciones', component: ReporteEvaluacionesComponent, title: 'Reporte Evaluaciones - Sistema de Evaluaciones' },
      { path: 'rol-examenes', component: RolExamenesComponent, title: 'Rol de Exámenes - Sistema de Evaluaciones' },
      { path: 'auditoria', component: AuditoriaComponent, title: 'Auditoría & Bitácora - Sistema de Evaluaciones' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
