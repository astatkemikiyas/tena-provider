import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { HospitalContextService } from '../../../../core/services/hospital-context.service';
import { HospitalService } from '../../services/hospital.service';

@Component({
  selector: 'app-invite',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, ToastModule],
  providers: [MessageService],
  template: `
    <p-toast />
    <div class="space-y-4 max-w-xl">
      <div>
        <h2 class="text-lg font-semibold text-slate-800">Invite Doctors</h2>
        <p class="text-sm text-slate-500">Generate invite links for doctors to join your hospital</p>
      </div>

      <div class="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div class="space-y-2">
          <label class="text-sm font-medium text-slate-700">Email Addresses</label>
          <p class="text-xs text-slate-400">One email per line</p>
          <textarea [(ngModel)]="emailsText" rows="5"
                    placeholder="doctor1@example.com&#10;doctor2@example.com"
                    class="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"></textarea>
        </div>

        <p-button label="Generate Invite Links" icon="pi pi-send"
                  [loading]="loading()" (onClick)="send()" />

        @if (inviteLinks().length > 0) {
          <div class="space-y-2 border-t border-slate-100 pt-4">
            <p class="text-sm font-medium text-slate-700">Generated Links — share with doctors:</p>
            @for (link of inviteLinks(); track link) {
              <div class="flex items-center gap-2 bg-slate-50 rounded-lg p-3">
                <code class="text-xs text-slate-600 flex-1 truncate">{{ link }}</code>
                <button (click)="copy(link)"
                        class="text-teal-600 hover:text-teal-700 text-xs font-medium flex-shrink-0 flex items-center gap-1">
                  <i class="pi pi-copy"></i> Copy
                </button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class InviteComponent {
  private svc = inject(HospitalService);
  private msg = inject(MessageService);
  ctx = inject(HospitalContextService);

  emailsText  = '';
  loading     = signal(false);
  inviteLinks = signal<string[]>([]);

  send() {
    const emails = this.emailsText.split('\n').map(e => e.trim()).filter(Boolean);
    if (emails.length === 0) return;
    const h = this.ctx.selectedHospital();
    if (!h) return;

    this.loading.set(true);
    this.svc.invite(h.id, emails).subscribe({
      next: (res: any) => {
        this.inviteLinks.set(res.inviteLinks ?? []);
        this.msg.add({ severity: 'success', summary: `${res.sent} invitation(s) created` });
        this.emailsText = '';
      },
      error: () => this.msg.add({ severity: 'error', summary: 'Failed to create invitations' }),
      complete: () => this.loading.set(false),
    });
  }

  copy(link: string) {
    navigator.clipboard.writeText(link).then(() =>
      this.msg.add({ severity: 'info', summary: 'Link copied!' })
    );
  }
}
