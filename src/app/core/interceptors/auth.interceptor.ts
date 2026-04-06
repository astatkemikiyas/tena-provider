import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { OAuthService } from 'angular-oauth2-oidc';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { HospitalContextService } from '../services/hospital-context.service';

function addBearer(req: import('@angular/common/http').HttpRequest<unknown>, token: string) {
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const oauthService = inject(OAuthService);
  const router       = inject(Router);
  const hospitalCtx  = inject(HospitalContextService);

  const isOurApi = req.url.startsWith(environment.apiUrl);
  const isPublic = req.url.includes('/api/public/');

  const token    = oauthService.getAccessToken();
  const outgoing = (token && isOurApi && !isPublic) ? addBearer(req, token) : req;

  return next(outgoing).pipe(
    catchError(err => {
      if (err.status === 401 && isOurApi && !isPublic) {
        // Clear tokens locally without redirecting to Keycloak's end_session endpoint.
        // A browser redirect would restart the app and lose context; instead navigate
        // to the login page within Angular so the user can sign in again seamlessly.
        hospitalCtx.clearHospital();
        oauthService.logOut(true);
        router.navigate(['/login']);
      }
      return throwError(() => err);
    }),
  );
};
