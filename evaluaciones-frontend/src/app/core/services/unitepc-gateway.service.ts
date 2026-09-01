import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, tap, catchError, shareReplay, timeout } from 'rxjs/operators';
import {
  TokenResponse,
  BranchOffice,
  Career,
  Course,
  GroupItem,
  Campus,
  TimeFrame,
  GroupStudentItem
} from '../models/unitepc-gateway.models';

/**
 * Servicio de Integración Gateway UNITEPC (SEA / SISA)
 * Administra autenticación OAuth2 M2M con cache preventiva y consumo de APIs de catálogo e infraestructura.
 * @author Ariel Camara / XpertiFlow
 */
@Injectable({
  providedIn: 'root'
})
export class UnitepcGatewayService {
  private readonly _http = inject(HttpClient);

  // Endpoints propios del backend SEA Evaluaciones (proxy vía /api)
  private readonly _baseUrl = '/api/catalogo-academico';

  // Credenciales OAuth2 M2M (ahora gestionadas por el backend; se conservan para métricas de UI)
  private readonly _systemClientId = 'sea-evaluaciones';

  // Token Cache en memoria (simulado; el backend maneja el token real)
  private _cachedToken: TokenResponse | null = null;
  private _tokenExpiresAt: number = 0; // Timestamp en ms

  // Estado del Servicio SEA (Health Check con Cache Inteligente para no saturar el Gateway)
  public readonly seaStatus = signal<'online' | 'offline' | 'checking'>('checking');
  public readonly ultimoChequeo = signal<Date | null>(null);
  private _lastCheckTimestamp = 0;
  private _isChecking = false;

  /**
   * Health Check ultra ligero al Gateway SEA con caché mínima de 2 minutos (120s)
   */
  public checkSeaHealth(force = false): void {
    const now = Date.now();
    if (!force && this.seaStatus() !== 'checking' && (now - this._lastCheckTimestamp) < 120000) {
      return;
    }
    if (this._isChecking) return;

    this._isChecking = true;
    this.seaStatus.set('checking');

    this.getBranchOffices().pipe(
      timeout(3500)
    ).subscribe({
      next: (res) => {
        this.seaStatus.set(res && res.length > 0 ? 'online' : 'offline');
        this.ultimoChequeo.set(new Date());
        this._lastCheckTimestamp = Date.now();
        this._isChecking = false;
      },
      error: () => {
        this.seaStatus.set('offline');
        this.ultimoChequeo.set(new Date());
        this._lastCheckTimestamp = Date.now();
        this._isChecking = false;
      }
    });
  }

  /**
   * Obtiene el token de acceso activo. Ahora el backend gestiona el token OAuth2;
   * este método se conserva para compatibilidad con componentes que consultan estado.
   */
  public getAccessToken(): Observable<string> {
    // El frontend ya no necesita token real; el backend se encarga de la autenticación M2M.
    return of('backend-managed');
  }

