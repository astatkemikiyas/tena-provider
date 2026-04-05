import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ProviderHospitalService, HospitalInfoDTO, HospitalStaffDTO, HospitalSummaryDTO, HospitalUpdateRequest, RoleChangeRequest } from '../../../api';

@Injectable({ providedIn: 'root' })
export class HospitalService {
  private api = inject(ProviderHospitalService);

  getMine(): Observable<HospitalSummaryDTO[]> {
    return this.api.getMyHospitals();
  }

  getById(id: number): Observable<HospitalInfoDTO> {
    return this.api.getHospitalById(id);
  }

  update(id: number, req: HospitalUpdateRequest): Observable<HospitalInfoDTO> {
    return this.api.updateHospital(id, req);
  }

  getStaff(id: number): Observable<HospitalStaffDTO[]> {
    return this.api.getHospitalStaff(id);
  }

  approveStaff(hospitalId: number, userId: string): Observable<HospitalStaffDTO> {
    return this.api.approveStaff(hospitalId, userId);
  }

  changeRole(hospitalId: number, userId: string, role: string): Observable<HospitalStaffDTO> {
    return this.api.changeStaffRole(hospitalId, userId, { role: role as RoleChangeRequest.RoleEnum });
  }

  removeStaff(hospitalId: number, userId: string): Observable<void> {
    return this.api.removeStaff(hospitalId, userId);
  }

  invite(hospitalId: number, emails: string[]): Observable<any> {
    return this.api.inviteStaff(hospitalId, { emails });
  }

  acceptInvite(token: string): Observable<HospitalSummaryDTO> {
    return this.api.acceptInvite({ token });
  }
}
