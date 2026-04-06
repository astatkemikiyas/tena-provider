import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { AppointmentService } from '../../services/appointment.service';
import { SlotService } from '../../../slots/services/slot.service';
import { HospitalService } from '../../../hospital/services/hospital.service';
import { HospitalContextService } from '../../../../core/services/hospital-context.service';
import { StatusBadgeComponent } from '../../../../shared/components/status-badge/status-badge.component';
import { AppointmentDTO, AvailabilitySlotDTO, HospitalStaffDTO, AppointmentStatus } from '../../../../shared/models';

@Component({
  selector: 'app-appointment-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
            SelectModule, ToastModule, StatusBadgeComponent, TooltipModule],
  providers: [MessageService],
  template: `
    <p-toast />

    <div class="space-y-4">

      <!-- ── Doctor filter strip (scheduler / admin only) ── -->
      @if (ctx.isScheduler() && doctors().length > 0) {
        <div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button (click)="selectedDoctorId.set(null)"
                  [class]="!selectedDoctorId()
                    ? 'flex-shrink-0 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-sm'
                    : 'flex-shrink-0 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors'">
            All Doctors
          </button>
          @for (d of doctors(); track d.userId) {
            <button (click)="selectedDoctorId.set(d.userId ?? null)"
                    [class]="selectedDoctorId() === d.userId
                      ? 'flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-xl shadow-sm'
                      : 'flex-shrink-0 flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition-colors'">
              <div [class]="selectedDoctorId() === d.userId
                    ? 'w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white'
                    : 'w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center text-[10px] font-bold text-primary-700'">
                {{ (d.name ?? 'D').slice(0,1).toUpperCase() }}
              </div>
              {{ d.name ?? d.userId }}
            </button>
          }
        </div>
      }

      <!-- ── Active session banner ── -->
      @if (activeSession()) {
        <div class="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-amber-100 border border-amber-200 rounded-xl flex items-center justify-center flex-shrink-0">
              <i class="pi pi-bolt text-amber-600"></i>
            </div>
            <div>
              <p class="text-sm font-bold text-amber-800">Active session in progress</p>
              <p class="text-xs text-amber-600 mt-0.5">
                @if (ctx.isScheduler()) {
                  <strong>{{ doctorNameFor(activeSession()!) }}</strong> ·
                }
                Patient: <strong>{{ activeSession()!.patientName || 'Unknown' }}</strong>
                · {{ slotTimeFor(activeSession()!) }}
                · New requests are being auto-cancelled
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <button (click)="quickUpdate(activeSession()!, 'COMPLETED')"
                    class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors">
              <i class="pi pi-check mr-1 text-xs"></i>Mark Complete
            </button>
            <button (click)="quickUpdate(activeSession()!, 'NO_SHOW')"
                    class="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition-colors">
              No Show
            </button>
          </div>
        </div>
      }

      <!-- ── Header ── -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">
            @if (ctx.isScheduler() && selectedDoctorId()) {
              {{ doctorName(selectedDoctorId()!) }}'s Appointments
            } @else if (ctx.isScheduler()) {
              All Appointments
            } @else {
              Appointments
            }
          </h2>
          <p class="text-sm text-slate-500">
            {{ visibleAppointments().length }} shown
            @if (ctx.selectedHospital()) {
              <span class="text-slate-400"> · {{ ctx.selectedHospital()!.name }}</span>
            }
          </p>
        </div>

        <!-- Filter tabs -->
        <div class="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
          @for (f of filters; track f.key) {
            <button (click)="activeFilter.set(f.key)"
                    [class]="activeFilter() === f.key
                      ? 'flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-800 font-semibold rounded-lg text-sm shadow-sm'
                      : 'flex items-center gap-1.5 px-3 py-1.5 text-slate-500 text-sm hover:text-slate-700 transition-colors rounded-lg'">
              {{ f.label }}
              @if (countFor(f.key) > 0) {
                <span class="text-[11px] bg-primary-100 text-primary-700 font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {{ countFor(f.key) }}
                </span>
              }
            </button>
          }
        </div>
      </div>

      <!-- ── Table ── -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <p-table [value]="visibleAppointments()" [loading]="loading()" [rowHover]="true"
                 [paginator]="true" [rows]="15" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Time</th>
              @if (ctx.isScheduler()) { <th>Doctor</th> }
              <th>Patient</th>
              <th>Status</th>
              <th class="w-24">Actions</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-a>
            <tr [class]="a.id === activeSession()?.id ? 'bg-amber-50/60' : ''">
              <td>
                <p class="text-sm font-medium text-slate-800">{{ slotTimeFor(a) }}</p>
              </td>
              @if (ctx.isScheduler()) {
                <td>
                  <p class="text-sm text-slate-600">{{ doctorNameFor(a) }}</p>
                </td>
              }
              <td>
                <div>
                  <p class="text-sm font-medium text-slate-800">{{ a.patientName || '—' }}</p>
                  @if (a.patientPhone) {
                    <p class="text-xs text-slate-400">{{ a.patientPhone }}</p>
                  }
                  @if (a.isProxyBooking) {
                    <span class="text-[11px] font-semibold text-violet-700 bg-violet-50 border border-violet-100 px-2 py-0.5 rounded-full">Proxy</span>
                  }
                </div>
              </td>
              <td><app-status-badge [status]="a.status" /></td>
              <td>
                <p-button icon="pi pi-sync" [text]="true" [rounded]="true" size="small"
                          (onClick)="openStatus(a)" pTooltip="Update Status" />
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td [attr.colspan]="ctx.isScheduler() ? 5 : 4" class="text-center py-14">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                    <i class="pi pi-clipboard text-xl text-slate-300"></i>
                  </div>
                  <p class="text-slate-400 text-sm">
                    @if (activeFilter() === 'today')   { No appointments for today }
                    @else if (activeFilter() === 'pending') { No pending requests }
                    @else if (activeFilter() === 'active')  { No active sessions }
                    @else { No appointments yet }
                  </p>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>

    </div>

    <!-- ── Update Status dialog ── -->
    <p-dialog [(visible)]="showStatus" header="Update Status" [modal]="true" [style]="{width:'340px'}">
      <div class="py-2 space-y-3">
        <p class="text-sm text-slate-600 font-medium">
          {{ selected()?.patientName || ('Appointment #' + selected()?.id) }}
        </p>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-slate-700">New status</label>
          <p-select [(ngModel)]="newStatus" [options]="statusOptions" styleClass="w-full" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Cancel" [text]="true" (onClick)="showStatus = false" />
        <p-button label="Update" (onClick)="applyStatus()" [loading]="saving()" />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `],
})
export class AppointmentListComponent implements OnInit {
  private apptSvc     = inject(AppointmentService);
  private slotSvc     = inject(SlotService);
  private hospitalSvc = inject(HospitalService);
  private msg         = inject(MessageService);
  ctx                 = inject(HospitalContextService);

