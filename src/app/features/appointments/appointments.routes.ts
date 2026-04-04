import { Routes } from '@angular/router';
export const APPOINTMENTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/appointment-list/appointment-list.component').then(m => m.AppointmentListComponent) },
];
