import { Injectable, signal, computed, inject } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { HospitalSummaryDTO } from '../../shared/models';

const STORAGE_KEY = 'tena_hospital_ctx';

interface StoredCtx { userId: string; hospital: HospitalSummaryDTO; }

@Injectable({ providedIn: 'root' })
export class HospitalContextService {
  private oauth = inject(OAuthService);

  selectedHospital = signal<HospitalSummaryDTO | null>(null);

  readonly userRole    = computed(() => this.selectedHospital()?.userRole ?? null);
  readonly isAdmin     = computed(() => this.selectedHospital()?.userRole === 'HOSPITAL_ADMIN');
  /** True for SCHEDULER and HOSPITAL_ADMIN — both manage other doctors' schedules */
  readonly isScheduler = computed(() =>
    this.selectedHospital()?.userRole === 'SCHEDULER' ||
    this.selectedHospital()?.userRole === 'HOSPITAL_ADMIN'
  );

  constructor() { this.restore(); }

  setHospital(h: HospitalSummaryDTO): void {
    this.selectedHospital.set(h);
    const userId = this.currentUserId();
    if (userId) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ userId, hospital: h })); } catch { /* quota */ }
    }
  }

  clearHospital(): void {
    this.selectedHospital.set(null);
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
  }

  private currentUserId(): string | null {
    const token = this.oauth.getAccessToken();
    if (!token) return null;
    try { return (JSON.parse(atob(token.split('.')[1])) as { sub?: string }).sub ?? null; } catch { return null; }
  }

  private restore(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const stored = JSON.parse(raw) as StoredCtx;
      const currentUserId = this.currentUserId();
      if (currentUserId && stored.userId === currentUserId) {
        this.selectedHospital.set(stored.hospital);
      }
    } catch { /* corrupt storage — ignore */ }
  }
}
