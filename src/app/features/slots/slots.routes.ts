import { Routes } from '@angular/router';
export const SLOTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/slot-list/slot-list.component').then(m => m.SlotListComponent) },
];
