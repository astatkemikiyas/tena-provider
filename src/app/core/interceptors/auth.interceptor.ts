import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { OAuthStorage, OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../../environments/environment';

function addBearer(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storage = inject(OAuthStorage);
  const oauthService = inject(OAuthService);

  // Only attach the Bearer token to requests going to our own backend API.
  // Keycloak's token endpoint and other external URLs must NOT receive it.
  const isOurApi = req.url.startsWith(environment.apiUrl);
  const isPublic = req.url.includes('/api/public/');

  const token = storage.getItem('access_token');
  // Public endpoints must never receive a Bearer token — Spring Security
  // validates any token it finds, rejecting expired ones even on permitAll() routes.
  const outgoing = (token && isOurApi && !isPublic) ? addBearer(req, token) : req;

  return next(outgoing).pipe(
    catchError(err => {
      // If we get a 401 on a protected API, log the user out since silent refresh failed
      if (err.status === 401 && isOurApi && !isPublic) {
        oauthService.logOut();
      }
      return throwError(() => err);
    }),

  );
};
