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

const DB_KEY_ROLES = 'xf_sistema_evaluaciones_roles_db';
const DB_KEY_BANCOS = 'xf_sistema_evaluaciones_bancos_preguntas_db';
const DB_KEY_CONFIG_VARIANTE_RATIO = 'xf_config_estudiantes_por_variante';

/**
 * Servicio de Persistencia para el Sistema de Evaluaciones
 * @author Ariel Camara / XpertiFlow
 */
@Injectable({
  providedIn: 'root'
})
export class EvaluacionesDbService {

  /**
   * Obtiene el parámetro institucional de Estudiantes por Variante (Default: 5)
   */
  public getEstudiantesPorVarianteParam(): number {
    try {
      const val = localStorage.getItem(DB_KEY_CONFIG_VARIANTE_RATIO);
      return val ? parseInt(val, 10) : 5;
    } catch {
      return 5;
    }
  }

  /**
   * Guarda el parámetro institucional de Estudiantes por Variante
   */
  public setEstudiantesPorVarianteParam(ratio: number): void {
    try {
      localStorage.setItem(DB_KEY_CONFIG_VARIANTE_RATIO, String(ratio));
    } catch (err) {
      console.error('Error guardando ratio de variantes:', err);
    }
  }

  /**
   * Obtiene todos los exámenes persistidos en la base de datos de Evaluaciones (con auto-seed de materia piloto)
   */
  public getRolesExamenes(branchCode?: string, careerCode?: string): RolExamenPersistedItem[] {
    try {
      const raw = localStorage.getItem(DB_KEY_ROLES);
      let list: RolExamenPersistedItem[] = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list) || list.length === 0) {
        list = this.getPilotExamSeed();
        this.saveRolesExamenes(list);
      }

      if (branchCode && careerCode) {
        return list.filter(item => 
          (!item.sedeCode || item.sedeCode === branchCode) &&
          (!item.careerCode || item.careerCode === careerCode)
        );
      }
      return list;
    } catch {
      return this.getPilotExamSeed();
    }
  }

  /**
   * Registro inicial de materia piloto: desactivado para evitar datos ficticios.
   * Los roles deben provenir del backend/gateway institucional.
   */
  public getPilotExamSeed(): RolExamenPersistedItem[] {
    return [];
  }

  /**
   * Guarda la lista completa de exámenes en la base de datos
   */
  public saveRolesExamenes(items: RolExamenPersistedItem[]): void {
    try {
      localStorage.setItem(DB_KEY_ROLES, JSON.stringify(items));
    } catch (err) {
      console.error('Error al guardar en base de datos de Evaluaciones:', err);
    }
  }

  /**
   * Inserta o actualiza un examen en la base de datos
   */
  public upsertRolExamen(item: RolExamenPersistedItem): void {
    const all = this.getAllRaw();
    const idx = all.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      all[idx] = item;
    } else {
      all.unshift(item);
    }
    this.saveRolesExamenes(all);
  }

  /**
   * Actualiza el estado de una evaluación a VALIDADO cuando el docente aprueba y encripta su banco de preguntas
   */
  public actualizarEstadoPorBancoValidado(
    codigoMateria: string, 
    parcial: string, 
    nombreArchivo: string, 
    hash: string, 
    preguntasCount: number
  ): boolean {
    const all = this.getAllRaw();
    let updated = false;

    for (const item of all) {
      const codigoMatch = item.codigo?.toUpperCase().trim() === codigoMateria?.toUpperCase().trim();
      const parcialMatch = item.tipo?.toUpperCase().trim() === parcial?.toUpperCase().trim() ||
        (parcial.includes('1') && item.tipo === '1er Parcial') ||
        (parcial.includes('2') && item.tipo === '2do Parcial') ||
        (parcial.toLowerCase().includes('final') && item.tipo === 'Final');

      if (codigoMatch && parcialMatch) {
        item.estado = 'VALIDADO';
        item.nombreArchivoExcel = nombreArchivo;
        item.hashEncriptacion = hash;
        item.fechaValidacion = new Date().toLocaleString();
        item.preguntasValidadasCount = preguntasCount;
        updated = true;
      }
    }

    if (updated) {
      this.saveRolesExamenes(all);
    }
    return updated;
  }

  /**
   * Guarda el mapeo de estudiantes con sus variantes asignadas para un examen
   */
  public guardarMapeoEstudiantesExamen(examenId: string, mapeo: MapeoEstudianteExamen[]): void {
    const all = this.getAllRaw();
    const item = all.find(i => i.id === examenId);
    if (item) {
      item.mapeoEstudiantes = mapeo;
      item.estudiantesInscritosCount = mapeo.length;
      this.saveRolesExamenes(all);
    }
  }

  /**
   * Elimina un examen por su ID
   */
  public deleteRolExamen(id: string): void {
    const all = this.getAllRaw().filter(i => i.id !== id);
    this.saveRolesExamenes(all);
  }

  /**
   * Vacía los exámenes de una carrera o todos
   */
  public clearRolesExamenes(branchCode?: string, careerCode?: string): void {
    if (branchCode && careerCode) {
      const remaining = this.getAllRaw().filter(item => 
        (item.sedeCode && item.sedeCode !== branchCode) ||
        (item.careerCode && item.careerCode !== careerCode)
      );
      this.saveRolesExamenes(remaining);
    } else {
      localStorage.removeItem(DB_KEY_ROLES);
    }
  }

  /**
   * Guarda o actualiza un banco de preguntas validado en la base de datos
   */
  public guardarBancoPreguntas(banco: BancoPreguntasPersisted): void {
    try {
      const all = this.obtenerTodosBancosPreguntas();
      const idx = all.findIndex(b => b.id === banco.id || (b.materiaCodigo === banco.materiaCodigo && b.parcial === banco.parcial && b.grupo === banco.grupo));
      if (idx >= 0) {
        all[idx] = banco;
      } else {
        all.unshift(banco);
      }
      localStorage.setItem(DB_KEY_BANCOS, JSON.stringify(all));
    } catch (err) {
      console.error('Error al guardar banco de preguntas en base de datos:', err);
    }
  }

  /**
   * Obtiene un banco de preguntas específico
   */
  public obtenerBancoPreguntas(materiaCodigo: string, parcial: string, grupo?: string): BancoPreguntasPersisted | null {
    const all = this.obtenerTodosBancosPreguntas();
    const cleanCod = materiaCodigo.replace(/[\[\]]/g, '').trim().toUpperCase();
    return all.find(b => {
      const bCod = b.materiaCodigo.replace(/[\[\]]/g, '').trim().toUpperCase();
      const matchCod = bCod === cleanCod || b.id.includes(cleanCod);
      const matchParcial = b.parcial.toLowerCase().includes(parcial.toLowerCase()) || parcial.toLowerCase().includes(b.parcial.toLowerCase());
      const matchGrupo = !grupo || b.grupo === grupo;
      return matchCod && matchParcial && matchGrupo;
    }) || null;
  }

  /**
   * Obtiene todos los bancos de preguntas persistidos
   */
  public obtenerTodosBancosPreguntas(): BancoPreguntasPersisted[] {
    try {
      const raw = localStorage.getItem(DB_KEY_BANCOS);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }

  private getAllRaw(): RolExamenPersistedItem[] {
    try {
      const raw = localStorage.getItem(DB_KEY_ROLES);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }
}
