import { Injectable, signal, computed } from '@angular/core';
import { HospitalSummaryDTO } from '../../shared/models';

@Injectable({ providedIn: 'root' })
export class HospitalContextService {
  selectedHospital = signal<HospitalSummaryDTO | null>(null);

  readonly userRole = computed(() => this.selectedHospital()?.userRole ?? null);
  readonly isAdmin  = computed(() => this.selectedHospital()?.userRole === 'HOSPITAL_ADMIN');

  setHospital(h: HospitalSummaryDTO): void {
    this.selectedHospital.set(h);
  }

  clearHospital(): void {
    this.selectedHospital.set(null);
  }
}
