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
  destinatario?: 'DIRECTOR' | 'ESTUDIANTE';
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

export interface MateriaEstudiante {
  materiaCodigo: string;
  materiaNombre: string;
  grupoCodigo: string;
  docenteId?: string;
  docenteNombre: string;
  sedeCodigo?: string;
  carreraCodigo?: string;
  evaluada: boolean;
  fechaEvaluacion?: string;
}

export interface EstudianteAvanceEvaluacion {
  estudianteCodigo: string;
  estudianteNombre: string;
  sedeCodigo?: string;
  carreraCodigo?: string;
  carreraNombre?: string;
  gestion?: string;
  totalMaterias: number;
  materiasEvaluadas: number;
  porcentajeAvance: number;
  materias: MateriaEstudiante[];
}

export interface EvaluacionEstudianteAplicarRequest {
  estudianteCodigo: string;
  estudianteNombre?: string;
  materiaCodigo: string;
  materiaNombre: string;
  grupoCodigo: string;
  docenteId?: string;
  docenteNombre: string;
  gestion: string;
  sedeCodigo?: string;
  carreraCodigo?: string;
  instrumentoId?: string;
  observaciones?: string;
  respuestas: Record<string, number>;
}


export interface EvaluacionConsolidadaDocenteMateria {
  materiaCodigo: string;
  materiaNombre: string;
  grupoCodigo: string;
  docenteNombre: string;
  docenteCi?: string;
  gestion: string;
  sedeCodigo: string;
  carreraCodigo: string;

  // Director (50 Pts)
  directorEvaluado: boolean;
  directorPuntaje100?: number;
  directorPuntos50: number;
  directorFechaEvaluacion?: string;
  directorObservaciones?: string;

  // Estudiantes (50 Pts)
  totalEstudiantesMatriculados: number;
  totalEstudiantesEvaluaron: number;
  estudiantesParticipacionPorcentaje: number;
  estudiantesPromedioPorcentaje: number;
  estudiantesPuntos50: number;

  // Consolidado (100 Pts)
  puntajeFinal100: number;
  estadoFinal: string;
}
