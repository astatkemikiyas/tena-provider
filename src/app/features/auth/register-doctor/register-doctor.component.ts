import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { SelectModule } from 'primeng/select';
import { ProviderPublicService } from '../../../api';
import { DoctorRegistrationRequest } from '../../../shared/models';

@Component({
  selector: 'app-register-doctor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule, SelectModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div class="w-full max-w-lg">
        <div class="text-center mb-6">
          <div class="w-12 h-12 rounded-xl bg-teal-600 flex items-center justify-center shadow mx-auto mb-3">
            <i class="pi pi-user text-white text-xl"></i>
          </div>
          <h1 class="text-2xl font-bold text-slate-800">Register as Doctor</h1>
          <p class="text-slate-500 text-sm mt-1">Submit your credentials for verification</p>
        </div>

        @if (success()) {
          <div class="bg-teal-50 border border-teal-200 rounded-2xl p-6 text-center">
            <i class="pi pi-check-circle text-teal-600 text-3xl mb-3"></i>
            <h3 class="font-semibold text-slate-800 text-lg">Registration Submitted!</h3>
            <p class="text-slate-500 text-sm mt-2">Your registration is pending government approval. Once verified, you can accept hospital invitations.</p>
            <a routerLink="/login" class="inline-block mt-4 text-teal-600 font-semibold hover:text-teal-700">Back to Login →</a>
          </div>
        } @else {
          <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <form class="space-y-4" (ngSubmit)="submit()">
              <div class="grid grid-cols-2 gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-slate-700">First Name</label>
                  <input pInputText [(ngModel)]="form.firstName" name="firstName" class="w-full" />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-slate-700">Last Name</label>
                  <input pInputText [(ngModel)]="form.lastName" name="lastName" class="w-full" />
                </div>
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-slate-700">Email</label>
                <input pInputText [(ngModel)]="form.email" name="email" type="email" class="w-full" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-slate-700">Medical License Number</label>
                <input pInputText [(ngModel)]="form.medicalLicenseNumber" name="medicalLicenseNumber" class="w-full" />
              </div>
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-slate-700">Specialization</label>
                <p-select [(ngModel)]="form.specialization" name="specialization"
                          [options]="specializations" placeholder="Select specialization"
                          styleClass="w-full" />
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
export class RegisterDoctorComponent {
  private api = inject(ProviderPublicService);

  form: Partial<DoctorRegistrationRequest> = {};
  confirmPassword = '';
  loading = signal(false);
  error   = signal('');
  success = signal(false);

  specializations = [
    'General Practice', 'Internal Medicine', 'Pediatrics', 'Surgery',
    'Obstetrics & Gynecology', 'Cardiology', 'Dermatology', 'Neurology',
    'Orthopedics', 'Psychiatry', 'Radiology', 'Anesthesiology',
    'Oncology', 'Ophthalmology', 'ENT',
  ];

  submit() {
    if (this.form.password !== this.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.api.registerDoctor(this.form as DoctorRegistrationRequest).subscribe({
      next: () => this.success.set(true),
      error: err => {
        this.error.set(err?.error?.message ?? 'Registration failed. Please try again.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
