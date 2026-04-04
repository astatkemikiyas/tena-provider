import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AppointmentDTO, StatusUpdateRequest } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/provider/appointments`;

  getAll()                                              { return this.http.get<AppointmentDTO[]>(this.base); }
  getById(id: number)                                   { return this.http.get<AppointmentDTO>(`${this.base}/${id}`); }
  create(dto: AppointmentDTO)                           { return this.http.post<AppointmentDTO>(this.base, dto); }
  cancel(id: number)                                    { return this.http.delete<void>(`${this.base}/${id}`); }
  updateStatus(id: number, req: StatusUpdateRequest)    { return this.http.patch<AppointmentDTO>(`${this.base}/${id}/status`, req); }
}
