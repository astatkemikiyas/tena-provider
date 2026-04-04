import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type Severity = 'success' | 'warn' | 'danger' | 'info' | 'secondary';

const STATUS_MAP: Record<string, Severity> = {
  APPROVED:    'success',
  COMPLETED:   'success',
  ATTENDED:    'success',
  SCHEDULED:   'info',
  IN_REVIEW:   'warn',
  PENDING:     'warn',
  CANCELLED:   'danger',
  LATE_CANCEL: 'danger',
  REJECTED:    'danger',
  SUSPENDED:   'danger',
  NO_SHOW:     'secondary',
};

const CLASSES: Record<Severity, string> = {
  success:   'bg-emerald-50 text-emerald-700 ring-emerald-200',
  info:      'bg-blue-50 text-blue-700 ring-blue-200',
  warn:      'bg-amber-50 text-amber-700 ring-amber-200',
  danger:    'bg-rose-50 text-rose-700 ring-rose-200',
  secondary: 'bg-slate-100 text-slate-600 ring-slate-200',
};

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span [class]="'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ' + classes()">
      {{ status() }}
    </span>
  `,
})
export class StatusBadgeComponent {
  status = input.required<string>();
  classes = computed(() => CLASSES[STATUS_MAP[this.status()] ?? 'secondary']);
}
