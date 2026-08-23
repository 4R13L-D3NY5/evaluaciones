import { defineStore } from 'pinia'
import { useAuthStore } from './authStore'

export const useMockStorageStore = defineStore('mockStorage', {
  state: () => ({
    useMock: true,
    rolesExamenes: JSON.parse(localStorage.getItem('eval_roles_examenes')) || [
      {
        id: 1,
        gestion_codigo: '2-2026',
        sede_nombre: 'Cochabamba',
        carrera_nombre: 'Medicina',
        asignatura_codigo: 'MED-212',
        asignatura_nombre: 'Anatomía Humana II',
        grupo_nombre: 'Grupo 3',
        docente_nombre: 'Dr. Carlos Mendoza',
        tipo_evaluacion: '1ER_PARCIAL',
        fecha_examen: '2026-08-20',
        hora_inicio: '08:00',
        hora_fin: '09:30',
        aula: 'Aula 302',
        con_cartilla: true,
        estado: 'PROGRAMADO',
        total_estudiantes: 45,
        excel_banco_path: null,
        motivo_suspension: null,
        trazabilidad: [
          {
            id: 101,
            user_nombre: 'Dr. Roberto Flores',
            user_rol: 'DIRECTOR',
            estado_anterior: 'INICIO',
            estado_nuevo: 'PROGRAMADO',
            motivo_comentario: 'Examen programado en el sistema por la Dirección de Carrera (con cartillas).',
            created_at: '2026-08-11T10:30:00Z'
          }
        ],
        examenesGenerados: []
      },
      {
        id: 2,
        gestion_codigo: '2-2026',
        sede_nombre: 'Guayaramerín',
        carrera_nombre: 'Bioquímica y Farmacia',
        asignatura_codigo: 'BYF-511',
        asignatura_nombre: 'Farmacología Clínica',
        grupo_nombre: 'Grupo 1',
        docente_nombre: 'Dra. Mariana Siles',
        tipo_evaluacion: '1ER_PARCIAL',
        fecha_examen: '2026-08-22',
        hora_inicio: '10:00',
        hora_fin: '11:30',
        aula: 'Laboratorio 1',
        con_cartilla: false,
        estado: 'BANCO_RECIBIDO',
        total_estudiantes: 30,
        excel_banco_path: 'banco_byf511_1P.xlsx',
        motivo_suspension: null,
        trazabilidad: [
          {
            id: 201,
            user_nombre: 'Dra. Elena Prado',
            user_rol: 'DIRECTOR',
            estado_anterior: 'INICIO',
            estado_nuevo: 'PROGRAMADO',
            motivo_comentario: 'Programación creada en el sistema sin cartilla óptica.',
            created_at: '2026-08-11T09:15:00Z'
          },
          {
            id: 202,
            user_nombre: 'Lic. Gabriel Paz',
            user_rol: 'DEPT_EVALUACIONES',
            estado_anterior: 'PROGRAMADO',
            estado_nuevo: 'BANCO_RECIBIDO',
            motivo_comentario: 'Planilla de banco de preguntas en Excel recepcionada por correo y vinculada.',
            created_at: '2026-08-11T11:45:00Z'
          }
        ],
        examenesGenerados: []
      }
    ]
  }),

  actions: {
    persist() {
      localStorage.setItem('eval_roles_examenes', JSON.stringify(this.rolesExamenes))
    },

    getActiveActor() {
      const auth = useAuthStore()
      return auth.currentRole
    },

    agregarRol(nuevoRol) {
      const actor = this.getActiveActor()
      const id = this.rolesExamenes.length + 1
      const rolObj = {
        id,
        ...nuevoRol,
        estado: 'PROGRAMADO',
        trazabilidad: [
          {
            id: Date.now(),
            user_nombre: actor.userName,
            user_rol: actor.id,
            estado_anterior: 'INICIO',
            estado_nuevo: 'PROGRAMADO',
            motivo_comentario: `Examen programado por ${actor.label} (con_cartilla: ${nuevoRol.con_cartilla ? 'SI' : 'NO'})`,
            created_at: new Date().toISOString()
          }
        ],
        examenesGenerados: []
      }
      this.rolesExamenes.push(rolObj)
      this.persist()
      return rolObj
    },

    cargarExcel(id, filename) {
      const actor = this.getActiveActor()
      const rol = this.rolesExamenes.find(r => r.id === id)
      if (rol) {
        const estadoAnterior = rol.estado
        rol.excel_banco_path = filename
        rol.estado = 'BANCO_RECIBIDO'
        rol.trazabilidad.push({
          id: Date.now(),
          user_nombre: actor.userName,
          user_rol: actor.id,
          estado_anterior: estadoAnterior,
          estado_nuevo: 'BANCO_RECIBIDO',
          motivo_comentario: `Planilla '${filename}' recepcionada y vinculada por ${actor.label}.`,
          created_at: new Date().toISOString()
        })
        this.persist()
      }
    },

    generarExamen(id, versionCodigo = 'v1.0-REGULAR', esCasoEspecial = false) {
      const actor = this.getActiveActor()
      const rol = this.rolesExamenes.find(r => r.id === id)
      if (rol) {
        const estadoAnterior = rol.estado
        const variantes = ['A', 'B', 'C']
        
        variantes.forEach(v => {
          rol.examenesGenerados.push({
            id: Date.now() + Math.random(),
            version_codigo: versionCodigo,
            es_caso_especial: esCasoEspecial,
            variante: v,
            archivo_pdf_path: `examenes/${rol.id}_${versionCodigo}_Var${v}.pdf`,
            total_preguntas: 30,
            created_at: new Date().toISOString()
          })
        })

        rol.estado = 'GENERADO'
        rol.trazabilidad.push({
          id: Date.now(),
          user_nombre: actor.userName,
          user_rol: actor.id,
          estado_anterior: estadoAnterior,
          estado_nuevo: 'GENERADO',
          motivo_comentario: `Generación de examen completada (${versionCodigo}) por ${actor.label}.`,
          created_at: new Date().toISOString()
        })
        this.persist()
      }
    },

    cambiarEstado(id, nuevoEstado, comentario = '') {
      const actor = this.getActiveActor()
      const rol = this.rolesExamenes.find(r => r.id === id)
      if (rol) {
        const estadoAnterior = rol.estado
        rol.estado = nuevoEstado
        rol.trazabilidad.push({
          id: Date.now(),
          user_nombre: actor.userName,
          user_rol: actor.id,
          estado_anterior: estadoAnterior,
          estado_nuevo: nuevoEstado,
          motivo_comentario: comentario || `Transición a ${nuevoEstado} realizada por ${actor.label}`,
          created_at: new Date().toISOString()
        })
        this.persist()
      }
    },

    suspenderExamen(id, motivo) {
      const actor = this.getActiveActor()
      const rol = this.rolesExamenes.find(r => r.id === id)
      if (rol) {
        const estadoAnterior = rol.estado
        rol.estado = 'SUSPENDIDO'
        rol.motivo_suspension = motivo
        rol.trazabilidad.push({
          id: Date.now(),
          user_nombre: actor.userName,
          user_rol: actor.id,
          estado_anterior: estadoAnterior,
          estado_nuevo: 'SUSPENDIDO',
          motivo_comentario: `EXAMEN SUSPENDIDO por ${actor.label}. Motivo: ${motivo}`,
          created_at: new Date().toISOString()
        })
        this.persist()
      }
    }
  }
})
