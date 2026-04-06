import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { hospitalContextGuard } from './core/guards/hospital-context.guard';

export const routes: Routes = [
  // Auth / public routes (no layout wrapper)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: 'register/hospital',
    loadComponent: () => import('./features/auth/register-hospital/register-hospital.component').then(m => m.RegisterHospitalComponent),
  },
  {
    path: 'register/doctor',
    loadComponent: () => import('./features/auth/register-doctor/register-doctor.component').then(m => m.RegisterDoctorComponent),
  },
  {
    path: 'invite/accept/:token',
    loadComponent: () => import('./features/auth/invite-accept/invite-accept.component').then(m => m.InviteAcceptComponent),
  },
  {
    path: 'select-hospital',
    canActivate: [authGuard],
    loadComponent: () => import('./features/hospital-select/hospital-select.component').then(m => m.HospitalSelectComponent),
  },
  // Main layout — requires auth + hospital context
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard, hospitalContextGuard],
    children: [
      { path: '', redirectTo: 'slots', pathMatch: 'full' },
      {
        path: 'slots',
        loadChildren: () => import('./features/slots/slots.routes').then(m => m.SLOTS_ROUTES),
      },
      {
        path: 'appointments',
        loadChildren: () => import('./features/appointments/appointments.routes').then(m => m.APPOINTMENTS_ROUTES),
      },
      {
        path: 'hospital',
        loadChildren: () => import('./features/hospital/hospital.routes').then(m => m.HOSPITAL_ROUTES),
      },
    ],
  },
  // Keycloak redirect URI lands here — APP_INITIALIZER already handled the code exchange
  { path: 'callback', redirectTo: '/', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
