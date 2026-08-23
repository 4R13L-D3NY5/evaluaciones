const routes = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/dashboard' },
      { path: 'dashboard', component: () => import('../pages/DashboardEvaluacionesPage.vue') },
      
      // Rutas del Ecosistema Evaluaciones SIDOPA (alias directos y anidados)
      { path: 'roles-examenes', component: () => import('../pages/RolExamenesPage.vue') },
      { path: 'evaluaciones/rol-examenes', component: () => import('../pages/RolExamenesPage.vue') },
      { path: 'evaluaciones/gestion', component: () => import('../pages/RolExamenesPage.vue') },
      { path: 'programacion-director', component: () => import('../pages/ProgramacionDirectorPage.vue') },
      
      // Administración y Configuración Global
      { path: 'admin/evaluaciones-config', component: () => import('../pages/AdministracionEvaluacionPage.vue') },
      
      // Reportes Operativos
      { path: 'admin/reportes-evaluaciones', component: () => import('../pages/ReporteEvaluacionesPage.vue') },
      
      { path: 'examenes-generados', component: () => import('../pages/ExamenesGeneradosPage.vue') },

      // Redirección para cualquier ruta no encontrada dentro del Layout
      { path: ':catchAll(.*)*', redirect: '/dashboard' }
    ]
  },
  {
    path: '/login',
    component: () => import('../pages/LoginPage.vue')
  }
]

export default routes
