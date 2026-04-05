import { Injectable, inject } from '@angular/core';
import { ProviderService } from '../../../api';
import { AppointmentDTO, StatusUpdateRequest } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private api = inject(ProviderService);

  getAll()                                           { return this.api.getAppointments(); }
  getById(id: number)                                { return this.api.getAppointmentById(id); }
  create(dto: AppointmentDTO)                        { return this.api.createAppointment(dto); }
  cancel(id: number)                                 { return this.api.cancelAppointment(id); }
  updateStatus(id: number, req: StatusUpdateRequest) { return this.api.updateAppointmentStatus(id, req); }
}
