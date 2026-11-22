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
  retroalimentacion?: string;
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
  retroalimentacion?: string;
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
  semestre?: number;
  evaluada: boolean;
  fechaEvaluacion?: string;
  habilitadaParaEvaluacion?: boolean;
  motivoBloqueo?: string;
  segundosRestantesVentana?: number;
}

export interface SemestreHabilitacionEstado {
  semestre: number;
  semestreDisplay: string;
  activo: boolean;
  habilitadoEn?: string;
  expiraEn?: string;
  segundosRestantes?: number;
  duracionMinutos?: number;
  habilitadoPor?: string;
  totalMaterias: number;
  totalDocentes: number;
}

export interface HabilitarSemestresRequest {
  sedeCodigo: string;
  carreraCodigo: string;
  gestion?: string;
  semestres: number[];
  duracionMinutos?: number;
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
  retroalimentacion?: string;
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

export interface DocenteRatificacionMateria {
  id: number;
  gestion: string;
  sedeCodigo: string;
  sedeNombre?: string;
  carreraCodigo: string;
  carreraNombre?: string;
  materiaCodigo: string;
  materiaNombre: string;
  grupoCodigo?: string;
  docenteCi?: string;
  docenteNombre: string;

  // Notas (compatibilidad dual)
  notaDirector?: number;
  notaDirector50: number;
  notaEstudiantes?: number;
  notaEstudiantes50: number;
  notaFinal?: number;
  notaFinal100: number;

  // Estados (compatibilidad dual)
  estadoCalculado: 'RATIFICADO' | 'NO_RATIFICADO' | string;
  estadoDefinitivo?: 'RATIFICADO' | 'NO_RATIFICADO' | string;
  estadoFinal: 'RATIFICADO' | 'NO_RATIFICADO';

  // Auditoría y Override (compatibilidad dual)
  esModificadoManualmente?: boolean;
  modificadoManualmente: boolean;
  motivoModificacion?: string;
  modificadoPorUsuario?: string;
  modificadoPor?: string;
  modificadoPorNombre?: string;
  fechaModificacion?: string;
  modificadoEn?: string;

  // Metadatos auxiliares
  directorEvaluado?: boolean;
  totalEstudiantesEvaluaron?: number;
  totalEstudiantesMatriculados?: number;
  estudiantesParticipacionPorcentaje?: number;
}

export interface ModificarRatificacionRequest {
  nuevoEstado: 'RATIFICADO' | 'NO_RATIFICADO';
  motivo: string;
}

export interface CumplimientoEvaluacion {
  gestion: string;
  sedeCodigo: string;
  sedeNombre: string;
  carreraCodigo: string;
  carreraNombre: string;
  materiaCodigo?: string;
  materiaNombre?: string;
  grupoCodigo?: string;
  totalMateriasAsignadas: number;
  materiasEvaluadasDirector: number;
  porcentajeCumplimientoDirector: number;
  totalEstudiantesMatriculados: number;
  totalEstudiantesEvaluaron: number;
  porcentajeCumplimientoEstudiantes: number;
}

export interface PeriodoEvaluacionDocenteEstado {
  periodoEvaluacionDocenteAbierto: boolean;
  gestion: string;
}

export interface AreaPuntajeEstudiante {
  areaCodigo: string;
  areaNombre: string;
  puntajePromedio: number;
  puntajeMaximo: number;
  porcentaje: number;
}

export interface ObservacionTercero {
  id: number;
  usuarioId: number;
  usuarioNombre: string;
  usuarioRol: string;
  tituloFirma: string;
  observacion: string;
  fechaRegistro?: string;
  fechaActualizacion?: string;
}

export interface FirmanteOficial {
  usuarioId: number;
  usuario: string;
  nombreCompleto: string;
  rol: string;
  tituloFirma: string;
  ordenFirma: number;
  puedeObservar: boolean;
  puedeRatificar: boolean;
  esSoloVisual: boolean;
}

export interface FichaOficialMateriaDocente {
  gestion: string;
  sedeCodigo: string;
  sedeNombre: string;
  carreraCodigo: string;
  carreraNombre: string;
  materiaCodigo: string;
  materiaNombre: string;
  grupoCodigo: string;
  docenteCi: string;
  docenteNombre: string;

  // Director (50 Pts)
  directorEvaluado: boolean;
  directorRegistroId?: string;
  directorEvaluadorNombre?: string;
  directorEvaluadorRol?: string;
  directorFechaEvaluacion?: string;
  directorHoraEvaluacion?: string;
  directorInstrumentoTitulo?: string;
  directorPuntajeActitudinal: number;
  directorPuntajeProcedimental: number;
  directorPuntajeCognitivo: number;
  directorPuntajeTotal: number;
  directorPuntos50: number;
  directorObservaciones?: string;
  directorRetroalimentacion?: string;
  directorRespuestas?: EvaluacionDocenteRespuesta[];

  // Estudiantes (50 Pts)
  totalEstudiantesMatriculados: number;
  totalEstudiantesEvaluaron: number;
  estudiantesParticipacionPorcentaje: number;
  estudiantesPromedioPorcentaje: number;
  estudiantesPuntos50: number;
  estudiantesPuntajePorAreas: AreaPuntajeEstudiante[];

  // Consolidado Institucional (100 Pts)
  puntajeFinal100: number;
  estadoRatificacion: 'RATIFICADO' | 'NO_RATIFICADO';
  ratificacionModificadaManualmente: boolean;
  ratificacionModificadoPor?: string;
  ratificacionMotivo?: string;

  // Observaciones de Terceros
  observacionesTerceros: ObservacionTercero[];

  // Firmantes Oficiales
  firmantesOficiales: FirmanteOficial[];
}

export interface GuardarObservacionesDirectorRequest {
  registroId: string;
  observaciones?: string;
  retroalimentacion?: string;
}

export interface GuardarObservacionTerceroRequest {
  gestion: string;
  sedeCodigo: string;
  carreraCodigo: string;
  materiaCodigo: string;
  materiaNombre?: string;
  grupoCodigo?: string;
  docenteCi: string;
  docenteNombre?: string;
  observacion: string;
}

export interface FirmanteConfiguracion {
  usuarioId: number;
  usuario: string;
  nombreCompleto: string;
  correo?: string;
  rolCodigo: string;
  rolNombre: string;
  activo: boolean;
  puedeObservar: boolean;
  puedeModificarRatificacion: boolean;
  tituloFirma: string;
  ordenFirma: number;
  esSoloVisual: boolean;
}

export interface ActualizarFirmanteRequest {
  puedeObservar: boolean;
  puedeModificarRatificacion: boolean;
  tituloFirma: string;
  ordenFirma: number;
}
