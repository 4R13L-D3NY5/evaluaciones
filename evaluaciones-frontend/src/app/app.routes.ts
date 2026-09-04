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
import { CalificacionOmrComponent } from './pages/calificacion-omr/calificacion-omr.component';
import { LoginComponent } from './pages/auth/login.component';
import { authGuard, guestGuard, passwordGuard, roleGuard } from './core/guards/auth.guard';
import { ExamenVirtualComponent } from './pages/examen-virtual/examen-virtual.component';
import { SalaVirtualComponent } from './pages/sala-virtual/sala-virtual.component';
import { CambiarContrasenaComponent } from './pages/auth/cambiar-contrasena.component';
import { UsuariosSistemaComponent } from './pages/usuarios-sistema/usuarios-sistema.component';
import { RespaldosComponent } from './pages/respaldos/respaldos.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, canActivate: [guestGuard], title: 'Acceso - Sistema de Evaluaciones' },
  { path: 'cambiar-contrasena', component: CambiarContrasenaComponent, canActivate: [authGuard], title: 'Cambiar contraseña - Sistema de Evaluaciones' },
  { path: 'examen-virtual', component: ExamenVirtualComponent, title: 'Examen virtual - Sistema de Evaluaciones' },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard, passwordGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, canActivate: [roleGuard(['ADMINISTRADOR_SISTEMA', 'RESPONSABLE_EVALUACIONES', 'PERSONAL_EVALUACIONES', 'DOCENTE', 'VICERRECTOR', 'DIRECTOR_CARRERA'])], title: 'Dashboard - Sistema de Evaluaciones' },
      { path: 'catalogo-academico', component: CatalogoUnitepcComponent, canActivate: [roleGuard(['ADMINISTRADOR_SISTEMA'])], title: 'Servicios académicos - Sistema de Evaluaciones' },
      { path: 'servicios-sea', component: CatalogoUnitepcComponent, canActivate: [roleGuard(['ADMINISTRADOR_SISTEMA'])], title: 'Servicios académicos - Sistema de Evaluaciones' },
      { path: 'plan-estudios', component: PlanEstudiosComponent, canActivate: [roleGuard(['DIRECTOR_CARRERA', 'VICERRECTOR'])], title: 'Plan de Estudios - Sistema de Evaluaciones' },
      { path: 'evaluaciones-dia', component: EvaluacionesDiaComponent, canActivate: [roleGuard(['RESPONSABLE_EVALUACIONES', 'PERSONAL_EVALUACIONES', 'DIRECTOR_CARRERA', 'VICERRECTOR'])], title: 'Lista de Evaluaciones por Día - Sistema de Evaluaciones' },
      { path: 'salas-virtuales', component: SalaVirtualComponent, canActivate: [roleGuard(['ADMINISTRADOR_SISTEMA', 'DOCENTE'])], title: 'Salas virtuales - Sistema de Evaluaciones' },
      { path: 'calificacion-omr', component: CalificacionOmrComponent, canActivate: [roleGuard(['ADMINISTRADOR_SISTEMA', 'RESPONSABLE_EVALUACIONES'])], title: 'Calificación OMR - Sistema de Evaluaciones' },
      { path: 'banco-preguntas', component: BancoPreguntasComponent, canActivate: [roleGuard(['DOCENTE'])], title: 'Validador de Banco de Preguntas - Sistema de Evaluaciones' },
      { path: 'administracion-evaluaciones', component: AdministracionEvaluacionesComponent, canActivate: [roleGuard(['ADMINISTRADOR_SISTEMA', 'RESPONSABLE_EVALUACIONES'])], title: 'Administración - Sistema de Evaluaciones' },
      { path: 'reporte-evaluaciones', component: ReporteEvaluacionesComponent, canActivate: [roleGuard(['RESPONSABLE_EVALUACIONES', 'VICERRECTOR', 'DIRECTOR_CARRERA'])], title: 'Reporte Evaluaciones - Sistema de Evaluaciones' },
      { path: 'rol-examenes', component: RolExamenesComponent, canActivate: [roleGuard(['DIRECTOR_CARRERA', 'VICERRECTOR'])], title: 'Rol de Exámenes - Sistema de Evaluaciones' },
      { path: 'auditoria', component: AuditoriaComponent, canActivate: [roleGuard(['ADMINISTRADOR_SISTEMA'])], title: 'Auditoría & Bitácora - Sistema de Evaluaciones' },
      { path: 'usuarios-sistema', component: UsuariosSistemaComponent, canActivate: [roleGuard(['ADMINISTRADOR_SISTEMA'])], title: 'Usuarios y accesos - Sistema de Evaluaciones' },
      { path: 'respaldos', component: RespaldosComponent, canActivate: [roleGuard(['ADMINISTRADOR_SISTEMA'])], title: 'Respaldos y contingencia - Sistema de Evaluaciones' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
