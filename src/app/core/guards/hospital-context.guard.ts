import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HospitalContextService } from '../services/hospital-context.service';

export const hospitalContextGuard: CanActivateFn = () => {
  const ctx    = inject(HospitalContextService);
  const router = inject(Router);

  if (ctx.selectedHospital()) return true;
  router.navigate(['/select-hospital']);
  return false;
};
