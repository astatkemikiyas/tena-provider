import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HospitalContextService } from '../../../../core/services/hospital-context.service';
import { HospitalService } from '../../services/hospital.service';
import { HospitalInfoDTO } from '../../../../shared/models';

@Component({
  selector: 'app-hospital-info',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="space-y-4 max-w-2xl">
      <div>
        <h2 class="text-lg font-semibold text-slate-800">Hospital Information</h2>
        <p class="text-sm text-slate-500">View and manage your hospital's details</p>
      </div>

      @if (loading()) {
        <div class="text-center py-12"><i class="pi pi-spin pi-spinner text-teal-600 text-2xl"></i></div>
      } @else if (info()) {
        <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          @if (editing()) {
            <div class="space-y-4">
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-slate-700">Hospital Name</label>
                <input pInputText [(ngModel)]="form.name" class="w-full" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-slate-700">Region</label>
                <input pInputText [(ngModel)]="form.region" class="w-full" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-slate-700">Woreda / City</label>
                <input pInputText [(ngModel)]="form.woredaCity" class="w-full" />
              </div>
              <div class="flex gap-2">
                <p-button label="Save" icon="pi pi-check" [loading]="saving()" (onClick)="save()" />
                <p-button label="Cancel" [text]="true" (onClick)="editing.set(false)" />
              </div>
            </div>
          } @else {
            <div class="grid grid-cols-2 gap-6">
              <div>
                <p class="text-xs text-slate-400 uppercase tracking-wider">Name</p>
                <p class="text-slate-800 font-medium mt-0.5">{{ info()!.name }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 uppercase tracking-wider">License Number</p>
                <p class="text-slate-800 font-medium mt-0.5">{{ info()!.licenseNumber }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 uppercase tracking-wider">Status</p>
                <span [class]="statusClass(info()!.status)">{{ info()!.status }}</span>
              </div>
              <div>
                <p class="text-xs text-slate-400 uppercase tracking-wider">Region</p>
                <p class="text-slate-800 mt-0.5">{{ info()!.region }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-400 uppercase tracking-wider">Woreda / City</p>
                <p class="text-slate-800 mt-0.5">{{ info()!.woredaCity || '—' }}</p>
              </div>
            </div>
            @if (ctx.isAdmin()) {
              <div class="pt-4 border-t border-slate-100">
                <p-button label="Edit" icon="pi pi-pencil" [text]="true" (onClick)="startEdit()" />
              </div>
            }
          }
        </div>
      }
    </div>
  `,
})
export class HospitalInfoComponent implements OnInit {
  private svc = inject(HospitalService);
  private msg = inject(MessageService);
  ctx = inject(HospitalContextService);

  info    = signal<HospitalInfoDTO | null>(null);
  loading = signal(true);
  editing = signal(false);
  saving  = signal(false);
  form: { name?: string; region?: string; woredaCity?: string } = {};

  ngOnInit() {
    const h = this.ctx.selectedHospital();
    if (!h) return;
    this.svc.getById(h.id).subscribe({
      next: d => this.info.set(d),
      complete: () => this.loading.set(false),
    });
  }

  startEdit() {
    const i = this.info()!;
    this.form = { name: i.name, region: i.region, woredaCity: i.woredaCity };
    this.editing.set(true);
  }

  save() {
    this.saving.set(true);
    this.svc.update(this.info()!.id, this.form).subscribe({
      next: updated => {
        this.info.set(updated);
        this.editing.set(false);
        this.msg.add({ severity: 'success', summary: 'Saved' });
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Error', detail: 'Failed to save changes' }),
      complete: () => this.saving.set(false),
    });
  }

  statusClass(status: string): string {
    const base = 'text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-0.5 ';
    if (status === 'APPROVED') return base + 'bg-teal-50 text-teal-700';
    if (status === 'PENDING')  return base + 'bg-amber-50 text-amber-700';
    return base + 'bg-rose-50 text-rose-700';
  }
}
