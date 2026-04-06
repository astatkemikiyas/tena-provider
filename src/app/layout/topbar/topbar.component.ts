import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs/operators';
import { HospitalContextService } from '../../core/services/hospital-context.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="flex items-center justify-between h-14 px-6 bg-white border-b border-slate-100">
      <div>
        <h1 class="text-sm font-bold text-slate-900 tracking-tight">{{ title() }}</h1>
        @if (ctx.selectedHospital()) {
          <p class="text-xs text-slate-400 font-medium mt-0.5">{{ ctx.selectedHospital()!.name }}</p>
        }
      </div>
      <div class="flex items-center gap-2">
        <button class="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
          <i class="pi pi-bell text-sm"></i>
        </button>
      </div>
    </header>
  `,
})
export class TopbarComponent {
  private router = inject(Router);
  ctx = inject(HospitalContextService);

  title = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.getTitle()),
      startWith(this.getTitle()),
    ),
    { initialValue: 'Dashboard' }
  );

  private getTitle(): string {
    const url = this.router.url;
    if (url.includes('/slots'))           return 'My Slots';
    if (url.includes('/appointments'))    return 'Appointments';
    if (url.includes('/hospital/info'))   return 'Hospital Info';
    if (url.includes('/hospital/staff'))  return 'Staff Management';
    if (url.includes('/hospital/invite')) return 'Invite Doctors';
    return 'Dashboard';
  }
}
