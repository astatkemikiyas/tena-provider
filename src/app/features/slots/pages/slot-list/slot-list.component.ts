import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DatePickerModule } from 'primeng/datepicker';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TooltipModule } from 'primeng/tooltip';
import { SelectModule } from 'primeng/select';
import { MessageService, ConfirmationService } from 'primeng/api';
import { SlotService } from '../../services/slot.service';
import { HospitalContextService } from '../../../../core/services/hospital-context.service';
import { HospitalService } from '../../../hospital/services/hospital.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AvailabilitySlotDTO, HospitalStaffDTO } from '../../../../shared/models';

type ViewMode = 'week' | 'month' | 'year' | 'list';

@Component({
  selector: 'app-slot-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, DialogModule,
            DatePickerModule, ToastModule, ConfirmDialogModule, TooltipModule, SelectModule],
  providers: [MessageService, ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />

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

      <!-- ── Header ── -->
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 class="text-lg font-semibold text-slate-800">
            @if (ctx.isScheduler() && selectedDoctorId()) {
              {{ doctorName(selectedDoctorId()!) }}'s Slots
            } @else if (ctx.isScheduler()) {
              All Doctors' Slots
            } @else {
              My Slots
            }
          </h2>
          <p class="text-sm text-slate-500">
            {{ displaySlots().length }} slot{{ displaySlots().length !== 1 ? 's' : '' }}
            @if (ctx.selectedHospital()) {
              <span class="text-slate-400"> · {{ ctx.selectedHospital()!.name }}</span>
            }
          </p>
        </div>
        <div class="flex items-center gap-2 flex-wrap">

          <!-- View mode toggle -->
          <div class="flex rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm text-sm">
            @for (v of viewModes; track v.key) {
              <button (click)="viewMode.set(v.key)"
                      [class]="viewMode() === v.key
                        ? 'px-3 py-2 bg-primary-600 text-white font-medium flex items-center gap-1.5'
                        : 'px-3 py-2 text-slate-500 hover:bg-slate-50 transition-colors flex items-center gap-1.5'"
                      [title]="v.label">
                <i [class]="'pi ' + v.icon + ' text-xs'"></i>
                <span class="hidden sm:inline">{{ v.label }}</span>
              </button>
            }
          </div>

          <button (click)="openQuickFill()"
                  class="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
            <i class="pi pi-bolt text-xs text-amber-500"></i>
            Quick Fill Today
          </button>

          <button (click)="openForm()"
                  class="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
            <i class="pi pi-plus text-xs"></i>
            New Slot
          </button>
        </div>
      </div>

      <!-- ══════════ WEEK VIEW ══════════ -->
      @if (viewMode() === 'week') {
        <div class="flex items-center gap-2">
          <button (click)="prevWeek()" class="nav-btn"><i class="pi pi-chevron-left text-xs"></i></button>
          <button (click)="goToday()" class="nav-label-btn">Today</button>
          <span class="text-sm font-semibold text-slate-700 px-2 min-w-[200px] text-center">{{ weekRangeLabel() }}</span>
          <button (click)="nextWeek()" class="nav-btn"><i class="pi pi-chevron-right text-xs"></i></button>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div class="overflow-auto" style="max-height: 72vh;">
            <div class="sticky top-0 z-20 bg-white border-b border-slate-100 flex" style="padding-left: 52px;">
              @for (day of calendarDays(); track day.toString()) {
                <div class="flex-1 py-3 text-center border-l border-slate-100">
                  <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{{ day | date:'EEE' }}</p>
                  <div [class]="isToday(day)
                    ? 'w-9 h-9 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mt-1 text-sm font-bold'
                    : 'h-9 flex items-center justify-center mt-1 text-sm font-semibold text-slate-700'">
                    {{ day | date:'d' }}
                  </div>
                </div>
              }
            </div>

            <div class="flex">
              <div class="flex-shrink-0 w-[52px]">
                @for (h of hours; track h) {
                  <div class="border-t border-slate-50 flex items-start justify-end pr-2 pt-1"
                       [style.height.px]="HOUR_HEIGHT">
                    <span class="text-[11px] text-slate-400 leading-none">{{ hourLabel(h) }}</span>
                  </div>
                }
              </div>

              @for (day of calendarDays(); track day.toString()) {
                <div class="flex-1 border-l border-slate-100 relative cursor-pointer select-none"
                     [style.height.px]="totalHeight"
                     (click)="clickDayColumn($event, day)">
                  @if (isToday(day)) {
                    <div class="absolute inset-0 bg-primary-600/[0.025] pointer-events-none"></div>
                  }
                  @for (h of hours; track h) {
                    <div class="absolute w-full border-t border-slate-50 pointer-events-none"
                         [style.top.px]="(h - START_HOUR) * HOUR_HEIGHT"></div>
                    <div class="absolute w-full border-t border-dashed border-slate-50 pointer-events-none"
                         [style.top.px]="(h - START_HOUR) * HOUR_HEIGHT + HOUR_HEIGHT / 2"></div>
                  }
                  @if (isToday(day) && nowTopPx() >= 0) {
                    <div class="absolute w-full flex items-center pointer-events-none z-10"
                         [style.top.px]="nowTopPx()">
                      <div class="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" style="margin-left:-5px"></div>
                      <div class="flex-1 h-px bg-rose-400"></div>
                    </div>
                  }
                  @for (slot of slotsForDay(day); track slot.id) {
                    <div class="absolute left-1 right-1 bg-primary-100 border border-primary-300 rounded-lg px-2 py-1
                                cursor-pointer hover:bg-primary-200 transition-colors overflow-hidden z-20 group"
                         [style.top.px]="slotTopPx(slot)"
                         [style.height.px]="slotHeightPx(slot)"
                         (click)="$event.stopPropagation(); openForm(slot)">
                      <div class="flex items-start justify-between gap-1">
                        <div class="min-w-0">
                          <p class="text-[11px] font-bold text-primary-700 leading-tight truncate">
                            {{ slot.startTime | date:'HH:mm' }}–{{ slot.endTime | date:'HH:mm' }}
                          </p>
                          @if (ctx.isScheduler()) {
                            <p class="text-[10px] text-primary-500 truncate">{{ slotDoctorName(slot) }}</p>
                          }
                        </div>
                        <button class="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 transition-all flex-shrink-0"
                                (click)="$event.stopPropagation(); confirmDelete(slot)">
                          <i class="pi pi-times text-[10px]"></i>
                        </button>
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- ══════════ MONTH VIEW ══════════ -->
      @if (viewMode() === 'month') {
        <div class="flex items-center gap-2">
          <button (click)="prevMonth()" class="nav-btn"><i class="pi pi-chevron-left text-xs"></i></button>
          <button (click)="goThisMonth()" class="nav-label-btn">This Month</button>
          <span class="text-sm font-semibold text-slate-700 px-2 min-w-[160px] text-center">{{ monthRangeLabel() }}</span>
          <button (click)="nextMonth()" class="nav-btn"><i class="pi pi-chevron-right text-xs"></i></button>
        </div>

        <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <!-- Day-of-week headers -->
          <div class="grid grid-cols-7 border-b border-slate-100">
            @for (d of DOW_LABELS; track d) {
              <div class="py-2.5 text-center text-[11px] font-semibold text-slate-400 uppercase tracking-wide">{{ d }}</div>
            }
          </div>
          <!-- Day cells -->
          <div class="grid grid-cols-7">
            @for (day of monthDays(); track day.toString()) {
              <div class="border-t border-r border-slate-50 min-h-[110px] p-2 cursor-pointer transition-colors"
                   [class]="!isCurrentMonth(day) ? 'opacity-40 hover:bg-slate-50/30' : isToday(day) ? 'bg-primary-50/30 hover:bg-primary-50/60' : 'hover:bg-slate-50/50'"
                   (click)="clickMonthDay(day)">
                <div class="flex items-center justify-between mb-1.5">
                  <span [class]="isToday(day)
                    ? 'w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-xs font-bold'
                    : 'text-sm font-semibold text-slate-700'">
                    {{ day | date:'d' }}
                  </span>
                </div>
                <div class="space-y-0.5">
                  @for (slot of slotsForDay(day).slice(0, 3); track slot.id) {
                    <div class="flex items-center gap-1 px-1.5 py-0.5 bg-primary-100 text-primary-700 rounded text-[10px] font-semibold truncate group/chip"
                         (click)="$event.stopPropagation(); openForm(slot)">
                      <span>{{ slot.startTime | date:'HH:mm' }}</span>
                      @if (ctx.isScheduler()) {
                        <span class="text-primary-500 truncate">· {{ slotDoctorName(slot) | slice:0:10 }}</span>
                      }
                    </div>
                  }
                  @if (slotsForDay(day).length > 3) {
                    <p class="text-[10px] text-slate-400 font-medium pl-1">+{{ slotsForDay(day).length - 3 }} more</p>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- ══════════ YEAR VIEW ══════════ -->
      @if (viewMode() === 'year') {
        <div class="flex items-center gap-2">
          <button (click)="prevYear()" class="nav-btn"><i class="pi pi-chevron-left text-xs"></i></button>
          <button (click)="goThisYear()" class="nav-label-btn">This Year</button>
          <span class="text-sm font-semibold text-slate-700 px-2 min-w-[80px] text-center">{{ yearView() }}</span>
          <button (click)="nextYear()" class="nav-btn"><i class="pi pi-chevron-right text-xs"></i></button>
        </div>

        <div class="grid grid-cols-3 gap-4">
          @for (month of yearMonths(); track month.toString()) {
            <div class="bg-white rounded-xl border border-slate-200 p-4 cursor-pointer hover:border-primary-300 hover:shadow-md transition-all"
                 (click)="selectMonth(month)">
              <div class="flex items-center justify-between mb-3">
                <p class="text-sm font-bold text-slate-700">{{ month | date:'MMMM' }}</p>
                @if (slotsForMonth(month).length > 0) {
                  <span class="text-[11px] font-semibold text-primary-600 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded-full">
                    {{ slotsForMonth(month).length }}
                  </span>
                }
              </div>
              <!-- Mini calendar -->
              <div class="grid grid-cols-7 gap-px">
                @for (d of ['M','T','W','T','F','S','S']; track $index) {
                  <div class="text-center text-[8px] text-slate-300 font-semibold pb-0.5">{{ d }}</div>
                }
                @for (cell of miniMonthDays(month); track $index) {
                  @if (cell) {
                    <div class="relative flex items-center justify-center"
                         style="aspect-ratio:1">
                      <span [class]="isToday(cell)
                        ? 'w-full h-full bg-primary-600 text-white rounded-full flex items-center justify-center text-[9px] font-bold leading-none'
                        : 'text-[9px] text-slate-500 leading-none'">
                        {{ cell | date:'d' }}
                      </span>
                      @if (slotsForDay(cell).length > 0) {
                        <div class="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500"></div>
                      }
                    </div>
                  } @else {
                    <div style="aspect-ratio:1"></div>
                  }
                }
              </div>
              @if (slotsForMonth(month).length === 0) {
                <p class="text-xs text-slate-300 mt-2">No slots</p>
              }
            </div>
          }
        </div>
      }

      <!-- ══════════ LIST VIEW ══════════ -->
      @if (viewMode() === 'list') {
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <p-table [value]="displaySlots()" [loading]="loading()" [rowHover]="true"
                   [paginator]="true" [rows]="20" styleClass="p-datatable-sm">
            <ng-template pTemplate="header">
              <tr>
                <th>Start</th>
                <th>End</th>
                <th>Duration</th>
                @if (ctx.isScheduler()) { <th>Doctor</th> }
                <th class="w-24">Actions</th>
              </tr>
            </ng-template>
            <ng-template pTemplate="body" let-s>
              <tr>
                <td class="text-sm font-medium text-slate-800">{{ s.startTime | date:'EEE, MMM d · HH:mm' }}</td>
                <td class="text-sm text-slate-600">{{ s.endTime | date:'HH:mm' }}</td>
                <td class="text-sm text-slate-500">{{ durationLabel(s) }}</td>
                @if (ctx.isScheduler()) {
                  <td class="text-sm text-slate-600">{{ slotDoctorName(s) }}</td>
                }
                <td>
                  <div class="flex gap-1">
                    <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small" (onClick)="openForm(s)" pTooltip="Edit" />
                    <p-button icon="pi pi-trash"  [text]="true" [rounded]="true" size="small" severity="danger" (onClick)="confirmDelete(s)" pTooltip="Delete" />
                  </div>
                </td>
              </tr>
            </ng-template>
            <ng-template pTemplate="emptymessage">
              <tr>
                <td [attr.colspan]="ctx.isScheduler() ? 5 : 4" class="text-center py-14">
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                      <i class="pi pi-calendar text-xl text-slate-300"></i>
                    </div>
                    <p class="text-slate-400 text-sm">No slots — use <strong>Quick Fill Today</strong> or create your first one</p>
                  </div>
                </td>
              </tr>
            </ng-template>
          </p-table>
        </div>
      }

    </div>

    <!-- ── New / Edit Slot dialog ── -->
    <p-dialog [(visible)]="showForm" [header]="selected() ? 'Edit Slot' : 'New Slot'"
              [modal]="true" [style]="{width:'420px'}" [closable]="true">
      <div class="space-y-4 py-2">
        @if (ctx.isScheduler()) {
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-slate-700">For Doctor <span class="text-rose-500">*</span></label>
            <p-select [(ngModel)]="formDoctorId"
                      [options]="doctorOptions()"
                      optionLabel="label" optionValue="value"
                      placeholder="Select a doctor"
                      styleClass="w-full" />
          </div>
        }
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-slate-700">Start Time</label>
          <p-datepicker [(ngModel)]="formStart" [showTime]="true" [showSeconds]="false"
                        dateFormat="D, M dd" hourFormat="24" styleClass="w-full" />
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-sm font-medium text-slate-700">End Time</label>
          <p-datepicker [(ngModel)]="formEnd" [showTime]="true" [showSeconds]="false"
                        dateFormat="D, M dd" hourFormat="24" styleClass="w-full" />
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Cancel" [text]="true" (onClick)="showForm = false" />
        <p-button label="Save" (onClick)="save()" [loading]="saving()" />
      </ng-template>
    </p-dialog>

    <!-- ── Quick Fill Today dialog ── -->
    <p-dialog [(visible)]="showQuickFill" header="Quick Fill Today's Schedule"
              [modal]="true" [style]="{width:'430px'}">
      <div class="space-y-5 py-2">
        <div class="bg-primary-50 border border-primary-100 rounded-xl p-4">
          <p class="text-sm font-semibold text-primary-800 mb-0.5">Auto-generate today's availability</p>
          <p class="text-xs text-primary-600">Creates consecutive slots for today based on your settings</p>
        </div>

        @if (ctx.isScheduler()) {
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-slate-700">For Doctor <span class="text-rose-500">*</span></label>
            <p-select [(ngModel)]="quickFillDoctorId"
                      [options]="doctorOptions()"
                      optionLabel="label" optionValue="value"
                      placeholder="Select a doctor"
                      styleClass="w-full" />
          </div>
        }

        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-slate-700">Work start</label>
            <p-datepicker [(ngModel)]="quickFillStart" [timeOnly]="true" hourFormat="24" styleClass="w-full" />
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-sm font-medium text-slate-700">Work end</label>
            <p-datepicker [(ngModel)]="quickFillEnd" [timeOnly]="true" hourFormat="24" styleClass="w-full" />
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-slate-700">Slot duration</label>
          <div class="grid grid-cols-4 gap-2">
            @for (d of durationOptions; track d.value) {
              <button (click)="selectedDuration = d.value"
                      [class]="selectedDuration === d.value
                        ? 'py-2 bg-primary-600 text-white font-semibold rounded-xl text-sm border-2 border-primary-600'
                        : 'py-2 bg-white border-2 border-slate-200 text-slate-600 font-medium rounded-xl text-sm hover:border-slate-300 transition-colors'">
                {{ d.label }}
              </button>
            }
          </div>
        </div>

        <div class="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
          <p class="text-xs text-slate-500 mb-1">Preview</p>
          <p class="text-3xl font-extrabold text-slate-800">{{ previewSlotCount() }}</p>
          <p class="text-xs text-slate-500 mt-1">slots of {{ selectedDuration }} min each</p>
        </div>
      </div>
      <ng-template pTemplate="footer">
        <p-button label="Cancel" [text]="true" (onClick)="showQuickFill = false" />
        <p-button label="Fill Today" icon="pi pi-bolt"
                  (onClick)="fillToday()" [loading]="saving()"
                  [disabled]="previewSlotCount() === 0 || (ctx.isScheduler() && !quickFillDoctorId)" />
      </ng-template>
    </p-dialog>
  `,
  styles: [`
    .nav-btn {
      @apply w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-colors;
    }
    .nav-label-btn {
      @apply px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors;
    }
    .no-scrollbar::-webkit-scrollbar { display: none; }
    .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `],
})
export class SlotListComponent implements OnInit {
  private svc         = inject(SlotService);
  private hospitalSvc = inject(HospitalService);
  private auth        = inject(AuthService);
  private msg         = inject(MessageService);
  private confirm     = inject(ConfirmationService);
  ctx                 = inject(HospitalContextService);

  // ── Data ──
  slots   = signal<AvailabilitySlotDTO[]>([]);
  doctors = signal<HospitalStaffDTO[]>([]);
  loading = signal(false);
  saving  = signal(false);

  // ── Selection ──
  selected          = signal<AvailabilitySlotDTO | null>(null);
  selectedDoctorId  = signal<string | null>(null);

  // ── Form ──
  showForm     = false;
  formStart: Date | null = null;
  formEnd: Date | null   = null;
  formDoctorId: string | null = null;
  formHospitalId?: number;

  // ── View ──
  viewMode = signal<ViewMode>('week');
  viewModes = [
    { key: 'week'  as ViewMode, label: 'Week',  icon: 'pi-calendar'       },
    { key: 'month' as ViewMode, label: 'Month', icon: 'pi-calendar-plus'  },
    { key: 'year'  as ViewMode, label: 'Year',  icon: 'pi-th-large'       },
    { key: 'list'  as ViewMode, label: 'List',  icon: 'pi-list'           },
  ];

  // ── Week ──
  weekStart = signal<Date>(this.getWeekStart(new Date()));

  // ── Month ──
  monthStart = signal<Date>((() => { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d; })());

  // ── Year ──
  yearView = signal<number>(new Date().getFullYear());

  // ── Quick Fill ──
  showQuickFill        = false;
  quickFillStart: Date = (() => { const d = new Date(); d.setHours(8, 0, 0, 0); return d; })();
  quickFillEnd: Date   = (() => { const d = new Date(); d.setHours(17, 0, 0, 0); return d; })();
  quickFillDoctorId: string | null = null;
  selectedDuration     = 30;
  durationOptions = [
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '45 min', value: 45 },
    { label: '1 hr',   value: 60 },
  ];

  // ── Calendar constants ──
  readonly HOUR_HEIGHT = 64;
  readonly START_HOUR  = 7;
  readonly END_HOUR    = 21;
  readonly hours = Array.from(
    { length: this.END_HOUR - this.START_HOUR },
    (_, i) => this.START_HOUR + i,
  );
  readonly DOW_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  get totalHeight(): number { return (this.END_HOUR - this.START_HOUR) * this.HOUR_HEIGHT; }

  // ── Computed: hospital-scoped then doctor-scoped ──
  filteredSlots = computed(() => {
    const hospId = this.ctx.selectedHospital()?.id;
    const base   = hospId
      ? this.slots().filter(s => s.hospitalId === hospId)
      : this.slots();
    return base;
  });

  displaySlots = computed(() => {
    const slots    = this.filteredSlots();
    const doctorId = this.selectedDoctorId();
    if (!this.ctx.isScheduler() || !doctorId) return slots;
    return slots.filter(s => s.doctorId === doctorId);
  });

  // ── Calendar days (week) ──
  calendarDays = computed(() => {
    const start = this.weekStart();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  });

  weekRangeLabel = computed(() => {
    const [s, e] = [this.calendarDays()[0], this.calendarDays()[6]];
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(s)} – ${fmt(e)}, ${e.getFullYear()}`;
  });

  // ── Month days ──
  monthDays = computed(() => {
    const d = this.monthStart();
    const year = d.getFullYear(), m = d.getMonth();
    const first = new Date(year, m, 1);
    const last  = new Date(year, m + 1, 0);
    // Pad to Monday-start
    const startDow  = first.getDay();
    const startDate = new Date(first);
    startDate.setDate(first.getDate() - (startDow === 0 ? 6 : startDow - 1));
    // Pad to Sunday-end
    const endDow  = last.getDay();
    const endDate = new Date(last);
    if (endDow !== 0) endDate.setDate(last.getDate() + (7 - endDow));

    const days: Date[] = [];
    const cur = new Date(startDate);
    while (cur <= endDate) { days.push(new Date(cur)); cur.setDate(cur.getDate() + 1); }
    return days;
  });

  monthRangeLabel = computed(() =>
    this.monthStart().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  );

  // ── Year months ──
  yearMonths = computed(() =>
    Array.from({ length: 12 }, (_, i) => new Date(this.yearView(), i, 1))
  );

  // ── Doctor options ──
  doctorOptions = computed(() =>
    this.doctors().map(d => ({ label: d.name ?? d.userId ?? 'Unknown', value: d.userId }))
  );

  // ── Lifecycle ──
  ngOnInit() {
    this.load();
    if (this.ctx.isScheduler()) this.loadDoctors();
  }

  load() {
    this.loading.set(true);
    this.svc.getAll().subscribe({
      next:     d  => this.slots.set(d),
      complete: () => this.loading.set(false),
    });
  }

  loadDoctors() {
    const hospId = this.ctx.selectedHospital()?.id;
    if (!hospId) return;
    this.hospitalSvc.getStaff(hospId).subscribe({
      next: staff => this.doctors.set(staff.filter(s => s.role === 'DOCTOR' && s.isActive !== false)),
    });
  }

  // ── Week helpers ──
  getWeekStart(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
    return d;
  }

  prevWeek()  { const d = new Date(this.weekStart()); d.setDate(d.getDate() - 7); this.weekStart.set(d); }
  nextWeek()  { const d = new Date(this.weekStart()); d.setDate(d.getDate() + 7); this.weekStart.set(d); }
  goToday()   { this.weekStart.set(this.getWeekStart(new Date())); }

  // ── Month helpers ──
  prevMonth()    { const d = new Date(this.monthStart()); d.setMonth(d.getMonth() - 1); this.monthStart.set(d); }
  nextMonth()    { const d = new Date(this.monthStart()); d.setMonth(d.getMonth() + 1); this.monthStart.set(d); }
  goThisMonth()  { const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); this.monthStart.set(d); }

  isCurrentMonth(day: Date): boolean {
    return day.getMonth() === this.monthStart().getMonth() && day.getFullYear() === this.monthStart().getFullYear();
  }

  clickMonthDay(day: Date) {
    const start = new Date(day); start.setHours(9, 0, 0, 0);
    const end   = new Date(day); end.setHours(9, 30, 0, 0);
    this.openForm(undefined, start, end);
  }

  // ── Year helpers ──
  prevYear()   { this.yearView.update(y => y - 1); }
  nextYear()   { this.yearView.update(y => y + 1); }
  goThisYear() { this.yearView.set(new Date().getFullYear()); }

  selectMonth(month: Date) {
    const d = new Date(month);
    d.setDate(1); d.setHours(0,0,0,0);
    this.monthStart.set(d);
    this.viewMode.set('month');
  }

  miniMonthDays(month: Date): Array<Date | null> {
    const year = month.getFullYear(), m = month.getMonth();
    const first = new Date(year, m, 1);
    const last  = new Date(year, m + 1, 0);
    const cells: Array<Date | null> = [];
    const dow = first.getDay();
    for (let i = 0; i < (dow === 0 ? 6 : dow - 1); i++) cells.push(null);
    for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, m, d));
    return cells;
  }

  // ── Shared slot helpers ──
  isToday(day: Date): boolean { return day.toDateString() === new Date().toDateString(); }

  slotsForDay(day: Date): AvailabilitySlotDTO[] {
    return this.displaySlots().filter(s =>
      s.startTime && new Date(s.startTime).toDateString() === day.toDateString()
    );
  }

  slotsForMonth(month: Date): AvailabilitySlotDTO[] {
    return this.displaySlots().filter(s => {
      if (!s.startTime) return false;
      const d = new Date(s.startTime);
      return d.getFullYear() === month.getFullYear() && d.getMonth() === month.getMonth();
    });
  }

  // ── Week positioning ──
  slotTopPx(slot: AvailabilitySlotDTO): number {
    const s = new Date(slot.startTime!);
    return Math.max(((s.getHours() - this.START_HOUR) * 60 + s.getMinutes()) * (this.HOUR_HEIGHT / 60), 0);
  }

  slotHeightPx(slot: AvailabilitySlotDTO): number {
    const dur = (new Date(slot.endTime!).getTime() - new Date(slot.startTime!).getTime()) / 60000;
    return Math.max(dur * (this.HOUR_HEIGHT / 60), 22);
  }

  nowTopPx(): number {
    const now  = new Date();
    const mins = (now.getHours() - this.START_HOUR) * 60 + now.getMinutes();
    if (mins < 0 || mins > (this.END_HOUR - this.START_HOUR) * 60) return -1;
    return mins * (this.HOUR_HEIGHT / 60);
  }

  hourLabel(h: number): string {
    if (h === 0)  return '12am';
    if (h === 12) return '12pm';
    return h < 12 ? `${h}am` : `${h - 12}pm`;
  }

  clickDayColumn(event: MouseEvent, day: Date) {
    const rect   = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const mins   = ((event.clientY - rect.top) / this.HOUR_HEIGHT) * 60;
    const hour   = Math.floor(mins / 60) + this.START_HOUR;
    const minute = Math.round((mins % 60) / 30) * 30;
    const start  = new Date(day);
    start.setHours(Math.min(hour, this.END_HOUR - 1), minute < 60 ? minute : 0, 0, 0);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);
    this.openForm(undefined, start, end);
  }

  // ── Form ──
  openForm(s?: AvailabilitySlotDTO, startDefault?: Date, endDefault?: Date) {
    this.selected.set(s ?? null);
    if (s) {
      this.formStart      = s.startTime ? new Date(s.startTime) : null;
      this.formEnd        = s.endTime   ? new Date(s.endTime)   : null;
      this.formHospitalId = s.hospitalId;
      this.formDoctorId   = s.doctorId ?? null;
    } else {
      this.formStart      = startDefault ?? null;
      this.formEnd        = endDefault   ?? null;
      this.formHospitalId = this.ctx.selectedHospital()?.id;
      this.formDoctorId   = this.selectedDoctorId(); // pre-fill with active doctor filter
    }
    this.showForm = true;
  }

  save() {
    if (!this.formStart || !this.formEnd) {
      this.msg.add({ severity: 'warn', summary: 'Please fill in both start and end time' });
      return;
    }
    if (this.ctx.isScheduler() && !this.formDoctorId) {
      this.msg.add({ severity: 'warn', summary: 'Please select a doctor' });
      return;
    }
    this.saving.set(true);
    const dto: AvailabilitySlotDTO = {
      ...(this.selected() ? { id: this.selected()!.id } : {}),
      startTime:  this.formStart.toISOString(),
      endTime:    this.formEnd.toISOString(),
      hospitalId: this.formHospitalId ?? this.ctx.selectedHospital()?.id,
      ...(this.ctx.isScheduler() && this.formDoctorId ? { doctorId: this.formDoctorId } : {}),
    };
    const req = this.selected()
      ? this.svc.update(this.selected()!.id!, dto)
      : this.svc.create(dto);
    req.subscribe({
      next:     () => { this.showForm = false; this.load(); this.msg.add({ severity: 'success', summary: 'Slot saved' }); },
      error:    () => { this.msg.add({ severity: 'error', summary: 'Failed to save slot' }); this.saving.set(false); },
      complete: () => this.saving.set(false),
    });
  }

  confirmDelete(s: AvailabilitySlotDTO) {
    this.confirm.confirm({
      message: 'Delete this slot?',
      accept:  () => this.svc.delete(s.id!).subscribe({ next: () => this.load() }),
    });
  }

  durationLabel(s: AvailabilitySlotDTO): string {
    if (!s.startTime || !s.endTime) return '—';
    const mins = Math.round((new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / 60000);
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60), m = mins % 60;
    return m ? `${h}h ${m}m` : `${h}h`;
  }

  /** Display name for a doctor chip/filter (from staff list) */
  doctorName(userId: string): string {
    return this.doctors().find(d => d.userId === userId)?.name ?? userId;
  }

  /**
   * Resolves the best display name for a slot's assigned doctor.
   * Priority: backend doctorName > staff-list name lookup > ID (as last resort).
   */
  slotDoctorName(slot: AvailabilitySlotDTO): string {
    if (slot.doctorName) return slot.doctorName;
    if (slot.doctorId) {
      const found = this.doctors().find(d => d.userId === slot.doctorId);
      if (found?.name) return found.name;
    }
    return '—';
  }

  // ── Quick Fill ──
  openQuickFill() {
    const d = new Date();
    this.quickFillStart    = new Date(d.setHours(8, 0, 0, 0));
    this.quickFillEnd      = new Date(d.setHours(17, 0, 0, 0));
    this.selectedDuration  = 30;
    this.quickFillDoctorId = this.selectedDoctorId();
    this.showQuickFill     = true;
  }

  previewSlotCount(): number {
    if (!this.quickFillStart || !this.quickFillEnd) return 0;
    const start = this.quickFillStart.getHours() * 60 + this.quickFillStart.getMinutes();
    const end   = this.quickFillEnd.getHours()   * 60 + this.quickFillEnd.getMinutes();
    const total = end - start;
    return total > 0 ? Math.floor(total / this.selectedDuration) : 0;
  }

  fillToday() {
    const today  = new Date();
    const cursor = new Date(today);
    cursor.setHours(this.quickFillStart.getHours(), this.quickFillStart.getMinutes(), 0, 0);
    const workEnd = new Date(today);
    workEnd.setHours(this.quickFillEnd.getHours(), this.quickFillEnd.getMinutes(), 0, 0);

    const toCreate: AvailabilitySlotDTO[] = [];
    while (cursor < workEnd) {
      const start = new Date(cursor);
      const end   = new Date(cursor);
      end.setMinutes(end.getMinutes() + this.selectedDuration);
      if (end > workEnd) break;
      toCreate.push({
        startTime:  start.toISOString(),
        endTime:    end.toISOString(),
        hospitalId: this.ctx.selectedHospital()?.id,
        ...(this.ctx.isScheduler() && this.quickFillDoctorId ? { doctorId: this.quickFillDoctorId } : {}),
      });
      cursor.setMinutes(cursor.getMinutes() + this.selectedDuration);
    }

    if (!toCreate.length) { this.showQuickFill = false; return; }

    this.saving.set(true);
    let done = 0;
    const next = (i: number) => {
      if (i >= toCreate.length) {
        this.saving.set(false);
        this.showQuickFill = false;
        this.load();
        this.msg.add({ severity: 'success', summary: `${done} slot${done !== 1 ? 's' : ''} created for today` });
        return;
      }
      this.svc.create(toCreate[i]).subscribe({
        next: () => done++, error: () => {}, complete: () => next(i + 1),
      });
    };
    next(0);
  }
}
