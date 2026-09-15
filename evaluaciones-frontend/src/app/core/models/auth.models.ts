export type AppRole =
  | 'ADMINISTRADOR_SISTEMA'
  | 'RESPONSABLE_EVALUACIONES'
  | 'PERSONAL_EVALUACIONES'
  | 'DOCENTE'
  | 'VICERRECTOR'
  | 'DIRECTOR_CARRERA'
  | 'VERIFICADOR';

export interface UsuarioSesion {
  usuario: string;
  correo?: string;
  nombreCompleto: string;
  rol: AppRole;
  rolNombre: string;
  debeCambiarContrasena: boolean;
  sedesAsignadas: string[];
  carrerasAsignadas: string[];
  sesionExpiraEn?: number;
  sesionDuracionSegundos?: number;
}
