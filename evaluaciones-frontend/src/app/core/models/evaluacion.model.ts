/**
 * Modelos de Dominio del Sistema de Evaluaciones SEA
 * @author UNITEPC SISA
 */

export interface Sede {
  id: number;
  nombre: string;
  codigo: string;
  campus: string;
}

export interface Carrera {
  id: number;
  nombre: string;
  codigo: string;
  sedeId: number;
  facultad: string;
}

export interface Asignatura {
  id: number;
  codigo: string;
  nombre: string;
  semestre: number;
  carreraId: number;
  planEstudios: string;
  conCartilla: boolean;
}

export interface Docente {
  id: number;
  ci: string;
  nombreCompleto: string;
  email: string;
  sedeId: number;
}

export type EstadoExamen = 
  | 'PROGRAMADO'
  | 'PENDIENTE_BANCO'
  | 'BANCO_DISPONIBLE'
  | 'GENERANDO'
  | 'GENERADO'
  | 'MANUAL_GENERADO'
  | 'EN_CURSO'
  | 'FINALIZADO'
  | 'OBSERVADO';

export interface ConflictoRol {
  semana?: string;
  horario?: string;
  colisionSemestre?: string;
}

export interface RolExamen {
  id: number;
  gestion: string;
  sedeId: number;
  sedeNombre: string;
  campusNombre: string;
  carreraId: number;
  carreraNombre: string;
  asignaturaId: number;
  materiaCodigo: string;
  materiaNombre: string;
  grupo: string;
  grupoTeorico: string;
  docenteId?: number;
  docenteNombre?: string;
  semestre: number;
  semana: number;
  fecha: string; // YYYY-MM-DD
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  tipoExamen: '1er Parcial' | '2do Parcial' | 'Examen Final' | '2da Instancia';
  estado: EstadoExamen;
  totalBanco: number;
  bancoRequerido: number;
  conCartilla: boolean;
  aulaNombre?: string;
  bloqueNombre?: string;
  conflictos?: ConflictoRol;
  variantesGeneradas?: string[];
  paqueteZipUrl?: string;
  patronDisponibleHora?: string;
}

export interface DistribucionDificultad {
  facil: number;
  medio: number;
  dificil: number;
}

export interface EvaluacionConfiguracion {
  id?: number;
  nivel: 'nacional' | 'sede' | 'carrera';
  sedeId?: number | null;
  carreraId?: number | null;
  duracionMinutosDefecto: number;
  toleranciaIngresoMinutos: number;
  mezclarPreguntas: boolean;
  mezclarOpciones: boolean;
  preguntasTotal: number;
  distribucionDificultad: DistribucionDificultad;
  bancoMinimoRequerido: number;
  permiteCartillaVirtual: boolean;
  publicacionPatronDemoraHoras: number;
  bloqueoEdicionHoras: number;
}

export interface PreguntaBanco {
  id: number;
  asignaturaId: number;
  docenteId: number;
  parcial: string;
  grupoTeorico: string;
  tipo: 'FALSO_VERDADERO' | 'SELECCION_SIMPLE' | 'RESPUESTA_COMPUESTA' | 'PREGUNTA_CON_CLAVE' | 'EMPAREJAMIENTO' | 'CASO_CLINICO';
  enunciado: string;
  opciones: string[];
  respuestaCorrecta: string;
  dificultad: 'FACIL' | 'MEDIO' | 'DIFICIL';
  tieneImagen?: boolean;
}

export interface EvaluacionesKpi {
  totalProgramados: number;
  totalHoy: number;
  totalGenerados: number;
  pendientesBanco: number;
  porcentajeCobertura: number;
  bancosListos: number;
}
