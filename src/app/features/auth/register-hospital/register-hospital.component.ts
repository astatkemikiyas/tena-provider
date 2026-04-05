import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ProviderPublicService } from '../../../api';
import { HospitalRegistrationRequest } from '../../../shared/models';

@Component({
  selector: 'app-register-hospital',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div class="w-full max-w-lg">
        <div class="text-center mb-6">
          <div class="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center shadow mx-auto mb-3">
            <i class="pi pi-building text-white text-xl"></i>
          </div>
          <h1 class="text-2xl font-bold text-slate-800">Register Hospital</h1>
          <p class="text-slate-500 text-sm mt-1">Submit your hospital for government approval</p>
        </div>

        @if (success()) {
          <div class="bg-teal-50 border border-teal-200 rounded-2xl p-6 text-center">
            <i class="pi pi-check-circle text-teal-600 text-3xl mb-3"></i>
            <h3 class="font-semibold text-slate-800 text-lg">Registration Submitted!</h3>
            <p class="text-slate-500 text-sm mt-2">Your hospital registration is pending government approval. You will be notified when approved.</p>
            <a routerLink="/login" class="inline-block mt-4 text-teal-600 font-semibold hover:text-teal-700">Back to Login →</a>
          </div>
        } @else {
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <form class="space-y-4" (ngSubmit)="submit()">
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-slate-700">Admin First Name</label>
                  <input pInputText [(ngModel)]="form.adminFirstName" name="adminFirstName" class="w-full" />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-slate-700">Admin Last Name</label>
                  <input pInputText [(ngModel)]="form.adminLastName" name="adminLastName" class="w-full" />
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-slate-700">Admin Email</label>
                <input pInputText [(ngModel)]="form.adminEmail" name="adminEmail" type="email" class="w-full" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-slate-700">Hospital Name</label>
                <input pInputText [(ngModel)]="form.name" name="name" class="w-full" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-slate-700">License Number</label>
                <input pInputText [(ngModel)]="form.licenseNumber" name="licenseNumber" class="w-full" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-slate-700">Region</label>
                  <input pInputText [(ngModel)]="form.region" name="region" class="w-full" />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-slate-700">Woreda / City</label>
                  <input pInputText [(ngModel)]="form.woredaCity" name="woredaCity" class="w-full" />
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-slate-700">Password</label>
                <p-password [(ngModel)]="form.password" name="password"
                            styleClass="w-full" inputStyleClass="w-full"
                            [toggleMask]="true" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-slate-700">Confirm Password</label>
                <p-password [(ngModel)]="confirmPassword" name="confirmPassword"
                            styleClass="w-full" inputStyleClass="w-full"
                            [feedback]="false" [toggleMask]="true" />
              </div>

              @if (error()) {
                <div class="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                  <i class="pi pi-exclamation-circle text-rose-500 text-sm mt-0.5"></i>
                  <p class="text-sm text-rose-700">{{ error() }}</p>
                </div>
              }

              <p-button label="Submit Registration" styleClass="w-full" type="submit" [loading]="loading()" />
            </form>
          </div>
          <p class="text-center text-sm text-slate-500 mt-4">
            <a routerLink="/register" class="text-teal-600 hover:text-teal-700">← Back to registration options</a>
          </p>
        }
      </div>
    </div>
  `,
})
export class RegisterHospitalComponent {
  private api = inject(ProviderPublicService);

  form: Partial<HospitalRegistrationRequest> = {};
  confirmPassword = '';
  loading = signal(false);
  error   = signal('');
  success = signal(false);

  submit() {
    if (this.form.password !== this.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.api.registerHospital(this.form as HospitalRegistrationRequest).subscribe({
      next: () => this.success.set(true),
      error: err => {
        this.error.set(err?.error?.message ?? 'Registration failed. Please try again.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
