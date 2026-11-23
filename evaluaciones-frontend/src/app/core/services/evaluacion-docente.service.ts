import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  EvaluacionInstrumento,
  EvaluacionDocenteRegistro,
  EvaluacionDocenteAplicarRequest,
  EstudianteAvanceEvaluacion,
  EvaluacionEstudianteAplicarRequest,
  EvaluacionConsolidadaDocenteMateria,
  SemestreHabilitacionEstado,
  HabilitarSemestresRequest,
  DocenteRatificacionMateria,
  ModificarRatificacionRequest,
  CumplimientoEvaluacion,
  PeriodoEvaluacionDocenteEstado,
  FichaOficialMateriaDocente,
  GuardarObservacionesDirectorRequest,
  GuardarObservacionTerceroRequest,
  ObservacionTercero,
  FirmanteConfiguracion,
  ActualizarFirmanteRequest
} from '../models/evaluacion-docente.models';

@Injectable({
  providedIn: 'root'
})
export class EvaluacionDocenteService {
  private readonly _http = inject(HttpClient);
  private readonly _baseUrl = '/api/evaluacion-docente';
  private readonly _estudianteBaseUrl = '/api/evaluacion-docente-estudiante';

  public obtenerInstrumentoVigente(): Observable<EvaluacionInstrumento> {
    return this._http.get<EvaluacionInstrumento>(`${this._baseUrl}/instrumento-vigente`);
  }

  public listarInstrumentos(): Observable<EvaluacionInstrumento[]> {
    return this._http.get<EvaluacionInstrumento[]>(`${this._baseUrl}/instrumentos`);
  }

  public obtenerInstrumentoPorId(id: string): Observable<EvaluacionInstrumento> {
    return this._http.get<EvaluacionInstrumento>(`${this._baseUrl}/instrumentos/${id}`);
  }

  public guardarInstrumento(payload: any): Observable<EvaluacionInstrumento> {
    return this._http.post<EvaluacionInstrumento>(`${this._baseUrl}/instrumentos`, payload);
  }

  public ponerEnVigencia(id: string): Observable<EvaluacionInstrumento> {
    return this._http.put<EvaluacionInstrumento>(`${this._baseUrl}/instrumentos/${id}/poner-en-vigencia`, {});
  }

  public listarRegistros(gestion: string, sedeCodigo: string, carreraCodigo?: string): Observable<EvaluacionDocenteRegistro[]> {
    let params = new HttpParams()
      .set('gestion', gestion)
      .set('sedeCodigo', sedeCodigo);

    if (carreraCodigo && carreraCodigo !== 'TODAS') {
      params = params.set('carreraCodigo', carreraCodigo);
    }

    return this._http.get<EvaluacionDocenteRegistro[]>(`${this._baseUrl}/registros`, { params });
  }

  public obtenerRegistroPorId(id: string): Observable<EvaluacionDocenteRegistro> {
    return this._http.get<EvaluacionDocenteRegistro>(`${this._baseUrl}/registros/${id}`);
  }

  public aplicarEvaluacion(payload: EvaluacionDocenteAplicarRequest): Observable<EvaluacionDocenteRegistro> {
    return this._http.post<EvaluacionDocenteRegistro>(`${this._baseUrl}/aplicar`, payload);
  }

  public restablecerEvaluacion(id: string): Observable<void> {
    return this._http.delete<void>(`${this._baseUrl}/registros/${id}`);
  }

  // --- Evaluaciones de Estudiantes ---

  public consultarMateriasEstudiante(codigoEstudiante: string, gestion?: string): Observable<EstudianteAvanceEvaluacion> {
    let params = new HttpParams().set('codigoEstudiante', codigoEstudiante);
    if (gestion) params = params.set('gestion', gestion);
    return this._http.get<EstudianteAvanceEvaluacion>(`${this._estudianteBaseUrl}/materias`, { params });
  }

  public obtenerInstrumentoEstudianteVigente(): Observable<EvaluacionInstrumento> {
    return this._http.get<EvaluacionInstrumento>(`${this._estudianteBaseUrl}/instrumento-vigente`);
  }

  public aplicarEvaluacionEstudiante(payload: EvaluacionEstudianteAplicarRequest): Observable<any> {
    return this._http.post<any>(`${this._estudianteBaseUrl}/evaluar`, payload);
  }

  public listarAvanceEstudiantesPorCarrera(sedeCodigo: string, carreraCodigo: string, gestion?: string): Observable<EstudianteAvanceEvaluacion[]> {
    let params = new HttpParams()
      .set('sedeCodigo', sedeCodigo)
      .set('carreraCodigo', carreraCodigo);
    if (gestion) params = params.set('gestion', gestion);
    return this._http.get<EstudianteAvanceEvaluacion[]>(`${this._baseUrl}/avance-estudiantes`, { params });
  }

