import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HospitalContextService } from '../../../../core/services/hospital-context.service';
import { HospitalService } from '../../services/hospital.service';
import { HospitalStaffDTO } from '../../../../shared/models';

@Component({
  selector: 'app-staff-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, SelectModule, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />
    <div class="space-y-4">
      <div>
        <h2 class="text-lg font-semibold text-slate-800">Staff Management</h2>
        <p class="text-sm text-slate-500">{{ staff().length }} staff members</p>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <p-table [value]="staff()" [loading]="loading()" [rowHover]="true" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>User ID</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              @if (ctx.isAdmin()) {
                <th class="w-48">Actions</th>
              }
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-s>
            <tr>
              <td class="text-xs font-mono text-slate-600">{{ s.userId | slice:0:8 }}...</td>
              <td class="text-sm text-slate-700">{{ s.role }}</td>
              <td>
                <span [class]="statusClass(s)">{{ s.approvedAt ? 'Active' : 'Pending' }}</span>
              </td>
              <td class="text-sm text-slate-400">{{ s.joinedAt | date:'mediumDate' }}</td>
              @if (ctx.isAdmin()) {
                <td>
                  <div class="flex items-center gap-1">
                    @if (!s.approvedAt) {
                      <p-button icon="pi pi-check" label="Approve" size="small" [text]="true"
                                severity="success" (onClick)="approve(s)"
                                [loading]="actionLoading() === s.userId" />
                    } @else {
                      <p-select [options]="roleOptions" [(ngModel)]="s.role"
                                styleClass="text-xs" (onChange)="changeRole(s)" />
                    }
                    <p-button icon="pi pi-trash" size="small" [text]="true"
                              severity="danger" (onClick)="confirmRemove(s)" />
                  </div>
                </td>
              }
            </tr>
          </ng-template>
          <ng-template pTemplate="emptymessage">
            <tr>
              <td [attr.colspan]="ctx.isAdmin() ? 5 : 4" class="text-center py-12 text-slate-400">
                No staff members found
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
})
export class StaffListComponent implements OnInit {
  private svc     = inject(HospitalService);
  private msg     = inject(MessageService);
  private confirm = inject(ConfirmationService);
  ctx = inject(HospitalContextService);

  staff         = signal<HospitalStaffDTO[]>([]);
  loading       = signal(true);
  actionLoading = signal<string | null>(null);

  roleOptions = [
    { label: 'Doctor',    value: 'DOCTOR' },
    { label: 'Scheduler', value: 'SCHEDULER' },
  ];

  ngOnInit() { this.load(); }

  load() {
    const h = this.ctx.selectedHospital();
    if (!h) return;
    this.loading.set(true);
    this.svc.getStaff(h.id).subscribe({
      next: data => this.staff.set(data),
      complete: () => this.loading.set(false),
    });
  }

  approve(s: HospitalStaffDTO) {
    const h = this.ctx.selectedHospital()!;
    this.actionLoading.set(s.userId);
    this.svc.approveStaff(h.id, s.userId).subscribe({
      next: updated => {
        this.staff.update(list => list.map(x => x.userId === updated.userId ? updated : x));
        this.msg.add({ severity: 'success', summary: 'Staff approved' });
      },
      complete: () => this.actionLoading.set(null),
    });
  }

  changeRole(s: HospitalStaffDTO) {
    const h = this.ctx.selectedHospital()!;
    this.svc.changeRole(h.id, s.userId, s.role).subscribe({
      next: updated => this.staff.update(list => list.map(x => x.userId === updated.userId ? updated : x)),
      error: () => this.msg.add({ severity: 'error', summary: 'Failed to update role' }),
    });
  }

  confirmRemove(s: HospitalStaffDTO) {
    this.confirm.confirm({
      message: 'Remove this staff member from the hospital?',
      accept: () => {
        const h = this.ctx.selectedHospital()!;
        this.svc.removeStaff(h.id, s.userId).subscribe({
          next: () => {
            this.staff.update(list => list.filter(x => x.userId !== s.userId));
            this.msg.add({ severity: 'success', summary: 'Staff removed' });
          },
        });
      },
    });
  }

  statusClass(s: HospitalStaffDTO): string {
    const base = 'text-xs font-medium px-2 py-0.5 rounded-full ';
    return s.approvedAt
      ? base + 'bg-teal-50 text-teal-700'
      : base + 'bg-amber-50 text-amber-700';
  }
}