  appointments    = signal<AppointmentDTO[]>([]);
  allSlots        = signal<AvailabilitySlotDTO[]>([]);
  doctors         = signal<HospitalStaffDTO[]>([]);
  loading         = signal(false);
  saving          = signal(false);
  selected        = signal<AppointmentDTO | null>(null);
  activeSession   = signal<AppointmentDTO | null>(null);
  activeFilter    = signal<string>('today');
  selectedDoctorId = signal<string | null>(null);
  showStatus      = false;
  newStatus: AppointmentStatus = 'SCHEDULED';

  statusOptions: AppointmentStatus[] = [
    'SCHEDULED', 'ATTENDED', 'NO_SHOW', 'COMPLETED', 'CANCELLED', 'LATE_CANCEL',
  ];

  filters = [
    { key: 'today',   label: 'Today'   },
    { key: 'pending', label: 'Pending' },
    { key: 'active',  label: 'Active'  },
    { key: 'all',     label: 'All'     },
  ];

  // ── Hospital-scoped appointments (via slot's hospitalId) ──
  filteredAppointments = computed(() => {
    const hospId = this.ctx.selectedHospital()?.id;
    if (!hospId) return this.appointments();
    const hospSlotIds = new Set(
      this.allSlots().filter(s => s.hospitalId === hospId).map(s => s.id)
    );
    return this.appointments().filter(a => hospSlotIds.has(a.slotId));
  });

  // ── Doctor-scoped (scheduler only) ──
  doctorFilteredAppointments = computed(() => {
    const appts    = this.filteredAppointments();
    const doctorId = this.selectedDoctorId();
    if (!this.ctx.isScheduler() || !doctorId) return appts;
    const slotIds = new Set(
      this.allSlots().filter(s => s.doctorId === doctorId).map(s => s.id)
    );
    return appts.filter(a => slotIds.has(a.slotId));
  });

  visibleAppointments = computed(() => {
    const appts  = this.doctorFilteredAppointments();
    const filter = this.activeFilter();
    const today  = new Date().toDateString();
    if (filter === 'today') {
      return appts.filter(a => {
        const slot = this.allSlots().find(s => s.id === a.slotId);
        return slot?.startTime && new Date(slot.startTime).toDateString() === today;
      });
    }
    if (filter === 'pending') return appts.filter(a => a.status === 'SCHEDULED');
    if (filter === 'active')  return appts.filter(a => a.status === 'ATTENDED');
    return appts;
  });

