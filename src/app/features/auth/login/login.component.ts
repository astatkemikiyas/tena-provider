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

        <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <p class="text-slate-600 mb-6">You will be redirected to the secure identity provider to sign in or create an account.</p>
          <p-button label="Sign In with Provider" styleClass="w-full"
                    icon="pi pi-lock" (onClick)="submit()" />
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

  ngOnInit() {
    // Store invite token if present in query params so it survives login
    const invite = this.route.snapshot.queryParamMap.get('invite');
    if (invite) sessionStorage.setItem('pending_invite_token', invite);
  }

  submit() {
    this.auth.login();
  }
}
