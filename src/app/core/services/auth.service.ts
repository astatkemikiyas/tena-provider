import { Injectable, signal, inject } from '@angular/core';

import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { authConfig } from '../config/auth.config';
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

  private router = inject(Router);
  private oauthService = inject(OAuthService);

  readonly isAuthenticated = signal(false);

  constructor() {
    this.configureOauth();
  }

  private configureOauth() {
    this.oauthService.configure(authConfig);
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      this.isAuthenticated.set(this.oauthService.hasValidAccessToken());
      this.oauthService.setupAutomaticSilentRefresh();
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
