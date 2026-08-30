import { Injectable } from '@angular/core';

export interface MapeoEstudianteExamen {
  codigoEstudiante: string;
  nombres: string;
  apellido1: string;
  apellido2: string;
  variante: string;
  letraVariante: 'A' | 'B' | 'C' | 'D' | 'E';
  hashSeguridad: string;
  materiaCodigo: string;
  grupo: string;
  parcial: string;
}

export type ModalidadExamen = 'PRESENCIAL_CARTILLA' | 'PRESENCIAL_SIN_CARTILLA' | 'VIRTUAL';

export interface RolExamenPersistedItem {
  id: string;
  seaGroupId: string;
  seaSyllabusCourseId: string;
  sedeCode?: string;
  careerCode?: string;
  codigo: string;
  materia: string;
  semestre: number;
  grupo: string;
  tipoClase: string;
  docenteNombre: string;
  docenteCI: string;
  tipo: '1er Parcial' | '2do Parcial' | 'Final' | '2da Instancia';
  estado: 'PROGRAMADO' | 'VALIDADO' | 'GENERADO' | 'IMPRESO' | 'ENTREGADO' | 'DEVUELTO' | 'REVISADO' | 'SUBIDO' | 'RECIBIDO' | 'SUSPENDIDO' | 'PENDIENTE_FECHA';
  conCartilla: boolean;
  modalidad?: ModalidadExamen;
  semana: number;
  dia: string;
  fecha: string;
  fechaDisplay: string;
  horario: string;
  aula: string;
  campus: string;
  nombreArchivoExcel?: string;
  hashEncriptacion?: string;
  fechaValidacion?: string;
  preguntasValidadasCount?: number;
  estudiantesInscritosCount?: number;
  estudiantesPorVarianteParam?: number;
  mapeoEstudiantes?: MapeoEstudianteExamen[];
}

export interface BancoPreguntasPersisted {
  id: string;
  sede: string;
  carrera: string;
  materiaCodigo: string;
  materiaNombre: string;
  grupo: string;
  parcial: string;
  totalPreguntas: number;
  preguntas: any[];
  fechaValidacion: string;
  estado: 'VALIDADO' | 'BORRADOR';
}

/**
 * Compatibilidad temporal para consumidores antiguos.
 * La persistencia oficial reside en el backend; este servicio no usa
 * localStorage ni crea datos de prueba.
 */
@Injectable({
  providedIn: 'root'
})
export class EvaluacionesDbService {
  public getEstudiantesPorVarianteParam(): number {
    return 1;
  }

  public setEstudiantesPorVarianteParam(_ratio: number): void {
    // La configuración oficial debe persistirse en el backend.
  }

  public getRolesExamenes(_branchCode?: string, _careerCode?: string): RolExamenPersistedItem[] {
    return [];
  }

  public saveRolesExamenes(_items: RolExamenPersistedItem[]): void {
    // Sin persistencia local.
  }

  public upsertRolExamen(_item: RolExamenPersistedItem): void {
    // Sin persistencia local; el estado oficial lo gestiona el backend.
  }

  public actualizarEstadoPorBancoValidado(
    _codigoMateria: string,
    _parcial: string,
    _nombreArchivo: string,
    _hash: string,
    _preguntasCount: number
  ): boolean {
    return false;
  }

  public guardarMapeoEstudiantesExamen(_examenId: string, _mapeo: MapeoEstudianteExamen[]): void {
    // Sin persistencia local.
  }

  public deleteRolExamen(_id: string): void {
    // Sin persistencia local.
  }

  public clearRolesExamenes(_branchCode?: string, _careerCode?: string): void {
    // Sin persistencia local.
  }

  public guardarBancoPreguntas(_banco: BancoPreguntasPersisted): void {
    // Sin persistencia local.
  }

  public obtenerBancoPreguntas(_materiaCodigo: string, _parcial: string, _grupo?: string): BancoPreguntasPersisted | null {
    return null;
  }

  public obtenerTodosBancosPreguntas(): BancoPreguntasPersisted[] {
    return [];
  }
}
