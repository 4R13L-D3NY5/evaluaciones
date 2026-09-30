export interface EstudianteSincronizadoDetalle {
  codigoEstudiante: string;
  studentOldCode?: number;
  nombreCompleto: string;
  score: number;
  completado?: boolean | null;
  observacion?: string;
  esReprogramado?: boolean;
}

export interface SincronizacionNotasSeaReporte {
  rolExamenId: string;
  materiaCodigo: string;
  materiaNombre: string;
  grupo: string;
  modalidad: string;
  tipoParcial: string;
  syllabusCourseId?: string;
  groupId?: string;
  totalEstudiantes: number;
  totalExitosos: number;
  totalFallidos: number;
  fechaSincronizacion?: string;
  sincronizadoPor?: string;
  estudiantes: EstudianteSincronizadoDetalle[];
}

export interface GrupoSincronizacionResumen {
  rolExamenId: string;
  materiaCodigo: string;
  materiaNombre: string;
  semestre?: number;
  grupo: string;
  tipoClase: string;
  esTeorico: boolean;
  modalidad: string;
  tipoParcial: string;
  docenteNombre?: string;
  docenteCi?: string;
  aula?: string;
  campus?: string;
  estadoFlujo: string;
  totalEstudiantes: number;
  totalCalificados: number;
  sincronizadoSea: boolean;
  fechaSincronizacionSea?: string;
  sincronizadoPor?: string;
  sincronizacionSeaResultado?: string;
  esSincronizable: boolean;
  motivoNoSincronizable?: string;
}

export interface SincronizacionMasivaRequest {
  rolExamenIds: string[];
}

export interface SincronizacionMasivaReporte {
  totalGruposSolicitados: number;
  totalGruposExitosos: number;
  totalGruposFallidos: number;
  totalEstudiantesSincronizados: number;
  fechaEjecucion: string;
  ejecutadoPor: string;
  resultadosPorGrupo: SincronizacionNotasSeaReporte[];
}
