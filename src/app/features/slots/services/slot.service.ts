import { Injectable, inject } from '@angular/core';
import { ProviderService } from '../../../api';
import { AvailabilitySlotDTO } from '../../../shared/models';

@Injectable({ providedIn: 'root' })
export class SlotService {
  private api = inject(ProviderService);

  getAll()                                     { return this.api.getSlots(); }
  getById(id: number)                          { return this.api.getSlotById(id); }
  create(dto: AvailabilitySlotDTO)             { return this.api.createSlot(dto); }
  update(id: number, dto: AvailabilitySlotDTO) { return this.api.updateSlot(id, dto); }
  delete(id: number)                           { return this.api.deleteSlot(id); }
}