  countFor(key: string): number {
    if (key === 'all') return 0;
    const appts = this.doctorFilteredAppointments();
    const today = new Date().toDateString();
    if (key === 'today') return appts.filter(a => {
      const slot = this.allSlots().find(s => s.id === a.slotId);
      return slot?.startTime && new Date(slot.startTime).toDateString() === today;
    }).length;
    if (key === 'pending') return appts.filter(a => a.status === 'SCHEDULED').length;
    if (key === 'active')  return appts.filter(a => a.status === 'ATTENDED').length;
    return 0;
  }

  slotTimeFor(a: AppointmentDTO): string {
    const slot = this.allSlots().find(s => s.id === a.slotId);
    if (!slot?.startTime) return `Slot #${a.slotId}`;
    const start = new Date(slot.startTime);
    const end   = slot.endTime ? new Date(slot.endTime) : null;
    const date  = start.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const t1    = start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    const t2    = end ? end.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
    return `${date} · ${t1}${t2 ? '–' + t2 : ''}`;
  }

  doctorNameFor(a: AppointmentDTO): string {
    const slot = this.allSlots().find(s => s.id === a.slotId);
    if (!slot?.doctorId) return slot?.doctorName ?? '—';
    const d = this.doctors().find(d => d.userId === slot.doctorId);
    return d?.name ?? slot.doctorName ?? '—';
  }

  doctorName(userId: string): string {
    return this.doctors().find(d => d.userId === userId)?.name ?? userId;
  }

  // ── Lifecycle ──
  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    forkJoin({
      slots:        this.slotSvc.getAll(),
      appointments: this.apptSvc.getAll(),
    }).subscribe({
      next: ({ slots, appointments }) => {
        this.allSlots.set(slots);
        this.appointments.set(appointments);
        if (this.ctx.isScheduler()) this.loadDoctors();
        this.checkActiveSession(slots, appointments);
      },
      complete: () => this.loading.set(false),
    });
  }

  private loadDoctors() {
    const hospId = this.ctx.selectedHospital()?.id;
    if (!hospId) return;
    this.hospitalSvc.getStaff(hospId).subscribe({
      next: staff => this.doctors.set(staff.filter(s => s.role === 'DOCTOR' && s.isActive !== false)),
    });
  }

  private reloadAppointments() {
    this.apptSvc.getAll().subscribe({ next: appts => this.appointments.set(appts) });
  }

  checkActiveSession(slots: AvailabilitySlotDTO[], appts: AppointmentDTO[]) {
    const now   = new Date();
    const today = now.toDateString();

    const active = appts.find(a => {
      if (a.status !== 'ATTENDED') return false;
      const slot = slots.find(s => s.id === a.slotId);
      if (!slot?.startTime || !slot?.endTime) return false;
      return now >= new Date(slot.startTime) && now <= new Date(slot.endTime);
    });

    this.activeSession.set(active ?? null);
    if (!active) return;

    const sessionStart = active.checkedInAt
      ? new Date(active.checkedInAt)
      : (() => { const s = slots.find(s => s.id === active.slotId); return s?.startTime ? new Date(s.startTime) : now; })();

    // Auto-cancel SCHEDULED appointments for today created after session started
    const toCancel = appts.filter(a => {
      if (a.id === active.id || a.status !== 'SCHEDULED' || !a.createdAt) return false;
      const slot = slots.find(s => s.id === a.slotId);
      // Scheduler: only cancel for same doctor; doctor: cancel own
      if (this.ctx.isScheduler()) {
        const activeSlot = slots.find(s => s.id === active.slotId);
        if (slot?.doctorId !== activeSlot?.doctorId) return false;
      }
      const slotDay = slot?.startTime ? new Date(slot.startTime).toDateString() : '';
      return slotDay === today && new Date(a.createdAt) >= sessionStart;
    });

    if (!toCancel.length) return;

    forkJoin(toCancel.map(a => this.apptSvc.cancel(a.id!))).subscribe({
      next: () => {
        this.msg.add({
          severity: 'warn',
          summary:  'Auto-cancelled',
          detail:   `${toCancel.length} request${toCancel.length !== 1 ? 's' : ''} cancelled — session in progress`,
          life: 6000,
        });
        this.reloadAppointments();
      },
    });
  }

  quickUpdate(a: AppointmentDTO, status: AppointmentStatus) {
    this.apptSvc.updateStatus(a.id!, { status }).subscribe({
      next: () => { this.load(); this.msg.add({ severity: 'success', summary: `Marked as ${status.toLowerCase()}` }); },
    });
  }

  openStatus(a: AppointmentDTO) {
    this.selected.set(a);
    this.newStatus = a.status! as AppointmentStatus;
    this.showStatus = true;
  }

  applyStatus() {
    this.saving.set(true);
    this.apptSvc.updateStatus(this.selected()!.id!, { status: this.newStatus }).subscribe({
      next:     () => { this.showStatus = false; this.load(); this.msg.add({ severity: 'success', summary: 'Status updated' }); },
      complete: () => this.saving.set(false),
    });
  }
}
