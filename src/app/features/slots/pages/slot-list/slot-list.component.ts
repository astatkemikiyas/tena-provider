import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SlotService } from '../../services/slot.service';
import { AvailabilitySlotDTO } from '../../../../shared/models';

@Component({
  selector: 'app-slot-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
            DatePickerModule, ToastModule, ConfirmDialogModule, TooltipModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">My Slots</h2>
          <p class="text-sm text-slate-500">{{ slots().length }} availability slots</p>
        </div>
        <p-button label="New Slot" icon="pi pi-plus" (onClick)="openForm()" />
      </div>
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <p-table [value]="slots()" [loading]="loading()" [rowHover]="true"
                 [paginator]="true" [rows]="15" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Hospital</th>
              <th class="w-28">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-s>
            <tr>
              <td class="text-sm font-medium text-slate-800">{{ s.startTime | date:'MMM d, y HH:mm' }}</td>
              <td class="text-sm text-slate-600">{{ s.endTime | date:'HH:mm' }}</td>
              <td class="text-sm text-slate-500">{{ s.hospitalId || '—' }}</td>
              <td>
                <div class="flex gap-1">
                  <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small" (onClick)="openForm(s)" />
                  <p-button icon="pi pi-trash" [text]="true" [rounded]="true" size="small"
                            severity="danger" (onClick)="confirmDelete(s)" />
                </div>
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="4" class="text-center py-12 text-slate-400">No slots yet — create your first one</td></tr>
          </ng-template>
        </p-table>
      </div>
    </div>

    <p-dialog [(visible)]="showForm" [header]="selected() ? 'Edit Slot' : 'New Slot'"
              [modal]="true" [style]="{width:'420px'}">
      <div class="space-y-4 py-2">
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-slate-700">Start Time</label>
          <p-datepicker [(ngModel)]="form.startTime" [showTime]="true" [showSeconds]="false"
                      dateFormat="yy-mm-dd" styleClass="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-slate-700">End Time</label>
          <p-datepicker [(ngModel)]="form.endTime" [showTime]="true" [showSeconds]="false"
                      dateFormat="yy-mm-dd" styleClass="w-full" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Cancel" [text]="true" (onClick)="showForm = false" />
        <p-button label="Save" (onClick)="save()" [loading]="saving()" />
      </ng-template>
    </p-dialog>
  `,
})
export class SlotListComponent implements OnInit {
  private svc = inject(SlotService);
  private msg = inject(MessageService);
  private confirm = inject(ConfirmationService);

  slots    = signal<AvailabilitySlotDTO[]>([]);
  loading  = signal(false);
  saving   = signal(false);
  selected = signal<AvailabilitySlotDTO | null>(null);
  showForm = false;
  form: Partial<AvailabilitySlotDTO> = {};

  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({ next: d => this.slots.set(d), complete: () => this.loading.set(false) });
  }
  openForm(s?: AvailabilitySlotDTO) { this.selected.set(s ?? null); this.form = s ? { ...s } : {}; this.showForm = true; }
  save() {
    this.saving.set(true);
    const req = this.selected()
      ? this.svc.update(this.selected()!.id!, this.form as AvailabilitySlotDTO)
      : this.svc.create(this.form as AvailabilitySlotDTO);
    req.subscribe({ next: () => { this.showForm = false; this.load(); this.msg.add({ severity: 'success', summary: 'Saved' }); }, complete: () => this.saving.set(false) });
  }
  confirmDelete(s: AvailabilitySlotDTO) {
    this.confirm.confirm({ message: 'Delete this slot?', accept: () => this.svc.delete(s.id!).subscribe({ next: () => this.load() }) });
  }
}
