import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HospitalContextService } from '../../core/services/hospital-context.service';
import { ProviderHospitalService } from '../../api';
import { HospitalSummaryDTO } from '../../shared/models';

@Component({
  selector: 'app-hospital-select',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div class="w-full max-w-xl">

        <!-- Logo + wordmark -->
        <div class="flex items-center gap-3 mb-8">
          <img src="assets/images/logo.png" alt="TenaDigital" class="h-12 w-auto" />
          <div class="flex flex-col leading-none">
            <span class="font-extrabold text-slate-900 text-xl tracking-tight">TenaDigital</span>
            <span class="text-xs font-bold text-primary-600 tracking-widest uppercase mt-0.5">Provider Portal</span>
          </div>
        </div>

        <!-- Heading -->
        <div class="mb-7">
          <h1 class="text-2xl font-extrabold text-slate-900 tracking-tight">Select a Hospital</h1>
          <p class="text-slate-400 text-sm font-medium mt-1">Choose which hospital you want to work in today</p>
        </div>

        <!-- Loading -->
        @if (loading()) {
          <div class="space-y-3">
            @for (n of [1,2]; track n) {
              <div class="bg-white rounded-2xl border border-slate-100 p-5 animate-pulse">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0"></div>
                  <div class="flex-1 space-y-2">
                    <div class="h-4 bg-slate-100 rounded w-1/2"></div>
                    <div class="h-3 bg-slate-100 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            }
          </div>

        <!-- Empty -->
        } @else if (hospitals().length === 0) {
          <div class="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div class="h-1.5 bg-gradient-to-r from-primary-400 to-primary-600"></div>
            <div class="flex flex-col items-center py-14 px-6 gap-4 text-center">
              <div class="w-16 h-16 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                <i class="pi pi-building text-2xl text-primary-400"></i>
              </div>
              <div>
                <p class="font-bold text-slate-800">No hospitals found</p>
                <p class="text-sm text-slate-400 mt-1 max-w-xs">You are not associated with any hospitals yet. Accept an invitation or register a new hospital.</p>
              </div>
              <a routerLink="/register"
                 class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors shadow-sm">
                <i class="pi pi-plus text-xs"></i> Register a Hospital
              </a>
            </div>
          </div>

        <!-- Hospital list -->
        } @else {
          <div class="space-y-3">
            @for (h of hospitals(); track h.id) {
              <div [class]="cardClass(h)" (click)="select(h)">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                       [class]="h.status === 'APPROVED' ? 'bg-primary-50 border border-primary-100' : 'bg-slate-50 border border-slate-100'">
                    <i class="pi pi-building text-lg"
                       [class]="h.status === 'APPROVED' ? 'text-primary-600' : 'text-slate-400'"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-bold text-slate-800 truncate">{{ h.name }}</h3>
                    <p class="text-sm text-slate-400 font-medium mt-0.5">{{ h.userRole }}</p>
                  </div>
                  <div class="flex flex-col items-end gap-2 flex-shrink-0">
                    <span [class]="statusBadgeClass(h.status!)">{{ h.status }}</span>
                    @if (h.status === 'APPROVED') {
                      <i class="pi pi-chevron-right text-xs text-slate-300 group-hover:text-primary-400 transition-colors"></i>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <!-- Sign out -->
        <div class="text-center mt-8">
          <button (click)="logout()"
                  class="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors">
            <i class="pi pi-sign-out text-xs"></i> Sign out
          </button>
        </div>

      </div>
    </div>
  `,
})
export class HospitalSelectComponent implements OnInit {
  private api    = inject(ProviderHospitalService);
  private router = inject(Router);
  private auth   = inject(AuthService);
  private ctx    = inject(HospitalContextService);

  hospitals = signal<HospitalSummaryDTO[]>([]);
  loading   = signal(true);

  ngOnInit() {
    this.api.getMyHospitals().subscribe({
      next:     data => this.hospitals.set(data),
      error:    () => this.hospitals.set([]),
      complete: () => this.loading.set(false),
    });
  }

  select(h: HospitalSummaryDTO) {
    if (h.status !== 'APPROVED') return;
    this.ctx.setHospital(h);
    this.router.navigate(['/slots']);
  }

  logout() {
    this.ctx.clearHospital();
    this.auth.logout();
  }

  cardClass(h: HospitalSummaryDTO): string {
    const base = 'bg-white rounded-2xl border p-5 transition-all group ';
    return h.status === 'APPROVED'
      ? base + 'border-slate-100 shadow-sm hover:border-primary-200 hover:shadow-md cursor-pointer'
      : base + 'border-slate-100 opacity-60 cursor-not-allowed';
  }

  statusBadgeClass(status: string): string {
    const base = 'text-xs font-semibold px-2.5 py-1 rounded-full border ';
    if (status === 'APPROVED') return base + 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (status === 'PENDING')  return base + 'bg-amber-50 text-amber-700 border-amber-100';
    return base + 'bg-rose-50 text-rose-700 border-rose-100';
  }
}
