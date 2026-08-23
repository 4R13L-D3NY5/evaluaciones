import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface EstudianteInscrito {
  codigo: string;
  nombres: string;
  apellido1: string;
  apellido2: string;
  varianteAsignada?: string;
  letraVariante?: 'A' | 'B' | 'C' | 'D' | 'E';
  hashControl?: string;
}

/**
 * Servicio de Estudiantes Inscritos (Gateway SEA / Mock para CPEC18 y asignaturas)
 * @author Ariel Camara / XpertiFlow
 */
@Injectable({
  providedIn: 'root'
})
export class EstudiantesGatewayService {

  // 3 Estudiantes para CPEC18 AUDITORÍA TRIBUTARIA (Grupo TA-01)
  private readonly _estudiantesCPEC18: EstudianteInscrito[] = [
    { codigo: '7849102', nombres: 'JUAN CARLOS', apellido1: 'PÉREZ', apellido2: 'MAMANI' },
    { codigo: '8392104', nombres: 'MARÍA BELÉN', apellido1: 'QUISPE', apellido2: 'FLORES' },
    { codigo: '6928103', nombres: 'RODRIGO ALEJANDRO', apellido1: 'CONDORI', apellido2: 'RODRÍGUEZ' }
  ];

  /**
   * Obtiene la nómina de estudiantes inscritos de una materia y grupo
   */
  public getEstudiantesPorMateriaYGrupo(materiaCodigo: string, grupo: string): Observable<EstudianteInscrito[]> {
    // Si es CPEC18 o cualquier materia de prueba, entregamos la nómina
    if (materiaCodigo.toUpperCase().includes('CPEC18') || materiaCodigo.toUpperCase().includes('AUDIT')) {
      return of([...this._estudiantesCPEC18]);
    }

    // Para otras materias, generamos una nómina equivalente determinista
    const lista = this._estudiantesCPEC18.map((e, idx) => ({
      ...e,
      codigo: `${7800000 + idx * 1342}`
    }));
    return of(lista);
  }

  /**
   * Obtiene el nombre completo formateado (Nombres Apellido1 Apellido2)
   */
  public getNombreCompleto(e: EstudianteInscrito): string {
    return `${e.nombres} ${e.apellido1} ${e.apellido2}`.trim();
  }
}
