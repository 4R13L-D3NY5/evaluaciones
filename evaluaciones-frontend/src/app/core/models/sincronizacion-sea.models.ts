export interface EstudianteSincronizadoDetalle {
  codigoEstudiante: string;
  studentOldCode?: number;
  nombreCompleto: string;
  score: number;
  completado?: boolean | null;
  observacion?: string;
  esReprogramado?: boolean;
  sincronizadoSea?: boolean;
  fechaSincronizacionSea?: string;
  sincronizadoSeaPor?: string;
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

export interface DiscrepanciaGrupoItem {
  codigoEstudiante: string;
  studentOldCode?: number;
  nombreEstudiante: string;
  materiaCodigo: string;
  materiaNombre: string;
  sedeCodigo: string;
  carreraCodigo: string;
  tipoParcial: string;
  rolExamenOrigenId: string;
  grupoOrigen: string;
  seaGroupIdOrigen?: string;
  rolExamenDestinoId?: string;
  grupoDestino?: string;
  seaGroupIdDestino?: string;
  notaSobre60?: number;
  notaSobre100?: number;
  esReprogramado?: boolean;
  modalidad?: string;
  estadoDiscrepancia: 'LISTO_PARA_TRASLADAR' | 'CONFLICTO_TIENE_NOTA_EN_DESTINO' | 'NO_ENCONTRADO_EN_SEA' | string;
  detalle?: string;
  notaExistenteDestino100?: number;
}

export interface DiscrepanciaGrupoReporte {
  totalGruposAnalizados: number;
  totalEstudiantesAnalizados: number;
  totalConDiscrepancia: number;
  totalListosParaTrasladar: number;
  totalConflictos: number;
  totalNoEncontradosEnSea: number;
  fechaAnalisis: string;
  analizadoPor: string;
  discrepancias: DiscrepanciaGrupoItem[];
}

export interface DetectarDiscrepanciasRequest {
  rolExamenIds: string[];
  sedeCodigo?: string;
  carreraCodigo?: string;
}

export interface TrasladoCalificacionItemRequest {
  codigoEstudiante: string;
  rolExamenOrigenId: string;
  rolExamenDestinoId: string;
  sobrescribirSiExiste?: boolean;
}

export interface TrasladoCalificacionesRequest {
  traslados: TrasladoCalificacionItemRequest[];
}

export interface TrasladoCalificacionItemResultado {
  codigoEstudiante: string;
  nombreEstudiante?: string;
  rolExamenOrigenId: string;
  grupoOrigen?: string;
  rolExamenDestinoId: string;
  grupoDestino?: string;
  exitoso: boolean;
  mensaje: string;
}

export interface TrasladoCalificacionesResultado {
  totalSolicitados: number;
  totalExitosos: number;
  totalFallidos: number;
  fechaEjecucion: string;
  ejecutadoPor: string;
  resultados: TrasladoCalificacionItemResultado[];
}

