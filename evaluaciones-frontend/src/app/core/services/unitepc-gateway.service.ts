import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, switchMap, tap, catchError, shareReplay } from 'rxjs/operators';
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

  // Configuración de Endpoints (vía Proxy dev para eliminar restricciones CORS)
  private readonly _authUrl = '/gw-unitepc/auth/token';
  private readonly _universityBaseUrl = '/gw-unitepc/api/v1/university/externals/research';
  private readonly _studentBaseUrl = '/gw-unitepc/api/v1/student/externals/research';

  // Credenciales OAuth2 M2M
  private readonly _clientId = 'dev-syseng-research';
  private readonly _clientSecret = '1XqjSsWL01xegB12z3mGKpF6eeFQLsZd';
  private readonly _systemClientId = 'sea-evaluaciones';

  // Token Cache en memoria
  private _cachedToken: TokenResponse | null = null;
  private _tokenExpiresAt: number = 0; // Timestamp en ms

  /**
   * Obtiene el token de acceso activo, renovándolo automáticamente si expiró o está próximo a expirar.
   */
  public getAccessToken(): Observable<string> {
    const now = Date.now();
    // Renovar con margen de seguridad de 60 segundos antes de expirar
    if (this._cachedToken && now < (this._tokenExpiresAt - 60000)) {
      return of(this._cachedToken.access_token);
    }

    const body = new HttpParams()
      .set('grant_type', 'client_credentials')
      .set('client_id', this._clientId)
      .set('client_secret', this._clientSecret);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this._http.post<TokenResponse>(this._authUrl, body.toString(), { headers }).pipe(
      tap(tokenRes => {
        this._cachedToken = tokenRes;
        // tokenRes.expires_in viene en segundos (ej. 7200)
        this._tokenExpiresAt = Date.now() + (tokenRes.expires_in * 1000);
      }),
      map(tokenRes => tokenRes.access_token),
      catchError(err => {
        console.error('[UnitepcGatewayService] Error al obtener token OAuth2:', err);
        return throwError(() => err);
      }),
      shareReplay(1)
    );
  }

  /**
   * Genera las cabeceras requeridas por el Gateway
   */
  private _buildHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'clientId': this._systemClientId
    });
  }

  /**
   * Lista todas las Sedes institucionales
   * GET /branchOffices
   */
  public getBranchOffices(): Observable<BranchOffice[]> {
    return this.getAccessToken().pipe(
      switchMap(token => {
        const headers = this._buildHeaders(token);
        return this._http.get<BranchOffice[]>(`${this._universityBaseUrl}/branchOffices`, { headers });
      }),
      catchError(err => {
        console.error('[UnitepcGatewayService] Error al obtener Sedes:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Lista las Carreras de una Sede específica por código (ej. CBA, LPZ)
   * GET /careers?branchOfficeCode={branchOfficeCode}
   */
  public getCareers(branchOfficeCode: string): Observable<Career[]> {
    return this.getAccessToken().pipe(
      switchMap(token => {
        const headers = this._buildHeaders(token);
        const params = new HttpParams().set('branchOfficeCode', branchOfficeCode);
        return this._http.get<Career[]>(`${this._universityBaseUrl}/careers`, { headers, params });
      }),
      catchError(err => {
        console.error(`[UnitepcGatewayService] Error al obtener Carreras de sede ${branchOfficeCode}:`, err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Lista las Materias de una Carrera en una Sede específica
   * GET /courses?branchOfficeCode={branchOfficeCode}&careerCode={careerCode}
   */
  public getCourses(branchOfficeCode: string, careerCode: string): Observable<Course[]> {
    return this.getAccessToken().pipe(
      switchMap(token => {
        const headers = this._buildHeaders(token);
        const params = new HttpParams()
          .set('branchOfficeCode', branchOfficeCode)
          .set('careerCode', careerCode);
        return this._http.get<Course[]>(`${this._universityBaseUrl}/courses`, { headers, params });
      }),
      catchError(err => {
        console.error(`[UnitepcGatewayService] Error al obtener Materias (${branchOfficeCode} - ${careerCode}):`, err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Lista los Grupos, Docentes, Aulas y Horarios de una Gestión (ej. 2-2026)
   * GET /groups?term={term}&branchOfficeId={uuid}&careerId={uuid}&syllabusCourseId={uuid}
   */
  public getGroups(
    term: string = '2-2026', 
    branchOfficeId?: string, 
    careerId?: string, 
    syllabusCourseId?: string
  ): Observable<GroupItem[]> {
    return this.getAccessToken().pipe(
      switchMap(token => {
        const headers = this._buildHeaders(token);
        let params = new HttpParams().set('term', term);
        if (branchOfficeId) params = params.set('branchOfficeId', branchOfficeId);
        if (careerId) params = params.set('careerId', careerId);
        if (syllabusCourseId) params = params.set('syllabusCourseId', syllabusCourseId);

        return this._http.get<GroupItem[]>(`${this._studentBaseUrl}/groups`, { headers, params });
      }),
      catchError(err => {
        console.error(`[UnitepcGatewayService] Error al obtener Grupos para term ${term}:`, err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Obtiene la nómina de estudiantes matriculados en un grupo
   * GET /students/byGroup?groupId={groupId}
   */
  public getStudentsByGroup(groupId: string): Observable<GroupStudentItem[]> {
    return this.getAccessToken().pipe(
      switchMap(token => {
        const headers = this._buildHeaders(token);
        const params = new HttpParams().set('groupId', groupId);
        return this._http.get<GroupStudentItem[]>(`${this._studentBaseUrl}/students/byGroup`, { headers, params });
      }),
      catchError(err => {
        console.error(`[UnitepcGatewayService] Error al obtener Estudiantes para grupo ${groupId}:`, err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Lista los Campus físicos de la universidad
   * GET /campuses?branchOfficeId={uuid}
   */
  public getCampuses(branchOfficeId?: string): Observable<Campus[]> {
    return this.getAccessToken().pipe(
      switchMap(token => {
        const headers = this._buildHeaders(token);
        let params = new HttpParams();
        if (branchOfficeId) params = params.set('branchOfficeId', branchOfficeId);

        return this._http.get<Campus[]>(`${this._studentBaseUrl}/campuses`, { headers, params });
      }),
      catchError(err => {
        console.error('[UnitepcGatewayService] Error al obtener Campus:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Obtiene las Gestiones Institucionales
   * GET /timeFrames
   */
  public getTimeFrames(): Observable<TimeFrame[]> {
    return this.getAccessToken().pipe(
      switchMap(token => {
        const headers = this._buildHeaders(token);
        return this._http.get<TimeFrame[]>(`${this._universityBaseUrl}/timeFrames`, { headers });
      }),
      catchError(err => {
        console.error('[UnitepcGatewayService] Error al obtener TimeFrames:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Obtiene la Gestión Activa
   * GET /timeFrames/active
   */
  public getActiveTimeFrame(): Observable<TimeFrame> {
    return this.getAccessToken().pipe(
      switchMap(token => {
        const headers = this._buildHeaders(token);
        return this._http.get<TimeFrame>(`${this._universityBaseUrl}/timeFrames/active`, { headers });
      }),
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
    if (!this._cachedToken || Date.now() >= this._tokenExpiresAt) {
      return { hasToken: false, secondsRemaining: 0, tokenType: 'None' };
    }
    const remainingMs = this._tokenExpiresAt - Date.now();
    return {
      hasToken: true,
      secondsRemaining: Math.floor(remainingMs / 1000),
      tokenType: this._cachedToken.token_type
    };
  }

  /**
   * Fuerza la renovación del token
   */
  public clearTokenCache(): void {
    this._cachedToken = null;
    this._tokenExpiresAt = 0;
  }
}