  public listarResumenConsolidado(sedeCodigo: string, carreraCodigo: string, gestion?: string): Observable<EvaluacionConsolidadaDocenteMateria[]> {
    let params = new HttpParams()
      .set('sedeCodigo', sedeCodigo)
      .set('carreraCodigo', carreraCodigo);
    if (gestion) params = params.set('gestion', gestion);
    return this._http.get<EvaluacionConsolidadaDocenteMateria[]>(`${this._baseUrl}/resumen-consolidado`, { params });
  }

  // --- Habilitación de Semestres por Director (Ventana de 90 Minutos) ---

  public listarEstadosSemestres(sedeCodigo: string, carreraCodigo: string, gestion?: string): Observable<SemestreHabilitacionEstado[]> {
    let params = new HttpParams()
      .set('sedeCodigo', sedeCodigo)
      .set('carreraCodigo', carreraCodigo);
    if (gestion) params = params.set('gestion', gestion);
    return this._http.get<SemestreHabilitacionEstado[]>(`${this._baseUrl}/semestres/estados`, { params });
  }

  public habilitarSemestres(request: HabilitarSemestresRequest): Observable<SemestreHabilitacionEstado[]> {
    return this._http.post<SemestreHabilitacionEstado[]>(`${this._baseUrl}/semestres/habilitar`, request);
  }

  public deshabilitarSemestre(sedeCodigo: string, carreraCodigo: string, semestre: number, gestion?: string): Observable<SemestreHabilitacionEstado[]> {
    let params = new HttpParams()
      .set('sedeCodigo', sedeCodigo)
      .set('carreraCodigo', carreraCodigo)
      .set('semestre', semestre.toString());
    if (gestion) params = params.set('gestion', gestion);
    return this._http.post<SemestreHabilitacionEstado[]>(`${this._baseUrl}/semestres/deshabilitar`, null, { params });
  }

  // --- Período de Evaluación y Cierre Administrativo ---

  public obtenerEstadoPeriodo(): Observable<PeriodoEvaluacionDocenteEstado> {
    return this._http.get<any>(`${this._baseUrl}/periodo/estado`).pipe(
      map(res => typeof res === 'boolean' ? { periodoEvaluacionDocenteAbierto: res, gestion: '' } : res)
    );
  }

  public conmutarPeriodo(abierto: boolean): Observable<PeriodoEvaluacionDocenteEstado> {
    const params = new HttpParams().set('abierto', abierto.toString());
    return this._http.put<any>(`${this._baseUrl}/periodo/conmutar`, null, { params }).pipe(
      map(res => typeof res === 'boolean' ? { periodoEvaluacionDocenteAbierto: res, gestion: '' } : res)
    );
  }

  // --- Reporte de Ratificación de Docentes por Materia ---

  private _normalizarRatificacion(r: any): DocenteRatificacionMateria {
    if (!r) return r;
    const notaDir = Number(r.notaDirector50 ?? r.notaDirector ?? 0);
    const notaEst = Number(r.notaEstudiantes50 ?? r.notaEstudiantes ?? 0);
    const notaFinal = Number(r.notaFinal100 ?? r.notaFinal ?? (notaDir + notaEst));
    const esManual = Boolean(r.modificadoManualmente ?? r.esModificadoManualmente ?? false);

    const estadoDef = String(r.estadoFinal || r.estadoDefinitivo || '').trim().toUpperCase();
    const estadoCalc = String(r.estadoCalculado || (notaFinal >= 71 ? 'RATIFICADO' : 'NO_RATIFICADO')).trim().toUpperCase();

    // Si fue modificado manualmente, respetamos el estado manual. Si no, calculamos estrictamente con la nota oficial (>=71)
    const estadoFinalNormalizado: 'RATIFICADO' | 'NO_RATIFICADO' = esManual && (estadoDef === 'RATIFICADO' || estadoDef === 'NO_RATIFICADO')
      ? (estadoDef as 'RATIFICADO' | 'NO_RATIFICADO')
      : (notaFinal >= 71 ? 'RATIFICADO' : 'NO_RATIFICADO');

    return {
      ...r,
      id: Number(r.id),
      gestion: r.gestion,
      sedeCodigo: r.sedeCodigo,
      sedeNombre: r.sedeNombre,
      carreraCodigo: r.carreraCodigo,
      carreraNombre: r.carreraNombre,
      materiaCodigo: r.materiaCodigo,
      materiaNombre: r.materiaNombre,
      grupoCodigo: r.grupoCodigo,
      docenteCi: r.docenteCi,
      docenteNombre: r.docenteNombre,
      notaDirector: notaDir,
      notaDirector50: Math.round(notaDir * 100) / 100,
      notaEstudiantes: notaEst,
      notaEstudiantes50: Math.round(notaEst * 100) / 100,
      notaFinal: notaFinal,
      notaFinal100: Math.round(notaFinal * 100) / 100,
      estadoCalculado: estadoCalc || (notaFinal >= 71 ? 'RATIFICADO' : 'NO_RATIFICADO'),
      estadoDefinitivo: estadoFinalNormalizado,
      estadoFinal: estadoFinalNormalizado,
      esModificadoManualmente: esManual,
      modificadoManualmente: esManual,
      motivoModificacion: r.motivoModificacion,
      modificadoPor: r.modificadoPor || r.modificadoPorUsuario || '',
      modificadoPorUsuario: r.modificadoPorUsuario || r.modificadoPor || '',
      modificadoPorNombre: r.modificadoPorNombre,
      modificadoEn: r.modificadoEn || r.fechaModificacion || '',
      fechaModificacion: r.fechaModificacion || r.modificadoEn || '',
      directorEvaluado: Boolean(r.directorEvaluado),
      totalEstudiantesEvaluaron: Number(r.totalEstudiantesEvaluaron || 0),
      totalEstudiantesMatriculados: Number(r.totalEstudiantesMatriculados || 0),
      estudiantesParticipacionPorcentaje: Number(r.estudiantesParticipacionPorcentaje || 0)
    };
  }

