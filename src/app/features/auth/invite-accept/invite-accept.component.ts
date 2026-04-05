import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';
import { ProviderPublicService, ProviderHospitalService } from '../../../api';
import { InviteInfoDTO } from '../../../shared/models';

@Component({
  selector: 'app-invite-accept',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-6">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg mx-auto">
            <i class="pi pi-envelope text-white text-2xl"></i>
          </div>
        </div>

        @if (loading()) {
          <div class="text-center"><i class="pi pi-spin pi-spinner text-teal-600 text-3xl"></i></div>
        } @else if (errorMsg()) {
          <div class="bg-white rounded-2xl shadow-sm border border-rose-200 p-8 text-center">
            <i class="pi pi-times-circle text-rose-500 text-3xl mb-3"></i>
            <h2 class="text-xl font-bold text-slate-800">Invalid Invitation</h2>
            <p class="text-slate-500 text-sm mt-2">{{ errorMsg() }}</p>
            <a routerLink="/login" class="inline-block mt-4 text-teal-600 font-semibold">Go to Login →</a>
          </div>
        } @else if (invite()) {
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            @if (accepted()) {
              <div class="text-center">
                <i class="pi pi-check-circle text-teal-600 text-3xl mb-3"></i>
                <h2 class="text-xl font-bold text-slate-800">Invitation Accepted!</h2>
                <p class="text-slate-500 text-sm mt-2">
                  You've joined <strong>{{ invite()!.hospitalName }}</strong>.
                  Your membership is pending admin approval.
                </p>
                <a routerLink="/select-hospital" class="inline-block mt-4 text-teal-600 font-semibold">Go to Dashboard →</a>
              </div>
            } @else {
              <div class="text-center mb-6">
                <i class="pi pi-building text-teal-600 text-3xl mb-2"></i>
                <h2 class="text-xl font-bold text-slate-800">You've been invited!</h2>
                <p class="text-slate-600 mt-2">
                  <strong>{{ invite()!.hospitalName }}</strong> has invited you to join as a doctor.
                </p>
                <p class="text-xs text-slate-400 mt-1">Expires: {{ invite()!.expiresAt | date:'mediumDate' }}</p>
              </div>

              @if (auth.isAuthenticated()) {
                <p-button label="Accept Invitation" styleClass="w-full" icon="pi pi-check"
                          [loading]="accepting()" (onClick)="accept()" />
                @if (acceptError()) {
                  <p class="text-sm text-rose-600 text-center mt-2">{{ acceptError() }}</p>
                }
              } @else {
                <p class="text-slate-500 text-sm text-center mb-4">Log in or register to accept this invitation.</p>
                <div class="flex flex-col gap-3">
                  <a [routerLink]="['/login']" [queryParams]="{ invite: token() }"
                     class="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors">
                    <i class="pi pi-sign-in"></i> Login to Accept
                  </a>
                  <a [routerLink]="['/register/doctor']" [queryParams]="{ invite: token() }"
                     class="flex items-center justify-center gap-2 px-4 py-2.5 border border-teal-600 text-teal-600 rounded-lg font-medium hover:bg-teal-50 transition-colors">
                    <i class="pi pi-user-plus"></i> Register as Doctor
                  </a>
                </div>
              }
            }
          </div>
        }
      </div>
    </div>
  `,
})
export class InviteAcceptComponent implements OnInit {
  private route       = inject(ActivatedRoute);
  private publicApi   = inject(ProviderPublicService);
  private hospitalApi = inject(ProviderHospitalService);
  private router      = inject(Router);
  auth = inject(AuthService);

  token       = signal('');
  invite      = signal<InviteInfoDTO | null>(null);
  loading     = signal(true);
  errorMsg    = signal('');
  accepting   = signal(false);
  acceptError = signal('');
  accepted    = signal(false);

  ngOnInit() {
    const t = this.route.snapshot.paramMap.get('token') ?? '';
    this.token.set(t);
    this.publicApi.getInviteInfo(t).subscribe({
      next: inv => {
        this.loading.set(false);
        if (inv.status === 'EXPIRED')  { this.errorMsg.set('This invitation has expired.'); return; }
        if (inv.status === 'ACCEPTED') { this.errorMsg.set('This invitation has already been used.'); return; }
        this.invite.set(inv);
      },
      error: () => {
        this.errorMsg.set('Invitation not found or invalid.');
        this.loading.set(false);
      },
    });
  }

  accept() {
    this.accepting.set(true);
    this.hospitalApi.acceptInvite({ token: this.token() }).subscribe({
      next: () => this.accepted.set(true),
      error: err => {
        this.acceptError.set(err?.error?.message ?? 'Failed to accept invitation.');
        this.accepting.set(false);
      },
      complete: () => this.accepting.set(false),
    });
  }
}
