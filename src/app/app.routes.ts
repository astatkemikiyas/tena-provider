import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'slots', pathMatch: 'full' },
      { path: 'slots',        loadChildren: () => import('./features/slots/slots.routes').then(m => m.SLOTS_ROUTES) },
      { path: 'appointments', loadChildren: () => import('./features/appointments/appointments.routes').then(m => m.APPOINTMENTS_ROUTES) },
    ],
  },
];
