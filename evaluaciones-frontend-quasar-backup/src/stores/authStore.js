import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    // Actores disponibles en el sistema
    availableRoles: [
      {
        id: 'DIRECTOR',
        label: 'Director de Carrera',
        userName: 'Dr. Roberto Flores',
        userEmail: 'rflores@unitepc.edu.bo',
        icon: 'face',
        color: 'primary',
        description: 'Responsable de la programación de exámenes (con/sin cartilla) y autorizaciones.'
      },
      {
        id: 'DEPT_EVALUACIONES',
        label: 'Dpto. de Evaluaciones',
        userName: 'Lic. Gabriel Paz',
        userEmail: 'gpaz@unitepc.edu.bo',
        icon: 'verified_user',
        color: 'secondary',
        description: 'Recepciona Excel del docente, genera variantes PDF y administra la impresión.'
      },
      {
        id: 'DOCENTE',
        label: 'Docente / Aplicador',
        userName: 'Dr. Carlos Mendoza',
        userEmail: 'cmendoza@unitepc.edu.bo',
        icon: 'school',
        color: 'accent',
        description: 'Envía Excel por correo y aplica la prueba tomada en aula.'
      },
      {
        id: 'ADMIN',
        label: 'Administrador SISA',
        userName: 'Ing. Sistemas XpertiFlow',
        userEmail: 'sistemas@unitepc.edu.bo',
        icon: 'admin_panel_settings',
        color: 'dark',
        description: 'Control de parámetros globales, trazabilidad y supervisión del sistema.'
      }
    ],

    // Rol activo por defecto
    currentRole: JSON.parse(localStorage.getItem('eval_current_actor')) || {
      id: 'DEPT_EVALUACIONES',
      label: 'Dpto. de Evaluaciones',
      userName: 'Lic. Gabriel Paz',
      userEmail: 'gpaz@unitepc.edu.bo',
      icon: 'verified_user',
      color: 'secondary',
      description: 'Recepciona Excel del docente, genera variantes PDF y administra la impresión.'
    }
  }),

  actions: {
    setActor(roleId) {
      const selected = this.availableRoles.find(r => r.id === roleId)
      if (selected) {
        this.currentRole = selected
        localStorage.setItem('eval_current_actor', JSON.stringify(selected))
      }
    }
  }
})
