import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HospitalContextService } from '../../core/services/hospital-context.service';
import { ProviderHospitalService } from '../../api';
import { HospitalSummaryDTO } from '../../shared/models';

@Component({
  selector: 'app-hospital-select',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div class="w-full max-w-2xl">
        <div class="text-center mb-8">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg mx-auto mb-3">
            <i class="pi pi-building text-white text-2xl"></i>
          </div>
          <h1 class="text-2xl font-bold text-slate-800">Select a Hospital</h1>
          <p class="text-slate-500 text-sm mt-1">Choose which hospital you want to work in</p>
        </div>

        @if (loading()) {
          <div class="text-center py-12"><i class="pi pi-spin pi-spinner text-teal-600 text-3xl"></i></div>
        } @else if (hospitals().length === 0) {
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-10 text-center">
            <i class="pi pi-inbox text-slate-300 text-4xl mb-3"></i>
            <p class="text-slate-500">You are not associated with any hospitals yet.</p>
            <p class="text-slate-400 text-sm mt-1">Accept an invitation or register a hospital to get started.</p>
          </div>
        } @else {
          <div class="grid gap-4">
            @for (h of hospitals(); track h.id) {
              <div [class]="cardClass(h)" (click)="select(h)">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                       [class]="h.status === 'APPROVED' ? 'bg-teal-50' : 'bg-slate-50'">
                    <i class="pi pi-building text-xl"
                       [class]="h.status === 'APPROVED' ? 'text-teal-600' : 'text-slate-400'"></i>
                  </div>
                  <div class="flex-1">
                    <h3 class="font-semibold text-slate-800">{{ h.name }}</h3>
                    <p class="text-sm text-slate-500 mt-0.5">Role: {{ h.userRole }}</p>
                  </div>
                  <div class="flex flex-col items-end gap-1">
                    <span [class]="statusBadgeClass(h.status!)">{{ h.status }}</span>
                    @if (h.status === 'APPROVED') {
                      <i class="pi pi-chevron-right text-slate-400 text-sm"></i>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }

        <div class="text-center mt-6">
          <button class="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                  (click)="logout()">
            <i class="pi pi-sign-out mr-1"></i>Sign out
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
      next: data => this.hospitals.set(data),
      error: () => this.hospitals.set([]),
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
    const base = 'bg-white rounded-2xl shadow-sm border p-5 transition-all ';
    return h.status === 'APPROVED'
      ? base + 'border-slate-200 hover:border-teal-300 hover:shadow-md cursor-pointer'
      : base + 'border-slate-200 opacity-60 cursor-not-allowed';
  }

  statusBadgeClass(status: string): string {
    const base = 'text-xs font-medium px-2 py-0.5 rounded-full ';
    if (status === 'APPROVED') return base + 'bg-teal-50 text-teal-700';
    if (status === 'PENDING')  return base + 'bg-amber-50 text-amber-700';
    return base + 'bg-rose-50 text-rose-700';
  }
}
