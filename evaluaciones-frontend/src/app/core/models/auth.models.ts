export type AppRole =
  | 'ADMINISTRADOR_SISTEMA'
  | 'RESPONSABLE_EVALUACIONES'
  | 'PERSONAL_EVALUACIONES'
  | 'DOCENTE'
  | 'VICERRECTOR';

export interface UsuarioSesion {
  usuario: string;
  correo?: string;
  nombreCompleto: string;
  rol: AppRole;
  rolNombre: string;
  sedesAsignadas: string[];
}