  /**
   * Lista todas las Sedes institucionales
   * GET /api/catalogo-academico/sedes
   */
  public getBranchOffices(): Observable<BranchOffice[]> {
    return this._http.get<BranchOffice[]>(`${this._baseUrl}/sedes`).pipe(
      catchError(err => {
        console.error('[UnitepcGatewayService] Error al obtener Sedes:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Lista las Carreras de una Sede específica por código (ej. CBA, LPZ)
   * GET /api/catalogo-academico/carreras?branchOfficeCode={branchOfficeCode}
   */
  public getCareers(branchOfficeCode: string): Observable<Career[]> {
    const params = new HttpParams().set('branchOfficeCode', branchOfficeCode);
    return this._http.get<Career[]>(`${this._baseUrl}/carreras`, { params }).pipe(
      catchError(err => {
        console.error(`[UnitepcGatewayService] Error al obtener Carreras de sede ${branchOfficeCode}:`, err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Lista las Materias de una Carrera en una Sede específica
   * GET /api/catalogo-academico/asignaturas?branchOfficeCode={branchOfficeCode}&careerCode={careerCode}
   */
  public getCourses(branchOfficeCode: string, careerCode: string): Observable<Course[]> {
    const params = new HttpParams()
      .set('branchOfficeCode', branchOfficeCode)
      .set('careerCode', careerCode);
    return this._http.get<Course[]>(`${this._baseUrl}/asignaturas`, { params }).pipe(
      catchError(err => {
        console.error(`[UnitepcGatewayService] Error al obtener Materias (${branchOfficeCode} - ${careerCode}):`, err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Lista los Grupos, Docentes, Aulas y Horarios de una Gestión (ej. 2-2026)
   * GET /api/catalogo-academico/grupos?term={term}&branchOfficeId={uuid}&careerId={uuid}&syllabusCourseId={uuid}
   */
  public getGroups(
    term: string = '2-2026',
    branchOfficeId?: string,
    careerId?: string,
    syllabusCourseId?: string
  ): Observable<GroupItem[]> {
    let params = new HttpParams().set('term', term);
    if (branchOfficeId) params = params.set('branchOfficeId', branchOfficeId);
    if (careerId) params = params.set('careerId', careerId);
    if (syllabusCourseId) params = params.set('syllabusCourseId', syllabusCourseId);

    return this._http.get<Array<GroupItem & { teacherFullName?: string | null }>>(`${this._baseUrl}/grupos`, { params }).pipe(
      map(groups => groups.map(group => ({
        ...group,
        teacherName: group.teacherName?.trim() || group.teacherFullName?.trim() || null
      }))),
      catchError(err => {
        console.error(`[UnitepcGatewayService] Error al obtener Grupos para term ${term}:`, err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Obtiene la nómina de estudiantes matriculados en un grupo
   * GET /api/catalogo-academico/estudiantes?groupId={groupId}
   */
  public getStudentsByGroup(groupId: string): Observable<GroupStudentItem[]> {
    const params = new HttpParams().set('groupId', groupId);
    return this._http.get<GroupStudentItem[]>(`${this._baseUrl}/estudiantes`, { params }).pipe(
      catchError(err => {
        console.error(`[UnitepcGatewayService] Error al obtener Estudiantes para grupo ${groupId}:`, err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Lista los Campus físicos de la universidad
   * GET /api/catalogo-academico/campus?branchOfficeId={uuid}
   */
  public getCampuses(branchOfficeId?: string): Observable<Campus[]> {
    let params = new HttpParams();
    if (branchOfficeId) params = params.set('branchOfficeId', branchOfficeId);

    return this._http.get<Campus[]>(`${this._baseUrl}/campus`, { params }).pipe(
      catchError(err => {
        console.error('[UnitepcGatewayService] Error al obtener Campus:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Obtiene las Gestiones Institucionales
   * GET /api/catalogo-academico/gestiones
   */
  public getTimeFrames(): Observable<TimeFrame[]> {
    return this._http.get<TimeFrame[]>(`${this._baseUrl}/gestiones`).pipe(
      catchError(err => {
        console.error('[UnitepcGatewayService] Error al obtener TimeFrames:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Obtiene la Gestión Activa
   * GET /api/catalogo-academico/gestiones/activa
   */
  public getActiveTimeFrame(): Observable<TimeFrame> {
    return this._http.get<TimeFrame>(`${this._baseUrl}/gestiones/activa`).pipe(
      catchError(err => {
        console.error('[UnitepcGatewayService] Error al obtener Gestión Activa:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Información del estado actual del token y conexión
   */
  public getTokenState(): { hasToken: boolean; secondsRemaining: number; tokenType: string } {
    // El token es gestionado por el backend; se reporta siempre como vigente.
    return { hasToken: true, secondsRemaining: 7200, tokenType: 'BackendManaged' };
  }

  /**
   * Fuerza la renovación del token (ahora delegada al backend)
   */
  public clearTokenCache(): void {
    this._cachedToken = null;
    this._tokenExpiresAt = 0;
  }
}
