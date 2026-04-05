import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ButtonModule, InputTextModule, PasswordModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-teal-50 via-white to-slate-100 flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <div class="text-center mb-8">
          <div class="inline-flex flex-col items-center gap-3 mb-2">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center shadow-lg">
              <i class="pi pi-heart text-white text-2xl"></i>
            </div>
            <span class="font-bold text-slate-800 text-xl tracking-tight">TenaDigital Provider</span>
          </div>
          <h1 class="text-2xl font-bold text-slate-800 mt-2">Welcome back</h1>
          <p class="text-slate-500 text-sm mt-1">Sign in to your provider account</p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <form class="space-y-5" (ngSubmit)="submit()">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700">Email</label>
              <input pInputText [(ngModel)]="email" name="email" type="email"
                     placeholder="Enter your email" class="w-full"
                     [disabled]="loading()" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-medium text-slate-700">Password</label>
              <p-password [(ngModel)]="password" name="password"
                          placeholder="Enter your password"
                          styleClass="w-full" inputStyleClass="w-full"
                          [feedback]="false" [toggleMask]="true"
                          [disabled]="loading()" />
            </div>

            @if (error()) {
              <div class="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 border border-rose-200">
                <i class="pi pi-exclamation-circle text-rose-500 text-sm mt-0.5 flex-shrink-0"></i>
                <p class="text-sm text-rose-700">{{ error() }}</p>
              </div>
            }

            <p-button label="Sign In" styleClass="w-full" type="submit"
                      icon="pi pi-sign-in" [loading]="loading()" />
          </form>
        </div>

        <p class="text-center text-sm text-slate-500 mt-6">
          Don't have an account?
          <a routerLink="/register" class="text-teal-600 font-semibold hover:text-teal-700 ml-1">Register here</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  private auth   = inject(AuthService);
  private route  = inject(ActivatedRoute);
  private router = inject(Router);

  email    = '';
  password = '';
  loading  = signal(false);
  error    = signal('');

  ngOnInit() {
    // Store invite token if present in query params so it survives login
    const invite = this.route.snapshot.queryParamMap.get('invite');
    if (invite) sessionStorage.setItem('pending_invite_token', invite);
  }

  submit() {
    if (!this.email || !this.password) {
      this.error.set('Please enter your email and password.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    console.debug('[Login] attempting:', this.email.trim(), '| pwd length:', this.password?.length ?? 0);
    this.auth.login(this.email.trim(), this.password).subscribe({
      next: () => {
        const pendingInvite = sessionStorage.getItem('pending_invite_token');
        if (pendingInvite) {
          sessionStorage.removeItem('pending_invite_token');
          this.router.navigate(['/invite/accept', pendingInvite]);
        } else {
          const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/select-hospital';
          this.router.navigateByUrl(returnUrl);
        }
      },
      error: (err) => {
        const msg = err?.error?.error_description ?? err?.error?.message;
        this.error.set(msg || 'Invalid credentials. Please try again.');
        this.loading.set(false);
      },
      complete: () => this.loading.set(false),
    });
  }
}