  public listarReporteRatificados(gestion?: string, sedeCodigo?: string, carreraCodigo?: string, estado?: string): Observable<DocenteRatificacionMateria[]> {
    let params = new HttpParams();
    if (gestion) params = params.set('gestion', gestion);
    if (sedeCodigo && sedeCodigo !== 'TODAS') params = params.set('sedeCodigo', sedeCodigo);
    if (carreraCodigo && carreraCodigo !== 'TODAS') params = params.set('carreraCodigo', carreraCodigo);
    if (estado && estado !== 'TODOS') params = params.set('estado', estado);
    return this._http.get<DocenteRatificacionMateria[]>(`${this._baseUrl}/reportes/ratificaciones`, { params }).pipe(
      map(items => Array.isArray(items) ? items.map(r => this._normalizarRatificacion(r)) : [])
    );
  }

  public modificarRatificacion(id: number, request: ModificarRatificacionRequest): Observable<DocenteRatificacionMateria> {
    return this._http.put<DocenteRatificacionMateria>(`${this._baseUrl}/reportes/ratificaciones/${id}/modificar`, request).pipe(
      map(r => this._normalizarRatificacion(r))
    );
  }

  // --- Reporte de Cumplimiento Institucional ---

  public listarCumplimiento(gestion?: string, sedeCodigo?: string, carreraCodigo?: string): Observable<CumplimientoEvaluacion[]> {
    let params = new HttpParams();
    if (gestion) params = params.set('gestion', gestion);
    if (sedeCodigo && sedeCodigo !== 'TODAS') params = params.set('sedeCodigo', sedeCodigo);
    if (carreraCodigo && carreraCodigo !== 'TODAS') params = params.set('carreraCodigo', carreraCodigo);
    return this._http.get<CumplimientoEvaluacion[]>(`${this._baseUrl}/reportes/cumplimiento`, { params });
  }

  // --- Ficha Oficial de Evaluación por Asignatura ---

  public obtenerFichaOficial(
    gestion: string,
    sedeCodigo: string,
    carreraCodigo: string,
    materiaCodigo: string,
    docenteCi?: string,
    docenteNombre?: string
  ): Observable<FichaOficialMateriaDocente> {
    let params = new HttpParams()
      .set('gestion', gestion)
      .set('sedeCodigo', sedeCodigo)
      .set('carreraCodigo', carreraCodigo)
      .set('materiaCodigo', materiaCodigo);

    if (docenteCi) params = params.set('docenteCi', docenteCi);
    if (docenteNombre) params = params.set('docenteNombre', docenteNombre);

    return this._http.get<FichaOficialMateriaDocente>(`${this._baseUrl}/ficha-oficial`, { params });
  }

  public guardarObservacionesDirector(req: GuardarObservacionesDirectorRequest): Observable<void> {
    return this._http.put<void>(`${this._baseUrl}/ficha-oficial/director`, req);
  }

  public guardarObservacionTercero(req: GuardarObservacionTerceroRequest): Observable<ObservacionTercero> {
    return this._http.post<ObservacionTercero>(`${this._baseUrl}/ficha-oficial/observacion-tercero`, req);
  }

  // --- Configuración de Firmantes y Autoridades ---

  public listarFirmantes(): Observable<FirmanteConfiguracion[]> {
    return this._http.get<FirmanteConfiguracion[]>(`${this._baseUrl}/firmantes`);
  }

  public actualizarFirmante(usuarioId: number, req: ActualizarFirmanteRequest): Observable<FirmanteConfiguracion> {
    return this._http.put<FirmanteConfiguracion>(`${this._baseUrl}/firmantes/${usuarioId}`, req);
  }
}
