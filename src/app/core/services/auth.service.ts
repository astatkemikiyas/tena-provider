import { Injectable, signal, inject } from '@angular/core';

import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { OAuthService } from 'angular-oauth2-oidc';

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

  private router = inject(Router);
  private oauthService = inject(OAuthService);

  // Initialized after APP_INITIALIZER has run loadDiscoveryDocumentAndTryLogin()
  readonly isAuthenticated = signal(this.oauthService.hasValidAccessToken());

  constructor() {
    // Only react to token lifecycle events — ignore discovery/JWKS/session events
    // that fire mid-flight and could temporarily return false from hasValidAccessToken().
    this.oauthService.events
      .pipe(filter(e => ['token_received', 'token_refreshed', 'token_error', 'logout', 'session_terminated', 'session_error'].includes(e.type)))
      .subscribe(() => {
        this.isAuthenticated.set(this.oauthService.hasValidAccessToken());
      });
  }

  getToken(): string | null {
    return this.oauthService.getAccessToken();
  }

  login(): void {
    this.oauthService.initCodeFlow();
  }

  logout(): void {
    this.oauthService.logOut();
    this.isAuthenticated.set(false);
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
}
