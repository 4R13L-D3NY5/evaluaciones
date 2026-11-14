export type EstadoSolicitudModificacion = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA';

export interface SolicitudModificacionResponse {
  id: string;
  rolExamenId: string;

  // Solicitante
  solicitanteId: number;
  solicitanteUsuario: string;
  solicitanteNombre: string;
  solicitanteRol: string;

  // Contexto académico
  sedeCodigo: string;
  carreraCodigo: string;
  materiaCodigo: string;
  materiaNombre: string;
  grupo: string;
  tipoParcial?: string;

  // Snapshot original
  fechaOriginal: string;
  horarioOriginal: string;
  modalidadOriginal: string;

  // Propuesta
  fechaPropuesta: string;
  horarioPropuesto: string;
  modalidadPropuesta: string;
  motivo: string;

  // Resolución
  estado: EstadoSolicitudModificacion;
  resolutorId?: number;
  resolutorUsuario?: string;
  resolutorNombre?: string;
  observacionResolucion?: string;
  fechaResolucion?: string;

  creadoEn: string;
  actualizadoEn: string;
}

export interface CrearSolicitudModificacionRequest {
  rolExamenId: string;
  fechaPropuesta: string;
  horarioPropuesto: string;
  modalidadPropuesta: string;
  motivo: string;
}

export interface ResolverSolicitudModificacionRequest {
  aprobado: boolean;
  observacion?: string;
}
