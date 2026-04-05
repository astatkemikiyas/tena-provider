import { Routes } from '@angular/router';

export const HOSPITAL_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'info',
    pathMatch: 'full',
  },
  {
    path: 'info',
    loadComponent: () => import('./pages/hospital-info/hospital-info.component').then(m => m.HospitalInfoComponent),
  },
  {
    path: 'staff',
    loadComponent: () => import('./pages/staff-list/staff-list.component').then(m => m.StaffListComponent),
  },
  {
    path: 'invite',
    loadComponent: () => import('./pages/invite/invite.component').then(m => m.InviteComponent),
  },
];
