export type AppRole =
  | 'ADMINISTRADOR_SISTEMA'
  | 'RESPONSABLE_EVALUACIONES'
  | 'PERSONAL_EVALUACIONES'
  | 'DOCENTE'
  | 'VICERRECTOR'
  | 'DIRECTOR_CARRERA'
  | 'VERIFICADOR'
  | 'EVALUADOR_VOCACIONAL'
  | 'TALENTO_HUMANO';

export interface UsuarioSesion {
  usuario: string;
  correo?: string;
  nombreCompleto: string;
  rol: AppRole;
  rolNombre: string;
  debeCambiarContrasena: boolean;
  sedesAsignadas: string[];
  carrerasAsignadas: string[];
  puedeEditarRolesExamen?: boolean;
  puedeAprobarSolicitudesRol?: boolean;
  puedeModificarRatificacionDocente?: boolean;
  sesionExpiraEn?: number;
  sesionDuracionSegundos?: number;
}
