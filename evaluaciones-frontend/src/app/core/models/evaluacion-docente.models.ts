export interface EvaluacionCriterio {
  id: string;
  numero: string;
  enunciado: string;
  orden: number;
}

export interface EvaluacionSeccion {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  orden: number;
  criterios: EvaluacionCriterio[];
}

export interface EvaluacionInstrumento {
  id: string;
  codigo: string;
  titulo: string;
  descripcion?: string;
  estado: 'BORRADOR' | 'VIGENTE' | 'HISTORICO';
  escalaMin: number;
  escalaMax: number;
  creadoPor: string;
  creadoEn: string;
  actualizadoEn?: string;
  totalCriterios: number;
  secciones?: EvaluacionSeccion[];
}

export interface EvaluacionDocenteRespuesta {
  criterioId: string;
  numero?: string;
  seccionCodigo?: string;
  puntuacion: number;
}

export interface EvaluacionDocenteAplicarRequest {
  instrumentoId?: string;
  gestion: string;
  sedeId?: string;
  sedeCodigo: string;
  sedeNombre: string;
  carreraId?: string;
  carreraCodigo: string;
  carreraNombre: string;
  materiaCodigo: string;
  materiaNombre: string;
  grupoCodigo: string;
  docenteId?: string;
  docenteNombre: string;
  docenteIdentificacion?: string;
  evaluadorId?: string;
  evaluadorNombre?: string;
  evaluadorRol?: string;
  fechaEvaluacion: string; // YYYY-MM-DD
  horaEvaluacion?: string;
  observaciones?: string;
  respuestas: EvaluacionDocenteRespuesta[];
}

export interface EvaluacionDocenteRegistro {
  id: string;
  instrumentoId: string;
  instrumentoTitulo: string;
  gestion: string;
  sedeId?: string;
  sedeCodigo: string;
  sedeNombre: string;
  carreraId?: string;
  carreraCodigo: string;
  carreraNombre: string;
  materiaCodigo: string;
  materiaNombre: string;
  grupoCodigo: string;
  docenteId?: string;
  docenteNombre: string;
  docenteIdentificacion?: string;
  evaluadorId?: string;
  evaluadorNombre: string;
  evaluadorRol: string;
  fechaEvaluacion: string;
  horaEvaluacion?: string;
  puntajeActitudinal: number;
  puntajeProcedimental: number;
  puntajeCognitivo: number;
  puntajeTotal: number;
  puntajeMaximo: number;
  porcentaje: number;
  observaciones?: string;
  estado: string;
  creadoPor: string;
  creadoEn: string;
  respuestas?: EvaluacionDocenteRespuesta[];
}
