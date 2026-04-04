import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AvailabilitySlotDTO } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class SlotService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/provider/slots`;

  getAll()                                         { return this.http.get<AvailabilitySlotDTO[]>(this.base); }
  getById(id: number)                              { return this.http.get<AvailabilitySlotDTO>(`${this.base}/${id}`); }
  create(dto: AvailabilitySlotDTO)                 { return this.http.post<AvailabilitySlotDTO>(this.base, dto); }
  update(id: number, dto: AvailabilitySlotDTO)     { return this.http.put<AvailabilitySlotDTO>(`${this.base}/${id}`, dto); }
  delete(id: number)                               { return this.http.delete<void>(`${this.base}/${id}`); }
}
