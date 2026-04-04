import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { AppointmentService } from '../../services/appointment.service';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { AppointmentDTO, AppointmentStatus } from '../../../../shared/models';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
            SelectModule, ToastModule, StatusBadgeComponent, TooltipModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">Appointments</h2>
          <p class="text-sm text-slate-500">{{ appointments().length }} total</p>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <p-table [value]="appointments()" [loading]="loading()" [rowHover]="true"
                 [paginator]="true" [rows]="15" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Slot ID</th>
              <th>Patient</th>
              <th>Proxy</th>
              <th>Status</th>
              <th class="w-28">Actions</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-a>
            <tr>
              <td class="text-sm font-medium text-slate-800">#{{ a.slotId }}</td>
              <td class="text-sm text-slate-600">{{ a.patientName || '—' }}</td>
              <td class="text-sm text-slate-500">{{ a.isProxyBooking ? 'Yes' : 'No' }}</td>
              <td><app-status-badge [status]="a.status" /></td>
              <td>
                <p-button icon="pi pi-sync" [text]="true" [rounded]="true" size="small"
                          (onClick)="openStatus(a)" pTooltip="Update Status" />
              </td>
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr><td colspan="5" class="text-center py-12 text-slate-400">No appointments</td></tr>
          </ng-template>
        </p-table>
      </div>
    </div>
    <p-dialog [(visible)]="showStatus" header="Update Status" [modal]="true" [style]="{width:'340px'}">
      <div class="py-2 space-y-3">
        <p class="text-sm text-slate-600">Appointment #{{ selected()?.id }}</p>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-slate-700">Status</label>
          <p-select [(ngModel)]="newStatus" [options]="statusOptions" styleClass="w-full" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Cancel" [text]="true" (onClick)="showStatus = false" />
        <p-button label="Update" (onClick)="applyStatus()" [loading]="saving()" />
      </ng-template>
    </p-dialog>
  `,
})
export class AppointmentListComponent implements OnInit {
  private svc  = inject(AppointmentService);
  private msg  = inject(MessageService);
  appointments = signal<AppointmentDTO[]>([]);
  loading      = signal(false);
  saving       = signal(false);
  selected     = signal<AppointmentDTO | null>(null);
  showStatus   = false;
  newStatus: AppointmentStatus = 'SCHEDULED';
  statusOptions: AppointmentStatus[] = ['SCHEDULED','ATTENDED','NO_SHOW','COMPLETED','CANCELLED','LATE_CANCEL'];

  ngOnInit() { this.load(); }
  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({ next: d => this.appointments.set(d), complete: () => this.loading.set(false) });
  }
  openStatus(a: AppointmentDTO) { this.selected.set(a); this.newStatus = a.status!; this.showStatus = true; }
  applyStatus() {
    this.saving.set(true);
    this.svc.updateStatus(this.selected()!.id!, { status: this.newStatus }).subscribe({
      next: () => { this.showStatus = false; this.load(); this.msg.add({ severity: 'success', summary: 'Updated' }); },
      complete: () => this.saving.set(false),
    });
  }
}
