import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap, map, catchError, finalize, shareReplay } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';

interface TokenResponse {
  access_token:  string;
  refresh_token?: string;
  expires_in:    number;
}

export interface JwtPayload {
  sub:                 string;
  email?:              string;
  given_name?:         string;
  family_name?:        string;
  preferred_username?: string;
  realm_access?:       { roles: string[] };
  exp:                 number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly TOKEN_KEY   = 'tena_access_token';
  private readonly REFRESH_KEY = 'tena_refresh_token';

  private http   = inject(HttpClient);
  private router = inject(Router);

  private refreshInProgress$: Observable<string> | null = null;

  readonly isAuthenticated = signal(this.tokenValid());

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_KEY);
  }

  tokenValid(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  decodeToken(): JwtPayload | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return JSON.parse(atob(token.split('.')[1])) as JwtPayload;
    } catch {
      return null;
    }
  }

  login(username: string, password: string): Observable<TokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'password',
      client_id:  environment.keycloakClientId,
      username,
      password,
    });
    return this.http.post<TokenResponse>(
      `${environment.keycloakUrl}/realms/${environment.keycloakRealm}/protocol/openid-connect/token`,
      body.toString(),
      { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) },
    ).pipe(tap(res => this.storeTokens(res)));
  }

  refresh(): Observable<string> {
    if (this.refreshInProgress$) return this.refreshInProgress$;

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return throwError(() => new Error('No refresh token available'));

    const body = new URLSearchParams({
      grant_type:    'refresh_token',
      client_id:     environment.keycloakClientId,
      refresh_token: refreshToken,
    });

    this.refreshInProgress$ = this.http.post<TokenResponse>(
      `${environment.keycloakUrl}/realms/${environment.keycloakRealm}/protocol/openid-connect/token`,
      body.toString(),
      { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) },
    ).pipe(
      tap(res  => this.storeTokens(res)),
      map(res  => res.access_token),
      catchError(err => { this.logout(); return throwError(() => err); }),
      finalize(() => { this.refreshInProgress$ = null; }),
      shareReplay(1),
    );

    return this.refreshInProgress$;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_KEY);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  private storeTokens(res: TokenResponse): void {
    localStorage.setItem(this.TOKEN_KEY, res.access_token);
    if (res.refresh_token) {
      localStorage.setItem(this.REFRESH_KEY, res.refresh_token);
    }
    this.isAuthenticated.set(true);
  }
}
