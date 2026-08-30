import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UnitepcGatewayService } from './unitepc-gateway.service';
import { GroupStudentItem } from '../models/unitepc-gateway.models';

export interface EstudianteInscrito {
  codigo: string;
  nombres: string;
  apellido1: string;
  apellido2: string;
  courseState?: string;
  varianteAsignada?: string;
  letraVariante?: 'A' | 'B' | 'C' | 'D' | 'E';
  hashControl?: string;
}

/**
 * Servicio de Estudiantes Inscritos (Gateway SEA / Integración Endpoint byGroup)
 * @author Ariel Camara / XpertiFlow
 */
@Injectable({
  providedIn: 'root'
})
export class EstudiantesGatewayService {
  private readonly _gateway = inject(UnitepcGatewayService);

  /**
   * Obtiene la nómina de estudiantes matriculados en vivo desde el Gateway por groupId
  * GET /students/byGroup?groupId={groupId}
  */
  public getEstudiantesPorGrupo(groupId: string): Observable<EstudianteInscrito[]> {
    if (!groupId) return of([]);

    return this._gateway.getStudentsByGroup(groupId).pipe(
      map(items => {
        // Para un grupo real la nómina de SEA es la única fuente válida.
        // No completar con estudiantes piloto: eso desincroniza la Lista de
        // Evaluaciones respecto al catálogo oficial de Servicios SEA.
        return (items || []).map(item => this._mapGatewayStudentToInscrito(item));
      }),
      catchError(err => {
        console.warn(`[EstudiantesGatewayService] No se pudo consultar SEA para grupo ${groupId}:`, err);
        return of([]);
      })
    );
  }

  /**
   * Obtiene la nómina de estudiantes inscritos de una materia y grupo
   */
  public getEstudiantesPorMateriaYGrupo(materiaCodigo: string, grupo: string, groupId?: string): Observable<EstudianteInscrito[]> {
    return this.getEstudiantesPorGrupo(groupId || '');
  }

  /**
   * Mapea un estudiante del Gateway a la estructura EstudianteInscrito
   */
  private _mapGatewayStudentToInscrito(item: GroupStudentItem): EstudianteInscrito {
    // Parser inteligente de nombres y apellidos a partir de fullName (ej. "VILLCA CONDE EDSON ROLANDO")
    const parts = (item.fullName || '').trim().split(/\s+/);
    let apellido1 = '';
    let apellido2 = '';
    let nombres = '';

    if (parts.length >= 4) {
      apellido1 = parts[0];
      apellido2 = parts[1];
      nombres = parts.slice(2).join(' ');
    } else if (parts.length === 3) {
      apellido1 = parts[0];
      apellido2 = parts[1];
      nombres = parts[2];
    } else if (parts.length === 2) {
      apellido1 = parts[0];
      nombres = parts[1];
    } else {
      nombres = item.fullName || 'ESTUDIANTE';
    }

    return {
      codigo: item.studentCode,
      nombres: nombres.toUpperCase(),
      apellido1: apellido1.toUpperCase(),
      apellido2: apellido2.toUpperCase(),
      courseState: item.courseState || 'CURSANDO'
    };
  }

  /**
   * Obtiene el nombre completo formateado (Nombres Apellido1 Apellido2)
   */
  public getNombreCompleto(e: EstudianteInscrito): string {
    return `${e.nombres} ${e.apellido1} ${e.apellido2}`.trim();
  }
}
